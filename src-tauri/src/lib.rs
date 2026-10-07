use std::collections::HashMap;
use std::sync::Arc;
use serde_json::Value;
use tauri::{AppHandle, State};
use tokio::sync::Mutex;

mod pty;
mod socket;
mod window;

use pty::manager::PtyManager;
use socket::server::{
    get_socket_path, start_socket_server, ApprovalMap, ApprovalResponse,
};
use window::positioner::{set_expanded_mode, set_pill_mode};

struct AppState {
    approvals: ApprovalMap,
    pty_manager: Arc<PtyManager>,
}

#[tauri::command]
async fn submit_approval(
    state: State<'_, AppState>,
    request_id: String,
    status: String,
    choice: Option<Value>,
) -> Result<(), String> {
    let mut map = state.approvals.lock().await;
    if let Some(sender) = map.remove(&request_id) {
        let _ = sender.send(ApprovalResponse {
            request_id,
            status,
            choice,
        });
        Ok(())
    } else {
        Err("Request ID not found or already processed".to_string())
    }
}

#[tauri::command]
fn get_bark_socket_path() -> String {
    get_socket_path().to_string_lossy().to_string()
}

#[tauri::command]
fn set_window_mode(
    app: AppHandle,
    mode: String,
    is_chat: Option<bool>,
    height: Option<u32>,
) -> Result<(), String> {
    if mode == "pill" {
        set_pill_mode(&app)
    } else {
        set_expanded_mode(&app, is_chat.unwrap_or(false), height)
    }
}

#[tauri::command]
fn spawn_agent_pty(
    app: AppHandle,
    state: State<'_, AppState>,
    session_id: String,
    command: String,
    args: Vec<String>,
    cwd: Option<String>,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    state
        .pty_manager
        .spawn(app, session_id, command, args, cwd, cols, rows)
}

#[tauri::command]
fn pty_write(
    state: State<'_, AppState>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    state.pty_manager.write(&session_id, &data)
}

#[tauri::command]
fn pty_resize(
    state: State<'_, AppState>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    state.pty_manager.resize(&session_id, cols, rows)
}

#[tauri::command]
fn pty_kill(state: State<'_, AppState>, session_id: String) -> Result<(), String> {
    state.pty_manager.kill(&session_id)
}

#[tauri::command]
fn check_cli_command(command: String) -> Result<bool, String> {
    let program = if cfg!(target_os = "windows") { "where" } else { "which" };
    match std::process::Command::new(program).arg(&command).output() {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let approvals: ApprovalMap = Arc::new(Mutex::new(HashMap::new()));
    let pty_manager = Arc::new(PtyManager::new());

    let approvals_for_bg = approvals.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(AppState {
            approvals,
            pty_manager,
        })
        .invoke_handler(tauri::generate_handler![
            submit_approval,
            get_bark_socket_path,
            set_window_mode,
            spawn_agent_pty,
            pty_write,
            pty_resize,
            pty_kill,
            check_cli_command,
        ])
        .setup(move |app| {
            let handle = app.handle().clone();
            let apprv = approvals_for_bg.clone();

            // Spawn socket server in background
            tauri::async_runtime::spawn(async move {
                start_socket_server(handle, apprv).await;
            });

            // Set initial mini-notch pill mode
            let handle2 = app.handle().clone();
            let _ = set_pill_mode(&handle2);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Bark");
}
