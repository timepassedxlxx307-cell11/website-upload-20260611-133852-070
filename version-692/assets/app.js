const menuButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
    });
}

document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
        image.classList.add("is-hidden-image");
    });
});

const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
    if (!slides.length) {
        return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, current) => {
        slide.classList.toggle("active", current === heroIndex);
    });

    dots.forEach((dot, current) => {
        dot.classList.toggle("active", current === heroIndex);
    });
}

function startHero() {
    if (slides.length <= 1) {
        return;
    }

    heroTimer = window.setInterval(() => {
        showHeroSlide(heroIndex + 1);
    }, 5200);
}

function resetHeroTimer() {
    if (heroTimer) {
        window.clearInterval(heroTimer);
    }
    startHero();
}

dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        showHeroSlide(index);
        resetHeroTimer();
    });
});

showHeroSlide(0);
startHero();

const filterBars = Array.from(document.querySelectorAll("[data-filter-bar]"));

function getQueryValue(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
}

filterBars.forEach((bar) => {
    const keyword = bar.querySelector("[data-filter-keyword]");
    const year = bar.querySelector("[data-filter-year]");
    const type = bar.querySelector("[data-filter-type]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const emptyState = document.querySelector("[data-empty-state]");
    const initialQuery = getQueryValue("q");

    if (keyword && initialQuery) {
        keyword.value = initialQuery;
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();

    const applyFilter = () => {
        const key = normalize(keyword ? keyword.value : "");
        const selectedYear = year ? year.value : "";
        const selectedType = type ? type.value : "";
        let visibleCount = 0;

        cards.forEach((card) => {
            const content = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.year
            ].join(" "));
            const matchesKeyword = !key || content.includes(key);
            const matchesYear = !selectedYear || card.dataset.year === selectedYear;
            const matchesType = !selectedType || normalize(card.dataset.type).includes(normalize(selectedType));
            const visible = matchesKeyword && matchesYear && matchesType;

            card.style.display = visible ? "" : "none";
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("visible", visibleCount === 0);
        }
    };

    [keyword, year, type].forEach((control) => {
        if (control) {
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        }
    });

    applyFilter();
});
