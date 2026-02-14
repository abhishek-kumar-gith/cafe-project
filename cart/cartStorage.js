const KEY = "cafeCart";

export function saveCart(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
}

export function loadCart() {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
}

export function clearSavedCart() {
    localStorage.removeItem(KEY);
}
