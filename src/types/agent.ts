export type AgentType = "antigravity" | "hermes";

export type PugState = "idle" | "thinking" | "working" | "alert" | "done" | "error";

export interface AgentModel {
  id: string;
  name: string;
  subtitle: string;
  category: "agent" | "model" | "tool";
  color: string;
  mascotColor: string;
  agentType: AgentType;
  isCustom?: boolean;
}

export interface ActivityItem {
  id: string;
  text: string;
  timeAgo: string;
  type: "info" | "diff" | "command" | "alert";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  attachment?: string;
  timestamp: number;
}

export interface AttachedFile {
  name: string;
  path?: string;
  size?: number;
}

export interface ApprovalRequest {
  id: string;
  agent: AgentType;
  sessionId: string;
  tool: string;
  args: Record<string, any>;
  description?: string;
  timestamp: number;
}

export interface UserQuestion {
  id: string;
  agent: AgentType;
  sessionId: string;
  question: string;
  options: string[];
  isMultiSelect: boolean;
  timestamp: number;
}

export interface DiffItem {
  filePath: string;
  additions: number;
  deletions: number;
  diff?: string;
}

export interface AgentSession {
  id: string;
  agent: AgentType;
  status: PugState;
  actionStep?: "read" | "edit" | "bash" | "done";
  currentAction?: string;
  lastPrompt?: string;
  startTime: number;
  stepCount: number;
  diffs: DiffItem[];
  outputLines: string[];
  recentActivities: ActivityItem[];
}

export interface AntigravityConfig {
  mode: "socket_hook" | "cli_pty" | "gemini_api";
  cliPath: string;
  apiKey: string;
  model: string;
}

export interface HermesConfig {
  mode: "openrouter_api" | "cli_pty" | "local_ollama";
  cliPath: string;
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface SecurityConfig {
  autoApproveRead: boolean;
  requireApprovalBash: boolean;
  requireApprovalWrite: boolean;
}

export interface AppSettings {
  antigravity: AntigravityConfig;
  hermes: HermesConfig;
  security: SecurityConfig;
  soundEnabled: boolean;
  volume: number;
}
