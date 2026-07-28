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
  var PANEL_ORIGIN = "https://narcosbahis.vip";

  /**
   * Giriş yapmış oyuncunun kullanıcı adı.
   *
   * Kaynak: sitenin kendi /api/v1/me ucu. Aynı origin'de çalıştığımız için
   * oturum çerezi otomatik gider; anonimken 401 döner ve null kalırız.
   * Panel iframe'i farklı origin'de olduğu için değeri postMessage ile iletiriz.
   */
  var kullaniciAdi = null;
  var kullaniciSoruldu = false;

  function kullaniciAdiCoz(veri) {
    if (!veri || typeof veri !== "object") return null;
    var aday = veri.username || veri.userName || veri.login ||
               (veri.data && (veri.data.username || veri.data.userName || veri.data.login));
    aday = aday == null ? "" : String(aday).trim();
    return aday || null;
  }

  function kullaniciyiGetir() {
    if (kullaniciSoruldu) return Promise.resolve(kullaniciAdi);
    kullaniciSoruldu = true;
    if (typeof fetch !== "function") return Promise.resolve(null);
    return fetch("/api/v1/me", {
      credentials: "same-origin",
      headers: { Accept: "application/json" }
    })
      .then(function (y) { return y.ok ? y.json() : null; })
      .then(function (veri) { kullaniciAdi = kullaniciAdiCoz(veri); return kullaniciAdi; })
      .catch(function () { return null; });
  }

  /** Panele kimliği bildir. Panel hazır olmadan gelen mesajları kaçırmamak için
   *  panel kendi tarafından "narcos-panel-hazir" gönderdiğinde de tekrarlanır. */
  function kimligiYolla(ifr) {
    if (!ifr || !ifr.contentWindow || !kullaniciAdi) return;
    try {
      ifr.contentWindow.postMessage(
        { tur: "narcos-kullanici", kullaniciAdi: kullaniciAdi },
        PANEL_ORIGIN
      );
    } catch (e) { /* iframe henüz yüklenmemiş olabilir */ }
  }

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

  /**
   * İçerik alanındaki iframe dışı tüm çocukları gizler.
   *
   * React'in yönettiği düğümleri SİLMEYİZ. innerHTML="" kullanılırsa React kendi
   * çocuklarını bulamayıp "removeChild: node is not a child" ile çöküyor.
   *
   * Bu fonksiyon idempotent ve TEKRAR ÇAĞRILABİLİR olmak zorunda: CMS oyun
   * kataloğu bileşenlerini asenkron render ediyor. Kategori listesi boş dönen
   * sayfalarda (/tr/narcosskor -> gameCategoriesSite = []) "No categories" boş
   * durumu iframe yerleştirildikten SONRA ekleniyordu; yalnızca ilk yerleştirmede
   * gizleseydik o düğüm görünür kalırdı. Hata tam olarak buydu.
   */
  function kardesleriGizle(yer) {
    if (!yer) return;
    for (var i = 0; i < yer.children.length; i++) {
      var c = yer.children[i];
      if (c.id === KAP_ID) continue;
      if (!c.hasAttribute("data-ng-gizli")) {
        c.setAttribute("data-ng-gizli", c.style.display || "");
      }
      // Sonradan tekrar görünür yapılmış olabilir; her turda yeniden uygula.
      if (c.style.display !== "none") c.style.display = "none";
    }
  }

  function goster() {
    var hedef = hedefBul();
    var mevcut = document.getElementById(KAP_ID);

    if (!hedef) {                       // eşleşmeyen sayfada kalıntı bırakma
      if (mevcut) {
        var ust = mevcut.parentElement;
        mevcut.remove();
        if (ust) {                      // gizlediğimiz içeriği geri aç
          var gizli = ust.querySelectorAll("[data-ng-gizli]");
          for (var j = 0; j < gizli.length; j++) {
            gizli[j].style.display = gizli[j].getAttribute("data-ng-gizli") || "";
            gizli[j].removeAttribute("data-ng-gizli");
          }
        }
      }
      return;
    }
    if (mevcut) {                       // zaten var; hedef değiştiyse güncelle
      var f = mevcut.querySelector("iframe");
      if (f && f.src !== hedef) f.src = hedef;
      // Kap yerindeyken CMS yeni düğüm eklemiş olabilir ("No categories").
      kardesleriGizle(mevcut.parentElement);
      return;
    }

    var yer = icerikAlani();
    if (!yer) return;                   // henüz render olmadı, gözlemci tekrar dener

    kardesleriGizle(yer);

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

    yer.appendChild(kap);

    // Panel yüklendiğinde kimliği bildir; kullanıcı bilgisi geç gelirse de tekrar.
    ifr.addEventListener("load", function () { kimligiYolla(ifr); });
    kullaniciyiGetir().then(function () { kimligiYolla(ifr); });
  }

  // Panel "hazırım" derse kimliği (yeniden) gönder. Böylece iframe'in yüklenme
  // anı ile /api/v1/me yanıtının sırası önemsizleşir.
  window.addEventListener("message", function (olay) {
    if (olay.origin !== PANEL_ORIGIN) return;          // yalnızca panelimiz
    if (!olay.data || olay.data.tur !== "narcos-panel-hazir") return;
    var kap = document.getElementById(KAP_ID);
    var ifr = kap && kap.querySelector("iframe");
    kullaniciyiGetir().then(function () { kimligiYolla(ifr); });
  });

  function planla() { setTimeout(goster, 0); }

  planla();

  ["pushState", "replaceState"].forEach(function (ad) {
    var orj = history[ad];
    if (typeof orj !== "function") return;
    history[ad] = function () { var r = orj.apply(this, arguments); planla(); return r; };
  });
  window.addEventListener("popstate", planla);

  // SPA içeriği geç render ederse kabı yeniden yerleştir. Kap zaten duruyorsa
  // da çalışmalı: CMS sonradan düğüm eklediğinde ("No categories") onları
  // gizleyen tek nokta burası.
  if (typeof MutationObserver === "function" && document.body) {
    var bekliyor = false;
    var gozlemci = new MutationObserver(function () {
      if (bekliyor || !hedefBul()) return;
      // Kendi DOM değişikliğimiz gözlemciyi tekrar tetikliyor; sonsuz döngüyü
      // ve her mutasyonda tam tarama maliyetini önlemek için tek kareye topla.
      bekliyor = true;
      requestAnimationFrame(function () {
        bekliyor = false;
        goster();
      });
    });
    gozlemci.observe(document.body, { childList: true, subtree: true });
  }
})();
