const listEl = document.getElementById("list");
const settingsEl = document.getElementById("settings");
const saveBtn = document.getElementById("saveSettings");
let settingsInitialized = false;

document.getElementById("toggleSettings").onclick = () => {
  settingsEl.style.display = settingsEl.style.display === "none" ? "block" : "none";
};

saveBtn.onclick = async () => {
  saveBtn.textContent = "A testar ligação...";
  await chrome.storage.local.set({
    url: document.getElementById("url").value.trim().replace(/\/$/, ""),
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value
  });
  await loadTorrents(true);
  saveBtn.textContent = "Guardar Ligação";
};

async function apiCall(endpoint, params = null) {
  const cfg = await chrome.storage.local.get({
    url: "http://192.168.1.38:8082",
    username: "admin",
    password: ""
  });

  const loginData = new URLSearchParams({ username: cfg.username, password: cfg.password });
  const loginRes = await fetch(`${cfg.url}/api/v2/auth/login`, {
    method: "POST",
    body: loginData,
    credentials: "include"
  });

  const loginText = await loginRes.text();
  if (loginText !== "Ok.") {
    throw new Error(`Login recusado: "${loginText || loginRes.status}". Confirma utilizador/password.`);
  }

  const opts = { credentials: "include" };
  if (params) {
    opts.method = "POST";
    opts.body = new URLSearchParams(params);
  }
  const res = await fetch(`${cfg.url}${endpoint}`, opts);
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
  return res.text();
}

async function loadTorrents(closeSettingsOnSuccess = false) {
  if (!settingsInitialized) {
    const cfg = await chrome.storage.local.get({ url: "http://192.168.1.38:8082", username: "admin", password: "" });
    document.getElementById("url").value = cfg.url;
    document.getElementById("username").value = cfg.username;
    document.getElementById("password").value = cfg.password;
    settingsInitialized = true;
  }

  try {
    const raw = await apiCall("/api/v2/torrents/info?sort=added_on&reverse=true");
    const torrents = JSON.parse(raw);

    if (closeSettingsOnSuccess) settingsEl.style.display = "none";

    if (!torrents.length) {
      listEl.innerHTML = "<p style='color:#4ade80; font-size:12px;'>✅ Ligado! Sem torrents ativos na lista.</p>";
      return;
    }

    listEl.innerHTML = torrents.slice(0, 8).map(t => {
      const pct = (t.progress * 100).toFixed(1);
      const speed = (t.dlspeed / 1024 / 1024).toFixed(1);
      const isPaused = t.state.includes("paused") || t.state.includes("stopped");
      return `
        <div class="torrent">
          <div class="name" title="${t.name}">${t.name}</div>
          <div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="meta">
            <span>${pct}% • ${speed} MB/s • [${t.category || "Geral"}]</span>
            <span class="actions">
              <button data-act="${isPaused ? 'resume' : 'pause'}" data-hash="${t.hash}">${isPaused ? '▶️' : '⏸️'}</button>
              <button data-act="delete" data-hash="${t.hash}">🗑️</button>
            </span>
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".actions button").forEach(btn => {
      btn.onclick = async () => {
        const hash = btn.dataset.hash;
        const act = btn.dataset.act;
        if (act === "pause") await apiCall("/api/v2/torrents/pause", { hashes: hash });
        if (act === "resume") await apiCall("/api/v2/torrents/resume", { hashes: hash });
        if (act === "delete") await apiCall("/api/v2/torrents/delete", { hashes: hash, deleteFiles: "false" });
        setTimeout(loadTorrents, 400);
      };
    });
  } catch (e) {
    listEl.innerHTML = `<p style='color:#f87171; font-size:12px;'>❌ ${e.message}</p>`;
    settingsEl.style.display = "block";
  }
}

loadTorrents();
setInterval(loadTorrents, 3000);