
# Cupid Chocolate Sales Intelligence — Global (10K)

This package provides a **global** star schema with **10,000 sales rows**, customers/stores across 20 countries, and realistic international formats:
- Names from multiple regions (synthetic combinations)
- Emails with country-specific test domains (e.g., example.co.uk, example.de)
- Phone numbers in **E.164** with country codes
- Postal codes matching each country’s common format (synthetic)
- Addresses are **plausible but synthetic** (street+number); not geocoded to real residences
- Payments as **non-reversible test tokens** (no real PAN/IBAN)

## Tables
- DimProduct, DimCustomer, DimDate, DimStore, DimPromotion, DimSupplier
- FactSales (10,000 rows)

## Joins
- FactSales.product_id → DimProduct.product_id
- FactSales.customer_id → DimCustomer.customer_id
- FactSales.store_id → DimStore.store_id
- FactSales.promotion_id → DimPromotion.promotion_id
- FactSales.supplier_id → DimSupplier.supplier_id
- FactSales.date_id → DimDate.date_id

## Governance Notes
- Treat customer/contact columns as **Confidential • Synthetic PII**
- Register in **Purview**, enable classification (Email/Phone/Postal Code/Payment Token)
- Provide **RLS/CLS** for PII; build de-identified gold views for analytics
