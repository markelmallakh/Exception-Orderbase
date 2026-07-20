/* ------------------------------------------------------------------
   DotField — vanilla-JS port of React Bits' <DotField /> background
   (reactbits.dev/backgrounds/dot-field). Pure canvas 2D + an SVG
   radial glow; no dependencies. Mounted into [data-dotfield] (the
   footer background layer). Same math as the original: a grid of
   dots that bulge away from the cursor within cursorRadius, with a
   soft glow following the pointer. Themed to the brand turquoise on
   the deep-green footer. Respects prefers-reduced-motion and pauses
   when the footer is off-screen.
   ------------------------------------------------------------------ */
(function () {
  const TWO_PI = Math.PI * 2;

  function init() {
    const host = document.querySelector("[data-dotfield]");
    if (!host || host._dotfield) return;
    host._dotfield = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const P = {
      dotRadius: 1.5,
      dotSpacing: 14,
      cursorRadius: 320,
      bulgeStrength: 67,
      glowRadius: 200,
      sparkle: false,
      waveAmplitude: 0,
      gradientFrom: "rgba(176, 222, 217, 0.55)", // brand turquoise
      gradientTo: "rgba(140, 186, 181, 0.32)", // dark turquoise
      glowColor: "rgba(231, 255, 252, 0.55)", // extra-light turquoise — brighter cursor glow
    };

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // SVG glow that follows the cursor.
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("style", "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;");
    const gid = "df-glow-" + Math.random().toString(36).slice(2, 8);
    svg.innerHTML =
      '<defs><radialGradient id="' +
      gid +
      '"><stop offset="0%" stop-color="' +
      P.glowColor +
      '"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>';
    const glow = document.createElementNS(NS, "circle");
    glow.setAttribute("cx", "-9999");
    glow.setAttribute("cy", "-9999");
    glow.setAttribute("r", String(P.glowRadius));
    glow.setAttribute("fill", "url(#" + gid + ")");
    glow.style.opacity = "0";
    glow.style.willChange = "opacity";
    svg.appendChild(glow);
    host.appendChild(svg);

    let dots = [];
    const size = { w: 0, h: 0 };
    const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    let engagement = 0;
    let glowOpacity = 0;
    let frameCount = 0;

    function buildDots(w, h) {
      const step = P.dotRadius + P.dotSpacing;
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const arr = new Array(rows * cols);
      let idx = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          arr[idx++] = { ax, ay, sx: ax, sy: ay };
        }
      }
      dots = arr;
    }

    function doResize() {
      const r = host.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.w = w;
      size.h = h;
      buildDots(w, h);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, size.w, size.h);
      const grad = ctx.createLinearGradient(0, 0, size.w, size.h);
      grad.addColorStop(0, P.gradientFrom);
      grad.addColorStop(1, P.gradientTo);
      ctx.fillStyle = grad;
      const rad = P.dotRadius / 2;
      ctx.beginPath();
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        ctx.moveTo(d.ax + rad, d.ay);
        ctx.arc(d.ax, d.ay, rad, 0, TWO_PI);
      }
      ctx.fill();
    }

    // --- reduced motion: render the ambient dot grid once, no interaction ---
    if (reduce) {
      doResize();
      drawStatic();
      window.addEventListener("resize", () => {
        doResize();
        drawStatic();
      });
      return;
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 100);
    });

    window.addEventListener(
      "mousemove",
      (e) => {
        const r = host.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      },
      { passive: true },
    );

    const speedInterval = setInterval(() => {
      const dx = mouse.prevX - mouse.x;
      const dy = mouse.prevY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouse.speed += (dist - mouse.speed) * 0.5;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    }, 20);

    // Pause the loop while the footer is scrolled out of view.
    let visible = false;
    const footer = host.closest("footer") || host.parentElement;
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
      },
      { threshold: 0.02 },
    ).observe(footer);

    function tick() {
      requestAnimationFrame(tick);
      if (!visible) return;

      frameCount++;
      const t = frameCount * 0.02;
      const m = mouse;
      const { w, h } = size;

      const targetEngagement = Math.min(m.speed / 5, 1);
      engagement += (targetEngagement - engagement) * 0.06;
      if (engagement < 0.001) engagement = 0;
      const eng = engagement;

      glowOpacity += (eng - glowOpacity) * 0.08;
      glow.setAttribute("cx", String(m.x));
      glow.setAttribute("cy", String(m.y));
      glow.style.opacity = String(glowOpacity);

      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, P.gradientFrom);
      grad.addColorStop(1, P.gradientTo);
      ctx.fillStyle = grad;

      const cr = P.cursorRadius;
      const crSq = cr * cr;
      const rad = P.dotRadius / 2;

      ctx.beginPath();
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = m.x - d.ax;
        const dy = m.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq);
          const tt = 1 - dist / cr;
          const push = tt * tt * P.bulgeStrength * eng;
          const angle = Math.atan2(dy, dx);
          d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
          d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
        } else {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;
        if (P.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * P.waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * P.waveAmplitude * 0.5;
        }

        if (P.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          const rr = hash % 100 < 3 ? rad * 1.8 : rad;
          ctx.moveTo(drawX + rr, drawY);
          ctx.arc(drawX, drawY, rr, 0, TWO_PI);
        } else {
          ctx.moveTo(drawX + rad, drawY);
          ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      }
      ctx.fill();
    }

    doResize();
    tick();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
