// ---- Datos completos (para el scatter) ----
const records = [
["2026-06-04","Narvarte",24],["2026-06-10","Narvarte",25],["2026-06-10","Narvarte",27],
["2026-06-10","Narvarte",16],["2026-06-10","Narvarte",21],["2026-06-15","Narvarte",50],
["2026-06-17","Toluca",38],["2026-06-17","Narvarte",57],["2026-06-17","Narvarte",27],
["2026-06-17","Narvarte",35],["2026-06-17","Narvarte",27],["2026-06-18","Narvarte",10],
["2026-06-18","Narvarte",69],["2026-06-18","Narvarte",48],["2026-06-19","Toluca",78],
["2026-06-19","Toluca",11],["2026-06-22","Narvarte",99],["2026-06-22","Narvarte",17],
["2026-06-22","Narvarte",5],["2026-06-23","Narvarte",22],["2026-06-23","Toluca",93],
["2026-06-24","Narvarte",109],["2026-06-25","Toluca",32],["2026-06-25","Narvarte",47],
["2026-06-25","Narvarte",30],["2026-06-26","Narvarte",49],["2026-06-26","Narvarte",54],
["2026-06-27","Narvarte",103],["2026-07-02","Narvarte",58],["2026-07-02","Narvarte",55],
["2026-07-02","Narvarte",108],["2026-07-02","Narvarte",168],["2026-07-02","Toluca",55],
["2026-07-06","Toluca",26],["2026-07-07","Tijuana",187],["2026-07-07","Tijuana",249],
["2026-07-07","Morelia",66],["2026-07-09","Narvarte",16],["2026-07-09","Narvarte",59],
["2026-07-09","Narvarte",69],["2026-07-09","Narvarte",75],["2026-07-09","Narvarte",12],
["2026-07-09","Narvarte",76],["2026-07-09","Toluca",47],["2026-07-10","Narvarte",11],
["2026-07-13","Narvarte",37],["2026-07-13","Narvarte",14],["2026-07-13","Narvarte",120],
["2026-07-14","Toluca",338],["2026-07-14","Narvarte",20],["2026-07-14","Morelia",77],
["2026-07-14","Narvarte",6],["2026-07-14","Narvarte",15],["2026-07-16","Narvarte",32],
["2026-07-16","Narvarte",33],["2026-07-17","Narvarte",96]
];
const colors = { Narvarte:"#1E6F63", Toluca:"#E2A63B", Morelia:"#7C8FE0", Tijuana:"#D6524A" };

// ---- Count-up del hero ----
function countUp(el, target, dur){
  const start = performance.now();
  function tick(now){
    const p = Math.min((now-start)/dur, 1);
    const eased = 1 - Math.pow(1-p, 3);
    const val = (target*eased).toFixed(1);
    el.innerHTML = val + '<sup>min</sup>';
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
window.addEventListener('load', ()=>{
  countUp(document.getElementById('heroNum'), 47.8, 1800);
});

// ---- Reveal + bar fills on scroll ----
const revealTargets = document.querySelectorAll('.kpi, .bar-fill, .branch-fill');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el = e.target;
      if(el.classList.contains('kpi')) el.classList.add('show');
      if(el.classList.contains('bar-fill') || el.classList.contains('branch-fill')){
        el.style.width = el.dataset.w + '%';
      }
      io.unobserve(el);
    }
  });
}, {threshold:0.3});
revealTargets.forEach(t=>io.observe(t));

// ---- Scatter timeline (SVG dibujado a mano) ----
const svg = document.getElementById('scatter');
const W = 1000, H = 340, padL = 40, padR = 20, padT = 20, padB = 40;
const dates = records.map(r=>new Date(r[0]).getTime());
const minD = Math.min(...dates), maxD = Math.max(...dates);
const maxVal = Math.max(...records.map(r=>r[2]));

function xFor(d){ return padL + (d-minD)/(maxD-minD) * (W-padL-padR); }
function yFor(v){ return H-padB - (v/maxVal) * (H-padT-padB); }

let svgContent = '';
// grid lines (y axis at 0,60,120,180,240,300)
[0,60,120,180,240,300].forEach(v=>{
  if(v>maxVal+20) return;
  const y = yFor(v);
  svgContent += `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#DCE3DD" stroke-width="1"/>`;
  svgContent += `<text x="4" y="${y+4}" font-family="IBM Plex Mono, monospace" font-size="10" fill="#7C8B80">${v}</text>`;
});
// month divider
const julyStart = new Date("2026-07-01").getTime();
const xJuly = xFor(julyStart);
svgContent += `<line x1="${xJuly}" y1="${padT}" x2="${xJuly}" y2="${H-padB}" stroke="#B9C7B7" stroke-width="1" stroke-dasharray="3,4"/>`;
svgContent += `<text x="${xJuly+6}" y="${padT+12}" font-family="IBM Plex Mono, monospace" font-size="10" fill="#7C8B80">JUL</text>`;

records.forEach((r,i)=>{
  const x = xFor(new Date(r[0]).getTime());
  const y = yFor(r[2]);
  const c = colors[r[1]];
  svgContent += `<circle cx="${x}" cy="${y}" r="0" fill="${c}" fill-opacity="0.85" class="pt" data-r="${r[2] > 150 ? 6.5 : 4.5}" style="transition:r .5s ease ${i*0.012}s"><title>${r[1]} · ${r[2]} min</title></circle>`;
});
svg.innerHTML = svgContent;

const io2 = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll('#scatter .pt').forEach(p=>{
        p.setAttribute('r', p.dataset.r);
      });
      io2.unobserve(e.target);
    }
  });
}, {threshold:0.2});
io2.observe(svg);
