/* NarcosBahis footer lisans bandi
   Bu dosya resmi muhur gorselini taklit etmez veya degistirmez.
   Verilen resmi dogrulama kaydina baglanan ozel bir bilgilendirme bandi ekler. */
(function () {
  "use strict";

  var VERIFY_URL = "https://verification.anjouangamblingboard.org/s/140e70a801efff238b59b01782ba34d909755fd6e27deb06c4959b328d6e9698e01f00b62578604eca16f199ebb446cb";

  function installLicenseBanner() {
    if (document.getElementById("narcos-license-banner")) return true;

    var footerContent = document.querySelector('[data-mj="footer-content"]');
    var footer = document.querySelector("footer");
    var target = footerContent || footer;
    if (!target) return false;

    var banner = document.createElement("section");
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
    target.appendChild(banner);
    return true;
  }

  if (!installLicenseBanner()) {
    var observer = new MutationObserver(function () {
      if (installLicenseBanner()) observer.disconnect();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.setTimeout(function () {
      observer.disconnect();
    }, 30000);
  }
})();
