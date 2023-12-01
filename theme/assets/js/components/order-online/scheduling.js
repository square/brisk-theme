document.addEventListener('alpine:init', () => {
    const createSchedulingData = (dataId) => ({
        translations: {},
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
        },

        async openSchedulingDialog() {
            // const globalStore = Alpine.store('global');
            // await SquareWebSDK.resource.getResource({
            //     schedule: {
            //         type: 'schedule',
            //         filters: {
            //             location_id: globalStore.locationId,
            //             fulfillment: globalStore.fulfillment,
            //         },
            //     },
            // }).then(async (data) => {
            //     const dates = [];
            //     for (const [key, availableDate] of Object.entries(data.schedule.available_times)) {
            //         const date = new Date(key);
            //         const dayOfWeek = date.getUTCDay();
            //         const dayOfWeekLabel = this.translations.weekdays[dayOfWeek];
            //         const dayOfMonthLabel = date.getUTCDate().toString();
            //         dates.push({
            //             key,
            //             ...availableDate,
            //             dayOfWeekLabel,
            //             dayOfMonthLabel,
            //         });
            //     }
            //     const selectedTime = Alpine.store('swf').selectedScheduleTime.time_unix;
            //     const props = {
            //         dates,
            //         times: [],
            //         selectedTimeId: selectedTime.toString(),
            //         selectedDateId: new Date(selectedTime * 1000).toISOString().split('T')[0],
            //     };
            //     this.$store.dialog.openPrimaryDialog('templates/components/dialogs/scheduling-content', {
            //         scrollable: false,
            //         size: 'large',
            //         showPrimaryButton: true,
            //         showSecondaryButton: true,
            //         disablePrimaryButton: true,
            //         primaryButtonText: 'Update',
            //         secondaryButtonText: 'Cancel',
            //         buttonPosition: 'header',
            //     }, props);
            // });
        },
    });

    Alpine.data('scheduling', createSchedulingData);
});
