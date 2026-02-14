import {cart, clearCart} from "./cartState.js";

export  function getCartTotals() {

    let quantity = 0;
    let totalPrice = 0;

    for (let i = 0; i < cart.length; i++) {


        quantity += cart[i].quantity
        totalPrice += cart[i].price * cart[i].quantity



    }

    return {
        quantity,
        totalPrice
    };



}


export function addItemToCart(card) {

    const name = card.querySelector("h3").textContent
    // const price = card.querySelector("span").textContent




    const price = Number(card.querySelector("span").textContent.replace("₹", ""));


    const existingIteam = cart.find(item => item.name === name);

    if (existingIteam) {
        existingIteam.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,


        });
    }

    

}


export function increaseQuantity(name) {
    const item = cart.find(i => i.name === name);
    if (item) item.quantity += 1;
}

export function decreaseQuantity(name) {
    const index = cart.findIndex(i => i.name === name);
    if (index !== -1) {
        cart[index].quantity -= 1;
        if (cart[index].quantity === 0) {
            cart.splice(index, 1);
        }
    }
}