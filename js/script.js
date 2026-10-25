/* ===== CONFIG (edite aqui) ===== */
const WHATSAPP = "5521967597015";
const MSG_PADRAO = "Olá! Vim pelo site e gostaria de agendar um horário.";

const PRECOS = [
  { titulo: "Trança Nagô", itens: [["Lateral", 30], ["Topo", 25], ["Tiara", 40], ["Cabeça toda", 60]] },
  { titulo: "Trança Jumbo", itens: [["Box braids", 150, "mais pedido"], ["Gypsy braids", 130], ["Boxiadora", 55], ["Twist", 160]] },
  { titulo: "Penteados", itens: [["Teterê", 25], ["P/ simples", 20]] }
];

// Lista de fotos da galeria (adicione ou remova linhas à vontade)
const GALERIA = Array.from({ length: 8 }, (_, i) => ({
  src: `assets/galeria/galeria-${i + 1}.png`,
  alt: "Trabalho de trança feito pelo Nego Trancista"
}));

/* ===== Utilitários ===== */
const $ = (s, el = document) => el.querySelector(s);
const wa = (texto = MSG_PADRAO) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
const brl = n => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ===== WhatsApp ===== */
document.querySelectorAll("[data-wa]").forEach(a => { a.href = wa(); a.target = "_blank"; a.rel = "noopener"; });

/* ===== Preços ===== */
$("#precos").innerHTML = PRECOS.map(c => `
  <article class="card"><h3>${c.titulo}</h3><ul>${c.itens.map(([n, p, t]) => `
    <li><span>${n}${t ? `<span class="tag">${t}</span>` : ""}</span>
    <span><span class="price">${brl(p)}</span>
    <a class="mini" target="_blank" rel="noopener" href="${wa(`Olá! Gostaria de agendar ${n}.`)}">Agendar</a></span></li>`).join("")}
  </ul></article>`).join("");

/* ===== Lightbox ===== */
const lb = $("#lb"), lbImg = $("#lbImg");
let lista = [], idx = 0;
function abrir(imgs, i) {
  lista = imgs; idx = i; lbImg.src = lista[i].src; lbImg.alt = lista[i].alt || "";
  lb.hidden = false; $("#lbX").focus();
  document.querySelectorAll(".lb-n").forEach(b => b.style.display = lista.length > 1 ? "" : "none");
}
const fechar = () => { lb.hidden = true; };
const nav = d => { idx = (idx + d + lista.length) % lista.length; lbImg.src = lista[idx].src; lbImg.alt = lista[idx].alt || ""; };
$("#lbX").onclick = fechar; $("#lbP").onclick = () => nav(-1); $("#lbN").onclick = () => nav(1);
lb.onclick = e => { if (e.target === lb) fechar(); };
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") fechar();
  if (e.key === "ArrowLeft") nav(-1);
  if (e.key === "ArrowRight") nav(1);
});
let x0 = 0;
lb.addEventListener("touchstart", e => x0 = e.touches[0].clientX);
lb.addEventListener("touchend", e => { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 50) nav(d > 0 ? -1 : 1); });
$("#abrirTabela").onclick = () => abrir([{ src: "assets/tabela.png", alt: "Tabela de valores do Nego Trancista" }], 0);

/* ===== Galeria (com botão "Quero igual a esse") ===== */
GALERIA.forEach((f, i) => {
  const item = document.createElement("div");
  item.className = "g-item";

  const b = document.createElement("button");
  b.className = "item"; b.setAttribute("aria-label", "Ampliar foto " + (i + 1));

  const quero = document.createElement("a");
  quero.className = "btn btn-wa btn-want";
  quero.textContent = "Quero igual a esse";
  quero.target = "_blank"; quero.rel = "noopener";
  // link público da foto, para o Nego ver exatamente qual modelo foi escolhido
  const url = new URL(f.src, location.href).href;
  quero.href = wa(`Olá, Nego! Vi este modelo na galeria do site e quero igual a esse: ${url}`);

  const img = new Image();
  img.src = f.src; img.alt = f.alt; img.loading = "lazy"; img.width = 600; img.height = 800;
  img.onerror = () => {
    b.innerHTML = '<div class="ph"><b>✦</b>Foto em breve</div>';
    item.classList.add("sem-foto"); // esconde o botão quando a foto não existe
  };
  b.appendChild(img); b.onclick = () => abrir(GALERIA, i);

  item.append(b, quero);
  $("#grid").appendChild(item);
});

/* ===== Header, menu, scrollspy, topo ===== */
const header = $("#header"), burger = $("#burger"), menu = $("#nav"), topo = $("#topo");
addEventListener("scroll", () => { header.classList.toggle("scrolled", scrollY > 30); topo.hidden = scrollY < 600; }, { passive: true });
burger.onclick = () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
menu.addEventListener("click", e => { if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });
topo.onclick = () => scrollTo({ top: 0 });
const links = [...menu.querySelectorAll('a[href^="#"]')];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach(s => spy.observe(s));

/* ===== Entrada ao rolar + contadores ===== */
document.querySelectorAll(".section .wrap").forEach(w => w.classList.add("reveal"));
const rev = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("show"); rev.unobserve(e.target);
  e.target.querySelectorAll("[data-count]").forEach(contar);
}), { threshold: .15 });
document.querySelectorAll(".reveal").forEach(r => rev.observe(r));
function contar(el) {
  const alvo = +el.dataset.count, plus = "plus" in el.dataset;
  const t0 = performance.now(), dur = 1200;
  (function f(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = (plus ? "+" : "") + Math.round(alvo * p);
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}

$("#ano").textContent = new Date().getFullYear();