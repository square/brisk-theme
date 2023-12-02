document.addEventListener('alpine:init', () => {
    Alpine.store('swf', {
        selectedScheduleTime: {},

        /**
         * @param label This is a display such as "Today at 2:05pm"
         * @param timestamp This is a timestamp in seconds
         * @param dateKey the date key value in yyyy-mm-dd format
         */
        setSelectedScheduleTime(label, timestamp, dateKey) {
            this.selectedScheduleTime = {
                label,
                timestamp,
                dateKey
            }
        },

        /**
         * Sets the selected schedule time to the earliest from the schedule resource
         * @param schedule Schedule resource
         */
        setEarliestScheduleTime(schedule) {
            if (schedule?.earliest_time) {
                this.setSelectedScheduleTime(
                    schedule.earliest_time.time_formatted,
                    schedule.earliest_time.time_unix,
                    Object.keys(schedule.available_times)[0]
                );
            }
        },

        /**
         * When a new fulfillment is selected, fetch a new schedule and reset scheduled time to earliest
         * @param fulfillment fulfillment constant such as PICKUP, SHIPMENT, DELIVERY
         * @returns {Promise<void>}
         */
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
                await Square.async.refreshAsyncTemplate('scheduling', {
                    schedule: data.schedule,
                });
            });
        },
    });

    Alpine.data('swf', (dataId) => ({
        defaultSchedule: {},
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            Alpine.store('swf').setEarliestScheduleTime(this.defaultSchedule);
        }
    }));
});
