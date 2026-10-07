import React from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { AgentModel } from "../../types/agent";

export const ModelSelectorRight: React.FC = () => {
  const { models, selectedModelId, setSelectedModel } = useAgentStore();

  // Render specific icon for GitHub and VS Code, or mini mascot for AI agents
  const renderIcon = (model: AgentModel) => {
    if (model.id === "github") {
      return (
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md bg-neutral-800 text-white">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
      );
    }

    if (model.id === "vscode") {
      return (
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md bg-[#007acc]/20 text-[#38bdf8]">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#007acc]">
            <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.43-3.36a.798.798 0 0 0-1.04.07L.28 7.08a.798.798 0 0 0 0 1.13l3.77 3.79-3.77 3.79a.798.798 0 0 0 0 1.13l1.295 1.24a.798.798 0 0 0 1.04.07l4.43-3.36 9.46 8.63a1.49 1.49 0 0 0 1.705.29l4.94-2.377A1.5 1.5 0 0 0 24 20.013V3.987a1.5 1.5 0 0 0-.85-1.4zM18 17.518l-7.23-5.518L18 6.482v11.036z" />
          </svg>
        </div>
      );
    }

    return (
      <svg viewBox="0 0 40 40" className="w-5 h-5 flex-shrink-0 drop-shadow-sm">
        <rect x="4" y="8" width="32" height="24" rx="8" fill={model.mascotColor} />
        <circle cx="14" cy="20" r="2.2" fill="#0f0b09" />
        <circle cx="26" cy="20" r="2.2" fill="#0f0b09" />
      </svg>
    );
  };

  return (
    <div className="w-[300px] flex flex-col justify-center bg-[#141418] border border-[#24242b] rounded-2xl p-3 text-white shadow-inner select-none">
      {/* 2x2 or 2x3 Grid of Model/Agent Pills */}
      <div className="grid grid-cols-2 gap-2">
        {models.slice(0, 4).map((model: AgentModel) => {
          const isSelected = model.id === selectedModelId;
          const isGitHub = model.id === "github";
          const isVSCode = model.id === "vscode";

          return (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 border cursor-pointer ${
                isSelected
                  ? isGitHub
                    ? "bg-[#161b22] text-white border-[#30363d] shadow-md ring-1 ring-neutral-400/30 scale-[1.02]"
                    : isVSCode
                    ? "bg-[#1e1e24] text-white border-[#007acc]/70 shadow-md ring-1 ring-[#007acc]/40 scale-[1.02]"
                    : "bg-neutral-800/90 text-white border-neutral-600 shadow-md ring-1 ring-neutral-500/30 scale-[1.02]"
                  : "bg-neutral-900/60 hover:bg-neutral-800/60 text-neutral-300 border-neutral-800/70 hover:border-neutral-700"
              }`}
            >
              {/* Dynamic Icon */}
              {renderIcon(model)}

              {/* Model Label */}
              <span className="truncate text-[11px] font-medium">{model.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
