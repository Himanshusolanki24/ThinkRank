/**
 * AIOrb — Animated AI assistant orb with state-driven visuals.
 * States: listening | thinking | speaking | reviewing
 */
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export type OrbState = "listening" | "thinking" | "speaking" | "reviewing";

interface Props {
  state: OrbState;
  size?: number;
}

const STATE_CONFIG = {
  listening: {
    gradient: "from-cyan-400 via-blue-500 to-violet-500",
    glowColor: "rgba(0, 229, 255, 0.25)",
    ringColor: "rgba(0, 229, 255, 0.15)",
    animClass: "animate-orb-breathe",
    particleColor: "#00E5FF",
    label: "Listening",
  },
  thinking: {
    gradient: "from-amber-400 via-orange-500 to-violet-500",
    glowColor: "rgba(245, 158, 11, 0.3)",
    ringColor: "rgba(245, 158, 11, 0.12)",
    animClass: "animate-orb-think",
    particleColor: "#F59E0B",
    label: "Thinking",
  },
  speaking: {
    gradient: "from-cyan-300 via-cyan-500 to-violet-600",
    glowColor: "rgba(0, 229, 255, 0.4)",
    ringColor: "rgba(0, 229, 255, 0.2)",
    animClass: "animate-orb-speak",
    particleColor: "#00E5FF",
    label: "Speaking",
  },
  reviewing: {
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    glowColor: "rgba(16, 185, 129, 0.3)",
    ringColor: "rgba(16, 185, 129, 0.15)",
    animClass: "animate-orb-breathe",
    particleColor: "#10B981",
    label: "Reviewing Code",
  },
};

// Generate random particles around orb
const generateParticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 30,
    distance: 80 + Math.random() * 50,
    size: 2 + Math.random() * 3,
    duration: 4 + Math.random() * 4,
    delay: Math.random() * 3,
  }));

export const AIOrb = ({ state, size = 160 }: Props) => {
  const config = STATE_CONFIG[state];
  const particles = useMemo(() => generateParticles(12), []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 2.5, height: size * 2.5 }}>
      {/* Ambient glow behind orb */}
      <div
        className="absolute rounded-full blur-[80px] transition-colors duration-1000"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background: config.glowColor,
        }}
      />

      {/* Wave rings (visible during speaking) */}
      <AnimatePresence>
        {state === "speaking" && (
          <>
            {[0, 0.6, 1.2].map((delay, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full border"
                style={{
                  width: size,
                  height: size,
                  borderColor: config.ringColor,
                }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{
                  duration: 2.5,
                  delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Thinking orbit ring */}
      <AnimatePresence>
        {state === "thinking" && (
          <motion.div
            className="absolute rounded-full border border-dashed border-amber-400/20"
            style={{ width: size * 1.5, height: size * 1.5 }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.5 } }}
          />
        )}
      </AnimatePresence>

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: config.particleColor,
            opacity: 0.4,
          }}
          animate={{
            x: [
              Math.cos((p.angle * Math.PI) / 180) * p.distance,
              Math.cos(((p.angle + 60) * Math.PI) / 180) * (p.distance + 15),
              Math.cos(((p.angle + 120) * Math.PI) / 180) * p.distance,
              Math.cos((p.angle * Math.PI) / 180) * p.distance,
            ],
            y: [
              Math.sin((p.angle * Math.PI) / 180) * p.distance,
              Math.sin(((p.angle + 60) * Math.PI) / 180) * (p.distance + 15),
              Math.sin(((p.angle + 120) * Math.PI) / 180) * p.distance,
              Math.sin((p.angle * Math.PI) / 180) * p.distance,
            ],
            opacity: [0.2, 0.6, 0.3, 0.2],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main orb */}
      <div
        className={`relative rounded-full bg-gradient-to-br ${config.gradient} ${config.animClass} transition-all duration-700`}
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 ${size * 0.4}px ${config.glowColor}, 0 0 ${size * 0.8}px ${config.glowColor}`,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute inset-[15%] rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          }}
        />

        {/* Core glow */}
        <div
          className="absolute inset-[30%] rounded-full blur-sm"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* State label */}
      <motion.div
        className="absolute -bottom-2 flex items-center gap-1.5 px-3 py-1 rounded-full glass-control"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        key={state}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.particleColor }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">
          {config.label}
        </span>
      </motion.div>
    </div>
  );
};
