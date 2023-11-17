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
        showUnderline: true,
        isScrolledDown: false,
        isMiniCartOpen: false,
        scrollTimeout: null,
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
            Utils.loadJsonDataIntoComponent.call(this, optionalConfigId);
            Alpine.store('global').getCustomerCoordinates();
            this.storeOwnHeight();
        },
        headerClasses() {
            return {
                'is-scrolled': this.isScrolledDown,
            };
        },
        openSearch() {
            this.$store.dialog.openPrimaryDialog('templates/components/dialogs/search-content', {
                variant: 'halfsheet',
                transition: 'down',
                scrollable: true,
                showCloseButton: false,
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
            this.$store.dialog.openPrimaryDialog('templates/components/dialogs/mobile-menu-content', {
                variant: 'flyout',
                transition: 'left',
                scrollable: true,
                showCloseButton: false,
            }, { nav_links: this.navLinks });
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
