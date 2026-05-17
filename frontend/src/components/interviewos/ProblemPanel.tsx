import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PublicInterviewProblem } from "@/features/interviewos/contracts";
import { BookOpen, Braces, FileText, Lock, Sparkles } from "lucide-react";

interface ProblemPanelProps {
  problem: PublicInterviewProblem | null;
  roundIndex: number;
  personaLabel?: string;
}

export const ProblemPanel = ({ problem, roundIndex, personaLabel }: ProblemPanelProps) => {
  if (!problem) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-600 bg-[#252527]">
        <Sparkles className="w-8 h-8 text-gray-700" />
        <p className="text-sm">Waiting for interview problem...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="description" className="h-full flex flex-col bg-[#252527] text-white">
      {/* Tab bar */}
      <div className="h-11 border-b border-white/8 bg-[#2E2E30] px-4 flex items-center justify-between shrink-0">
        <TabsList className="h-8 bg-transparent p-0 gap-0">
          {[
            { value: "description", label: "Description", Icon: FileText },
            { value: "examples", label: "Examples", Icon: Braces },
            { value: "notes", label: "Notes", Icon: BookOpen },
          ].map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="px-3 h-8 text-[13px] text-gray-400 rounded-none border-b-2 border-transparent
                data-[state=active]:border-cyan-400 data-[state=active]:text-white
                data-[state=active]:bg-transparent data-[state=active]:shadow-none
                hover:text-gray-200 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Persona + lock badges */}
        {personaLabel && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5">
              {personaLabel}
            </span>
            <Lock className="w-3.5 h-3.5 text-gray-600" />
          </div>
        )}
      </div>

      {/* Description tab */}
      <TabsContent value="description" className="flex-1 min-h-0 mt-0">
        <ScrollArea className="h-full">
          <div className="px-6 py-6">
            {/* Round + tag badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center rounded-full bg-[#1A1A1C] border border-white/8 px-3 py-1 text-[12px] font-medium text-gray-300">
                Round {roundIndex + 1}
              </span>
              <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-[12px] font-medium text-cyan-300">
                Adaptive
              </span>
              <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-[12px] font-medium text-violet-300">
                <Lock className="w-3 h-3 mr-1" />
                Metadata Locked
              </span>
            </div>

            <h1 className="text-[22px] font-bold text-white leading-tight mb-5" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              Hidden Interview Problem
            </h1>

            <div className="text-[15px] leading-[1.85] text-gray-200 whitespace-pre-wrap">{problem.prompt}</div>

            {problem.constraints?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[15px] font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-cyan-400 inline-block" />
                  Constraints
                </h2>
                <div className="space-y-1.5 text-[14px] leading-7 text-gray-300">
                  {problem.constraints.map((c) => (
                    <div key={c} className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {problem.functionSignature && (
              <div className="mt-8">
                <h2 className="text-[15px] font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-emerald-400 inline-block" />
                  Function Signature
                </h2>
                <pre className="rounded-xl bg-[#1A1A1C] border border-white/8 p-4 text-[13px] text-emerald-300 overflow-x-auto font-mono leading-relaxed">
                  {problem.functionSignature}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Examples tab */}
      <TabsContent value="examples" className="flex-1 min-h-0 mt-0">
        <ScrollArea className="h-full">
          <div className="px-6 py-6 space-y-7">
            {problem.examples?.map((example, i) => (
              <div key={`${example.input}-${i}`}>
                <h2 className="text-[14px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Example {i + 1}</h2>
                <div className="rounded-xl bg-[#1A1A1C] border border-white/8 p-4 space-y-2 text-[14px] font-mono">
                  <div>
                    <span className="text-gray-500">Input: </span>
                    <span className="text-gray-100">{example.input}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Output: </span>
                    <span className="text-emerald-300">{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="pt-2 border-t border-white/5 text-gray-400 text-[13px] font-sans leading-relaxed">
                      {example.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Notes tab */}
      <TabsContent value="notes" className="flex-1 min-h-0 mt-0">
        <ScrollArea className="h-full">
          <div className="px-6 py-6">
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4 mb-5">
              <p className="text-[13px] text-amber-200/80 leading-relaxed">
                💡 Approach tip: Explain the brute-force idea first, then justify your optimized solution.
              </p>
            </div>
            <div className="space-y-3 text-[14px] leading-7 text-gray-300">
              <p>• Be explicit about time complexity, space complexity, and edge cases.</p>
              <p>• This round is meant to feel like a real interviewer-led screen.</p>
              {problem.notes?.map((note) => (
                <p key={note}>• {note}</p>
              ))}
            </div>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
