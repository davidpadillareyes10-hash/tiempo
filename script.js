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
  svgContent += `<text x="4" y="${y+4}" font-family="Montserrat, Arial, sans-serif" font-size="10" fill="#7C8B80">${v}</text>`;
});
// month divider
const julyStart = new Date("2026-07-01").getTime();
const xJuly = xFor(julyStart);
svgContent += `<line x1="${xJuly}" y1="${padT}" x2="${xJuly}" y2="${H-padB}" stroke="#B9C7B7" stroke-width="1" stroke-dasharray="3,4"/>`;
svgContent += `<text x="${xJuly+6}" y="${padT+12}" font-family="Montserrat, Arial, sans-serif" font-size="10" fill="#7C8B80">JUL</text>`;

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

// ---- Gráfica de horarios (promedio diario, estilo "site traffic") ----
// Promedio de hora de solicitud / hora de respuesta por día (formato decimal 0-24)
const dailyHours = [
  {date:"2026-06-04", solicitud:11.383, respuesta:11.783},
  {date:"2026-06-10", solicitud:14.658, respuesta:15.029},
  {date:"2026-06-15", solicitud:10.95,  respuesta:11.783},
  {date:"2026-06-17", solicitud:14.54,  respuesta:15.047},
  {date:"2026-06-18", solicitud:12.283, respuesta:12.889},
  {date:"2026-06-19", solicitud:11.508, respuesta:12.25},
  {date:"2026-06-22", solicitud:12.844, respuesta:13.056},
  {date:"2026-06-23", solicitud:11.867, respuesta:12.617},
  {date:"2026-06-24", solicitud:9.917,  respuesta:10.65},
  {date:"2026-06-25", solicitud:13.394, respuesta:13.939},
  {date:"2026-06-26", solicitud:16.933, respuesta:17.792},
  {date:"2026-06-27", solicitud:11.983, respuesta:13.7},
  {date:"2026-07-02", solicitud:11.263, respuesta:12.707},
  {date:"2026-07-06", solicitud:13.4,   respuesta:13.833},
  {date:"2026-07-07", solicitud:14.328, respuesta:16.172},
  {date:"2026-07-09", solicitud:13.095, respuesta:13.8},
  {date:"2026-07-10", solicitud:12.1,   respuesta:12.283},
  {date:"2026-07-13", solicitud:11.406, respuesta:12.211},
  {date:"2026-07-14", solicitud:12.833, respuesta:13.973},
  {date:"2026-07-16", solicitud:12.167, respuesta:12.592},
  {date:"2026-07-17", solicitud:9.75,   respuesta:10.6}
];

(function(){
  const svg = document.getElementById('trafficChart');
  const wrap = document.getElementById('trafficWrap');
  const xAxis = document.getElementById('trafficXAxis');
  const tooltip = document.getElementById('trafficTooltip');
  const ttSol = document.getElementById('ttSol');
  const ttResp = document.getElementById('ttResp');
  const ttDate = document.getElementById('ttDate');
  if(!svg) return;

  const W = 1000, H = 400, padL = 46, padR = 20, padT = 24, padB = 26;
  const n = dailyHours.length;
  const minH = 8, maxH = 18; // ventana horaria mostrada 08:00 - 18:00

  const xFor = i => padL + (i/(n-1)) * (W-padL-padR);
  const yFor = h => (H-padB) - ((Math.min(Math.max(h,minH),maxH)-minH)/(maxH-minH)) * (H-padT-padB);

  const solPts = dailyHours.map((d,i)=>[xFor(i), yFor(d.solicitud)]);
  const respPts = dailyHours.map((d,i)=>[xFor(i), yFor(d.respuesta)]);

  // Suavizado tipo Catmull-Rom -> Bezier, igual que la referencia de "site traffic"
  function smoothPath(pts){
    if(pts.length<2) return '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for(let i=0;i<pts.length-1;i++){
      const p0 = pts[i-1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i+1];
      const p3 = pts[i+2] || p2;
      const c1x = p1[0] + (p2[0]-p0[0])/6;
      const c1y = p1[1] + (p2[1]-p0[1])/6;
      const c2x = p2[0] - (p3[0]-p1[0])/6;
      const c2y = p2[1] - (p3[1]-p1[1])/6;
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  const solLine = smoothPath(solPts);
  const respLine = smoothPath(respPts);
  const baseY = H - padB;
  const solArea = `${solLine} L${solPts[n-1][0]},${baseY} L${solPts[0][0]},${baseY} Z`;
  const respArea = `${respLine} L${respPts[n-1][0]},${baseY} L${respPts[0][0]},${baseY} Z`;

  let gridHTML = '';
  for(let h=minH; h<=maxH; h+=2){
    const y = yFor(h);
    gridHTML += `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#E4EAE3" stroke-width="1"/>`;
    gridHTML += `<text x="0" y="${y+4}" font-family="Arial, sans-serif" font-size="11" fill="#7C8B80">${String(h).padStart(2,'0')}:00</text>`;
  }

  svg.innerHTML = `
    <defs>
      <linearGradient id="gradResp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--coral)" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="var(--coral)" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gradSol" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--teal)" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="var(--teal)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g class="grid">${gridHTML}</g>
    <path d="${respArea}" fill="url(#gradResp)" stroke="none"/>
    <path d="${solArea}" fill="url(#gradSol)" stroke="none"/>
    <path d="${respLine}" fill="none" stroke="var(--coral)" stroke-width="2.6" stroke-linecap="round"/>
    <path d="${solLine}" fill="none" stroke="var(--teal-dark)" stroke-width="2.6" stroke-linecap="round"/>
    <line id="trafficGuide" class="traffic-guide" x1="0" y1="${padT}" x2="0" y2="${baseY}"/>
    <circle id="hitSol" class="traffic-hit-pt" r="5.5" fill="var(--teal-dark)" stroke="#fff" stroke-width="2"/>
    <circle id="hitResp" class="traffic-hit-pt" r="5.5" fill="var(--coral)" stroke="#fff" stroke-width="2"/>
  `;

  // Etiquetas del eje X (un label por día, formato "4 jun")
  const meses = {'06':'jun','07':'jul'};
  xAxis.innerHTML = dailyHours.map(d=>{
    const [,mm,dd] = d.date.split('-');
    return `<span>${parseInt(dd,10)} ${meses[mm]}</span>`;
  }).join('');

  const guide = document.getElementById('trafficGuide');
  const hitSol = document.getElementById('hitSol');
  const hitResp = document.getElementById('hitResp');

  function fmtHour(hDecimal){
    const hh = Math.floor(hDecimal);
    const mm = Math.round((hDecimal-hh)*60).toString().padStart(2,'0');
    return `${String(hh).padStart(2,'0')}:${mm}`;
  }
  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  function fmtDate(dateStr){
    const dt = new Date(dateStr+'T12:00:00');
    const [,mm,dd] = dateStr.split('-');
    const nombreMes = {'06':'Junio','07':'Julio'}[mm];
    return `${diasSemana[dt.getDay()]} ${parseInt(dd,10)} de ${nombreMes}`;
  }

  function showAt(clientX){
    const rect = svg.getBoundingClientRect();
    const scale = W/rect.width;
    const relX = (clientX-rect.left) * scale;
    // encontrar el índice más cercano
    let idx = 0, best = Infinity;
    for(let i=0;i<n;i++){
      const dist = Math.abs(xFor(i)-relX);
      if(dist<best){ best=dist; idx=i; }
    }
    const d = dailyHours[idx];
    const px = xFor(idx);
    guide.setAttribute('x1', px); guide.setAttribute('x2', px);
    guide.style.opacity = 1;
    hitSol.setAttribute('cx', px); hitSol.setAttribute('cy', yFor(d.solicitud)); hitSol.style.opacity = 1;
    hitResp.setAttribute('cx', px); hitResp.setAttribute('cy', yFor(d.respuesta)); hitResp.style.opacity = 1;

    ttSol.textContent = fmtHour(d.solicitud);
    ttResp.textContent = fmtHour(d.respuesta);
    ttDate.textContent = fmtDate(d.date);

    const wrapRect = wrap.getBoundingClientRect();
    const pxOnScreen = (px/W) * wrapRect.width;
    const pyOnScreen = (yFor(d.solicitud)/H) * wrapRect.height;
    tooltip.style.left = pxOnScreen + 'px';
    tooltip.style.top = Math.max(pyOnScreen, 40) + 'px';
    tooltip.classList.add('show');
  }

  function hide(){
    guide.style.opacity = 0;
    hitSol.style.opacity = 0;
    hitResp.style.opacity = 0;
    tooltip.classList.remove('show');
  }

  svg.addEventListener('pointermove', e=> showAt(e.clientX));
  svg.addEventListener('pointerdown', e=> showAt(e.clientX));
  svg.addEventListener('pointerleave', hide);
})();
