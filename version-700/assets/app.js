(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        root.addEventListener('mouseenter', function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });
        root.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function getText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-category') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
    }

    function setupFilters() {
        var pages = Array.prototype.slice.call(document.querySelectorAll('[data-filter-page]'));
        pages.forEach(function (page) {
            var input = page.querySelector('.js-search');
            var buttons = Array.prototype.slice.call(page.querySelectorAll('[data-filter-value]'));
            var sort = page.querySelector('.js-sort');
            var list = page.querySelector('[data-card-list]');
            var empty = page.querySelector('[data-empty-state]');
            if (!list) {
                return;
            }
            var active = 'all';
            var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : '';
                var shown = 0;
                cards.forEach(function (card) {
                    var blob = getText(card);
                    var passQuery = !q || blob.indexOf(q) !== -1;
                    var passFilter = active === 'all' || blob.indexOf(active.toLowerCase()) !== -1;
                    var visible = passQuery && passFilter;
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', shown === 0);
                }
            }

            function sortCards(mode) {
                cards.sort(function (a, b) {
                    if (mode === 'title') {
                        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                    }
                    if (mode === 'year') {
                        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                    }
                    return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
                });
                cards.forEach(function (card) {
                    list.appendChild(card);
                });
                apply();
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    active = button.getAttribute('data-filter-value') || 'all';
                    buttons.forEach(function (other) {
                        other.classList.toggle('active', other === button);
                    });
                    apply();
                });
            });
            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }
            if (sort) {
                sort.addEventListener('change', function () {
                    sortCards(sort.value);
                });
            }
            apply();
        });
    }

    function setupHeroSearch() {
        var form = document.getElementById('heroSearchForm');
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupHeroSearch();
    });
}());
