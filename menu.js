firebase.initializeApp({
  apiKey:            "AIzaSyAnGlUohpRnIIcHjVncAHk1_ese5ctxg1g",
  authDomain:        "mexitan-pos.firebaseapp.com",
  projectId:         "mexitan-pos",
  storageBucket:     "mexitan-pos.firebasestorage.app",
  messagingSenderId: "1065490991103",
  appId:             "1:1065490991103:web:969f95df4cd203aef849ca"
});
const db = firebase.firestore();

// Detecta a qué sección pertenece una categoría por palabras clave.
// Normaliza el nombre: minúsculas, sin acentos, guiones convertidos a espacio.
// Así funciona sin importar cómo exactamente esté escrito en Firestore.
const SECTION_RULES = [
  { id: 'burger',    keywords: ['burger', 'hamburgues'] },
  { id: 'pakistan',  keywords: ['pakistan', 'chai', 'pakora', 'lassi', 'rooh', 'doodh', 'kadak', 'masala', 'adrak', 'dalchini', 'elaichi', 'gud wali', 'cold drink'] },
  { id: 'bebidas',   keywords: ['bebida', 'cafe', 'coffee', 'capucho', 'chocolate', 'nescafe', 'expres', 'americano', 'frap', 'malteada', 'agua', 'herbal', 'infus', 'te negro', 'te verde', 'te de', 'ponche', 'chamoyada', 'aguas frescas'] },
  { id: 'antojitos', keywords: ['antojito', 'burrito', 'mollete', 'quesocarne', 'hot dog', 'boneless', 'crepa', 'waffle', 'hot cake', 'pan fran', 'nacho', 'enchilad', 'sincroni', 'banderill', 'salada'] },
  { id: 'comida',    keywords: ['comida', 'chilaquil', 'huevo', 'sandwich', 'papa', 'salchipulp', 'alita'] },
];

function normalize(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[—–\-]/g, ' ');                         // normalizar guiones
}

function getSectionId(catName) {
  const n = normalize(catName);
  for (const rule of SECTION_RULES) {
    if (rule.keywords.some(kw => n.includes(kw))) return rule.id;
  }
  return null; // va a "Otros"
}

// Secciones de la página en orden
const PAGE_SECTIONS = [
  { id: 'comida',    title: 'Menú de Comida' },
  { id: 'antojitos', title: 'Antojitos y Más' },
  { id: 'burger',    title: 'Burgers' },
  { id: 'pakistan',  title: 'Menú de Pakistán' },
  { id: 'bebidas',   title: 'Bebidas' },
];

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderItem(item) {
  const price = item.p ? `<span class="item-price">$${item.p}</span>` : '';
  return `<div class="menu-item">
    <span class="item-name">${escHtml(item.n)}</span>
    ${price}
  </div>`;
}

function renderItems(items) {
  if (!items || !items.length) return '';
  if (items.length >= 5) {
    const mid   = Math.ceil(items.length / 2);
    const left  = items.slice(0, mid);
    const right = items.slice(mid);
    return `<div class="two-col">
      <div>${left.map(renderItem).join('')}</div>
      <div>${right.map(renderItem).join('')}</div>
    </div>`;
  }
  return items.map(renderItem).join('');
}

function renderMenu(categorias) {
  const bySection = {};
  PAGE_SECTIONS.forEach(s => { bySection[s.id] = []; });
  const extras = [];

  categorias.forEach(cat => {
    const sid = getSectionId(cat.cat);
    if (sid) bySection[sid].push(cat);
    else     extras.push(cat);
  });

  let html = '';

  PAGE_SECTIONS.forEach(sec => {
    const cats = bySection[sec.id];
    if (!cats.length) return;

    html += `<section class="page-section" id="${sec.id}">
      <h2 class="page-title">${escHtml(sec.title)}</h2>`;

    cats.forEach((cat, ci) => {
      html += `<div class="menu-section">
        <div class="section-label">${escHtml(cat.cat)}</div>
        ${renderItems(cat.items)}
      </div>`;
      if (ci === 0 && cats.length > 1 &&
          (sec.id === 'comida' || sec.id === 'antojitos' || sec.id === 'bebidas')) {
        html += '<div class="divider"></div>';
      }
    });

    html += '</section>';
  });

  // Categorías sin sección asignada
  if (extras.length) {
    html += `<section class="page-section" id="otros"><h2 class="page-title">Otros</h2>`;
    extras.forEach(cat => {
      html += `<div class="menu-section">
        <div class="section-label">${escHtml(cat.cat)}</div>
        ${renderItems(cat.items)}
      </div>`;
    });
    html += '</section>';

    const a = document.createElement('a');
    a.href = '#otros';
    a.textContent = 'Otros';
    document.getElementById('main-nav').appendChild(a);
  }

  document.getElementById('menu-root').innerHTML = html;
}

async function init() {
  try {
    const doc = await db.collection('config').doc('menu').get();
    if (doc.exists && doc.data().categorias && doc.data().categorias.length) {
      renderMenu(doc.data().categorias);
    } else {
      document.getElementById('menu-root').innerHTML =
        '<div class="menu-status">El menú no está disponible en este momento.</div>';
    }
  } catch (e) {
    document.getElementById('menu-root').innerHTML =
      '<div class="menu-status">No se pudo cargar el menú.<br><small style="font-size:0.75rem;opacity:0.6">Intenta recargar la página.</small></div>';
  }
}

init();
