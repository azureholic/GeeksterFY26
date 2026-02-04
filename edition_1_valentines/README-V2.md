# Valentine's Day Edition 💝

<p align="center">
  <img src="../img/heart2.png" alt="Cupid Chocolate" width="25%">
</p>

Welcome to the Valentine's Day Special Edition of Geekster! This edition celebrates love, data, and chocolate in the most delightful way possible. 

Join us on a sweet journey through the world of Cupid Chocolate Company as we explore customer behavior, sales patterns, and the magic that happens when data meets romance. Whether you're here to learn, compete, or simply indulge in some data-driven storytelling, we hope this edition fills your heart with joy and your mind with insights.

<p align="left">
  <img src="../img/heart1.png" alt="Love Data" width="25%">
</p>

---

# 🎉 Hackathon Guidelines

## 🎯 Theme

> **"Help Cupid Provide Great Experiences for Valentine's Day"**

Your mission: Build a solution powered by **Microsoft technologies** that helps Cupid deliver unforgettable Valentine's Day experiences. Think romance, chocolates, matchmaking, gifts, or anything that makes hearts flutter! 💘

---

## 📅 Event Details

| | |
|---|---|
| **Date** | February 6th, 2026 |
| **Duration** | 5 hours |
| **Team Size** | 4-5 people per team |
| **Team Formation** | Teams will be formed on the day |
| **Resources** | Use your own subscriptions (Azure, M365, Power Platform, etc.) |

---

## 📋 Agenda

| Time | Activity |
|------|----------|
| 0:00 | Kickoff & Team Formation |
| 0:30 | Hacking Begins! 🚀 |
| 4:30 | Code Freeze & Prep Presentations |
| 5:00 | Team Presentations (5-7 min each + 3-4 min Q&A) |
| End | Judging & Awards 🏆 |

---

## 🎁 What to Deliver

Each team must deliver:

### 1. Working Proof-of-Concept (PoC)
- A functional demo that showcases your solution
- Built using Microsoft technologies (cloud, local, or hybrid)
- Focus on demonstrating core functionality over polish

### 2. Presentation / Pitch
- **Duration**: 5-7 minutes per team
- **Q&A**: 3-4 minutes for questions from the jury
- **Format Options** (choose what works best for your team):
  - 📊 PowerPoint / Slides
  - 🎬 Live Demo
  - 🎥 Recorded Video
  - 🎨 Mix of the above

**Submission**: Your team decides the format and how to share your work with the judges.

---

## 🤖 Microsoft AI Solutions

This hackathon is about learning, architecting, and designing solutions using **Microsoft technologies** with a focus on **AI & GenAI capabilities across the Microsoft stack**.

### 💡 You Are Encouraged To Use:

| Category | Technologies |
|----------|-------------|
| **AI & GenAI** | Azure OpenAI, Azure AI Foundry, M365 Copilot, Copilot Studio, Agent Framework |
| **Data & Analytics** | Microsoft Fabric, Power BI, Azure AI Search, Cosmos DB |
| **Low-Code / No-Code** | Power Platform (Power Apps, Power Automate, Power Pages) |
| **Development** | Azure Functions, Logic Apps, GitHub Copilot, VS Code |
| **Infrastructure** | Any Azure services that fit your solution |

### 🎯 Best Practices
- Apply **Azure Well-Architected Framework (WAF)** principles where applicable
- Think about scalability, security, and user experience
- Be creative with AI integrations!

### 🛠️ No Required Technologies
There are no mandatory services — pick what fits your solution best!

---

## 💡 Project Ideas to Inspire You

Need a spark? Here are some ideas to get your creative juices flowing:

| Idea | Description | Tech Stack Examples | Potential Datasets |
|------|-------------|---------------------|--------------------|
| **💝 AI Love Letter Generator** | Generate personalized, romantic messages based on recipient preferences | Azure OpenAI, Copilot Studio | Gift Recommender, Matchmaking |
| **🍫 Smart Chocolate Recommender** | GenAI-powered recommendation engine for the perfect chocolate gift | Azure AI Foundry, Power Apps | Cupid Chocolate Global, Gift Recommender |
| **💑 Compatibility Copilot** | AI assistant that analyzes personality traits and predicts match success | Copilot Studio, Agent Framework | Matchmaking, Behavior Graph |
| **📊 Valentine's Sales Dashboard** | Interactive dashboard with AI-generated insights and predictions | Power BI, Microsoft Fabric | Cupid Chocolate Global |
| **🛡️ Cupid's Security Guardian** | Fraud detection system using AI to protect Valentine's transactions | Azure AI, Logic Apps | Broken Hearts Security |
| **🌍 Global Love Tracker** | Real-time visualization of message delivery performance across regions | Power BI, Azure Maps | Love Notes Telemetry, Global Routing |
| **🎁 Gift Concierge Bot** | Conversational AI bot that helps users find the perfect Valentine's gift | Copilot Studio, Power Virtual Agents | Gift Recommender, Supply Chain |
| **📦 Supply Chain Optimizer** | Predict delays and optimize chocolate delivery routes | Power Automate, Azure Functions | Supply Chain, Cupid Chocolate Global |
| **💬 Love Notes Moderator** | AI content moderation to keep Valentine's messages safe and sweet | Azure AI Content Safety, Logic Apps | Trust & Safety |
| **🤖 Cupid's Meeting Assistant** | AI assistant for scheduling romantic dates across timezones | M365 Copilot, Power Automate | Modern Work Dynamics |
| **💌 Valentine's Order App** | Low-code app for customers to place chocolate orders with AI suggestions | Power Apps, Copilot Studio | Cupid Chocolate Global |
| **📈 Love Analytics Platform** | End-to-end data platform analyzing Valentine's trends | Microsoft Fabric, Power BI | All datasets |

**Remember**: These are just starting points. Mix ideas, combine datasets, or come up with something completely new! The weirder, the better. 🦄

---

## 📊 Data Sources

### Provided Datasets
We've prepared 10 diverse datasets in the `/data` folder — use them as-is or combine them creatively!

### Additional Data (Optional)
You can also use:
- 🌐 **Public APIs** (weather, maps, social media, etc.)
- 🎲 **Synthetic/Mock Data** (create your own!)
- 📂 **Other Data Sources** (respecting licenses and privacy terms)

---

# Datasets Overview

This edition features **10 diverse datasets** designed to work independently or together. Mix and match them based on your creative ideas!

---

## 🏆 Core Dataset: Cupid Chocolate Global

A comprehensive e-commerce data warehouse with **~13K sales transactions** across multiple countries.
*Where love meets commerce, one chocolate bar at a time.*

**Structure:** Star Schema with 7 tables
- **DimCustomer**: 2,000 customers with demographics, loyalty tier & preferences
- **DimProduct**: 66 products with pricing, categories & attributes
- **DimStore**: Global store locations (Online & Retail channels)
- **DimPromotion**: Marketing campaigns with budgets & performance metrics
- **DimSupplier**: Vendor information with lead times & quality scores
- **DimDate**: Complete date dimension for temporal analysis
- **FactSales**: Transaction records with costs, discounts & profit margins

**Use Cases:** Sales analysis, customer segmentation, supply chain optimization, regional performance

---

## 🎁 Complementary Datasets (Pick & Choose)

### 1. **Gift Recommender** (10,000 events)
Event-driven customer behavior with rich attributes for personalization.
*Because sometimes the algorithm knows what you want better than you do.*

- **Columns**: Customer profiles, product details, delivery preferences, ratings & returns
- **Join on**: `customer_id` with DimCustomer for enhanced profiles
- **Use Cases**: Recommendation engines, customer lifetime value, gift personalization
- **Records**: 10,000

### 2. **Cupid Behavior Graph Edges** (100 interactions)
Network data showing connections and relationships between users.
*The map of who actually responded to your messages.*

- **Columns**: `source_user_id`, `target_user_id`, `edge_type`, `weight`, `probability`
- **Use Cases**: Social network analysis, relationship mapping, community detection
- **Records**: 100

### 3. **Cupid Matchmaking** (100 profiles)
User profiles with personality traits and matching success metrics.
*The algorithm that swears it knows what you want.*

- **Columns**: Big Five OCEAN traits, age, interests, matching attempts & success rates
- **Use Cases**: Behavioral analysis, preference modeling, compatibility studies
- **Records**: 100

### 4. **Broken Hearts Security** (100 events)
Authentication and fraud detection logs with risk scoring.
*Because even Cupid needs a firewall.*

- **Columns**: `login_attempt_id`, `user_id`, `ip_address`, `geo`, `risk_score`, `MFA_result`
- **Use Cases**: Security analysis, fraud detection, device compliance patterns
- **Records**: 100

### 5. **Cupid Trust & Safety** (100 messages)
Content moderation and toxicity detection across multiple languages.
*Protecting your matches from the weird stuff.*

- **Columns**: `message_text`, `toxicity_score`, `category`, `language_code`, `moderation_action`
- **Use Cases**: Content moderation, toxicity detection, safety enforcement
- **Records**: 100

### 6. **Cupid Supply Chain** (100 products)
Inventory and supply chain data with lead times and sustainability metrics.
*Chocolates and flowers won't deliver themselves.*

- **Columns**: `product_id`, `vendor_lead_time_days`, `stock_level`, `delay_reason`, `sustainability_score`
- **Join on**: `product_id` with DimProduct ✅ *Verified working*
- **Use Cases**: Supply chain optimization, inventory management, sustainability analysis
- **Records**: 100

### 7. **Love Notes Telemetry** (100 deliveries)
Message delivery performance metrics across regions.
*Every "Good morning" tracked across continents.*

- **Columns**: `message_id`, `region_origin`, `region_destination`, `latency_ms`, `retry_count`, `delivery_status`
- **Use Cases**: Performance optimization, reliability analysis, cross-region insights
- **Records**: 100

### 8. **Cupid Global Routing** (100 regions)
Regional traffic metrics and performance analytics.
*Why your message took 230ms to arrive.*

- **Columns**: `region`, `request_count_per_min`, `p95_latency_ms`, `failure_rate`, `weather_factor`
- **Use Cases**: Capacity planning, performance monitoring, infrastructure analysis
- **Records**: 100

### 9. **Modern Work Dynamics** (100 meetings)
Meeting and collaboration data with sentiment analysis.
*Because love is complicated... and scheduled in Outlook.*

- **Columns**: `meeting_id`, `participants_count`, `response_pattern`, `cross_timezone_issues`, `sentiment_of_notes`
- **Use Cases**: Team collaboration analysis, productivity metrics, timezone impact assessment
- **Records**: 100

---

## 🔗 Joining Guide

**For Sales & Customer Deep-Dive:**
- Start with: Cupid Chocolate Global (all 7 tables)
- Add: Gift Recommender (customer_id join for 10K events)
- Add: Cupid Supply Chain (product_id join for logistics insights)

**For Network & Behavioral Analysis:**
- Start with: Cupid Behavior Graph Edges
- Add: Cupid Matchmaking (personality & compatibility)
- Add: Cupid Chocolate Global (if customer_id aligns)

**For Platform Performance & Reliability:**
- Combine: Love Notes Telemetry + Cupid Global Routing + Broken Hearts Security
- Optional: Modern Work Dynamics for collaboration performance

**For End-to-End Experience:**
- Mix any datasets that tell your story!
- All datasets are designed for flexibility and can complement each other thematically or analytically

---

## 🚀 Quick Start

All datasets are in CSV format. Pick your starting point:

```python
import pandas as pd

# Load your dataset of choice
df = pd.read_csv('path/to/dataset.csv')

# Now go tell a story with data!
# May the odds be ever in your favor. Or at least in your regression models!
```

**How to use:**
1. **Explore the data** — All datasets are in `/data` folder
2. **Pick your angle** — What question do you want to answer?
3. **Mix & match** — Combine datasets using the joining guide
4. **Tell your story** — Use data to uncover insights

**Remember**: There are no prescribed solutions. Use your imagination! ✨

---

## 🎯 Evaluation Criteria

Your project will be judged by a panel of Microsoft Managers with technical backgrounds. Here's how you'll be scored:

### Total: 100 Points

| Category | Criteria | Points |
|----------|----------|--------|
| **1. Working PoC & Demo** | | **/35** |
| | Functionality | /15 |
| | Technical Depth | /20 |
| **2. Creativity & Innovation** | | **/30** |
| | Originality | /12 |
| | Creative Tech Use | /10 |
| | Theme & Fun Factor | /8 |
| **3. Business Acumen** | | **/15** |
| | Problem-Solution Fit | /6 |
| | Customer/Business Impact | /5 |
| | Market Awareness | /4 |
| **4. Presentation** | | **/20** |
| | Narrative & Flow | /8 |
| | Clarity & Conciseness | /6 |
| | Q&A Handling | /6 |

### 🏆 Prizes
There will be prizes for the team with the highest score! May the best Cupids win! 🎁

---

## 🎭 Tone & Vibe

This hackathon is a mix of **business** and **fun**! We encourage:
- 💼 Solid technical solutions with real-world applicability
- 🎨 Creative, even humorous concepts
- 🎉 Having fun while learning!

Don't be afraid to get silly with your theme — Cupid appreciates a good sense of humor! 😄

<p align="right">
  <img src="../img/heart3.png" alt="Spread the Love" width="25%">
</p>

---

## ❓ FAQ

**Q: Can I use pre-built code or templates?**  
A: Yes! There are no restrictions on using existing code, libraries, or templates.

**Q: Do we need to deploy to Azure?**  
A: A working PoC is required. Deployment to Azure is encouraged but local demos with Azure services are acceptable.

**Q: Can we use data from outside the provided datasets?**  
A: Absolutely! You can use public APIs, synthetic data, or other sources (respecting licenses).

**Q: Is there mentor support?**  
A: No dedicated mentors, but collaboration and asking peers is encouraged!

**Q: How do we submit our project?**  
A: Your team decides the submission format. Just be ready to present!

---

Love,  
**The Geekster Crew** ❤️

<p align="left">
  <img src="../img/geekster_logo.png" alt="Geekster logo" width="25%">
</p>