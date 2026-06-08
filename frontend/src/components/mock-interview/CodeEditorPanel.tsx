/**
 * Code Editor Panel — Right side of the interview room.
 * Lightweight editor + language selector + Judge0 terminal compiler outputs.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiPython, SiJavascript, SiCplusplus } from "react-icons/si";
import { FaJava } from "react-icons/fa";
import {
  Play, Upload, ChevronDown, Terminal, CheckCircle2, XCircle,
  Eye, EyeOff, Clock, Cpu, Loader2, Code2, FileCode, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InterviewQuestion } from "@/services/mockInterviewAPI";

interface TestResult {
  passed: boolean;
  input: any;
  expected: any;
  actual: string;
  runtime_ms: number | null;
  memory_kb: number | null;
  status: string;
  stderr?: string;
  compile_output?: string;
}

interface Props {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  question: InterviewQuestion | null;
  onRun: (customInput?: string) => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  testResults: TestResult[] | null;
  codeReview: any;
  consoleOutput: string;
}

const LANGUAGES = [
  { id: "python", label: "Python", Icon: SiPython, iconClassName: "text-[#3776AB]" },
  { id: "javascript", label: "JavaScript", Icon: SiJavascript, iconClassName: "text-[#F7DF1E]" },
  { id: "java", label: "Java", Icon: FaJava, iconClassName: "text-[#ED8B00]" },
  { id: "cpp", label: "C++", Icon: SiCplusplus, iconClassName: "text-[#00599C]" },
];

const STARTER_CODE: Record<string, string> = {
  python: `class Solution:\n    def solve(self, nums, target):\n        # Your solution here\n        pass\n`,
  javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction solve(nums, target) {\n    // Your solution here\n}\n`,
  java: `class Solution {\n    public int[] solve(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}\n`,
  cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        // Your solution here\n        return {};\n    }\n};\n`,
};

export const CodeEditorPanel = ({
  code, setCode, language, setLanguage, question,
  onRun, onSubmit, isRunning, isSubmitting,
  testResults, codeReview, consoleOutput,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"editor" | "testcases" | "console">("editor");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [lineCount, setLineCount] = useState(1);

  // Sync starter code
  useEffect(() => {
    if (!code) {
      setCode(STARTER_CODE[language] || "");
    }
  }, [language]);

  // Synchronize line numbers for textarea
  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(lines || 1);
  }, [code]);

  const handleLangChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang] || "");
    setShowLangMenu(false);
  };

  // Automatically switch tab when execution finishes
  useEffect(() => {
    if (isRunning) {
      setActiveTab("console");
    }
  }, [isRunning]);

  useEffect(() => {
    if (testResults && testResults.length > 0) {
      setActiveTab("testcases");
    }
  }, [testResults]);

  return (
    <div className="h-full flex flex-col bg-[#0C0C10]">
      {/* Toolbar */}
      <div className="h-11 px-3 flex items-center justify-between border-b border-white/[0.06] bg-[#0A0A0F]/80 shrink-0">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white hover:bg-white/[0.08] transition-colors"
            >
              {(() => {
                const selectedLanguage = LANGUAGES.find((l) => l.id === language);
                if (!selectedLanguage) return null;
                return <selectedLanguage.Icon className={`w-4 h-4 ${selectedLanguage.iconClassName}`} />;
              })()}
              <span>{LANGUAGES.find((l) => l.id === language)?.label}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>
            {showLangMenu && (
              <div className="absolute top-full left-0 mt-1 z-50 w-40 rounded-xl bg-[#111116] border border-white/[0.08] shadow-2xl overflow-hidden">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLangChange(lang.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      language === lang.id ? "bg-cyan-500/10 text-cyan-400" : "text-gray-400 hover:bg-white/[0.04]"
                    }`}
                  >
                    <lang.Icon className={`w-4 h-4 ${lang.iconClassName}`} />
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tab Buttons */}
          <div className="flex items-center bg-white/[0.03] rounded-lg border border-white/[0.04] p-0.5">
            {(["editor", "testcases", "console"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  activeTab === tab ? "bg-white/[0.08] text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "editor" ? "Code" : tab === "testcases" ? "Test Cases" : "Sandbox Terminal"}
              </button>
            ))}
          </div>
        </div>

        {/* Run / Submit */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onRun(customInput)}
            disabled={isRunning || isSubmitting}
            size="sm"
            className="h-7 px-3 text-[10px] bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]"
          >
            {isRunning ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
            Run via Judge0
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            size="sm"
            className="h-7 px-3 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
            Submit
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "editor" && (
          <div className="h-full flex flex-col">
            {/* Editor Area with Line Numbers */}
            <div className="flex-1 flex overflow-hidden bg-[#0C0C10]">
              {/* Line number strip */}
              <div className="w-10 select-none py-4 text-right pr-3 font-mono text-[11px] text-gray-700 bg-[#0A0A0F]/50 border-r border-white/[0.03]">
                {Array.from({ length: lineCount }).map((_, idx) => (
                  <div key={idx} className="h-6 leading-6">
                    {idx + 1}
                  </div>
                ))}
              </div>

              {/* Real textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 p-4 bg-transparent text-sm font-mono text-gray-200 resize-none focus:outline-none leading-6 border-none overflow-y-auto"
                style={{ tabSize: 4 }}
                placeholder="// Write your solution here..."
              />
            </div>

            {/* Custom Input */}
            <div className="border-t border-white/[0.06] p-3 bg-[#0A0A0F]/50">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Custom Input Arguments</p>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full h-16 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-cyan-500/30"
                placeholder="Enter custom stdin arguments to pass to Judge0 Sandbox..."
              />
            </div>
          </div>
        )}

        {activeTab === "testcases" && (
          <div className="h-full overflow-y-auto p-4 space-y-3 bg-[#0C0C10]">
            {/* Visible Test Cases */}
            {question?.testCases?.map((tc, i) => {
              const result = testResults?.[i];
              return (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02]">
                    <span className="text-xs font-medium text-gray-400">Case {i + 1}</span>
                    {result && (
                      <div className="flex items-center gap-2">
                        {result.runtime_ms !== null && (
                          <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" /> {result.runtime_ms}ms
                          </span>
                        )}
                        <span className={`flex items-center gap-1 text-[10px] font-medium ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                          {result.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {result.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Input</p>
                      <code className="text-xs text-cyan-400 font-mono">{JSON.stringify(tc.input)}</code>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Expected</p>
                      <code className="text-xs text-emerald-400 font-mono">{JSON.stringify(tc.expected)}</code>
                    </div>
                    {result && (
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Got</p>
                        <code className={`text-xs font-mono ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                          {result.actual || "Empty stdout output"}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            {testResults && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <p className="text-sm font-semibold text-white">
                  {testResults.filter((r: any) => r.passed).length} / {testResults.length} Test Cases Passed
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "console" && (
          <div className="h-full p-4 overflow-y-auto bg-[#0C0C10] flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-gray-400">Judge0 Live Execution Output</span>
              </div>
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-5 bg-[#07070B] rounded-xl p-4 border border-white/[0.04] min-h-[160px] shadow-inner">
                {consoleOutput || "Run your code to compile inside the Judge0 sandbox..."}
              </pre>
            </div>

            {/* Code Review Panel */}
            {codeReview && (
              <div className="mt-2 space-y-3">
                <h4 className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> AI Quality Assessment Summary
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Correctness", score: codeReview.correctness?.score },
                    { label: "Time Complex", score: codeReview.timeComplexity?.score },
                    { label: "Space Complex", score: codeReview.spaceComplexity?.score },
                    { label: "Code Quality", score: codeReview.codeQuality?.score },
                    { label: "Edge Cases", score: codeReview.edgeCases?.score },
                    { label: "Overall", score: codeReview.overallScore },
                  ].map(({ label, score }) => (
                    <div key={label} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] text-center">
                      <p className="text-lg font-bold" style={{ color: (score ?? 0) >= 70 ? "#10B981" : (score ?? 0) >= 40 ? "#F59E0B" : "#EF4444" }}>
                        {score ?? "–"}
                      </p>
                      <p className="text-[9px] text-gray-500 uppercase">{label}</p>
                    </div>
                  ))}
                </div>
                {codeReview.feedback && (
                  <p className="text-xs text-gray-400 leading-relaxed bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                    {codeReview.feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
