const Modal = {
    element: null,
    body: null,
    countdownInterval: null,

    init() {
        this.element = document.getElementById('eventModal');
        this.body = document.getElementById('modalBody');
        
        document.getElementById('closeModal').addEventListener('click', () => this.close());
        
        this.element.addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') {
                this.close();
            }
        });
    },

    async show(eventId) {
        this.element.classList.add('active');
        this.body.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const rawEvent = await API.getEvent(eventId);
            const event = API.transformEvent(rawEvent);
            this.render(event);
        } catch (error) {
            this.body.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">⚠️</span>
                    <p>Failed to load event details</p>
                </div>
            `;
        }
    },

    render(event) {
        const isFav = Storage.isFavorite(event.id);
        const isSched = Storage.isScheduled(event.id);
        
        const venueDisplay = [event.venue, event.location].filter(Boolean).join(' · ') || 'Venue TBA';
        const priceText = event.priceText || null;

        let dateDisplay = 'Date TBA';
        if (event.date) {
            const date = new Date(`${event.date}T${event.time || '00:00'}`);
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplay = date.toLocaleDateString('en-US', dateOptions);
            if (event.time) {
                dateDisplay += ' at ' + event.time;
            }
        }

        this.body.innerHTML = `
            <img src="${event.image}" alt="${event.name}" 
                 style="width:100%;height:300px;object-fit:cover;border-radius:12px;margin-bottom:2rem;">
            <div style="text-align:center;">
                <span class="event-category">${event.category}${event.genre ? ` · ${event.genre}` : ''}</span>
                <h2 style="margin:1rem 0;font-size:1.8rem;">${event.name}</h2>
                <div style="color:var(--text-secondary);margin-bottom:2rem;">
                    <p>📅 ${dateDisplay}</p>
                    <p>📍 ${venueDisplay}</p>
                    <p>💰 ${priceText ? priceText : `<a href="${event.url}" target="_blank">Check prices</a>`}</p>
                </div>
            </div>
            <div id="modalCountdown"></div>
            ${event.info ? `<div style="background:var(--bg-secondary);padding:1.5rem;border-radius:12px;margin:1rem 0;">
                <strong>Info:</strong>
                <p style="margin-top:0.5rem;">${event.info}</p>
            </div>` : ''}
            <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.5rem;">
                <a href="${event.url}" target="_blank" class="btn btn-primary" 
                   style="flex:1;text-align:center;text-decoration:none;">
                    Get Tickets
                </a>
                <button class="btn btn-secondary" id="modalFavBtn" style="flex:1;">
                    ${isFav ? '❤️ Remove' : '🤍 Favorite'}
                </button>
                <button class="btn btn-secondary" id="modalSchedBtn" style="flex:1;">
                    ${isSched ? '📅 Remove' : '📅 Schedule'}
                </button>
            </div>
        `;

        if (event.date) {
            this.countdownInterval = Countdown.render(
                `${event.date}T${event.time || '00:00'}`, 
                'modalCountdown'
            );
        }

        document.getElementById('modalFavBtn').addEventListener('click', () => {
            if (isFav) {
                Storage.removeFavorite(event.id);
            } else {
                Storage.addFavorite(event);
            }
            UI.updateStats();
            UI.renderFavorites();
            this.close();
        });

        document.getElementById('modalSchedBtn').addEventListener('click', () => {
            if (isSched) {
                Storage.removeFromSchedule(event.id);
            } else {
                Storage.addToSchedule(event);
            }
            UI.updateStats();
            UI.renderSchedule();
            this.close();
        });
    },

    close() {
        this.element.classList.remove('active');
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }
};
