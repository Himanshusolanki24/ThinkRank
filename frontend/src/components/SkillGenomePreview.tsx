import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const skillData = [
  { skill: "JavaScript", value: 90, fullMark: 100 },
  { skill: "React", value: 85, fullMark: 100 },
  { skill: "TypeScript", value: 75, fullMark: 100 },
  { skill: "Node.js", value: 65, fullMark: 100 },
  { skill: "Python", value: 58, fullMark: 100 },
  { skill: "SQL", value: 70, fullMark: 100 },
  { skill: "CSS", value: 80, fullMark: 100 },
  { skill: "Testing", value: 55, fullMark: 100 },
];

export const SkillGenomePreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl" />

      {/* Chart Container */}
      <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold text-xl text-foreground">
              Your Skill Genome
            </h3>
            <p className="text-muted-foreground text-sm">Live visualization demo</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Analyzing</span>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
              <PolarGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="Skills"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Nodes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8;
            const radius = 120;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            );
          })}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">72%</p>
            <p className="text-sm text-muted-foreground">Overall Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-foreground">8</p>
            <p className="text-sm text-muted-foreground">Skills Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Need Focus</p>
          </div>
        </div>

        {/* Decorative Holographic Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* Rotating Rings */}
          <motion.div
            className="absolute inset-[10%] border border-cyan-500/20 rounded-full border-dashed"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[15%] border border-purple-500/20 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ borderTopColor: "transparent", borderBottomColor: "transparent" }}
          />

          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg" />
        </div>
      </div>
    </motion.div>
  );
};
