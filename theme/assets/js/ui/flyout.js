document.addEventListener('alpine:init', () => {
    // Simply keep a track of one active flyout, open one at a time, if one is opened then close the others
    Alpine.store('flyout', {
        activeFlyout: null,
        onClose: () => {},
        /**
         * Opens the flyout
         * @param {Object} flyoutOptions
         * @param {Object} templateProps
         */
        openFlyout(name) {
            this.activeFlyout = name;
            Alpine.store('global').onOverlayToggle(true, `[flyout-name="${name}"]`);
        },
        /**
         * Closes all flyouts
         */
        async closeFlyouts() {
            const store = Alpine.store('flyout');
            store.activeFlyout = null;
            store.onClose();
            Alpine.store('global').onOverlayToggle(false);
        },
    });
});
