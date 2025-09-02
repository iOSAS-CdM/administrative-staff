use std::str::FromStr;
use tauri_plugin_deep_link::DeepLinkExt;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
		.plugin(tauri_plugin_deep_link::init())
		.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
			println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
			// when defining deep link schemes at runtime, you must also check `argv` here
			}))
		.plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_oauth::init())
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
        .invoke_handler(tauri::generate_handler![set_theme])
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