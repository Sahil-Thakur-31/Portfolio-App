"use client";

import React, { useEffect, useRef } from "react";
import { getThemeRgb } from "@/lib/utils";

/**
 * Interactive particle-network canvas: nodes drift and link to nearby
 * neighbors, with brighter "laser" threads and a glow halo that follow the
 * cursor. Shared by the landing page, auth screens, and admin panel for a
 * consistent tech-HUD feel.
 */
export function NetworkBackground({ density = 9000, maxParticles = 140 }: { density?: number; maxParticles?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tealRgb = getThemeRgb("--theme-accent-teal-rgb", "0, 242, 254");
    const purpleRgb = getThemeRgb("--theme-accent-purple-rgb", "157, 78, 221");

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / density), maxParticles);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2.2 + 1.3,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    let mouseX = -1000;
    let mouseY = -1000;
    const mouseReach = 240;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soft glow halo that follows the cursor, for immediate visual feedback
      if (mouseX > 0) {
        const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mouseReach);
        glow.addColorStop(0, `rgba(${purpleRgb}, 0.10)`);
        glow.addColorStop(1, `rgba(${purpleRgb}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, mouseReach, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

        // Ambient links between nearby particles
        ctx.lineWidth = 1;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.35;
            ctx.strokeStyle = `rgba(${tealRgb}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Bright laser threads toward the cursor
        let nearMouse = false;
        if (mouseX > 0) {
          const mDist = Math.hypot(p1.x - mouseX, p1.y - mouseY);
          if (mDist < mouseReach) {
            nearMouse = true;
            const alpha = (1 - mDist / mouseReach) * 0.7;
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = `rgba(${purpleRgb}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }

        // Node dot — brighter and larger when caught in the cursor's reach
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, nearMouse ? p1.radius * 1.6 : p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = nearMouse ? `rgba(${purpleRgb}, 0.85)` : `rgba(${tealRgb}, 0.65)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, maxParticles]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
