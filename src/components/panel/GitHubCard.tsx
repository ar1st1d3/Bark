import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Star,
  Users,
  ExternalLink,
  RefreshCw,
  GitBranch,
  BookOpen,
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

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  isCurrent?: boolean;
}

const initialProfile: GitHubProfile = {
  name: "Aristide Ve",
  login: "ar1st1d3",
  avatarUrl: "https://avatars.githubusercontent.com/u/93650137?v=4",
  bio: "Étudiant IMT Nord Europe",
  publicRepos: 5,
  totalStars: 1,
  followers: 2,
  following: 2,
  htmlUrl: "https://github.com/ar1st1d3",
};

const pinnedRepos: GitHubRepo[] = [
  {
    name: "Bark",
    description: "Assistant IA natif pour Dynamic Notch Linux & IDE",
    language: "TypeScript",
    stars: 0,
    isCurrent: true,
  },
  {
    name: "Phrygibot",
    description: "Chatbot Python sur les JO de Paris 2024",
    language: "Python",
    stars: 1,
  },
  {
    name: "chess",
    description: "Jeu d'échecs en Python avec Tkinter",
    language: "Python",
    stars: 0,
  },
];

export const GitHubCard: React.FC = () => {
  const [profile, setProfile] = useState<GitHubProfile>(initialProfile);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "repos">("overview");

  // Attempt live refresh when mounted if possible
  const fetchLiveData = async () => {
    setIsRefreshing(true);
    try {
      const userRes = await fetch("https://api.github.com/users/ar1st1d3");
      if (userRes.ok) {
        const userData = await userRes.json();
        
        // Fetch repos to recalculate star total
        const reposRes = await fetch("https://api.github.com/users/ar1st1d3/repos?per_page=100");
        let stars = initialProfile.totalStars;
        if (reposRes.ok) {
          const reposData = await reposRes.json();
          if (Array.isArray(reposData)) {
            stars = reposData.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
          }
        }

        setProfile({
          name: userData.name || initialProfile.name,
          login: userData.login || initialProfile.login,
          avatarUrl: userData.avatar_url || initialProfile.avatarUrl,
          bio: userData.bio || initialProfile.bio,
          publicRepos: userData.public_repos ?? initialProfile.publicRepos,
          totalStars: stars,
          followers: userData.followers ?? initialProfile.followers,
          following: userData.following ?? initialProfile.following,
          htmlUrl: userData.html_url || initialProfile.htmlUrl,
        });
      }
    } catch {
      // Offline fallback
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const openGitHub = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/plugin-shell").then(({ open }) => {
        open(profile.htmlUrl).catch(() => window.open(profile.htmlUrl, "_blank"));
      }).catch(() => {
        window.open(profile.htmlUrl, "_blank");
      });
    } else {
      window.open(profile.htmlUrl, "_blank");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#0d1117] border border-[#30363d] rounded-2xl p-3 text-white shadow-2xl select-none overflow-hidden relative">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          {/* Avatar with status dot */}
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-8 h-8 rounded-full border border-[#30363d] object-cover"
              onError={(e) => {
                // Fallback to github icon if offline
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0d1117]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm text-neutral-100 tracking-tight">
                {profile.name}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                @{profile.login}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 truncate max-w-[190px]">
              {profile.bio}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab(activeTab === "overview" ? "repos" : "overview")}
            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#21262d] hover:bg-[#30363d] text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Basculer entre la vue d'ensemble et les dépôts"
          >
            <BookOpen size={10} />
            <span>{activeTab === "overview" ? "Dépôts" : "Stats"}</span>
          </button>

          <button
            onClick={fetchLiveData}
            disabled={isRefreshing}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 bg-[#21262d] hover:bg-[#30363d] transition-colors cursor-pointer"
            title="Rafraîchir les informations GitHub"
          >
            <RefreshCw size={11} className={isRefreshing ? "animate-spin text-blue-400" : ""} />
          </button>

          <button
            onClick={openGitHub}
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
                  {profile.publicRepos}
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
                  {profile.totalStars}
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
                  {profile.followers}
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
                Dépôt actif : <strong className="text-white">ar1st1d3/Bark</strong>
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
              TypeScript / Rust
            </span>
          </div>
        </div>
      ) : (
        /* Repositories List View */
        <div className="flex flex-col gap-1.5 flex-1 pt-1.5 overflow-hidden">
          {pinnedRepos.map((repo) => (
            <div
              key={repo.name}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d]/60 hover:border-[#30363d] transition-colors text-xs"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <GitBranch size={13} className="text-neutral-400 flex-shrink-0" />
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-200 text-[11px] truncate">
                      {repo.name}
                    </span>
                    {repo.isCurrent && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Actuel
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 truncate">
                    {repo.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-neutral-400">{repo.language}</span>
                {repo.stars > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-300 font-mono">
                    <Star size={10} className="fill-amber-400" />
                    {repo.stars}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
