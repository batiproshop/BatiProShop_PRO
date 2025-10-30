
export const CART_KEY = 'bp_cart';

export function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}
export function saveCart(c){
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  updateCartCount();
}
export function addToCart(id, qty=1){
  const cart = getCart();
  const i = cart.findIndex(x=>x.id===id);
  if(i>-1) cart[i].qty += qty; else cart.push({id, qty});
  saveCart(cart);
}
export function removeFromCart(id){
  saveCart(getCart().filter(i=>i.id!==id));
}
export function setQty(id, qty){
  const cart = getCart();
  const i = cart.findIndex(x=>x.id===id);
  if(i>-1){
    cart[i].qty = Math.max(1, qty);
    saveCart(cart);
  }
}
export async function productsIndex(){
  const res = await fetch('/data/products.json');
  const data = await res.json();
  return Object.fromEntries((data.items||[]).map(p=>[p.id,p]));
}
export async function updateCartCount(){
  const el = document.getElementById('cart-count');
  if(!el) return;
  const total = getCart().reduce((s,i)=>s+i.qty,0);
  el.textContent = total>0 ? total : '0';
}
document.addEventListener('DOMContentLoaded', updateCartCount);
