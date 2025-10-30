
import { addToCart } from './cart.js';

export async function renderCategory(category){
  const res = await fetch('/data/products.json');
  const data = await res.json();
  const items = (data.items||[]).filter(p=>p.category===category);
  const grid = document.getElementById('product-grid');
  const search = document.getElementById('search');
  
  function priceBlock(p){
    const now = `${p.price_ttc.toFixed(2)} € TTC`;
    if(p.promo && p.promo.active && p.promo.price_old>0){
      return `<div class="price"><b>${now}</b><span class="old">${p.promo.price_old.toFixed(2)} €</span><span class="badge">Promo</span></div>`;
    }
    return `<div class="price"><b>${now}</b></div>`;
  }

  function card(p){
    return `<article class="card product">
      <div>
        <img src="/${p.image}" alt="${p.brand} ${p.name}">
      </div>
      <div>
        <h2>${p.brand} — ${p.name}</h2>
        <div class="meta">TVA ${(p.tva*100)|0}%</div>
        ${priceBlock(p)}
        <div class="controls">
          <input type="number" value="1" min="1" class="qty" data-id="${p.id}">
          <button class="btn add" data-id="${p.id}">Ajouter au panier</button>
        </div>
        ${p.short_desc ? `<details class="desc"><summary>Description</summary><p>${p.short_desc}</p></details>`: ''}
      </div>
    </article>`;
  }

  function draw(list){
    grid.innerHTML = list.map(card).join('');
  }
  draw(items);

  grid.addEventListener('click',(e)=>{
    const btn = e.target.closest('.add'); if(!btn) return;
    const id = btn.dataset.id;
    const qty = parseInt(grid.querySelector(`.qty[data-id="${id}"]`)?.value||'1',10);
    addToCart(id, qty);
    btn.textContent='Ajouté ✓'; setTimeout(()=>btn.textContent='Ajouter au panier', 900);
  });

  if(search){
    search.addEventListener('input', (e)=>{
      const q = e.target.value.toLowerCase();
      draw(items.filter(p=> (p.name+p.brand+(p.subcategory||'')).toLowerCase().includes(q) ));
    });
  }
}
