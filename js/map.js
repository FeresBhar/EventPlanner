const EventMap = {
    instance: null,
    markers: [],
    markerCluster: null,

    init() {
        this.instance = L.map('eventsMap', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18
        }).addTo(this.instance);
    },

    clearMarkers() {
        this.markers.forEach(m => this.instance.removeLayer(m));
        this.markers = [];
    },

    plotEvents(events) {
        this.clearMarkers();

        const valid = events.filter(e => e.lat !== null && e.lng !== null);
        if (!valid.length) return;

        const bounds = [];

        valid.forEach(event => {
            const icon = L.divIcon({
                className: '',
                html: `<div style="
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                    width: 28px;
                    height: 28px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 2px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                "></div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 28],
                popupAnchor: [0, -32]
            });

            const priceText = event.priceText
                || `<a href="${event.url}" target="_blank" style="color:#8b5cf6;">Check site</a>`;
            const venueDisplay = [event.venue, event.location].filter(Boolean).join(' · ') || 'Venue TBA';

            const popup = L.popup({ maxWidth: 240 }).setContent(`
                <div class="map-popup">
                    <img src="${event.image}" alt="${event.name}" onerror="this.style.display='none'">
                    <h4>${event.name}</h4>
                    <p>📅 ${event.date || 'Date TBA'}</p>
                    <p>📍 ${venueDisplay}</p>
                    <p>💰 ${priceText}</p>
                    <a href="${event.url}" target="_blank">Get Tickets →</a>
                </div>
            `);

            const marker = L.marker([event.lat, event.lng], { icon }).bindPopup(popup);
            marker.addTo(this.instance);
            this.markers.push(marker);
            bounds.push([event.lat, event.lng]);
        });

        if (bounds.length) {
            this.instance.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
        }
    },

    async loadAndPlot(query) {
        const mapStatus = document.getElementById('mapStatus');
        if (mapStatus) mapStatus.textContent = 'Loading map data…';

        try {
            const pages = [0, 1, 2, 3];
            const results = await Promise.all(
                pages.map(p => API.searchEvents({ ...query, size: 50, page: p })
                    .catch(() => ({ events: [] }))
                )
            );

            const allRaw = results.flatMap(r => r.events);
            const seen = new Set();
            const unique = allRaw.filter(e => {
                if (seen.has(e.id)) return false;
                seen.add(e.id);
                return true;
            });

            const transformed = unique.map(e => API.transformEvent(e));
            this.plotEvents(transformed);

            const withCoords = transformed.filter(e => e.lat !== null).length;
            if (mapStatus) mapStatus.textContent = `Showing ${withCoords} event locations`;
        } catch {
            if (mapStatus) mapStatus.textContent = '';
        }
    }
};
