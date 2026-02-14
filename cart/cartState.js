// cart/cartState.js

export let cart = [];

/**
 * Replace entire cart state
 */
export function setCart(newCart) {
    cart.length = 0;          // same reference
    cart.push(...newCart);
}

/**
 * Clear cart state
 */
export function clearCart() {
    cart.length = 0;
}
