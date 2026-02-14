import { formatPrice } from "./utils/formatPrice.js";
import { cart, setCart, clearCart } from "./cart/cartState.js";
import { saveCart, loadCart, clearSavedCart } from "./cart/cartStorage.js";
import { getCartTotals, addItemToCart, increaseQuantity, decreaseQuantity } from "./cart/cartLogic.js";
import { saveOrder } from "./orders/orderStorage.js";


// DOM elements
const clearCartBtn = document.querySelector(".clear-cart");
const cartCountEl = document.querySelector(".cart-count");
const orderTotal = document.querySelector(".order-total");
const menuContainer = document.querySelector(".menu-items");
const menuStatus = document.querySelector(".menu-status");
const checkoutBtn = document.querySelector(".checkout-btn");
const checkoutModal = document.querySelector(".checkout-modal");

const cancelCheckoutBtn = document.querySelector(".cancel-checkout");
const confirmCheckoutBtn = document.querySelector(".confirm-checkout");

const nameInput = document.querySelector(".customer-name");
const phoneInput = document.querySelector(".customer-phone");
const addressInput = document.querySelector(".customer-address");

const checkoutError = document.querySelector(".checkout-error");
const orderHistoryList = document.querySelector(".order-history");

const filterButtons =document.querySelectorAll(".order-filters  button");
const searchInput = document.querySelector(".order-search");


let allOrders=[];
let currentFilter="ALL";

let menuLoading = false;

// ---------- APP INIT ----------
const savedCart = loadCart();
setCart(savedCart);
updateCartUI();
loadMenu();

// ---------- UI ----------
function updateCartUI() {
    const { quantity, totalPrice } = getCartTotals();

    cartCountEl.textContent = quantity;

    renderCartItems();

    const totalRow = document.createElement("div");
    totalRow.classList.add("cart-total");

    totalRow.innerHTML = `
        <hr/>
        <strong>Total: ${formatPrice(totalPrice)}</strong>
    `;

    orderTotal.appendChild(totalRow);
}


// ---------- EVENTS ----------
clearCartBtn.addEventListener("click", () => {
    clearCart();
    clearSavedCart();
    updateCartUI();
});

menuContainer.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    addItemToCart(card);
    saveCart(cart);
    updateCartUI();
});

// ---------- MENU ----------
async function loadMenu() {
    try {
        menuStatus.textContent = "Loading menu...";
        menuLoading = true;
        menuContainer.classList.add("loading");

        const response = await fetch("./menu.json");
        if (!response.ok) {
            throw new Error("HTTP Error " + response.status);
        }

        const data = await response.json();
        renderMenu(data);

        menuStatus.textContent = "";

    } catch (error) {
        console.error("Menu load failed:", error);
        menuStatus.textContent = "Failed to load menu";
    } finally {
        menuLoading = false;
        menuContainer.classList.remove("loading");
    }
}

function renderMenu(menuData) {
    menuContainer.innerHTML = "";

    menuData.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <span>${formatPrice(item.price)}</span>
        `;

        menuContainer.appendChild(card);
    });
}


function renderCartItems() {
    orderTotal.innerHTML = "";

    if (cart.length === 0) {
        orderTotal.innerHTML = "<p>Cart is empty</p>";
        return;
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.classList.add("order-row");

        row.innerHTML = `
            <span>${item.name}</span>

            <button class="minus" data-name="${item.name}">−</button>
            <span>${item.quantity}</span>
            <button class="plus" data-name="${item.name}">+</button>

            <span>${formatPrice(item.price * item.quantity)}</span>
        `;

        orderTotal.appendChild(row);
    });
}


orderTotal.addEventListener("click", (e) => {
    const btn = e.target;
    const name = btn.dataset.name;

    if (!name) return;

    if (btn.classList.contains("plus")) {
        increaseQuantity(name);
    }

    if (btn.classList.contains("minus")) {
        decreaseQuantity(name);
    }

    saveCart(cart);
    updateCartUI();
});



checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;

    checkoutError.textContent = "";
    checkoutModal.classList.remove("hidden");
});


cancelCheckoutBtn.addEventListener("click", () => {
    checkoutModal.classList.add("hidden");
    checkoutError.textContent = "";
});



confirmCheckoutBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();

    if (!name || !phone || !address) {
        checkoutError.textContent = "All fields are required";
        return;
    }

    checkoutError.textContent = "";
    placeOrder({ name, phone, address });
});




async function placeOrder(customer) {

    if (cart.length === 0) return;

    const { quantity, totalPrice } = getCartTotals();

    const orderData = {
        customer: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address
        },

        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        })),

        summary: {
            totalItems: quantity,
            totalAmount: totalPrice
        }
    };


    try {
        const response = await fetch("http://localhost:5000/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });


        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "order failed")
        }


        clearCart();
        clearSavedCart();
        updateCartUI();


        checkoutModal.classList.add("hidden");

        nameInput.value = "";
        phoneInput.value = "";
        addressInput.value = "";

        alert("🎉 Order placed successfully!");

        console.log("Order saved in backend:", result);

    } catch (error) {
        console.error(error);
        checkoutError.textContent = "Failed to place order. Try again.";

    }


    loadOrderHistory();
}


async function loadOrderHistory() {


    try {
        const response = await fetch("http://localhost:5000/orders");
        const data = await response.json();


        if (!data.success) return;


        // renderOrderHistory(data.orders);
        allOrders = data.orders;
       applyFilters();




    } catch (error) {
        console.log("Failed to load order history", error);
    }
}


function applyFilters() {
    let filteredOrders = allOrders;

    // Status filter
    if (currentFilter !== "ALL") {
        filteredOrders = filteredOrders.filter(
            order => order.status === currentFilter
        );
    }

    // Search filter
    const searchValue = searchInput.value.toLowerCase();

    if (searchValue) {
        filteredOrders = filteredOrders.filter(order =>
            order.customer.name.toLowerCase().includes(searchValue) ||
            order.customer.phone.includes(searchValue)
        );
    }

    renderOrderHistory(filteredOrders);
}


function renderOrderHistory(orders) {
    orderHistoryList.innerHTML = "";

    if (orders.length === 0) {
        orderHistoryList.innerHTML = "<p>No Order Yet</p>";
        return;
    }


    orders.forEach(order => {
        const card = document.createElement("div");
        card.classList.add("order-card");


        const itemsHtml = order.items
            .map(item => `<li class="order-item">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">x ${item.quantity}</span> </li>`)
            .join("");

        card.innerHTML = `
        <p><strong>Order ID</strong>${order._id}</p>
        <p><strong>Name:</strong>${order.customer.name}</p>
        <p><strong>Phone:</strong>${order.customer.phone}</p>
                
            <p>
             <strong>Status:</strong>
                <span class="order-status ${order.status.toLowerCase()}">
                ${order.status}
             </span>
                </p>
    

        <div class="order-items">
        <p><strong> Items</strong></p>
        <ul class="items-list"> ${itemsHtml} 
        </ul>
        
        </div>
             
        
        <p class="order-total"><strong>Total:</strong>${formatPrice(order.summary.totalAmount)}</p>
        <small>${new Date(order.createdAt).toLocaleString()}</small>
        <hr/>
        `;

        orderHistoryList.appendChild(card);
    })
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        applyFilters();
    });
});



setInterval(() => {
    loadOrderHistory();
}, 5000);
