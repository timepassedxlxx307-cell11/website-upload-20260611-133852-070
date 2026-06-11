(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('.menu-toggle');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = document.body.classList.toggle('menu-open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function initBackTop() {
        var button = qs('.back-top');
        if (!button) {
            return;
        }
        function update() {
            if (window.scrollY > 420) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        }
        window.addEventListener('scroll', update, { passive: true });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        update();
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initFilters() {
        var scope = qs('[data-filter-scope]');
        var list = qs('[data-filter-list]');
        if (!scope || !list) {
            return;
        }
        var input = qs('[data-filter-search]', scope);
        var selects = qsa('[data-filter]', scope);
        var reset = qs('[data-filter-reset]', scope);
        var empty = qs('[data-empty-state]');
        var cards = qsa('.movie-card', list);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && input) {
            input.value = initialQuery;
        }
        function apply() {
            var query = normalize(input ? input.value : '');
            var active = {};
            selects.forEach(function (select) {
                active[select.getAttribute('data-filter')] = normalize(select.value);
            });
            var visible = 0;
            cards.forEach(function (card) {
                var matched = true;
                var haystack = normalize(card.getAttribute('data-search'));
                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                Object.keys(active).forEach(function (key) {
                    if (!active[key]) {
                        return;
                    }
                    var value = normalize(card.getAttribute('data-' + key));
                    if (key === 'type') {
                        if (value.indexOf(active[key]) === -1) {
                            matched = false;
                        }
                    } else if (value !== active[key]) {
                        matched = false;
                    }
                });
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                apply();
            });
        }
        apply();
    }

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initBackTop();
        initHero();
        initFilters();
    });

    window.initMoviePlayer = function (src) {
        ready(function () {
            var video = qs('#movie-player');
            var overlay = qs('#play-overlay');
            if (!video || !overlay || !src) {
                return;
            }
            var loaded = false;
            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
            }
            function play() {
                load();
                overlay.classList.add('is-hidden');
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }
            overlay.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
        });
    };
}());
