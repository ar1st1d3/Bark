import React from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { PugCharacter } from "../mascot/PugCharacter";
import { Check, X, Zap, ShieldAlert, HelpCircle, Terminal, FileEdit } from "lucide-react";

export const AgentCardLeft: React.FC = () => {
  const {
    activeAgent,
    selectedModelId,
    models,
    sessions,
    pendingApproval,
    pendingQuestion,
    submitApproval,
  } = useAgentStore();

  const currentSession = sessions[activeAgent];
  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  const hasAlert = Boolean(pendingApproval || pendingQuestion);
  const pugState = hasAlert ? "alert" : currentSession.status;

  const totalAdditions = currentSession.diffs.reduce((sum, d) => sum + d.additions, 0);
  const totalDeletions = currentSession.diffs.reduce((sum, d) => sum + d.deletions, 0);

  // Clean formatted tool action preview
  const formatToolContent = () => {
    if (!pendingApproval) return null;
    const { tool, args, description } = pendingApproval;

    if (tool === "run_command" && args?.command) {
      return (
        <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-200 bg-black/70 px-2.5 py-1.5 rounded-lg border border-neutral-800/80 truncate">
          <Terminal size={12} className="text-amber-400 flex-shrink-0" />
          <span className="truncate text-amber-200">$ {args.command}</span>
        </div>
      );
    }

    if (tool === "write_to_file" && (args?.TargetFile || args?.path)) {
      const p = args.TargetFile || args.path;
      return (
        <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-200 bg-black/70 px-2.5 py-1.5 rounded-lg border border-neutral-800/80 truncate">
          <FileEdit size={12} className="text-blue-400 flex-shrink-0" />
          <span className="truncate text-blue-200">{p}</span>
        </div>
      );
    }

    return (
      <div className="font-mono text-xs text-neutral-300 bg-black/70 px-2.5 py-1.5 rounded-lg border border-neutral-800/80 truncate">
        {description || (typeof args === "object" ? JSON.stringify(args) : String(args))}
      </div>
    );
  };

  // If tool approval is pending
  if (pendingApproval) {
    return (
      <div className="flex-1 flex items-center gap-3.5 bg-[#141418] border border-red-500/50 rounded-2xl p-3 text-white shadow-xl overflow-hidden select-none">
        <div className="flex-shrink-0 flex items-center justify-center">
          <PugCharacter state="alert" size={72} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
          {/* Header : "Demande d'autorisation" only */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
            <ShieldAlert size={14} className="flex-shrink-0" />
            <span className="truncate">Demande d'autorisation</span>
          </div>

          {/* Formatted clean tool preview */}
          <div className="my-1.5">
            {formatToolContent()}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => submitApproval(pendingApproval.id, "approved")}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <Check size={13} />
              <span>Autoriser</span>
            </button>
            <button
              onClick={() => submitApproval(pendingApproval.id, "denied")}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-lg transition-colors"
            >
              <X size={13} />
              <span>Refuser</span>
            </button>
            <button
              onClick={() => submitApproval(pendingApproval.id, "always")}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 text-xs font-semibold rounded-lg border border-purple-500/30 transition-colors"
              title="Toujours autoriser pour cette session"
            >
              <Zap size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If question is pending
  if (pendingQuestion) {
    return (
      <div className="flex-1 flex items-center gap-3.5 bg-[#141418] border border-amber-500/50 rounded-2xl p-3 text-white shadow-xl overflow-hidden select-none">
        <div className="flex-shrink-0 flex items-center justify-center">
          <PugCharacter state="alert" size={72} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <HelpCircle size={14} className="flex-shrink-0" />
            <span className="truncate">{pendingQuestion.question}</span>
          </div>

          <div className="space-y-1 my-1">
            {pendingQuestion.options.slice(0, 2).map((opt, i) => (
              <button
                key={i}
                onClick={() => submitApproval(pendingQuestion.id, "approved", { answer: opt })}
                className="w-full text-left px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 truncate transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Standard Left Card layout
  return (
    <div className="flex-1 flex items-center gap-4 bg-[#141418] border border-[#24242b] rounded-2xl p-3.5 text-white shadow-inner select-none overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-center">
        <PugCharacter state={pugState} size={74} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 mb-0.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: activeModel.color }}
          />
          <span className="font-bold text-white tracking-wide">{activeModel.name}</span>
          <span className="text-neutral-500 text-[11px] font-normal truncate">
            {activeModel.subtitle}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 text-xl font-extrabold tracking-tight text-white mb-2 font-mono">
          <span>
            {totalAdditions > 0 || totalDeletions > 0
              ? `+${totalAdditions} -${totalDeletions}`
              : `${currentSession.stepCount}`}
          </span>
          <span className="text-[10px] font-semibold text-neutral-400 tracking-normal">
            {totalAdditions > 0 ? "DIFFS" : "ÉTAPES"}
          </span>
        </div>

        <div className="space-y-1 text-xs">
          {currentSession.recentActivities.slice(0, 3).map((act, index) => (
            <div
              key={act.id}
              className="flex items-center justify-between text-[11px] text-neutral-300 font-medium"
            >
              <div className="flex items-center gap-1.5 truncate pr-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    index === 0
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-neutral-600"
                  }`}
                />
                <span className="truncate text-neutral-200">{act.text}</span>
              </div>
              <span className="text-neutral-500 font-mono text-[10px] flex-shrink-0">
                {act.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
