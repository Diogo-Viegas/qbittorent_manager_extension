// Interceta cliques esquerdos em links magnet: ou .torrent
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link || !link.href) return;

  const href = link.href.trim();
  const isMagnet = href.startsWith("magnet:");
  const isTorrent = href.toLowerCase().endsWith(".torrent");

  if (isMagnet || isTorrent) {
    e.preventDefault();
    e.stopPropagation();
    showConfirmModal(href, link.textContent.trim() || href);
  }
}, true);

function showConfirmModal(url, title) {
  const old = document.getElementById("qbit-nas-modal");
  if (old) old.remove();

  // Extrai o nome legível do link magnet (parâmetro dn=) se existir
  let displayName = title;
  if (url.startsWith("magnet:")) {
    const match = url.match(/[?&]dn=([^&]+)/);
    if (match) displayName = decodeURIComponent(match[1].replace(/\+/g, " "));
  }

  const overlay = document.createElement("div");
  overlay.id = "qbit-nas-modal";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.72); z-index: 2147483647;
    display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif;
  `;

  overlay.innerHTML = `
    <div style="background:#181a1b; color:#e8e6e3; width:380px; max-width:90vw; padding:18px; border-radius:10px; border:1px solid #333; box-shadow:0 10px 30px rgba(0,0,0,0.6);">
      <h3 style="margin:0 0 10px 0; font-size:16px; color:#60a5fa;">⚡ Enviar para qBittorrent (NAS)</h3>
      <div style="font-size:12px; color:#9ca3af; background:#111314; padding:8px; border-radius:6px; margin-bottom:14px; word-break:break-all; max-height:60px; overflow:auto;">
        ${displayName}
      </div>
      <label style="display:block; font-size:12px; margin-bottom:6px; color:#d1d5db;">Escolher Categoria (Pasta de destino):</label>
      <select id="qbit-cat-select" style="width:100%; padding:8px; background:#222526; color:#fff; border:1px solid #444; border-radius:6px; margin-bottom:16px; font-size:13px;">
        <option value="Filmes">🎬 Filmes (/filmes)</option>
        <option value="Series">📺 Séries (/series)</option>
        <option value="">📥 Geral (/downloads)</option>
      </select>
      <div style="display:flex; gap:8px; justify-content:flex-end;">
        <button id="qbit-cancel-btn" style="background:#2c3135; color:#e5e7eb; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">Cancelar</button>
        <button id="qbit-confirm-btn" style="background:#2563eb; color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-weight:600;">Confirmar Download</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("qbit-cancel-btn").onclick = () => overlay.remove();
  overlay.onclick = (ev) => { if (ev.target === overlay) overlay.remove(); };

  document.getElementById("qbit-confirm-btn").onclick = () => {
    const category = document.getElementById("qbit-cat-select").value;
    const btn = document.getElementById("qbit-confirm-btn");
    btn.textContent = "A enviar...";
    btn.disabled = true;

    chrome.runtime.sendMessage({ action: "addTorrent", url, category }, (res) => {
      overlay.remove();
      if (!res || !res.ok) {
        alert("Erro ao enviar para o qBittorrent: " + (res?.error || "Verifica a ligação na extensão."));
      }
    });
  };
}