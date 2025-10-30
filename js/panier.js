
import { getCart, setQty, removeFromCart, productsIndex, updateCartCount } from './cart.js';

function line(p, item){
  const sum = p.price_ttc * item.qty;
  return `<tr data-id="${p.id}">
    <td>${p.brand} — ${p.name}</td>
    <td>${p.price_ttc.toFixed(2)} €</td>
    <td>
      <button class="qminus">−</button>
      <span class="q">${item.qty}</span>
      <button class="qplus">+</button>
    </td>
    <td class="sum">${sum.toFixed(2)} €</td>
    <td><button class="remove">🗑</button></td>
  </tr>`;
}

async function render(){
  const idx = await productsIndex();
  const cart = getCart();
  const tbody = document.querySelector('#cartTable tbody');
  tbody.innerHTML = cart.map(i=>line(idx[i.id], i)).join('');
  const total = cart.reduce((s,i)=> s + idx[i.id].price_ttc * i.qty, 0);
  document.getElementById('total').textContent = total.toFixed(2) + ' € TTC';
  updateCartCount();
}

document.addEventListener('click', (e)=>{
  const tr = e.target.closest('tr[data-id]'); if(!tr) return;
  const id = tr.dataset.id;
  if(e.target.matches('.qplus')) { setQty(id, parseInt(tr.querySelector('.q').textContent,10)+1); render(); }
  if(e.target.matches('.qminus')){ setQty(id, parseInt(tr.querySelector('.q').textContent,10)-1); render(); }
  if(e.target.matches('.remove')){ removeFromCart(id); render(); }
});

document.addEventListener('DOMContentLoaded', render);
