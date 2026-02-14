const KEY="cafeOrders";


export function saveOrder(order){

    const orders=loadOrders();
    orders.unshift(order);
    localStorage.setItem(KEY,JSON.stringify(orders));
}



export function loadOrders(){
    const saved=localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
}