const Storage = {
    KEYS: {
        FAVORITES: 'eventfinder_favorites',
        SCHEDULE: 'eventfinder_schedule',
        SESSION_SEARCH: 'eventfinder_session_search'
    },

    getFavorites() {
        try {
            const data = localStorage.getItem(this.KEYS.FAVORITES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    },

    saveFavorites(favorites) {
        localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
    },

    addFavorite(event) {
        const favorites = this.getFavorites();
        const exists = favorites.find(e => e.id === event.id);
        if (!exists) {
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
            const data = sessionStorage.getItem(this.KEYS.SCHEDULE);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    },

    saveSchedule(schedule) {
        sessionStorage.setItem(this.KEYS.SCHEDULE, JSON.stringify(schedule));
    },

    addToSchedule(event) {
        const schedule = this.getSchedule();
        const exists = schedule.find(e => e.id === event.id);
        if (!exists) {
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

    getSessionSearch() {
        try {
            const data = sessionStorage.getItem(this.KEYS.SESSION_SEARCH);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            return {};
        }
    },

    saveSessionSearch(data) {
        sessionStorage.setItem(this.KEYS.SESSION_SEARCH, JSON.stringify(data));
    }
};
