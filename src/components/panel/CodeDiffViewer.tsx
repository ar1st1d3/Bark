import React, { useState } from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { PugCharacter } from "../mascot/PugCharacter";
import { Check, Circle, Terminal } from "lucide-react";
import { FileLogo } from "./FileLogo";

export const CodeDiffViewer: React.FC = () => {
  const { activeAgent, models, selectedModelId, sessions } = useAgentStore();
  const currentSession = sessions[activeAgent];
  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  // Default sample diff if none available yet
  const diffs = currentSession.diffs.length > 0 ? currentSession.diffs : [
    {
      filePath: "src/invoice.ts",
      additions: 1,
      deletions: 1,
      diff: `10   import { Item } from './types'
11
12 - const TVA = 0.196
12 + const TVA = 0.20
13
14   export function total(items: Item[]) {
15     const sum = items.reduce((s, i) => s + i.price, 0)
16     return sum * (1 + TVA)
17   }`
    }
  ];

  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const activeDiff = diffs[selectedFileIndex] || diffs[0];


  const actionStep = currentSession.actionStep || "edit";

  // Step item renderer
  const renderStep = (
    stepKey: "read" | "edit" | "bash" | "done",
    label: string,
    Icon: any
  ) => {
    const isCurrent = actionStep === stepKey;
    const isPast =
      (stepKey === "read" && actionStep !== "read") ||
      (stepKey === "edit" && (actionStep === "bash" || actionStep === "done")) ||
      (stepKey === "bash" && actionStep === "done") ||
      (stepKey === "done" && actionStep === "done");

    return (
      <div
        className={`flex items-center gap-2 text-xs transition-colors ${
          isCurrent
            ? "text-white font-bold"
            : isPast
            ? "text-neutral-300"
            : "text-neutral-500"
        }`}
      >
        {isPast ? (
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check size={10} strokeWidth={3} />
          </div>
        ) : isCurrent ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <Circle size={4} className="fill-white text-white" />
          </div>
        ) : (
          <Icon size={12} className="text-neutral-600" />
        )}
        <span className="text-[11px] tracking-wide">{label}</span>
      </div>
    );
  };

  // Syntax highlighter parser for diff snippet
  const renderDiffLines = () => {
    if (!activeDiff.diff) {
      return (
        <div className="text-neutral-500 italic p-3 text-xs">
          Aucun diff détaillé disponible.
        </div>
      );
    }

    const lines = activeDiff.diff.split("\n");
    let currentLineNum = 10;
    const hunkMatch = activeDiff.diff.match(/@@ -(\d+)/);
    if (hunkMatch) {
      currentLineNum = parseInt(hunkMatch[1], 10);
    }

    return lines.map((line, idx) => {
      // Hunk headers like "@@ -1,5 +1,12 @@"
      if (line.startsWith("@@")) {
        return (
          <div
            key={idx}
            className="flex items-center px-3 py-1 bg-neutral-900/60 font-mono text-[10px] text-cyan-400/80 border-y border-neutral-800/40 select-none"
          >
            <span className="w-7 text-neutral-600 text-right pr-3">...</span>
            <span className="truncate">{line}</span>
          </div>
        );
      }

      // Check if line starts with line number or unified diff sign
      // e.g. "12 - const TVA = 0.196" or "- const TVA = 0.196"
      const match = line.match(/^(\d+)?\s*([+-])?\s*(.*)$/);
      let explicitNum = match?.[1];
      const sign = match?.[2] || (line.startsWith("-") ? "-" : line.startsWith("+") ? "+" : "");
      let content = match?.[3] ?? line;
      if (!match?.[1] && (line.startsWith("-") || line.startsWith("+"))) {
        content = line.slice(1);
      }

      const isDel = sign === "-";
      const isAdd = sign === "+";

      let displayNum = explicitNum || String(currentLineNum);
      if (!explicitNum && !isDel) {
        currentLineNum++;
      }

      let lineBg = "hover:bg-neutral-800/30";
      let signColor = "text-neutral-600";
      let textColor = "text-neutral-300";

      if (isDel) {
        lineBg = "bg-[#451418]/60 text-red-200";
        signColor = "text-red-400 font-bold";
        textColor = "text-red-200";
      } else if (isAdd) {
        lineBg = "bg-[#0d3b24]/60 text-emerald-200";
        signColor = "text-emerald-400 font-bold";
        textColor = "text-emerald-200 font-medium";
      }

      // Syntax highlight keywords & symbols
      const highlightSyntax = (text: string) => {
        const tokenRegex =
          /(import|export|function|return|from|const|let|var|Item|TVA|\d+\.?\d*|'[^']*'|"[^"]*"|`[^`]*`)/g;
        const parts = text.split(tokenRegex);
        return parts.map((part, i) => {
          if (!part) return null;
          if (["import", "export", "function", "return", "from"].includes(part)) {
            return (
              <span key={i} className="text-purple-400 font-semibold">
                {part}
              </span>
            );
          }
          if (["const", "let", "var"].includes(part)) {
            return (
              <span key={i} className="text-blue-400 font-semibold">
                {part}
              </span>
            );
          }
          if (part === "Item") {
            return (
              <span key={i} className="text-amber-300 font-semibold">
                {part}
              </span>
            );
          }
          if (part === "TVA") {
            return (
              <span key={i} className="text-sky-300 font-semibold">
                {part}
              </span>
            );
          }
          if (part.startsWith("'") || part.startsWith('"') || part.startsWith("`")) {
            return (
              <span key={i} className="text-emerald-400">
                {part}
              </span>
            );
          }
          if (/^\d+(\.\d+)?$/.test(part)) {
            return (
              <span key={i} className="text-amber-400 font-mono">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        });
      };

      return (
        <div
          key={idx}
          className={`flex items-center px-3 py-0.5 leading-relaxed font-mono text-[11px] transition-colors ${lineBg}`}
        >
          {/* Line number */}
          <span className="w-7 text-neutral-600 select-none text-right pr-3 font-mono text-[10px]">
            {displayNum}
          </span>

          {/* Diff Sign */}
          <span className={`w-3 select-none text-center ${signColor}`}>
            {isDel ? "-" : isAdd ? "+" : " "}
          </span>

          {/* Line content */}
          <span className={`pl-2 truncate flex-1 ${textColor}`}>
            {highlightSyntax(content)}
            {/* Blinking cursor on added line like screenshot */}
            {isAdd && (
              <span className="inline-block w-1.5 h-3.5 bg-neutral-100 ml-1.5 align-middle animate-pulse" />
            )}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="flex items-stretch gap-3 w-full h-[260px] bg-[#141418] border border-[#24242b] rounded-2xl p-3.5 text-white shadow-inner select-none overflow-hidden">
      {/* Left Column: Mascot, Agent info, Checklist */}
      <div className="w-[140px] flex flex-col justify-between py-1 select-none flex-shrink-0 border-r border-neutral-800/60 pr-3">
        <div>
          {/* Mascot with purple badge */}
          <div className="relative inline-block mb-1.5">
            <PugCharacter state="working" size={60} />
            <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-purple-600 border border-purple-400/50 flex items-center justify-center shadow-md">
              <span className="text-[8px] font-black tracking-widest text-white select-none">···</span>
            </div>
          </div>

          {/* Agent Name & Subtitle matching 'korus / Claude Code' in screenshot */}
          <div className="text-xs font-bold text-white tracking-wide truncate">
            {activeModel.name}
          </div>
          <div className="text-[10px] text-neutral-400 font-medium truncate">
            {activeModel.subtitle}
          </div>
        </div>

        {/* 4-Step Checklist (Read, Edit, Bash, Done) */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-800/50">
          {renderStep("read", "Read", Check)}
          {renderStep("edit", "Edit", Circle)}
          {renderStep("bash", "Bash", Terminal)}
          {renderStep("done", "Done", Check)}
        </div>
      </div>

      {/* Right Column: Code & Diff Inspector */}
      <div className="flex-1 flex flex-col justify-between bg-[#0e0e12] border border-[#202026] rounded-xl overflow-hidden shadow-inner">
        {/* File Header Tab(s) */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#141418] border-b border-[#202026] text-xs">
          <div className="flex items-center gap-2 overflow-x-auto max-w-[360px]">
            {diffs.map((d, index) => {
              const fName = d.filePath.split("/").pop() || d.filePath;
              const isSel = index === selectedFileIndex;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedFileIndex(index)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    isSel
                      ? "bg-[#1f1f28] text-white border border-[#2e2e38] shadow-sm ring-1 ring-white/10"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                  }`}
                >
                  {/* Real File Type Logo */}
                  <FileLogo filename={fName} className="w-3.5 h-3.5 flex-shrink-0 drop-shadow-sm" />

                  <span className="font-bold text-neutral-200 font-mono text-[11px] truncate max-w-[120px]">
                    {fName}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                </button>
              );
            })}
          </div>

          {/* File path on the right with FileLogo */}
          <div
            className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 truncate max-w-[200px] bg-black/40 px-2 py-0.5 rounded-md border border-neutral-800/60"
            title={activeDiff.filePath}
          >
            <FileLogo filename={activeDiff.filePath} className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{activeDiff.filePath}</span>
          </div>
        </div>

        {/* Code Diff Body */}
        <div className="flex-1 overflow-y-auto py-2 font-mono text-xs select-text scroll-smooth">
          {renderDiffLines()}
        </div>
      </div>
    </div>
  );
};
