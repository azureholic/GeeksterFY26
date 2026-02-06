from __future__ import annotations

from pathlib import Path
from typing import Iterable, List

import numpy as np
import pandas as pd
import streamlit as st

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "edition_1_valentines" / "data" / "cupid_matchmaking" / "data" / "dataset_cupid_matchmaking.csv"
TRAIT_COLS = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
]


def _split_and_strip(value: str) -> List[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


def load_data(path: Path = DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["interests_list"] = df["interests"].apply(_split_and_strip)
    df["dealbreakers_list"] = df["dealbreakers"].apply(
        lambda x: [] if pd.isna(x) or x == "no_dealbreakers" else _split_and_strip(str(x))
    )
    return df


def jaccard_similarity(left: Iterable[str], right: Iterable[str]) -> float:
    left_set = set(left)
    right_set = set(right)
    if not left_set and not right_set:
        return 0.0
    intersection = left_set & right_set
    union = left_set | right_set
    return len(intersection) / len(union)


def personality_similarity(row_a: pd.Series, row_b: pd.Series) -> float:
    diff = row_a[TRAIT_COLS].to_numpy(dtype=float) - row_b[TRAIT_COLS].to_numpy(dtype=float)
    dist = np.linalg.norm(diff)
    return float(max(0.0, 1 - dist / np.sqrt(len(TRAIT_COLS))))


def sentiment_alignment(a: float, b: float) -> float:
    return float(max(0.0, 1 - abs(a - b) / 2))


def region_bonus(region_a: str, region_b: str) -> float:
    if region_a == region_b:
        return 1.0
    return 0.6


def age_compatible(row_a: pd.Series, row_b: pd.Series) -> bool:
    a_to_b = row_b.age >= row_a.pref_age_min and row_b.age <= row_a.pref_age_max
    b_to_a = row_a.age >= row_b.pref_age_min and row_a.age <= row_b.pref_age_max
    return bool(a_to_b and b_to_a)


def score_pair(row_a: pd.Series, row_b: pd.Series) -> dict:
    interests_score = jaccard_similarity(row_a.interests_list, row_b.interests_list)
    personality_score = personality_similarity(row_a, row_b)
    sentiment_score = sentiment_alignment(row_a.sentiment_score, row_b.sentiment_score)
    location_score = region_bonus(row_a.location_region, row_b.location_region)

    combined_score = (
        0.4 * interests_score
        + 0.3 * personality_score
        + 0.2 * sentiment_score
        + 0.1 * location_score
    )

    return {
        "match_for": row_a.user_id,
        "candidate": row_b.user_id,
        "score": round(combined_score, 3),
        "interests_score": round(interests_score, 3),
        "personality_score": round(personality_score, 3),
        "sentiment_score": round(sentiment_score, 3),
        "location_score": round(location_score, 3),
        "age": row_b.age,
        "region": row_b.location_region,
        "interests": ", ".join(row_b.interests_list),
    }


def build_matches(df: pd.DataFrame, enforce_age: bool, regions: set[str], min_score: float) -> pd.DataFrame:
    scores: list[dict] = []
    region_filtered = df if not regions else df[df.location_region.isin(regions)]

    for _, row_a in region_filtered.iterrows():
        for _, row_b in region_filtered.iterrows():
            if row_a.user_id == row_b.user_id:
                continue
            if enforce_age and not age_compatible(row_a, row_b):
                continue
            pair_score = score_pair(row_a, row_b)
            if pair_score["score"] >= min_score:
                scores.append(pair_score)

    result = pd.DataFrame(scores)
    return result.sort_values(["match_for", "score"], ascending=[True, False])


st.set_page_config(page_title="Cupid Matchmaking Dashboard", page_icon="💘", layout="wide")
st.title("Cupid Matchmaking Dashboard")
st.caption("Potential matches per user based on interests, personality, sentiment, region, and age compatibility.")

with st.sidebar:
    st.header("Controls")
    enforce_age = st.checkbox("Require mutual age fit", value=True)
    min_score = st.slider("Minimum score", min_value=0.0, max_value=1.0, value=0.4, step=0.05)
    top_k = st.slider("Top matches to show", min_value=3, max_value=50, value=10, step=1)

    data = load_data()
    regions = sorted(data.location_region.unique())
    selected_regions = st.multiselect("Regions to include", regions, default=regions)
    selected_user = st.selectbox("Focus user", sorted(data.user_id))

matches = build_matches(data, enforce_age=enforce_age, regions=set(selected_regions), min_score=min_score)
user_matches = matches[matches.match_for == selected_user].head(top_k)

st.subheader(f"Top {len(user_matches)} matches for {selected_user}")
st.dataframe(
    user_matches[
        [
            "candidate",
            "score",
            "interests_score",
            "personality_score",
            "sentiment_score",
            "location_score",
            "age",
            "region",
            "interests",
        ]
    ],
    hide_index=True,
)

st.subheader("All matches (filtered)")
st.dataframe(matches.head(1000), hide_index=True)

st.download_button(
    label="Download all matches (CSV)",
    data=matches.to_csv(index=False),
    file_name="cupid_matches.csv",
    mime="text/csv",
)
