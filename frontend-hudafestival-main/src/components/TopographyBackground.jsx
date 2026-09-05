import React, { useEffect, useRef } from 'react';

const TopographyBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let time = 0;
    
    // Mouse tracking
    let mouse = { x: width / 2, y: height / 2, active: false };
    let targetMouse = { x: width / 2, y: height / 2 };
    
    const onMouseMove = (e) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
      mouse.active = true;
    };
    
    const onMouseLeave = () => {
      mouse.active = false;
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        targetMouse.x = e.touches[0].clientX;
        targetMouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    
    const onTouchEnd = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchstart', onTouchMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    let animationFrameId;

    const render = () => {
      // Lerp mouse
      if (mouse.active) {
        mouse.x = lerp(mouse.x, targetMouse.x, 0.05);
        mouse.y = lerp(mouse.y, targetMouse.y, 0.05);
      } else {
        mouse.x = lerp(mouse.x, width / 2, 0.02);
        mouse.y = lerp(mouse.y, height / 2, 0.02);
      }

      // Background gradient
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
      gradient.addColorStop(0, '#ff5666');
      gradient.addColorStop(1, '#f43044');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw Topography Lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      
      const spacing = 40; // distance between vertical lines
      const resolution = 10; // points per line
      
      for (let x = -spacing; x <= width + spacing; x += spacing) {
        ctx.beginPath();
        for (let y = -spacing; y <= height + spacing; y += resolution) {
          // Base wave calculations
          const wave1 = Math.sin(y * 0.005 + time * 0.001) * 20;
          const wave2 = Math.sin(y * 0.01 - time * 0.002) * 15;
          const wave3 = Math.cos(x * 0.005 + y * 0.002 + time * 0.001) * 30;
          
          let offsetX = wave1 + wave2 + wave3;
          let offsetY = 0;

          // Mouse repulsion
          const dx = x + offsetX - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const maxDist = 300;
          if (dist < maxDist) {
            const force = Math.pow((maxDist - dist) / maxDist, 2);
            offsetX += (dx / dist) * force * 50;
            offsetY += (dy / dist) * force * 50;
          }

          if (y === -spacing) {
            ctx.moveTo(x + offsetX, y + offsetY);
          } else {
            ctx.lineTo(x + offsetX, y + offsetY);
          }
        }
        ctx.stroke();
      }

      time += 16; // approx 60fps
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchstart', onTouchMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default TopographyBackground;
