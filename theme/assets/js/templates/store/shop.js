document.addEventListener('alpine:init', () => {
    // Shop store shared between shop components
    Alpine.store('shop', {
        location: {},
        /**
         * Updates the store data
         * @param {String} property
         * @param {Array|Object|String|Number} value
         */
        updateProperty(property, value) {
            this[property] = value;
        },
    });
});
