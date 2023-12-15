document.addEventListener('alpine:init', () => {
    const { UITooltip } = window;
    const headerSlideUpThreshold = 300;
    const optionalConfigId = 'header-optional-config';

    const createHeaderData = (dataId) => ({
        currentlyDisplayedLink: null,
        maxColumns: 4,
        navLinks: {},
        lastScrollPosition: window.scrollY,
        isHeaderVisible: true,
        isMegaMenuFocused: false,
        lastFocusedNavItem: null,
        showUnderline: true,
        isScrolledDown: false,
        isMiniCartOpen: false,
        scrollTimeout: null,
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
            Utils.loadJsonDataIntoComponent.call(this, optionalConfigId);
            Alpine.store('global').getCustomerCoordinates();
            this.storeOwnHeight();
            this.$watch('isMegaMenuVisible()', (value) => {
                Alpine.store('global').isMegaMenuVisible = value;
            });
        },
        headerClasses() {
            return {
                'is-scrolled': this.isScrolledDown,
                'is-showing-megamenu': this.isMegaMenuVisible(),
            };
        },
        openSearch() {
            this.$store.dialog.openPrimaryDialog({
                templateUrl: 'templates/components/dialogs/search-content',
                dialogOptions: {
                    variant: 'halfsheet',
                    transition: 'down',
                    scrollable: true,
                    showCloseButton: false,
                },
            });
        },
        /**
         * Store the height of the header element in the global store for reference
         */
        storeOwnHeight() {
            this.$nextTick(() => {
                const headerHeight = this.$el.offsetHeight;
                Alpine.store('global').updateProperty('headerHeight', headerHeight);
            });
        },
        /**
         * Fires when the window is scrolled down (at a throttled interval)
        */
        onScroll() {
            if (Alpine.store('global').isPageScrollDisabled) {
                return;
            }
            if (window.scrollY > 0) {
                this.isScrolledDown = true;
            } else {
                // If we're at top of page, simply reset
                this.isScrolledDown = false;
                this.isHeaderVisible = true;
                this.lastScrollPosition = window.scrollY;
                return;
            }

            // evaluate scroll position
            if (window.scrollY < headerSlideUpThreshold || window.scrollY < this.lastScrollPosition) {
                this.isHeaderVisible = true;
            } else {
                this.isHeaderVisible = false;
            }
            this.lastScrollPosition = window.scrollY;

            // Fire a debounced scroll 250ms after the last callback,
            // in case user has scrolled to top in-between callbacks
            if (this.isScrolledDown) {
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    if (window.scrollY === 0) {
                        this.onScroll();
                    }
                }, 250);
            }
        },
        /**
         * When a link is hovered, show the children from that nav in the megamenu
         * @param {String} linkTitle - the 'title' property of the nav link
        */
        onMouseEnter(linkTitle) {
            // Get the children of the link that was hovered, display them
            const link = this.navLinks[linkTitle];
            this.displayLinkInMegaMenu(link);
            this.isMegaMenuFocused = false;
        },
        /**
         * When a link is no longer hovered, close the megamenu
        */
        onMouseLeave() {
            if (!this.isMegaMenuFocused) {
                this.closeMegaMenuWithDelay();
            }
        },
        /**
         * When navigating with tabs, open the megamenu
         * @param {Event} e
         */
        onKeyboardTab(e) {
            if (this.isMegaMenuVisible()) {
                this.lastFocusedNavItem = e.target;
                this.isMegaMenuFocused = true;
                document.querySelector('.mega-menu').focus({ focusVisible: true });
            } else {
                this.isMegaMenuFocused = false;
            }
        },
        /**
         * When navigating away from the last menu item, re-focus its parent nav item
         * @param {Event} e
         */
        onMegaMenuItemTab(e) {
            if (!e.shiftKey) {
                const links = document.querySelectorAll('.mega-menu a');
                // Focus the nav item
                if (e.target === links[links.length - 1] && this.lastFocusedNavItem) {
                    this.lastFocusedNavItem.focus({ focusVisible: true });
                }
            }
        },
        /**
         * Display the data for a given Nav Link in the Megamenu
         * @param {Object} link - the nav link
        */
        displayLinkInMegaMenu(link) {
            this.cancelDelayedMegaMenuClose();
            this.currentlyDisplayedLink = link;
        },
        /**
         * Close the mega menu
        */
        closeMegaMenu() {
            this.displayLinkInMegaMenu(null);
        },
        /**
         * Close the mega menu after a delay
        */
        closeMegaMenuWithDelay() {
            this.cancelDelayedMegaMenuClose();
            this.megamenuCloseTimer = setTimeout(() => this.closeMegaMenu(), 600);
        },
        /**
         * If the megamenu is about to be closed, cancels the upcoming close
         */
        cancelDelayedMegaMenuClose() {
            if (this.megamenuCloseTimer) {
                clearTimeout(this.megamenuCloseTimer);
            }
        },
        /**
         * @return {Boolean} whether the Megamenu should be displayed or not
         */
        isMegaMenuVisible() {
            return Boolean(this.currentlyDisplayedLink?.children);
        },
        /**
         * generates a title for a navigation link, with truncation if necessary
         * @param {Object} link navigation link
         * @param {Boolean} truncate
         * @return {String} link title
         */
        generateTitle(link, truncate = false) {
            const title = link.title;
            return truncate
                ? title.slice(0, 30)
                : title;
        },
        /**
         * Open the Mobile Menu flyout
         */
        openMobileMenu() {
            this.$store.dialog.openPrimaryDialog({
                templateUrl: 'templates/components/dialogs/mobile-menu-content',
                dialogOptions: {
                    variant: 'flyout',
                    transition: 'left',
                    scrollable: true,
                    showCloseButton: false,
                },
                templateProps: { nav_links: this.navLinks },
            });
        },
    });

    const createHeaderMiniCartData = (dataId) => ({
        dropdownId: null,
        dropdown: null,
        cartUrl: null,
        isMiniCartClicked: false,
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.dropdown = document.querySelector(`#${this.dropdownId}`);

            if (this.$refs.miniCartTrigger && this.dropdown) {
                UITooltip.createPopper(this.$refs.miniCartTrigger, this.dropdown, {
                    placement: 'bottom-start',
                });
            }
            this.$watch('$store.cart.isMiniCartOpen', (isOpen) => {
                UITooltip.toggleTooltip(this.dropdown, isOpen);
            });

            this.$watch('$store.cart.miniCartItemsTotal', () => {
                if (Alpine.store('cart').isReady) {
                    this.$refs.miniCartTrigger.classList.add('is-updated');

                    Utils.delay(5000).then(() => {
                        this.$refs.miniCartTrigger.classList.remove('is-updated');
                    });
                }
            });
        },
        onMiniCartFocus() {
            if (!this.isMiniCartClicked && this.$store.cart.miniCartItemsTotal > 0) {
                this.$store.cart.isMiniCartOpen = true;
            }
        },
        onMiniCartButtonBlur() {
            if (!this.$store.cart.isInteractingMiniCart) {
                this.$store.cart.isMiniCartOpen = false;
            }
        },
        /**
         * Open the Mini cart
         */
        openMiniCart() {
            if (!this.$store.global.isMobile) {
                this.$store.cart.isMiniCartOpen = true;
            }
        },
        closeMiniCart(event) {
            if (!event.target.closest(`#${this.dropdownId}`)) {
                this.$store.cart.isMiniCartOpen = false;
            }
        },
        goToCartPage() {
            this.isMiniCartClicked = true;
            if (this.cartUrl) {
                document.location.href = this.cartUrl;
            }
        },
    });

    Alpine.data('header', createHeaderData);
    Alpine.data('headerMiniCart', createHeaderMiniCartData);
});
