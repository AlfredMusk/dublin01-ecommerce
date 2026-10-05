# DUBLIN/01 — Ireland / EU legal readiness of the frontend

**Not legal advice.** Every text on the legal and information pages is a careful
summary written for the interface. All of it must be reviewed by a solicitor
before launch. Nothing below should be read as confirmation of compliance.

Reference research: `research/dublin01/ireland-eu-ecommerce-legal-brief.md` in the
project's shared folder.

## Requirement → where it lives → state

| Requirement | Where in the site | State |
|---|---|---|
| Trader identity: legal name, geographic address, registration and VAT numbers, email, phone | Terms, Privacy, Contact, footer; values from `src/js/config.js` | Placeholders hidden. **Blocked on business information.** |
| Total price including VAT | Product cards, product page ("Price includes VAT"), bag, checkout summary, footer | Done |
| Delivery charges before the order | Product page, bag, checkout, Delivery page | Done; amounts are development values |
| Delivery time | Delivery page, product page | **Missing**: no committed time is shown until the business confirms one |
| 14-day right of withdrawal, conditions and effects | Consumer rights, Terms, Returns, checkout review | Done as a summary |
| Online withdrawal function ("Cancel contract here") | Footer, Returns, Consumer rights → `cancel-contract.html` | Interface done; sends nothing until a backend exists. Exact wording and flow to confirm |
| Legal guarantee of conformity, with the six-year Irish limitation period | Returns, Consumer rights | Text notice done. The EU harmonised notice and label design are **not** reproduced: to add from the official template |
| Commercial returns policy kept separate from statutory rights | Returns, Consumer rights, Terms, product page, top bar | Done |
| Order button that makes the obligation to pay clear | Checkout: "Place order and pay" | Done; disabled, no payment or order service |
| Order confirmation on a durable medium | — | Backend (email) |
| Price reductions shown against the lowest price of the previous 30 days | No reduced price is shown anywhere; Sale page is empty | Mechanism kept, needs real price history |
| No generic environmental claims | Whole site | Checked: none |
| Reviews and ratings | — | None shown, none invented |
| Product information: brand, main characteristics | Product page | Done |
| Textile fibre composition in percent | Product page, "Materials and care" | Shown from catalogue data; **to verify against supplier labels** |
| Footwear materials (upper, lining, sole) | Product page, "Materials and care" | Shown from catalogue data; **to verify against supplier data** |
| Cookie consent: nothing non-essential before consent, Accept and Reject equally prominent, choice renewable and reopenable | Banner and settings dialog on every page, footer "Cookie settings", Cookies page | Done; choice stored with its date and asked again after six months. Server-side logging needs a backend |
| Privacy notice (GDPR) | Privacy | Summary only; providers, retention and legal bases to complete before launch |
| Accessibility (European Accessibility Act) | Accessibility page; site built to WCAG 2.2 AA principles | Statement done; a formal audit is still needed |
| Online dispute resolution link | — | Not shown: the EU ODR platform has been discontinued |
| Canonical URLs and sitemap | Generated when `siteUrl` is set | Waiting for the domain |

## To be supplied by the owner

- Legal name, registered address, CRO number, VAT number.
- Customer-service email and phone, support hours.
- Production domain.
- Delivery carriers, charges, free-delivery threshold and delivery times.
- Returns: who pays return postage, the returns address, refund timing.
- Payment provider.
- Own-label product data: fibre composition, care labels, country of origin.

## To be reviewed by a solicitor

- Terms of sale, Privacy notice, Cookie policy, Returns policy, Consumer rights page.
- Wording and flow of the "Cancel contract here" function.
- The legal guarantee notice and the EU harmonised label.
- The accessibility statement.
- The checkout review step and the order button wording.
