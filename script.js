const orderNow = document.querySelector(".orderNow");
const menu = document.querySelector(".menu");
const navigation = document.querySelector(".nav");
const menuContainer = document.querySelector(".menu-items");
const orderTotal = document.querySelector(".order-total");
const clearCartBtn = document.querySelector(".clear-cart");
const menuStatus = document.querySelector(".menu-status")
const cartCountE1 = document.querySelector(".cart-count");
const checkoutBtn = document.querySelector(".checkout-btn");
const checkoutStatus = document.querySelector(".checkout-status");
const checkoutModal = document.querySelector(".checkout-modal");
const cancelcheckoutBtn = document.querySelector(".cancel-checkout");
const confirmCheckoutBtn = document.querySelector(".confirm-checkout");
const nameInput = document.querySelector(".customer-name");
const phoneInput = document.querySelector(".customer-phone");
const addressInput = document.querySelector(".customer-address");
const checkoutError = document.querySelector(".checkout-error");
const orderHistoryList = document.querySelector(".order-history-list");
const orderDetailsBox = document.querySelector(".order-details");
const orderDetailsContent = document.querySelector(".order-details-content");
const closeOrderDetailsBtn = document.querySelector(".close-order-details");
const orderSearchInput = document.querySelector(".order-search");



let orderHistory = [];

let currentOrder = null;
let currentFilter = "ALL";
let searchQuery = " ";








let isCheckingOut = false;

orderNow.addEventListener("click", () => {
    menu.scrollIntoView({
        behavior: "smooth"
    });
});




function updateCartCount() {
    const totals = getCartTotals();
    cartCountE1.textContent = totals.quantity;
}





let menuLoading = true;








// function renderTotalOrder() {
//     const totals = Total();

//     orderTotal.innerHTML = `<p>Total items :${totals.quantity}</p>
//     <p>Total Price : ${totals.totalPrice}</p>`

//     // const para1=document.createElement("h4")
//     //     para1.textContent=`Toatl items is${totals.quantity} `

//     // const para2=document.createElement("h4");
//     //     para2.textContent=`Total price is ${totals.totalPrice}`


//     // orderTotal.appendChild(para1)
//     // orderTotal.appendChild(para2)
// }






function renderCartItems() {

    orderTotal.innerHTML = "";

    if (cart.length === 0) {
        orderTotal.innerHTML = "<p>Cart is empty</p>";
        return;
    }



    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const itemTotal = item.price * item.quantity;
        // const row = document.createElement("p");
        // row.textContent = `${item.name} × ${item.quantity} = ₹${itemTotal}`;


        const row = document.createElement("div");
        row.classList.add("order-row");




        const name = document.createElement("span");
        name.textContent = item.name;


        const minusBtn = document.createElement("button");
        minusBtn.textContent = "-";

        if (item.quantity === 1) {
            minusBtn.disabled = true;
        }


        const qnty = document.createElement("span")
        qnty.textContent = item.quantity;

        const plusBtn = document.createElement("button");
        plusBtn.textContent = "+";

        const price = document.createElement("span");
        price.textContent = formatPrice(itemTotal);



        plusBtn.dataset.name = item.name;
        minusBtn.dataset.name = item.name;

        plusBtn.dataset.action = "increase";
        minusBtn.dataset.action = "decrease";

        row.appendChild(name);
        row.appendChild(minusBtn);
        row.appendChild(qnty);
        row.appendChild(plusBtn);
        row.appendChild(price);

        orderTotal.appendChild(row);


    }



    const totals = getCartTotals();


    const hr = document.createElement("hr");
    orderTotal.appendChild(hr)


    const totalText = document.createElement("p");
    totalText.textContent = `Total item : ${totals.quantity},Total Price : ${formatPrice(totals.totalPrice)}`

    orderTotal.appendChild(totalText)





}






function loadCart() {

    const saved = localStorage.getItem("cafeCart");

    if (saved) {
        const parsedOrder = JSON.parse(saved);
        cart.push(...parsedOrder);
        renderCartItems();
        updateCartCount();
        updateCheckoutButton();
    }
}


loadCart();

clearCartBtn.addEventListener("click", clearCart)




orderTotal.addEventListener("click", (e) => {
    const btn = e.target;

    if (btn.tagName !== "BUTTON") return;

    const itemName = btn.dataset.name;

    const action = btn.dataset.action;

    const item = cart.find(i => i.name === itemName);

    if (!item) return;

    if (action === "increase") {
        // item.quantity += 1;
        item.quantity = item.quantity + 1;
    }

    if (action === "decrease") {
        item.quantity -= 1;

        if (item.quantity === 0) {
            const index = cart.findIndex(i => i.name === itemName);
            cart.splice(index, 1);
        }
    }

    updateCart();


});

function updateCart() {
    // 1. Render cart UI form the current state
    renderCartItems();
    // 2.persist current cart state 
    saveCart();

    // 3. sync derived UI (count , button)
    updateCartCount();
    updateCheckoutButton();
}



menuContainer.addEventListener("click", handleMenuClick)
// console.log(e.currentTarget)
// console.log(e.target)

function handleMenuClick(e) {
    if (menuLoading) {
        console.log("Menu is still loading, click ignored");
        return;
    }




    const card = (e.target.closest(".card"))



    if (!card) return;

    addItemToCart(card);

    // console.log(order)


}





// const menuData = [
//     {
//         name: "chai",
//         description: "Fresh Indian Tea",
//         price: 45
//     },
//     {
//         name: "Coffee",
//         description: "Hot brewed coffee",
//         price: 120
//     },
//     {
//         name: "Cold COffee",
//         description: "Chilled coffee with iceCream",
//         price: 150
//     }

// ]


// fetch("menu.json")

//     .then((Response) =>{


//             if(!Response.ok){
//                 throw new Error("Http Error "+Response.status);

//             }


//       return  Response.json()})


//     .then(data => {
//         renderMenu(data);
//     })


//     .catch(error => {
//         console.log("menu load error ", error)
//     })


console.log("Fetching menu...");
// fetch("menu.json")


//     .then((Response) => {



//         if (!Response.ok) {
//             throw new Error("Http Error " + Response.status);
//         }

//         return Response.json()



//     })

//     .then(data => {
//         console.log("menu fetched successfully")
//         menuLoading = false;
//         menuStatus.textContent = "";


//         renderMenu(data)
//     })

//     .catch((error) => {
//         menuLoading = false;
//         console.error("menu not render ", error);

//         menuStatus.textContent = "Failed to load menu. Please try again.";

//     })


async function loadMenu() {

    try {

        menuStatus.textContent = "Loading menu...";
        menuLoading = true;
        menuStatus.style.display = "block";
        menuContainer.classList.add("loading");



        const response = await fetch("menu.json")


        if (!response.ok) {
            throw new Error("HTTP Error " + response.status);

        }

        const data = await response.json();

        renderMenu(data);
        menuStatus.textContent = "";
        menuStatus.style.display = "none"

    } catch (error) {
        console.log("menu load failed ", error);
        menuStatus.textContent = "Failed to load menu";
    } finally {

        menuLoading = false;
        menuContainer.classList.remove("loading");
    }

}

loadMenu();










function renderMenu(menuData) {
    for (let i = 0; i < menuData.length; i++) {

        const item = menuData[i];

        const card = document.createElement("div");
        card.classList.add("card");

        const title = document.createElement("h3");
        title.textContent = item.name;

        const desc = document.createElement("p");
        desc.textContent = item.description;

        const price = document.createElement("span");
        price.textContent = formatPrice(item.price)


        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(price);


        menuContainer.appendChild(card)


    }
}









// menu.addEventListener("click",()=>{

//     menu.style.color="red"
//     console.log("menu list")
// });


// navigation.addEventListener("click",()=>{
//     console.log("nav bar clicked")
// })


checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;

    checkoutModal.classList.remove("hidden");
});


cancelcheckoutBtn.addEventListener("click", () => {
    checkoutModal.classList.add("hidden");
    checkoutError.textContent = "";
})


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


})




// function handleCheckout(){

//     if (cart.length === 0 || isCheckingOut) return;

//     isCheckingOut=true;
//     checkoutBtn.disabled=true;
//     checkoutStatus.textContent="place your order.....";
//     checkoutStatus.style.color="black";



//     fakeCheckOutApi()

//     .then(()=>{
//         cart.length=0;
//         localStorage.removeItem("cafeCart");

//         renderCartItems();
//         updateCartCount();

//         checkoutStatus.textContent="Order placed successfully";
//         checkoutStatus.style.color="green";
//     })

//     .catch(()=>{
//         checkoutStatus.textContent="Order failed try again later  ";
//         checkoutStatus.style.color="red";

//     })

//     .finally(()=>{
//         isCheckingOut=false;
//         checkoutBtn.disabled=false;
//         updateCheckoutButton(); 
//     })


// }



function placeOrder(customer) {
    isCheckingOut = true;
    confirmCheckoutBtn.disabled = true;

    fakeCheckOutApi()
        .then(() => {
            const totals = getCartTotals();


            // const newOrder = {
            //     id: Date.now(),
            //     date: new Date().toLocaleString("en-IN"),
            //     customer,
            //     items: JSON.parse(JSON.stringify(cart)),
            //     totalAmount: totals.totalPrice
            // }


            const newOrder = {
                id: Date.now(),


                meta: {
                    createdAt: new Date().toISOString(),
                    status: "PLACED",
                },



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
                    totalItems: totals.quantity,
                    totalAmount: totals.totalPrice
                }
            }


            orderHistory.unshift(newOrder);
            savedOrderHistory();

            cart.length = 0;
            localStorage.removeItem("cafeCart");
            updateCart();


            checkoutModal.classList.add("hidden");
            alert("Order Placed SuccessFully");
            renderOrderHistory();

        })

        .catch(() => {
            checkoutError.textContent = "Order failed try again later";
        })
        .finally(() => {
            isCheckingOut = false;
            confirmCheckoutBtn.disabled = false;
        })
}


function fakeCheckOutApi() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = Math.random() > 0.2;
            success ? resolve() : reject();
        }, 2000);
    });
}


function updateCheckoutButton() {
    checkoutBtn.disabled = cart.length === 0 || isCheckingOut;
}



function loadOrderHistory() {
    const saved = localStorage.getItem("cafeOrders");
    if (saved) {
        orderHistory = JSON.parse(saved)
    }
}

loadOrderHistory();
renderOrderHistory();


function savedOrderHistory() {
    localStorage.setItem("cafeOrders", JSON.stringify(orderHistory))
}



// function renderOrderHistory() {
//     orderHistoryList.textContent = "";

//     if (orderHistory.length === 0) {
//         orderHistoryList.innerHTML = "<p>No order yet</p>";
//         return;
//     }


//     orderHistory.forEach(order => {
//         const card = document.createElement("div");
//         card.classList.add("order-card");
//         card.addEventListener("click", () => {
//             showOrderDetails(order);
//         })

//         card.innerHTML = `
//         <p><strong>Order ID </strong>${order.id} </p>
//         <small>${new Date(order.meta.createdAt).toLocaleString("en-IN")}</small>
//         <p><strong>Customer:</strong>${order.customer.name} </p>
//         <p><strong>Totals:</strong>${formatPrice(order.summary.totalAmount)}</p>
//         <p><strong>Items:</strong>${order.summary.totalItems}</p>
//         <span class="status-badge status-${order.meta.status}">
//                ${order.meta.status}
//            </span>



//         `
//         orderHistoryList.appendChild(card)
//     })
// }


function renderOrderHistory() {
    orderHistoryList.textContent = "";

    let filteredOrders = orderHistory;

    if (currentFilter != "ALL") {
        filteredOrders = orderHistory.filter(order => order.meta.status === currentFilter)
    };


    if (searchQuery) {
        filteredOrders = filteredOrders.filter(order => {
            const name = order.customer.name.toLowerCase();
            const phone = order.customer.phone.toLowerCase();


            return (
                name.includes(searchQuery) ||
                phone.includes(searchQuery)

            );




        });
    }





    if (filteredOrders.length === 0) {
        orderHistoryList.innerHTML = "<p>No Order Found</p>"
        return;
    }

    filteredOrders.forEach(order => {
        const card = document.createElement("div");
        card.classList.add("order-card");



        card.innerHTML = `<p><strong>Order ID </strong>${order.id} </p>
        <small>${new Date(order.meta.createdAt).toLocaleString("en-IN")}</small>
        <p><strong>Customer:</strong>${order.customer.name} </p>
        <p><strong>Totals:</strong>${formatPrice(order.summary.totalAmount)}</p>
        <p><strong>Items:</strong>${order.summary.totalItems}</p>
        <span class="status-badge status-${order.meta.status}">
               ${order.meta.status}
           </span>`;

        card.addEventListener("click", () => {
            showOrderDetails(order);
        });

        orderHistoryList.appendChild(card)
    });
}




function showOrderDetails(order) {
    currentOrder = order;

    orderDetailsBox.classList.remove("hidden");
    orderDetailsContent.textContent = "";



    let html = `
    <p><strong>Order ID:</strong>${order.id}</p>
    <p><strong>Customer:</strong>${order.customer.name}</p>
    <p><strong>Phone:</strong>${order.customer.phone}</p>
    <p><strong>Address:</strong>${order.customer.address}</p>
    <span class="status-badge status-${order.meta.status}">
         ${order.meta.status}
        </span>

    <hr/>
    `;

    order.items.forEach(item => {
        html += `
        <p>
        ${item.name} x ${item.quantity}
        =${formatPrice(item.price * item.quantity)}
        </p>
        
        `;
    })

    html += `<hr/> <p><strong>Total:</strong>${formatPrice(order.summary.totalAmount)}</p>`;

    orderDetailsContent.innerHTML = html;



}


closeOrderDetailsBtn.addEventListener("click", () => {
    orderDetailsBox.classList.add("hidden");
})


document.querySelector(".order-actions").addEventListener("click", (e) => {
    if (!e.target.dataset.status || !currentOrder) return;


    currentOrder.meta.status = e.target.dataset.status;
    savedOrderHistory();


    renderOrderHistory();

    showOrderDetails(currentOrder);
})




document.querySelector(".order-filters").addEventListener("click", (e) => {
    if (!e.target.dataset.filter) return;

    currentFilter = e.target.dataset.filter;
    renderOrderHistory();
});

orderSearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderOrderHistory();
});

