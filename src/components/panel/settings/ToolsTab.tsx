import React, { useState, useEffect } from "react";
import { useAgentStore } from "../../../store/useAgentStore";
import {
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  Trash2,
  RefreshCw,
  ShieldCheck,
  FolderCode,
  Palette,
  Terminal,
  Code2,
} from "lucide-react";
import { pugAudio } from "../../mascot/PugAudio";

interface VSCodeInfo {
  installed: boolean;
  version: string;
  developer: string;
  active_theme: string;
  total_workspaces: number;
  current_project: string;
  current_path: string;
  status: string;
}

export const ToolsTab: React.FC = () => {
  const { settings, updateGitHubConfig } = useAgentStore();

  // GitHub Token State
  const [githubToken, setGithubToken] = useState<string>(settings.github?.token || "");
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isTestingGit, setIsTestingGit] = useState<boolean>(false);
  const [gitTestResult, setGitTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // VS Code Local State
  const [vsInfo, setVsInfo] = useState<VSCodeInfo>({
    installed: true,
    version: "1.134.0",
    developer: "Aristide",
    active_theme: "Dark+ (vs-dark)",
    total_workspaces: 10,
    current_project: "Bark",
    current_path: "~/Desktop/dev/Bark",
    status: "connected",
  });
  const [isScanningVs, setIsScanningVs] = useState<boolean>(false);

  // Scan VS Code
  const handleScanVSCode = async () => {
    setIsScanningVs(true);
    if ((window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const res = await invoke<VSCodeInfo>("get_vscode_info");
        if (res) {
          setVsInfo(res);
          pugAudio.playChime();
        }
      } catch (err) {
        console.warn("Failed to scan VS Code:", err);
      } finally {
        setIsScanningVs(false);
      }
    } else {
      setTimeout(() => setIsScanningVs(false), 400);
    }
  };

  useEffect(() => {
    handleScanVSCode();
  }, []);

  const handleOpenVSCode = () => {
    const uri = "vscode://file/home/aristide/Desktop/dev/Bark";
    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/plugin-shell")
        .then(({ open }) => open(uri))
        .catch(() => window.open(uri, "_blank"));
    } else {
      window.open(uri, "_blank");
    }
  };

  // Test and save GitHub token
  const handleSaveAndTestToken = async () => {
    const trimmed = githubToken.trim();
    if (!trimmed) {
      updateGitHubConfig({ token: "" });
      setGitTestResult({ success: true, message: "Token supprimé. Quota : 60 req/h." });
      return;
    }

    setIsTestingGit(true);
    setGitTestResult(null);

    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${trimmed}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        updateGitHubConfig({ token: trimmed, username: data.login });
        localStorage.setItem("bark_github_user", data.login);
        pugAudio.playChime();
        setGitTestResult({
          success: true,
          message: `Validé ! @${data.login} (5 000 req/h)`,
        });
      } else if (res.status === 401) {
        setGitTestResult({
          success: false,
          message: "Token invalide ou expiré (401).",
        });
      } else {
        setGitTestResult({
          success: false,
          message: `Erreur API GitHub (${res.status}).`,
        });
      }
    } catch {
      updateGitHubConfig({ token: trimmed });
      setGitTestResult({
        success: true,
        message: "Token enregistré (vérification hors-ligne).",
      });
    } finally {
      setIsTestingGit(false);
    }
  };

  const handleClearToken = () => {
    setGithubToken("");
    updateGitHubConfig({ token: "" });
    setGitTestResult({ success: true, message: "Token supprimé." });
  };

  const handleOpenTokenGen = () => {
    const url = "https://github.com/settings/tokens/new?description=Bark+Assistant&scopes=repo,read:user";
    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/plugin-shell")
        .then(({ open }) => open(url))
        .catch(() => window.open(url, "_blank"));
    } else {
      window.open(url, "_blank");
    }
  };

  const hasConfiguredToken = Boolean(settings.github?.token?.trim());

  return (
    <div className="grid grid-cols-2 gap-3 h-[375px] overflow-y-auto pr-1 select-none text-xs">
      {/* --- Left Card: GitHub PAT Token --- */}
      <div className="flex flex-col justify-between bg-[#111116] border border-[#22222a] hover:border-[#30363d] rounded-xl p-3 text-white shadow-sm transition-colors">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-neutral-800 flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-neutral-200 text-xs">Jeton d'accès GitHub</div>
                <div className="text-[10px] text-neutral-400">Personal Access Token (PAT)</div>
              </div>
            </div>

            {hasConfiguredToken ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-300 font-medium">
                <ShieldCheck size={10} />
                <span>5 000 req/h</span>
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full bg-neutral-800 text-[9px] text-neutral-400 font-mono">
                60 req/h
              </span>
            )}
          </div>

          <p className="text-[11px] text-neutral-400 leading-tight">
            Débloquez la limite d'API et accédez à vos dépôts privés en temps réel.
          </p>

          {/* Token Input */}
          <div className="space-y-1.5 pt-1">
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_... ou github_pat_..."
                className="w-full bg-[#18181f] border border-[#2b2b36] focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 font-mono focus:outline-none transition-colors pr-7"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                title={showToken ? "Masquer" : "Afficher"}
              >
                {showToken ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveAndTestToken}
                disabled={isTestingGit}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingGit ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" />
                    <span>Test...</span>
                  </>
                ) : (
                  <>
                    <Check size={12} />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>

              {hasConfiguredToken && (
                <button
                  onClick={handleClearToken}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/60 hover:text-red-400 text-neutral-400 border border-neutral-700/60 transition-colors cursor-pointer"
                  title="Supprimer le token"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Test result */}
            {gitTestResult && (
              <div
                className={`text-[10px] font-medium pt-0.5 ${
                  gitTestResult.success ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {gitTestResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-neutral-800/50 mt-2 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-mono">Scopes : repo, read:user</span>
          <button
            onClick={handleOpenTokenGen}
            className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Créer un token</span>
            <ExternalLink size={9} />
          </button>
        </div>
      </div>

      {/* --- Right Card: VS Code Bridge --- */}
      <div className="flex flex-col justify-between bg-[#111116] border border-[#22222a] hover:border-[#007acc]/50 rounded-xl p-3 text-white shadow-sm transition-colors">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#007acc]/20 border border-[#007acc]/40 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#007acc]">
                  <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.43-3.36a.798.798 0 0 0-1.04.07L.28 7.08a.798.798 0 0 0 0 1.13l3.77 3.79-3.77 3.79a.798.798 0 0 0 0 1.13l1.295 1.24a.798.798 0 0 0 1.04.07l4.43-3.36 9.46 8.63a1.49 1.49 0 0 0 1.705.29l4.94-2.377A1.5 1.5 0 0 0 24 20.013V3.987a1.5 1.5 0 0 0-.85-1.4zM18 17.518l-7.23-5.518L18 6.482v11.036z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-neutral-200 text-xs">Visual Studio Code</div>
                <div className="text-[10px] text-neutral-400">Bridge IDE & Détection locale</div>
              </div>
            </div>

            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Connecté</span>
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-1.5 py-1">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#18181f] border border-[#24242e]">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Terminal size={12} className="text-[#007acc]" />
                Version CLI :
              </span>
              <span className="font-mono text-[11px] text-white font-semibold">
                v{vsInfo.version}
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#18181f] border border-[#24242e]">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Palette size={12} className="text-purple-400" />
                Thème actif :
              </span>
              <span className="font-mono text-[11px] text-neutral-300 truncate max-w-[130px]">
                {vsInfo.active_theme}
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#18181f] border border-[#24242e]">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <FolderCode size={12} className="text-emerald-400" />
                Workspaces :
              </span>
              <span className="font-mono text-[11px] text-emerald-300 font-semibold">
                {vsInfo.total_workspaces} récents
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-neutral-800/50 mt-2 flex items-center gap-1.5">
          <button
            onClick={handleScanVSCode}
            disabled={isScanningVs}
            className="flex-1 py-1 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <RefreshCw size={10} className={isScanningVs ? "animate-spin" : ""} />
            <span>Re-scanner</span>
          </button>

          <button
            onClick={handleOpenVSCode}
            className="flex-1 py-1 px-2 rounded-lg bg-[#007acc] hover:bg-[#0062a3] text-white text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Code2 size={11} />
            <span>Ouvrir Bark</span>
          </button>
        </div>
      </div>
    </div>
  );
};
