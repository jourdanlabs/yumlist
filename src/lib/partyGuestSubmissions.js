// Keeps track of the items a guest added from this device, so the invite page
// can offer them edit and remove controls. The manage token is the only way a
// guest can change a row without an account.
const keyFor = (token) => `yumlist_party_${token}`;

export function loadGuestSubmissions(token) {
  if (!token) return [];
  try {
    const raw = window.localStorage.getItem(keyFor(token));
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter((item) => item && item.id && item.manage_token);
  } catch (e) {
    return [];
  }
}

export function saveGuestSubmissions(token, list) {
  if (!token) return;
  try {
    window.localStorage.setItem(keyFor(token), JSON.stringify(list));
  } catch (e) {
    /* storage unavailable: the list still works for this visit */
  }
}