document.addEventListener('alpine:init', () => {
    const { UITooltip } = window;

    const createPaginationUIData = (dataId) => ({
        translations: {},
        currentPage: { value: 1 },
        totalPages: 1,
        perPage: { value: 1 },
        /**
         * Initial events (We can't use `init()` b/c it'll get overwritten by the block data)
         */
        initPaginationUI() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
        },
        /**
         * Back button click event
         */
        backButtonClick() {
            if (this.currentPage.value > 1) {
                this.currentPage.value = parseInt(this.currentPage.value, 10) - 1;
            }
        },
        /**
         * Forward button click event
         */
        forwardButtonClick() {
            if (this.currentPage.value < this.totalPages) {
                this.currentPage.value = parseInt(this.currentPage.value, 10) + 1;
            }
        },
    });

    const createPaginationButtonUIData = (id) => ({
        dropdown: document.querySelector(`#${id}`),
        isDropdownVisible: false,
        /**
         * initial events
         */
        init() {
            UITooltip.createPopper(this.$el, this.dropdown);
            this.$watch('isDropdownVisible', (isVisible) => {
                UITooltip.toggleTooltip(this.dropdown, isVisible);

                if (isVisible) {
                    this.dropdown.querySelector('[role="listbox"]')?.focus({ focusVisible: true });
                } else {
                    this.$refs.paginationButton?.focus({ focusVisible: true });
                }
            });
        },
        /**
         * Toggles the dropdown
         * @param {Boolean} show
         */
        toggleDropdown(show = true) {
            this.isDropdownVisible = show;
        },
    });

    const createPaginationDropdownUIData = (property) => ({
        property,
        /**
         * Initial events
         */
        init() {
            this.$watch('currentPage', () => {
                this.refreshPagesDropdown();
            });

            this.$watch('perPage', () => {
                this.toggleDropdown(false);
            });

            this.$watch('totalPages', () => {
                this.refreshPagesDropdown();
            });
        },
        /**
         * Reloads the pages dropdown
         */
        async refreshPagesDropdown() {
            const items = [];

            for (let i = 1; i <= this.totalPages; i += 1) {
                const label = this.translations.perPageLabel
                    .replace('{{currentPage}}', i)
                    .replace('{{totalPages}}', this.totalPages);
                items.push({ label, value: i });
            }

            const paginationDropdown = document.querySelector('#pagination-tooltip-menu');
            if (paginationDropdown) {
                await Utils.refreshTemplate({
                    template: 'partials/components/tooltip-menu',
                    props: {
                        items,
                        selectedItem: this.currentPage,
                        menuTriggerRef: 'paginationButton',
                    },
                    el: paginationDropdown,
                });
            }

            this.isDropdownVisible = false;
        },
    });

    Alpine.data('paginationUI', createPaginationUIData);
    Alpine.data('paginationButtonUI', createPaginationButtonUIData);
    Alpine.data('paginationDropdownUI', createPaginationDropdownUIData);
});
