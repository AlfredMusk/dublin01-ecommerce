/**
 * Formatting helpers. Prices are EUR, formatted for Ireland (€1,234.50).
 */

const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

export const formatPrice = (amount) => eur.format(amount);

export const pluralize = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
