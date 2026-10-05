import test from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.mjs';

const { addToCart, setQuantity, removeFromCart, getCart, getBagCount, cartDetails, maxFor, MAX_QTY, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY } = await import('../src/js/modules/cart.js');
const { toggleWishlist, getWishlist, isWishlisted, removeFromWishlist } = await import('../src/js/modules/wishlist.js');
const { normalise } = await import('../src/js/data/catalog.js');

const shoe = normalise({ slug: 'shoe', price: 120, sizes: ['41', '42', '43'], inventory: { 41: 0, 42: 2, 43: 30 } });
const cap = normalise({ slug: 'cap', price: 40, sizes: ['One size'], inventory: { 'One size': 5 } });

test.beforeEach(() => resetStorage());

test('adding puts a line in the bag and counts units', () => {
  assert.deepEqual(addToCart(shoe, '42', 1), { added: 1, capped: false });
  assert.deepEqual(getCart(), [{ slug: 'shoe', size: '42', qty: 1 }]);
  addToCart(cap, 'One size', 2);
  assert.equal(getBagCount(), 3);
});

test('a line never holds more than the stock of its size', () => {
  addToCart(shoe, '42', 1);
  assert.deepEqual(addToCart(shoe, '42', 5), { added: 1, capped: true });
  assert.equal(getCart()[0].qty, 2);
  assert.deepEqual(addToCart(shoe, '42', 1), { added: 0, capped: true });
});

test('a sold-out size cannot be added', () => {
  assert.deepEqual(addToCart(shoe, '41', 1), { added: 0, capped: true });
  assert.deepEqual(getCart(), []);
});

test('quantity is also capped by the per-line maximum', () => {
  assert.equal(maxFor(shoe, '43'), MAX_QTY);
  addToCart(shoe, '43', 50);
  assert.equal(getCart()[0].qty, MAX_QTY);
});

test('setQuantity changes, caps and removes lines', () => {
  addToCart(shoe, '43', 1);
  setQuantity('shoe', '43', 4, 10);
  assert.equal(getCart()[0].qty, 4);
  setQuantity('shoe', '43', 99, 3);
  assert.equal(getCart()[0].qty, 3);
  removeFromCart('shoe', '43');
  assert.deepEqual(getCart(), []);
});

test('totals come from catalogue prices and the delivery rule', () => {
  addToCart(cap, 'One size', 1);
  let bag = cartDetails([shoe, cap]);
  assert.equal(bag.subtotal, 40);
  assert.equal(bag.delivery, STANDARD_DELIVERY);
  assert.equal(bag.total, 40 + STANDARD_DELIVERY);
  addToCart(shoe, '42', 1);
  bag = cartDetails([shoe, cap]);
  assert.ok(bag.subtotal >= FREE_DELIVERY_THRESHOLD);
  assert.equal(bag.delivery, 0);
  assert.equal(bag.count, 2);
});

test('stale lines are ignored: unknown product, unknown size, size out of stock', () => {
  window.localStorage.setItem('dublin01:cart', JSON.stringify([{ slug: 'gone', size: '42', qty: 1 }, { slug: 'shoe', size: '8', qty: 1 }, { slug: 'shoe', size: '41', qty: 1 }, { slug: 'shoe', size: '42', qty: 9 }]));
  const bag = cartDetails([shoe, cap]);
  assert.equal(bag.lines.length, 1);
  assert.equal(bag.lines[0].qty, 2);
});

test('wishlist toggles, persists and removes', () => {
  assert.equal(toggleWishlist('shoe'), true);
  assert.equal(toggleWishlist('cap'), true);
  assert.deepEqual(getWishlist(), ['cap', 'shoe']);
  assert.ok(isWishlisted('shoe'));
  assert.equal(toggleWishlist('shoe'), false);
  removeFromWishlist('cap');
  assert.deepEqual(getWishlist(), []);
  assert.equal(JSON.parse(window.localStorage.getItem('dublin01:wishlist')).length, 0);
});
