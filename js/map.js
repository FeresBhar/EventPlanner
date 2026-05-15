const EventMap = {
    instance: null,
    markers: [],

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
        this.markers.forEach(marker => {
            this.instance.removeLayer(marker);
        });
        this.markers = [];
    },

    plotEvents(events) {
        this.clearMarkers();

        const validEvents = events.filter(event => event.lat !== null && event.lng !== null);
        if (!validEvents.length) return;

        const bounds = [];

        validEvents.forEach(event => {
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

            const venueDisplay = [event.venue, event.location].filter(Boolean).join(' · ') || 'Venue TBA';
            const priceText = event.priceText || `<a href="${event.url}" target="_blank" style="color:#8b5cf6;">Check site</a>`;

            const popup = L.popup({ maxWidth: 240 }).setContent(`
                <div class="map-popup">
                    <h4>${event.name}</h4>
                    <p>📅 ${event.date || 'Date TBA'}</p>
                    <p>📍 ${venueDisplay}</p>
                    <p>💰 ${priceText}</p>
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
        if (mapStatus) mapStatus.textContent = 'Loading...';

        try {
            const pages = [0, 1, 2];
            const promises = pages.map(page => 
                API.searchEvents({ ...query, size: 50, page })
                    .catch(() => ({ events: [] }))
            );
            
            const results = await Promise.all(promises);
            const allEvents = results.flatMap(result => result.events);

            const seen = new Set();
            const uniqueEvents = allEvents.filter(event => {
                if (seen.has(event.id)) return false;
                seen.add(event.id);
                return true;
            });

            const transformedEvents = uniqueEvents.map(event => API.transformEvent(event));
            this.plotEvents(transformedEvents);

            const withCoords = transformedEvents.filter(e => e.lat !== null).length;
            if (mapStatus) mapStatus.textContent = `${withCoords} locations`;
        } catch (error) {
            if (mapStatus) mapStatus.textContent = '';
        }
    }
};
