use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::{UnixListener, UnixStream};
use tokio::sync::{oneshot, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum BarkEvent {
    #[serde(rename = "agent_connect")]
    AgentConnect {
        agent: String,
        session_id: String,
        prompt: Option<String>,
    },
    #[serde(rename = "agent_disconnect")]
    AgentDisconnect {
        agent: String,
        session_id: String,
    },
    #[serde(rename = "pre_tool_use")]
    PreToolUse {
        request_id: String,
        agent: String,
        session_id: String,
        tool: String,
        args: serde_json::Value,
        description: Option<String>,
        requires_approval: bool,
    },
    #[serde(rename = "post_tool_use")]
    PostToolUse {
        agent: String,
        session_id: String,
        tool: String,
        result: serde_json::Value,
        is_error: bool,
    },
    #[serde(rename = "pre_invocation")]
    PreInvocation {
        agent: String,
        session_id: String,
        message: Option<String>,
    },
    #[serde(rename = "post_invocation")]
    PostInvocation {
        agent: String,
        session_id: String,
        message: Option<String>,
    },
    #[serde(rename = "diff_update")]
    DiffUpdate {
        agent: String,
        session_id: String,
        file_path: String,
        additions: u32,
        deletions: u32,
        diff: Option<String>,
    },
    #[serde(rename = "ask_user_question")]
    AskUserQuestion {
        request_id: String,
        agent: String,
        session_id: String,
        question: String,
        options: Vec<String>,
        is_multi_select: bool,
    },
    #[serde(rename = "agent_status")]
    AgentStatus {
        agent: String,
        session_id: String,
        status: String,
        message: Option<String>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalResponse {
    pub request_id: String,
    pub status: String,
    pub choice: Option<serde_json::Value>,
}

pub type ApprovalMap = Arc<Mutex<HashMap<String, oneshot::Sender<ApprovalResponse>>>>;

#[allow(dead_code)]
pub struct SocketServerState {
    pub pending_approvals: ApprovalMap,
    pub socket_path: PathBuf,
}

pub fn get_socket_path() -> PathBuf {
    if let Ok(runtime_dir) = std::env::var("XDG_RUNTIME_DIR") {
        PathBuf::from(runtime_dir).join("bark.sock")
    } else if let Some(home) = dirs::home_dir() {
        let dir = home.join(".local/share/bark");
        let _ = std::fs::create_dir_all(&dir);
        dir.join("bark.sock")
    } else {
        PathBuf::from("/tmp/bark.sock")
    }
}

pub async fn start_socket_server(app_handle: AppHandle, pending_approvals: ApprovalMap) {
    let socket_path = get_socket_path();

    if let Some(parent) = socket_path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let _ = std::fs::remove_file(&socket_path);

    println!("[Bark Socket] Listening on {:?}", socket_path);

    let listener = match UnixListener::bind(&socket_path) {
        Ok(l) => l,
        Err(e) => {
            eprintln!("[Bark Socket] Failed to bind Unix socket: {}", e);
            return;
        }
    };

    loop {
        match listener.accept().await {
            Ok((stream, _)) => {
                let app = app_handle.clone();
                let approvals = pending_approvals.clone();
                tokio::spawn(async move {
                    handle_client(stream, app, approvals).await;
                });
            }
            Err(e) => {
                eprintln!("[Bark Socket] Accept error: {}", e);
            }
        }
    }
}

async fn handle_client(stream: UnixStream, app_handle: AppHandle, pending_approvals: ApprovalMap) {
    let (reader, mut writer) = stream.into_split();
    let mut buf_reader = BufReader::new(reader);
    let mut line = String::new();

    loop {
        line.clear();
        match buf_reader.read_line(&mut line).await {
            Ok(0) => break,
            Ok(_) => {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }

                if let Ok(event) = serde_json::from_str::<BarkEvent>(trimmed) {
                    let maybe_approval_id = match &event {
                        BarkEvent::PreToolUse { request_id, requires_approval, .. } if *requires_approval => {
                            Some(request_id.clone())
                        }
                        BarkEvent::AskUserQuestion { request_id, .. } => {
                            Some(request_id.clone())
                        }
                        _ => None,
                    };

                    let _ = app_handle.emit("bark://event", &event);

                    if let Some(req_id) = maybe_approval_id {
                        let (tx, rx) = oneshot::channel();
                        {
                            let mut map = pending_approvals.lock().await;
                            map.insert(req_id.clone(), tx);
                        }

                        match rx.await {
                            Ok(resp) => {
                                if let Ok(json_resp) = serde_json::to_string(&resp) {
                                    let _ = writer.write_all(json_resp.as_bytes()).await;
                                    let _ = writer.write_all(b"\n").await;
                                    let _ = writer.flush().await;
                                }
                            }
                            Err(_) => {
                                let resp = ApprovalResponse {
                                    request_id: req_id,
                                    status: "denied".to_string(),
                                    choice: None,
                                };
                                if let Ok(json_resp) = serde_json::to_string(&resp) {
                                    let _ = writer.write_all(json_resp.as_bytes()).await;
                                    let _ = writer.write_all(b"\n").await;
                                    let _ = writer.flush().await;
                                }
                            }
                        }
                    }
                } else {
                    eprintln!("[Bark Socket] Unrecognized payload: {}", trimmed);
                }
            }
            Err(e) => {
                eprintln!("[Bark Socket] Read error: {}", e);
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_agent_connect() {
        let json = r#"{"type":"agent_connect","agent":"antigravity","session_id":"s-1","prompt":"hello"}"#;
        let ev: BarkEvent = serde_json::from_str(json).expect("Failed to parse agent_connect");
        match ev {
            BarkEvent::AgentConnect { agent, prompt, .. } => {
                assert_eq!(agent, "antigravity");
                assert_eq!(prompt.as_deref(), Some("hello"));
            }
            _ => panic!("Wrong variant"),
        }
    }

    #[test]
    fn test_parse_pre_tool_use() {
        let json = r#"{"type":"pre_tool_use","request_id":"req-123","agent":"hermes","session_id":"s-1","tool":"run_command","args":{"command":"ls -la"},"requires_approval":true}"#;
        let ev: BarkEvent = serde_json::from_str(json).expect("Failed to parse pre_tool_use");
        match ev {
            BarkEvent::PreToolUse { request_id, requires_approval, tool, .. } => {
                assert_eq!(request_id, "req-123");
                assert!(requires_approval);
                assert_eq!(tool, "run_command");
            }
            _ => panic!("Wrong variant"),
        }
    }

    #[test]
    fn test_parse_diff_update() {
        let json = r#"{"type":"diff_update","agent":"antigravity","session_id":"s-1","file_path":"src/main.rs","additions":5,"deletions":2}"#;
        let ev: BarkEvent = serde_json::from_str(json).expect("Failed to parse diff_update");
        match ev {
            BarkEvent::DiffUpdate { additions, deletions, file_path, .. } => {
                assert_eq!(file_path, "src/main.rs");
                assert_eq!(additions, 5);
                assert_eq!(deletions, 2);
            }
            _ => panic!("Wrong variant"),
        }
    }
}
