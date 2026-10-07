import React, { useState } from "react";
import {
  Code2,
  FolderCode,
  Palette,
  Terminal,
  ExternalLink,
  BookOpen,
} from "lucide-react";

interface VSCodeProfile {
  developer: string;
  version: string;
  activeTheme: string;
  totalWorkspaces: number;
  currentProject: string;
  currentPath: string;
  status: "connected" | "standby";
}

interface RecentWorkspace {
  name: string;
  path: string;
  isCurrent?: boolean;
}

const initialProfile: VSCodeProfile = {
  developer: "Aristide",
  version: "1.134.0",
  activeTheme: "Dark+ (vs-dark)",
  totalWorkspaces: 10,
  currentProject: "Bark",
  currentPath: "~/Desktop/dev/Bark",
  status: "connected",
};

const recentWorkspaces: RecentWorkspace[] = [
  {
    name: "Bark",
    path: "~/Desktop/dev/Bark",
    isCurrent: true,
  },
  {
    name: "TP_Complexite",
    path: "~/Desktop/dev/AlgoAv/TP_Complexite",
  },
  {
    name: "web_reactoops",
    path: "~/HTB/web_reactoops",
  },
  {
    name: "TP_Recursivité",
    path: "~/Desktop/dev/AlgoAv/TP_Recursivité",
  },
];

export const VSCodeCard: React.FC = () => {
  const [profile] = useState<VSCodeProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<"overview" | "workspaces">("overview");

  const openVSCode = (path: string = "/home/aristide/Desktop/dev/Bark") => {
    const uri = `vscode://file${path.startsWith("/") ? path : `/${path}`}`;
    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/plugin-shell").then(({ open }) => {
        open(uri).catch(() => window.open(uri, "_blank"));
      }).catch(() => {
        window.open(uri, "_blank");
      });
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
                {profile.developer}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>IDE Bridge Connecté</span>
              <span className="text-neutral-500">•</span>
              <span className="font-mono text-neutral-400">v{profile.version}</span>
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
            onClick={() => openVSCode("/home/aristide/Desktop/dev/Bark")}
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
                  {profile.totalWorkspaces}
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
                  Dark+
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
                  Linux x64
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Moteur
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
                Projet : <strong className="text-white">{profile.currentProject}</strong> ({profile.currentPath})
              </span>
            </div>
            <button
              onClick={() => openVSCode("/home/aristide/Desktop/dev/Bark")}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#007acc]/20 text-[#38bdf8] font-medium hover:bg-[#007acc]/30 transition-colors cursor-pointer"
            >
              Lancer
            </button>
          </div>
        </div>
      ) : (
        /* Workspaces List View */
        <div className="flex flex-col gap-1.5 flex-1 pt-1.5 overflow-hidden">
          {recentWorkspaces.map((ws) => (
            <div
              key={ws.name}
              onClick={() => openVSCode(ws.path.replace("~", "/home/aristide"))}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#202024] border border-[#2e2e33] hover:border-[#007acc]/50 transition-colors text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <Code2 size={13} className="text-[#007acc] flex-shrink-0" />
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-200 text-[11px] truncate group-hover:text-white">
                      {ws.name}
                    </span>
                    {ws.isCurrent && (
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
          ))}
        </div>
      )}
    </div>
  );
};
