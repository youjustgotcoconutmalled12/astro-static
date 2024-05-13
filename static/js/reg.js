"use strict";

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");

const input = document.querySelector("input");

const swConfig = {
  uv: { file: "/static/js/sw.js" config: __uv$config },
};
function registerSW() {
  if (localStorage.getItem("registerSW") === "true") {
    var proxySetting = localStorage.getItem("proxy") || "uv";
    let { file: swFile, config: swConfigSettings } = swConfig[proxySetting];

    navigator.serviceWorker
      .register(swFile, { scope: swConfigSettings.prefix })
      .then((registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed:", error);
      });
  }
}

// crypts class definition
class crypts {
  static encode(str) {
    return encodeURIComponent(
      str
        .toString()
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }

  static decode(str) {
    if (str.charAt(str.length - 1) === "/") {
      str = str.slice(0, -1);
    }
    return decodeURIComponent(
      str
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }
}
if ("serviceWorker" in navigator) {
  var proxySetting = localStorage.getItem("proxy") || "uv";
  let swConfig = {
    uv: { file: "/static/js/sw.js", config: __uv$config }
  };

  let { file: swFile, config: swConfigSettings } = swConfig[proxySetting];

  navigator.serviceWorker
    .register(swFile, { scope: swConfigSettings.prefix })
    .then((registration) => {
      console.log("ServiceWorker registration successful with scope: ", registration.scope);
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        let encodedUrl = swConfigSettings.prefix + crypts.encode(search(address.value));
        sessionStorage.setItem("encodedUrl", encodedUrl);
        const browseSetting = localStorage.getItem("browse");
        const browseUrls = {
          go: "/go",
          norm: encodedUrl,
        };

        const urlToNavigate = browseUrls[browseSetting] || "/go";
        location.href = urlToNavigate;
      });
    })
    .catch((error) => {
      console.error("ServiceWorker registration failed:", error);
    });
}

function launch(val) {
  if ("serviceWorker" in navigator) {
    let proxySetting = localStorage.getItem("proxy") || "uv";
    let swConfig = {
      uv: { file: "/static/uv.js", config: __uv$config }
    };

    // Use the selected proxy setting or default to 'uv'
    let { file: swFile, config: swConfigSettings } = swConfig[proxySetting];

    navigator.serviceWorker
      .register(swFile, { scope: swConfigSettings.prefix })
      .then((registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
        let url = val.trim();
        if (typeof ifUrl === "function" && !ifUrl(url)) {
          url = search(url);
        } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
          url = "https://" + url;
        }

        let encodedUrl = swConfigSettings.prefix + crypts.encode(url);
        sessionStorage.setItem("encodedUrl", encodedUrl);
        const browseSetting = localStorage.getItem("browse");
        const browseUrls = {
          go: "/static/go.html",
          norm: encodedUrl,
        };
        const urlToNavigate = browseUrls[browseSetting] || "/go";
        location.href = urlToNavigate;
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed:", error);
      });
  }
}

function ifUrl(val = "") {
  const urlPattern = /^(http(s)?:\/\/)?([\w-]+\.)+[\w]{2,}(\/.*)?$/;
  return urlPattern.test(val);
}
