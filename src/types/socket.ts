import { PugState } from "./agent";

export type SocketEventPayload =
  | {
      type: "agent_connect";
      agent: string;
      session_id: string;
      prompt?: string;
    }
  | {
      type: "agent_disconnect";
      agent: string;
      session_id: string;
    }
  | {
      type: "pre_tool_use";
      request_id: string;
      agent: string;
      session_id: string;
      tool: string;
      args: any;
      description?: string;
      requires_approval: boolean;
    }
  | {
      type: "post_tool_use";
      agent: string;
      session_id: string;
      tool: string;
      result: any;
      is_error: boolean;
    }
  | {
      type: "pre_invocation";
      agent: string;
      session_id: string;
      message?: string;
    }
  | {
      type: "post_invocation";
      agent: string;
      session_id: string;
      message?: string;
    }
  | {
      type: "diff_update";
      agent: string;
      session_id: string;
      file_path: string;
      additions: number;
      deletions: number;
      diff?: string;
    }
  | {
      type: "ask_user_question";
      request_id: string;
      agent: string;
      session_id: string;
      question: string;
      options: string[];
      is_multi_select: boolean;
    }
  | {
      type: "agent_status";
      agent: string;
      session_id: string;
      status: PugState;
      message?: string;
    };
