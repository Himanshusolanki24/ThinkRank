
import { motion } from "framer-motion";

export const HelixAnimation = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center perspective-1000">
            <div className="relative w-64 h-96 transform-style-3d animate-spin-slow">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute left-1/2 top-0 w-32 h-2 flex items-center justify-between"
                        style={{
                            top: `${(i * 100) / 20}%`,
                            transform: `rotateY(${i * 30}deg) translateZ(60px)`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
                    >
                        <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <div className="w-full h-[1px] bg-gradient-to-r from-cyan-400/50 to-purple-500/50" />
                        <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
