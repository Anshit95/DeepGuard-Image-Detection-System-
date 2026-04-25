import { useEffect, useRef } from "react";

export default function LavaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", handleMouse);

    // Lava blob positions
    const blobs = Array.from({ length: 8 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.1 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      phase: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Base dark background
      ctx.fillStyle = "#0A0503";
      ctx.fillRect(0, 0, w, h);

      // Animate blobs
      for (const b of blobs) {
        b.x += b.vx + Math.sin(t + b.phase) * 0.0002;
        b.y += b.vy + Math.cos(t * 0.7 + b.phase) * 0.0002;
        // Parallax from mouse
        const bx = b.x + (mx - 0.5) * 0.03;
        const by = b.y + (my - 0.5) * 0.03;
        // Wrap
        if (b.x < -0.2) b.x = 1.2;
        if (b.x > 1.2) b.x = -0.2;
        if (b.y < -0.2) b.y = 1.2;
        if (b.y > 1.2) b.y = -0.2;

        const pulse = 1 + Math.sin(t * 1.5 + b.phase) * 0.15;
        const radius = b.r * Math.min(w, h) * pulse;

        const grad = ctx.createRadialGradient(
          bx * w, by * h, 0,
          bx * w, by * h, radius
        );
        grad.addColorStop(0, `rgba(255, 80, 0, ${0.6 + Math.sin(t + b.phase) * 0.15})`);
        grad.addColorStop(0.3, `rgba(255, 40, 0, 0.35)`);
        grad.addColorStop(0.6, `rgba(180, 20, 0, 0.15)`);
        grad.addColorStop(1, "rgba(10, 5, 3, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Glowing cracks - thin lines
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(t * 2) * 0.05;
      ctx.strokeStyle = "#FF6A00";
      ctx.lineWidth = 1;
      ctx.shadowColor = "#FF6A00";
      ctx.shadowBlur = 15;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const sx = (0.1 + i * 0.15) * w;
        const sy = 0.3 * h + Math.sin(t * 0.5 + i) * 0.1 * h;
        ctx.moveTo(sx, sy);
        for (let j = 1; j <= 4; j++) {
          ctx.lineTo(
            sx + j * 0.05 * w + Math.sin(t + i + j) * 10,
            sy + j * 0.08 * h + Math.cos(t * 0.8 + i + j) * 15
          );
        }
        ctx.stroke();
      }
      ctx.restore();

      // Smoke/fog overlay
      const fogGrad = ctx.createLinearGradient(0, 0, 0, h);
      fogGrad.addColorStop(0, `rgba(10, 5, 3, ${0.3 + Math.sin(t * 0.3) * 0.1})`);
      fogGrad.addColorStop(0.5, "rgba(10, 5, 3, 0.05)");
      fogGrad.addColorStop(1, `rgba(10, 5, 3, ${0.4 + Math.sin(t * 0.5) * 0.1})`);
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle cyan accent glow at top
      const cyanGrad = ctx.createRadialGradient(
        w * 0.7, h * 0.1, 0,
        w * 0.7, h * 0.1, w * 0.3
      );
      cyanGrad.addColorStop(0, `rgba(6, 182, 212, ${0.04 + Math.sin(t * 0.8) * 0.02})`);
      cyanGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = cyanGrad;
      ctx.fillRect(0, 0, w, h);

      // Heat flicker
      ctx.globalAlpha = 0.02 + Math.random() * 0.01;
      ctx.fillStyle = "#FF4500";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
