(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
        slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });

    activate(0);

    window.setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var keyword = input ? input.value.trim() : '';
      var target = 'search.html';

      if (keyword) {
        target += '?q=' + encodeURIComponent(keyword);
      }

      window.location.href = target;
    });
  });

  var filterScope = document.querySelector('[data-filter-scope]');

  if (filterScope) {
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && keywordInput) {
      keywordInput.value = query;
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilters() {
      var keyword = valueOf(keywordInput);
      var year = valueOf(yearSelect);
      var type = valueOf(typeSelect);
      var region = valueOf(regionSelect);

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
          matched = false;
        }

        if (type && (card.getAttribute('data-type') || '').toLowerCase() !== type) {
          matched = false;
        }

        if (region && (card.getAttribute('data-region') || '').toLowerCase().indexOf(region) === -1) {
          matched = false;
        }

        card.hidden = !matched;
      });
    }

    [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
