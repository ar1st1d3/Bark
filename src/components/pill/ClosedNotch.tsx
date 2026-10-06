import React from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { PugCharacter } from "../mascot/PugCharacter";

export const ClosedNotch: React.FC = () => {
  const { activeAgent, sessions, setIsExpanded, pendingApproval, pendingQuestion } =
    useAgentStore();

  const currentSession = sessions[activeAgent];
  const hasAlert = Boolean(pendingApproval || pendingQuestion);
  const pugState = hasAlert ? "alert" : currentSession.status;

  return (
    <div
      onClick={() => setIsExpanded(true)}
      className="group relative flex items-center justify-center w-[84px] h-[40px] bg-black text-white rounded-b-[20px] shadow-2xl cursor-pointer select-none transition-all duration-200 border-x border-b border-neutral-800/80 hover:h-[44px] hover:border-neutral-700"
      title="Bark — Cliquez pour ouvrir le centre de commande"
    >
      {/* Notch wing left corner blend */}
      <div className="absolute -left-[10px] top-0 w-[10px] h-[10px] bg-transparent pointer-events-none overflow-hidden">
        <div className="w-full h-full rounded-tr-[10px] shadow-[4px_-4px_0_0_#000000]" />
      </div>

      {/* Notch wing right corner blend */}
      <div className="absolute -right-[10px] top-0 w-[10px] h-[10px] bg-transparent pointer-events-none overflow-hidden">
        <div className="w-full h-full rounded-tl-[10px] shadow-[-4px_-4px_0_0_#000000]" />
      </div>

      {/* Centered Pug Mascot */}
      <div className="transform -translate-y-0.5 transition-transform group-hover:scale-105">
        <PugCharacter state={pugState} size={34} />
      </div>

      {/* Alert dot if permission waiting */}
      {hasAlert && (
        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
      )}
    </div>
  );
};
