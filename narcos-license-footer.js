/* NarcosBahis production premium theme runtime v2.
   Keeps the current public DOM contract while avoiding destructive SPA patches. */
(function () {
  "use strict";
  var GLOBAL_KEY = "__narcosPremiumThemeRuntime", VERSION = "2.1.1";
  var previous = window[GLOBAL_KEY];
  if (previous && previous.version === VERSION && previous.refresh) {
    previous.refresh();
    return;
  }
  if (previous && previous.destroy) previous.destroy();
  var VERIFY_URL = "https://verification.anjouangamblingboard.org/s/140e70a801efff238b59b01782ba34d909755fd6e27deb06c4959b328d6e9698e01f00b62578604eca16f199ebb446cb";
  var TELEGRAM_URL = "https://t.me/narcosresmi", CURRENT_URL = "https://narcosgir.com";
  var WEBSITE_URL = "https://narcosbahis.com/", SUPPORT_EMAIL = "destek@narcosbahis.com", REVISION = "v3";
  function getBaseUrl() {
    var script = document.currentScript || document.querySelector('script[src*="narcos-license-footer"]');
    var source = script && script.src;
    if (!source) {
      var stylesheet = document.querySelector('link[href*="narcos-premium-gold-glass.css"]');
      source = stylesheet && stylesheet.href;
    }
    try {
      return new URL(".", source || "https://cdn.jsdelivr.net/gh/Dvppels-dev/narcos-premium-theme@main/").href;
    } catch (error) {
      return "https://cdn.jsdelivr.net/gh/Dvppels-dev/narcos-premium-theme@main/";
    }
  }
  var BASE_URL = getBaseUrl();
  var ASSETS = {
    chat: BASE_URL + "narcos-chat-icon.png", telephone: BASE_URL + "narcos-telephone-icon.png",
    telegram: BASE_URL + "narcos-telegram-icon.png", web: BASE_URL + "narcos-web-icon.png",
    license: BASE_URL + "narcos-license-badge.png"
  };
  var runtime = {
    version: VERSION,
    observer: null, resizeObserver: null, observedShellNodes: [],
    listeners: [], history: [], path: "", route: null,
    campaignMain: null, campaignTitle: "", generatedTitle: "",
    criticalFrame: 0, deferredHandle: 0, deferredKind: "",
    effectsHandle: 0, effectsKind: "",
    criticalDirty: Object.create(null), deferredDirty: Object.create(null)
  };
  window[GLOBAL_KEY] = runtime;
  function query(selector, root) { return (root || document).querySelector(selector); }
  function create(tag, className, textValue) {
    var element = document.createElement(tag);
    if (className) element.className = className; if (textValue !== undefined) element.textContent = textValue;
    return element;
  }
  function makeImage(src, className, alt, width, height, lazy) {
    var image = create("img", className);
    image.src = src; image.alt = alt || ""; image.width = width; image.height = height;
    image.decoding = "async";
    if (lazy) image.loading = "lazy";
    if (lazy) image.setAttribute("fetchpriority", "low");
    return image;
  }
  function externalLink(href, className, textValue, ariaLabel) {
    var link = create("a", className, textValue);
    link.href = href; link.target = "_blank";
    link.rel = "noopener noreferrer external"; if (ariaLabel) link.setAttribute("aria-label", ariaLabel);
    return link;
  }
  function place(parent, node, before) {
    before = before || null;
    if (node === before) return node;
    if (node.parentElement !== parent || node.nextSibling !== before) parent.insertBefore(node, before);
    return node;
  }
  function mount(id, tag, parent, before, render) {
    var node = document.getElementById(id);
    if (!node) node = create(tag);
    node.id = id;
    if (node.getAttribute("data-ng-revision") !== REVISION) {
      node.textContent = ""; render(node);
      node.setAttribute("data-ng-revision", REVISION);
    }
    return place(parent, node, before);
  }
  function directChild(node, parent) {
    while (node && node.parentElement && node.parentElement !== parent) node = node.parentElement;
    return node && node.parentElement === parent ? node : null;
  }
  function cleanPath() {
    return (window.location.pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  }
  function classifyRoute(path) {
    var home = path === "/" || path === "/tr", casino = path === "/tr/casino" || path === "/tr/casino/all";
    var liveCasino = /^\/tr\/(?:live-casino|livecasino|canli-casino)(?:\/|$)/.test(path), promotion = /^\/tr\/promotions(?:\/|$)/.test(path);
    var sports = /^\/tr\/(?:sport|sports|sportsbook)(?:\/|$)/.test(path);
    return {
      path: path, home: home, casino: casino, liveCasino: liveCasino, promotion: promotion, sports: sports,
      infoSafe: home || /^\/tr\/casino(?:\/|$)/.test(path) || liveCasino || promotion,
      campaign: campaignRoute(path)
    };
  }
  function observeShellNode(node) {
    if (!node || !runtime.resizeObserver || runtime.observedShellNodes.indexOf(node) !== -1) return;
    runtime.observedShellNodes.push(node);
    runtime.resizeObserver.observe(node);
  }
  function pruneShellNodes() {
    for (var i = runtime.observedShellNodes.length - 1; i >= 0; i -= 1) {
      if (runtime.observedShellNodes[i].isConnected) continue;
      if (runtime.resizeObserver) runtime.resizeObserver.unobserve(runtime.observedShellNodes[i]);
      runtime.observedShellNodes.splice(i, 1);
    }
  }
  function activeHeader() {
    var headers = document.querySelectorAll('[data-mj="header"]');
    var fallback = headers.length ? headers[headers.length - 1] : null;
    for (var i = headers.length - 1; i >= 0; i -= 1) {
      var style = window.getComputedStyle(headers[i]);
      var rect = headers[i].getBoundingClientRect();
      if (style.display !== "none" && style.visibility !== "hidden" && rect.width > 0) return headers[i];
    }
    return fallback;
  }
  function renderInfoStrip() {
    var header = activeHeader();
    if (!header) {
      document.documentElement.classList.remove("ng-theme-info-mounted");
      return false;
    }
    var host = (window.location.hostname || "narcosbahis.com").replace(/^www\./i, "");
    observeShellNode(header);
    mount("narcos-info-strip", "aside", header, header.firstElementChild, function (strip) {
      strip.className = "ng-info-strip";
      strip.setAttribute("aria-label", "Güncel giriş adresi");
      var content = create("div", "ng-info-strip-content");
      content.appendChild(externalLink(CURRENT_URL, "ng-info-source", "narcosgir.com", "NarcosBahis güncel giriş sayfasını aç"));
      content.appendChild(create("span", "ng-info-long", " adresinden her zaman güncel adresimize ulaşabilirsiniz."));
      content.appendChild(create("span", "ng-info-separator", " • "));
      content.appendChild(create("span", "ng-info-current-label", "Güncel giriş: "));
      content.appendChild(create("strong", "ng-info-current", host));
      strip.appendChild(content);
    });
    document.documentElement.classList.add("ng-theme-info-mounted");
    return true;
  }
  function syncEmbeddedGameState() {
    var main = query('main[data-mj="page-content"]');
    var frames = main ? main.querySelectorAll("iframe") : [];
    var frame = null;
    for (var i = 0; i < frames.length; i += 1) {
      if (frames[i].id === "phoenix365ifraim") continue;
      if (frames[i].closest && frames[i].closest("#sportsbook-wrapper")) continue;
      var source = (frames[i].getAttribute("src") || "").trim();
      if (!source || /^about:blank(?:#|$)/i.test(source)) continue;
      if (/(?:captcha|recaptcha|hcaptcha|turnstile|youtube|vimeo|verification|live-chat)/i.test(source)) continue;
      observeShellNode(frames[i]);
      var style = window.getComputedStyle(frames[i]);
      var rect = frames[i].getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (rect.width < 160 || rect.height < 120) {
        if (frames[i].getAttribute("data-ng-frame-probe") !== REVISION) {
          frames[i].setAttribute("data-ng-frame-probe", REVISION);
          window.setTimeout(function () {
            if (window[GLOBAL_KEY] === runtime) queueCritical(["shell"]);
          }, 120);
        }
        continue;
      }
      frame = frames[i];
      break;
    }
    var active = !!frame && !(runtime.route && runtime.route.sports);
    document.documentElement.classList.toggle("ng-game-embed", active);
    return active;
  }
  function renderShell() {
    pruneShellNodes();
    renderInfoStrip();
    syncEmbeddedGameState();
    return true;
  }
  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options); runtime.listeners.push([target, type, handler, options]);
  }
  function findChatButton() { return query('button[aria-label="Sohbeti aç"],button[aria-label*="Sohbet"],button[aria-label*="sohbet"]'); }
  function renderHeader() {
    var header = query('[aria-label="site-header"]');
    if (!header) return false;
    var left = query('[data-mj="header-left"]', header);
    var right = query('[data-mj="header-right"]', header) || header;
    if (left) {
      var logo = query('[data-mj="logo"]', left);
      if (logo) {
        var logoRoot = directChild(logo, left) || logo;
        mount("narcos-header-license", "a", left, logoRoot.nextSibling, function (link) {
          link.className = "ng-header-license";
          link.href = VERIFY_URL;
          link.target = "_blank";
          link.rel = "noopener noreferrer external";
          link.setAttribute("aria-label", "Anjouan Gaming lisansını doğrula");
          link.appendChild(makeImage(ASSETS.license, "ng-header-license-image", "Anjouan Gaming lisans rozeti", 42, 42, false));
        });
      }
    }
    var gift = query('[data-mj="header-special-button"]', header);
    if (gift) {
      gift.classList.add("ng-gift-button");
      gift.setAttribute("aria-label", "Hediye ve bonuslar");
      Array.prototype.forEach.call(gift.childNodes, function (node) {
        if (node.nodeType === 3) node.textContent = "";
      });
      if (!query(".ng-gift-icon", gift)) {
        var giftIcon = create("span", "ng-gift-icon");
        giftIcon.setAttribute("aria-hidden", "true");
        gift.appendChild(giftIcon);
      }
    }
    var login = query('[data-mj="login-button"]', right);
    var loginRoot = directChild(login, right);
    var call = mount("narcos-call-button", "button", right, loginRoot, function (button) {
      button.className = "ng-call-button";
      button.type = "button";
      button.setAttribute("aria-label", "Beni ara - canlı desteği aç");
      button.setAttribute("data-ng-action", "chat-or-telegram");
      var icon = makeImage(ASSETS.telephone, "ng-call-icon", "", 24, 24, false);
      icon.setAttribute("aria-hidden", "true");
      button.appendChild(icon);
      button.appendChild(create("span", "ng-call-label", "Beni Ara"));
    });
    var telegram = mount("narcos-telegram-button", "a", right, call, function (button) {
      button.className = "ng-telegram-button";
      button.href = TELEGRAM_URL;
      button.target = "_blank";
      button.rel = "noopener noreferrer external";
      button.setAttribute("aria-label", "NarcosBahis resmi Telegram kanalını aç");
      var icon = create("span", "ng-telegram-icon");
      icon.setAttribute("aria-hidden", "true");
      button.appendChild(icon);
    });
    var giftRoot = directChild(gift, right);
    if (giftRoot && giftRoot !== loginRoot && giftRoot !== call && giftRoot !== telegram) {
      place(right, giftRoot, telegram);
    }
    return true;
  }
  function socialCard(options) {
    var link = externalLink(options.href, "ng-social-card", "", options.ariaLabel);
    var icon = create("span", "ng-social-icon");
    icon.setAttribute("aria-hidden", "true");
    icon.appendChild(makeImage(options.image, "ng-social-image", "", 24, 24, true));
    var copy = create("span", "ng-social-copy");
    copy.appendChild(create("span", "ng-social-label", options.label));
    copy.appendChild(create("span", "ng-social-value", options.value));
    var arrow = create("span", "ng-social-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    link.appendChild(icon);
    link.appendChild(copy);
    link.appendChild(arrow);
    return link;
  }
  function valueCard(title, paragraphs) {
    var card = create("article", "ng-value-card");
    card.appendChild(create("h3", "", title));
    paragraphs.forEach(function (paragraph) {
      card.appendChild(create("p", "", paragraph));
    });
    return card;
  }
  function renderLicense(node) {
    node.setAttribute("aria-label", "Lisans doğrulama bilgisi");
    var panel = create("div", "ng-license-panel");
    var badgeLink = externalLink(VERIFY_URL, "ng-license-badge-link", "", "Geçerli lisansı doğrula");
    badgeLink.appendChild(makeImage(ASSETS.license, "ng-license-badge", "Geçerli lisans - doğrulamak için tıklayın", 82, 82, true));
    var copy = create("div", "ng-license-copy");
    copy.appendChild(create("span", "ng-license-eyebrow", "DÜZENLEMELER VE İŞORTAKLARI"));
    var legal = create("p", "ng-license-title");
    legal.appendChild(externalLink(WEBSITE_URL, "", "narcosbahis.com", "NarcosBahis ana sayfasını aç"));
    legal.appendChild(document.createTextNode(
      ", Anjouan Birliği'nin Mutsamudu bölgesinde kayıtlı NarcosBahis Entertainment Limited tarafından işletilmektedir. Platform, Anjouan Eyaleti Offshore Finance Authority tarafından Computer Gaming Licensing Act 007 of 2005 kapsamında düzenlenen ALSI-202607948-FI5 numaralı geçerli internet oyun lisansı ile faaliyet göstermektedir."
    ));
    copy.appendChild(legal);
    panel.appendChild(badgeLink);
    panel.appendChild(copy);
    panel.appendChild(externalLink(VERIFY_URL, "ng-license-action", "Lisans durumunu doğrula", "Lisans durumunu yeni sekmede doğrula"));
    node.appendChild(panel);
  }
  function renderSocial(node) {
    node.setAttribute("aria-label", "Sosyal medya hesaplarımız");
    var heading = create("div", "ng-social-heading");
    heading.appendChild(create("span", "ng-social-kicker", "NARCOSBAHİS RESMİ KANALLARI"));
    heading.appendChild(create("span", "ng-social-title", "Sosyal medya hesaplarımız"));
    node.appendChild(heading);
    node.appendChild(socialCard({
      href: TELEGRAM_URL,
      ariaLabel: "Telegram'da narcosresmi hesabını aç",
      image: ASSETS.telegram,
      label: "Telegram",
      value: "@narcosresmi"
    }));
    node.appendChild(socialCard({
      href: CURRENT_URL,
      ariaLabel: "NarcosBahis güncel adresini aç",
      image: ASSETS.web,
      label: "Her zaman güncel",
      value: "narcosgir.com"
    }));
  }
  function renderValues(node) {
    node.setAttribute("aria-label", "NarcosBahis vizyon ve misyonu");
    node.appendChild(valueCard("VİZYONUMUZ", [
      "NarcosBahis olarak vizyonumuz; yenilikçi teknoloji, güçlü altyapı ve şeffaf hizmet anlayışıyla çevrim içi oyun ve spor bahisleri sektöründe güvenin ve kalitenin simgesi olmaktır.",
      "Hızlı ödeme sistemleri, adil oyun politikası ve güçlü kullanıcı deneyimiyle global ölçekte tercih edilen, güvenli ve sürdürülebilir büyüyen lider bir marka olmayı hedefliyoruz."
    ]));
    node.appendChild(valueCard("MİSYONUMUZ", [
      "NarcosBahis'in misyonu; üyelerine 7/24 kesintisiz hizmet sunmak, yüksek oranlar ve avantajlı kampanyalar sağlamak, hızlı ve güvenilir ödeme altyapısıyla memnuniyeti en üst seviyeye çıkarmaktır.",
      "Şeffaflık, adalet ve güçlü teknolojik altyapı ile güvenli, hızlı ve sorunsuz bir oyun deneyimi sunmayı hedefler."
    ]));
  }
  function renderContact(node) {
    node.className = "ng-contact-button";
    node.href = "mailto:" + SUPPORT_EMAIL;
    node.setAttribute("aria-label", "NarcosBahis destek e-posta adresine ulaşın");
    var icon = create("span", "ng-contact-icon");
    var image = makeImage(ASSETS.chat, "ng-contact-image", "", 22, 22, true);
    image.setAttribute("aria-hidden", "true");
    icon.appendChild(image);
    node.appendChild(icon);
    node.appendChild(create("span", "ng-contact-copy", "BİZE ULAŞIN: " + SUPPORT_EMAIL));
  }
  function markAgeBadge(footer) {
    var current = document.getElementById("narcos-age-badge");
    if (current && footer.contains(current)) return;
    var nodes = footer.querySelectorAll("div,span");
    for (var i = 0; i < nodes.length; i += 1) {
      if (!nodes[i].children.length && nodes[i].textContent.trim() === "18+") {
        nodes[i].id = "narcos-age-badge";
        return;
      }
    }
  }
  function normalizeHref(href) {
    try {
      return new URL(href, window.location.href).pathname.toLowerCase().replace(/\/+$/, "") || "/";
    } catch (error) {
      return String(href || "").split(/[?#]/)[0].toLowerCase().replace(/\/+$/, "");
    }
  }
  function renderFooterColumns() {
    var footerTop = query('[data-mj="footer-top"]');
    var source = footerTop && query('[data-mj="footer-nav"]', footerTop);
    if (!footerTop || !source) return false;
    var links = Array.prototype.slice.call(source.querySelectorAll("a"));
    var groups = [
      { title: "HAKKIMIZDA", hrefs: ["/tr/ha", "/tr/sorumlu"] },
      { title: "YÖNETMELİK", hrefs: ["/tr/genel", "/tr/gizlilik", "/tr/sorular", "/tr/kyc"] },
      { title: "YARDIM", hrefs: ["/tr/iptal", "/tr/finansal", "/tr/karaparaaklama", "/tr/adalet"] },
      { title: "MOBİL UYGULAMA", hrefs: [] }
    ];
    var matched = links.filter(function (link) {
      var path = normalizeHref(link.getAttribute("href"));
      return groups.some(function (group) { return group.hrefs.indexOf(path) >= 0; });
    });
    var oldColumns = query("#narcos-footer-columns", footerTop);
    if (!matched.length) {
      if (oldColumns) oldColumns.remove();
      source.hidden = false;
      source.removeAttribute("aria-hidden");
      source.style.removeProperty("display");
      return false;
    }
    var signature = links.map(function (link) {
      return normalizeHref(link.getAttribute("href")) + ":" + link.textContent.trim();
    }).join("|");
    var columns = oldColumns || create("div");
    columns.id = "narcos-footer-columns";
    if (columns.__ngSourceSignature !== signature) {
      columns.textContent = "";
      groups.forEach(function (group) {
        var column = create("section", "ng-footer-column");
        column.appendChild(create("h3", "ng-footer-column-title", group.title));
        links.forEach(function (link) {
          if (group.hrefs.indexOf(normalizeHref(link.getAttribute("href"))) < 0) return;
          var clone = link.cloneNode(true);
          clone.className = "ng-footer-column-link";
          column.appendChild(clone);
        });
        if (!group.hrefs.length) column.appendChild(create("span", "ng-footer-column-note", "Yakında"));
        columns.appendChild(column);
      });
      columns.__ngSourceSignature = signature;
    }
    if (columns.parentElement !== footerTop) footerTop.appendChild(columns);
    source.hidden = true;
    source.setAttribute("aria-hidden", "true");
    source.style.setProperty("display", "none", "important");
    return true;
  }
  function renderFooter() {
    var footer = query("footer");
    var target = query('[data-mj="footer-content"]') || footer;
    if (!footer || !target) return false;
    var contact = mount("narcos-contact-button", "a", target, null, renderContact);
    var license = mount("narcos-license-banner", "section", target, contact, renderLicense);
    var social = mount("narcos-social-panel", "section", target, license, renderSocial);
    mount("narcos-values-panel", "section", target, social, renderValues);
    markAgeBadge(footer);
    var telegramImage = query('a img[alt="Telegram"]', footer);
    var telegramLink = telegramImage && telegramImage.closest("a");
    if (telegramLink) telegramLink.href = TELEGRAM_URL;
    var oldCampaignLinks = document.getElementById("narcos-campaign-links");
    if (oldCampaignLinks) oldCampaignLinks.remove();
    renderFooterColumns();
    return true;
  }
  function renderTrustHub() {
    var route = runtime.route || classifyRoute(cleanPath());
    var existing = document.getElementById("narcos-game-hub");
    if (!route.home) {
      if (existing) existing.remove();
      return false;
    }
    var main = query('main[data-mj="page-content"]');
    if (!main) return false;
    var providers = query('[data-mj="widget-top-providers"]', main);
    var pages = query('[data-mj="widget-pages"]', main);
    if (providers && providers.parentElement !== main) providers = null;
    if (pages && pages.parentElement !== main) pages = null;
    var before = providers || (pages && pages.nextSibling);
    var widget = mount("narcos-game-hub", "section", main, before, function (node) {
      node.className = "ng-trust-hub";
      node.setAttribute("aria-labelledby", "narcos-trust-hub-title");
      var head = create("div", "ng-trust-head");
      head.appendChild(create("span", "ng-trust-eyebrow", "NARCOS PREMIUM"));
      var title = create("h2", "ng-trust-title", "GÜVENİN VE DENEYİMİN ADRESİ");
      title.id = "narcos-trust-hub-title";
      head.appendChild(title);
      head.appendChild(create("p", "ng-trust-lead", "Güçlü topluluk, köklü deneyim ve her an yanınızda destek."));
      node.appendChild(head);
      var grid = create("div", "ng-trust-grid");
      grid.setAttribute("aria-label", "NarcosBahis güven ve deneyim bilgileri");
      [
        { icon: "members", value: "120.000+", label: "AKTİF ÜYE" },
        { icon: "experience", value: "10 YILI AŞKIN", label: "DENEYİM" },
        { icon: "support", value: "7/24", label: "CANLI DESTEK" },
        { icon: "verified", value: "RESMİ", label: "DOĞRULANMIŞ LİSANS", href: VERIFY_URL }
      ].forEach(function (item) {
        var card = item.href ? externalLink(item.href, "ng-trust-card", "", item.value + " " + item.label + " doğrulamasını aç") : create("article", "ng-trust-card");
        var iconWrap = create("span", "ng-trust-icon-wrap");
        var icon = create("span", "ng-trust-icon ng-trust-icon-" + item.icon);
        icon.setAttribute("aria-hidden", "true");
        iconWrap.appendChild(icon);
        var copy = create("span", "ng-trust-copy");
        copy.appendChild(create("strong", "ng-trust-value", item.value));
        copy.appendChild(create("span", "ng-trust-label", item.label));
        card.appendChild(iconWrap);
        card.appendChild(copy);
        if (item.href) {
          var arrow = create("span", "ng-trust-arrow", "↗");
          arrow.setAttribute("aria-hidden", "true");
          card.appendChild(arrow);
        }
        grid.appendChild(card);
      });
      node.appendChild(grid);
      node.appendChild(create("p", "ng-trust-note", "18+ • Sorumlu oyun • Bütçe ve zaman limitlerinizi belirleyin."));
    });
    if (!providers && pages && widget.previousElementSibling !== pages) pages.insertAdjacentElement("afterend", widget);
    return true;
  }
  function jackpotCard(symbol, label, value, tone) {
    var card = create("article", "ng-jackpot-card ng-jackpot-card-" + tone);
    var suit = create("span", "ng-jackpot-suit", symbol);
    suit.setAttribute("aria-hidden", "true");
    card.appendChild(suit);
    card.appendChild(create("span", "ng-jackpot-label", label));
    card.appendChild(create("strong", "ng-jackpot-value", value));
    return card;
  }
  function renderJackpot() {
    var route = runtime.route || classifyRoute(cleanPath());
    var existing = document.getElementById("narcos-egt-jackpot");
    if (!route.casino) {
      if (existing) existing.remove();
      return false;
    }
    var main = query("main");
    if (!main) return false;
    var widget = mount("narcos-egt-jackpot", "section", main, main.firstChild, function (node) {
      node.setAttribute("aria-label", "EGT jackpot değerleri");
      var heading = create("div", "ng-jackpot-heading");
      heading.appendChild(create("span", "ng-jackpot-kicker", "PREMIUM JACKPOT"));
      heading.appendChild(create("strong", "ng-jackpot-title", "EGT JACKPOT"));
      var grid = create("div", "ng-jackpot-grid");
      grid.appendChild(jackpotCard("♠", "SPADE", "118,868", "dark"));
      grid.appendChild(jackpotCard("♥", "HEART", "53,868", "red"));
      grid.appendChild(jackpotCard("♦", "DIAMOND", "1,597.72", "red"));
      grid.appendChild(jackpotCard("♣", "CLUB", "314.69", "dark"));
      node.appendChild(heading);
      node.appendChild(grid);
    });
    if (main.firstElementChild !== widget) main.insertBefore(widget, main.firstChild);
    return true;
  }
  var CAMPAIGNS = {
    vip: {
      eyebrow: "NARCOSBAHİS VIP CLUB",
      title: "VIP BAŞVURU",
      lead: "Size özel ayrıcalıklar, hızlı destek ve premium promosyon deneyimi için VIP ekibimize katılın.",
      body: '<div class="ng-campaign-grid"><article><span class="ng-campaign-icon">◆</span><h2>Kişisel VIP deneyimi</h2><p>Öncelikli destek, özel kampanyalar ve hesabınıza uygun avantajlar tek bir premium kanalda.</p></article><article><span class="ng-campaign-icon">✦</span><h2>Hızlı değerlendirme</h2><p>Başvurunuz VIP ekibimiz tarafından incelenir; geri dönüş için iletişim kanalınızı kullanırız.</p></article></div><form class="ng-campaign-form" action="mailto:destek@narcosbahis.com" method="post" enctype="text/plain"><label>Ad soyad<input name="ad_soyad" autocomplete="name" required></label><label>Kullanıcı adı<input name="kullanici_adi" required></label><label>Telegram kullanıcı adı<input name="telegram" placeholder="@kullanici"></label><label>Mesajınız<textarea name="mesaj" rows="4" placeholder="VIP ekibine iletmek istediğiniz not"></textarea></label><button class="ng-campaign-button" type="submit">VIP BAŞVURUSU GÖNDER</button></form>'
    },
    call: {
      eyebrow: "7/24 NARCOSBAHİS DESTEK",
      title: "BENİ ARA",
      lead: "Hesabınızla ilgili hızlı destek için canlı ekibimize ulaşın. Size en uygun kanaldan yardımcı olalım.",
      body: '<div class="ng-campaign-grid"><article><span class="ng-campaign-icon">◉</span><h2>Canlı destek</h2><p>Mesajlaşarak anında destek alın ve sorularınızı güvenli biçimde iletin.</p><button class="ng-campaign-button" data-ng-action="chat-or-email" type="button">CANLI DESTEĞİ AÇ</button></article><article><span class="ng-campaign-icon">✉</span><h2>E-posta desteği</h2><p>Detaylı talepleriniz için destek@narcosbahis.com adresine yazabilirsiniz.</p><a class="ng-campaign-button ng-campaign-button-secondary" href="mailto:destek@narcosbahis.com">E-POSTA GÖNDER</a></article></div><div class="ng-campaign-note"><strong>Güvenli iletişim</strong><span>Şifrenizi ve tek kullanımlık doğrulama kodlarınızı hiçbir destek kanalında paylaşmayın.</span></div>'
    },
    millionaires: {
      eyebrow: "NARCOSBAHİS PREMIUM CLUB",
      title: "MİLYONERLER KULÜBÜ",
      lead: "Premium üyelik deneyimini; özel iletişim, seçkin kampanyalar ve güvenli hesap yönetimiyle keşfedin.",
      body: '<div class="ng-campaign-stats"><div><strong>7/24</strong><span>Öncelikli destek</span></div><div><strong>VIP</strong><span>Kişisel ilgi</span></div><div><strong>GOLD</strong><span>Özel fırsatlar</span></div></div><div class="ng-campaign-grid"><article><span class="ng-campaign-icon">♛</span><h2>Seçkin ayrıcalıklar</h2><p>Premium üyeler için düzenlenen kampanya ve iletişim fırsatlarını tek panelde takip edin.</p></article><article><span class="ng-campaign-icon">◈</span><h2>Şeffaf ve güvenli</h2><p>Hesap hareketlerinizi kontrol altında tutun; destek ekibimiz ihtiyaç duyduğunuzda yanınızda olsun.</p></article><article><span class="ng-campaign-icon">↗</span><h2>Size özel yönlendirme</h2><p>İhtiyacınıza uygun bilgi için VIP ekibimizle iletişime geçin.</p></article></div><a class="ng-campaign-button" data-ng-action="chat-or-email" href="#">PREMİUM DESTEĞE ULAŞ</a>'
    }
  };
  function campaignRoute(path) {
    var routePath = path.replace(/\.(html?|php)$/, "");
    if (routePath === "/tr/vip-basvuru") return "vip";
    if (routePath === "/tr/beni-ara") return "call";
    if (routePath === "/tr/milyonerler") return "millionaires";
    return "";
  }
  function restoreCampaignHost() {
    var main = runtime.campaignMain;
    if (main) {
      Array.prototype.forEach.call(main.children, function (child) {
        if (child.__ngCampaignWasHidden === undefined) return;
        child.hidden = child.__ngCampaignWasHidden;
        delete child.__ngCampaignWasHidden;
      });
      main.classList.remove("ng-campaign-main");
    }
    var page = document.getElementById("narcos-campaign-page");
    if (page) page.remove();
    if (runtime.generatedTitle && document.title === runtime.generatedTitle && runtime.campaignTitle) {
      document.title = runtime.campaignTitle;
    }
    runtime.campaignMain = null;
    runtime.campaignTitle = "";
    runtime.generatedTitle = "";
  }
  function renderCampaign() {
    var route = runtime.route || classifyRoute(cleanPath());
    var content = CAMPAIGNS[route.campaign];
    if (!content) {
      restoreCampaignHost();
      return false;
    }
    var main = query("main");
    if (!main) return false;
    if (runtime.campaignMain && runtime.campaignMain !== main) restoreCampaignHost();
    if (!runtime.campaignMain) runtime.campaignTitle = document.title;
    runtime.campaignMain = main;
    var page = document.getElementById("narcos-campaign-page") || create("section");
    page.id = "narcos-campaign-page";
    page.className = "ng-campaign-page";
    if (page.getAttribute("data-ng-rendered") !== route.campaign) {
      page.innerHTML = '<div class="ng-campaign-hero"><span class="ng-campaign-eyebrow">' +
        content.eyebrow + '</span><h1>' + content.title + '</h1><p>' + content.lead +
        '</p><span class="ng-campaign-line"></span></div>' + content.body;
      page.setAttribute("data-ng-rendered", route.campaign);
      page.setAttribute("data-ng-route", route.campaign);
    }
    if (page.parentElement !== main) main.appendChild(page);
    Array.prototype.forEach.call(main.children, function (child) {
      if (child === page) return;
      if (child.__ngCampaignWasHidden === undefined) child.__ngCampaignWasHidden = child.hidden;
      child.hidden = true;
    });
    main.classList.add("ng-campaign-main");
    runtime.generatedTitle = content.title + " | NarcosBahis";
    document.title = runtime.generatedTitle;
    return true;
  }
  function localizeProviderSheet() {
    var search = query('[data-mj="game-catalog-provider-bottom-sheet-search"]');
    if (!search) return false;
    search.placeholder = "Sağlayıcı ara";
    search.setAttribute("aria-label", "Sağlayıcı ara");
    search.setAttribute("data-ng-localized", "1");
    return true;
  }
  function markMobileSidebar() {
    var nav = query('[data-mj="mobile-nav-list"]');
    if (!nav) return false;
    nav.classList.add("ng-sidebar-nav");
    if (nav.parentElement) nav.parentElement.classList.add("ng-sidebar-scroll");
    var node = nav.parentElement;
    var drawer = null;
    var fixedRoot = null;
    var viewport = window.innerWidth || document.documentElement.clientWidth;
    while (node && node !== document.body) {
      var rect = node.getBoundingClientRect();
      var style = window.getComputedStyle(node);
      if (rect.width >= 280 && rect.width < viewport && rect.height > 500) drawer = node;
      if (style.position === "fixed") {
        fixedRoot = node;
        break;
      }
      node = node.parentElement;
    }
    if (drawer) drawer.classList.add("ng-sidebar-drawer");
    if (fixedRoot) fixedRoot.classList.add("ng-sidebar-root");
    return true;
  }
  function markLeagueWidget() {
    var widgets = document.querySelectorAll('[data-mj="widget-collection-slider"]:not(.ng-leagues-widget)');
    Array.prototype.forEach.call(widgets, function (widget) {
      var headings = widget.querySelectorAll("p");
      for (var i = 0; i < headings.length; i += 1) {
        if (headings[i].textContent.trim().toLowerCase() === "ligler") {
          widget.classList.add("ng-leagues-widget");
          break;
        }
      }
    });
    return true;
  }
  function applyRouteClasses() {
    document.documentElement.classList.toggle("ng-home-route", runtime.route.home);
    document.documentElement.classList.toggle("ng-info-safe-route", runtime.route.infoSafe);
    document.documentElement.classList.toggle("ng-sports-route", runtime.route.sports);
  }
  var JOBS = {
    shell: renderShell, header: renderHeader, campaign: renderCampaign, trust: renderTrustHub,
    jackpot: renderJackpot, sidebar: markMobileSidebar,
    leagues: markLeagueWidget, footer: renderFooter
  };
  function flushJobs(bucket) {
    Object.keys(bucket).forEach(function (name) {
      delete bucket[name];
      if (JOBS[name]) JOBS[name]();
    });
  }
  function queueCritical(names) {
    names.forEach(function (name) { runtime.criticalDirty[name] = true; });
    if (runtime.criticalFrame) return;
    var run = function () {
      runtime.criticalFrame = 0; flushJobs(runtime.criticalDirty);
      if (runtime.observer) runtime.observer.takeRecords();
    };
    runtime.criticalFrame = window.requestAnimationFrame ? window.requestAnimationFrame(run) : window.setTimeout(run, 24);
  }
  function queueDeferred(names, timeout) {
    names.forEach(function (name) { runtime.deferredDirty[name] = true; });
    if (runtime.deferredHandle) return;
    var run = function () {
      runtime.deferredHandle = 0; runtime.deferredKind = "";
      flushJobs(runtime.deferredDirty);
      if (runtime.observer) runtime.observer.takeRecords();
    };
    if (window.requestIdleCallback) {
      runtime.deferredKind = "idle";
      runtime.deferredHandle = window.requestIdleCallback(run, { timeout: timeout || 900 });
    } else {
      runtime.deferredKind = "timeout";
      runtime.deferredHandle = window.setTimeout(run, 260);
    }
  }
  function handleRouteChange(force) {
    var path = cleanPath();
    if (!force && path === runtime.path) return;
    runtime.path = path; runtime.route = classifyRoute(path);
    applyRouteClasses();
    renderShell();
    queueCritical(["shell", "campaign"]);
    queueDeferred(["trust", "jackpot"], 700);
  }
  function matchesWithin(node, selector) {
    return !!(node && node.nodeType === 1 && ((node.matches && node.matches(selector)) ||
      (node.querySelector && node.querySelector(selector))));
  }
  function isOwnNode(node) {
    if (!node || node.nodeType !== 1) return false;
    return (node.id && node.id.indexOf("narcos-") === 0) ||
      !!(node.closest && node.closest('[id^="narcos-"]'));
  }
  var WATCHERS = [
    { selector: '[data-mj="header"],[data-mj="announcement"],main[data-mj="page-content"] iframe,[data-mj="bottom-nav"]', critical: ["shell"] },
    { selector: '[aria-label="site-header"],[data-mj="header-left"],[data-mj="header-right"],[data-mj="header-special-button"]', critical: ["header"] },
    { selector: 'main,[data-mj="page-content"]', critical: ["campaign"], deferred: ["trust", "jackpot"] },
    { selector: '[data-mj="mobile-nav-list"]', deferred: ["sidebar"] }, { selector: '[data-mj="widget-collection-slider"]', deferred: ["leagues"] },
    { selector: '[data-mj="footer-top"],[data-mj="footer-nav"],[data-mj="footer-content"],footer', deferred: ["footer"] }
  ];
  function observeMutations(records) {
    var critical = Object.create(null), deferred = Object.create(null);
    records.forEach(function (record) {
      if (record.type === "attributes" && record.target && record.target.matches && record.target.matches("iframe")) {
        critical.shell = true;
        return;
      }
      var shouldReconcile = false;
      Array.prototype.forEach.call(record.addedNodes, function (node) {
        if (isOwnNode(node)) return;
        shouldReconcile = true;
        if (matchesWithin(node, 'main[data-mj="page-content"],iframe')) critical.shell = true;
        if (matchesWithin(node, '[data-mj="game-catalog-provider-bottom-sheet-search"]')) localizeProviderSheet();
        WATCHERS.forEach(function (watcher) {
          if (!matchesWithin(node, watcher.selector)) return;
          (watcher.critical || []).forEach(function (name) { critical[name] = true; });
          (watcher.deferred || []).forEach(function (name) { deferred[name] = true; });
        });
      });
      Array.prototype.forEach.call(record.removedNodes, function (node) {
        if (node && (node.nodeType === 1 || node.nodeType === 3)) shouldReconcile = true;
        if (matchesWithin(node, 'main[data-mj="page-content"],main[data-mj="page-content"] iframe,iframe')) {
          critical.shell = true;
        }
      });
      if (!shouldReconcile || !record.target || record.target.nodeType !== 1) return;
      WATCHERS.forEach(function (watcher) {
        var target = record.target;
        var inside = (target.matches && target.matches(watcher.selector)) ||
          (target.closest && target.closest(watcher.selector));
        if (!inside) return;
        (watcher.critical || []).forEach(function (name) { critical[name] = true; });
        (watcher.deferred || []).forEach(function (name) { deferred[name] = true; });
      });
    });
    if (critical.shell) {
      delete critical.shell;
      renderShell();
    }
    var criticalNames = Object.keys(critical), deferredNames = Object.keys(deferred);
    if (criticalNames.length) queueCritical(criticalNames);
    if (deferredNames.length) queueDeferred(deferredNames, 700);
  }
  function onDocumentClick(event) {
    var target = event.target;
    var action = target && target.closest ? target.closest("[data-ng-action]") : null;
    if (action) {
      event.preventDefault();
      var chat = findChatButton();
      if (chat) chat.click();
      else if (action.getAttribute("data-ng-action") === "chat-or-telegram") window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
      else window.location.href = "mailto:" + SUPPORT_EMAIL;
      return;
    }
    var link = target && target.closest ? target.closest("a[href]") : null;
    if (link && link.origin === window.location.origin) window.setTimeout(handleRouteChange, 0);
  }
  function patchHistory() {
    ["pushState", "replaceState"].forEach(function (name) {
      var original = window.history[name];
      if (typeof original !== "function") return;
      var wrapped = function () {
        var result = original.apply(this, arguments);
        handleRouteChange(false);
        return result;
      };
      try {
        window.history[name] = wrapped;
        runtime.history.push([name, original, wrapped]);
      } catch (error) {
        /* popstate and delegated same-origin clicks remain available. */
      }
    });
  }
  function scheduleEffectsReady() {
    var activate = function () {
      runtime.effectsHandle = 0; runtime.effectsKind = "";
      document.documentElement.classList.add("ng-effects-ready");
    };
    var schedule = function () {
      if (window.requestIdleCallback) {
        runtime.effectsKind = "idle";
        runtime.effectsHandle = window.requestIdleCallback(activate, { timeout: 1600 });
      } else {
        runtime.effectsKind = "timeout";
        runtime.effectsHandle = window.setTimeout(activate, 650);
      }
    };
    if (document.readyState === "complete") schedule();
    else listen(window, "load", schedule, { once: true });
  }
  function refresh() {
    runtime.path = cleanPath(); runtime.route = classifyRoute(runtime.path);
    applyRouteClasses();
    renderShell();
    renderHeader();
    localizeProviderSheet();
    renderCampaign();
    queueDeferred(["trust", "jackpot", "sidebar", "leagues", "footer"], 1100);
  }
  function destroy() {
    if (runtime.observer) runtime.observer.disconnect();
    if (runtime.resizeObserver) runtime.resizeObserver.disconnect();
    runtime.listeners.forEach(function (entry) { entry[0].removeEventListener(entry[1], entry[2], entry[3]); });
    runtime.history.forEach(function (entry) {
      if (window.history[entry[0]] === entry[2]) window.history[entry[0]] = entry[1];
    });
    if (runtime.criticalFrame) {
      if (window.cancelAnimationFrame) window.cancelAnimationFrame(runtime.criticalFrame);
      else window.clearTimeout(runtime.criticalFrame);
    }
    if (runtime.deferredHandle && runtime.deferredKind === "idle" && window.cancelIdleCallback) window.cancelIdleCallback(runtime.deferredHandle);
    else if (runtime.deferredHandle) window.clearTimeout(runtime.deferredHandle);
    if (runtime.effectsHandle && runtime.effectsKind === "idle" && window.cancelIdleCallback) window.cancelIdleCallback(runtime.effectsHandle);
    else if (runtime.effectsHandle) window.clearTimeout(runtime.effectsHandle);
    restoreCampaignHost();
    document.documentElement.classList.remove("ng-game-embed", "ng-theme-info-mounted");
    var infoStrip = document.getElementById("narcos-info-strip");
    if (infoStrip) infoStrip.remove();
    if (window[GLOBAL_KEY] === runtime) delete window[GLOBAL_KEY];
  }
  runtime.refresh = refresh;
  runtime.destroy = destroy;
  patchHistory();
  listen(window, "popstate", function () { handleRouteChange(false); });
  listen(window, "hashchange", function () { handleRouteChange(false); });
  listen(document, "click", onDocumentClick, true);
  if (window.ResizeObserver) {
    runtime.resizeObserver = new ResizeObserver(function () {
      if (window[GLOBAL_KEY] === runtime) renderShell();
    });
  }
  refresh();
  scheduleEffectsReady();
  runtime.observer = new MutationObserver(observeMutations);
  runtime.observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src"]
  });
})();
