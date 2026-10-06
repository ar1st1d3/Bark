import React from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { NotchHeader } from "./NotchHeader";
import { AgentCardLeft } from "./AgentCardLeft";
import { ModelSelectorRight } from "./ModelSelectorRight";
import { FriendlyChat } from "./FriendlyChat";
import { CheckCircle } from "lucide-react";

export const CommandPanel: React.FC = () => {
  const { activeNav } = useAgentStore();

  return (
    <div className="flex flex-col w-[740px] bg-black text-white rounded-b-[24px] shadow-2xl border-x border-b border-neutral-800/80 overflow-hidden select-none">
      {/* Top Notch Header Bar */}
      <NotchHeader />

      {/* Main Content Area */}
      <div className="p-3">
        {activeNav === "home" && (
          <div className="flex items-stretch gap-3">
            {/* Left Card: Large Pug + Metrics & Recent Activities / Approval */}
            <AgentCardLeft />

            {/* Right Card: Model / Agent Selection Grid */}
            <ModelSelectorRight />
          </div>
        )}

        {activeNav === "chat" && (
          <FriendlyChat />
        )}

        {activeNav === "settings" && (
          <div className="p-3.5 space-y-2 text-xs text-neutral-300 bg-[#141418] border border-[#24242b] rounded-2xl">
            <div className="font-bold text-white flex items-center gap-1.5 border-b border-neutral-800 pb-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <span>Configuration du Socket & Informations Système</span>
            </div>

            <div className="text-neutral-400 space-y-1.5 pt-1">
              <p>
                Serveur Socket : <code className="text-amber-300 bg-black/60 px-1.5 py-0.5 rounded font-mono">/run/user/1000/bark.sock</code>
              </p>
              <p>
                Moteur d'affichage : <span className="text-white font-semibold">Encoche Supérieure Opaque (X11 / Linux)</span>
              </p>
              <p>
                Raccourci de repli : Touche <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-white">Échap</kbd>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
