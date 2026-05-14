const Storage = {
    KEYS: {
        FAVORITES: 'eventfinder_favorites',
        SCHEDULE: 'eventfinder_schedule',
        THEME: 'eventfinder_theme',
        SESSION_SEARCH: 'eventfinder_session_search'
    },

    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.FAVORITES)) || [];
        } catch { return []; }
    },

    saveFavorites(favorites) {
        localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
    },

    addFavorite(event) {
        const favorites = this.getFavorites();
        if (!favorites.find(e => e.id === event.id)) {
            favorites.push(event);
            this.saveFavorites(favorites);
            return true;
        }
        return false;
    },

    removeFavorite(eventId) {
        const favorites = this.getFavorites().filter(e => e.id !== eventId);
        this.saveFavorites(favorites);
    },

    isFavorite(eventId) {
        return this.getFavorites().some(e => e.id === eventId);
    },

    getSchedule() {
        try {
            return JSON.parse(sessionStorage.getItem(this.KEYS.SCHEDULE)) || [];
        } catch { return []; }
    },

    saveSchedule(schedule) {
        sessionStorage.setItem(this.KEYS.SCHEDULE, JSON.stringify(schedule));
    },

    addToSchedule(event) {
        const schedule = this.getSchedule();
        if (!schedule.find(e => e.id === event.id)) {
            schedule.push(event);
            this.saveSchedule(schedule);
            return true;
        }
        return false;
    },

    removeFromSchedule(eventId) {
        const schedule = this.getSchedule().filter(e => e.id !== eventId);
        this.saveSchedule(schedule);
    },

    isScheduled(eventId) {
        return this.getSchedule().some(e => e.id === eventId);
    },

    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'dark';
    },

    saveTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },

    getSessionSearch() {
        try {
            return JSON.parse(sessionStorage.getItem(this.KEYS.SESSION_SEARCH)) || {};
        } catch { return {}; }
    },

    saveSessionSearch(data) {
        sessionStorage.setItem(this.KEYS.SESSION_SEARCH, JSON.stringify(data));
    }
};
