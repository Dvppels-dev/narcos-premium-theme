/*!
 * narcos-spor-rota-duzeltme.js
 *
 * narcos-license-footer.js içindeki rota deseni yalnızca /tr/ önekini ve
 * İngilizce "sport" yazımını tanıyor:
 *
 *   /^\/tr\/(?:sport|sports|sportsbook)(?:\/|$)/
 *
 * Gerçek spor sayfası /tr/spor/demo (Türkçe yazım) olduğu için
 * ng-sports-route sınıfı hiç uygulanmıyor ve temanın spor kuralları
 * devre dışı kalıyor.
 *
 * Bu dosya vendor JS'i DEĞİŞTİRMEZ; sınıfı doğru desenle yeniden uygular.
 * footer.js rota değişiminde sınıfı geri alabildiği için attribute
 * gözlemcisiyle korunur.
 *
 * YÜKLEME SIRASI: narcos-license-footer.js'ten SONRA.
 * CSS eşi (spor-alani-duzeltme.css) MUTLAKA birlikte yüklenmeli — tek
 * başına bu dosya spor alanını tamamen gizler (derinlik-3 zinciri).
 */
(function () {
  "use strict";

  var DESEN = /^\/[a-z]{2}\/(?:spor|sport|sports|sportsbook|canli-bahis|canlibahis)(?:\/|$)/;
  var SINIF = "ng-sports-route";
  var kok = document.documentElement;
  var uyguluyor = false;

  function sporMu() {
    var yol = (location.pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
    return DESEN.test(yol);
  }

  function uygula() {
    if (uyguluyor) return;              // gözlemci geri beslemesini engelle
    var olmali = sporMu();
    if (kok.classList.contains(SINIF) === olmali) return;
    uyguluyor = true;
    kok.classList.toggle(SINIF, olmali);
    // mikro-görevden sonra bırak ki kendi mutasyonumuzu yakalamayalım
    Promise.resolve().then(function () { uyguluyor = false; });
  }

  // 1) İlk çalıştırma
  uygula();

  // 2) SPA rota değişimleri (pushState/replaceState/popstate)
  ["pushState", "replaceState"].forEach(function (ad) {
    var orj = history[ad];
    if (typeof orj !== "function") return;
    history[ad] = function () {
      var r = orj.apply(this, arguments);
      setTimeout(uygula, 0);
      return r;
    };
  });
  window.addEventListener("popstate", function () { setTimeout(uygula, 0); });
  window.addEventListener("hashchange", function () { setTimeout(uygula, 0); });

  // 3) footer.js sınıfı geri alırsa yeniden uygula
  if (typeof MutationObserver === "function") {
    new MutationObserver(uygula).observe(kok, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }
})();
