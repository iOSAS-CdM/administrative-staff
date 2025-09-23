use std::str::FromStr;
use tauri_plugin_deep_link::DeepLinkExt;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
		.plugin(tauri_plugin_upload::init())
		.plugin(tauri_plugin_deep_link::init())
		.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
			println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
			// when defining deep link schemes at runtime, you must also check `argv` here
			}))
		.plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_oauth::init())
		.plugin(tauri_plugin_process::init())
		.plugin(tauri_plugin_updater::Builder::new().build())
		.setup(|app| {
			#[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
			app.deep_link().register_all()?;

			app.deep_link().on_open_url(|event| {
				dbg!(event.urls());
			});

			Ok(())
		})
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Execute JS to get theme before WebView initialization
            window.eval(&format!(
                r#"
                (function() {{
                    try {{
                        const theme = localStorage.getItem('displayTheme') || 
                                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                        document.documentElement.setAttribute('data-theme', theme);
                        window.__TAURI_INVOKE__('set_theme', {{ theme }});
                    }} catch (e) {{
                        console.error('Theme initialization error:', e);
                    }}
                }})();
                "#
            ))?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_theme, check_for_update, install_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn set_theme(theme: String, window: tauri::Window) {
    use tauri::window::Color;

    let color = if theme == "dark" {
        Color::from_str("#000000").unwrap()
    } else {
        Color::from_str("#FFFFFF").unwrap()
    };

    window.set_background_color(Some(color)).unwrap();
}

#[tauri::command]
async fn check_for_update(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_updater::UpdaterExt;

    match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(update)) => {
                println!("Update available: {}", update.version);
                Ok(Some(update.version.clone()))
            }
            Ok(None) => {
                println!("No update available");
                Ok(None)
            }
            Err(e) => {
                println!("Failed to check for update: {}", e);
                Err(e.to_string())
            }
        },
        Err(e) => {
            println!("Updater not available: {}", e);
            Err("Updater not available".to_string())
        }
    }
}

#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_updater::UpdaterExt;

    match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(update)) => match update.download_and_install(|_, _| {}, || {}).await {
                Ok(_) => {
                    println!("Update installed successfully");
                    Ok(())
                }
                Err(e) => {
                    println!("Failed to install update: {}", e);
                    Err(e.to_string())
                }
            },
            Ok(None) => Err("No update available".to_string()),
            Err(e) => Err(e.to_string()),
        },
        Err(e) => {
            println!("Updater not available: {}", e);
            Err("Updater not available".to_string())
        }
    }
}
