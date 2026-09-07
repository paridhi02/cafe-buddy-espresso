export type OrderStatus='RECEIVED'|'ACCEPTED'|'PREPARING'|'READY'|'COMPLETED'|'CANCELLED';
export type OrderItem={menuItemId:number;name:string;qty:number;unitPrice:number;prepMinutes:number};
export type Order={id:string;table:number;items:OrderItem[];status:OrderStatus;paymentStatus:'PENDING'|'PAID';total:number;etaMinutes:number;createdAt:string;note?:string};
const KEY='cbe_demo_orders_v1';
export function getOrders():Order[]{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
export function saveOrders(orders:Order[]){localStorage.setItem(KEY,JSON.stringify(orders))}
export function createOrder(o:Omit<Order,'id'|'createdAt'>):Order{const order={...o,id:`CB${Date.now().toString().slice(-6)}`,createdAt:new Date().toISOString()};const all=getOrders();all.unshift(order);saveOrders(all);return order}