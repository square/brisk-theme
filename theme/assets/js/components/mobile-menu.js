document.addEventListener('alpine:init', () => {
    const createMobileMenuData = () => ({
        flyoutName: 'mobile-menu',
        classes: {},
        init() {
            Alpine.effect(() => {
                this.classes = {
                    active: this.$store.flyout.activeFlyout === this.flyoutName,
                };
            });
        },
        /**
         * Closes the mobile menu
         */
        closeMobileMenu() {
            this.$store.flyout.closeFlyouts();
        },
    });

    Alpine.data('mobileMenu', createMobileMenuData);
});
