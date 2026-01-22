(function () {
  // evita duplicar
  if (document.getElementById("raiz-chatbot-root")) return;

  // contexto Zeev (se existir)
  var zeevCtx = window.__zeev || window._zeev || window.zeev || {};
  var ctxBase64 = "";
  try {
    ctxBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(zeevCtx))));
  } catch (e) {
    ctxBase64 = "";
  }

  // URLs
  var WIDGET_URL = "https://brunooliveiraraiz.github.io/zeev-chatbot/";
  var ROBOT_IMG = "https://brunooliveiraraiz.github.io/zeev-chatbot/robot.png";
  var iframeSrc =
    WIDGET_URL + (ctxBase64 ? "?context=" + encodeURIComponent(ctxBase64) : "");

  // root fixo no viewport (não depende do layout do Zeev)
  var host = document.createElement("div");
  host.id = "raiz-chatbot-root";
  host.style.position = "fixed";
  host.style.right = "18px";
  host.style.bottom = "18px";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "auto";

  // Shadow DOM (blindagem de CSS do Zeev)
  var shadow = host.attachShadow({ mode: "open" });

  // CSS dentro do shadow
  var style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }

    .wrap { position: relative; }

    .fab {
      all: unset;
      width: 56px;
      height: 56px;
      border-radius: 999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      background: #fff;
      border: 8px solid #1e88ff;
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
      user-select: none;
    }

    .fab img {
      width: 30px;
      height: 30px;
      border-radius: 999px;
      display: block;
    }

    /* painel SEMPRE fixed no viewport (não vai "fugir") */
    .panel {
      position: fixed;
      right: 18px;
      bottom: 92px; /* acima do botão */
      width: 380px;
      height: 560px;
      border-radius: 18px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 18px 50px rgba(0,0,0,.35);
      display: none;
    }

    .iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      background: #fff;
    }

    /* botão fechar (X) separado e fixo, pra não depender do iframe */
    .close {
      all: unset;
      position: fixed;
      right: 18px;
      bottom: 18px;
      width: 44px;
      height: 44px;
      border-radius: 999px;
      cursor: pointer;

      display: none;
      align-items: center;
      justify-content: center;

      background: #1e88ff;
      color: #fff;
      font-size: 22px;
      line-height: 1;
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
      user-select: none;
    }

    @media (max-width: 480px) {
      .panel {
        right: 12px;
        bottom: 84px;
        width: calc(100vw - 24px);
        height: calc(100vh - 140px);
      }
      .close {
        right: 12px;
        bottom: 12px;
      }
      :host {
        right: 12px !important;
        bottom: 12px !important;
      }
    }
  `;
  shadow.appendChild(style);

  // elementos
  var wrap = document.createElement("div");
  wrap.className = "wrap";

  var panel = document.createElement("div");
  panel.className = "panel";

  var iframe = document.createElement("iframe");
  iframe.className = "iframe";
  iframe.src = iframeSrc;
  iframe.setAttribute("allow", "clipboard-read; clipboard-write");
  panel.appendChild(iframe);

  var fab = document.createElement("button");
  fab.className = "fab";
  fab.setAttribute("aria-label", "Abrir chat");

  var icon = document.createElement("img");
  icon.src = ROBOT_IMG;
  icon.alt = "Chat";
  fab.appendChild(icon);

  var closeBtn = document.createElement("button");
  closeBtn.className = "close";
  closeBtn.setAttribute("aria-label", "Fechar chat");
  closeBtn.textContent = "×";

  function openChat() {
    panel.style.display = "block";
    fab.style.display = "none";
    closeBtn.style.display = "flex";
  }

  function closeChat() {
    panel.style.display = "none";
    fab.style.display = "flex";
    closeBtn.style.display = "none";
  }

  fab.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    openChat();
  });

  closeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeChat();
  });

  // ESC fecha
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeChat();
  });

  // clique fora fecha (opcional, ajuda UX)
  document.addEventListener("click", function (e) {
    if (panel.style.display === "none") return;
    // se clicou dentro do shadow, não fecha
    var path = e.composedPath ? e.composedPath() : [];
    if (path && path.indexOf(host) !== -1) return;
    closeChat();
  });

  wrap.appendChild(fab);
  shadow.appendChild(panel);
  shadow.appendChild(closeBtn);
  shadow.appendChild(wrap);

  document.body.appendChild(host);
})();
