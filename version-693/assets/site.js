(() => {
  const mobileButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', () => {
      const expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
      mobileButton.textContent = expanded ? '☰' : '×';
    });
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const regionSelect = filterPanel.querySelector('[data-filter-region]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const empty = document.querySelector('.search-empty');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (keywordInput && query) {
      keywordInput.value = query;
    }

    const normalize = value => (value || '').toString().trim().toLowerCase();

    const applyFilters = () => {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      const region = normalize(regionSelect ? regionSelect.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      let visible = 0;

      cards.forEach(card => {
        const text = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.category,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' '));
        const okKeyword = !keyword || text.includes(keyword);
        const okType = !type || normalize(card.dataset.type) === type;
        const okRegion = !region || normalize(card.dataset.region).includes(region);
        const okYear = !year || normalize(card.dataset.year) === year;
        const show = okKeyword && okType && okRegion && okYear;

        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };

    [keywordInput, typeSelect, regionSelect, yearSelect].forEach(control => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach(player => {
    const video = player.querySelector('video[data-hls]');
    const overlay = player.querySelector('.player-overlay');
    let hlsInstance = null;
    let loaded = false;

    const loadVideo = () => {
      if (!video || loaded) {
        return;
      }

      const url = video.getAttribute('data-hls');

      if (!url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }

      loaded = true;
    };

    const playVideo = () => {
      loadVideo();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        const attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(() => {});
        }
      }
    };

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          playVideo();
        }
      });
    }

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
