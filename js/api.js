const API = {
    KEY: (typeof CONFIG !== 'undefined' && CONFIG.TICKETMASTER_API_KEY) || '',
    BASE: 'https://app.ticketmaster.com/discovery/v2',

    // Rough bounding boxes per country name for coordinate sanity check
    COUNTRY_BOUNDS: {
        'France':           { latMin: 41.0, latMax: 51.5, lngMin: -5.5,  lngMax: 10.0  },
        'United States':    { latMin: 24.0, latMax: 50.0, lngMin: -125.0, lngMax: -66.0 },
        'United Kingdom':   { latMin: 49.5, latMax: 61.0, lngMin: -8.5,  lngMax: 2.0   },
        'Germany':          { latMin: 47.0, latMax: 55.5, lngMin: 5.5,   lngMax: 15.5  },
        'Spain':            { latMin: 35.5, latMax: 44.0, lngMin: -9.5,  lngMax: 4.5   },
        'Italy':            { latMin: 36.5, latMax: 47.5, lngMin: 6.5,   lngMax: 18.5  },
        'Canada':           { latMin: 41.5, latMax: 70.0, lngMin: -141.0, lngMax: -52.0 },
        'Australia':        { latMin: -44.0, latMax: -10.0, lngMin: 113.0, lngMax: 154.0 },
        'Japan':            { latMin: 24.0, latMax: 46.0, lngMin: 122.0, lngMax: 146.0 },
        'Netherlands':      { latMin: 50.5, latMax: 53.5, lngMin: 3.0,   lngMax: 7.5   },
        'Belgium':          { latMin: 49.5, latMax: 51.5, lngMin: 2.5,   lngMax: 6.5   },
        'Mexico':           { latMin: 14.5, latMax: 33.0, lngMin: -118.0, lngMax: -86.5 },
        'Brazil':           { latMin: -34.0, latMax: 5.5, lngMin: -74.0, lngMax: -34.0 },
        'Sweden':           { latMin: 55.0, latMax: 69.5, lngMin: 10.5,  lngMax: 24.5  },
        'Norway':           { latMin: 57.5, latMax: 71.5, lngMin: 4.0,   lngMax: 31.5  },
        'Denmark':          { latMin: 54.5, latMax: 58.0, lngMin: 8.0,   lngMax: 15.5  },
        'Poland':           { latMin: 49.0, latMax: 55.0, lngMin: 14.0,  lngMax: 24.5  },
        'Portugal':         { latMin: 36.5, latMax: 42.5, lngMin: -9.5,  lngMax: -6.0  },
        'Switzerland':      { latMin: 45.5, latMax: 48.0, lngMin: 5.5,   lngMax: 10.5  },
        'Austria':          { latMin: 46.5, latMax: 49.0, lngMin: 9.5,   lngMax: 17.5  },
        'New Zealand':      { latMin: -47.5, latMax: -34.0, lngMin: 166.0, lngMax: 178.5 },
        'Ireland':          { latMin: 51.0, latMax: 55.5, lngMin: -10.5, lngMax: -6.0  },
        'Argentina':        { latMin: -55.0, latMax: -21.5, lngMin: -73.5, lngMax: -53.5 },
        'South Africa':     { latMin: -35.0, latMax: -22.0, lngMin: 16.5, lngMax: 33.0  },
    },

    isCoordValid(lat, lng, countryName) {
        // Reject null island and clearly bogus zeros
        if (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01) return false;
        // Reject out-of-range values
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;

        const bounds = this.COUNTRY_BOUNDS[countryName];
        if (!bounds) return true; // no bounds defined, accept it

        return (
            lat >= bounds.latMin && lat <= bounds.latMax &&
            lng >= bounds.lngMin && lng <= bounds.lngMax
        );
    },

    async searchEvents({ keyword = '', city = '', classificationId = '', size = 20, page = 0, showCancelled = false } = {}) {
        const now = new Date();
        const start = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
        const end = new Date(now);
        end.setMonth(end.getMonth() + 6);
        const endStr = end.toISOString().replace(/\.\d{3}Z$/, 'Z');

        const params = new URLSearchParams({
            apikey: this.KEY,
            size,
            page,
            sort: 'date,asc',
            startDateTime: start,
            endDateTime: endStr,
            includeTBA: 'yes',
            includeTBD: 'yes'
        });

        if (keyword) params.append('keyword', keyword);
        if (city) params.append('city', city);
        if (classificationId) params.append('classificationId', classificationId);

        const res = await fetch(`${this.BASE}/events.json?${params}`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();

        let events = data._embedded?.events || [];
        if (!showCancelled) {
            events = events.filter(e => (e.dates?.status?.code || '') !== 'cancelled');
        }

        return {
            events,
            total: data.page?.totalElements || 0,
            pages: data.page?.totalPages || 1
        };
    },

    async getEvent(id) {
        const params = new URLSearchParams({ apikey: this.KEY });
        const res = await fetch(`${this.BASE}/events/${id}.json?${params}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },

    async getFeaturedEvents() {
        return this.searchEvents({ keyword: 'festival', size: 6 });
    },

    transformEvent(raw) {
        const date = raw.dates?.start?.localDate || '';
        const time = raw.dates?.start?.localTime || '';
        const venue = raw._embedded?.venues?.[0];
        const image = raw.images?.sort((a, b) => (b.width || 0) - (a.width || 0))
                          .find(i => i.ratio === '16_9') || raw.images?.[0];
        const priceRange = raw.priceRanges?.[0];
        const classification = raw.classifications?.[0];

        const venueName  = venue?.name || '';
        const cityName   = venue?.city?.name || '';
        const stateName  = venue?.state?.name || '';
        const countryName = venue?.country?.name || '';
        const locationParts = [cityName, stateName || countryName].filter(Boolean);

        const rawLat = parseFloat(venue?.location?.latitude);
        const rawLng = parseFloat(venue?.location?.longitude);
        const coordOk = !isNaN(rawLat) && !isNaN(rawLng)
            && this.isCoordValid(rawLat, rawLng, countryName);

        let priceText = null;
        if (priceRange) {
            const min = priceRange.min != null ? `$${priceRange.min.toFixed(0)}` : null;
            const max = priceRange.max != null ? `$${priceRange.max.toFixed(0)}` : null;
            if (min && max && min !== max) priceText = `${min} – ${max}`;
            else if (min) priceText = `From ${min}`;
        }

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
            location: locationParts.join(', '),
            category: classification?.segment?.name || 'Event',
            genre: classification?.genre?.name || '',
            status: raw.dates?.status?.code || 'onsale',
            url: raw.url || '#',
            priceText,
            info: raw.info || raw.pleaseNote || '',
            lat: coordOk ? rawLat : null,
            lng: coordOk ? rawLng : null
        };
    }
};
