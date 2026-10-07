use std::collections::HashMap;
use std::sync::Arc;
use serde_json::Value;
use tauri::{AppHandle, State};
use tokio::sync::Mutex;

mod devtools;
mod pty;
mod socket;
mod window;

use devtools::{get_git_info, get_vscode_info};

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

pub fn resolve_cli_path(cmd: &str) -> String {
    let raw = if let Some(stripped) = cmd.strip_prefix("~/") {
        if let Some(home) = dirs::home_dir() {
            home.join(stripped).to_string_lossy().to_string()
        } else {
            cmd.to_string()
        }
    } else {
        cmd.to_string()
    };

    let p = std::path::Path::new(&raw);
    if p.is_absolute() && p.exists() {
        return raw;
    }

    if let Some(home) = dirs::home_dir() {
        let local_bin = home.join(".local/bin").join(cmd);
        if local_bin.exists() {
            return local_bin.to_string_lossy().to_string();
        }

        let cargo_bin = home.join(".cargo/bin").join(cmd);
        if cargo_bin.exists() {
            return cargo_bin.to_string_lossy().to_string();
        }

        let agy_bin = home.join(".config/Antigravity/bin").join(cmd);
        if agy_bin.exists() {
            return agy_bin.to_string_lossy().to_string();
        }
    }

    let usr_local = std::path::Path::new("/usr/local/bin").join(cmd);
    if usr_local.exists() {
        return usr_local.to_string_lossy().to_string();
    }

    let usr_bin = std::path::Path::new("/usr/bin").join(cmd);
    if usr_bin.exists() {
        return usr_bin.to_string_lossy().to_string();
    }

    let program = if cfg!(target_os = "windows") { "where" } else { "which" };
    if let Ok(output) = std::process::Command::new(program).arg(cmd).output() {
        if output.status.success() {
            let found = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !found.is_empty() {
                return found;
            }
        }
    }

    if !cfg!(target_os = "windows") {
        if let Ok(output) = std::process::Command::new("bash")
            .args(["-l", "-c", &format!("which {}", cmd)])
            .output()
        {
            if output.status.success() {
                let found = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !found.is_empty() {
                    return found;
                }
            }
        }
    }

    cmd.to_string()
}

fn ensure_user_path_env() {
    let current_path = std::env::var("PATH").unwrap_or_default();
    let mut extra_paths = Vec::new();

    if let Some(home) = dirs::home_dir() {
        let local_bin = home.join(".local/bin");
        if local_bin.exists() {
            extra_paths.push(local_bin.to_string_lossy().to_string());
        }
        let cargo_bin = home.join(".cargo/bin");
        if cargo_bin.exists() {
            extra_paths.push(cargo_bin.to_string_lossy().to_string());
        }
        let agy_bin = home.join(".config/Antigravity/bin");
        if agy_bin.exists() {
            extra_paths.push(agy_bin.to_string_lossy().to_string());
        }
    }
    extra_paths.push("/usr/local/bin".to_string());

    let mut new_path_parts = Vec::new();
    for p in extra_paths {
        if !current_path.split(':').any(|part| part == p) {
            new_path_parts.push(p);
        }
    }

    if !new_path_parts.is_empty() {
        new_path_parts.push(current_path);
        let updated = new_path_parts.join(":");
        std::env::set_var("PATH", updated);
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
    let resolved_command = resolve_cli_path(&command);
    state
        .pty_manager
        .spawn(app, session_id, resolved_command, args, cwd, cols, rows)
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
    let resolved = resolve_cli_path(&command);
    if std::path::Path::new(&resolved).exists() {
        return Ok(true);
    }
    let program = if cfg!(target_os = "windows") { "where" } else { "which" };
    match std::process::Command::new(program).arg(&command).output() {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
fn resolve_cli_command(command: String) -> Result<String, String> {
    Ok(resolve_cli_path(&command))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    ensure_user_path_env();
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
            resolve_cli_command,
            get_vscode_info,
            get_git_info,
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
