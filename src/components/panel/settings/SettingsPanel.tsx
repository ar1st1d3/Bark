import React, { useState } from "react";
import { AgentConnectorTab } from "./AgentConnectorTab";
import { ToolsTab } from "./ToolsTab";
import { SocketGatewayTab } from "./SocketGatewayTab";
import { SecurityTab } from "./SecurityTab";
import { GeneralTab } from "./GeneralTab";
import { Bot, Radio, ShieldCheck, SlidersHorizontal } from "lucide-react";

type SettingsSubTab = "agents" | "tools" | "socket" | "security" | "general";

export const SettingsPanel: React.FC = () => {
  const [subTab, setSubTab] = useState<SettingsSubTab>("agents");

  return (
    <div className="flex flex-col h-[440px] bg-[#141418] border border-[#24242b] rounded-2xl p-3.5 text-white shadow-inner select-none justify-between">
      {/* Sub-tab Navigation Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/60">
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800/80">
          <button
            onClick={() => setSubTab("agents")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === "agents"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Bot size={13} className="text-blue-400" />
            <span>IA & Modèles</span>
          </button>

          <button
            onClick={() => setSubTab("tools")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === "tools"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-emerald-400">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub & Outils</span>
          </button>

          <button
            onClick={() => setSubTab("socket")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              subTab === "socket"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Radio size={13} className="text-emerald-400" />
            <span>Passerelle Socket</span>
          </button>

          <button
            onClick={() => setSubTab("security")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              subTab === "security"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <ShieldCheck size={13} className="text-amber-400" />
            <span>Sécurité</span>
          </button>

          <button
            onClick={() => setSubTab("general")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              subTab === "general"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <SlidersHorizontal size={13} className="text-purple-400" />
            <span>Général</span>
          </button>
        </div>

        <span className="text-[10px] text-neutral-500 font-medium tracking-wide">
          Paramètres Bark
        </span>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 pt-2">
        {subTab === "agents" && <AgentConnectorTab />}
        {subTab === "tools" && <ToolsTab />}
        {subTab === "socket" && <SocketGatewayTab />}
        {subTab === "security" && <SecurityTab />}
        {subTab === "general" && <GeneralTab />}
      </div>
    </div>
  );
};
