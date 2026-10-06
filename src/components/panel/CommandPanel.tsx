import React, { useState } from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { NotchHeader } from "./NotchHeader";
import { AgentCardLeft } from "./AgentCardLeft";
import { ModelSelectorRight } from "./ModelSelectorRight";
import { AddModelModal } from "./AddModelModal";
import { AgentTerminal } from "../terminal/AgentTerminal";
import { Send, CheckCircle } from "lucide-react";

export const CommandPanel: React.FC = () => {
  const {
    activeNav,
    activeAgent,
    sessions,
    appendOutput,
    handleSocketEvent,
    clearSession,
  } = useAgentStore();

  const [promptInput, setPromptInput] = useState("");
  const currentSession = sessions[activeAgent];

  const handleSendPrompt = async () => {
    if (!promptInput.trim()) return;
    const text = promptInput.trim();
    setPromptInput("");

    appendOutput(activeAgent, `> ${text}`);

    if ((window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const cmd = activeAgent === "antigravity" ? "agy" : "hermes";
        await invoke("spawn_agent_pty", {
          sessionId: currentSession.id,
          command: cmd,
          args: ["--prompt", text],
          cwd: null,
          cols: 80,
          rows: 24,
        });
      } catch (err) {
        appendOutput(activeAgent, `[Erreur lancement] ${String(err)}`);
      }
    } else {
      // Mock simulation in browser
      handleSocketEvent({
        type: "agent_connect",
        agent: activeAgent,
        session_id: `mock-${Date.now()}`,
        prompt: text,
      });

      setTimeout(() => {
        handleSocketEvent({
          type: "diff_update",
          agent: activeAgent,
          session_id: currentSession.id,
          file_path: "src/core.rs",
          additions: 18,
          deletions: 4,
          diff: "@@ -1,5 +1,19 @@\n+pub fn execute() {\n+    println!(\"Bark active\");\n+}",
        });
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col w-[740px] bg-black text-white rounded-b-[24px] shadow-2xl border-x border-b border-neutral-800/80 overflow-hidden select-none">
      {/* Top Notch Header Bar */}
      <NotchHeader />

      {/* Main Content Area */}
      <div className="p-3">
        {activeNav === "home" && (
          <div className="flex items-stretch gap-3">
            {/* Left Card: Large Pug + Metrics & Recent Activities */}
            <AgentCardLeft />

            {/* Right Card: Model / Agent Selection Grid */}
            <ModelSelectorRight />
          </div>
        )}

        {activeNav === "chat" && (
          <div className="flex flex-col h-[320px] space-y-2">
            <div className="flex-1 overflow-hidden">
              <AgentTerminal
                lines={currentSession.outputLines}
                onClear={() => clearSession(activeAgent)}
              />
            </div>

            {/* Prompt Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={`Envoyer une consigne directe à ${
                  activeAgent === "antigravity" ? "Antigravity" : "Hermes Agent"
                }...`}
                className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-sans"
              />
              <button
                type="submit"
                disabled={!promptInput.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30"
              >
                <Send size={13} />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        )}

        {activeNav === "add" && <AddModelModal />}

        {activeNav === "settings" && (
          <div className="p-2 space-y-2.5 text-xs text-neutral-300 bg-[#141418] border border-[#24242b] rounded-2xl p-3.5">
            <div className="font-bold text-white flex items-center gap-1.5 border-b border-neutral-800 pb-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <span>Paramètres du Socket & Raccourcis Bark</span>
            </div>

            <div className="text-neutral-400 space-y-1">
              <p>
                Serveur Socket : <code className="text-amber-300 bg-black/60 px-1 py-0.5 rounded font-mono">/run/user/1000/bark.sock</code>
              </p>
              <p>
                Mode d'affichage : <span className="text-white font-semibold">Encoche Supérieure (Notch)</span> collée au haut de l'écran.
              </p>
              <p>
                Raccourci fermeture : Touche <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-white">Échap</kbd>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
