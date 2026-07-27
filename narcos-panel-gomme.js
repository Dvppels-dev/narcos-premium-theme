/*!
 * narcos-panel-gomme.js
 *
 * CMS kategori sayfalarında paneli iframe olarak gömer (yönlendirme YAPMAZ).
 * Lynon'da sayfa başına HTML alanı olmadığı için eşleştirme merkezîdir.
 *
 * ÖN KOŞUL: panelin CSP'sinde frame-ancestors bu alan adını içermeli,
 * aksi halde tarayıcı iframe'i boş gösterir.
 */
(function () {
  "use strict";

  var HARITA = {
    "/bonusrequest": "https://narcosbahis.vip/#/bonus-talep",
    "/narcoscark":   "https://narcosbahis.vip/#/cark",
    "/aranmatalep":  "https://narcosbahis.vip/#/beni-ara",
    "/narcosskor":   "https://narcosbahis.vip/#/skor-tahmin"
  };
  var KAP_ID = "narcos-panel-frame";

  function hedefBul() {
    var yol = (location.pathname || "/").toLowerCase().replace(/\/+$/, "");
    var dilsiz = yol.replace(/^\/[a-z]{2}(?=\/)/, "");
    return HARITA[dilsiz] || HARITA[yol] || null;
  }

  function icerikAlani() {
    return document.querySelector('main[data-mj="page-content"]') ||
           document.querySelector("main") ||
           document.getElementById("root");
  }

  function goster() {
    var hedef = hedefBul();
    var mevcut = document.getElementById(KAP_ID);

    if (!hedef) {                       // eşleşmeyen sayfada kalıntı bırakma
      if (mevcut) mevcut.remove();
      return;
    }
    if (mevcut) {                       // zaten var; hedef değiştiyse güncelle
      var f = mevcut.querySelector("iframe");
      if (f && f.src !== hedef) f.src = hedef;
      return;
    }

    var yer = icerikAlani();
    if (!yer) return;                   // henüz render olmadı, gözlemci tekrar dener

    var kap = document.createElement("div");
    kap.id = KAP_ID;
    kap.style.cssText =
      "width:100%;min-height:min(760px,82vh);overflow:hidden;" +
      "border-radius:16px;background:#09090b;margin:0 auto;";

    var ifr = document.createElement("iframe");
    ifr.src = hedef;
    ifr.setAttribute("loading", "lazy");
    ifr.setAttribute("title", "Narcos Panel");
    ifr.setAttribute("allow", "clipboard-write");
    ifr.style.cssText =
      "display:block;width:100%;height:100%;min-height:inherit;border:0;";
    kap.appendChild(ifr);

    yer.innerHTML = "";                 // kategori sayfasının boş içeriğini temizle
    yer.appendChild(kap);
  }

  function planla() { setTimeout(goster, 0); }

  planla();

  ["pushState", "replaceState"].forEach(function (ad) {
    var orj = history[ad];
    if (typeof orj !== "function") return;
    history[ad] = function () { var r = orj.apply(this, arguments); planla(); return r; };
  });
  window.addEventListener("popstate", planla);

  // SPA içeriği geç render ederse kabı yeniden yerleştir
  if (typeof MutationObserver === "function" && document.body) {
    var gozlemci = new MutationObserver(function () {
      if (hedefBul() && !document.getElementById(KAP_ID)) goster();
    });
    gozlemci.observe(document.body, { childList: true, subtree: true });
  }
})();
