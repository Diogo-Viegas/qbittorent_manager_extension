chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "qbit-filmes", title: "🎬 Enviar para qBittorrent (Filmes)", contexts: ["link"] });
  chrome.contextMenus.create({ id: "qbit-series", title: "📺 Enviar para qBittorrent (Séries)", contexts: ["link"] });
  chrome.contextMenus.create({ id: "qbit-default", title: "📥 Enviar para qBittorrent (Geral)", contexts: ["link"] });
});

async function addTorrent(linkUrl, category) {
  const config = await chrome.storage.local.get({
    url: "http://192.168.1.38:8082",
    username: "admin",
    password: ""
  });

  const loginData = new URLSearchParams({ username: config.username, password: config.password });
  const loginRes = await fetch(`${config.url}/api/v2/auth/login`, {
    method: "POST",
    body: loginData,
    credentials: "include"
  });

  const loginText = await loginRes.text();
  if (loginText !== "Ok.") {
    throw new Error(`Login falhou (${loginText || loginRes.status}). Verifica a password.`);
  }

  const formData = new URLSearchParams();
  formData.append("urls", linkUrl);
  if (category) formData.append("category", category);

  const addRes = await fetch(`${config.url}/api/v2/torrents/add`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!addRes.ok) throw new Error("Servidor recusou o torrent.");
  return true;
}

// Escuta o botão "Confirmar Download" da janela modal na página
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "addTorrent") {
    addTorrent(msg.url, msg.category)
      .then(() => {
        notify("Download Iniciado!", `Categoria: ${msg.category || "Geral"}`);
        sendResponse({ ok: true });
      })
      .catch((err) => {
        notify("Erro no qBittorrent", err.message);
        sendResponse({ ok: false, error: err.message });
      });
    return true; // Mantém o canal aberto para resposta assíncrona
  }
});

// Escuta também o menu do botão direito
chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.linkUrl) return;
  const cat = info.menuItemId === "qbit-filmes" ? "FILMES" : info.menuItemId === "qbit-series" ? "SERIES" : "";
  addTorrent(info.linkUrl, cat)
    .then(() => notify("Download Iniciado!", `Categoria: ${cat || "Geral"}`))
    .catch((err) => notify("Erro no qBittorrent", err.message));
});

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    title,
    message
  });
}