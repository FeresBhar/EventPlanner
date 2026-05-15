const API = {
    KEY: (typeof CONFIG !== 'undefined' && CONFIG.TICKETMASTER_API_KEY) || '',
    BASE: 'https://app.ticketmaster.com/discovery/v2',

    isCoordValid(lat, lng) {
        if (!lat || !lng) return false;
        if (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01) return false;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
        return true;
    },

    async searchEvents({ keyword = '', city = '', classificationId = '', size = 20, page = 0 } = {}) {
        const now = new Date();
        const start = now.toISOString().split('.')[0] + 'Z';
        const end = new Date(now.setMonth(now.getMonth() + 6));
        const endStr = end.toISOString().split('.')[0] + 'Z';

        const params = new URLSearchParams({
            apikey: this.KEY,
            size,
            page,
            sort: 'date,asc',
            startDateTime: start,
            endDateTime: endStr
        });

        if (keyword) params.append('keyword', keyword);
        if (city) params.append('city', city);
        if (classificationId) params.append('classificationId', classificationId);

        const response = await fetch(`${this.BASE}/events.json?${params}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        const events = data._embedded?.events || [];

        return {
            events,
            total: data.page?.totalElements || 0,
            pages: data.page?.totalPages || 1
        };
    },

    async getEvent(id) {
        const params = new URLSearchParams({ apikey: this.KEY });
        const response = await fetch(`${this.BASE}/events/${id}.json?${params}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return response.json();
    },

    transformEvent(raw) {
        const date = raw.dates?.start?.localDate || '';
        const time = raw.dates?.start?.localTime || '';
        const venue = raw._embedded?.venues?.[0];
        const classification = raw.classifications?.[0];
        
        const images = raw.images || [];
        const image = images.find(img => img.ratio === '16_9') || images[0];
        
        const priceRange = raw.priceRanges?.[0];
        let priceText = null;
        if (priceRange) {
            const min = priceRange.min ? `$${priceRange.min.toFixed(0)}` : null;
            const max = priceRange.max ? `$${priceRange.max.toFixed(0)}` : null;
            if (min && max && min !== max) {
                priceText = `${min} – ${max}`;
            } else if (min) {
                priceText = `From ${min}`;
            }
        }

        const venueName = venue?.name || '';
        const cityName = venue?.city?.name || '';
        const stateName = venue?.state?.name || '';
        const countryName = venue?.country?.name || '';
        const location = [cityName, stateName || countryName].filter(Boolean).join(', ');

        const lat = parseFloat(venue?.location?.latitude);
        const lng = parseFloat(venue?.location?.longitude);
        const hasValidCoords = this.isCoordValid(lat, lng);

        return {
            id: raw.id,
            name: raw.name,
            date,
            time,
            image: image?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
            venue: venueName,
            city: cityName,
            state: stateName,
            country: countryName,
            location,
            category: classification?.segment?.name || 'Event',
            genre: classification?.genre?.name || '',
            status: raw.dates?.status?.code || 'onsale',
            url: raw.url || '#',
            priceText,
            info: raw.info || raw.pleaseNote || '',
            lat: hasValidCoords ? lat : null,
            lng: hasValidCoords ? lng : null
        };
    }
};
