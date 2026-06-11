(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var button = one('[data-menu-toggle]');
        var panel = one('[data-mobile-panel]');

        if (!button || !panel) {
            return;
        }

        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        all('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = one('input[name="q"]', form);
                var query = input ? input.value.trim() : '';
                var suffix = query ? '?q=' + encodeURIComponent(query) : '';
                window.location.href = 'search.html' + suffix;
            });
        });
    }

    function cardVisible(card, query, year, region, type, rating) {
        var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRating = parseFloat(card.getAttribute('data-rating') || '0');

        if (query && text.indexOf(normalize(query)) === -1) {
            return false;
        }

        if (year && year !== 'all' && cardYear !== normalize(year)) {
            return false;
        }

        if (region && region !== 'all' && cardRegion !== normalize(region)) {
            return false;
        }

        if (type && type !== 'all' && cardType !== normalize(type)) {
            return false;
        }

        if (rating && rating !== 'all' && cardRating < parseFloat(rating)) {
            return false;
        }

        return true;
    }

    function initFilters() {
        all('[data-filter-scope]').forEach(function (scope) {
            var queryInput = one('[data-filter-query]', scope);
            var yearSelect = one('[data-filter-year]', scope);
            var regionSelect = one('[data-filter-region]', scope);
            var typeSelect = one('[data-filter-type]', scope);
            var ratingSelect = one('[data-filter-rating]', scope);
            var empty = one('[data-filter-empty]', scope);
            var cards = all('[data-movie-card]', scope);

            function apply() {
                var shown = 0;
                var query = queryInput ? queryInput.value : '';
                var year = yearSelect ? yearSelect.value : 'all';
                var region = regionSelect ? regionSelect.value : 'all';
                var type = typeSelect ? typeSelect.value : 'all';
                var rating = ratingSelect ? ratingSelect.value : 'all';

                cards.forEach(function (card) {
                    var visible = cardVisible(card, query, year, region, type, rating);
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', shown === 0);
                }
            }

            [queryInput, yearSelect, regionSelect, typeSelect, ratingSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function initSearchPage() {
        var scope = one('[data-search-page]');

        if (!scope) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = one('[data-filter-query]', scope);

        if (input) {
            input.value = query;
            input.dispatchEvent(new Event('input'));
        }
    }

    function initHero() {
        var hero = one('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var prev = one('[data-hero-prev]', hero);
        var next = one('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initPlayer(source) {
        var video = one('#movie-player');
        var overlay = one('[data-player-overlay]');
        var attached = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function play() {
            attach();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    window.Site = {
        initPlayer: initPlayer
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
