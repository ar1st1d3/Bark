import React from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { PugCharacter } from "../mascot/PugCharacter";
import { Check, X, Zap, ShieldAlert, HelpCircle } from "lucide-react";

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

  // Total lines changed metric
  const totalAdditions = currentSession.diffs.reduce((sum, d) => sum + d.additions, 0);
  const totalDeletions = currentSession.diffs.reduce((sum, d) => sum + d.deletions, 0);

  // If tool approval is pending, render interactive decision panel
  if (pendingApproval) {
    return (
      <div className="flex-1 flex items-center gap-3.5 bg-[#141418] border border-red-500/40 rounded-2xl p-3 text-white shadow-lg overflow-hidden animate-pulse">
        <PugCharacter state="alert" size={72} />

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
              <ShieldAlert size={14} />
              <span className="truncate">Demande d'autorisation — {pendingApproval.tool}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-mono">
              action critique
            </span>
          </div>

          <div className="text-xs text-neutral-300 font-mono bg-black/60 px-2 py-1.5 rounded-lg my-1 truncate border border-neutral-800">
            {typeof pendingApproval.args === "object"
              ? JSON.stringify(pendingApproval.args)
              : String(pendingApproval.args)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => submitApproval(pendingApproval.id, "approved")}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
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
              className="flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 text-xs font-semibold rounded-lg border border-purple-500/30 transition-colors"
              title="Toujours autoriser"
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
      <div className="flex-1 flex items-center gap-3.5 bg-[#141418] border border-amber-500/40 rounded-2xl p-3 text-white shadow-lg overflow-hidden">
        <PugCharacter state="alert" size={72} />

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <HelpCircle size={14} />
            <span className="truncate">{pendingQuestion.question}</span>
          </div>

          <div className="space-y-1 my-1">
            {pendingQuestion.options.slice(0, 2).map((opt, i) => (
              <button
                key={i}
                onClick={() => submitApproval(pendingQuestion.id, "approved", { answer: opt })}
                className="w-full text-left px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 truncate transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Standard Left Card layout (identical to user screenshot)
  return (
    <div className="flex-1 flex items-center gap-4 bg-[#141418] border border-[#24242b] rounded-2xl p-3.5 text-white shadow-inner select-none overflow-hidden">
      {/* Large Pug Mascot */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <PugCharacter state={pugState} size={74} />
      </div>

      {/* Metrics & Recent Activities */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Title & Agent badge */}
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

        {/* Primary Metric Number (matching "1,255.42" style from screenshot) */}
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

        {/* Recent Activity Rows (matching Sarah L., Camille R. list from screenshot) */}
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
