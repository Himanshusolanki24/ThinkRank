import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, Calendar, Award } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================
interface ActivityData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  loading?: boolean;
  year?: number;
}

// ============================================================================
// CONSTANTS - GitHub-style with Violet/Purple theme
// ============================================================================
const ACTIVITY_COLORS = [
  "rgba(22, 22, 34, 1)",      // 0 - empty
  "rgba(76, 29, 149, 0.6)",   // 1-2 - light purple
  "rgba(109, 40, 217, 0.7)",  // 3-5 - violet
  "rgba(139, 92, 246, 0.85)", // 6-9 - bright violet
  "rgba(167, 139, 250, 1)",   // 10+ - light violet
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const CELL_SIZE = 14;
const CELL_GAP = 4;
const CELL_RADIUS = 3;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getActivityLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
};

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTooltipDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================
const HeatmapTooltip = ({
  content,
  count,
  position
}: {
  content: string;
  count: number;
  position: { x: number; y: number } | null;
}) => {
  if (!position) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[100] pointer-events-none"
      style={{
        left: position.x,
        top: position.y - 60,
        transform: "translateX(-50%)",
      }}
    >
      <div
        className="px-3 py-2 rounded-xl text-sm font-medium shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(15, 15, 25, 0.98) 0%, rgba(25, 20, 40, 0.98) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.15)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: ACTIVITY_COLORS[getActivityLevel(count)] }}
          />
          <span className="text-white">{content}</span>
        </div>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2"
        style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid rgba(139, 92, 246, 0.4)",
        }}
      />
    </motion.div>
  );
};

// ============================================================================
// STATS BAR
// ============================================================================
const StatsBar = ({
  totalContributions,
  currentStreak,
  longestStreak,
  mostActiveDay
}: {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveDay: string;
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    {[
      { icon: Calendar, label: "Total", value: totalContributions, color: "text-violet-400", bg: "bg-violet-500/10" },
      { icon: Flame, label: "Current Streak", value: `${currentStreak}d`, color: "text-orange-400", bg: "bg-orange-500/10" },
      { icon: Award, label: "Longest Streak", value: `${longestStreak}d`, color: "text-amber-400", bg: "bg-amber-500/10" },
      { icon: Calendar, label: "Best Day", value: mostActiveDay, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    ].map((stat, i) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
      >
        <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
          <stat.icon className={`w-4 h-4 ${stat.color}`} />
        </div>
        <div>
          <p className="text-lg font-bold text-white">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

// ============================================================================
// LEGEND COMPONENT
// ============================================================================
const HeatmapLegend = () => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500">Less</span>
    {ACTIVITY_COLORS.map((color, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.2 }}
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "3px",
          backgroundColor: color,
          border: i === 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
        }}
      />
    ))}
    <span className="text-xs text-gray-500">More</span>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const ActivityHeatmap = ({ data, loading = false, year: propYear }: ActivityHeatmapProps) => {
  const [tooltip, setTooltip] = useState<{
    content: string;
    count: number;
    position: { x: number; y: number }
  } | null>(null);
  const [currentYear, setCurrentYear] = useState(propYear ?? new Date().getFullYear());

  // Activity lookup map
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => map.set(item.date, item.count));
    return map;
  }, [data]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalContributions = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let maxCount = 0;
    let mostActiveDay = "-";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort dates
    const sortedDates = [...data].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedDates.forEach((item) => {
      totalContributions += item.count;
      if (item.count > maxCount) {
        maxCount = item.count;
        const d = new Date(item.date);
        mostActiveDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    });

    // Calculate streaks
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = formatDateKey(date);
      const count = activityMap.get(key) || 0;

      if (count > 0) {
        tempStreak++;
        if (i === 0 || currentStreak === i) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { totalContributions, currentStreak, longestStreak, mostActiveDay };
  }, [data, activityMap]);

  // Generate calendar grid
  const { weeks, monthLabels } = useMemo(() => {
    const weeksArray: (Date | null)[][] = [];
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const gridStart = new Date(yearStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    let cursor = new Date(gridStart);

    while (cursor <= yearEnd || weeksArray[weeksArray.length - 1]?.length < 7) {
      const week: (Date | null)[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(cursor);
        if (cellDate.getFullYear() === currentYear) {
          week.push(cellDate);
        } else {
          week.push(null);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      weeksArray.push(week);
      if (cursor > yearEnd && week.length === 7) break;
      if (weeksArray.length > 54) break;
    }

    const monthLabelPositions: { name: string; colIndex: number }[] = [];
    let currentMonth = -1;

    weeksArray.forEach((week, colIdx) => {
      const firstValidDate = week.find((d) => d !== null);
      if (firstValidDate) {
        const month = firstValidDate.getMonth();
        if (month !== currentMonth) {
          monthLabelPositions.push({ name: MONTHS[month], colIndex: colIdx });
          currentMonth = month;
        }
      }
    });

    return { weeks: weeksArray, monthLabels: monthLabelPositions };
  }, [currentYear]);

  // Tooltip handlers
  const showTooltip = useCallback((e: React.MouseEvent, count: number, date: Date) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      content: `${count} contribution${count !== 1 ? "s" : ""} on ${formatTooltipDate(date)}`,
      count,
      position: { x: rect.left + rect.width / 2, y: rect.top },
    });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const isFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading activity data...</p>
        </div>
      </div>
    );
  }

  const gridWidth = weeks.length * CELL_SIZE + (weeks.length - 1) * CELL_GAP + 40;

  return (
    <div className="w-full">
      {/* Stats Bar */}
      <StatsBar {...stats} />

      {/* Year Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentYear(y => y - 1)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-lg font-semibold text-white min-w-[60px] text-center">
            {currentYear}
          </span>
          <button
            onClick={() => setCurrentYear(y => y + 1)}
            disabled={currentYear >= new Date().getFullYear()}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <HeatmapLegend />
      </div>

      {/* Heatmap Grid */}
      <div
        className="overflow-x-auto pb-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139, 92, 246, 0.3) transparent" }}
      >
        <div style={{ minWidth: gridWidth }}>
          {/* Month labels */}
          <div className="flex mb-2" style={{ marginLeft: "40px", gap: `${CELL_GAP}px` }}>
            {weeks.map((_, colIdx) => {
              const label = monthLabels.find((m) => m.colIndex === colIdx);
              return (
                <div
                  key={`month-${colIdx}`}
                  style={{ width: `${CELL_SIZE}px`, flexShrink: 0 }}
                  className="text-[10px] text-gray-500 font-medium"
                >
                  {label?.name || ""}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex">
            {/* Weekday labels */}
            <div className="flex flex-col mr-2" style={{ gap: `${CELL_GAP}px` }}>
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={`day-${idx}`}
                  className="flex items-center justify-end text-[10px] text-gray-500"
                  style={{ height: `${CELL_SIZE}px`, width: "32px" }}
                >
                  {idx % 2 === 1 ? day : ""}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex" style={{ gap: `${CELL_GAP}px` }}>
              {weeks.map((week, colIdx) => (
                <div key={`week-${colIdx}`} className="flex flex-col" style={{ gap: `${CELL_GAP}px` }}>
                  {week.map((date, rowIdx) => {
                    if (!date) {
                      return <div key={`${colIdx}-${rowIdx}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
                    }

                    const dateKey = formatDateKey(date);
                    const count = activityMap.get(dateKey) || 0;
                    const level = getActivityLevel(count);
                    const future = isFuture(date);

                    return (
                      <motion.div
                        key={`${colIdx}-${rowIdx}`}
                        whileHover={!future ? { scale: 1.3, zIndex: 10 } : {}}
                        onMouseEnter={(e) => !future && showTooltip(e, count, date)}
                        onMouseLeave={hideTooltip}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: CELL_RADIUS,
                          backgroundColor: future ? "rgba(255,255,255,0.02)" : ACTIVITY_COLORS[level],
                          border: future
                            ? "1px solid rgba(255,255,255,0.05)"
                            : level > 0
                              ? "1px solid rgba(139, 92, 246, 0.2)"
                              : "1px solid rgba(255,255,255,0.05)",
                          opacity: future ? 0.3 : 1,
                          cursor: future ? "default" : "pointer",
                          transition: "all 150ms ease",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <HeatmapTooltip content={tooltip.content} count={tooltip.count} position={tooltip.position} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityHeatmap;
