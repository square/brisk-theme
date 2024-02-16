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

            this.selectedDate = this.dates.find((date) => date.key === this.selectedDateId);
            await this.fetchAvailableTimes(this.selectedDate);

            this.$store.dialog.onClose = (isConfirmed) => {
                if (isConfirmed) {
                    const selectedTime = this.times.find((time) => time.time_unix.toString() === this.selectedTimeId);
                    if (selectedTime) {
                        Alpine.store('siteWideFulfillment').setSelectedScheduleTime(selectedTime.time_formatted, selectedTime.time, selectedTime.time_unix, this.selectedDateId);
                    }
                }
            };
        },

        async fetchAvailableTimes(scheduleDate) {
            this.isLoadingAvailableTimes = true;
            const globalStore = Alpine.store('global');
            await SquareWebSDK.resource.getResource({
                schedule: {
                    type: 'schedule-times',
                    filters: {
                        location_id: globalStore.locationId,
                        fulfillment: globalStore.fulfillment,
                        day: scheduleDate.key,
                        interval: '15m',
                    },
                },
            }).then(async (data) => {
                this.times = data.schedule.available_times?.[scheduleDate.key].times ?? [];
                if (Square.async.templates['schedule-selector']) {
                    await Square.async.refreshAsyncTemplate('schedule-selector', {
                        times: this.times,
                    });
                }
            }).finally(() => {
                this.isLoadingAvailableTimes = false;
            });
        },
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
