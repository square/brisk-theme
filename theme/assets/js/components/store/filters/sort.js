document.addEventListener('alpine:init', () => {
    const { UITooltip } = window;

    const createSortFilterData = () => ({
        isDropdownVisible: false,
        /**
         * Initial events
         */
        init() {
            if (this.$refs.tooltip) {
                this.$nextTick(() => {
                    UITooltip.createPopper(this.$refs.sortButton, this.$refs.tooltip, { placement: 'bottom-end' });
                });
            }

            this.$watch('$store.global.isMobile', (isMobile) => {
                if (isMobile && this.isDropdownVisible) {
                    this.toggleDropdown(false);

                    if (!this.$store.dialog.isDialogOpen) {
                        this.openSortDialog();
                    }
                }
            });
        },
        /**
         * Toggle dropdown on desktop or open the sort dialog on mobile
         */
        handleSortButtonClick() {
            if (!Alpine.store('global').isMobile) {
                this.toggleDropdown(!this.isDropdownVisible);
            } else if (!this.$store.dialog.isDialogOpen) {
                this.openSortDialog();
            }
        },
        /**
         * Close the sort dropdown
         * @param {Boolean} isVisible
         */
        closeSortDropdown() {
            if (!Alpine.store('global').isMobile) {
                this.toggleDropdown(false);
            }
        },
        /**
         * Toggle dropdown
         * @param {Boolean} show
         */
        toggleDropdown(show = true) {
            this.isDropdownVisible = show;
            UITooltip.toggleTooltip(this.$refs.tooltip, show);
        },
        /**
         * Get sort label
         * @return {String}
         */
        getSortByLabel() {
            const sortOption = this.sortOptions.find((option) => option.value === this.sortValue);
            return this.translations.sortByLabel.replace('{{sortValue}}', sortOption?.label ?? this.sortOptions[0].label);
        },
        /**
         * Open the sort dialog
         */
        openSortDialog() {
            this.$store.dialog.openPrimaryDialog({
                templateUrl: 'templates/components/dialogs/sort-content',
                dialogOptions: {
                    scrollable: false,
                    size: 'large',
                    showCloseButton: true,
                    showPrimaryButton: true,
                    showSecondaryButton: true,
                    disablePrimaryButton: true,
                    primaryButtonText: this.translations.buttonUpdate,
                    buttonPosition: 'header',
                },
                templateProps: {
                    sort_options: this.sortOptions,
                    current_value: this.sortValue,
                },
            });
        },
    });

    const createSortOptionsData = () => ({
        /**
         * Initial events
         */
        init() {
            this.model = this.sortValue;
            this.$store.dialog.onClose = (isConfirmed) => {
                if (isConfirmed) {
                    Alpine.store('global').goToPage(this.getPageUrl({ ...this.getCurrentPageQuery(), page: 1 }));
                } else {
                    this.sortValue = this.model;
                }
            };
        },
        /**
         * Radio input change event
         * @param {String} value
         */
        onRadioInputChange(value) {
            if (this.$store.dialog.isDialogOpen) {
                Alpine.store('dialog').updateDialogOptions('disablePrimaryButton', this.model === value);
            } else {
                Alpine.store('global').goToPage(this.getPageUrl({ ...this.getCurrentPageQuery(), page: 1 }));
            }
        },
    });

    Alpine.data('sortFilter', createSortFilterData);
    Alpine.data('sortOptions', createSortOptionsData);
});
