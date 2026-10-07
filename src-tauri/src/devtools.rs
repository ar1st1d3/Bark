use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VSCodeWorkspaceItem {
    pub name: String,
    pub path: String,
    pub is_current: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VSCodeInfo {
    pub installed: bool,
    pub version: String,
    pub developer: String,
    pub active_theme: String,
    pub total_workspaces: usize,
    pub current_project: String,
    pub current_path: String,
    pub workspaces: Vec<VSCodeWorkspaceItem>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitRepoInfo {
    pub git_user_name: Option<String>,
    pub git_user_email: Option<String>,
    pub github_owner: Option<String>,
    pub github_repo: Option<String>,
}

fn percent_decode(s: &str) -> String {
    let mut bytes = Vec::new();
    let mut chars = s.as_bytes().iter().copied();
    while let Some(b) = chars.next() {
        if b == b'%' {
            if let (Some(h1), Some(h2)) = (chars.next(), chars.next()) {
                let hex_str = format!("{}{}", h1 as char, h2 as char);
                if let Ok(val) = u8::from_str_radix(&hex_str, 16) {
                    bytes.push(val);
                    continue;
                }
            }
        }
        bytes.push(b);
    }
    String::from_utf8_lossy(&bytes).to_string()
}

fn parse_github_url(url: &str) -> (Option<String>, Option<String>) {
    let cleaned = url.trim().trim_end_matches(".git");
    
    // Pattern 1: git@github.com:owner/repo
    if let Some(pos) = cleaned.find("github.com:") {
        let remainder = &cleaned[pos + "github.com:".len()..];
        let parts: Vec<&str> = remainder.split('/').collect();
        if parts.len() >= 2 {
            return (Some(parts[0].to_string()), Some(parts[1].to_string()));
        }
    }

    // Pattern 2: https://github.com/owner/repo or ssh://git@github.com/owner/repo
    if let Some(pos) = cleaned.find("github.com/") {
        let remainder = &cleaned[pos + "github.com/".len()..];
        let parts: Vec<&str> = remainder.split('/').collect();
        if parts.len() >= 2 {
            return (Some(parts[0].to_string()), Some(parts[1].to_string()));
        }
    }

    (None, None)
}

#[tauri::command]
pub fn get_git_info() -> Result<GitRepoInfo, String> {
    let user_name = std::process::Command::new("git")
        .args(["config", "user.name"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        })
        .filter(|s| !s.is_empty());

    let user_email = std::process::Command::new("git")
        .args(["config", "user.email"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        })
        .filter(|s| !s.is_empty());

    let remote_url = std::process::Command::new("git")
        .args(["remote", "get-url", "origin"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        });

    let (owner, repo) = if let Some(url) = remote_url {
        parse_github_url(&url)
    } else {
        (None, None)
    };

    Ok(GitRepoInfo {
        git_user_name: user_name,
        git_user_email: user_email,
        github_owner: owner,
        github_repo: repo,
    })
}

#[tauri::command]
pub fn get_vscode_info() -> Result<VSCodeInfo, String> {
    let developer = std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .unwrap_or_else(|_| "Utilisateur".to_string());

    let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let current_project = current_dir
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .unwrap_or_else(|| "Projet".to_string());
    let current_path = current_dir.to_string_lossy().to_string();

    // Check code CLI
    let version_cmd = std::process::Command::new("code")
        .arg("--version")
        .output();

    let (installed, version) = match version_cmd {
        Ok(out) if out.status.success() => {
            let s = String::from_utf8_lossy(&out.stdout);
            let first_line = s.lines().next().unwrap_or("1.0.0").trim().to_string();
            (true, first_line)
        }
        _ => {
            let common_paths = [
                "/usr/bin/code",
                "/usr/local/bin/code",
                "/snap/bin/code",
                "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
            ];
            let mut found = (false, "Non détecté".to_string());
            for p in common_paths {
                if Path::new(p).exists() {
                    if let Ok(out) = std::process::Command::new(p).arg("--version").output() {
                        if out.status.success() {
                            let s = String::from_utf8_lossy(&out.stdout);
                            let first_line = s.lines().next().unwrap_or("1.0.0").trim().to_string();
                            found = (true, first_line);
                            break;
                        }
                    }
                }
            }
            found
        }
    };

    // Locate VS Code config directory
    let home = dirs::home_dir().unwrap_or_default();
    let config_dir = dirs::config_dir()
        .map(|d| d.join("Code").join("User"))
        .or_else(|| Some(home.join(".config").join("Code").join("User")));

    let mut active_theme = "Dark+ (vs-dark)".to_string();
    let mut workspaces = Vec::new();

    if let Some(user_dir) = config_dir {
        // Read theme from storage.json
        let storage_path = user_dir.join("globalStorage").join("storage.json");
        if let Ok(content) = fs::read_to_string(&storage_path) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(theme) = json.get("theme").and_then(|t| t.as_str()) {
                    active_theme = match theme {
                        "vs-dark" => "Dark+ (vs-dark)".to_string(),
                        "vs" => "Light+ (vs)".to_string(),
                        "hc-black" => "High Contrast Dark".to_string(),
                        "hc-light" => "High Contrast Light".to_string(),
                        other => other.to_string(),
                    };
                }
            }
        }

        // Read workspaces from workspaceStorage/*/workspace.json
        let ws_storage = user_dir.join("workspaceStorage");
        if ws_storage.is_dir() {
            if let Ok(entries) = fs::read_dir(ws_storage) {
                for entry in entries.flatten() {
                    let ws_file = entry.path().join("workspace.json");
                    if ws_file.is_file() {
                        if let Ok(content) = fs::read_to_string(ws_file) {
                            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                                if let Some(folder_uri) = json.get("folder").and_then(|f| f.as_str()) {
                                    let raw_path = folder_uri.strip_prefix("file://").unwrap_or(folder_uri);
                                    let decoded = percent_decode(raw_path);
                                    let path_obj = Path::new(&decoded);
                                    let name = path_obj
                                        .file_name()
                                        .map(|f| f.to_string_lossy().to_string())
                                        .unwrap_or_else(|| decoded.clone());

                                    let display_path = if !home.as_os_str().is_empty()
                                        && decoded.starts_with(&home.to_string_lossy().to_string())
                                    {
                                        decoded.replacen(&home.to_string_lossy().to_string(), "~", 1)
                                    } else {
                                        decoded.clone()
                                    };

                                    let is_cur = decoded == current_path;

                                    if !workspaces.iter().any(|w: &VSCodeWorkspaceItem| w.path == display_path) {
                                        workspaces.push(VSCodeWorkspaceItem {
                                            name,
                                            path: display_path,
                                            is_current: is_cur,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if !workspaces.is_empty() {
        workspaces.sort_by(|a, b| b.is_current.cmp(&a.is_current));
    }

    let total = workspaces.len();
    let status = if installed { "connected" } else { "standby" }.to_string();

    Ok(VSCodeInfo {
        installed,
        version,
        developer,
        active_theme,
        total_workspaces: total,
        current_project,
        current_path,
        workspaces,
        status,
    })
}
