# GeeksterFY26

<p align="left">
  <img src="img/Geekster20_purpose.png" alt="Geekster2.0 Purpose" width="95%">
</p>

# Datasets Overview

This folder contains 8 themed datasets related to a "Cupid" platform, featuring data related to security, networking, matchmaking, and more. Each dataset contains 101 rows of sample data!

## Datasets

### 1. **dataset_broken_hearts_security.csv** 
Security and login tracking data for user authentication attempts. 
*Because even Cupid needs a firewall.*
- **Columns**: `login_attempt_id`, `user_id`, `ip_address`, `geo`, `failed_attempts`
- **Use Case**: Analyze login patterns, security threats, and geographic access patterns
- **Records**: 101

### 2. **dataset_cupid_behavior_graph_edges.csv**
User interaction graph data showing connections and relationships between users. 
*The map of who actually responded to your messages.*
- **Columns**: `source_user_id`, `target_user_id`, `edge_type`, `weight`, `probability`
- **Use Case**: Social network analysis, relationship mapping, user engagement patterns
- **Records**: 101

### 3. **dataset_cupid_global_routing.csv** 
Network performance metrics across different geographic regions. 
*Why your message took 230ms to arrive.*
- **Columns**: `region`, `request_count_per_min`, `p95_latency_ms`, `failure_rate`, `weather_factor`
- **Use Case**: Infrastructure performance analysis, latency monitoring, regional reliability assessment
- **Records**: 101

### 4. **dataset_cupid_matchmaking.csv**
User profile data for matching and recommendation systems. 
*The algorithm that swears it knows what you want.*
- **Columns**: `user_id`, `age`, `location_region`, `interests`, `openness`
- **Use Case**: User profiling, demographic analysis, recommendation algorithms
- **Records**: 101

### 5. **dataset_cupid_supply_chain.csv** 
Product inventory and supply chain management data. 
*Chocolates and flowers won't deliver themselves.*
- **Columns**: `product_id`, `vendor_lead_time_days`, `stock_level`, `order_quantity`, `delay_reason`
- **Use Case**: Supply chain optimization, inventory management, vendor performance tracking
- **Records**: 101

### 6. **dataset_cupid_trust_safety.csv** 
Content moderation and safety analysis for user messages. 
*Protecting your matches from the weird stuff.*
- **Columns**: `message_text`, `toxicity_score`, `category`, `language_code`, `moderation_action`
- **Use Case**: Content moderation, toxicity detection, safety policy enforcement
- **Records**: 101

### 7. **dataset_love_notes_telemetry.csv** 
Message delivery and communication metrics across regions. 
*Every "Good morning" tracked across continents.*
- **Columns**: `message_id`, `region_origin`, `region_destination`, `latency_ms`, `retry_count`
- **Use Case**: Message delivery performance, communication reliability, cross-region analysis
- **Records**: 101

### 8. **dataset_modern_work_dynamics.csv** 
Meeting and collaboration data with sentiment analysis. 
*Because love is complicated... and scheduled in Outlook.*
- **Columns**: `meeting_id`, `participants_count`, `response_pattern`, `cross_timezone_issues`, `sentiment_of_notes`
- **Use Case**: Team collaboration analysis, meeting effectiveness, timezone impact assessment
- **Records**: 101

---

## Quick Start

All datasets are in CSV format and can be loaded using common data analysis tools:

```python
import pandas as pd
df = pd.read_csv('dataset_name.csv')
# Congratulations! You now have unrestricted access to love data. Use responsibly!
```

Each dataset is structured for analysis of the Cupid platform's operations, spanning security, networking, user behavior, supply chain, and team dynamics.

---

*May the odds be ever in your favor. Or at least in your regression models!* ✨