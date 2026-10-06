import { create } from "zustand";
import {
  ActivityItem,
  AgentModel,
  AgentSession,
  AgentType,
  ApprovalRequest,
  UserQuestion,
} from "../types/agent";
import { SocketEventPayload } from "../types/socket";
import { pugAudio } from "../components/mascot/PugAudio";

export type NavTab = "home" | "chat" | "settings" | "add";

interface AgentStoreState {
  activeAgent: AgentType;
  selectedModelId: string;
  models: AgentModel[];
  activeNav: NavTab;
  isExpanded: boolean;
  isMuted: boolean;
  socketConnected: boolean;
  pendingApproval: ApprovalRequest | null;
  pendingQuestion: UserQuestion | null;
  sessions: Record<AgentType, AgentSession>;

  // Actions
  setActiveAgent: (agent: AgentType) => void;
  setSelectedModel: (modelId: string) => void;
  addModel: (model: AgentModel) => void;
  setActiveNav: (nav: NavTab) => void;
  setIsExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  toggleMute: () => void;
  setSocketConnected: (connected: boolean) => void;
  submitApproval: (requestId: string, status: "approved" | "denied" | "always", choice?: any) => Promise<void>;
  handleSocketEvent: (event: SocketEventPayload) => void;
  appendOutput: (agent: AgentType, text: string) => void;
  clearSession: (agent: AgentType) => void;
}

const defaultModels: AgentModel[] = [
  {
    id: "antigravity",
    name: "Antigravity",
    subtitle: "Google DeepMind",
    category: "agent",
    color: "#3b82f6",
    mascotColor: "#3b82f6", // Blue
    agentType: "antigravity",
  },
  {
    id: "hermes-agent",
    name: "Hermes Agent",
    subtitle: "Nous Research",
    category: "agent",
    color: "#f59e0b",
    mascotColor: "#f59e0b", // Warm Amber
    agentType: "hermes",
  },
  {
    id: "vscode",
    name: "VS Code",
    subtitle: "IDE Bridge",
    category: "tool",
    color: "#ffffff",
    mascotColor: "#f3f4f6", // White/Silver
    agentType: "antigravity",
  },
  {
    id: "github",
    name: "GitHub",
    subtitle: "PR & Actions",
    category: "tool",
    color: "#ef4444",
    mascotColor: "#ef4444", // Red
    agentType: "antigravity",
  },
  {
    id: "n8n",
    name: "n8n",
    subtitle: "Workflows",
    category: "tool",
    color: "#f97316",
    mascotColor: "#f97316", // Orange
    agentType: "hermes",
  },
  {
    id: "vercel",
    name: "Vercel",
    subtitle: "Deployments",
    category: "tool",
    color: "#8b5cf6",
    mascotColor: "#8b5cf6", // Purple
    agentType: "antigravity",
  },
];

const initialActivities: ActivityItem[] = [
  {
    id: "act-1",
    text: "Mascotte Bark initialisée",
    timeAgo: "now",
    type: "info",
  },
  {
    id: "act-2",
    text: "Socket /run/user/1000/bark.sock prêt",
    timeAgo: "1m",
    type: "info",
  },
  {
    id: "act-3",
    text: "Antigravity & Hermes synchronisés",
    timeAgo: "2m",
    type: "info",
  },
];

const initialSessions: Record<AgentType, AgentSession> = {
  antigravity: {
    id: "agy-default",
    agent: "antigravity",
    status: "idle",
    currentAction: "Prêt pour les tâches Google Antigravity",
    startTime: Date.now(),
    stepCount: 12,
    diffs: [],
    outputLines: ["[Bark] Prêt pour Google Antigravity."],
    recentActivities: [...initialActivities],
  },
  hermes: {
    id: "hermes-default",
    agent: "hermes",
    status: "idle",
    currentAction: "Prêt pour Nous Research Hermes Agent",
    startTime: Date.now(),
    stepCount: 8,
    diffs: [],
    outputLines: ["[Bark] Prêt pour Hermes Agent."],
    recentActivities: [...initialActivities],
  },
};

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  activeAgent: "antigravity",
  selectedModelId: "antigravity",
  models: defaultModels,
  activeNav: "home",
  isExpanded: false,
  isMuted: false,
  socketConnected: true,
  pendingApproval: null,
  pendingQuestion: null,
  sessions: initialSessions,

  setActiveAgent: (agent) => {
    const matched = get().models.find((m) => m.agentType === agent);
    set({
      activeAgent: agent,
      selectedModelId: matched ? matched.id : agent,
    });
  },

  setSelectedModel: (modelId) => {
    const model = get().models.find((m) => m.id === modelId);
    if (model) {
      set({
        selectedModelId: model.id,
        activeAgent: model.agentType,
      });
      pugAudio.playBark();
    }
  },

  addModel: (model) => {
    set((state) => ({
      models: [...state.models, model],
      selectedModelId: model.id,
      activeAgent: model.agentType,
      activeNav: "home",
    }));
    pugAudio.playChime();
  },

  setActiveNav: (nav) => {
    set({ activeNav: nav });
    // Adjust window height if opening chat
    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke("set_window_mode", {
          mode: "expanded",
          isChat: nav === "chat",
        }).catch(console.error);
      });
    }
  },

  setIsExpanded: (expanded) => {
    set({ isExpanded: expanded });
    if ((window as any).__TAURI_INTERNALS__) {
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke("set_window_mode", {
          mode: expanded ? "expanded" : "pill",
          isChat: get().activeNav === "chat",
        }).catch(console.error);
      });
    }
  },

  toggleExpanded: () => {
    const next = !get().isExpanded;
    get().setIsExpanded(next);
  },

  toggleMute: () => {
    const nextMuted = !get().isMuted;
    pugAudio.enabled = !nextMuted;
    set({ isMuted: nextMuted });
  },

  setSocketConnected: (connected) => set({ socketConnected: connected }),

  submitApproval: async (requestId, status, choice) => {
    try {
      if ((window as any).__TAURI_INTERNALS__) {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("submit_approval", {
          requestId,
          status,
          choice,
        });
      }
    } catch (e) {
      console.error("Failed to submit approval:", e);
    }

    set({ pendingApproval: null, pendingQuestion: null });

    const currentAgent = get().activeAgent;
    set((state) => {
      const s = state.sessions[currentAgent];
      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        text: status === "approved" ? "Action autorisée par l'utilisateur" : "Action refusée",
        timeAgo: "now",
        type: status === "approved" ? "info" : "alert",
      };
      return {
        sessions: {
          ...state.sessions,
          [currentAgent]: {
            ...s,
            status: status === "approved" ? "working" : "idle",
            currentAction: status === "approved" ? "Action autorisée" : "Action refusée",
            recentActivities: [newAct, ...s.recentActivities.slice(0, 4)],
          },
        },
      };
    });
  },

  handleSocketEvent: (event) => {
    const agentKey: AgentType =
      event.agent?.toLowerCase().includes("hermes") ? "hermes" : "antigravity";

    switch (event.type) {
      case "agent_connect": {
        pugAudio.playBark();
        const newAct: ActivityItem = {
          id: `act-${Date.now()}`,
          text: event.prompt ? `Session : ${event.prompt}` : "Session démarrée",
          timeAgo: "now",
          type: "info",
        };
        set((state) => ({
          activeAgent: agentKey,
          sessions: {
            ...state.sessions,
            [agentKey]: {
              ...state.sessions[agentKey],
              id: event.session_id,
              status: "thinking",
              currentAction: event.prompt ? `Tâche : ${event.prompt}` : "Session démarrée",
              lastPrompt: event.prompt,
              stepCount: state.sessions[agentKey].stepCount + 1,
              recentActivities: [newAct, ...state.sessions[agentKey].recentActivities.slice(0, 4)],
              outputLines: [
                ...state.sessions[agentKey].outputLines,
                `\n[Session connectée] ${event.session_id}`,
                event.prompt ? `Prompt: ${event.prompt}` : "",
              ].filter(Boolean),
            },
          },
        }));
        break;
      }

      case "pre_tool_use": {
        const currentSession = get().sessions[agentKey];
        const actionDesc =
          event.description || `Outil : ${event.tool}`;

        const newAct: ActivityItem = {
          id: `act-${Date.now()}`,
          text: actionDesc,
          timeAgo: "now",
          type: "command",
        };

        if (event.requires_approval) {
          pugAudio.playAlert();
          set({
            activeAgent: agentKey,
            pendingApproval: {
              id: event.request_id,
              agent: agentKey,
              sessionId: event.session_id,
              tool: event.tool,
              args: event.args,
              description: event.description,
              timestamp: Date.now(),
            },
          });
          get().setIsExpanded(true);
        }

        set((state) => ({
          sessions: {
            ...state.sessions,
            [agentKey]: {
              ...currentSession,
              status: event.requires_approval ? "alert" : "working",
              currentAction: actionDesc,
              stepCount: currentSession.stepCount + 1,
              recentActivities: [newAct, ...currentSession.recentActivities.slice(0, 4)],
              outputLines: [
                ...currentSession.outputLines,
                `[Tool] ${event.tool}: ${JSON.stringify(event.args)}`,
              ],
            },
          },
        }));
        break;
      }

      case "post_tool_use": {
        set((state) => {
          const s = state.sessions[agentKey];
          return {
            sessions: {
              ...state.sessions,
              [agentKey]: {
                ...s,
                status: event.is_error ? "error" : "thinking",
                currentAction: event.is_error ? `Erreur outil ${event.tool}` : `Terminé : ${event.tool}`,
                outputLines: [
                  ...s.outputLines,
                  `[Result ${event.tool}] ${JSON.stringify(event.result).slice(0, 120)}`,
                ],
              },
            },
          };
        });
        break;
      }

      case "diff_update": {
        set((state) => {
          const s = state.sessions[agentKey];
          const existing = s.diffs.filter((d) => d.filePath !== event.file_path);
          const newAct: ActivityItem = {
            id: `act-${Date.now()}`,
            text: `Édition ${event.file_path} (+${event.additions} -${event.deletions})`,
            timeAgo: "now",
            type: "diff",
          };
          return {
            sessions: {
              ...state.sessions,
              [agentKey]: {
                ...s,
                currentAction: `Édition : ${event.file_path} (+${event.additions} -${event.deletions})`,
                diffs: [
                  ...existing,
                  {
                    filePath: event.file_path,
                    additions: event.additions,
                    deletions: event.deletions,
                    diff: event.diff,
                  },
                ],
                recentActivities: [newAct, ...s.recentActivities.slice(0, 4)],
              },
            },
          };
        });
        break;
      }

      case "ask_user_question": {
        pugAudio.playAlert();
        set({
          activeAgent: agentKey,
          pendingQuestion: {
            id: event.request_id,
            agent: agentKey,
            sessionId: event.session_id,
            question: event.question,
            options: event.options,
            isMultiSelect: event.is_multi_select,
            timestamp: Date.now(),
          },
        });
        get().setIsExpanded(true);
        break;
      }

      case "agent_status": {
        if (event.status === "done") {
          pugAudio.playChime();
        }
        set((state) => {
          const s = state.sessions[agentKey];
          return {
            sessions: {
              ...state.sessions,
              [agentKey]: {
                ...s,
                status: event.status,
                currentAction: event.message || `Statut: ${event.status}`,
              },
            },
          };
        });
        break;
      }
    }
  },

  appendOutput: (agent, text) => {
    set((state) => {
      const s = state.sessions[agent];
      return {
        sessions: {
          ...state.sessions,
          [agent]: {
            ...s,
            outputLines: [...s.outputLines, text],
          },
        },
      };
    });
  },

  clearSession: (agent) => {
    set((state) => ({
      sessions: {
        ...state.sessions,
        [agent]: {
          ...initialSessions[agent],
          id: `${agent}-${Date.now()}`,
          outputLines: [`[Bark] Session ${agent} réinitialisée.`],
        },
      },
    }));
  },
}));
