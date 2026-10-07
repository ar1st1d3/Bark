import React, { useState, useEffect } from "react";
import {
  Code2,
  FolderCode,
  Palette,
  Terminal,
  ExternalLink,
  BookOpen,
  RefreshCw,
} from "lucide-react";

interface VSCodeWorkspaceItem {
  name: string;
  path: string;
  is_current: boolean;
}

interface VSCodeInfo {
  installed: boolean;
  version: string;
  developer: string;
  active_theme: string;
  total_workspaces: number;
  current_project: string;
  current_path: string;
  workspaces: VSCodeWorkspaceItem[];
  status: string;
}

const fallbackInfo: VSCodeInfo = {
  installed: true,
  version: "1.134.0",
  developer: "Aristide",
  active_theme: "Dark+ (vs-dark)",
  total_workspaces: 10,
  current_project: "Bark",
  current_path: "~/Desktop/dev/Bark",
  workspaces: [
    { name: "Bark", path: "~/Desktop/dev/Bark", is_current: true },
    { name: "TP_Complexite", path: "~/Desktop/dev/AlgoAv/TP_Complexite", is_current: false },
    { name: "web_reactoops", path: "~/HTB/web_reactoops", is_current: false },
    { name: "TP_Recursivité", path: "~/Desktop/dev/AlgoAv/TP_Recursivité", is_current: false },
  ],
  status: "connected",
};

export const VSCodeCard: React.FC = () => {
  const [info, setInfo] = useState<VSCodeInfo>(fallbackInfo);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "workspaces">("overview");

  // Dynamically load VS Code info from local OS & configuration via Tauri
  const loadVSCodeData = async () => {
    setIsRefreshing(true);
    if ((window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const res = await invoke<VSCodeInfo>("get_vscode_info");
        if (res) {
          setInfo(res);
        }
      } catch (err) {
        console.warn("Failed to load dynamic VS Code info:", err);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadVSCodeData();
  }, []);

  const openVSCode = (targetPath?: string) => {
    const rawPath = targetPath || info.current_path;
    // Normalize path
    const resolvedPath = rawPath.startsWith("~")
      ? rawPath.replace("~", "")
      : rawPath;
    const uri = `vscode://file${resolvedPath.startsWith("/") ? resolvedPath : `/${resolvedPath}`}`;

    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/plugin-shell")
        .then(({ open }) => open(uri))
        .catch(() => window.open(uri, "_blank"));
    } else {
      window.open(uri, "_blank");
    }
  };

  // Official VS Code Icon SVG
  const VSCodeLogo = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path
        d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.43-3.36a.798.798 0 0 0-1.04.07L.28 7.08a.798.798 0 0 0 0 1.13l3.77 3.79-3.77 3.79a.798.798 0 0 0 0 1.13l1.295 1.24a.798.798 0 0 0 1.04.07l4.43-3.36 9.46 8.63a1.49 1.49 0 0 0 1.705.29l4.94-2.377A1.5 1.5 0 0 0 24 20.013V3.987a1.5 1.5 0 0 0-.85-1.4zM18 17.518l-7.23-5.518L18 6.482v11.036z"
        fill="#007acc"
      />
    </svg>
  );

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#18181b] border border-[#007acc]/40 rounded-2xl p-3 text-white shadow-2xl select-none overflow-hidden relative">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          {/* VS Code Icon Badge */}
          <div className="w-8 h-8 rounded-lg bg-[#007acc]/15 border border-[#007acc]/40 flex items-center justify-center flex-shrink-0">
            <VSCodeLogo />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm text-neutral-100 tracking-tight">
                VS Code
              </span>
              <span className="text-[11px] text-[#007acc] font-mono font-medium">
                {info.developer}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
              {info.installed ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>IDE Bridge Connecté</span>
                  <span className="text-neutral-500">•</span>
                  <span className="font-mono text-neutral-400">v{info.version}</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-amber-300">CLI non détecté</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab(activeTab === "overview" ? "workspaces" : "overview")}
            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#27272a] hover:bg-[#3f3f46] text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Basculer entre la vue d'ensemble et les workspaces"
          >
            <BookOpen size={10} />
            <span>{activeTab === "overview" ? "Projets" : "Stats"}</span>
          </button>

          <button
            onClick={loadVSCodeData}
            disabled={isRefreshing}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 bg-[#27272a] hover:bg-[#3f3f46] transition-colors cursor-pointer"
            title="Re-scanner VS Code"
          >
            <RefreshCw
              size={11}
              className={isRefreshing ? "animate-spin text-[#007acc]" : ""}
            />
          </button>

          <button
            onClick={() => openVSCode()}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#007acc] hover:bg-[#0062a3] text-white shadow-sm transition-colors cursor-pointer"
            title="Ouvrir le projet actuel dans VS Code"
          >
            <ExternalLink size={10} />
            <span>Ouvrir</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "overview" ? (
        <div className="flex flex-col justify-between flex-1 pt-2 gap-2">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Workspaces Metric */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#202024] border border-[#2e2e33] hover:border-[#007acc]/60 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-[#007acc]/15 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                <FolderCode size={15} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-base font-mono text-white">
                  {info.total_workspaces}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Workspaces
                </span>
              </div>
            </div>

            {/* Theme Metric */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#202024] border border-[#2e2e33] hover:border-purple-500/50 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Palette size={15} />
              </div>
              <div className="flex flex-col leading-tight truncate">
                <span className="font-bold text-xs font-mono text-neutral-200 truncate">
                  {info.active_theme.split(" ")[0]}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Thème
                </span>
              </div>
            </div>

            {/* Binary / Environment Metric */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#202024] border border-[#2e2e33] hover:border-emerald-500/50 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Terminal size={15} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-xs font-mono text-emerald-300">
                  {info.installed ? "Actif" : "Standby"}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Statut
                </span>
              </div>
            </div>
          </div>

          {/* Active Workspace Banner */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#202024] border border-[#2e2e33] text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007acc] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007acc]" />
              </span>
              <span className="text-[11px] text-neutral-300 font-mono truncate">
                Projet : <strong className="text-white">{info.current_project}</strong> ({info.current_path})
              </span>
            </div>
            <button
              onClick={() => openVSCode(info.current_path)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#007acc]/20 text-[#38bdf8] font-medium hover:bg-[#007acc]/30 transition-colors cursor-pointer"
            >
              Lancer
            </button>
          </div>
        </div>
      ) : (
        /* Workspaces List View dynamically from user's storage */
        <div className="flex flex-col gap-1.5 flex-1 pt-1.5 overflow-y-auto max-h-[140px] pr-1">
          {info.workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-xs py-4">
              <FolderCode size={20} className="mb-1 opacity-50" />
              <span>Aucun workspace récent détecté</span>
            </div>
          ) : (
            info.workspaces.map((ws) => (
              <div
                key={ws.path}
                onClick={() => openVSCode(ws.path)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#202024] border border-[#2e2e33] hover:border-[#007acc]/50 transition-colors text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Code2 size={13} className="text-[#007acc] flex-shrink-0" />
                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-200 text-[11px] truncate group-hover:text-white">
                        {ws.name}
                      </span>
                      {ws.is_current && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#007acc]/20 text-[#38bdf8] border border-[#007acc]/40">
                          Actuel
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono truncate">
                      {ws.path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 text-neutral-500 group-hover:text-[#38bdf8] transition-colors">
                  <ExternalLink size={11} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
