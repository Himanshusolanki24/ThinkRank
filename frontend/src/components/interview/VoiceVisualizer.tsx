import { motion } from "framer-motion";

export const VoiceVisualizer = ({ isActive = false }) => {
    return (
        <div className="flex items-center justify-center gap-[2px] h-8">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`w-1 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-gray-600'}`}
                    animate={isActive ? {
                        height: [4, Math.random() * 24 + 4, 4],
                        opacity: [0.5, 1, 0.5]
                    } : {
                        height: 4,
                        opacity: 0.3
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: i * 0.05,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};
