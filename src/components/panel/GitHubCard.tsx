import React, { useState, useEffect, useCallback } from "react";
import { useAgentStore } from "../../store/useAgentStore";
import {
  FolderGit2,
  Star,
  Users,
  ExternalLink,
  RefreshCw,
  GitBranch,
  BookOpen,
  Check,
  X,
  AlertCircle,
  Edit2,
  Key,
} from "lucide-react";

interface GitHubProfile {
  name: string;
  login: string;
  avatarUrl: string;
  bio: string;
  publicRepos: number;
  totalStars: number;
  followers: number;
  following: number;
  htmlUrl: string;
}

interface GitHubRepoItem {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  htmlUrl: string;
  isCurrent?: boolean;
}

const STORAGE_KEY_USER = "bark_github_user";
const STORAGE_KEY_CACHE = "bark_github_cache_v1";

export const GitHubCard: React.FC = () => {
  const { settings, setActiveNav } = useAgentStore();
  const token = settings.github?.token?.trim();

  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_USER) || "";
  });

  const [profile, setProfile] = useState<GitHubProfile | null>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_CACHE);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
  const [currentRepoName, setCurrentRepoName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(!profile);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "repos">("overview");

  // Inline username editing
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>("");

  // Auto-detect git info from local repository on mount if no username saved
  useEffect(() => {
    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke<{
          git_user_name?: string;
          git_user_email?: string;
          github_owner?: string;
          github_repo?: string;
        }>("get_git_info")
          .then((info) => {
            if (info?.github_repo) {
              setCurrentRepoName(info.github_repo);
            }
            if (!username) {
              const detected = info?.github_owner || info?.git_user_name;
              if (detected) {
                setUsername(detected);
                localStorage.setItem(STORAGE_KEY_USER, detected);
              }
            }
          })
          .catch(console.error);
      });
    } else if (!username) {
      // Fallback default if nothing detected
      setUsername("ar1st1d3");
    }
  }, [username]);

  // Fetch real GitHub API data for any user
  const fetchGitHubData = useCallback(async (targetUser: string) => {
    if (!targetUser.trim()) return;

    setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 1. Fetch user profile
      const userRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(targetUser.trim())}`,
        { headers }
      );
      if (userRes.status === 404) {
        throw new Error(`Utilisateur "${targetUser}" introuvable`);
      }
      if (userRes.status === 403) {
        throw new Error(
          token
            ? "Limite API atteinte ou token restreint."
            : "Limite API atteinte (60 req/h). Ajoutez un token dans les paramètres."
        );
      }
      if (!userRes.ok) {
        throw new Error(`Erreur API GitHub (${userRes.status})`);
      }

      const userData = await userRes.json();

      // 2. Fetch user repositories (up to 100 sorted by updated)
      let calculatedStars = 0;
      let fetchedRepos: GitHubRepoItem[] = [];

      try {
        const reposRes = await fetch(
          `https://api.github.com/users/${encodeURIComponent(targetUser.trim())}/repos?per_page=100&sort=updated`,
          { headers }
        );
        if (reposRes.ok) {
          const reposData = await reposRes.json();
          if (Array.isArray(reposData)) {
            calculatedStars = reposData.reduce(
              (sum: number, r: any) => sum + (r.stargazers_count || 0),
              0
            );

            // Sort repos: current project first, then by stars desc, then recently updated
            fetchedRepos = reposData
              .map((r: any) => ({
                id: r.id,
                name: r.name,
                description: r.description,
                language: r.language,
                stars: r.stargazers_count || 0,
                htmlUrl: r.html_url,
                isCurrent:
                  Boolean(currentRepoName) &&
                  r.name.toLowerCase() === currentRepoName.toLowerCase(),
              }))
              .sort((a, b) => {
                if (a.isCurrent) return -1;
                if (b.isCurrent) return 1;
                return b.stars - a.stars;
              });
          }
        }
      } catch (e) {
        console.warn("Could not fetch repos list:", e);
      }

      const newProfile: GitHubProfile = {
        name: userData.name || userData.login,
        login: userData.login,
        avatarUrl: userData.avatar_url,
        bio: userData.bio || "Aucune biographie renseignée",
        publicRepos: userData.public_repos ?? 0,
        totalStars: calculatedStars,
        followers: userData.followers ?? 0,
        following: userData.following ?? 0,
        htmlUrl: userData.html_url,
      };

      setProfile(newProfile);
      setRepos(fetchedRepos);
      localStorage.setItem(STORAGE_KEY_USER, targetUser.trim());
      localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(newProfile));
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion à GitHub");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentRepoName]);

  // Trigger fetch when username is established
  useEffect(() => {
    if (username) {
      fetchGitHubData(username);
    }
  }, [username, fetchGitHubData]);

  // Submit new username
  const handleSaveUsername = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputVal.trim()) {
      setUsername(inputVal.trim());
      setIsEditingUser(false);
    }
  };

  const openGitHub = (url?: string) => {
    const targetUrl = url || profile?.htmlUrl || `https://github.com/${username}`;
    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/plugin-shell")
        .then(({ open }) => open(targetUrl))
        .catch(() => window.open(targetUrl, "_blank"));
    } else {
      window.open(targetUrl, "_blank");
    }
  };

  // Loading skeleton state
  if (isLoading && !profile) {
    return (
      <div className="flex-1 flex flex-col justify-between bg-[#0d1117] border border-[#30363d] rounded-2xl p-3 text-white shadow-2xl select-none animate-pulse">
        <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-800" />
            <div className="space-y-1">
              <div className="w-24 h-3 rounded bg-neutral-800" />
              <div className="w-16 h-2 rounded bg-neutral-800/60" />
            </div>
          </div>
          <div className="w-16 h-5 rounded bg-neutral-800" />
        </div>
        <div className="grid grid-cols-3 gap-2 py-3">
          <div className="h-12 rounded-xl bg-neutral-800/50" />
          <div className="h-12 rounded-xl bg-neutral-800/50" />
          <div className="h-12 rounded-xl bg-neutral-800/50" />
        </div>
        <div className="h-6 rounded-lg bg-neutral-800/40" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#0d1117] border border-[#30363d] rounded-2xl p-3 text-white shadow-2xl select-none overflow-hidden relative">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#21262d]">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          {/* Avatar with live status dot */}
          <div className="relative flex-shrink-0">
            <img
              src={profile?.avatarUrl || "https://github.com/ghost.png"}
              alt={profile?.name || username}
              className="w-8 h-8 rounded-full border border-[#30363d] object-cover bg-neutral-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://github.com/ghost.png";
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0d1117]" />
          </div>

          {/* Profile Name & Username or Edit Mode */}
          {isEditingUser ? (
            <form onSubmit={handleSaveUsername} className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="ex: torvalds, ar1st1d3"
                autoFocus
                className="w-full text-xs bg-[#161b22] border border-[#30363d] rounded px-2 py-0.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                className="p-1 rounded bg-[#238636] hover:bg-[#2ea043] text-white"
                title="Valider"
              >
                <Check size={11} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUser(false)}
                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400"
                title="Annuler"
              >
                <X size={11} />
              </button>
            </form>
          ) : (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-sm text-neutral-100 tracking-tight truncate">
                  {profile?.name || username}
                </span>
                <button
                  onClick={() => {
                    setInputVal(username);
                    setIsEditingUser(true);
                  }}
                  className="text-[11px] text-neutral-400 font-mono hover:text-blue-400 flex items-center gap-0.5 transition-colors cursor-pointer group"
                  title="Changer de compte GitHub"
                >
                  <span>@{profile?.login || username}</span>
                  <Edit2 size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
              <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                {profile?.bio || "Profil GitHub connecté"}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === "overview" ? "repos" : "overview")}
            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#21262d] hover:bg-[#30363d] text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Basculer entre la vue d'ensemble et les dépôts"
          >
            <BookOpen size={10} />
            <span>{activeTab === "overview" ? "Dépôts" : "Stats"}</span>
          </button>

          {/* GitHub Token / PAT Status Button */}
          {token ? (
            <button
              onClick={() => setActiveNav("settings")}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-[9px] text-emerald-300 font-mono transition-colors cursor-pointer"
              title="Token GitHub PAT actif (5 000 req/h). Cliquez pour ouvrir les Paramètres."
            >
              <Key size={9} />
              <span>PAT</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveNav("settings")}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[9px] text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              title="Ajouter un token GitHub dans les Paramètres pour débloquer 5 000 req/h"
            >
              <Key size={9} />
              <span>Token</span>
            </button>
          )}

          <button
            onClick={() => fetchGitHubData(username)}
            disabled={isRefreshing}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 bg-[#21262d] hover:bg-[#30363d] transition-colors cursor-pointer"
            title="Rafraîchir via l'API GitHub"
          >
            <RefreshCw
              size={11}
              className={isRefreshing ? "animate-spin text-blue-400" : ""}
            />
          </button>

          <button
            onClick={() => openGitHub()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#238636] hover:bg-[#2ea043] text-white shadow-sm transition-colors cursor-pointer"
            title="Ouvrir le profil GitHub"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <ExternalLink size={9} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between px-2.5 py-1 my-1 rounded-lg bg-red-950/60 border border-red-500/40 text-[11px] text-red-200">
          <div className="flex items-center gap-1.5 truncate">
            <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            {error.includes("paramètres") && (
              <button
                onClick={() => setActiveNav("settings")}
                className="text-[10px] text-emerald-300 hover:underline cursor-pointer"
              >
                Paramètres
              </button>
            )}
            <button
              onClick={() => {
                setInputVal(username);
                setIsEditingUser(true);
              }}
              className="text-[10px] text-blue-300 hover:underline cursor-pointer"
            >
              Changer
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === "overview" ? (
        <div className="flex flex-col justify-between flex-1 pt-2 gap-2">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Repositories Metric */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#161b22] border border-[#30363d]/70 hover:border-neutral-500 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                <FolderGit2 size={15} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-base font-mono text-white">
                  {profile?.publicRepos ?? 0}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Dépôts
                </span>
              </div>
            </div>

            {/* Stars Metric */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#161b22] border border-[#30363d]/70 hover:border-amber-500/50 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Star size={15} className="fill-amber-400/20" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-base font-mono text-amber-300">
                  {profile?.totalStars ?? 0}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Étoiles
                </span>
              </div>
            </div>

            {/* Followers Metric */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#161b22] border border-[#30363d]/70 hover:border-purple-500/50 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Users size={15} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-base font-mono text-white">
                  {profile?.followers ?? 0}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Abonnés
                </span>
              </div>
            </div>
          </div>

          {/* Active / Featured Project Footer Banner */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d]/80 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] text-neutral-300 font-mono truncate">
                {currentRepoName ? (
                  <>
                    Dépôt local : <strong className="text-white">{currentRepoName}</strong>
                  </>
                ) : (
                  <>
                    API GitHub : <strong className="text-white">@{username}</strong>
                  </>
                )}
              </span>
            </div>
            <button
              onClick={() => {
                setInputVal(username);
                setIsEditingUser(true);
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#21262d] text-neutral-300 font-medium hover:text-white transition-colors cursor-pointer"
            >
              Changer user
            </button>
          </div>
        </div>
      ) : (
        /* Real Repositories List View from GitHub API */
        <div className="flex flex-col gap-1.5 flex-1 pt-1.5 overflow-y-auto max-h-[140px] pr-1">
          {repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-xs py-4">
              <FolderGit2 size={20} className="mb-1 opacity-50" />
              <span>Aucun dépôt public trouvé pour cet utilisateur</span>
            </div>
          ) : (
            repos.slice(0, 10).map((repo) => (
              <div
                key={repo.id}
                onClick={() => openGitHub(repo.htmlUrl)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d]/60 hover:border-[#30363d] transition-colors text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <GitBranch size={13} className="text-neutral-400 flex-shrink-0 group-hover:text-blue-400" />
                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-200 text-[11px] truncate group-hover:text-white">
                        {repo.name}
                      </span>
                      {repo.isCurrent && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Actuel
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <span className="text-[10px] text-neutral-400 truncate">
                        {repo.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {repo.language && (
                    <span className="text-[10px] text-neutral-400">{repo.language}</span>
                  )}
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-300 font-mono">
                      <Star size={10} className="fill-amber-400" />
                      {repo.stars}
                    </span>
                  )}
                  <ExternalLink size={10} className="text-neutral-500 group-hover:text-neutral-300" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
