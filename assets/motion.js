// Soully motion: Lenis smooth scrolling, scroll-triggered reveals and parallax.
// Markup hooks:
//   data-split              headline; words rise one by one when it enters the viewport
//   data-reveal             block fades/rises in   (="mask" unmasks an image, ="line" draws a rule)
//   style="--d:120ms"       extra delay for a reveal
//   data-parallax="0.1"     moves at a different speed than the page (sets --py on the element)
import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
window.__motionReady = true;

export const lenis = reduce ? null : new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.95,
  touchMultiplier: 1.5,
});
if (lenis) window.lenis = lenis;

// ---- split headlines into words ----
function split(el) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span"); w.className = "w";
          const wi = document.createElement("span"); wi.className = "wi"; wi.style.setProperty("--i", i++);
          wi.textContent = part; w.appendChild(wi); frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== "BR" && !child.classList.contains("w")) {
        walk(child);
      }
    });
  };
  walk(el);
}
document.querySelectorAll("[data-split]").forEach(split);

// ---- stripe bands: fill with as many lines as fit; they grow from the centre outwards ----
function fillStripes(band) {
  const cs = getComputedStyle(band), sw = parseFloat(cs.getPropertyValue("--sw")) || 22, sg = parseFloat(cs.getPropertyValue("--sg")) || 18;
  const n = Math.ceil(band.clientWidth / (sw + sg)) + 1, mid = (n - 1) / 2;
  band.innerHTML = Array.from({ length: n }, (_, k) => `<i style="--i:${Math.abs(k - mid).toFixed(0)}"></i>`).join("");
}
const bands = [...document.querySelectorAll(".stripe-band")];
bands.forEach(fillStripes);
let bandW = innerWidth;
addEventListener("resize", () => { if (Math.abs(innerWidth - bandW) > 40) { bandW = innerWidth; bands.forEach(fillStripes); } });

// ---- buttons: wrap label + arrow so hover can roll them ----
document.querySelectorAll(".btn, [data-roll]").forEach((btn) => {
  btn.classList.add("roll-btn");
  [...btn.childNodes].forEach((n) => {
    if (n.nodeType === 3 && n.textContent.trim()) {
      const t = n.textContent.trim();
      const r = document.createElement("span"); r.className = "roll";
      r.innerHTML = `<span class="roll-in" data-t="${t.replace(/"/g, "&quot;")}">${t}</span>`;
      n.replaceWith(r);
    } else if (n.nodeType === 1 && n.tagName === "svg") {
      const w = document.createElement("span"); w.className = "roll-arr"; n.replaceWith(w); w.appendChild(n);
    }
  });
});

// ---- reveal on scroll ----
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
document.querySelectorAll("[data-split], [data-reveal], .stripe-band").forEach((el) => {
  // anything already on screen at load plays its entrance right away
  if (el.getBoundingClientRect().top < innerHeight) requestAnimationFrame(() => el.classList.add("in"));
  else io.observe(el);
});

// ---- parallax ----
const para = [...document.querySelectorAll("[data-parallax]")];
function parallax() {
  if (reduce) return;
  const vh = innerHeight;
  for (const el of para) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    const speed = parseFloat(el.dataset.parallax) || 0.1;
    const off = (r.top + r.height / 2 - vh / 2) * speed;
    el.style.setProperty("--py", `${off.toFixed(1)}px`);
  }
}

// ---- one animation loop for smooth scroll + parallax ----
function frame(t) { lenis && lenis.raf(t); parallax(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);

// ---- in-page links glide instead of jumping ----
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  if (id.length < 2) return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.6 });
  else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  history.replaceState(null, "", id);
});
