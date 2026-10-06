import React from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { NotchHeader } from "./NotchHeader";
import { AgentCardLeft } from "./AgentCardLeft";
import { ModelSelectorRight } from "./ModelSelectorRight";
import { FriendlyChat } from "./FriendlyChat";
import { CodeDiffViewer } from "./CodeDiffViewer";
import { SettingsPanel } from "./settings/SettingsPanel";

export const CommandPanel: React.FC = () => {
  const { activeNav } = useAgentStore();

  return (
    <div className="flex flex-col w-[750px] bg-black text-white rounded-b-[24px] shadow-2xl border-x border-b border-neutral-800/80 overflow-hidden select-none">
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

        {activeNav === "code" && (
          <CodeDiffViewer />
        )}

        {activeNav === "chat" && (
          <FriendlyChat />
        )}

        {activeNav === "settings" && (
          <SettingsPanel />
        )}
      </div>
    </div>
  );
};
