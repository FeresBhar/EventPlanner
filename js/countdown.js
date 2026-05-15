const Countdown = {
    calculate(targetDate) {
        const now = new Date().getTime();
        const target = new Date(targetDate).getTime();
        const diff = target - now;

        if (diff <= 0) {
            return { 
                days: 0, 
                hours: 0, 
                minutes: 0, 
                seconds: 0, 
                expired: true 
            };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds, expired: false };
    },

    render(targetDate, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const update = () => {
            const time = this.calculate(targetDate);
            
            if (time.expired) {
                container.innerHTML = '<p style="text-align:center;color:var(--danger-color);">Event passed</p>';
                return;
            }

            container.innerHTML = `
                <div class="countdown">
                    <div class="countdown-item">
                        <span class="countdown-value">${time.days}</span>
                        <span class="countdown-label">Days</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">${time.hours}</span>
                        <span class="countdown-label">Hours</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">${time.minutes}</span>
                        <span class="countdown-label">Minutes</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">${time.seconds}</span>
                        <span class="countdown-label">Seconds</span>
                    </div>
                </div>
            `;
        };

        update();
        const interval = setInterval(update, 1000);
        return interval;
    }
};
