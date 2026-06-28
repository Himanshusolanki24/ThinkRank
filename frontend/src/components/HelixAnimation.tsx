
import { motion } from "framer-motion";
export const HelixAnimation = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center perspective-1000">
            <div className="relative w-64 h-96 transform-style-3d animate-spin-slow">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute left-1/2 top-0 w-32 h-2 flex items-center justify-between animate-pulse-glow"
                        style={{
                            top: `${(i * 100) / 10}%`,
                            transform: `rotateY(${i * 60}deg) translateZ(60px)`,
                            animationDelay: `${i * 0.2}s`
                        }}
                    >
                        <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <div className="w-full h-[1px] bg-gradient-to-r from-cyan-400/50 to-purple-500/50" />
                        <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    </div>
                ))}
            </div>
        </div>
    );
};
