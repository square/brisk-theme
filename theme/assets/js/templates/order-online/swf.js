document.addEventListener('alpine:init', () => {
    Alpine.store('swf', {
        selectedScheduleDate: {},
        selectedScheduleTime: {},
        
        async setEarliestDateForSchedule(schedule) {
            const earliestDateKey = Object.keys(schedule.available_times)[0];
            this.selectedScheduleDate = {
                key: earliestDateKey,
                ... schedule.available_times[earliestDateKey],
            };
            await this.setEarliestAvailableTimeForDate(this.selectedScheduleDate);
        },

        async setEarliestAvailableTimeForDate(scheduleDate) {
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
                        const availableTimes = data.available_times?.[this.selectedScheduleDate.key].times ?? [];
                        // pick first available time
                        const availableTimesKeys = Object.keys(availableTimes);
                        if (availableTimesKeys.length) {
                            this.selectedScheduleTime = availableTimes[availableTimesKeys[0]];
                        } else {
                            // set as empty if no available schedule time exists
                            this.selectedScheduleTime = {};
                        }
                    }
                });
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
                        fulfillment: globalStore.fulfillment.toLowerCase(), //TODO: switch to uppercase when fixed
                    },
                },
            }).then(async (data) => {
                await this.setEarliestDateForSchedule(data.schedule);
            });
        },
    });

    Alpine.data('swf', (dataId) => ({
        defaultSchedule: {},
        
        async init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
            
            const store = Alpine.store('swf');
            await store.setEarliestDateForSchedule(this.defaultSchedule);
        }
    }));
    
    const createLocationPickerData = () => ({
        async init() {
            await Alpine.store('swf').onFulfillmentSelected('PICKUP');
        },
    });

    const createDatePickerData = () => ({
        async init() {
            await Alpine.store('swf').onFulfillmentSelected('PICKUP');
        },
    });

    Alpine.data('datePickerData', createDatePickerData);
});
