document.addEventListener('alpine:init', () => {
    Alpine.store('order-online-fulfillment', {
        schedule: {},
        selectedScheduleDate: {},
        selectedScheduleTime: {},
        availableTimes: {},

        /**
         * 
         * @param {string} fulfillment
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
                        fulfillment: globalStore.fulfillment.toLowerCase(),
                    },
                },
            }).then(async (data) => {
                console.log(data);
                this.schedule = data.schedule;
                const earliestDateKey = Object.keys(this.schedule.available_times)[0];
                const earliestScheduleDate = {
                    key: earliestDateKey,
                    ... this.schedule.available_times[earliestDateKey],
                };
                await this.onScheduleDateSelected(earliestScheduleDate);
            });
        },

        /**
         * 
         * @param {Object} scheduleDate
         */
        async onScheduleDateSelected(scheduleDate) {
            this.selectedScheduleDate = scheduleDate;
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
                        this.availableTimes = data.available_times?.[this.selectedScheduleDate.key].times ?? [];
                    }
                });
            
            // pick first available time
            if (Object.keys(this.availableTimes).length) {
                const earliestTimeOnDate = this.availableTimes[Object.keys(this.availableTimes)[0]];
                await this.onScheduleTimeSelected(earliestTimeOnDate);
            } else {
                // set as empty if no available schedule time exists
                this.selectedScheduleTime = {};
            }
        },

        /**
         * Apply the schedule time to cart
         * @param {Object} scheduleTime
         */
        async onScheduleTimeSelected(scheduleTime) {
            this.selectedScheduleTime = scheduleTime;
            const timeISOString = new Date(this.selectedScheduleTime.time_unix * 1000).toISOString();
            
            // no-op for now since only ASAP has been implemented
        },
    });

    const createDatePickerData = () => ({
        firstData: {},
        secondData: {},
        thirdData: {},
        fourthData: {},
        sample: "12345",
        async init() {
            await Alpine.store('order-online-fulfillment').onFulfillmentSelected('PICKUP');
            this.firstData = Alpine.store('order-online-fulfillment').schedule;
            this.secondData = Alpine.store('order-online-fulfillment').selectedScheduleDate;
            this.thirdData = Alpine.store('order-online-fulfillment').selectedScheduleTime;
            this.fourthData = Alpine.store('order-online-fulfillment').availableTimes;
        },
    });

    Alpine.data('datePickerData', createDatePickerData);
});
