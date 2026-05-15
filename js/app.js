class App {
    constructor() {
        this.page = 0;
        this.totalPages = 1;
        this.lastQuery = {};
        this.init();
    }

    async init() {
        Modal.init();
        EventMap.init();
        this.setupEventListeners();
        this.restoreSession();
        UI.updateStats();
        UI.renderFavorites();
        UI.renderSchedule();
        await this.loadDefault();
    }

    restoreSession() {
        const saved = Storage.getSessionSearch();
        if (saved.keyword) document.getElementById('exploreSearch').value = saved.keyword;
        if (saved.city) document.getElementById('exploreCity').value = saved.city;
        if (saved.category) document.getElementById('categoryFilter').value = saved.category;
    }

    setupEventListeners() {
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
            Storage.saveSessionSearch({});
            this.loadDefault();
        });

        document.getElementById('loadMoreBtn').addEventListener('click', () => this.loadMore());

        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                document.getElementById('navMenu').classList.remove('active');
            });
        });

        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');
            let current = '';
            
            sections.forEach(section => {
                if (window.pageYOffset >= section.offsetTop - 200) {
                    current = section.id;
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    async handleHeroSearch() {
        const keyword = document.getElementById('heroSearchInput').value.trim();
        const city = document.getElementById('heroCityInput').value.trim();
        
        if (!keyword && !city) return;
        
        document.getElementById('exploreSearch').value = keyword;
        document.getElementById('exploreCity').value = city;
        document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
        
        await this.handleSearch();
    }

    async handleSearch() {
        const keyword = document.getElementById('exploreSearch').value.trim();
        const city = document.getElementById('exploreCity').value.trim();
        const classificationId = document.getElementById('categoryFilter').value;

        this.page = 0;
        this.lastQuery = { keyword, city, classificationId };
        Storage.saveSessionSearch({ keyword, city, category: classificationId });

        document.getElementById('eventsGrid').innerHTML = '<div class="loading-spinner"></div>';
        document.getElementById('loadMoreBtn').style.display = 'none';

        try {
            const result = await API.searchEvents({ ...this.lastQuery, page: 0, size: 20 });
            this.totalPages = result.pages;
            document.getElementById('totalEvents').textContent = result.total;
            UI.renderEvents(result.events, 'eventsGrid');
            
            if (result.pages > 1) {
                document.getElementById('loadMoreBtn').style.display = 'inline-block';
            }
        } catch (error) {
            document.getElementById('eventsGrid').innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">⚠️</span>
                    <p>Failed to load events</p>
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
            const result = await API.searchEvents({ ...this.lastQuery, page: this.page, size: 20 });
            UI.renderEvents(result.events, 'eventsGrid', true);
            btn.textContent = 'Load More';
            btn.disabled = false;
            
            if (this.page + 1 >= result.pages) {
                btn.style.display = 'none';
            }
        } catch (error) {
            btn.textContent = 'Load More';
            btn.disabled = false;
        }
    }

    async loadDefault() {
        document.getElementById('eventsGrid').innerHTML = '<div class="loading-spinner"></div>';
        document.getElementById('loadMoreBtn').style.display = 'none';
        this.page = 0;
        this.lastQuery = { keyword: 'music' };

        try {
            const result = await API.searchEvents({ keyword: 'music', size: 20 });
            this.totalPages = result.pages;
            document.getElementById('totalEvents').textContent = result.total;
            UI.renderEvents(result.events, 'eventsGrid');
            
            if (result.pages > 1) {
                document.getElementById('loadMoreBtn').style.display = 'inline-block';
            }
        } catch (error) {
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
