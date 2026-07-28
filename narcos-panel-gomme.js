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

  // CMS'teki gameCatalog "identifier" değerleri. Aynı sayfanın menülere göre
  // farklı identifier'ı olabiliyor: header'da "narcoscark" (Patron Çark),
  // burger menüde "tacowheel" (Narcos Çark) — ikisi de gerçek sayfa (HTTP 200).
  // Biri eksik kalırsa o menüden gelen kullanıcı boş sayfa görüyor.
  var HARITA = {
    "/bonusrequest": "https://narcosbahis.vip/#/bonus-talep",
    "/narcoscark":   "https://narcosbahis.vip/#/cark",
    "/tacowheel":    "https://narcosbahis.vip/#/cark",
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
  var sonDeneme = 0;
  var istekUcuyor = false;

  // /api/v1/me gövdesinin tam şekli belgelenmemiş ve sürümle değişebiliyor.
  // Sabit bir alan adına bel bağlamak yerine yanıtı gezip kullanıcı adı
  // anlamına gelen ilk makul alanı buluruz. E-posta/ID gibi alanları
  // kullanmayız; onlar Lynon'daki "login" ile eşleşmez.
  var AD_ALANLARI = /^(username|userName|user_name|login|userLogin|nickname|nickName|memberName|accountName)$/;

  function kullaniciAdiCoz(veri) {
    var bulunan = null;
    var derinlik = 0;

    (function gez(o) {
      if (bulunan || o == null || derinlik > 6) return;
      if (Array.isArray(o)) {
        derinlik++;
        for (var i = 0; i < o.length && !bulunan; i++) gez(o[i]);
        derinlik--;
        return;
      }
      if (typeof o !== "object") return;
      for (var k in o) {
        if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
        var v = o[k];
        if (AD_ALANLARI.test(k) && typeof v === "string" && v.trim()) {
          bulunan = v.trim();
          return;
        }
        if (v && typeof v === "object") {
          derinlik++;
          gez(v);
          derinlik--;
          if (bulunan) return;
        }
      }
    })(veri);

    return bulunan;
  }

  /**
   * Kullanıcı adını getirir. Başarılı sonuç kalıcı olarak saklanır; başarısızsa
   * (anonim -> 401) yeniden denenebilir, çünkü oyuncu sayfayı yenilemeden
   * giriş modalinden giriş yapabiliyor. Ardışık istekleri 5 sn'ye kısarız.
   */
  function kullaniciyiGetir() {
    if (kullaniciAdi) return Promise.resolve(kullaniciAdi);
    if (typeof fetch !== "function") return Promise.resolve(null);
    var simdi = new Date().getTime();
    if (istekUcuyor || simdi - sonDeneme < 5000) return Promise.resolve(null);
    sonDeneme = simdi;
    istekUcuyor = true;
    return fetch("/api/v1/me", {
      credentials: "same-origin",
      headers: { Accept: "application/json" }
    })
      .then(function (y) { return y.ok ? y.json() : null; })
      .then(function (veri) { kullaniciAdi = kullaniciAdiCoz(veri); return kullaniciAdi; })
      .catch(function () { return null; })
      .then(function (r) { istekUcuyor = false; return r; });
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

  /**
   * Sitenin kendi hesap modallarını panele yönlendiren sorgu eşlemesi.
   *
   * "?m=account&t=bonus_offers" sitenin hesap menüsündeki bonus teklifleri
   * modalini açıyor. Bu modal panelin bonus talep ekranının üstüne binerek onu
   * gizliyordu. Parametreleri temizleyip yolu bonus sayfasına çekiyoruz; modal
   * kapanıyor, geriye iframe kalıyor.
   */
  var MODAL_ESLEME = [
    { m: "account", t: "bonus_offers", yol: "/tr/bonusrequest" }
  ];

  function modalYonlendir() {
    var p = new URLSearchParams(location.search);
    var m = (p.get("m") || "").toLowerCase();
    var t = (p.get("t") || "").toLowerCase();
    if (!m && !t) return false;

    for (var i = 0; i < MODAL_ESLEME.length; i++) {
      var e = MODAL_ESLEME[i];
      if (m !== e.m || t !== e.t) continue;
      // Yalnızca sorgu parametrelerini düşür; geri tuşunda modale dönülmesin
      // diye replaceState kullanılır (yeni geçmiş kaydı oluşturmaz).
      history.replaceState(history.state, "", e.yol);
      return true;
    }
    return false;
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
    modalYonlendir();                   // sorgu tabanlı modalleri panele çevir
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
  // gizleyen tek nokta burası. hedefBul() null iken de çağırırız; goster()
  // o durumda eşleşmeyen sayfadaki kalıntıyı temizler.
  if (typeof MutationObserver === "function" && document.body) {
    var bekliyor = false;
    var gozlemci = new MutationObserver(function () {
      if (bekliyor) return;
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

  // Adres değişimini doğrudan izle.
  //
  // pushState sarmalaması tek başına YETMİYOR: bu script defer ile yükleniyor,
  // yani SPA paketi (zone.js) history metodlarını bizden önce yamalıyor ve
  // router kendi referansını tutabiliyor. Header ve mobil menü öğeleri <a>
  // linki de değil (yalnızca giriş/kayıt bağlantıları <a>), dolayısıyla tıklama
  // yakalanamıyordu — "aranma talep ikonu iframe açmıyor" sorunu buydu.
  //
  // 400 ms'lik yol karşılaştırması çerçeveden bağımsız çalışır ve maliyeti
  // ihmal edilebilir (tek string karşılaştırması).
  // Yol VE sorgu birlikte izlenir: modal açılışları yolu değiştirmeden yalnızca
  // sorguyu değiştiriyor (?m=account&t=bonus_offers), bu da yakalanmalı.
  var sonAdres = location.pathname + location.search;
  setInterval(function () {
    if (location.pathname + location.search !== sonAdres) {
      sonAdres = location.pathname + location.search;
      planla();
      return;
    }
    // Oyuncu sayfayı yenilemeden giriş modalinden giriş yapabiliyor. Kimliği
    // henüz alamadıysak eşleşen sayfada denemeye devam et (istek 5 sn'ye kısık).
    if (kullaniciAdi || !hedefBul()) return;
    var kap = document.getElementById(KAP_ID);
    var ifr = kap && kap.querySelector("iframe");
    if (ifr) kullaniciyiGetir().then(function () { kimligiYolla(ifr); });
  }, 400);
})();
