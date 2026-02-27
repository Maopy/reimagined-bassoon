use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoInfo {
    pub id: String,
    pub title: String,
    pub thumbnail: Option<String>,
    pub duration: Option<u32>,
    pub uploader: Option<String>,
}

#[command]
pub async fn cmd_get_video_info(app: AppHandle, url: String) -> Result<String, String> {
    // tauri_plugin_shell allows acquiring a Command bound to a registered sidecar
    let command = app.shell().sidecar("yt-dlp").map_err(|e| e.to_string())?;

    // Find the current executable directory to locate the bun sidecar.
    // In Tauri v2, sidecars are placed adjacent to the executable during dev/build without their target triple suffix.
    let exe_dir = std::env::current_exe()
        .map(|p| p.parent().unwrap().to_path_buf())
        .unwrap_or_default();

    // Construct absolute path to bun
    let bun_path = exe_dir.join("bun");
    let js_runtime_arg = format!("bun:{}", bun_path.to_string_lossy());

    // Call yt-dlp to dump JSON info without downloading the video
    let (mut rx, _child) = command
        .args(["-J", &url])
        .args(["--js-runtimes", &js_runtime_arg])
        .args(["--cookies-from-browser", "chrome"]) // Try resolving bot detection via browser cookies
        .spawn()
        .map_err(|e| format!("Failed to spawn yt-dlp sidecar: {}", e))?;

    let mut output = String::new();
    let mut err_output = String::new();

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => {
                output.push_str(&String::from_utf8_lossy(&line));
            }
            CommandEvent::Stderr(line) => {
                err_output.push_str(&String::from_utf8_lossy(&line));
            }
            CommandEvent::Error(err) => {
                return Err(format!("Command execution error: {}", err));
            }
            CommandEvent::Terminated(payload) => {
                if payload.code != Some(0) {
                    return Err(format!("yt-dlp exited with error: {}", err_output));
                }
            }
            _ => {}
        }
    }

    // Return the raw JSON string from yt-dlp, frontend will parse it
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_video_info_deserialization() {
        // Given a sample output mimicking yt-dlp's minimal JSON structure
        let mocked_output = json!({
            "id": "dQw4w9WgXcQ",
            "title": "Rick Astley - Never Gonna Give You Up",
            "thumbnail": "https://example.com/thumb.jpg",
            "duration": 212,
            "uploader": "Rick Astley"
        });

        let json_str = mocked_output.to_string();

        // When deserializing into VideoInfo
        let parsed: VideoInfo =
            serde_json::from_str(&json_str).expect("Failed to deserialize JSON");

        // Then it should map correctly
        assert_eq!(parsed.id, "dQw4w9WgXcQ");
        assert_eq!(parsed.title, "Rick Astley - Never Gonna Give You Up");
        assert_eq!(
            parsed.thumbnail,
            Some("https://example.com/thumb.jpg".to_string())
        );
        assert_eq!(parsed.duration, Some(212));
        assert_eq!(parsed.uploader, Some("Rick Astley".to_string()));
    }

    #[test]
    fn test_video_info_partial_deserialization() {
        // Given JSON missing optional fields
        let mocked_output = json!({
            "id": "12345",
            "title": "Unknown Video"
        });

        let json_str = mocked_output.to_string();

        // When
        let parsed: VideoInfo =
            serde_json::from_str(&json_str).expect("Failed to deserialize JSON");

        // Then mandatory fields match and optional fields are None
        assert_eq!(parsed.id, "12345");
        assert_eq!(parsed.duration, None);
        assert_eq!(parsed.uploader, None);
    }
}
