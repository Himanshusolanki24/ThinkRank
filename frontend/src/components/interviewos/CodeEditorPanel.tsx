import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Braces, CheckCircle2, ChevronDown, Maximize2, RotateCcw, Undo2, XCircle } from "lucide-react";

interface CodeEditorPanelProps {
  code: string;
  setCode: (value: string) => void;
  isLoading: boolean;
  onType?: () => void;
  lastEvaluation?: { score: number; feedback: string } | null;
}

const SCORE_LABELS: Record<string, string> = {
  problemSolving: "Problem Solving",
  optimization: "Optimization",
  communication: "Communication",
  debugging: "Debugging",
  edgeCase: "Edge Cases",
  confidence: "Confidence",
};

const scoreColor = (s: number) =>
  s >= 8 ? "bg-emerald-500" : s >= 6 ? "bg-cyan-500" : s >= 4 ? "bg-amber-500" : "bg-red-500";

const scoreTextColor = (s: number) =>
  s >= 8 ? "text-emerald-400" : s >= 6 ? "text-cyan-400" : s >= 4 ? "text-amber-400" : "text-red-400";

export const CodeEditorPanel = ({ code, setCode, isLoading, onType, lastEvaluation }: CodeEditorPanelProps) => {
  const [bottomTab, setBottomTab] = useState<"testcase" | "result">("result");

  const lineNumbers = useMemo(() => {
    const count = Math.max(code.split("\n").length, 22);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [code]);

  return (
    <div className="h-full flex flex-col bg-[#252527] text-white">
      {/* Editor header */}
      <div className="h-11 border-b border-white/8 bg-[#2E2E30] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[13px]">
          <Braces className="w-4 h-4" />
          <span>Code</span>
        </div>
        <Maximize2 className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-400 transition-colors" />
      </div>

      {/* Language bar */}
      <div className="h-10 border-b border-white/8 bg-[#222224] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-[13px] text-gray-300">
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            JavaScript <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">Auto</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <Bookmark className="w-3.5 h-3.5 cursor-pointer hover:text-gray-300 transition-colors" />
          <Undo2 className="w-3.5 h-3.5 cursor-pointer hover:text-gray-300 transition-colors" />
          <RotateCcw className="w-3.5 h-3.5 cursor-pointer hover:text-gray-300 transition-colors" />
        </div>
      </div>

      {/* Code area */}
      <div className="flex-1 min-h-0 border-b border-white/8">
        <div className="h-full flex">
          {/* Line numbers */}
          <div className="w-12 bg-[#1E1E20] border-r border-white/6 py-3 pr-3 text-right select-none shrink-0">
            {lineNumbers.map((n) => (
              <div key={n} className="h-[26px] leading-[26px] text-[13px] font-mono text-gray-600">{n}</div>
            ))}
          </div>
          {/* Editor */}
          <textarea
            value={code}
            onChange={(e) => { setCode(e.target.value); onType?.(); }}
            spellCheck={false}
            disabled={isLoading}
            className="flex-1 bg-[#252527] text-gray-100 font-mono text-[13px] leading-[26px] px-4 py-3 resize-none outline-none border-0 disabled:opacity-60"
            placeholder="// Write your solution here..."
          />
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="h-10 border-b border-white/8 px-4 bg-[#2A2A2C] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {(["testcase", "result"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setBottomTab(tab)}
              className={`text-[13px] pb-0.5 border-b-2 transition-all ${
                bottomTab === tab ? "text-white border-cyan-400" : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab === "testcase" ? "Testcase" : "Test Result"}
            </button>
          ))}
        </div>
        <span className="text-gray-600 text-sm">⌄</span>
      </div>

      {/* Bottom panel */}
      <div className="h-52 bg-[#1E1E20] shrink-0">
        <ScrollArea className="h-full">
          {bottomTab === "result" ? (
            lastEvaluation ? (
              <div className="p-5">
                {/* Score header */}
                <div className="flex items-center gap-3 mb-5">
                  {lastEvaluation.score >= 6 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className={`text-xl font-bold ${scoreTextColor(lastEvaluation.score)}`}>
                      {lastEvaluation.score}/10
                    </span>
                    <span className="text-gray-500 text-sm ml-2">Overall Score</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full h-1.5 rounded-full bg-white/8 mb-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${scoreColor(lastEvaluation.score)}`}
                    style={{ width: `${lastEvaluation.score * 10}%` }}
                  />
                </div>

                {/* Feedback */}
                <p className="text-[12px] text-gray-500 italic leading-relaxed">{lastEvaluation.feedback}</p>
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex items-center justify-center text-gray-600 text-[14px]">
                Run your solution to see results
              </div>
            )
          ) : (
            <div className="p-4 text-gray-500 text-sm">Custom testcase input area will appear here.</div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
