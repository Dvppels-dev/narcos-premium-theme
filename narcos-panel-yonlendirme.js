/*!
 * narcos-panel-yonlendirme.js
 *
 * Lynon CMS'te sayfa başına özel HTML alanı olmadığı, yalnızca site geneli
 * "Header Script" bulunduğu için yönlendirme merkezî olarak burada yapılır.
 *
 * Eşleşen CMS kategori sayfaları panele yönlendirilir.
 */
(function () {
  "use strict";

  var HARITA = {
    "/bonusrequest": "https://narcosbahis.vip/#/bonus-talep",
    "/narcoscark":   "https://narcosbahis.vip/#/cark",
    "/aranmatalep":  "https://narcosbahis.vip/#/beni-ara",
    "/narcosskor":   "https://narcosbahis.vip/#/skor-tahmin"
  };

  function hedefBul() {
    var yol = (location.pathname || "/").toLowerCase().replace(/\/+$/, "");
    // Dil önekini ayır: /tr/bonusrequest -> /bonusrequest
    var dilsiz = yol.replace(/^\/[a-z]{2}(?=\/)/, "");
    return HARITA[dilsiz] || HARITA[yol] || null;
  }

  function yonlendir() {
    if (window.__ngPanelYonlendirildi) return;
    var hedef = hedefBul();
    if (!hedef) return;
    window.__ngPanelYonlendirildi = true;

    var url;
    try {
      url = new URL(hedef);
      url.searchParams.set("ref", location.pathname);
    } catch (e) {
      location.replace(hedef);
      return;
    }
    // replace: geri tuşunda CMS sayfasına dönüp tekrar yönlenme döngüsü olmaz
    location.replace(url.toString());
  }

  yonlendir();

  // SPA içi gezinmede de çalışsın
  ["pushState", "replaceState"].forEach(function (ad) {
    var orj = history[ad];
    if (typeof orj !== "function") return;
    history[ad] = function () {
      var r = orj.apply(this, arguments);
      setTimeout(yonlendir, 0);
      return r;
    };
  });
  window.addEventListener("popstate", function () { setTimeout(yonlendir, 0); });
})();
