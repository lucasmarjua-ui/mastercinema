import { useEffect, useRef } from 'react';

/**
 * Fondo animado dibujado enteramente en <canvas>: el cabo de cuenta atrás
 * (leader) que abre las copias de proyección -- círculos concéntricos, tics
 * de graduación y una cuña ámbar que gira, como el barrido del "reloj" de
 * 8-7-6-5-4-3-2. Cero vídeo, cero imágenes externas: sin ningún problema de
 * licencia posible.
 */
export default function CountdownBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;

    let raf = 0;
    let angle = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(canvasEl, ctx2d);
    const handleResize = () => resize(canvasEl, ctx2d);
    window.addEventListener('resize', handleResize);

    function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.4;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a0b';
      ctx.fillRect(0, 0, w, h);

      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(242, 237, 226, 0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const tickCount = 60;
      for (let i = 0; i < tickCount; i++) {
        const a = (i / tickCount) * Math.PI * 2;
        const major = i % 5 === 0;
        const inner = radius * 0.98;
        const outer = major ? radius * 1.07 : radius * 1.02;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx.strokeStyle = major ? 'rgba(242, 237, 226, 0.22)' : 'rgba(242, 237, 226, 0.12)';
        ctx.lineWidth = major ? 2 : 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + 0.05);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 122, 26, 0.9)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.strokeStyle = 'rgba(255, 179, 92, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (!prefersReducedMotion) angle += 0.0035;
      raf = requestAnimationFrame(() => draw(canvas, ctx));
    }
    draw(canvasEl, ctx2d);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
