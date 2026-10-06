import React, { useState } from "react";
import { AgentConnectorTab } from "./AgentConnectorTab";
import { SocketGatewayTab } from "./SocketGatewayTab";
import { SecurityTab } from "./SecurityTab";
import { GeneralTab } from "./GeneralTab";
import { Bot, Radio, ShieldCheck, SlidersHorizontal } from "lucide-react";

type SettingsSubTab = "agents" | "socket" | "security" | "general";

export const SettingsPanel: React.FC = () => {
  const [subTab, setSubTab] = useState<SettingsSubTab>("agents");

  return (
    <div className="flex flex-col h-[260px] bg-[#141418] border border-[#24242b] rounded-2xl p-3 text-white shadow-inner select-none justify-between">
      {/* Sub-tab Navigation Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800/80">
          <button
            onClick={() => setSubTab("agents")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              subTab === "agents"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Bot size={13} className="text-blue-400" />
            <span>IA & Modèles</span>
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
        {subTab === "socket" && <SocketGatewayTab />}
        {subTab === "security" && <SecurityTab />}
        {subTab === "general" && <GeneralTab />}
      </div>
    </div>
  );
};
