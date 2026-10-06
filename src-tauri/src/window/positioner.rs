use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize};

const PILL_WIDTH: u32 = 84;
const PILL_HEIGHT: u32 = 42;

const EXPANDED_WIDTH: u32 = 750;
const EXPANDED_HEIGHT: u32 = 250;
const EXPANDED_HEIGHT_CHAT: u32 = 420;

pub fn set_pill_mode(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window
            .set_size(PhysicalSize::new(PILL_WIDTH, PILL_HEIGHT))
            .map_err(|e| e.to_string())?;

        // Anchor flush to top-center of the screen
        if let Ok(Some(monitor)) = window.current_monitor() {
            let screen_width = monitor.size().width;
            let x = (screen_width.saturating_sub(PILL_WIDTH)) / 2;
            window
                .set_position(PhysicalPosition::new(x as i32, 0))
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}

pub fn set_expanded_mode(app: &AppHandle, is_chat: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let height = if is_chat {
            EXPANDED_HEIGHT_CHAT
        } else {
            EXPANDED_HEIGHT
        };

        window
            .set_size(PhysicalSize::new(EXPANDED_WIDTH, height))
            .map_err(|e| e.to_string())?;

        // Anchor flush to top-center of the screen
        if let Ok(Some(monitor)) = window.current_monitor() {
            let screen_width = monitor.size().width;
            let x = (screen_width.saturating_sub(EXPANDED_WIDTH)) / 2;
            window
                .set_position(PhysicalPosition::new(x as i32, 0))
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}
