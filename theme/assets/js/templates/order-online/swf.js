document.addEventListener('alpine:init', () => {
    Alpine.store('swf', {
        selectedScheduleTime: {},

        setEarliestScheduleTime(schedule) {
            this.selectedScheduleTime = {
                time_formatted: schedule.earliest_time.time_formatted,
                time_unix: schedule.earliest_time.time_unix,
            }
        },
  
        async onFulfillmentSelected(fulfillment) {
            const globalStore = Alpine.store('global');
            globalStore.updateProperty('fulfillment', fulfillment);
            await globalStore.getLocationId(fulfillment);

            await SquareWebSDK.resource.getResource({
                schedule: {
                    type: 'schedule',
                    filters: {
                        location_id: globalStore.locationId,
                        fulfillment: globalStore.fulfillment,
                    },
                },
            }).then(async (data) => {
                this.setEarliestScheduleTime(data.schedule);
            });
        },
    });

    Alpine.data('swf', (dataId) => ({
        defaultSchedule: {},

        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            if (this.defaultSchedule?.earliest_time) {
                Alpine.store('swf').setEarliestScheduleTime(this.defaultSchedule);
            }
        }
    }));
});
