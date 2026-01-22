(function () {
  if (document.getElementById("raiz-chatbot-root")) return;

  // Contexto Zeev (se existir)
  var zeevCtx = window.__zeev || window._zeev || window.zeev || {};
  var ctxBase64 = "";
  try {
    ctxBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(zeevCtx))));
  } catch (e) {
    ctxBase64 = "";
  }

  var WIDGET_URL = "https://brunooliveiraraiz.github.io/zeev-chatbot/";
  var iframeSrc =
    WIDGET_URL + (ctxBase64 ? "?context=" + encodeURIComponent(ctxBase64) : "");

  // ROOT fixo (fora do fluxo do Zeev)
  var host = document.createElement("div");
  host.id = "raiz-chatbot-root";
  host.style.position = "fixed";
  host.style.right = "18px";
  host.style.bottom = "18px";
  host.style.zIndex = "2147483647";
  host.style.width = "0";
  host.style.height = "0";

  // Shadow DOM para blindar CSS do Zeev
  var shadow = host.attachShadow({ mode: "open" });

  // CSS interno (não sofre influência do Zeev)
  var style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }

    .btn {
      all: unset;
      width: 56px;
      height: 56px;
      border-radius: 999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      background: #fff;
      border: 8px solid #1e88ff; /* anel azul */
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
      user-select: none;
    }

    .btn img {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      display: block;
    }

    .btnClose {
      all: unset;
      width: 44px;
      height: 44px;
      border-radius: 999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      background: #1e88ff;
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
      color: #fff;
      font-size: 22px;
      line-height: 1;
      user-select: none;
      margin-top: 10px;
      margin-left: auto;
    }

    .panel {
      position: absolute;
      right: 0;
      bottom: 74px;
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

    @media (max-width: 480px) {
      .panel {
        width: calc(100vw - 24px);
        height: calc(100vh - 140px);
      }
    }
  `;
  shadow.appendChild(style);

  // Container interno
  var wrap = document.createElement("div");
  wrap.style.position = "relative";
  shadow.appendChild(wrap);

  // Painel (iframe)
  var panel = document.createElement("div");
  panel.className = "panel";

  var iframe = document.createElement("iframe");
  iframe.className = "iframe";
  iframe.src = iframeSrc;
  iframe.setAttribute("allow", "clipboard-read; clipboard-write");
  panel.appendChild(iframe);

  // Botão principal (igual ao visual desejado)
  var btn = document.createElement("button");
  btn.className = "btn";
  btn.setAttribute("aria-label", "Abrir chat");

  // Ícone (use um asset estável)
  var icon = document.createElement("img");
  icon.src = "https://brunooliveiraraiz.github.io/zeev-chatbot/favicon.ico";
  icon.alt = "Chat";
  btn.appendChild(icon);

  // Botão fechar (X) dentro do shadow (evita bug de estilo)
  var btnClose = document.createElement("button");
  btnClose.className = "btnClose";
  btnClose.textContent = "×";
  btnClose.style.display = "none";

  function openChat() {
    panel.style.display = "block";
    btn.style.display = "none";
    btnClose.style.display = "flex";
  }

  function closeChat() {
    panel.style.display = "none";
    btn.style.display = "flex";
    btnClose.style.display = "none";
  }

  btn.addEventListener("click", openChat);
  btnClose.addEventListener("click", closeChat);

  // ESC fecha
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeChat();
  });

  wrap.appendChild(panel);
  wrap.appendChild(btn);
  wrap.appendChild(btnClose);

  document.body.appendChild(host);
})();
