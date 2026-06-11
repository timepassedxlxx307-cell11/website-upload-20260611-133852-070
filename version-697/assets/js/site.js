import { H as Hls } from './hls.js';

const select = (target, root = document) => root.querySelector(target);
const selectAll = (target, root = document) => Array.from(root.querySelectorAll(target));

function initMenu() {
    const button = select('[data-menu-toggle]');
    const panel = select('[data-mobile-panel]');
    if (!button || !panel) {
        return;
    }
    button.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function initHero() {
    const hero = select('[data-hero]');
    if (!hero) {
        return;
    }
    const slides = selectAll('[data-hero-slide]', hero);
    const dots = selectAll('[data-hero-dot]', hero);
    const prev = select('[data-hero-prev]', hero);
    const next = select('[data-hero-next]', hero);
    if (!slides.length) {
        return;
    }
    let current = 0;
    let timer = null;
    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };
    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5000);
    };
    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
        }
    };
    prev?.addEventListener('click', () => {
        show(current - 1);
        start();
    });
    next?.addEventListener('click', () => {
        show(current + 1);
        start();
    });
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            show(index);
            start();
        });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
}

function initPlayers() {
    selectAll('[data-player]').forEach((shell) => {
        const video = select('video[data-video-url]', shell);
        const button = select('[data-player-button]', shell);
        if (!video || !button) {
            return;
        }
        let hls = null;
        let loaded = false;
        const load = () => {
            if (loaded) {
                return;
            }
            const source = video.getAttribute('data-video-url');
            if (!source) {
                return;
            }
            if (Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (!data.fatal || !hls) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }
            loaded = true;
        };
        const play = async () => {
            load();
            shell.classList.add('is-playing');
            try {
                await video.play();
            } catch (_error) {
                shell.classList.remove('is-playing');
            }
        };
        button.addEventListener('click', play);
        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', () => shell.classList.add('is-playing'));
        video.addEventListener('pause', () => {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function initSearchPage() {
    const grid = select('[data-search-grid]');
    if (!grid) {
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = normalize(params.get('q'));
    const input = select('[data-search-page-input]');
    const heading = select('[data-search-heading]');
    if (input) {
        input.value = params.get('q') || '';
    }
    const cards = selectAll('.movie-card', grid);
    let shown = 0;
    cards.forEach((card) => {
        const matched = !query || normalize(card.getAttribute('data-search')).includes(query);
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
            shown += 1;
        }
    });
    if (heading) {
        heading.textContent = query ? `搜索结果：${params.get('q') || ''}` : '全部影片';
    }
}

function initLocalFilters() {
    const grid = select('[data-filter-grid]');
    if (!grid) {
        return;
    }
    const input = select('.page-filter-input');
    const year = select('.page-year-filter');
    const cards = selectAll('.movie-card', grid);
    const apply = () => {
        const word = normalize(input?.value || '');
        const selectedYear = normalize(year?.value || '');
        cards.forEach((card) => {
            const content = normalize(card.getAttribute('data-search'));
            const cardYear = normalize(card.getAttribute('data-year'));
            const matchedWord = !word || content.includes(word);
            const matchedYear = !selectedYear || cardYear === selectedYear;
            card.classList.toggle('is-hidden', !(matchedWord && matchedYear));
        });
    };
    input?.addEventListener('input', apply);
    year?.addEventListener('change', apply);
    apply();
}

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initPlayers();
    initSearchPage();
    initLocalFilters();
});
