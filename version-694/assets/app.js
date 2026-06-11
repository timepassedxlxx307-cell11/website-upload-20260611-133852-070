(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (toggle && mobileMenu) {
      toggle.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('.hero-slider').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      var prev = slider.querySelector('.hero-prev');
      var next = slider.querySelector('.hero-next');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll('.filter-scope').forEach(function (scope) {
      var input = scope.querySelector('.movie-filter-input');
      var year = scope.querySelector('.movie-filter-year');
      var type = scope.querySelector('.movie-filter-type');
      var region = scope.querySelector('.movie-filter-region');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input) {
        input.value = query;
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var term = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var visible = true;

          if (term && text.indexOf(term) === -1) {
            visible = false;
          }

          if (yearValue && cardYear !== yearValue) {
            visible = false;
          }

          if (typeValue && cardType !== typeValue) {
            visible = false;
          }

          if (regionValue && cardRegion !== regionValue) {
            visible = false;
          }

          card.hidden = !visible;
        });
      }

      [input, year, type, region].forEach(function (element) {
        if (!element) {
          return;
        }

        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      });

      apply();
    });
  });
})();
