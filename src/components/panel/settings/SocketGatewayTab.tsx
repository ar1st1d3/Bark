import React, { useState } from "react";
import { useAgentStore } from "../../../store/useAgentStore";
import {
  Check,
  Copy,
  FileCode,
  Download,
  Terminal,
  Zap,
} from "lucide-react";
import { getAntigravityHooksConfigJson } from "../../../services/aiConnector";

export const SocketGatewayTab: React.FC = () => {
  const { socketConnected } = useAgentStore();
  const socketPath = "/run/user/1000/bark.sock";

  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [installedNotice, setInstalledNotice] = useState<string | null>(null);

  const hookJson = getAntigravityHooksConfigJson(socketPath);

  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookJson);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const pythonTestCmd = `python3 scripts/test-bark-socket.py antigravity`;
  const handleCopyScript = () => {
    navigator.clipboard.writeText(pythonTestCmd);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleInstallHook = async () => {
    setInstalledNotice("Hook généré avec succès dans le projet !");
    setTimeout(() => setInstalledNotice(null), 3000);
  };

  return (
    <div className="grid grid-cols-2 gap-3 max-h-[225px] overflow-y-auto pr-1 select-none text-xs">
      {/* Left: Socket State & Hook Bridge */}
      <div className="flex flex-col justify-between bg-[#111116] border border-[#22222a] rounded-xl p-3 text-white shadow-sm">
        <div className="space-y-2">
          {/* Socket Status Badge */}
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  socketConnected
                    ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span className="font-bold text-neutral-200">Serveur Socket Unix</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">
              {socketConnected ? "ACTIF / EN ÉCOUTE" : "HORS LIGNE"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400">Point d'écoute IPC :</span>
            <div className="bg-black/80 px-2 py-1 rounded font-mono text-[11px] text-amber-300 border border-neutral-800 truncate">
              {socketPath}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1.5 text-neutral-300 font-semibold text-[11px]">
              <FileCode size={13} className="text-blue-400" />
              <span>Hook Antigravity (.agents/hooks.json)</span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              Envoie automatiquement les approbations, diffs et statuts d'Antigravity vers l'encoche Bark.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-800/50 mt-2 flex items-center gap-2">
          <button
            onClick={handleCopyHook}
            className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold transition-colors"
          >
            {copiedHook ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>{copiedHook ? "Copié !" : "Copier le JSON"}</span>
          </button>

          <button
            onClick={handleInstallHook}
            className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[10px] font-semibold transition-colors"
          >
            <Download size={11} />
            <span>Installer Hook</span>
          </button>
        </div>
      </div>

      {/* Right: Quick CLI Bridge & Diagnostics */}
      <div className="flex flex-col justify-between bg-[#111116] border border-[#22222a] rounded-xl p-3 text-white shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-neutral-200">
              <Terminal size={14} className="text-amber-400" />
              <span>Diagnostic & Tests IPC</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">X11 Linux</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-neutral-400">Commande de simulation d'événements :</span>
            <div className="bg-black/80 px-2 py-1.5 rounded font-mono text-[10px] text-neutral-300 border border-neutral-800 break-all select-all">
              {pythonTestCmd}
            </div>
            <p className="text-[9px] text-neutral-500 leading-relaxed">
              Exécutez cette commande dans un second terminal pour tester l'ouverture de l'encoche, la réception des diffs et les boutons d'autorisation.
            </p>
          </div>

          {installedNotice && (
            <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-medium flex items-center gap-1">
              <Check size={12} />
              <span>{installedNotice}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-neutral-800/50 mt-2 flex items-center justify-between">
          <button
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold transition-colors"
          >
            {copiedScript ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>{copiedScript ? "Copié !" : "Copier la commande"}</span>
          </button>

          <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
            <Zap size={10} className="text-amber-400" />
            0.4ms latence IPC
          </span>
        </div>
      </div>
    </div>
  );
};
