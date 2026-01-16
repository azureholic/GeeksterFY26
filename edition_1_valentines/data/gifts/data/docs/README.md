
# Cupid Gift Recommender

## Overview
A synthetic, privacy‑safe dataset simulating global Valentine’s‑season shopping behavior.  
Contains **10,000 user events** across browsing, carting, and purchasing Valentine‑themed products.  

❗**CAN BE RELATED TO THE [DimCustomer.csv](../../../cupid_chocolate_global/data/DimCustomer.csv) BY customer_id from cupid_chocolate_global dataset**.

---

## Schema Summary (39 columns)

### Event  
- `event_id`, `event_ts`, `event_type` (`view`, `add_to_cart`, `purchase`, `wishlist`)

### Customer (synthetic & masked)  
- `customer_id`, `first_name`, `last_name`  
- `email_masked`, `phone_masked`  
- `country_iso2`, `city`, `preferred_language`  
- `marketing_consent`, `loyalty_tier`  
- Behavioral: `user_tenure_days`, `past_12m_orders`, `days_since_last_purchase`, `avg_order_value_user`

### Context  
- `device_type`, `channel`, `campaign_id`, `coupon_applied`, `season`

### Product  
- `product_sku`, `product_name`, `product_category`, `product_subcategory`  
- `brand`, `is_fragile`

### Price & Fulfillment  
- `list_price`, `discount_pct`, `unit_price`, `payment_type_masked`, `currency`  
- `gift_persona`, `delivery_speed`, `delivery_window_hours`, `shipping_country_iso2`  
- `rating`, `returned_flag`


## Privacy
- All data is synthetic.  
- Emails and phone numbers are masked.  
- 

---

## File
- `GiftRecommender.csv`  
- Encoding: UTF‑8  
- Delimiter: `,`

