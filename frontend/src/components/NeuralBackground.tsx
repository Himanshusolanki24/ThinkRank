import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Connection {
  from: number;
  to: number;
}

export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize nodes (PERFORMANCE: Cap at 25 instead of 50)
    const nodeCount = Math.floor((window.innerWidth * window.innerHeight) / 25000);
    nodesRef.current = Array.from({ length: Math.min(nodeCount, 25) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1,
    }));

    // Create connections
    connectionsRef.current = [];
    for (let i = 0; i < nodesRef.current.length; i++) {
      const connectTo = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connectTo; j++) {
        const target = Math.floor(Math.random() * nodesRef.current.length);
        if (target !== i) {
          connectionsRef.current.push({ from: i, to: target });
        }
      }
    }

    let lastTime = 0;
    const animate = (time: number) => {
      animationRef.current = requestAnimationFrame(animate);

      // PERFORMANCE: Skip frame if document is hidden or if it's too soon (throttle to ~30fps)
      if (document.hidden) return;
      if (time - lastTime < 33) return;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update node positions
      nodesRef.current.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      // Draw connections
      ctx.strokeStyle = "rgba(251, 125, 194, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      connectionsRef.current.forEach((conn) => {
        const from = nodesRef.current[conn.from];
        const to = nodesRef.current[conn.to];
        const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);

        if (dist < 200) {
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
        }
      });
      ctx.stroke();

      // Draw nodes (PERFORMANCE: Removed per-node radial gradient glow, batched paths)
      ctx.fillStyle = "rgba(251, 125, 194, 0.4)";
      ctx.beginPath();
      nodesRef.current.forEach((node) => {
        ctx.moveTo(node.x, node.y);
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      });
      ctx.fill();
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 pointer-events-none"
    />
  );
};
