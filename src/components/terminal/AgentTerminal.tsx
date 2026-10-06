import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Trash2, Copy, Check } from "lucide-react";

interface AgentTerminalProps {
  lines: string[];
  onClear?: () => void;
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({ lines, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#111114] border border-[#24242a] rounded-xl overflow-hidden font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#17171c] border-b border-[#24242a] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <TerminalIcon size={13} />
          <span className="font-semibold text-neutral-300">Terminal d'Exécution</span>
          <span className="text-[10px] px-1.5 rounded bg-black/50 text-neutral-400 font-mono">
            {lines.length} lignes
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Copier"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="p-1 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
              title="Effacer"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 select-text scroll-smooth"
      >
        {lines.length === 0 ? (
          <div className="text-neutral-600 italic">En attente de commandes...</div>
        ) : (
          lines.map((l, i) => (
            <div
              key={i}
              className={`leading-relaxed whitespace-pre-wrap ${
                l.includes("[Error]") || l.includes("Erreur")
                  ? "text-red-400 font-semibold"
                  : l.includes("[Tool]")
                  ? "text-blue-300"
                  : l.includes("[Result")
                  ? "text-emerald-400"
                  : l.includes("[Session")
                  ? "text-amber-300 font-bold"
                  : "text-neutral-300"
              }`}
            >
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
