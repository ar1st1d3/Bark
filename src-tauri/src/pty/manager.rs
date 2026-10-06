use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

pub struct PtySession {
    pub master: Box<dyn MasterPty + Send>,
    pub writer: Box<dyn Write + Send>,
}

pub type PtySessionMap = Arc<Mutex<HashMap<String, PtySession>>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PtyOutputPayload {
    pub session_id: String,
    pub data: String,
}

pub struct PtyManager {
    sessions: PtySessionMap,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn spawn(
        &self,
        app: AppHandle,
        session_id: String,
        command: String,
        args: Vec<String>,
        cwd: Option<String>,
        cols: u16,
        rows: u16,
    ) -> Result<(), String> {
        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY: {}", e))?;

        let mut cmd = CommandBuilder::new(&command);
        for arg in args {
            cmd.arg(arg);
        }
        if let Some(c) = cwd {
            cmd.cwd(c);
        }

        let _child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command in PTY: {}", e))?;

        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to clone reader: {}", e))?;
        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to take writer: {}", e))?;

        {
            let mut map = self.sessions.lock().unwrap();
            map.insert(
                session_id.clone(),
                PtySession {
                    master: pair.master,
                    writer,
                },
            );
        }

        let sid = session_id.clone();
        std::thread::spawn(move || {
            let mut buffer = [0u8; 4096];
            loop {
                match reader.read(&mut buffer) {
                    Ok(0) => {
                        let _ = app.emit(
                            "bark://pty-exit",
                            serde_json::json!({ "session_id": sid }),
                        );
                        break;
                    }
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buffer[..n]).to_string();
                        let _ = app.emit(
                            "bark://pty-output",
                            PtyOutputPayload {
                                session_id: sid.clone(),
                                data,
                            },
                        );
                    }
                    Err(_) => {
                        let _ = app.emit(
                            "bark://pty-exit",
                            serde_json::json!({ "session_id": sid }),
                        );
                        break;
                    }
                }
            }
        });

        Ok(())
    }

    pub fn write(&self, session_id: &str, data: &str) -> Result<(), String> {
        let mut map = self.sessions.lock().unwrap();
        if let Some(session) = map.get_mut(session_id) {
            session
                .writer
                .write_all(data.as_bytes())
                .map_err(|e| format!("Failed to write to PTY: {}", e))?;
            session
                .writer
                .flush()
                .map_err(|e| format!("Failed to flush PTY writer: {}", e))?;
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    }

    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let map = self.sessions.lock().unwrap();
        if let Some(session) = map.get(session_id) {
            session
                .master
                .resize(PtySize {
                    rows,
                    cols,
                    pixel_width: 0,
                    pixel_height: 0,
                })
                .map_err(|e| format!("Failed to resize PTY: {}", e))?;
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    }

    pub fn kill(&self, session_id: &str) -> Result<(), String> {
        let mut map = self.sessions.lock().unwrap();
        map.remove(session_id);
        Ok(())
    }
}
