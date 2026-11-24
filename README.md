# ⚡ qBittorrent Manager (Browser Extension)

A lightweight, Manifest V3 browser extension (compatible with **Chrome, Brave, Edge, and Opera**) designed to intercept magnet/torrent links with a clean confirmation modal, sort downloads into categories, and manage active transfers on a remote qBittorrent server from a quick-access popup.

## ✨ Features

* **Left-Click Confirmation Modal (`content.js`):** Clicking any `magnet:` or `.torrent` link on a webpage opens an on-page dark-mode confirmation dialog showing the decoded torrent name and a dropdown to choose the target category (**Movies (`Filmes`)**, **TV Shows (`Series`)**, or **General**) before starting the download.
* **Right-Click Context Menu:** Alternatively, right-click any magnet or `.torrent` link to send it directly to **Filmes**, **Series**, or **Geral** with a single click.
* **Quick Control Popup:** View active downloads, progress bars, real-time download speeds, and categories without opening the full qBittorrent WebUI.
* **Instant Torrent Actions:** Pause (`⏸️`), resume (`▶️`), or remove (`🗑️`) torrents directly from the toolbar popup.
* **Clear Error Feedback & Connection Testing:** Built-in connection tester inside the settings panel that validates authentication against the qBittorrent API v2 and displays clear error messages if login fails or the server is unreachable.
* **Desktop Notifications:** Receive immediate confirmation when a torrent is added or alerted if an error occurs.

---

## 📁 Project Structure

```text
qbittorrent-manager/
├── manifest.json    # Extension configuration, permissions, and content script rules (Manifest V3)
├── content.js       # Intercepts left-clicks on magnet/.torrent links and renders the confirmation modal
├── background.js    # Service worker handling API v2 login, modal messages, context menus, and notifications
├── popup.html       # Dark-mode UI for the extension popup and connection settings panel
└── popup.js         # Fetches torrent stats, tests/saves credentials, and handles pause/resume/delete actions
