// protect admin dashboard

if(!localStorage.getItem("adminToken")){
    window.location.href="./admin_loginPage.html";
}




async function loadOrders() {
    const res = await fetch("https://cafe-backend-yy7e.onrender.com/orders");
    const data = await res.json();

    if (!data.success) return;

    renderOrders(data.orders);

}


const statusFlow = {
    PENDING: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: []
};

const ALL_STATUSES = [
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED"
];


// loadOrders();

// // Auto refresh order status every 5 seconds
setInterval(() => {
    loadOrders();
}, 5000);




function renderOrders(orders) {
    const container = document.getElementById("admin-orders");

    container.innerHTML = "";


    orders.forEach(order => {

        const div = document.createElement("div");

        const itemsHtml = order.items
            .map(item => `<li class="order-item">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">x ${item.quantity}</span> </li>`)
            .join("");

        // div.innerHTML = `
        //     <p><b>Order</b> ${order.id}</p>
        //     <p><strong>Name:</strong>${order.customer.name}</p>
        //      <p><strong>Phone:</strong>${order.customer.phone}</p>

        //      <div class="order-items">
        //      <p><strong> Items</strong></p>
        //     <ul class="items-list"> ${itemsHtml} 
        //         </ul>

        //         </div>
        //           <p class="order-total"><strong>Total:</strong>${order.summary.totalAmount}</p>  
        //         <small>${new Date(order.createdAt).toLocaleString()}</small>

        //         <hr/>

        //     <button onclick="updateStatus(${order.id},'PREPARING')">PREPARING</button>
        //     <button onclick="updateStatus(${order.id},'READY')">READY</button>
        //     <button onclick="updateStatus(${order.id},'COMPLETED')">COMPLETED</button>
        //     <button onclick="updateStatus(${order.id},'CANCELLED')">CANCELLED</button>

        //     <hr/>
        //     `;


        // rule aware part 
        const allowedStatus = statusFlow[order.status] || [];
        let buttonsHtml = "";

        ALL_STATUSES.forEach(status => {
            const isAllowed = allowedStatus.includes(status);

            buttonsHtml += `
        <button
            onclick="updateStatus('${order._id}', '${status}')"
            ${isAllowed ? "" : "disabled"}
            style="${isAllowed ? "" : "opacity:0.4; cursor:not-allowed;"}"
        >
            ${status}
        </button>
    `;
        });


        div.innerHTML = `
            <p><b>Order:</b> ${order._id}</p>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>

            <div class="order-items">
                <p><strong>Items</strong></p>
                <ul class="items-list">${itemsHtml}</ul>
            </div>

            <p class="order-total">
                <strong>Total:</strong> ₹${order.summary.totalAmount}
            </p>

            <small>${new Date(order.createdAt).toLocaleString()}</small>
            <hr/>

            ${buttonsHtml}

            <hr/>
        `;





        container.appendChild(div);
    })
}



// async function updateStatus(orderId, status) {
//     const res = await fetch(
//         `http://localhost:5000/orders/${orderId}/status`,
//         {
//             method: "PATCH",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ status })
//         }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//         alert(data.message);
//         return;
//     }

//     loadOrders(); // admin list refresh
// }



async function updateStatus(orderId, status) {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(
        `https://cafe-backend-yy7e.onrender.com/orders/${orderId}/status`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        }
    );

    const data = await res.json();

    if (res.status === 401) {
    alert("Session expired. Please login again.");
    localStorage.removeItem("adminToken");
    window.location.href = "./admin_loginPage.html";
    return;
 }



    if (!res.ok) {
        alert(data.message);
        return;
    }

    loadOrders();
}



function logout(){
    localStorage.removeItem("adminToken");
    window.location.href="./admin_loginPage.html";
}