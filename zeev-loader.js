<script>
(function () {
  // evita duplicar se o Zeev recarregar trechos da tela
  if (document.getElementById("raiz-chatbot-root")) return;

  // tenta pegar contexto do Zeev
  var zeevCtx = window.__zeev || window._zeev || window.zeev || {};
  var ctxBase64 = "";
  try {
    ctxBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(zeevCtx))));
  } catch (e) {
    ctxBase64 = "";
  }

  // URL do seu widget (GitHub Pages)
  var WIDGET_URL = "https://brunooliveiraraiz.github.io/zeev-chatbot/";
  var iframeSrc = WIDGET_URL + (ctxBase64 ? ("?context=" + encodeURIComponent(ctxBase64)) : "");

  // root
  var root = document.createElement("div");
  root.id = "raiz-chatbot-root";
  root.style.position = "fixed";
  root.style.right = "18px";
  root.style.bottom = "18px";
  root.style.zIndex = "2147483647";
  root.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial";

  // botão flutuante
  var btn = document.createElement("button");
  btn.type = "button";
  btn.id = "raiz-chatbot-btn";
  btn.innerText = "💬";
  btn.title = "Abrir chat";
  btn.style.width = "56px";
  btn.style.height = "56px";
  btn.style.borderRadius = "999px";
  btn.style.border = "0";
  btn.style.cursor = "pointer";
  btn.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";
  btn.style.fontSize = "22px";
  btn.style.lineHeight = "56px";
  btn.style.textAlign = "center";
  btn.style.background = "#0EA5E9";
  btn.style.color = "#fff";

  // container do iframe
  var panel = document.createElement("div");
  panel.id = "raiz-chatbot-panel";
  panel.style.position = "absolute";
  panel.style.right = "0";
  panel.style.bottom = "72px";
  panel.style.width = "380px";
  panel.style.height = "560px";
  panel.style.borderRadius = "16px";
  panel.style.overflow = "hidden";
  panel.style.boxShadow = "0 18px 50px rgba(0,0,0,.35)";
  panel.style.background = "#fff";
  panel.style.display = "none";

  // iframe
  var iframe = document.createElement("iframe");
  iframe.src = iframeSrc;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.setAttribute("allow", "clipboard-read; clipboard-write");
  panel.appendChild(iframe);

  // comportamento abrir/fechar
  function toggle(open) {
    var isOpen = panel.style.display !== "none";
    var next = (typeof open === "boolean") ? open : !isOpen;
    panel.style.display = next ? "block" : "none";
    btn.innerText = next ? "✕" : "💬";
    btn.title = next ? "Fechar chat" : "Abrir chat";
  }

  btn.addEventListener("click", function () {
    toggle();
  });

  // fechar ao apertar ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") toggle(false);
  });

  // mobile: abre em tela cheia
  function applyResponsive() {
    var isMobile = window.innerWidth < 480;
    if (isMobile) {
      panel.style.width = "calc(100vw - 24px)";
      panel.style.height = "calc(100vh - 120px)";
      panel.style.right = "0";
    } else {
      panel.style.width = "380px";
      panel.style.height = "560px";
    }
  }
  window.addEventListener("resize", applyResponsive);
  applyResponsive();

  root.appendChild(panel);
  root.appendChild(btn);

  // injeta no body
  document.body.appendChild(root);
})();
</script>
