const UI = {
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);font-size:1.2rem;margin-left:auto;">×</button>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    formatDate(dateStr, timeStr) {
        if (!dateStr) return 'Date TBA';
        const d = new Date(`${dateStr}T${timeStr || '00:00'}`);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            + (timeStr ? ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '');
    },

    createEventCard(event) {
        const isFav = Storage.isFavorite(event.id);
        const isSched = Storage.isScheduled(event.id);
        const isCancelled = event.status === 'cancelled';
        const card = document.createElement('div');
        card.className = `event-card${isCancelled ? ' cancelled' : ''}`;

        const statusBadge = isCancelled
            ? '<span class="status-badge cancelled">Cancelled</span>'
            : event.status === 'offsale'
                ? '<span class="status-badge offsale">Off Sale</span>'
                : '<span class="status-badge onsale">On Sale</span>';

        const venueDisplay = [event.venue, event.location].filter(Boolean).join(' · ') || 'Venue TBA';
        const priceDisplay = event.priceText
            ? `<span>💰 ${event.priceText}</span>`
            : `<span>💰 <a href="${event.url}" target="_blank" style="color:var(--primary-color);">Check site</a></span>`;

        card.innerHTML = `
            <img src="${event.image}" alt="${event.name}" class="event-image"
                 onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'">
            <div class="event-content">
                <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">
                    <span class="event-category">${event.category}${event.genre ? ` · ${event.genre}` : ''}</span>
                    ${statusBadge}
                </div>
                <h3 class="event-title">${event.name}</h3>
                <div class="event-info">
                    <span>📅 ${this.formatDate(event.date, event.time)}</span>
                    <span>📍 ${venueDisplay}</span>
                    ${priceDisplay}
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary view-btn" style="flex:1;">View Details</button>
                    <button class="btn-icon favorite-btn ${isFav ? 'active' : ''}" title="Favorite">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                    <button class="btn-icon schedule-btn ${isSched ? 'active' : ''}" title="Schedule"
                            style="background:var(--bg-secondary);border:1px solid var(--border-color);">
                        ${isSched ? '📅' : '🗓️'}
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.view-btn').addEventListener('click', () => Modal.show(event.id));

        card.querySelector('.favorite-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            if (Storage.isFavorite(event.id)) {
                Storage.removeFavorite(event.id);
                btn.classList.remove('active');
                btn.textContent = '🤍';
                this.showToast('Removed from favorites', 'success');
            } else {
                Storage.addFavorite(event);
                btn.classList.add('active');
                btn.textContent = '❤️';
                this.showToast('Added to favorites!', 'success');
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
                this.showToast('Removed from schedule', 'success');
            } else {
                Storage.addToSchedule(event);
                btn.classList.add('active');
                btn.textContent = '📅';
                this.showToast('Added to schedule!', 'success');
            }
            this.updateStats();
            this.renderSchedule();
        });

        return card;
    },

    renderEvents(events, containerId, append = false) {
        const container = document.getElementById(containerId);
        if (!append) container.innerHTML = '';

        if (!events.length && !append) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🔍</span>
                    <p>No events found</p>
                    <p class="empty-hint">Try a different search or city</p>
                </div>
            `;
            return;
        }

        events.forEach(raw => {
            const event = API.transformEvent(raw);
            container.appendChild(this.createEventCard(event));
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
                    <p class="empty-hint">Click the heart on any event to save it</p>
                </div>
            `;
            return;
        }

        favorites.forEach(event => container.appendChild(this.createEventCard(event)));
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
                    <p class="empty-hint">Add events to your schedule to track them here</p>
                </div>
            `;
            return;
        }

        schedule.forEach(event => {
            const card = this.createEventCard(event);
            const countdown = document.createElement('div');
            countdown.id = `countdown-${event.id}`;
            countdown.style.padding = '0 1.5rem 1.5rem';
            card.appendChild(countdown);
            container.appendChild(card);
            if (event.date) {
                Countdown.render(`${event.date}T${event.time || '00:00'}`, `countdown-${event.id}`);
            }
        });
    },

    updateStats() {
        document.getElementById('favoritesCount').textContent = Storage.getFavorites().length;
        document.getElementById('scheduledCount').textContent = Storage.getSchedule().length;
    },

    showLoading(containerId) {
        document.getElementById(containerId).innerHTML = '<div class="loading-spinner"></div>';
    }
};
