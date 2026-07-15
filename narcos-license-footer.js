/* NarcosBahis footer eklentileri:
   - Lisans doğrulama bandı ve VALID görseli
   - Vizyon / misyon double banner
   - Sosyal medya ve güncel adres paneli
   - 18+ rozet hedefi */
(function () {
  "use strict";

  var VERIFY_URL = "https://verification.anjouangamblingboard.org/s/140e70a801efff238b59b01782ba34d909755fd6e27deb06c4959b328d6e9698e01f00b62578604eca16f199ebb446cb";
  var TELEGRAM_URL = "https://t.me/narcosresmi";
  var CURRENT_URL = "https://narcosgir.com";
  var WEBSITE_URL = "https://narcosbahis.com/";
  var LICENSE_BADGE_URL = "data:image/png;base64,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";

  function makeText(tag, className, text) {
    var element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function makeExternalLink(href, className, text, ariaLabel) {
    var link = document.createElement("a");
    link.href = href;
    link.className = className || "";
    link.target = "_blank";
    link.rel = "noopener noreferrer external";
    link.textContent = text;
    if (ariaLabel) link.setAttribute("aria-label", ariaLabel);
    return link;
  }

  function makeSocialCard(options) {
    var link = makeExternalLink(options.href, "ng-social-card", "", options.ariaLabel);

    var icon = makeText("span", "ng-social-icon", options.icon);
    icon.setAttribute("aria-hidden", "true");

    var copy = document.createElement("span");
    copy.className = "ng-social-copy";
    copy.appendChild(makeText("span", "ng-social-label", options.label));
    copy.appendChild(makeText("span", "ng-social-value", options.value));

    var arrow = makeText("span", "ng-social-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");

    link.appendChild(icon);
    link.appendChild(copy);
    link.appendChild(arrow);
    return link;
  }

  function installSocialPanel(target, licenseBanner) {
    var panel = document.getElementById("narcos-social-panel");

    if (!panel) {
      panel = document.createElement("section");
      panel.id = "narcos-social-panel";
      panel.setAttribute("aria-label", "Sosyal medya hesaplarımız");

      var heading = document.createElement("div");
      heading.className = "ng-social-heading";
      heading.appendChild(makeText("span", "ng-social-kicker", "NARCOSBAHİS RESMİ KANALLARI"));
      heading.appendChild(makeText("span", "ng-social-title", "Sosyal medya hesaplarımız"));

      panel.appendChild(heading);
      panel.appendChild(makeSocialCard({
        href: TELEGRAM_URL,
        ariaLabel: "Telegram'da narcosresmi hesabını aç",
        icon: "✈",
        label: "Telegram",
        value: "@narcosresmi"
      }));
      panel.appendChild(makeSocialCard({
        href: CURRENT_URL,
        ariaLabel: "NarcosBahis güncel adresini aç",
        icon: "N",
        label: "Her zaman güncel",
        value: "narcosgir.com"
      }));
    }

    if (panel.parentElement !== target || panel.nextElementSibling !== licenseBanner) {
      target.insertBefore(panel, licenseBanner || null);
    }

    return panel;
  }

  function makeValueCard(title, paragraphs) {
    var card = document.createElement("article");
    card.className = "ng-value-card";
    card.appendChild(makeText("h3", "", title));

    for (var i = 0; i < paragraphs.length; i += 1) {
      card.appendChild(makeText("p", "", paragraphs[i]));
    }

    return card;
  }

  function installValuesPanel(target, socialPanel) {
    var panel = document.getElementById("narcos-values-panel");

    if (!panel) {
      panel = document.createElement("section");
      panel.id = "narcos-values-panel";
      panel.setAttribute("aria-label", "NarcosBahis vizyon ve misyonu");

      panel.appendChild(makeValueCard("VİZYONUMUZ", [
        "NarcosBahis olarak vizyonumuz; yenilikçi teknoloji, güçlü altyapı ve şeffaf hizmet anlayışıyla çevrim içi oyun ve spor bahisleri sektöründe güvenin ve kalitenin simgesi olmaktır.",
        "Hızlı ödeme sistemleri, adil oyun politikası ve güçlü kullanıcı deneyimiyle global ölçekte tercih edilen, güvenli ve sürdürülebilir büyüyen lider bir marka olmayı hedefliyoruz."
      ]));

      panel.appendChild(makeValueCard("MİSYONUMUZ", [
        "NarcosBahis'in misyonu; üyelerine 7/24 kesintisiz hizmet sunmak, yüksek oranlar ve avantajlı kampanyalar sağlamak, hızlı ve güvenilir ödeme altyapısıyla memnuniyeti en üst seviyeye çıkarmaktır.",
        "Şeffaflık, adalet ve güçlü teknolojik altyapı ile güvenli, hızlı ve sorunsuz bir oyun deneyimi sunmayı hedefler."
      ]));
    }

    if (panel.parentElement !== target || panel.nextElementSibling !== socialPanel) {
      target.insertBefore(panel, socialPanel || null);
    }

    return panel;
  }

  function buildLicenseBanner(banner) {
    banner.textContent = "";
    banner.setAttribute("data-ng-version", "3");

    var panel = document.createElement("div");
    panel.className = "ng-license-panel";

    var badgeLink = makeExternalLink(
      VERIFY_URL,
      "ng-license-badge-link",
      "",
      "Geçerli lisansı doğrula"
    );
    var badge = document.createElement("img");
    badge.className = "ng-license-badge";
    badge.src = LICENSE_BADGE_URL;
    badge.alt = "Geçerli lisans - doğrulamak için tıklayın";
    badge.width = 82;
    badge.height = 82;
    badge.loading = "lazy";
    badgeLink.appendChild(badge);

    var copy = document.createElement("div");
    copy.className = "ng-license-copy";
    copy.appendChild(makeText("span", "ng-license-eyebrow", "LİSANS DOĞRULAMA"));

    var legal = document.createElement("p");
    legal.className = "ng-license-title";
    legal.appendChild(makeExternalLink(WEBSITE_URL, "", "narcosbahis.com", "NarcosBahis ana sayfasını aç"));
    legal.appendChild(document.createTextNode(
      ", Anjouan Birliği'nin Mutsamudu bölgesinde kayıtlı NarcosBahis Entertainment Limited tarafından işletilmektedir. Platform, Anjouan Eyaleti Offshore Finance Authority tarafından Computer Gaming Licensing Act 007 of 2005 kapsamında düzenlenen ALSI-202607948-FI5 numaralı geçerli internet oyun lisansı ile faaliyet göstermektedir."
    ));
    copy.appendChild(legal);

    var action = makeExternalLink(
      VERIFY_URL,
      "ng-license-action",
      "Lisans durumunu doğrula",
      "Lisans durumunu yeni sekmede doğrula"
    );

    panel.appendChild(badgeLink);
    panel.appendChild(copy);
    panel.appendChild(action);
    banner.appendChild(panel);
  }

  function installLicenseBanner(target) {
    var banner = document.getElementById("narcos-license-banner");

    if (!banner) {
      banner = document.createElement("section");
      banner.id = "narcos-license-banner";
      banner.setAttribute("aria-label", "Lisans doğrulama bilgisi");
    }

    if (banner.getAttribute("data-ng-version") !== "3") buildLicenseBanner(banner);
    if (banner.parentElement !== target) target.appendChild(banner);
    return banner;
  }

  function markAgeBadge(footer) {
    var nodes = footer.querySelectorAll("div, span");
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].textContent.trim() === "18+" && nodes[i].children.length === 0) {
        nodes[i].id = "narcos-age-badge";
        return nodes[i];
      }
    }
    return null;
  }

  function updateExistingTelegramLink(footer) {
    var links = footer.querySelectorAll("a");
    for (var i = 0; i < links.length; i += 1) {
      var image = links[i].querySelector('img[alt="Telegram"]');
      if (image) links[i].href = TELEGRAM_URL;
    }
  }

  function installFooterEnhancements() {
    var footerContent = document.querySelector('[data-mj="footer-content"]');
    var footer = document.querySelector("footer");
    var target = footerContent || footer;
    if (!target || !footer) return false;

    var licenseBanner = installLicenseBanner(target);
    var socialPanel = installSocialPanel(target, licenseBanner);
    installValuesPanel(target, socialPanel);
    markAgeBadge(footer);
    updateExistingTelegramLink(footer);
    return true;
  }

  installFooterEnhancements();

  var scheduled = false;
  var observer = new MutationObserver(function () {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      installFooterEnhancements();
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
