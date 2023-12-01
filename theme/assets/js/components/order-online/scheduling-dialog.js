document.addEventListener('alpine:init', () => {
    const createSchedulingDialogData = (dataId) => ({
        dates: [],
        selectedDate: {},
        selectedTimeId: '',
        selectedDateId: '',
        async init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            if (this.selectedDateId) {
                this.selectedDate = this.dates.find((date) => date.key == this.selectedDateId);
            } else {
                this.selectedDate = this.dates[0];
            }

            await this.fetchAvailableTimes(this.selectedDate);

            this.$store.dialog.onClose = (isConfirmed) => {
                if (isConfirmed) {
                    const time = this.times.find((time) => time.time_unix == this.selectedTimeId)
                    if (time) {
                        Alpine.store('swf').selectedScheduleTime = time;
                    }
                }
            };
        },

        async fetchAvailableTimes(scheduleDate) {
            const availableTimesUrl = scheduleDate.href;
            const config = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            await fetch(availableTimesUrl, config)
                .then(async (response) => (response.ok ? response.text() : '{}'))
                .then(async (text) => {
                    const { data } = JSON.parse(text);
                    if (data) {
                        const dateKey = Object.keys(data.available_times)[0];
                        this.times = data.available_times?.[dateKey].times ?? [];
                        if (Boolean(Square.async.templates['schedule-selector'])) {
                            await Square.async.refreshAsyncTemplate('schedule-selector', {
                                times: this.times,
                            });
                        }
                    }
                });
        }
    });

    const createDateSelectionData = (dataId) => ({
        async init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.$watch('model', (value) => {
                const scheduleDate = this.dates.find((date) => date.key === value);
                this.fetchAvailableTimes(scheduleDate);
            });
        },
    });

    Alpine.data('schedulingDialog', createSchedulingDialogData);
    Alpine.data('dateSelection', createDateSelectionData);
});
