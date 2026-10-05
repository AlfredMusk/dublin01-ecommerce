# DUBLIN/01 — price sources

Prices are VAT-inclusive EUR and live in one place: `src/data/products.json`
(`price`, with an internal `priceSource` that is never displayed).

## Brand products in the catalogue

Checked on 2026-10-04 against the official Irish storefronts (nike.com/ie,
adidas.ie, newbalance.ie, asics.com/ie), each cross-checked with an Irish or EU
retailer. A row marked "development value" has no verified source yet and must
be confirmed before launch.

| Brand | Model | Colour | Price (EUR) | Source | Checked | Status |
|---|---|---|---|---|---|---|
| ASICS | GEL-Kayano 14 | Pure Silver | 170.00 | https://www.asics.com/ie/en-ie/gel-kayano-14/p/1203A537-200.html | 2026-10-04 | official Irish storefront |
| adidas | Samba OG | Cloud White / Green | 120.00 | https://www.adidas.ie/samba-og-shoes/B75806.html | 2026-10-04 | official Irish storefront |
| Nike | Cortez Leather | White / Black / Tan | 99.99 | https://www.nike.com/ie/t/cortez-leather-shoes-4G1pq0ix | 2026-10-04 | official Irish storefront |
| New Balance | Made in USA 990v6 | Grey / Silver | 250.00 | https://www.newbalance.ie/en/pd/made-in-usa-990v6/M990V6-43094-PMG-EMEA.html | 2026-10-04 | official Irish storefront |
| adidas | Samba OG | Clay Strata | 120.00 | https://www.adidas.ie/samba-og-shoes/HP3941.html | 2026-10-04 | official Irish storefront |
| Nike | Pegasus Trail 5 GORE-TEX | White / Bright Crimson | 169.99 | — | — | development value, not verified |
| New Balance | 997H | Grey | 110.00 | https://www.newbalance.ie/en/pd/997h/CM997HV1-25848.html | 2026-10-04 | official Irish storefront |
| Salomon | XA PRO 3D GORE-TEX | Black | 160.00 | — | — | development value, not verified |
| New Balance | Fresh Foam X More v4 | Navy | 160.00 | — | — | development value, not verified |
| New Balance | Fresh Foam Garoé Midcut | Black | 130.00 | — | — | development value, not verified |
| adidas | Handball Spezial | Core Navy / Gum | 110.00 | https://www.adidas.ie/handball-spezial-shoes/BD7633.html | 2026-10-04 | official Irish storefront |
| Nike | Air Max 90 | Iron Grey | 149.99 | https://www.nike.com/ie/t/air-max-90-mens-shoes-exykZV6r/CN8490-100 | 2026-10-04 | official Irish storefront |
| New Balance | 327 | Orange / White | 130.00 | https://www.newbalance.ie/en/pd/327/MS327V1-40892.html | 2026-10-04 | official Irish storefront |
| ASICS | GEL-Kayano 14 | White / Midnight | 170.00 | https://www.asics.com/ie/en-ie/gel-kayano-14/p/1203A537-200.html | 2026-10-04 | official Irish storefront |
| adidas | Gazelle | Core Black / White | 110.00 | https://www.adidas.ie/gazelle-shoes/BB5476.html | 2026-10-04 | official Irish storefront |
| Nike | Air Force 1 '07 | White / White | 119.99 | https://www.nike.com/ie/t/air-force-1-07-mens-shoes-jBrhbr/CW2288-111 | 2026-10-04 | official Irish storefront |
| Nike | Dunk Low Retro | White / Black | 119.99 | https://www.nike.com/ie/t/dunk-low-retro-mens-shoes-GeHBr62V/HF5441-100 | 2026-10-04 | official Irish storefront |

Notes:

- adidas Samba OG in Cloud White / Green is no longer listed on adidas.ie; the price is the current Samba OG price.
- New Balance 997H is being phased out by the brand; 110 is its last regular price.
- Nike Pegasus Trail 5 GORE-TEX, New Balance Fresh Foam X More v4, New Balance Fresh Foam Garoé Midcut and Salomon XA PRO 3D GORE-TEX were chosen because licence-free photographs of exactly these models exist. Their prices are development values.
- Removed from the catalogue because no licence-free photograph showed the exact model: Nike Air Max 1, Nike Pegasus 41, adidas Ultraboost 1.0, ASICS GEL-1130, Salomon XT-6.

## Reductions

No product carries a `compareAtPrice`. The sale mechanism is kept in the code, but
a reduced price must only be shown against the lowest price charged in the 30
days before the reduction (EU Omnibus rule), which requires real price history.
The Sale page shows an empty state until then.

## DUBLIN/01 label

Own-label prices are set by the business. Current values are working prices for
development.

## Full reference table (candidates included)

Supplied by the price research of 2026-10-04.

| Brand | Model | Official EUR | Official URL | Cross-check EUR | Current | Confidence |
|---|---|---|---|---|---|---|
| adidas | Samba OG | 120 | https://www.adidas.ie/samba-og-shoes/B75806.html | 120 | yes | high |
| adidas | Gazelle | 110 | https://www.adidas.ie/gazelle-shoes/BB5476.html | 110 | yes | high |
| adidas | Gazelle Indoor | 120 | https://www.adidas.ie/gazelle-indoor-shoes/KH9707.html | 120 | yes | high |
| adidas | Ultraboost 1.0 | 180 | https://www.adidas.ie/ultraboost-1.0-shoes/HQ4199.html | 180 | no | medium |
| adidas | Handball Spezial | 110 | https://www.adidas.ie/handball-spezial-shoes/BD7633.html | 110 | yes | high |
| adidas | Superstar II | 120 | https://www.adidas.ie/superstar-ii-shoes/IH8659.html | 120 | yes | high |
| adidas | Samba OG women | 120 | https://www.adidas.ie/samba-og-shoes/HP3941.html | 120 | yes | high |
| adidas | Adizero SL 2 | 130 | https://www.adidas.ie/adizero-sl-2-shoes/JQ0354.html | 130 | yes | medium |
| adidas | Terrex Skychaser AX5 GORE-TEX | 120 | https://www.adidas.ie/terrex-skychaser-ax5-gore-tex-hiking-shoes/JQ2210.html | 120 | yes | high |
| Nike | Air Force 1 '07 men | 119.99 | https://www.nike.com/ie/t/air-force-1-07-mens-shoes-jBrhbr/CW2288-111 | 120 | yes | high |
| Nike | Air Max 1 | 149.99 | https://nike.com/ie/t/air-max-1-shoes-C4m0nW | 150 | yes | medium |
| Nike | Pegasus 41 | none | https://www.nike.com/ie/w?q=pegasus%2041 | 140 | no | medium |
| Nike | Pegasus 42 | 139.99 | https://www.nike.com/ie/t/pegasus-42-mens-road-running-shoes-M9ckDyR3/IM8332-100 | 140 | yes | high |
| Nike | Dunk Low Retro | 119.99 | https://www.nike.com/ie/t/dunk-low-retro-mens-shoes-GeHBr62V/HF5441-100 | 120 | yes | high |
| Nike | Air Force 1 '07 women | 119.99 | https://www.nike.com/ie/t/air-force-1-07-shoes-hbLYXYJ4/DD8959-100 | 120 | yes | high |
| Nike | Zoom Vomero 5 | 159.99 | https://www.nike.com/ie/t/zoom-vomero-5-mens-shoes-P8qLK4y8/BV1358-003 | 160 | yes | high |
| Nike | Cortez women (leather) | 99.99 | https://www.nike.com/ie/t/cortez-leather-shoes-4G1pq0ix | 100 | yes | medium |
| Nike | Air Max 90 | 149.99 | https://www.nike.com/ie/t/air-max-90-mens-shoes-exykZV6r/CN8490-100 | 150 | yes | high |
| Nike | ACG Pegasus Trail | 149.99 | https://www.nike.com/ie/t/acg-pegasus-trail-mens-trail-running-shoes-edJ7MX66/HV8116-310 | 150 | yes | high |
| ASICS | GEL-Kayano 14 | 170 | https://www.asics.com/ie/en-ie/gel-kayano-14/p/1203A537-200.html | 170 | yes | high |
| ASICS | GEL-1130 | 100 | https://www.asics.com/ie/en-ie/gel-1130/p/1201B020-100.html | 100 | yes | high |
| ASICS | GEL-Nimbus 28 | 200 | https://www.asics.com/ie/en-ie/gel-nimbus-28/p/1011C127-001.html | 200 | yes | high |
| ASICS | Trabuco 14 | 160 | https://www.asics.com/ie/en-ie/trabuco-14/p/1011C166-750.html | 160 | yes | high |
| ASICS | GT-2000 15 | 150 | https://www.asics.com/ie/en-ie/gt-2000-15/p/1011C235-001.html | 150 | yes | high |
| ASICS | GEL-NYC | 150 | https://www.asics.com/ie/en-ie/gel-nyc/p/1203A383-113.html | 150 | yes | high |
| ASICS | GEL-Kayano 33 | 200 | https://www.asics.com/ie/en-ie/gel-kayano-33/p/1011C167-001.html | 200 | yes | high |
| New Balance | Made in USA 990v6 | 250 | https://www.newbalance.ie/en/pd/made-in-usa-990v6/M990V6-43094-PMG-EMEA.html | 250 | yes | high |
| New Balance | 997H | 110 | https://www.newbalance.ie/en/pd/997h/CM997HV1-25848.html | none | no | medium |
| New Balance | 530 | 120 | https://www.newbalance.ie/en/pd/530/MR530-32265-PMG-EMEA.html | 120 | yes | high |
| New Balance | 9060 | 190 | https://www.newbalance.ie/en/pd/9060/U9060V1-50600-PMG-EMEA.html | 190 | yes | high |
| New Balance | 2002R | 150 | https://www.newbalance.ie/en/pd/2002r/M2002RV1-42829-PMG-EMEA.html | 150 | yes | high |
| New Balance | 1080v15 | 180 | https://www.newbalance.ie/en/pd/1080v15-mens/M1080V15_RU-FTW-802829.html | 180 | yes | high |
| New Balance | 574 Core | 120 | https://www.newbalance.ie/en/pd/574-core/ML574EVG-2E-04.html | 120 | yes | high |
| New Balance | 327 | 130 | https://www.newbalance.ie/en/pd/327/MS327V1-40892.html | 130 | yes | medium |
