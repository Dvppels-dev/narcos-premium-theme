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
    "/narcosskor":   "https://narcosbahis.vip/#/skor-tahmin",
    // Turnuva CMS sayfasi yeni; panelde gunluk turnuva acilis ekrani.
    "/narcosturnuva": "https://narcosbahis.vip/#/turnuva/gunluk"
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
   * Hesap panelindeki sekmeler: modali KAPATMIYORUZ, icine gomuyoruz.
   *
   * Onceki surum sorgu parametrelerini dusurup modali kapatiyordu. Iki sorunu
   * vardi: (1) oyuncu profilden cikmis oluyordu, (2) modal yolun kendisiyle
   * aciliyorsa (sorgu yokken) hic devreye girmiyordu — kullanicinin
   * /tr/bonusrequest ekran goruntusundeki durum buydu.
   *
   * TacoBahis custom.js'teki calisan yaklasim ornek alindi: modal acik kalir,
   * sitenin kendi icerigi CSS ile gizlenir, yerine panel iframe'i konur.
   */
  var MODAL_SEKMELERI = ["bonus_offers", "instant_cashback"];
  var MODAL_HEDEF = "https://narcosbahis.vip/#/bonus-talep";
  var MODAL_KAP = "narcos-modal-frame";

  /**
   * Modal govdesini YAPISAL olarak bulur.
   *
   * Hash'li sinif adina (app-ltr-*) veya "Bonus Talep Et" metnine
   * baglanmiyoruz: sinif her derlemede, metin dil degisiminde degisir.
   *
   * Masaustu: modal >=2 cocuk (sol menu + sag panel); govde = sag panelin
   * son cocugu (ilki baslik seridi).
   * Mobil: modal TEK cocuk (kabuk); govde = kabugun son cocugu.
   */
  function modalGovdesiBul() {
    var modal = document.querySelector(".modal");
    if (!modal) return null;

    if (modal.children.length >= 2) {
      var sag = modal.children[modal.children.length - 1];
      if (sag && sag.children.length >= 2) return sag.children[sag.children.length - 1];
      return null;
    }
    if (modal.children.length === 1) {
      var kabuk = modal.children[0];
      if (kabuk && kabuk.children.length >= 2) return kabuk.children[kabuk.children.length - 1];
    }
    return null;
  }

  function modalSekmesi() {
    var t = (new URLSearchParams(location.search).get("t") || "").toLowerCase();
    return MODAL_SEKMELERI.indexOf(t) !== -1 ? t : null;
  }

  /**
   * Modal icine paneli gomer.
   *
   * TEMIZLIK SART: baska sekmeye gecilince React AYNI govde dugumunu yeniden
   * kullaniyor. Isaret kaldirilmazsa o sekmenin kendi icerigi de gizli kalir.
   */
  function modalGomme() {
    var mevcut = document.querySelector("[data-ng-modal-embed]");
    var sekme = modalSekmesi();

    if (!sekme) {
      if (mevcut) mevcut.remove();
      var eski = document.querySelector("[data-ng-modal-host]");
      if (eski) eski.removeAttribute("data-ng-modal-host");
      return;
    }

    var govde = modalGovdesiBul();
    if (!govde) return;

    if (!govde.hasAttribute("data-ng-modal-host")) {
      govde.setAttribute("data-ng-modal-host", "");
    }
    if (mevcut) {
      kimligiYolla(mevcut.querySelector("iframe"));
      return;
    }

    var kap = document.createElement("div");
    kap.className = "ng-modal-embed";
    kap.id = MODAL_KAP;
    kap.setAttribute("data-ng-modal-embed", sekme);

    var ifr = document.createElement("iframe");
    ifr.src = MODAL_HEDEF;
    ifr.title = "Narcos Panel";
    ifr.setAttribute("allow", "clipboard-write");
    // Footer script'inin oyun karesi tespitine yakalanmamak icin.
    ifr.setAttribute("data-ng-panel", "1");
    ifr.setAttribute("loading", "eager");

    kap.appendChild(ifr);
    govde.appendChild(kap);

    ifr.addEventListener("load", function () { kimligiYolla(ifr); });
    kullaniciyiGetir().then(function () { kimligiYolla(ifr); });
  }

  function hedefBul() {
    var yol = (location.pathname || "/").toLowerCase().replace(/\/+$/, "");
    var dilsiz = yol.replace(/^\/[a-z]{2}(?=\/)/, "");
    return HARITA[dilsiz] || HARITA[yol] || null;
  }

  /**
   * Panel sayfalarını CSS'e bildirir: html.ng-panel-route + html.ng-panel-<sayfa>.
   * Mevcut ng-*-route kuralına uyar. Gömme sayfasına özel düzen (ör. bonus
   * talepte bilgi şeridini gizlemek) böylece yalnızca CSS ile yapılabilir.
   */
  function rotaSinifi(hedef) {
    var kok = document.documentElement;
    var eski = (kok.className || "").split(/\s+/).filter(function (s) {
      return s && s.indexOf("ng-panel-") !== 0;
    });
    if (hedef) {
      var slug = (hedef.split("#/")[1] || "").replace(/[^a-z0-9-]/gi, "");
      eski.push("ng-panel-route");
      if (slug) eski.push("ng-panel-" + slug);
    }
    kok.className = eski.join(" ");
  }

  /**
   * Yalnızca dejenere durum koruması: header beklenmedik biçimde uzunsa
   * (100dvh - üst) sıfıra/negatife düşüp kabı yok edebilir.
   *
   * Bilerek düşük tutuldu. Yüksek bir taban (ör. 520) kısa masaüstü
   * pencerelerinde kabı ekrandan uzun yapıp dış kaydırmayı geri getiriyordu —
   * 800x450'de ölçüldü: taban 520 iken belge 520 > ekran 450, yani yine iki
   * kaydırma alanı. 320 ile gerçek cihazların tamamında tam oturuyor.
   */
  var TABAN_YUKSEKLIK = 320;

  /**
   * Kabı, başladığı noktadan ekran sonuna kadar uzatır — masaüstünde de mobilde de.
   *
   * Önceden masaüstü sabit `min(760px,82vh)` kullanıyordu, mobil ise ekranı
   * dolduruyordu; iki platform farklı davranıyordu. Sabit yükseklik sayfayı iki
   * kaydırma alanına bölüyor (dışta site, içte iframe) ve panelin alt kısmı dar
   * bir kutuda sıkışıyordu. Aynı hesap her genişlikte uygulanınca davranış tek
   * tipleşiyor: dış sayfada kaydıracak yer kalmıyor, tek kaydırma alanı iframe.
   *
   * Yükseklik kabın KENDİ üst konumundan ölçülür; header/gezinme yüksekliği
   * platforma veya giriş durumuna göre değişse de doğru kalır, seçici
   * hardcode edilmez.
   *
   * 100dvh kullanılır: mobil tarayıcının adres çubuğu gizlenip açılırken 100vh
   * fazla ölçüp sayfanın altını taşırıyordu. Masaüstünde dvh == vh.
   */
  /**
   * Ekranın altına sabitlenmiş çubuğun (mobil gezinme barı) yüksekliği.
   *
   * Bu çubuk `position: fixed` olduğu için sayfa akışında yer kaplamaz: kap
   * ekranın sonuna kadar uzatıldığında çubuk iframe'in ÜZERİNE biniyor ve
   * panelin alt kısmı — ör. bonus talep modalinin butonları — görünmez oluyordu.
   * "Mobilde kesik çıkıyor" şikayeti buydu.
   *
   * Yükseklik gibi bu da çalışma anında ölçülür: seçici hardcode etmiyoruz,
   * çünkü çubuk yalnızca mobilde ve yalnızca bazı sayfalarda render ediliyor.
   */
  // panelYuksekligi() goster() içinden, yani her DOM mutasyon karesinde
  // çağrılıyor. Tüm ağacı gezip getComputedStyle okumak orada pahalı olur;
  // sonucu kısa süre önbellekliyoruz. Ölçüyü geçersiz kılan olaylar (resize,
  // orientationchange) önbelleği sıfırlar.
  var altCubukOnbellek = { deger: 0, zaman: 0 };
  var ALT_CUBUK_TAZE_MS = 1000;

  function altCubukOnbelleginiSifirla() { altCubukOnbellek.zaman = 0; }

  function altCubukYuksekligi() {
    var simdi = new Date().getTime();
    if (simdi - altCubukOnbellek.zaman < ALT_CUBUK_TAZE_MS) return altCubukOnbellek.deger;

    var enFazla = 0;
    var ekranH = window.innerHeight;
    var dugumler = document.body ? document.body.querySelectorAll("*") : [];
    for (var i = 0; i < dugumler.length; i++) {
      var el = dugumler[i];
      if (el.id === KAP_ID || el.closest("#" + KAP_ID)) continue;
      var cs = window.getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      var r = el.getBoundingClientRect();
      // Ekranın dibine yapışık, yeterince geniş ve gerçek yüksekliği olan.
      if (r.height < 24 || r.height > ekranH * 0.4) continue;
      if (r.width < window.innerWidth * 0.6) continue;
      if (r.bottom < ekranH - 4 || r.top > ekranH) continue;
      if (r.height > enFazla) enFazla = r.height;
    }
    altCubukOnbellek.deger = Math.round(enFazla);
    altCubukOnbellek.zaman = simdi;
    return altCubukOnbellek.deger;
  }

  function panelYuksekligi(kap) {
    if (!kap) return;
    var ust = Math.max(0, Math.round(kap.getBoundingClientRect().top));
    var alt = altCubukYuksekligi();
    kap.style.minHeight = TABAN_YUKSEKLIK + "px";
    kap.style.height =
      "max(" + TABAN_YUKSEKLIK + "px, calc(100dvh - " + (ust + alt) + "px))";
  }

  /* ---------- Mobil kisayol seridi ----------
   *
   * Mobilde header tek satir: solda logo, sagda butonlar. Panel sayfalarina
   * (bonus, cark, skor, turnuva, aranma) gitmek icin burger menuyu acmak
   * gerekiyordu. Header'in altina ikinci bir satir ekliyoruz.
   *
   * Rotalar HARITA ile ayni kaynaktan beslenmiyor cunku burada SIRA ve
   * ETIKET de var; ama yollar birebir HARITA anahtarlariyla eslesiyor, yani
   * bir rota eklenirse iki yerde de gorunmeli.
   */
  var KISAYOL_ID = "narcos-mobil-kisayol";
  var KISAYOLLAR = [
    { yol: "/aranmatalep",   etiket: "Aranma",  ikon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" },
    { yol: "/bonusrequest",  etiket: "Bonus",   ikon: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" },
    { yol: "/narcosskor",    etiket: "Skor",    ikon: "M12 13V2l8 4-8 4M20.55 10.23A9 9 0 1 1 8 4.94M8 10a5 5 0 1 0 8.9 2.02" },
    { yol: "/narcoscark",    etiket: "Çark",    ikon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 2v7.5M19 17l-5.2-3.7M5 17l5.2-3.7" },
    { yol: "/narcosturnuva", etiket: "Turnuva", ikon: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z" }
  ];

  function kisayolSeridi() {
    if (document.getElementById(KISAYOL_ID)) return;

    var header = document.querySelector('[data-mj="custom-header"]')
              || document.querySelector('[data-mj="header"]');
    if (!header || !header.parentElement) return;

    var yol = (location.pathname || "/").toLowerCase().replace(/\/+$/, "");
    var dilsiz = yol.replace(/^\/[a-z]{2}(?=\/)/, "");

    var nav = document.createElement("nav");
    nav.id = KISAYOL_ID;
    nav.setAttribute("data-ng-mobil-kisayol", "");
    nav.setAttribute("aria-label", "Hızlı erişim");

    var html = "";
    for (var i = 0; i < KISAYOLLAR.length; i++) {
      var k = KISAYOLLAR[i];
      var aktif = dilsiz === k.yol ? ' data-ng-aktif=""' : "";
      html +=
        '<a href="/tr' + k.yol + '"' + aktif + '>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + k.ikon + '"/></svg>' +
          '<span>' + k.etiket + '</span>' +
        '</a>';
    }
    nav.innerHTML = html;
    header.parentElement.insertBefore(nav, header.nextSibling);
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

  /**
   * Mobil alt navbar'da tek aktif oge birakir.
   *
   * CMS "Ana Sayfa"yi href="/" ile isaretliyor ve aktiflik testini onek
   * eslesmesiyle yapiyor; "/" her yolun oneki oldugu icin Ana Sayfa hicbir
   * zaman sonmuyor. Sonuc: /para-yatir'dayken hem Ana Sayfa hem Para Yatir
   * aktif gorunuyordu.
   *
   * Cozum: en UZUN eslesen href kazanir (en ozgul rota), digerlerinden aktif
   * isaretleri alinir. Hicbiri eslesmezse Ana Sayfa'ya dokunmayiz — kok
   * sayfada onun aktif kalmasi dogru davranis.
   */
  var AKTIF_ISARETLERI = ["active", "is-active"];

  function tekAktifNav() {
    var alt = document.querySelector('[data-mj="bottom-nav"]');
    if (!alt) return;
    var ogeler = alt.querySelectorAll('[data-mj="bottom-nav-item"]');
    if (ogeler.length < 2) return;

    // Kardes kodla ayni normalizasyon: kucuk harf + sondaki egik cizgi yok.
    // Dil oneki (/tr) SOYULMAZ; href'ler de onu tasidigi icin karsilastirma
    // tutarli kalir ve en-uzun-eslesme mantigi oneki kendiliginden asar.
    var yol = (location.pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
    var kazanan = null;
    var enUzun = -1;

    for (var i = 0; i < ogeler.length; i++) {
      var oge = ogeler[i];
      var baglanti = oge.tagName === "A" ? oge : oge.querySelector("a");
      var href = baglanti && baglanti.getAttribute("href");
      if (!href || href.charAt(0) !== "/") continue;
      var hedefYol = href.split("?")[0].split("#")[0].toLowerCase().replace(/\/+$/, "") || "/";
      var eslesir = hedefYol === "/" ? yol === "/" : (yol === hedefYol || yol.indexOf(hedefYol + "/") === 0);
      if (eslesir && hedefYol.length > enUzun) { enUzun = hedefYol.length; kazanan = oge; }
    }

    // Hicbir oge eslesmedi: CMS'in kararina karisma.
    if (!kazanan) return;

    for (var j = 0; j < ogeler.length; j++) {
      var o = ogeler[j];
      if (o === kazanan) continue;
      for (var k = 0; k < AKTIF_ISARETLERI.length; k++) o.classList.remove(AKTIF_ISARETLERI[k]);
      if (o.getAttribute("aria-current") === "page") o.removeAttribute("aria-current");
      if (o.getAttribute("aria-selected") === "true") o.setAttribute("aria-selected", "false");
      if (o.getAttribute("data-active") === "true") o.setAttribute("data-active", "false");
    }
  }

  function goster() {
    modalGomme();                       // hesap modali acikken icine gom
    kisayolSeridi();                    // mobil ikinci header satiri
    tekAktifNav();                      // alt navbar'da cift aktif durumu engelle
    var hedef = hedefBul();
    var mevcut = document.getElementById(KAP_ID);
    rotaSinifi(hedef);                  // CSS'in sayfayı tanıması için

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
      panelYuksekligi(mevcut);
      return;
    }

    var yer = icerikAlani();
    if (!yer) return;                   // henüz render olmadı, gözlemci tekrar dener

    kardesleriGizle(yer);

    var kap = document.createElement("div");
    kap.id = KAP_ID;
    // Yükseklik panelYuksekligi() ile hemen altta ayarlanır; burada sabit bir
    // değer bırakmıyoruz ki ilk karede yanlış boyda görünüp zıplamasın.
    kap.style.cssText =
      "width:100%;overflow:hidden;" +
      "border-radius:16px;background:#09090b;margin:0 auto;";

    var ifr = document.createElement("iframe");
    ifr.src = hedef;
    ifr.setAttribute("loading", "lazy");
    ifr.setAttribute("title", "Narcos Panel");
    ifr.setAttribute("allow", "clipboard-write");
    // Footer script'inin oyun karesi tespitine yakalanmamak için işaret:
    // aksi halde ng-game-embed tam ekran moduna sokuluyordu.
    ifr.setAttribute("data-ng-panel", "1");
    ifr.style.cssText =
      "display:block;width:100%;height:100%;min-height:inherit;border:0;";
    kap.appendChild(ifr);

    yer.appendChild(kap);
    panelYuksekligi(kap);

    // Panel yüklendiğinde kimliği bildir; kullanıcı bilgisi geç gelirse de tekrar.
    ifr.addEventListener("load", function () { kimligiYolla(ifr); });
    kullaniciyiGetir().then(function () { kimligiYolla(ifr); });
  }

  // Ekran döndürme, adres çubuğunun gizlenmesi ve masaüstü/mobil sınırının
  // aşılması yüksekliği geçersiz kılar; yeniden ölç.
  window.addEventListener("resize", function () {
    altCubukOnbelleginiSifirla();
    panelYuksekligi(document.getElementById(KAP_ID));
  });
  window.addEventListener("orientationchange", function () {
    setTimeout(function () {
      altCubukOnbelleginiSifirla();
      panelYuksekligi(document.getElementById(KAP_ID));
    }, 150);
  });

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
