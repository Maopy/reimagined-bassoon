use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{command, AppHandle};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoInfo {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub title: String,
    pub thumbnail: Option<String>,
    pub duration: Option<u32>,
    pub uploader: Option<String>,
}

// 配置常量
const SIDECAR_YT_DLP: &str = "yt-dlp";
const SIDECAR_BUN: &str = "bun";
const ENV_BUN_PATH: &str = "BUN_PATH";

/// 获取 bun sidecar 的路径
/// 优先从环境变量读取，否则使用可执行文件目录
fn get_bun_path() -> PathBuf {
    std::env::var(ENV_BUN_PATH)
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            let exe_dir = std::env::current_exe()
                .map(|p| p.parent().unwrap().to_path_buf())
                .unwrap_or_default();
            exe_dir.join(SIDECAR_BUN)
        })
}

#[command]
pub async fn cmd_get_video_info(app: AppHandle, url: String) -> Result<String, String> {
    log::info!("Fetching video info for URL: {}", url);

    // tauri_plugin_shell allows acquiring a Command bound to a registered sidecar
    let command = app
        .shell()
        .sidecar(SIDECAR_YT_DLP)
        .map_err(|e| {
            log::error!("Failed to create yt-dlp command: {}", e);
            e.to_string()
        })?;

    // 获取 bun 路径（支持环境变量配置）
    let bun_path = get_bun_path();
    log::debug!("Using bun path: {:?}", bun_path);

    let js_runtime_arg = format!("bun:{}", bun_path.to_string_lossy());

    // 检查 bun 路径是否存在（开发环境提示）
    if !bun_path.exists() {
        log::warn!(
            "Bun sidecar not found at: {:?}. You can set {} environment variable to override.",
            bun_path,
            ENV_BUN_PATH
        );
    }

    // Call yt-dlp to dump JSON info without downloading the video
    log::debug!("Spawning yt-dlp with args: -J {}", url);
    let (mut rx, _child) = command
        .args(["-J", &url])
        .args(["--js-runtimes", &js_runtime_arg])
        .args(["--cookies-from-browser", "chrome"]) // Try resolving bot detection via browser cookies
        .spawn()
        .map_err(|e| {
            log::error!("Failed to spawn yt-dlp sidecar: {}", e);
            format!("Failed to spawn yt-dlp sidecar: {}", e)
        })?;

    let mut output = String::new();
    let mut err_output = String::new();

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => {
                output.push_str(&String::from_utf8_lossy(&line));
            }
            CommandEvent::Stderr(line) => {
                let err_str = String::from_utf8_lossy(&line);
                log::debug!("yt-dlp stderr: {}", err_str);
                err_output.push_str(&err_str);
            }
            CommandEvent::Error(err) => {
                log::error!("Command execution error: {}", err);
                return Err(format!("Command execution error: {}", err));
            }
            CommandEvent::Terminated(payload) => {
                log::debug!("yt-dlp terminated with code: {:?}", payload.code);
                if payload.code != Some(0) {
                    log::error!("yt-dlp exited with error code: {:?}", payload.code);
                    return Err(format!("yt-dlp exited with error: {}", err_output));
                }
            }
            _ => {}
        }
    }

    log::info!("Successfully fetched video info ({} bytes)", output.len());
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

    #[test]
    fn test_video_info_empty_json() {
        // Given empty JSON object
        let json_str = "{}";

        // When - should still deserialize with defaults
        let parsed: VideoInfo = serde_json::from_str(json_str).expect("Failed to deserialize JSON");

        // Then
        assert_eq!(parsed.id, "");
        assert_eq!(parsed.title, "");
        assert_eq!(parsed.thumbnail, None);
        assert_eq!(parsed.duration, None);
        assert_eq!(parsed.uploader, None);
    }

    #[test]
    fn test_video_info_complex_json() {
        // Given complex JSON with nested objects (yt-dlp output)
        let mocked_output = json!({
            "id": "abc123",
            "title": "Test Video",
            "thumbnail": "https://i.ytimg.com/vi/abc123/maxresdefault.jpg",
            "duration": 3600,
            "uploader": "Test Channel",
            "uploader_id": "UCxxx",
            "upload_date": "20240101",
            "description": "This is a test video",
            "view_count": 1000000,
            "like_count": 50000,
            "formats": [
                {
                    "format_id": "137",
                    "ext": "mp4",
                    "resolution": "1920x1080",
                    "fps": 60,
                    "vcodec": "avc1.640028",
                    "acodec": "none"
                }
            ]
        });

        let json_str = mocked_output.to_string();

        // When
        let parsed: VideoInfo =
            serde_json::from_str(&json_str).expect("Failed to deserialize JSON");

        // Then - should only extract relevant fields
        assert_eq!(parsed.id, "abc123");
        assert_eq!(parsed.title, "Test Video");
        assert_eq!(parsed.duration, Some(3600));
    }

    #[test]
    fn test_video_info_special_chars() {
        // Given JSON with special characters and unicode
        let mocked_output = json!({
            "id": "test_123-abc",
            "title": "Test Video 🎵 日本語",
            "thumbnail": "https://example.com/thumb?size=large",
            "duration": 0,
            "uploader": "Channel & Co."
        });

        let json_str = mocked_output.to_string();

        // When
        let parsed: VideoInfo =
            serde_json::from_str(&json_str).expect("Failed to deserialize JSON");

        // Then
        assert_eq!(parsed.id, "test_123-abc");
        assert_eq!(parsed.title, "Test Video 🎵 日本語");
        assert_eq!(parsed.uploader, Some("Channel & Co.".to_string()));
    }
}
