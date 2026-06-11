(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
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
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCardFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    areas.forEach(function (area) {
      var list = area.parentElement.querySelector("[data-card-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")) : [];
      var search = area.querySelector("[data-card-search]");
      var year = area.querySelector("[data-year-filter]");
      var type = area.querySelector("[data-type-filter]");
      var empty = area.parentElement.querySelector("[data-empty-state]");

      function apply() {
        var q = normalize(search && search.value);
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var hay = normalize(card.getAttribute("data-search"));
          var okSearch = !q || hay.indexOf(q) !== -1;
          var okYear = !y || card.getAttribute("data-year") === y;
          var okType = !t || card.getAttribute("data-type") === t;
          var ok = okSearch && okYear && okType;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function movieCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-wrap\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"play-mark\">▶</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<a class=\"card-title\" href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!form || !input || !results || !window.SEARCH_INDEX) {
      return;
    }

    function getQueryFromUrl() {
      try {
        return new URLSearchParams(window.location.search).get("q") || "";
      } catch (error) {
        return "";
      }
    }

    function render() {
      var q = normalize(input.value);
      var picked = window.SEARCH_INDEX.filter(function (movie) {
        return !q || normalize(movie.search).indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = picked.map(movieCard).join("");
      if (empty) {
        empty.classList.toggle("show", picked.length === 0);
      }
    }

    input.value = getQueryFromUrl();
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
      if (history.replaceState) {
        var q = input.value.trim();
        history.replaceState(null, "", q ? "?q=" + encodeURIComponent(q) : window.location.pathname);
      }
    });
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();
