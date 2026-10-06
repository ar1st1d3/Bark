import React from "react";
import { useAgentStore } from "../../../store/useAgentStore";
import { ShieldCheck, Terminal, FileCode, Search } from "lucide-react";

export const SecurityTab: React.FC = () => {
  const { settings, updateSecurityConfig } = useAgentStore();
  const sec = settings.security;

  return (
    <div className="flex flex-col gap-2.5 max-h-[225px] overflow-y-auto pr-1 select-none text-xs">
      {/* Intro Banner */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#111116] border border-[#22222a] text-neutral-300">
        <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
        <span className="text-[11px] leading-relaxed">
          Bark protège votre poste de travail en interceptant les actions sensibles avant leur exécution par Antigravity ou Hermes.
        </span>
      </div>

      {/* Security Policies List */}
      <div className="space-y-2">
        {/* Policy 1: Bash commands */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#111116] border border-[#22222a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400">
              <Terminal size={14} />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">
                Commandes Shell & Bash (<code className="text-[10px] text-amber-300">run_command</code>)
              </div>
              <div className="text-[10px] text-neutral-400">
                Toujours exiger une autorisation manuelle avant d'exécuter dans le terminal.
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sec.requireApprovalBash}
              onChange={(e) =>
                updateSecurityConfig({ requireApprovalBash: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Policy 2: File edits */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#111116] border border-[#22222a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-blue-400">
              <FileCode size={14} />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">
                Écriture & Modification de fichiers (<code className="text-[10px] text-blue-300">write_to_file</code>)
              </div>
              <div className="text-[10px] text-neutral-400">
                Ouvrir l'inspecteur de diffs et demander confirmation avant application.
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sec.requireApprovalWrite}
              onChange={(e) =>
                updateSecurityConfig({ requireApprovalWrite: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Policy 3: Read-only auto approval */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#111116] border border-[#22222a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-purple-400">
              <Search size={14} />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">
                Opérations en lecture seule (<code className="text-[10px] text-purple-300">read_file, grep</code>)
              </div>
              <div className="text-[10px] text-neutral-400">
                Auto-approuver silencieusement pour une analyse fluide sans interruption.
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sec.autoApproveRead}
              onChange={(e) =>
                updateSecurityConfig({ autoApproveRead: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
