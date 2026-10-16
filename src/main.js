import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
gsap.registerPlugin(ScrollTrigger)
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const P = (n) => `./p/${n}.png`

// outfit stack: top, bottoms, shoes in the same arrangement as the app
const stack = (top, bot, shoe) => `<img class="b" src="${P(bot)}" alt=""><img class="t" src="${P(top)}" alt=""><img class="s" src="${P(shoe)}" alt="">`
const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html }
set('phoneStack', stack('sweater', 'chinos', 'sneaker'))
set('chipStack', stack('tee', 'jeans', 'sneaker'))
set('bigStack', stack('sweater', 'chinos', 'sneaker'))
set('chatStack', stack('tee', 'jeans', 'sneaker'))
document.getElementById('phoneStack').parentElement.querySelector('.stack').classList.add('mini')

// phone: day strip + recent pieces
set('phoneDays', ['W14', 'T15', 'F16', 'S17', 'S18', 'M19', 'T20'].map((d, i) => `<div class="${i ? '' : 'on'}">${d[0]}<b>${d.slice(1)}</b></div>`).join(''))
set('phoneThumbs', ['tee', 'jeans', 'sneaker'].map((n) => `<span><img src="${P(n)}" alt=""></span>`).join(''))
set('heroStrip', Array.from({ length: 7 }, (_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join(''))

// add: the pieces fall into labelled tiles
const items = [['tee', 'Top'], ['sweater', 'Top'], ['jeans', 'Bottoms'], ['chinos', 'Bottoms'], ['hoodie', 'Top'], ['sneaker', 'Shoes']]
set('gridVis', items.map(([n, l]) => `<div class="tile"><img src="${P(n)}" alt="${l}"><span>${l}</span></div>`).join(''))

// month calendar, October 2026 (the 1st is a Thursday)
const combos = [['sweater', 'chinos'], ['tee', 'jeans'], ['sweater', 'hoodie'], ['tee', 'chinos'], ['sweater', 'jeans']]
const planned = new Set([2, 5, 6, 9, 12, 13, 14, 16, 19, 21, 23, 26, 28])
let cal = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<div class="h">${d}</div>`).join('')
cal += '<div></div>'.repeat(4)
for (let d = 1; d <= 31; d++) {
  const has = planned.has(d), c = combos[d % combos.length]
  cal += `<div class="d ${has ? 'has' : ''} ${d === 14 ? 'today' : ''}">${d}${has && d !== 14 ? `<img class="a" src="${P(c[0])}" alt=""><img class="c" src="${P(c[1])}" alt="">` : ''}${d === 14 ? `<img class="a" src="${P('sweater')}" alt=""><img class="c" src="${P('chinos')}" alt="">` : ''}</div>`
}
set('cal', cal)


// ---- motion
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.09 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)
}
// phone straightens as you scroll, floating cards drift at their own speeds (depth)
gsap.to('#phone', { rotateX: 0, rotateY: 0, rotateZ: 0, y: -30, ease: 'none',
  scrollTrigger: { trigger: '.stage', start: 'top 65%', end: 'bottom 20%', scrub: 1 } })
const depth = { '.f1': -60, '.f2': -30, '.f3': -90, '.f4': -45 }
Object.entries(depth).forEach(([sel, y]) => gsap.to(sel, { y, ease: 'none',
  scrollTrigger: { trigger: '.stage', start: 'top 70%', end: 'bottom top', scrub: 1.2 } }))
// mouse parallax on the stage
const stage = document.getElementById('stage')
if (!reduce) stage.addEventListener('pointermove', (e) => {
  const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
  gsap.to('#phone', { rotateY: -16 + x * 14, rotateX: 10 - y * 10, duration: 0.8, ease: 'power3.out', overwrite: 'auto' })
  gsap.to('.f1,.f2', { x: x * -18, duration: 0.9, overwrite: 'auto' }); gsap.to('.f3,.f4', { x: x * 22, duration: 0.9, overwrite: 'auto' })
})
// tiles pop in
gsap.to('.tile', { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.09, ease: 'back.out(1.5)',
  scrollTrigger: { trigger: '#gridVis', start: 'top 75%' } })
gsap.from('.float-lbl', { opacity: 0, y: 16, scale: 0.9, duration: 0.6, stagger: 0.15, scrollTrigger: { trigger: '#looks', start: 'top 60%' } })
gsap.from('#bigStack', { y: 60, rotateX: 14, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#looks', start: 'top 70%' } })
gsap.from('#cal .d', { opacity: 0, scale: 0.8, duration: 0.5, stagger: 0.02, scrollTrigger: { trigger: '#cal', start: 'top 80%' } })
gsap.from('.chat-vis > *', { opacity: 0, y: 24, duration: 0.7, stagger: 0.25, scrollTrigger: { trigger: '#stylist', start: 'top 65%' } })
gsap.utils.toArray('.copy').forEach((c) => gsap.from(c.children, { opacity: 0, y: 24, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: c, start: 'top 80%' } }))
