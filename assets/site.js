// Prévia · Rhicardo Henrick · Quiropraxia e Fisioterapia · RK Performance · v1
document.documentElement.classList.add('js');
const PC = matchMedia('(min-width: 901px)');

// ---------- abertura cinematográfica: some sozinha; se a animação não rodar, tira à força
const intro = document.querySelector('.intro');
if (intro) {
  intro.addEventListener('animationend', e => { if (e.animationName === 'intro-sai') intro.remove(); });
  setTimeout(() => intro && intro.remove(), 3200);
}

// ---------- topo sólido depois da primeira tela + menu do celular
const topo = document.getElementById('topo');
const marcaTopo = () => {
  topo.classList.toggle('solido', scrollY > innerHeight * 0.5 || document.body.classList.contains('pagina'));
  document.documentElement.style.setProperty('--topo-h', topo.offsetHeight + 'px');
};
addEventListener('resize', marcaTopo);
addEventListener('scroll', marcaTopo, { passive: true }); marcaTopo();
const menuBt = document.querySelector('.menu-bt');
if (menuBt) {
  menuBt.addEventListener('click', () => {
    const aberto = topo.classList.toggle('aberto');
    menuBt.setAttribute('aria-expanded', aberto); menuBt.textContent = aberto ? 'Fechar' : 'Menu';
    document.body.style.overflow = aberto ? 'hidden' : '';
  });
  topo.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => {
    topo.classList.remove('aberto'); menuBt.setAttribute('aria-expanded', 'false'); menuBt.textContent = 'Menu'; document.body.style.overflow = '';
  }));
}

// ---------- revelação ao rolar
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.rv, .barras').forEach(el => io.observe(el));

// ---------- diálogos: demonstração dos botões e "por trás desta prévia"
const abre = d => { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); };
const demo = document.getElementById('demo');
document.querySelectorAll('[data-demo]').forEach(el => el.addEventListener('click', e => {
  e.preventDefault();
  const tit = document.getElementById('demo-tit'), txt = document.getElementById('demo-txt'), msg = document.getElementById('demo-msg');
  if (el.dataset.demo === 'tel') {
    tit.textContent = 'Ligar para o Rhicardo';
    txt.textContent = 'No site final, este botão liga direto para o número de atendimento que o Rhicardo indicar:';
    msg.textContent = '(42) 98836-3200 · número do Google e do cartão digital, a confirmar';
  } else {
    tit.textContent = 'Agendar pelo WhatsApp';
    txt.textContent = 'No site final, este botão abre o WhatsApp do Rhicardo com a mensagem já escrita. Assim ele sabe que o paciente veio pelo site e qual página leu:';
    msg.textContent = el.dataset.msg || 'Olá, Rhicardo! Vim pelo site e quero agendar uma avaliação.';
  }
  abre(demo);
}));
const rk = document.getElementById('rk');
document.querySelectorAll('[data-rk]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); rk && abre(rk); }));
document.querySelectorAll('dialog').forEach(d => {
  d.querySelectorAll('[data-fecha]').forEach(b => b.addEventListener('click', () => d.close()));
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
});

// ---------- vídeos: carregam perto da tela, tocam mudos em PB; "com som" liga o áudio e a cor
const videos = [...document.querySelectorAll('video[data-src]')].filter(v => !v.classList.contains('so-pc') || PC.matches);
videos.forEach(v => { v.muted = true; v.defaultMuted = true; v.playsInline = true; v.loop = true; v.controls = false; });
const tenta = v => { if (v.src && v.paused) v.play().catch(() => {}); };
const naTela = v => { const r = v.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
let comSom = null;
function marca(q, ligado) {
  const b = q.querySelector('.som'); if (!b) return;
  b.setAttribute('aria-pressed', ligado ? 'true' : 'false');
  b.setAttribute('aria-label', ligado ? 'Desativar som do vídeo' : 'Ativar som do vídeo');
  q.classList.toggle('colorido', ligado);
}
function silencia(q) { q.querySelector('video').muted = true; marca(q, false); if (comSom === q) comSom = null; }
function ligaSom(q) {
  if (comSom && comSom !== q) silencia(comSom);
  const v = q.querySelector('video');
  if (!v.src) v.src = v.dataset.src;
  v.muted = false; v.currentTime = 0;
  v.play().then(() => { comSom = q; marca(q, true); }).catch(() => { v.muted = true; marca(q, false); });
}
const carrega = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; tenta(v); }
  else { v.pause(); const q = v.closest('.vid'); if (q && q === comSom) silencia(q); }
}), { rootMargin: '200px 0px', threshold: 0.01 });
videos.forEach(v => carrega.observe(v));
document.querySelectorAll('.vid .som').forEach(b => {
  const q = b.closest('.vid');
  b.addEventListener('click', e => { e.stopPropagation(); q.querySelector('video').muted ? ligaSom(q) : silencia(q); });
});
const destrava = () => videos.forEach(v => { if (naTela(v)) tenta(v); });
['touchstart', 'click'].forEach(ev => addEventListener(ev, destrava, { passive: true }));

// ---------- letreiro por requestAnimationFrame (acelera com a rolagem)
const faixa = document.getElementById('faixa');
if (faixa) {
  faixa.innerHTML += faixa.innerHTML;
  let x = 0, extra = 0, ultimoY = scrollY, antes = performance.now();
  addEventListener('scroll', () => { extra = Math.min(extra + Math.abs(scrollY - ultimoY) * 5, 800); ultimoY = scrollY; }, { passive: true });
  (function anda(agora) {
    const dt = Math.max(0, Math.min((agora - antes) / 1000, 0.05)) || 0; antes = agora;
    x -= (40 + extra) * dt; extra *= 0.94;
    const meio = faixa.scrollWidth / 2;
    if (meio > 0 && -x >= meio) x += meio;
    faixa.style.transform = `translate3d(${x}px,0,0)`;
    requestAnimationFrame(anda);
  })(performance.now());
}

// ---------- parallax leve (só computador)
const px = [...document.querySelectorAll('[data-parallax]')];
if (px.length && PC.matches) {
  let pedido = false;
  const move = () => {
    pedido = false;
    px.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -400 || r.top > innerHeight + 400) return;
      const d = (r.top + r.height / 2 - innerHeight / 2) * (parseFloat(el.dataset.parallax) || 0.05);
      el.style.transform = `translate3d(0,${d.toFixed(1)}px,0)`;
    });
  };
  addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(move); } }, { passive: true });
  addEventListener('resize', move); move();
}

// ---------- a coluna vertebral (assinatura): desenhada por código, vista de lado
const NOMES = ['C1','C2','C3','C4','C5','C6','C7','T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','L1','L2','L3','L4','L5'];
const NS = 'http://www.w3.org/2000/svg';
function curva(pts, n) {
  // Catmull-Rom pelos pontos de controle
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function desenhaColuna(svg) {
  const W = 230, H = 800;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  // linha média de perfil (paciente olhando pra esquerda): lordose cervical, cifose torácica, lordose lombar
  const ctrl = [[118, 26], [104, 96], [112, 168], [132, 262], [137, 360], [124, 466], [100, 566], [104, 640], [118, 668]];
  const pts = curva(ctrl, 40);
  const acum = [0];
  for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acum[acum.length - 1];
  const em = s => { // ponto e tangente na distância s
    let i = acum.findIndex(a => a >= s); if (i <= 0) i = 1;
    const f = (s - acum[i - 1]) / (acum[i] - acum[i - 1] || 1);
    const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;
    const ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180 / Math.PI - 90;
    return [x, y, ang];
  };
  // altura, largura (profundidade), comprimento e queda do processo espinhoso, espaço do disco
  const dados = NOMES.map((n, i) => {
    if (i === 0) return { h: 8, w: 20, L: 8, d: 1, g: 4 };
    if (i === 1) return { h: 15, w: 21, L: 13, d: 3, g: 4 };
    if (i < 6) return { h: 11, w: 22, L: 9, d: 3, g: 4 };
    if (i === 6) return { h: 12, w: 23, L: 17, d: 6, g: 5 };
    if (i < 19) { const k = (i - 7) / 11; return { h: 15 + k * 6, w: 25 + k * 8, L: 20 - k * 2, d: 9 + Math.sin(k * Math.PI) * 9, g: 5 }; }
    const k = (i - 19) / 4; return { h: 23 + k * 3, w: 36 + k * 5, L: 15, d: 3, g: 7 };
  });
  const soma = dados.reduce((a, v) => a + v.h + v.g, 0);
  const esc = total / soma;
  let s = 0;
  const grupos = [];
  dados.forEach((v, i) => {
    const h = v.h * esc, w = v.w, g = v.g * esc;
    const [x, y, ang] = em(s + h / 2);
    s += h + g;
    const gr = document.createElementNS(NS, 'g');
    gr.setAttribute('class', 'vt'); gr.dataset.nome = NOMES[i]; gr.style.setProperty('--i', i);
    gr.dataset.cx = x; gr.dataset.cy = y; gr.dataset.ang = ang;
    gr.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${ang.toFixed(2)})`);
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', (-w / 2).toFixed(2)); r.setAttribute('y', (-h / 2).toFixed(2));
    r.setAttribute('width', w.toFixed(2)); r.setAttribute('height', h.toFixed(2)); r.setAttribute('rx', i === 0 ? 4 : 2.6);
    gr.appendChild(r);
    // arco posterior + processo espinhoso (para a direita = posterior)
    const a = w / 2, L = v.L, d = v.d * esc;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${a} ${(-h * 0.32).toFixed(2)} C${a + 6} ${(-h * 0.32).toFixed(2)} ${a + 7} ${(-h * 0.1).toFixed(2)} ${a + 9} ${(-h * 0.05).toFixed(2)} L${a + 9 + L} ${(d + h * 0.1).toFixed(2)} Q${a + 11 + L} ${(d + h * 0.34).toFixed(2)} ${a + 7 + L} ${(d + h * 0.32).toFixed(2)} L${a + 7} ${(h * 0.36).toFixed(2)} C${a + 5} ${(h * 0.4).toFixed(2)} ${a + 2} ${(h * 0.32).toFixed(2)} ${a} ${(h * 0.3).toFixed(2)}`);
    gr.appendChild(p);
    svg.appendChild(gr); grupos.push(gr);
    if (['C1', 'C7', 'T6', 'T12', 'L5'].includes(NOMES[i])) {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'rot'); t.setAttribute('x', 204); t.setAttribute('y', (y + 3).toFixed(1));
      t.textContent = NOMES[i]; svg.appendChild(t);
    }
  });
  // sacro (S1 a S5 fundidos) e cóccix, curvando para trás
  const sac = document.createElementNS(NS, 'g'); sac.setAttribute('class', 'vt'); sac.dataset.nome = 'S'; sac.style.setProperty('--i', 24);
  const [sx, sy] = em(total);
  const ps = document.createElementNS(NS, 'path');
  ps.setAttribute('d', `M${sx - 22} ${sy + 4} L${sx + 24} ${sy - 2} C${sx + 40} ${sy + 30} ${sx + 46} ${sy + 70} ${sx + 40} ${sy + 104} L${sx + 30} ${sy + 106} C${sx + 18} ${sy + 74} ${sx} ${sy + 40} ${sx - 22} ${sy + 4} Z`);
  sac.appendChild(ps);
  for (let k = 1; k < 5; k++) {
    const l = document.createElementNS(NS, 'path'); const f = k / 5;
    const y0 = sy + 4 + f * 100, x0 = sx - 22 + f * 52;
    l.setAttribute('d', `M${(x0).toFixed(1)} ${(y0 - f * 4).toFixed(1)} L${(x0 + 46 - f * 32).toFixed(1)} ${(y0 - 8 + f * 2).toFixed(1)}`);
    sac.appendChild(l);
  }
  [[sx + 34, sy + 114], [sx + 33, sy + 124], [sx + 31, sy + 132]].forEach(([x, y], k) => {
    const c = document.createElementNS(NS, 'rect'); const ww = 8 - k * 2;
    c.setAttribute('x', x - ww / 2); c.setAttribute('y', y); c.setAttribute('width', ww); c.setAttribute('height', 6); c.setAttribute('rx', 2);
    sac.appendChild(c);
  });
  svg.appendChild(sac); grupos.push(sac);
  const ts = document.createElementNS(NS, 'text'); ts.setAttribute('class', 'rot'); ts.setAttribute('x', 204); ts.setAttribute('y', sy + 50); ts.textContent = 'S'; svg.appendChild(ts);
  return grupos;
}

// coluna da abertura: aparece vértebra por vértebra e "respira" com a rolagem
const espHero = document.querySelector('[data-espinha="hero"]');
if (espHero && PC.matches) {
  const gs = desenhaColuna(espHero);
  setTimeout(() => espHero.classList.add('desenhada'), document.querySelector('.intro') ? 1900 : 200);
  const regHero = { lombar: ['L1', 'L2', 'L3', 'L4', 'L5', 'S'] }[espHero.dataset.regiao];
  if (regHero) gs.forEach(g => g.classList.toggle('on', regHero.includes(g.dataset.nome)));
  let vel = 0, ultimo = scrollY, t0 = performance.now(), visivel = true;
  new IntersectionObserver(es => { visivel = es[0].isIntersecting; }).observe(espHero);
  addEventListener('scroll', () => { vel = Math.min(vel + Math.abs(scrollY - ultimo) * 0.05, 7); ultimo = scrollY; }, { passive: true });
  (function respira(agora) {
    if (visivel) {
      const t = (agora - t0) / 1000;
      gs.forEach((g, i) => {
        if (!g.dataset.cx) return;
        const amp = 0.7 + vel;
        const extra = Math.sin(t * 1.1 - i * 0.32) * amp;
        g.setAttribute('transform', `translate(${(+g.dataset.cx + Math.sin(t * 0.9 - i * 0.25) * vel * 0.8).toFixed(2)} ${(+g.dataset.cy).toFixed(2)}) rotate(${(+g.dataset.ang + extra).toFixed(2)})`);
      });
      vel *= 0.93;
    }
    requestAnimationFrame(respira);
  })(t0);
}

// mapa do "o que eu trato": cada queixa acende a região
const espMapa = document.querySelector('[data-espinha="mapa"]');
const indice = document.getElementById('indice');
if (espMapa && indice) {
  const gs = desenhaColuna(espMapa);
  const mapa = document.getElementById('mapa'), rot = document.getElementById('regiao');
  const REG = {
    lombar: { v: ['L1', 'L2', 'L3', 'L4', 'L5', 'S'], t: 'Coluna lombar · L1 a L5 e sacro' },
    hernia: { v: ['C5', 'C6', 'C7', 'L4', 'L5', 'S'], t: 'Onde a hérnia mais aparece · C5–C7 e L4–S1' },
    cervical: { v: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'], t: 'Coluna cervical · C1 a C7' },
    muscular: { foto: true, t: 'Músculos · terapia manual e agulhamento seco' },
    joelho: { foto: true, t: 'Joelho, quadril e tornozelo' }
  };
  const ativa = li => {
    const r = REG[li.dataset.regiao]; if (!r) return;
    indice.querySelectorAll('li').forEach(x => x.classList.toggle('on', x === li));
    gs.forEach(g => g.classList.toggle('on', !!r.v && r.v.includes(g.dataset.nome)));
    mapa.classList.toggle('foto', !!r.foto);
    mapa.querySelectorAll('.foto-mapa').forEach(f => f.classList.toggle('on', f.dataset.fotoDe === li.dataset.regiao));
    rot.textContent = r.t;
  };
  indice.querySelectorAll('li').forEach(li => {
    li.addEventListener('mouseenter', () => ativa(li));
    li.addEventListener('focusin', () => ativa(li));
  });
  ativa(indice.querySelector('li'));
}

// ---------- progresso da página como coluna (C1 no topo, sacro no fim)
const prog = document.querySelector('.coluna-prog');
const progCel = document.querySelector('.prog-cel');
const secoes = [...document.querySelectorAll('[data-secao]')];
if (prog) {
  const rotulos = [...NOMES, 'S'];
  const ticks = rotulos.map((n, i) => {
    const t = document.createElement('i'); t.className = 'vert';
    const larg = i < 7 ? 9 : i < 19 ? 12 : i < 24 ? 16 : 20;
    t.style.width = larg + 'px'; t.style.top = (i / (rotulos.length - 1) * 100) + '%';
    prog.appendChild(t); return t;
  });
  const rot = document.createElement('span'); rot.className = 'rotulo'; prog.appendChild(rot);
  const atualiza = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    const idx = Math.round(p * (rotulos.length - 1));
    ticks.forEach((t, i) => { t.classList.toggle('acesa', i <= idx); t.classList.toggle('agora', i === idx); });
    let nome = '';
    secoes.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5) nome = s.dataset.secao; });
    rot.textContent = rotulos[idx];
    rot.title = nome;
    rot.style.top = (idx / (rotulos.length - 1) * 100) + '%';
    prog.classList.toggle('vis', scrollY > innerHeight * 0.4 && p < 0.97);
    if (progCel) progCel.style.transform = `scaleX(${p})`;
  };
  addEventListener('scroll', atualiza, { passive: true }); addEventListener('resize', atualiza); atualiza();
}

// ---------- a consulta: número fixo acompanha o passo
const passos = [...document.querySelectorAll('.passo')];
const numFixo = document.querySelector('.numero-fixo');
if (passos.length && numFixo) {
  const nums = [...numFixo.querySelectorAll('.num span')], regua = [...numFixo.querySelectorAll('.regua i')], nome = numFixo.querySelector('.nome-passo');
  const obs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const i = passos.indexOf(e.target);
    nums.forEach((n, k) => n.classList.toggle('on', k === i));
    regua.forEach((r, k) => r.classList.toggle('on', k <= i));
    nome.textContent = e.target.dataset.nome;
  }), { rootMargin: '-45% 0px -45% 0px' });
  passos.forEach(p => obs.observe(p));
}

// ---------- contador do destaque (96%)
document.querySelectorAll('[data-conta]').forEach(el => {
  const fim = +el.dataset.conta;
  const o = new IntersectionObserver(es => {
    if (!es[0].isIntersecting) return; o.disconnect();
    const t0 = performance.now();
    (function passo(t) { const k = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - k, 3); el.innerHTML = Math.round(fim * e) + '<span class="pct">%</span>'; if (k < 1) requestAnimationFrame(passo); })(t0);
  }, { threshold: 0.6 });
  o.observe(el);
});

// ---------- avaliações: troca sozinha, pausa no mouse
const depo = document.getElementById('depo');
if (depo) {
  const figs = [...depo.querySelectorAll('figure')], pts = [...document.querySelectorAll('#pontos button')];
  let at = 0, timer;
  const mostra = i => { at = i; figs.forEach((f, k) => f.classList.toggle('on', k === i)); pts.forEach((p, k) => p.classList.toggle('on', k === i)); };
  const roda = () => { clearInterval(timer); timer = setInterval(() => mostra((at + 1) % figs.length), 6500); };
  pts.forEach((p, k) => p.addEventListener('click', () => { mostra(k); roda(); }));
  depo.addEventListener('mouseenter', () => clearInterval(timer)); depo.addEventListener('mouseleave', roda);
  roda();
}

// ---------- botões fixos aparecem depois da primeira tela
const fixos = document.querySelectorAll('.zap-fixo, .rk-chip');
const mostraFixos = () => fixos.forEach(f => f.classList.toggle('vis', scrollY > innerHeight * 0.7));
addEventListener('scroll', mostraFixos, { passive: true }); mostraFixos();
// no celular a barra de ações aparece logo depois da abertura
const barraCel = document.querySelector('.barra-cel');
if (barraCel) setTimeout(() => barraCel.classList.add('vis'), document.querySelector('.intro') ? 2300 : 300);

// ---------- página interna: âncora ativa
const ancoras = [...document.querySelectorAll('.ancoras a[href^="#"]')];
if (ancoras.length) {
  const alvos = ancoras.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const obsN = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) ancoras.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
  alvos.forEach(el => obsN.observe(el));
}
