document.addEventListener('alpine:init', () => {
    const createSchedulingData = (dataId) => ({
        schedule: {},
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
        },

        /**
         * Fetch latest Schedule resource data and open the scheduling selector dialog
         * @returns {Promise<void>}
         */
        async openSchedulingDialog() {
            const globalStore = Alpine.store('global');
            const weekdays = [
                SquareTranslations.shared.week.short.sunday,
                SquareTranslations.shared.week.short.monday,
                SquareTranslations.shared.week.short.tuesday,
                SquareTranslations.shared.week.short.wednesday,
                SquareTranslations.shared.week.short.thursday,
                SquareTranslations.shared.week.short.friday,
                SquareTranslations.shared.week.short.saturday,
            ];

            let filters = {};
            if (!SquareWebSDK.cart.getActiveId()) {
                // We only provide these filters when there is no cart. When there is a cart, we use the cart schedule
                // automatically.
                filters = {
                    location_id: globalStore.locationId,
                    fulfillment: globalStore.fulfillment,
                    range: 365,
                };
            }
            await SquareWebSDK.resource.getResource({
                schedule: {
                    type: 'schedule-days',
                    filters,
                },
            }).then(async (data) => {
                this.schedule = data.schedule;
                const dates = [];
                Object.entries(this.schedule.available_times).forEach(([key, availableDate]) => {
                    const date = new Date(key);
                    const dayOfWeek = date.getUTCDay();
                    const dayOfWeekLabel = weekdays[dayOfWeek];
                    const dayOfMonthLabel = date.getUTCDate().toString();
                    dates.push({
                        key,
                        ...availableDate,
                        dayOfWeekLabel,
                        dayOfMonthLabel,
                    });
                });
                const selectedTime = Alpine.store('siteWideFulfillment').getSelectedScheduleTime();
                const templateProps = {
                    dates,
                    times: [],
                    selectedTimeId: selectedTime.timestamp.toString(),
                    selectedDateId: selectedTime.dateKey,
                };
                const dialogAction = this.$store.dialog.isDialogOpen ? 'openSecondaryDialog' : 'openPrimaryDialog';
                this.$store.dialog[dialogAction]({
                    templateUrl: 'templates/components/dialogs/scheduling-content',
                    dialogOptions: {
                        scrollable: false,
                        size: 'large',
                        showPrimaryButton: true,
                        showSecondaryButton: false,
                        disablePrimaryButton: true,
                        primaryButtonText: SquareTranslations.shared.buttons.update,
                        buttonPosition: 'footer',
                    },
                    templateProps,
                });
            });
        },
    });

    Alpine.data('scheduling', createSchedulingData);
});
