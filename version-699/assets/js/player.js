(function () {
  var shell = document.querySelector('[data-video-shell]');
  var video = document.querySelector('[data-video-player]');
  var playButton = document.querySelector('[data-play-button]');
  var state = document.querySelector('[data-player-state]');
  var hls = null;
  var started = false;

  if (!shell || !video || !playButton) {
    return;
  }

  function setState(text) {
    if (state) {
      state.textContent = text;
    }
  }

  function loadVideo() {
    if (started) {
      video.play();
      return;
    }

    started = true;
    shell.classList.add('is-playing');
    setState('正在加载');

    var stream = video.getAttribute('data-stream');

    if (!stream) {
      setState('视频暂时无法播放');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setState('');
        video.play();
      });

      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setState('视频加载失败，请刷新重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', function () {
        setState('');
        video.play();
      }, { once: true });
      video.load();
    } else {
      setState('视频暂时无法播放');
    }
  }

  playButton.addEventListener('click', function (event) {
    event.preventDefault();
    loadVideo();
  });

  shell.addEventListener('click', function (event) {
    if (!started && event.target === shell) {
      loadVideo();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
