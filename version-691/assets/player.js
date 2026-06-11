(function () {
  window.initMoviePlayer = function (config) {
    var shell = document.querySelector("[data-player-shell]");
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var message = document.querySelector("[data-player-message]");
    var loaded = false;
    var hls = null;

    if (!shell || !video || !overlay || !config || !config.source) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("show");
      window.setTimeout(function () {
        message.classList.remove("show");
      }, 2600);
    }

    function loadSource() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showMessage("暂时无法播放，请稍后再试");
          }
        });
        return Promise.resolve();
      }
      video.src = config.source;
      return Promise.resolve();
    }

    function start() {
      loadSource().then(function () {
        overlay.classList.add("hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            overlay.classList.remove("hidden");
            showMessage("点击画面继续播放");
          });
        }
      });
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
