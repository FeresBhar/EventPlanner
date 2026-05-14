class App {
    constructor() {
        this.page = 0;
        this.totalPages = 1;
        this.lastQuery = {};
        this.lastEvents = [];
        this.init();
    }

    async init() {
        Modal.init();
        EventMap.init();
        this.applyTheme();
        this.setupEventListeners();
        this.restoreSession();
        UI.updateStats();
        UI.renderFavorites();
        UI.renderSchedule();
        await this.loadFeatured();
        await this.loadDefault();
    }

    applyTheme() {
        const theme = Storage.getTheme();
        if (theme === 'light') document.body.classList.add('light-mode');
        document.getElementById('themeToggle').querySelector('.theme-icon').textContent =
            theme === 'light' ? '🌙' : '☀️';
    }

    restoreSession() {
        const saved = Storage.getSessionSearch();
        if (saved.keyword) document.getElementById('exploreSearch').value = saved.keyword;
        if (saved.city) document.getElementById('exploreCity').value = saved.city;
        if (saved.category) document.getElementById('categoryFilter').value = saved.category;
        if (saved.showCancelled) document.getElementById('showCancelledToggle').checked = true;
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            Storage.saveTheme(isLight ? 'light' : 'dark');
            document.getElementById('themeToggle').querySelector('.theme-icon').textContent =
                isLight ? '🌙' : '☀️';
        });

        document.getElementById('mobileMenuToggle').addEventListener('click', () => {
            document.getElementById('navMenu').classList.toggle('active');
        });

        document.getElementById('heroSearchBtn').addEventListener('click', () => this.handleHeroSearch());
        document.getElementById('heroSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleHeroSearch();
        });

        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('exploreSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            document.getElementById('exploreSearch').value = '';
            document.getElementById('exploreCity').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('showCancelledToggle').checked = false;
            Storage.saveSessionSearch({});
            this.loadDefault();
        });

        document.getElementById('loadMoreBtn').addEventListener('click', () => this.loadMore());

        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(a.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
                document.getElementById('navMenu').classList.remove('active');
            });
        });

        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');
            let current = '';
            sections.forEach(s => {
                if (window.pageYOffset >= s.offsetTop - 200) current = s.id;
            });
            navLinks.forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
            });
        });

        document.getElementById('map').addEventListener('mouseenter', () => {
            EventMap.instance?.invalidateSize();
        });
    }

    async handleHeroSearch() {
        const keyword = document.getElementById('heroSearchInput').value.trim();
        const city = document.getElementById('heroCityInput').value.trim();
        if (!keyword && !city) {
            UI.showToast('Please enter a search term or city', 'error');
            return;
        }
        document.getElementById('exploreSearch').value = keyword;
        document.getElementById('exploreCity').value = city;
        document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
        await this.handleSearch();
    }

    async handleSearch() {
        const keyword = document.getElementById('exploreSearch').value.trim();
        const city = document.getElementById('exploreCity').value.trim();
        const classificationId = document.getElementById('categoryFilter').value;
        const showCancelled = document.getElementById('showCancelledToggle').checked;

        this.page = 0;
        this.lastQuery = { keyword, city, classificationId, showCancelled };
        Storage.saveSessionSearch({ keyword, city, category: classificationId, showCancelled });

        UI.showLoading('eventsGrid');
        document.getElementById('loadMoreBtn').style.display = 'none';

        try {
            const { events, total, pages } = await API.searchEvents({ ...this.lastQuery, page: 0, size: 20 });
            this.totalPages = pages;
            document.getElementById('totalEvents').textContent = total;
            UI.renderEvents(events, 'eventsGrid');
            if (pages > 1) document.getElementById('loadMoreBtn').style.display = 'inline-block';
        } catch (err) {
            document.getElementById('eventsGrid').innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">⚠️</span>
                    <p>Failed to load events</p>
                    <p class="empty-hint">${err.message}</p>
                </div>
            `;
        }

        EventMap.loadAndPlot(this.lastQuery);
    }

    async loadMore() {
        if (this.page + 1 >= this.totalPages) return;
        this.page++;
        const btn = document.getElementById('loadMoreBtn');
        btn.textContent = 'Loading...';
        btn.disabled = true;

        try {
            const { events, pages } = await API.searchEvents({ ...this.lastQuery, page: this.page, size: 20 });
            UI.renderEvents(events, 'eventsGrid', true);
            btn.textContent = 'Load More Events';
            btn.disabled = false;
            if (this.page + 1 >= pages) btn.style.display = 'none';
        } catch {
            btn.textContent = 'Load More Events';
            btn.disabled = false;
        }
    }

    async loadFeatured() {
        UI.showLoading('featuredGrid');
        try {
            const { events } = await API.getFeaturedEvents();
            UI.renderEvents(events, 'featuredGrid');
        } catch {
            document.getElementById('featuredGrid').innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">⚠️</span>
                    <p>Could not load featured events</p>
                </div>
            `;
        }
    }

    async loadDefault() {
        UI.showLoading('eventsGrid');
        document.getElementById('loadMoreBtn').style.display = 'none';
        this.page = 0;
        this.lastQuery = { keyword: 'music', showCancelled: false };

        try {
            const { events, total, pages } = await API.searchEvents({ keyword: 'music', size: 20 });
            this.totalPages = pages;
            document.getElementById('totalEvents').textContent = total;
            UI.renderEvents(events, 'eventsGrid');
            if (pages > 1) document.getElementById('loadMoreBtn').style.display = 'inline-block';
        } catch {
            document.getElementById('eventsGrid').innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">⚠️</span>
                    <p>Could not load events</p>
                </div>
            `;
        }

        EventMap.loadAndPlot(this.lastQuery);
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
