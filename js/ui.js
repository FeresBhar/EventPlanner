const UI = {
    formatDate(dateStr, timeStr) {
        if (!dateStr) return 'Date TBA';
        
        const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', dateOptions);
        
        if (timeStr) {
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
            return `${formattedDate} · ${formattedTime}`;
        }
        
        return formattedDate;
    },

    createEventCard(event) {
        const isFav = Storage.isFavorite(event.id);
        const isSched = Storage.isScheduled(event.id);
        
        const card = document.createElement('div');
        card.className = 'event-card';

        const venueDisplay = [event.venue, event.location].filter(Boolean).join(' · ') || 'Venue TBA';
        const priceDisplay = event.priceText
            ? `<span>💰 ${event.priceText}</span>`
            : `<span>💰 <a href="${event.url}" target="_blank">Check site</a></span>`;

        card.innerHTML = `
            <img src="${event.image}" alt="${event.name}" class="event-image"
                 onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'">
            <div class="event-content">
                <span class="event-category">${event.category}${event.genre ? ` · ${event.genre}` : ''}</span>
                <h3 class="event-title">${event.name}</h3>
                <div class="event-info">
                    <span>📅 ${this.formatDate(event.date, event.time)}</span>
                    <span>📍 ${venueDisplay}</span>
                    ${priceDisplay}
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary view-btn" style="flex:1;">Details</button>
                    <button class="btn-icon favorite-btn ${isFav ? 'active' : ''}" title="Favorite">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                    <button class="btn-icon schedule-btn ${isSched ? 'active' : ''}" title="Schedule">
                        ${isSched ? '📅' : '🗓️'}
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.view-btn').addEventListener('click', () => {
            Modal.show(event.id);
        });

        card.querySelector('.favorite-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            if (Storage.isFavorite(event.id)) {
                Storage.removeFavorite(event.id);
                btn.classList.remove('active');
                btn.textContent = '🤍';
            } else {
                Storage.addFavorite(event);
                btn.classList.add('active');
                btn.textContent = '❤️';
            }
            this.updateStats();
            this.renderFavorites();
        });

        card.querySelector('.schedule-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            if (Storage.isScheduled(event.id)) {
                Storage.removeFromSchedule(event.id);
                btn.classList.remove('active');
                btn.textContent = '🗓️';
            } else {
                Storage.addToSchedule(event);
                btn.classList.add('active');
                btn.textContent = '📅';
            }
            this.updateStats();
            this.renderSchedule();
        });

        return card;
    },

    renderEvents(events, containerId, append = false) {
        const container = document.getElementById(containerId);
        if (!append) {
            container.innerHTML = '';
        }

        if (!events.length && !append) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🔍</span>
                    <p>No events found</p>
                </div>
            `;
            return;
        }

        events.forEach(rawEvent => {
            const event = API.transformEvent(rawEvent);
            const card = this.createEventCard(event);
            container.appendChild(card);
        });
    },

    renderFavorites() {
        const favorites = Storage.getFavorites();
        const container = document.getElementById('favoritesGrid');
        container.innerHTML = '';

        if (!favorites.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">❤️</span>
                    <p>No favorites yet</p>
                </div>
            `;
            return;
        }

        favorites.forEach(event => {
            const card = this.createEventCard(event);
            container.appendChild(card);
        });
    },

    renderSchedule() {
        const schedule = Storage.getSchedule();
        const container = document.getElementById('scheduleGrid');
        container.innerHTML = '';

        if (!schedule.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📅</span>
                    <p>No events scheduled</p>
                </div>
            `;
            return;
        }

        schedule.forEach(event => {
            const card = this.createEventCard(event);
            
            if (event.date) {
                const countdown = document.createElement('div');
                countdown.id = `countdown-${event.id}`;
                countdown.style.padding = '0 1.5rem 1.5rem';
                card.appendChild(countdown);
                Countdown.render(`${event.date}T${event.time || '00:00'}`, countdown.id);
            }
            
            container.appendChild(card);
        });
    },

    updateStats() {
        document.getElementById('favoritesCount').textContent = Storage.getFavorites().length;
        document.getElementById('scheduledCount').textContent = Storage.getSchedule().length;
    }
};
