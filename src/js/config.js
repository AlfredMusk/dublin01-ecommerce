/**
 * Central site configuration: who trades, and the commerce rules the
 * interface shows. Imported by the browser modules and by the page generator
 * (scripts/build-html.mjs), so there is one place to change.
 *
 * COMPANY: every `null` is information only the business can supply. The
 * interface hides whatever is missing; nothing here is ever invented.
 * COMMERCE: values marked "development value" are placeholders for the
 * launch policy and must be confirmed before going live.
 */

export const company = {
  tradingName: 'DUBLIN/01',
  legalName: null, // registered company or sole-trader name
  registeredAddress: null, // geographic address, as shown on the Companies Registration Office record
  croNumber: null, // Companies Registration Office number
  vatNumber: null, // IE VAT number
  email: null, // customer service address
  phone: null,
  supportHours: null,
};

export const commerce = {
  currency: 'EUR',
  locale: 'en-IE',
  country: 'Ireland',
  countryCode: 'IE',
  pricesIncludeVat: true,
  freeDeliveryThreshold: 100, // development value
  standardDelivery: 4.95, // development value
  expressDelivery: 9.95, // development value
  returnsDays: 30, // voluntary returns policy, on top of the statutory 14-day right to cancel
  statutoryCancellationDays: 14,
  maxLineQuantity: 10,
  lowStockThreshold: 5, // units left across all sizes
};

/** Production origin, without a trailing slash. While null, canonical URLs, og:url and the sitemap are not emitted. */
export const siteUrl = null;

/** Ordering opens when a payment provider and an order backend are connected. */
export const features = {
  onlineOrdering: false,
  customerAccounts: false,
  newsletterSignup: false,
};
