/* NarcosBahis footer eklentileri:
   - Lisans dogrulama bandi
   - Sosyal medya ve guncel adres paneli
   - 18+ rozet hedefi */
(function () {
  "use strict";

  var VERIFY_URL = "https://verification.anjouangamblingboard.org/s/140e70a801efff238b59b01782ba34d909755fd6e27deb06c4959b328d6e9698e01f00b62578604eca16f199ebb446cb";
  var TELEGRAM_URL = "https://t.me/narcosresmi";
  var CURRENT_URL = "https://narcosgir.com";

  function makeText(tag, className, text) {
    var element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function makeSocialCard(options) {
    var link = document.createElement("a");
    link.className = "ng-social-card";
    link.href = options.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer external";
    link.setAttribute("aria-label", options.ariaLabel);

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
    if (!target) return false;

    var banner = document.getElementById("narcos-license-banner");

    if (!banner) {
      banner = document.createElement("section");
      banner.id = "narcos-license-banner";
      banner.setAttribute("aria-label", "Lisans doğrulama bilgisi");

      var link = document.createElement("a");
      link.className = "ng-license-link";
      link.href = VERIFY_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer external";
      link.setAttribute("aria-label", "Lisans durumunu yeni sekmede doğrula");

      var emblem = document.createElement("span");
      emblem.className = "ng-license-emblem";
      emblem.setAttribute("aria-hidden", "true");
      emblem.textContent = "✓";

      var copy = document.createElement("span");
      copy.className = "ng-license-copy";

      var eyebrow = document.createElement("span");
      eyebrow.className = "ng-license-eyebrow";
      eyebrow.textContent = "LİSANS DOĞRULAMA";

      var title = document.createElement("span");
      title.className = "ng-license-title";
      title.textContent = "Bu site lisanslı bir bahis sitesidir";

      var action = document.createElement("span");
      action.className = "ng-license-action";
      action.textContent = "Lisans durumunu doğrula";

      copy.appendChild(eyebrow);
      copy.appendChild(title);
      link.appendChild(emblem);
      link.appendChild(copy);
      link.appendChild(action);
      banner.appendChild(link);
    }

    if (banner.parentElement !== target) target.appendChild(banner);
    installSocialPanel(target, banner);
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
