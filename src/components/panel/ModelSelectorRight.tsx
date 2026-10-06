import React from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { AgentModel } from "../../types/agent";

export const ModelSelectorRight: React.FC = () => {
  const { models, selectedModelId, setSelectedModel } = useAgentStore();

  // Mini Squircle Mascot SVG generator for each model pill
  const renderMiniMascot = (color: string) => (
    <svg viewBox="0 0 40 40" className="w-5 h-5 flex-shrink-0 drop-shadow-sm">
      {/* Mini Squircle Head */}
      <rect x="4" y="8" width="32" height="24" rx="8" fill={color} />
      {/* Eyes */}
      <circle cx="14" cy="20" r="2.2" fill="#0f0b09" />
      <circle cx="26" cy="20" r="2.2" fill="#0f0b09" />
    </svg>
  );

  return (
    <div className="w-[300px] flex flex-col justify-center bg-[#141418] border border-[#24242b] rounded-2xl p-3 text-white shadow-inner select-none">
      {/* 2x2 or 2x3 Grid of Model/Agent Pills */}
      <div className="grid grid-cols-2 gap-2">
        {models.slice(0, 4).map((model: AgentModel) => {
          const isSelected = model.id === selectedModelId;
          return (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 border ${
                isSelected
                  ? "bg-neutral-800/90 text-white border-neutral-600 shadow-md ring-1 ring-neutral-500/30 scale-[1.02]"
                  : "bg-neutral-900/60 hover:bg-neutral-800/60 text-neutral-300 border-neutral-800/70 hover:border-neutral-700"
              }`}
            >
              {/* Mini Mascot Icon */}
              {renderMiniMascot(model.mascotColor)}

              {/* Model Label */}
              <span className="truncate text-[11px] font-medium">{model.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
