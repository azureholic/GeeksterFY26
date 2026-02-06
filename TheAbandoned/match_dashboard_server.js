import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { parse } from "csv-parse/sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(
  REPO_ROOT,
  "edition_1_valentines",
  "data",
  "cupid_matchmaking",
  "data",
  "dataset_cupid_matchmaking.csv"
);

const TRAIT_COLS = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

// Dealbreaker tokens we can operationalize with existing fields
const DB_RULES = {
  different_timezone: (self, other) => self.location_region === other.location_region,
  age_gap: (self, other) => Math.abs(self.age - other.age) <= 10,
};

// Anchor lat/lon for regions (approximate city centroids)
const REGION_COORDS = {
  "West US": { lat: 47.23, lon: -119.85 }, // Quincy, WA
  "East US": { lat: 36.68, lon: -78.38 }, // Boydton, VA
  "North Europe": { lat: 53.35, lon: -6.26 }, // Dublin
  "West Europe": { lat: 52.37, lon: 4.9 }, // Amsterdam
  "EU West": { lat: 52.37, lon: 4.9 }, // alias
  "UK South": { lat: 51.51, lon: -0.13 }, // London
  "Canada Central": { lat: 43.65, lon: -79.38 }, // Toronto
  "Brazil South": { lat: -23.55, lon: -46.63 }, // Sao Paulo
  "Japan East": { lat: 35.68, lon: 139.65 }, // Tokyo
  "Australia East": { lat: -33.87, lon: 151.21 }, // Sydney
};

function splitAndStrip(value) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function loadData() {
  const csvText = fs.readFileSync(DATA_PATH, "utf8");
  const records = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  return records.map((row) => ({
    user_id: row.user_id,
    age: Number(row.age),
    location_region: row.location_region,
    interests_list: splitAndStrip(row.interests || ""),
    openness: Number(row.openness),
    conscientiousness: Number(row.conscientiousness),
    extraversion: Number(row.extraversion),
    agreeableness: Number(row.agreeableness),
    neuroticism: Number(row.neuroticism),
    matches_attempted: Number(row.matches_attempted),
    matches_success: Number(row.matches_success),
    sentiment_score: Number(row.sentiment_score),
    pref_age_min: Number(row.pref_age_min),
    pref_age_max: Number(row.pref_age_max),
    dealbreakers_list:
      !row.dealbreakers || row.dealbreakers === "no_dealbreakers"
        ? []
        : splitAndStrip(row.dealbreakers),
  }));
}

function jaccard(left, right) {
  const l = new Set(left);
  const r = new Set(right);
  if (!l.size && !r.size) return 0;
  const intersection = [...l].filter((x) => r.has(x)).length;
  const union = new Set([...l, ...r]).size;
  return intersection / union;
}

function haversineKm(a, b) {
  const R = 6371; // Earth radius km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function personalitySimilarity(a, b) {
  const diff = TRAIT_COLS.map((k) => a[k] - b[k]);
  const dist = Math.sqrt(diff.reduce((sum, v) => sum + v * v, 0));
  return Math.max(0, 1 - dist / Math.sqrt(TRAIT_COLS.length));
}

function sentimentAlignment(a, b) {
  return Math.max(0, 1 - Math.abs(a - b) / 2);
}

function regionBonus(a, b) {
  if (a === b) return 1;
  const ca = REGION_COORDS[a];
  const cb = REGION_COORDS[b];
  if (ca && cb) {
    const d = haversineKm(ca, cb);
    if (d <= 800) return 0.9; // neighboring regions
    if (d <= 2000) return 0.75; // same continent-ish
    if (d <= 5000) return 0.5; // moderate distance
    return 0.2; // far
  }
  return 0.5; // fallback when coords missing
}

function ageCompatible(a, b) {
  const aToB = b.age >= a.pref_age_min && b.age <= a.pref_age_max;
  const bToA = a.age >= b.pref_age_min && a.age <= b.pref_age_max;
  return aToB && bToA;
}

function respectsDealbreakers(a, b) {
  // Only apply rules we can evaluate with available fields.
  const checkList = (self, other) =>
    (self.dealbreakers_list || []).every((token) => {
      const rule = DB_RULES[token];
      return rule ? rule(self, other) : true;
    });

  return checkList(a, b) && checkList(b, a);
}

function scorePair(a, b) {
  const interests_score = jaccard(a.interests_list, b.interests_list);
  const personality_score = personalitySimilarity(a, b);
  const sentiment_score = sentimentAlignment(a.sentiment_score, b.sentiment_score);
  const location_score = regionBonus(a.location_region, b.location_region);
  const combined =
    0.35 * interests_score +
    0.3 * personality_score +
    0.15 * sentiment_score +
    0.2 * location_score; // Slightly higher weight for location

  return {
    match_for: a.user_id,
    candidate: b.user_id,
    score: Number(combined.toFixed(3)),
    interests_score: Number(interests_score.toFixed(3)),
    personality_score: Number(personality_score.toFixed(3)),
    sentiment_score: Number(sentiment_score.toFixed(3)),
    location_score: Number(location_score.toFixed(3)),
    age: b.age,
    region: b.location_region,
    interests: b.interests_list.join(", "),
  };
}

function buildMatches(data, { enforceAge, regions, minScore }) {
  const filtered = regions && regions.size ? data.filter((u) => regions.has(u.location_region)) : data;
  const scores = [];
  for (const a of filtered) {
    for (const b of filtered) {
      if (a.user_id === b.user_id) continue;
      if (enforceAge && !ageCompatible(a, b)) continue;
      if (!respectsDealbreakers(a, b)) continue;
      const pair = scorePair(a, b);
      if (pair.score >= minScore) scores.push({ ...pair, match_for_region: a.location_region });
    }
  }
  return scores.sort((x, y) => (x.match_for === y.match_for ? y.score - x.score : x.match_for.localeCompare(y.match_for)));
}

const data = loadData();
const userIds = data.map((u) => u.user_id).sort();
const regions = [...new Set(data.map((u) => u.location_region))].sort();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const AZURE_OAI_ENDPOINT = process.env.AZURE_OAI_ENDPOINT; // e.g., https://application3-ai.cognitiveservices.azure.com
const AZURE_OAI_DEPLOYMENT = process.env.AZURE_OAI_DEPLOYMENT || "gpt-4";
const AZURE_OAI_API_KEY = process.env.AZURE_OAI_API_KEY;

app.get("/api/users", (_req, res) => {
  res.json({ users: userIds, regions });
});

app.get("/api/matches", (req, res) => {
  const user = req.query.user || userIds[0];
  const minScore = 0.4;
  const enforceAge = true;
  const topK = 10;
  const regionSet = new Set();

  const userProfile = data.find((u) => u.user_id === user);
  if (!userProfile) {
    return res.status(404).json({ error: "User not found" });
  }

  const matches = buildMatches(data, { enforceAge, regions: regionSet, minScore }).filter(
    (m) => m.match_for === user
  );

  res.json({
    user,
    userProfile: {
      user_id: userProfile.user_id,
      age: userProfile.age,
      region: userProfile.location_region,
      interests: userProfile.interests_list,
      sentiment_score: userProfile.sentiment_score,
      openness: userProfile.openness,
      conscientiousness: userProfile.conscientiousness,
      extraversion: userProfile.extraversion,
      agreeableness: userProfile.agreeableness,
      neuroticism: userProfile.neuroticism,
      pref_age_min: userProfile.pref_age_min,
      pref_age_max: userProfile.pref_age_max,
      dealbreakers: userProfile.dealbreakers_list,
    },
    total: matches.length,
    matches: matches.slice(0, topK),
  });
});

app.get("/api/top-per-user", (req, res) => {
  const minScore = 0.4;
  const enforceAge = true;
  const regionSet = new Set();

  const allMatches = buildMatches(data, { enforceAge, regions: regionSet, minScore });
  const best = new Map();
  for (const m of allMatches) {
    const prev = best.get(m.match_for);
    if (!prev || m.score > prev.score) {
      best.set(m.match_for, m);
    }
  }

  const rows = userIds
    .map((uid) => best.get(uid))
    .filter(Boolean)
    .sort((a, b) => a.match_for.localeCompare(b.match_for));

  res.json({ total: rows.length, rows });
});

app.post("/api/chat", async (req, res) => {
  if (!AZURE_OAI_ENDPOINT || !AZURE_OAI_API_KEY) {
    return res.status(500).json({ error: "Azure OpenAI config missing. Set AZURE_OAI_ENDPOINT, AZURE_OAI_API_KEY, AZURE_OAI_DEPLOYMENT." });
  }

  const user = req.body?.user || userIds[0];
  const question = (req.body?.question || "").toString().trim();
  if (!question) return res.status(400).json({ error: "Question required" });

  const minScore = 0.4;
  const enforceAge = true;
  const regionSet = new Set();
  const userProfile = data.find((u) => u.user_id === user);
  if (!userProfile) return res.status(404).json({ error: "User not found" });

  const matches = buildMatches(data, { enforceAge, regions: regionSet, minScore })
    .filter((m) => m.match_for === user)
    .slice(0, 10);

  const systemPrompt = `You are a concise, friendly assistant for matchmaking results. Give clear, plain-language answers in 2-4 short sentences or bullets. Highlight the best candidates and the why in simple terms. Avoid over-precision; approximate is fine. Use only the provided data; if unsure, say you don't know.`;
  const contextLines = matches.map(
    (m, i) =>
      `${i + 1}. candidate=${m.candidate}, score=${m.score}, region=${m.region}, age=${m.age}, interests_score=${m.interests_score}, personality_score=${m.personality_score}, sentiment_score=${m.sentiment_score}, location_score=${m.location_score}`
  );
  const userContext = `User ${user} (age ${userProfile.age}, region ${userProfile.location_region})`; 

  try {
    const resp = await fetch(
      `${AZURE_OAI_ENDPOINT}/openai/deployments/${AZURE_OAI_DEPLOYMENT}/chat/completions?api-version=2024-05-01-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AZURE_OAI_API_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `User: ${userContext}\nTop matches:\n${contextLines.join("\n")}\n\nQuestion: ${question}` },
          ],
          temperature: 0.5,
          max_tokens: 350,
        }),
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ error: `Azure OpenAI error: ${resp.status} ${text}` });
    }

    const json = await resp.json();
    const answer = json.choices?.[0]?.message?.content || "No answer";
    res.json({ answer, matches });
  } catch (err) {
    res.status(500).json({ error: err.message || "Chat call failed" });
  }
});

app.post("/api/chat-top", async (req, res) => {
  if (!AZURE_OAI_ENDPOINT || !AZURE_OAI_API_KEY) {
    return res.status(500).json({ error: "Azure OpenAI config missing. Set AZURE_OAI_ENDPOINT, AZURE_OAI_API_KEY, AZURE_OAI_DEPLOYMENT." });
  }

  const question = (req.body?.question || "").toString().trim();
  if (!question) return res.status(400).json({ error: "Question required" });

  const minScore = 0.4;
  const enforceAge = true;
  const regionSet = new Set();

  const allMatches = buildMatches(data, { enforceAge, regions: regionSet, minScore });
  const bestMap = new Map();
  for (const m of allMatches) {
    const prev = bestMap.get(m.match_for);
    if (!prev || m.score > prev.score) bestMap.set(m.match_for, m);
  }
  const rows = Array.from(bestMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  const systemPrompt = `You are a concise, friendly assistant for matchmaking results. Give clear, plain-language answers in 2-4 short sentences or bullets. Summarize insights across many users. Avoid over-precision; approximate is fine. Use only the provided data; if unsure, say you don't know.`;
  const contextLines = rows.map(
    (m, i) =>
      `${i + 1}. user=${m.match_for} (region ${m.match_for_region || "?"}) -> candidate=${m.candidate}, score=${m.score}, region=${m.region}, age=${m.age}`
  );

  try {
    const resp = await fetch(
      `${AZURE_OAI_ENDPOINT}/openai/deployments/${AZURE_OAI_DEPLOYMENT}/chat/completions?api-version=2024-05-01-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AZURE_OAI_API_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Top matches snapshot (best per user):\n${contextLines.join("\n")}\n\nQuestion: ${question}` },
          ],
          temperature: 0.5,
          max_tokens: 350,
        }),
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ error: `Azure OpenAI error: ${resp.status} ${text}` });
    }

    const json = await resp.json();
    const answer = json.choices?.[0]?.message?.content || "No answer";
    res.json({ answer, rows });
  } catch (err) {
    res.status(500).json({ error: err.message || "Chat call failed" });
  }
});

app.get("/", (_req, res) => {
  res.type("html").send(renderPage());
});

app.listen(PORT, () => {
  console.log(`Cupid dashboard running at http://localhost:${PORT}`);
});

function renderPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cupid Matchmaking Dashboard</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: #0b1224;
      --card: #111a30;
      --muted: #cbd5e1;
      --text: #e2e8f0;
      --accent: #7c3aed;
      --accent-2: #22d3ee;
      --border: #1f2a44;
      --shadow: 0 10px 30px rgba(0,0,0,0.35);
      --radius: 10px;
    }
    * { box-sizing: border-box; }
    body { font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif; margin: 0; padding: 1.5rem 2rem; background: radial-gradient(circle at 20% 20%, rgba(124,58,237,0.18), transparent 35%), radial-gradient(circle at 80% 0%, rgba(34,211,238,0.18), transparent 30%), var(--bg); color: var(--text); }
    header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
    h1 { margin: 0; font-weight: 800; letter-spacing: 0.5px; }
    p { color: var(--muted); }
    label { display: flex; flex-direction: column; font-size: 0.9rem; gap: 0.35rem; color: var(--muted); }
    input, select { padding: 0.55rem 0.65rem; border-radius: 8px; border: 1px solid var(--border); background: #0d162c; color: var(--text); }
    .card { background: var(--card); border: 1px solid var(--border); padding: 0.9rem 1rem; border-radius: var(--radius); margin-top: 0.75rem; box-shadow: var(--shadow); }
    .layout { display:flex; gap:1rem; align-items:flex-start; }
    .sidebar { width: 220px; min-width: 200px; display:flex; flex-direction:column; gap:0.5rem; }
    .nav-bar { display:flex; flex-direction:column; gap:0.5rem; }
    .nav-bar button { padding:0.65rem 0.85rem; border:1px solid var(--border); background: #0d162c; color: var(--text); border-radius:8px; cursor:pointer; box-shadow: var(--shadow); text-align:left; }
    .nav-bar button.active { background: var(--accent); border-color: var(--accent); font-weight:700; color: #fff; }
    .nav-bar button:hover { border-color: var(--accent-2); }
    .main { flex:1; min-width:0; }
    .section { margin-top:0.75rem; }
    .hidden { display:none; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; background: #0d162c; border:1px solid var(--border); border-radius: var(--radius); overflow:hidden; box-shadow: var(--shadow); }
    th, td { padding: 0.6rem 0.7rem; border-bottom: 1px solid var(--border); text-align: left; color: var(--text); }
    th { background: rgba(124,58,237,0.18); font-weight: 700; }
    tr:hover td { background: rgba(255,255,255,0.03); }
    button { color: var(--text); background: #0d162c; border:1px solid var(--border); border-radius:8px; padding:0.55rem 0.9rem; cursor:pointer; box-shadow: var(--shadow); }
    button:hover { border-color: var(--accent-2); }
    textarea { width: 100%; min-height: 90px; padding: 0.65rem; border-radius: 8px; border: 1px solid var(--border); background: #0d162c; color: var(--text); resize: vertical; }
    .chat-row { display:flex; gap:0.5rem; flex-wrap:wrap; align-items:flex-start; }
    .chat-row button { white-space: nowrap; }
    .match-wrap { display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-start; }
    .match-left { flex: 2; min-width: 380px; }
    .match-chat { flex: 1; min-width: 320px; background: linear-gradient(135deg, rgba(124,58,237,0.8), rgba(34,211,238,0.7)); border: none; color: #0b1224; box-shadow: 0 15px 40px rgba(0,0,0,0.35); }
    .match-chat strong, .match-chat p, .match-chat div, .match-chat button { color: #0b1224; }
    .match-chat textarea { background: rgba(255,255,255,0.1); color: #0b1224; border: 1px solid rgba(255,255,255,0.2); }
    .match-chat .pill { display:inline-block; padding: 0.35rem 0.65rem; border-radius: 999px; background: rgba(255,255,255,0.18); color:#0b1224; margin-right:0.35rem; margin-bottom:0.35rem; font-weight:600; border:1px solid rgba(255,255,255,0.25); cursor:pointer; }
    .match-chat .pill:hover { background: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>💘 Cupid Matchmaking</h1>
      <p>Potential matches per user with adjustable filters.</p>
    </div>
  </header>

  <div class="card" id="explanation">
    <strong>How we rank matches</strong>
    <p>We look for overlap in interests, closeness in personality, similar sentiment, and how near the regions are (by approximate city anchors). Age fit can be required both ways. Dealbreakers remove pairs that violate the specific rules we can evaluate.</p>
    <ul>
      <li>Interests: more shared interests raises the score; no overlap lowers it.</li>
      <li>Personality: we compare five traits (O-C-E-A-N); closer profiles score higher.</li>
      <li>Sentiment: similar sentiment scores add alignment; big gaps reduce it.</li>
      <li>Region/proximity: same region scores highest; nearby regions get a smaller boost; far regions get little. Distances are great-circle between anchor cities (e.g., London, Dublin, Amsterdam, Tokyo, Sydney).</li>
      <li>Age fit: when enabled, both people must be inside each other’s preferred age range.</li>
      <li>Dealbreakers: enforced where data allows (e.g., “different_timezone” blocks cross-region, “age_gap” blocks >10-year gaps). Applied before scoring.</li>
    </ul>
    <p>Weights: 35% interests, 30% personality, 15% sentiment, 20% region/proximity. Use the sidebar to change minimum score, age rule, and region filtering.</p>
  </div>

  <div class="layout">
    <div class="sidebar">
      <div class="nav-bar">
        <button id="navMatches" class="active" data-target="matchSection">Matches for selected user</button>
        <button id="navTop" data-target="topSection">Top match per user</button>
      </div>
    </div>

    <div class="main">
      <div id="matchSection" class="section">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <div style="min-width:200px;">
            <label>User
              <select id="user"></select>
            </label>
          </div>
          <button id="refresh">Refresh</button>
        </div>
        <div class="match-wrap">
          <div class="match-left">
            <div id="summary"></div>
            <div id="userProfile" class="card"></div>
            <table id="table">
              <thead>
                <tr>
                  <th>Candidate</th><th>Score</th><th>Interests</th><th>Personality</th><th>Sentiment</th><th>Location</th><th>Age</th><th>Region</th><th>Interests</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
          <div class="card match-chat" id="chatCard">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <div style="font-size:1.2rem;">🤖</div>
              <div>
                <strong>Cupid Copilot</strong>
                <div style="color:#0b1224;opacity:0.8;">Ask about this user's matches</div>
              </div>
            </div>
            <div style="margin-top:0.6rem;">
              <span class="pill" data-prompt="Which candidate is the best fit and why?">Best fit</span>
              <span class="pill" data-prompt="Explain the top 3 matches in simple terms">Top 3 summary</span>
              <span class="pill" data-prompt="Any red flags or dealbreakers I should know?">Red flags</span>
            </div>
            <div class="chat-row" style="margin-top:0.5rem;">
              <textarea id="chatQuestion" placeholder="Ask a question about this user's matches...">Which candidate is the best fit and why?</textarea>
              <button id="chatSend">Ask</button>
            </div>
            <div id="chatAnswer" style="margin-top:0.5rem; color: #0b1224; font-weight:600;"></div>
          </div>
        </div>
      </div>

      <div id="topSection" class="section hidden">
        <div class="card" id="topOverview">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            <strong>Top match per user</strong>
            <button id="refreshTop">Refresh overview</button>
          </div>
          <div id="topSummary" style="margin-top:0.25rem;"></div>
          <div class="match-wrap">
            <div class="match-left">
              <table style="width:100%;border-collapse:collapse;margin-top:0.5rem;">
                <thead>
                  <tr>
                    <th>User</th><th>User Region</th><th>Top Candidate</th><th>Score</th><th>Interests</th><th>Personality</th><th>Sentiment</th><th>Location</th><th>Age</th><th>Region</th>
                  </tr>
                </thead>
                <tbody id="topTable"></tbody>
              </table>
            </div>
            <div class="card match-chat" id="chatTopCard">
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <div style="font-size:1.2rem;">🤖</div>
                <div>
                  <strong>Cupid Copilot</strong>
                  <div style="color:#0b1224;opacity:0.8;">Ask about top matches</div>
                </div>
              </div>
              <div style="margin-top:0.6rem;">
                <span class="pill" data-prompt-top="Which users have the strongest matches?">Strongest</span>
                <span class="pill" data-prompt-top="Any regions standing out for good matches?">Regions</span>
                <span class="pill" data-prompt-top="Summarize the top 5 pairings in simple terms.">Top 5 summary</span>
              </div>
              <div class="chat-row" style="margin-top:0.5rem;">
                <textarea id="chatTopQuestion" placeholder="Ask about the top matches across users">Which users have the strongest matches?</textarea>
                <button id="chatTopSend">Ask</button>
              </div>
              <div id="chatTopAnswer" style="margin-top:0.5rem; color: #0b1224; font-weight:600;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

<script>
async function loadUsers() {
  const res = await fetch('/api/users');
  const { users } = await res.json();
  const sel = document.getElementById('user');
  sel.innerHTML = users.map((u) => '<option value="' + u + '">' + u + '</option>').join('');
}

async function loadMatches() {
  const user = document.getElementById('user').value;
  const params = new URLSearchParams({ user });
  const res = await fetch('/api/matches?' + params.toString());
  const data = await res.json();
  renderTable(data);
}

function renderTable({ user, userProfile, matches, total }) {
  document.getElementById('summary').textContent =
    'Showing ' + matches.length + ' of ' + total + ' matches for ' + user + '.';
  renderUserProfile(userProfile);
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = matches
    .map(
      (m) =>
        '<tr>' +
        '<td>' + m.candidate + '</td>' +
        '<td>' + m.score + '</td>' +
        '<td>' + m.interests_score + '</td>' +
        '<td>' + m.personality_score + '</td>' +
        '<td>' + m.sentiment_score + '</td>' +
        '<td>' + m.location_score + '</td>' +
        '<td>' + m.age + '</td>' +
        '<td>' + m.region + '</td>' +
        '<td>' + m.interests + '</td>' +
        '</tr>'
    )
    .join('');
}

function renderUserProfile(profile) {
  if (!profile) return;
  const wrap = document.getElementById('userProfile');
  wrap.innerHTML =
    '<strong>User profile</strong><br/>' +
    'Age: ' + profile.age + ' | Region: ' + profile.region + '<br/>' +
    'Interests: ' + (profile.interests.join(', ') || 'N/A') + '<br/>' +
    'Traits (OCEA-N): ' +
    profile.openness + ', ' +
    profile.conscientiousness + ', ' +
    profile.extraversion + ', ' +
    profile.agreeableness + ', ' +
    profile.neuroticism + '<br/>' +
    'Sentiment: ' + profile.sentiment_score + '<br/>' +
    'Pref age: ' + profile.pref_age_min + ' - ' + profile.pref_age_max + '<br/>' +
    'Dealbreakers: ' + (profile.dealbreakers.length ? profile.dealbreakers.join(', ') : 'None');
}

async function loadTopOverview() {
  const res = await fetch('/api/top-per-user');
  const data = await res.json();
  renderTopOverview(data);
}

function renderTopOverview({ total, rows }) {
  const summary = document.getElementById('topSummary');
  summary.textContent = 'Top matches found for ' + total + ' users (after filters).';
  const tbody = document.getElementById('topTable');
  tbody.innerHTML = rows
    .map(
      (m) =>
        '<tr>' +
        '<td>' + m.match_for + '</td>' +
        '<td>' + (m.match_for_region || '') + '</td>' +
        '<td>' + m.candidate + '</td>' +
        '<td>' + m.score + '</td>' +
        '<td>' + m.interests_score + '</td>' +
        '<td>' + m.personality_score + '</td>' +
        '<td>' + m.sentiment_score + '</td>' +
        '<td>' + m.location_score + '</td>' +
        '<td>' + m.age + '</td>' +
        '<td>' + m.region + '</td>' +
        '</tr>'
    )
    .join('');
}

async function init() {
  await loadUsers();
  await loadMatches();
  await loadTopOverview();
}

init();
document.getElementById('refresh').addEventListener('click', loadMatches);
document.getElementById('user').addEventListener('change', loadMatches);
document.getElementById('refreshTop').addEventListener('click', loadTopOverview);
document.getElementById('chatSend').addEventListener('click', sendChat);
document.querySelectorAll('.pill').forEach((p) => {
  p.addEventListener('click', () => {
    const prompt = p.getAttribute('data-prompt');
    if (prompt) {
      document.getElementById('chatQuestion').value = prompt;
    }
  });
});
document.getElementById('chatTopSend').addEventListener('click', sendChatTop);
document.querySelectorAll('[data-prompt-top]').forEach((p) => {
  p.addEventListener('click', () => {
    const prompt = p.getAttribute('data-prompt-top');
    if (prompt) {
      document.getElementById('chatTopQuestion').value = prompt;
    }
  });
});

async function sendChat() {
  const user = document.getElementById('user').value;
  const question = document.getElementById('chatQuestion').value.trim();
  const answerBox = document.getElementById('chatAnswer');
  if (!question) {
    answerBox.textContent = 'Please enter a question.';
    return;
  }
  answerBox.textContent = 'Thinking...';
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, question }),
    });
    const data = await res.json();
    if (!res.ok) {
      answerBox.textContent = data.error || 'Chat failed.';
      return;
    }
    answerBox.textContent = data.answer;
  } catch (err) {
    answerBox.textContent = 'Error: ' + (err.message || 'Chat failed');
  }
}

async function sendChatTop() {
  const question = document.getElementById('chatTopQuestion').value.trim();
  const answerBox = document.getElementById('chatTopAnswer');
  if (!question) {
    answerBox.textContent = 'Please enter a question.';
    return;
  }
  answerBox.textContent = 'Thinking...';
  try {
    const res = await fetch('/api/chat-top', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok) {
      answerBox.textContent = data.error || 'Chat failed.';
      return;
    }
    answerBox.textContent = data.answer;
  } catch (err) {
    answerBox.textContent = 'Error: ' + (err.message || 'Chat failed');
  }
}

function setSection(targetId) {
  const sections = ["matchSection", "topSection"];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === targetId) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  const buttons = ["navMatches", "navTop"];
  buttons.forEach((btnId) => {
    const b = document.getElementById(btnId);
    if (!b) return;
    const target = b.getAttribute('data-target');
    if (target === targetId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  const userControl = document.getElementById('userControl');
  if (userControl) {
    if (targetId === 'matchSection') {
      userControl.style.display = '';
    } else {
      userControl.style.display = 'none';
    }
  }

  if (targetId === 'topSection') {
    loadTopOverview();
  }
}

document.getElementById('navMatches').addEventListener('click', () => setSection('matchSection'));
document.getElementById('navTop').addEventListener('click', () => setSection('topSection'));
</script>
</body>
</html>`;
}
