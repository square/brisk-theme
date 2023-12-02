document.addEventListener('alpine:init', () => {
    const createSchedulingData = (dataId) => ({
        translations: {},
        schedule: {},
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
        },

        async openSchedulingDialog() {
            const dates = [];
            for (const [key, availableDate] of Object.entries(this.schedule.available_times)) {
                const date = new Date(key);
                const dayOfWeek = date.getUTCDay();
                const dayOfWeekLabel = this.translations.weekdays[dayOfWeek];
                const dayOfMonthLabel = date.getUTCDate().toString();
                dates.push({
                    key,
                    ...availableDate,
                    dayOfWeekLabel,
                    dayOfMonthLabel,
                });
            }
            const selectedTime = Alpine.store('swf').selectedScheduleTime;
            const props = {
                dates,
                times: [],
                selectedTimeId: selectedTime.timestamp.toString(),
                selectedDateId: selectedTime.dateKey,
            };
            this.$store.dialog.openPrimaryDialog('templates/components/dialogs/scheduling-content', {
                scrollable: false,
                size: 'large',
                showPrimaryButton: true,
                showSecondaryButton: true,
                disablePrimaryButton: true,
                primaryButtonText: 'Update',
                secondaryButtonText: 'Cancel',
                buttonPosition: 'header',
            }, props);
        },
    });

    Alpine.data('scheduling', createSchedulingData);
});
