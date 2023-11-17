window.Constants = {
    FULFILLMENT_SHIPPING: 'SHIPMENT',
    FULFILLMENT_PICKUP: 'PICKUP',
    FULFILLMENT_MANUAL: 'MANUAL',
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_CURRENCY_SYMBOL: '$',
    DEFAULT_LOCALE: 'en_US',
    DEFAULT_JS_SAFE_LOCALE: 'en-US',
    SDK_FORM_OPTION_KEY: 'option',
    SDK_FORM_MODIFIER_KEY: 'modifier',
};

window.Utils = {
/**
     * Checks if the element is in the viewport
     * @param {Object} el
     */
    isInViewport: (el) => {
        if (!el) {
            return false;
        }
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0
            && rect.left >= 0
            && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
            && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    /**
     * Checks if the element is visible in the viewport at x percent
     * @param {Object} el
     * @param {Number} percentVisible
     */
    isElementXPercentInViewport: (el, percentVisible = 50) => {
        if (!el) {
            return false;
        }
        const rect = el.getBoundingClientRect();
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight);

        return !(
            Math.floor(100 - (((rect.top >= 0 ? 0 : rect.top) / +-rect.height) * 100)) < percentVisible
            || Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
        );
    },
    /**
     * Checks if the current device is a touch device
     */
    isTouchDevice() {
        return ('ontouchstart' in window)
            || (navigator.maxTouchPoints > 0)
            || (navigator.msMaxTouchPoints > 0);
    },
    /**
     * Is it apple safari browser
     * @return {boolean}
     */
    isSafari() {
        return (typeof window !== 'undefined') && window.navigator.userAgent.includes('Safari')
            && !window.navigator.userAgent.includes('Chrome');
    },
    /**
     * Gets a value from deep nested object
     * @param {Object} obj
     * @param {String} property
     * @param {*} defaultValue
     */
    deepGet(obj, property, defaultValue) {
        return property.split('.').reduce((a = {}, v) => a[v] ?? defaultValue, obj); // eslint-disable-line
    },
    /**
     * Wait until the condition is met
     * @param {Function} condition
     * @param {Number} time
     * @param {Number} retries
     */
    waitUntil: async (condition, time = 100, retries = 8) => {
        let counter = 0;
        while (!condition() && counter <= retries) {
            await new Promise((resolve) => setTimeout(resolve, time)); // eslint-disable-line
            counter += 1;
        }
    },
    /**
     * Gets keyboard-focusable elements within a specified element
     * @param {Object|String} elementOrSelector
     * @param {Array} orderBy
     * @return {Array}
     */
    getKeyboardFocusableElements(elementOrSelector = document, orderBy = ['INPUT', 'SELECT', 'BUTTON']) {
        const element = (typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector);

        if (!element) {
            return [];
        }

        return [
            ...element.querySelectorAll(
                'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])',
            ),
        ]
            .sort((a, b) => orderBy.findIndex((value) => value === a.nodeName) - orderBy.findIndex((value) => value === b.nodeName))
            .filter((el) => !el.hasAttribute('disabled')
            && !el.getAttribute('aria-hidden')
            && el.style?.display !== 'none'
            && el.parentNode?.style?.display !== 'none'
            && !el.disabled);
    },
    /**
     * Finds the next keyboard focusable element
     * @param {Object|String} elementOrSelector
     */
    getNextFocusableElement(elementOrSelector) {
        return this.getKeyboardFocusableElements(elementOrSelector, ['INPUT', 'BUTTON'])[0];
    },
    /**
     * Converts the degrees to radians
     * @param {Number} degrees
     * @return {Number}
     */
    degreesToRadians(degrees) {
        return (Math.PI * degrees) / 180;
    },
    /**
     * Calculates distance between two coordinates
     * @params {Object} startingCoords
     * @params {Object} destinationCoords
     * @params {String} unit - 'M' is miles, 'K' is kilometers and 'N' is nautical miles
     * @return {Number}
     */
    calculateDistance(startingCoords, destinationCoords, unit = 'M') {
        const startingLat = this.degreesToRadians(startingCoords.latitude);
        const destinationLat = this.degreesToRadians(destinationCoords.latitude);
        const longDiff = this.degreesToRadians(startingCoords.longitude - destinationCoords.longitude);
        let distance = Math.sin(startingLat) * Math.sin(destinationLat) + Math.cos(startingLat) * Math.cos(destinationLat) * Math.cos(longDiff);

        if (distance > 1) {
            distance = 1;
        }

        distance = Math.acos(distance);
        distance = (distance * 180) / Math.PI;
        distance = (distance * 60) * 1.1515;

        if (unit === 'K') { distance *= 1.609344; }
        if (unit === 'N') { distance *= 0.8684; }

        return distance;
    },
    /**
     * Checks for the valid coordinates
     * @param {Object} coordinates
     * @return {Boolean}
     */
    hasValidCoordinates(coordinates = {}) {
        return (coordinates.lat && coordinates.lng) || (coordinates.latitude && coordinates.longitude);
    },
    /**
     * Formats the location with distance
     * @param {Object} location
     * @param {Object} customerCoordinates
     * @return {Object}
     */
    formatLocationWithDistance(location, customerCoordinates) {
        const store = Alpine.store('global');
        const { locale } = store;
        const unit = locale === 'en-US' ? 'M' : 'K';
        const distanceUnit = unit === 'K' ? 'km' : 'mi';
        const defaultCoordinates = Utils.hasValidCoordinates(store.customerLocale)
            ? { latitude: store.customerLocale.latitude, longitude: store.customerLocale.longitude }
            : null;
        const fromCoordinates = customerCoordinates ?? defaultCoordinates;

        if (!location || !fromCoordinates) {
            return location;
        }

        const { coordinates: toCoordinates } = location;
        const distance = this.hasValidCoordinates(toCoordinates)
            ? this.calculateDistance(fromCoordinates, toCoordinates, unit)
            : 0;
        let formattedDistance = `${distance} ${distanceUnit}`;
        if (distance > 0) {
            formattedDistance = distance > 100 ? `+100 ${distanceUnit}` : `${distance.toFixed(2)} ${distanceUnit}`;
        }
        return {
            ...location,
            formatted_distance: formattedDistance,
        };
    },
    /**
     * Finds the first location with the given fulfillment enabled
     * @param {Array} locations
     * @param {String} fulfillment
     * @return {Object|undefined}
     */
    getLocationByFulfillment(locations = [], fulfillment = Constants.FULFILLMENT_SHIPPING) {
        return fulfillment === Constants.FULFILLMENT_SHIPPING
            ? locations.find((location) => location.is_shipping_location)
            : locations.find((location) => location[fulfillment.toLowerCase()]?.enabled);
    },
    /**
     * Loads script
     * @param {String} url
     * @return {Promise}
     */
    async loadScript(url) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = url;

            script.addEventListener('load', () => {
                // The script is loaded completely
                resolve(true);
            });

            document.head.appendChild(script);
        });
    },
    /**
     * Gets currency parts
     * @param {String} locale
     * @param {String} currency
     * @param {String} display
     * @return {Array}
     */
    getCurrencyParts(locale, currency, display = 'narrowSymbol') {
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            currencyDisplay: display,
        });
        return formatter.formatToParts(99); // number doesn't matter here
    },
    /**
     * Gets currency symbol
     * @param {String} locale
     * @param {String} currency
     * @return {String}
     */
    getCurrencySymbol(locale, currency) {
        const parts = this.getCurrencyParts(locale, currency);
        return parts.find((part) => part.type === 'currency').value;
    },
    /**
     * Gets currency symbol position
     * @param {String} locale
     * @param {String} currency
     * @return {String}
     */
    getCurrencySymbolPosition(locale, currency) {
        const parts = this.getCurrencyParts(locale, currency, 'code');
        const currencyIndex = parts.findIndex((part) => part.value === currency);
        if (currencyIndex === 0) {
            return 'before';
        }
        return 'after';
    },
    /**
     * Load and set json data
     * @param {String} dataId
     */
    loadJsonDataIntoComponent(dataId) {
        const data = JSON.parse(document.getElementById(dataId)?.innerHTML ?? '{}');
        Object.keys(data).forEach((property) => {
            if (typeof data[property] !== 'undefined') {
                this[property] = data[property];
            }
        });
    },
    /**
     * Get the previous sibling element by selector name.
     * The previous element will be returned even if no selector is passed.
     * @param {Object} el
     * @param {String} selector - .class-name, #id. Optional
     * @return {Object|null} Returns the previous element or null if no match is found.
     */
    getPreviousSiblingBySelector(el, selector) {
        // Get the previous sibling element
        let sibling = el.previousElementSibling;

        if (!selector) {
            return sibling;
        }

        // If the sibling matches our selector, use it
        // If not, jump to the next sibling and continue the loop
        while (sibling && !sibling.matches(selector)) {
            if (sibling.matches(selector)) {
                return sibling;
            }
            sibling = sibling.previousElementSibling;
        }

        return sibling;
    },
    /**
     * Get the formatted selected options
     * @param {Object} formData
     * @return {Array}
     */
    getSelectedOptionsForSdk(formData = {}) {
        const formDataProperties = Object.keys(formData);
        const selectedOptions = [];

        formDataProperties.forEach((id) => {
            const { value, propertyKey } = formData[id] ?? {};
            const isValueSelected = (value && value.length) || value === true;
            if (isValueSelected && propertyKey === Constants.SDK_FORM_OPTION_KEY) {
                selectedOptions.push({ itemOptionId: id, choice: value });
            }
        });

        return selectedOptions;
    },
    /**
     * Get the formatted selected modifiers
     * @param {Object} formData
     * @return {Array}
     */
    getSelectedModifiersForSdk(formData = {}) {
        const formDataProperties = Object.keys(formData);
        const selectedModifiers = [];
        const modifierTypes = ['CHOICE', 'TEXT', 'GIFT_MESSAGE', 'GIFT_WRAP'];

        formDataProperties.forEach((id) => {
            const { value, type, propertyKey } = formData[id] ?? {};
            const isValueSelected = (value && value.length) || value === true;
            if (!isValueSelected || !modifierTypes.includes(type)) {
                return;
            }

            if (propertyKey === Constants.SDK_FORM_MODIFIER_KEY) {
                const modifierEntry = { id, type };
                if (type === 'TEXT' || type === 'GIFT_MESSAGE') {
                    modifierEntry.textEntry = value;
                } else if (type === 'CHOICE' || type === 'GIFT_WRAP') {
                    modifierEntry.choiceSelections = typeof (Alpine.raw(value)) === 'string' ? [Alpine.raw(value)] : Alpine.raw(value);
                }
                selectedModifiers.push(modifierEntry);
            }
        });

        return Alpine.raw(selectedModifiers);
    },
    /**
     * Get the list of disabled choice ids
     * @param {Object} item
     * @param {Array} options
     * @param {Array} selectedOptions
     * @return {Array}
     */
    getDisabledChoicesFromSdk(item = {}, selectedOptions = []) {
        let disabledChoices = [];

        item.item_options?.forEach((itemOption) => {
            const disabledChoicesForOption = SquareWebSDK.helpers.item.getDisabledOptionChoicesForSelectedOptions(
                item,
                itemOption,
                selectedOptions,
            );
            disabledChoices = [...disabledChoices, ...disabledChoicesForOption];
        });

        return disabledChoices;
    },
    /**
     * Delay for xx milliseconds
     * @param {Number} ms
     * @return {Promise}
     */
    delay(ms) {
        if (!ms) {
            return Promise.resolve();
        }
        return new Promise((resolve) => { setTimeout(resolve, ms); });
    },
    /**
     * Scroll window with ease-in
     * @param {Number} topPos
     * @param {Function} callback
     */
    async scrollToEaseIn(topPos, callback) {
        const yPosPerScroll = 100;
        const scrollDelay = 30;
        for (let y = 0; y <= topPos; y += yPosPerScroll) {
            window.scrollTo({ top: y, behavior: 'smooth' });
            // eslint-disable-next-line no-await-in-loop
            await Utils.delay(scrollDelay);
            if (y + yPosPerScroll > topPos && typeof callback === 'function') {
                callback();
            }
        }
    },
};
