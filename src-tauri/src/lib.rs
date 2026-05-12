use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconEvent},
    Manager,
};

static DETACHED: AtomicBool = AtomicBool::new(false);

#[tauri::command]
async fn call_claude(prompt: String) -> Result<String, String> {
    let output = Command::new("claude")
        .arg("-p")
        .arg(&prompt)
        .arg("--output-format")
        .arg("text")
        .arg("--max-turns")
        .arg("1")
        .output()
        .map_err(|e| format!("claude CLI 실행 실패: {}. claude가 설치되어 있는지 확인하세요.", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("claude CLI 에러: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(stdout)
}

#[tauri::command]
async fn set_detached(window: tauri::WebviewWindow, detached: bool) -> Result<(), String> {
    DETACHED.store(detached, Ordering::SeqCst);
    let _ = window.set_always_on_top(!detached);
    Ok(())
}

#[tauri::command]
fn is_detached() -> bool {
    DETACHED.load(Ordering::SeqCst)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![call_claude, set_detached, is_detached])
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                rect,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let (x, y) = match rect.position {
                            tauri::Position::Physical(p) => (p.x, p.y),
                            tauri::Position::Logical(l) => (l.x as i32, l.y as i32),
                        };
                        let h = match rect.size {
                            tauri::Size::Physical(s) => s.height as i32,
                            tauri::Size::Logical(l) => l.height as i32,
                        };
                        let _ = window.set_position(tauri::PhysicalPosition::new(
                            x - 170,
                            y + h,
                        ));
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Focused(false) = event {
                if !DETACHED.load(Ordering::SeqCst) {
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
