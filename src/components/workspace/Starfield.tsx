import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
  depth: number;
  tint: string;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const TINTS = ['255,255,255', '255,255,255', '255,255,255', '190,240,215', '240,215,160'];

/** Canvas galaxy for the sign-in showcase: twinkling, slowly drifting stars in three depth
 * layers and an occasional shooting star. Draws a single still frame under reduced motion. */
export function Starfield({ accent }: {accent: string;}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const accentRgb = [1, 3, 5].map((i) => parseInt(accent.slice(i, i + 2), 16)).join(',');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = performance.now();
    let nextMeteor = last + 2500;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(width * height / 2200);
      stars = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: depth > 0.92 ? 1.3 + Math.random() * 0.9 : 0.35 + depth * 0.9,
          base: 0.25 + depth * 0.65,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 2.2,
          depth,
          tint: TINTS[Math.floor(Math.random() * TINTS.length)]
        };
      });
    };

    const draw = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      ctx.clearRect(0, 0, width, height);
      const t = now / 1000;

      for (const star of stars) {
        if (!reduced) {
          star.x -= (4 + star.depth * 10) * dt;
          star.y += (1 + star.depth * 3) * dt;
          if (star.x < -4) star.x = width + 4;
          if (star.y > height + 4) star.y = -4;
        }
        const twinkle = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * star.speed + star.phase);
        const alpha = +(star.base * twinkle).toFixed(3);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${star.tint},${alpha})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (star.r > 1.3) {
          // Bright stars get a soft halo and a faint cross flare.
          const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 6);
          halo.addColorStop(0, `rgba(${star.tint},${alpha * 0.35})`);
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = halo;
          ctx.fillRect(star.x - star.r * 6, star.y - star.r * 6, star.r * 12, star.r * 12);
          ctx.strokeStyle = `rgba(${star.tint},${alpha * 0.4})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(star.x - star.r * 5, star.y);
          ctx.lineTo(star.x + star.r * 5, star.y);
          ctx.moveTo(star.x, star.y - star.r * 5);
          ctx.lineTo(star.x, star.y + star.r * 5);
          ctx.stroke();
        }
      }

      if (!reduced) {
        if (now > nextMeteor) {
          meteors.push({
            x: width * (0.3 + Math.random() * 0.7),
            y: -20,
            vx: -(380 + Math.random() * 220),
            vy: 240 + Math.random() * 160,
            life: 1
          });
          nextMeteor = now + 3500 + Math.random() * 5000;
        }
        meteors = meteors.filter((meteor) => meteor.life > 0);
        for (const meteor of meteors) {
          meteor.x += meteor.vx * dt;
          meteor.y += meteor.vy * dt;
          meteor.life -= dt * 0.9;
          // Clamp: a negative alpha would make an invalid colour and throw, killing the loop.
          const alpha = Math.max(0, meteor.life);
          const tailX = meteor.x - meteor.vx * 0.22;
          const tailY = meteor.y - meteor.vy * 0.22;
          const trail = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
          trail.addColorStop(0, `rgba(255,255,255,${alpha.toFixed(3)})`);
          trail.addColorStop(0.3, `rgba(${accentRgb},${(alpha * 0.5).toFixed(3)})`);
          trail.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.strokeStyle = trail;
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }
        frame = requestAnimationFrame(draw);
      }
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    observer.observe(canvas);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [accent]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
