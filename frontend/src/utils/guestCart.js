// Guest (not-logged-in) cart, persisted in localStorage as {productId, quantity}
// pairs. Product details are looked up live from the API when building the
// display view, so prices/stock/images shown are always current.
const STORAGE_KEY = "smartshop_guest_cart";

function readEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — guest cart just
    // won't persist across reloads; not worth surfacing to the user.
  }
}

function addEntry(productId, quantity) {
  const entries = readEntries();
  const existing = entries.find((e) => e.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    entries.push({ productId, quantity });
  }
  writeEntries(entries);
  return entries;
}

function setEntryQuantity(productId, quantity) {
  const entries = readEntries().map((e) => (e.productId === productId ? { ...e, quantity } : e));
  writeEntries(entries);
  return entries;
}

function removeEntry(productId) {
  const entries = readEntries().filter((e) => e.productId !== productId);
  writeEntries(entries);
  return entries;
}

function clearEntries() {
  writeEntries([]);
}

export const guestCart = { readEntries, addEntry, setEntryQuantity, removeEntry, clearEntries };
