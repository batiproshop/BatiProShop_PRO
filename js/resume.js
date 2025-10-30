
import { getCart, productsIndex } from './cart.js';

async function generateResumePDF(order, lines, total, settings){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;
  doc.setFontSize(14);
  doc.text(settings.company_name || 'BatiProShop', 10, y); y+=6;
  doc.setFontSize(10);
  doc.text((settings.legal_form || 'SASU') + '  Capital: ' + (settings.capital||''), 10, y); y+=5;
  if(settings.siren){ doc.text('SIREN: ' + settings.siren, 10, y); y+=5; }
  if(settings.tva_intra){ doc.text('TVA: ' + settings.tva_intra, 10, y); y+=5; }
  if(settings.address){ doc.text('Adresse: ' + settings.address, 10, y); y+=5; }
  if(settings.email){ doc.text('Email: ' + settings.email, 10, y); y+=5; }
  if(settings.phone){ doc.text('Téléphone: ' + settings.phone, 10, y); y+=8; }

  doc.setFontSize(12);
  doc.text('RÉCAPITULATIF DE COMMANDE', 10, y); y+=8;
  doc.setFontSize(10);
  doc.text('Client: ' + order.nom, 10, y); y+=5;
  doc.text('Email: ' + order.email, 10, y); y+=5;
  doc.text('Adresse: ' + order.adresse, 10, y); y+=5;
  const date = new Date().toLocaleString('fr-FR');
  doc.text('Date: ' + date, 10, y); y+=8;

  doc.text('Produits:', 10, y); y+=6;
  lines.forEach(l=>{ 
    doc.text(`- ${l.name} x${l.qty} → ${l.line.toFixed(2)} €`, 12, y);
    y+=5;
  });
  y+=4;
  doc.text('Total TTC: ' + total.toFixed(2) + ' €', 10, y); y+=5;

  y+=6;
  doc.setFontSize(9);
  doc.text('Ce document n’est pas une facture officielle. Une facture conforme vous sera transmise séparément.', 10, y);

  return doc.output('blob');
}

document.getElementById('orderForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const order = Object.fromEntries(fd.entries());

  const settings = await fetch('/data/settings.json').then(r=>r.json());
  const idx = await productsIndex();
  const cart = getCart();
  if(cart.length===0){ document.getElementById('orderStatus').textContent='Panier vide.'; return; }

  const lines = cart.map(item => {
    const p = idx[item.id];
    const line = p.price_ttc * item.qty;
    return { name: `${p.brand} — ${p.name}`, qty: item.qty, line };
  });
  const total = lines.reduce((s,l)=>s+l.line,0);

  // Generate PDF Recap
  const pdfBlob = await generateResumePDF(order, lines, total, settings);
  const pdfFile = new File([pdfBlob], 'resume-commande.pdf', { type: 'application/pdf' });

  if(!settings.formspree_endpoint){
    document.getElementById('orderStatus').textContent='Commande créée (mode démo). Configurez Formspree dans /admin.';
    localStorage.removeItem('bp_cart');
    window.location.href = '/success.html';
    return;
  }

  const sendData = new FormData();
  sendData.append('nom', order.nom);
  sendData.append('email', order.email);
  sendData.append('adresse', order.adresse);
  sendData.append('notes', order.notes||'');
  sendData.append('total', total.toFixed(2) + ' € TTC');
  sendData.append('resume_pdf', pdfFile);

  const res = await fetch(settings.formspree_endpoint, { method:'POST', body: sendData, headers: { 'Accept':'application/json' } });
  if(res.ok){
    document.getElementById('orderStatus').textContent='Commande envoyée ✔';
    localStorage.removeItem('bp_cart');
    window.location.href = '/success.html';
  } else {
    document.getElementById('orderStatus').textContent='Erreur d’envoi. Vérifiez le paramètre Formspree dans /admin.';
  }
});
