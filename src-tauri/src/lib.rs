use std::str::FromStr;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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