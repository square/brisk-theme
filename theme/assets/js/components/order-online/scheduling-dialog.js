document.addEventListener('alpine:init', () => {
    const createSchedulingDialogData = (dataId) => ({
        dates: [],
        selectedDate: {},
        selectedTimeId: '',
        selectedDateId: '',
        times: [],
        isLoadingAvailableTimes: false,
        async init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.selectedDate = this.dates.find((date) => date.key == this.selectedDateId);
            await this.fetchAvailableTimes(this.selectedDate);

            this.$store.dialog.onClose = (isConfirmed) => {
                if (isConfirmed) {
                    const time = this.times.find((time) => time.time_unix == this.selectedTimeId)
                    if (time) {
                        Alpine.store('swf').setSelectedScheduleTime(time.time_formatted, time.time_unix, this.selectedDateId);
                    }
                }
            };
        },

        async fetchAvailableTimes(scheduleDate) {
            this.isLoadingAvailableTimes = true;
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
                        const times = data.available_times?.[dateKey].times ?? [];
                        if (this.getShouldFilterTimeInterval(times)) {
                            this.times = times.filter((time, index) => {
                                const isEveryThirdInterval = index % 3 === 0;
                                const isSelectedInterval = this.selectedTimeId === time.time_unix;
                                return isEveryThirdInterval || isSelectedInterval;
                            });
                        } else {
                            this.times = times;
                        }
                        if (Boolean(Square.async.templates['schedule-selector'])) {
                            await Square.async.refreshAsyncTemplate('schedule-selector', {
                                times: this.times,
                            });
                        }
                    }
                    this.isLoadingAvailableTimes = false;
                })
        },

        getShouldFilterTimeInterval(times) {
            if (times.length > 1) {
                const firstTime = times[0];
                const secondTime = times[1];

                const interval = parseInt(secondTime.time_unix, 10) - parseInt(firstTime.time_unix, 10);
                return interval > 0 && interval < 600;
            }

            return false;
        }
    });

    const createDateSelectionData = (dataId) => ({
        async init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
            
            
            this.$watch('model', (value) => {
                this.selectedDateId = value;
                const scheduleDate = this.dates.find((date) => date.key === value);
                this.fetchAvailableTimes(scheduleDate);
            });
        },
    });

    Alpine.data('schedulingDialog', createSchedulingDialogData);
    Alpine.data('dateSelection', createDateSelectionData);
});
