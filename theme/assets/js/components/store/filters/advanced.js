document.addEventListener('alpine:init', () => {
    const { UITooltip } = window;

    const createAdvancedFilterData = (dataId) => ({
        chooseLocationTemplateId: null,
        currentValue: {},
        parentCategory: {},
        categoryHierarchy: [],
        sortOptions: [],
        filtersDialogProps: {},
        advancedFilterValues: {},
        advancedFilterOptionSets: [],
        advancedFilterPriceRange: {},
        categoriesValue: {},
        isBackButtonVisible: false,
        isDropdownVisible: false,
        defaultCategoryPaneId: 0,
        currentPane: null,
        /**
         * Initial events
         */
        async init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            const globalStore = Alpine.store('global');
            if (this.$store.dialog.isDialogOpen && globalStore.getHistory('advancedFilters')) {
                this.currentValue = globalStore.getHistory('advancedFilters');
            }

            this.$nextTick(() => this.setCurrentValues());

            this.$watch('shouldDisableApplyButton()', (value) => {
                if (this.$store.dialog.isDialogOpen) {
                    Alpine.store('dialog').updateDialogOptions('disablePrimaryButton', value);
                }
            });

            this.$store.dialog.onClose = (isConfirmed) => {
                this.clearCachedSelection();
                if (isConfirmed) {
                    this.applyFilters();
                }
            };

            window.addEventListener('beforeunload', () => {
                this.clearCachedSelection();
            });
        },
        /**
         * Set default states
         */
        setCurrentValues() {
            if (this.currentValue.fulfillments?.length) {
                const fulfillments = this.currentValue.fulfillments.split(',');
                fulfillments.forEach((fulfillment) => {
                    this.advancedFilterValues[fulfillment] = true;
                });
            }
            const locationId = Alpine.store('shop').locationId ?? this.currentValue.location_id;
            if (locationId) {
                Alpine.store('shop').updateProperty('locationId', locationId);
                Alpine.store('global').getLocations({
                    filters: { id: locationId },
                }).then(() => {
                    if (this.isAdvancedFiltersVisible()) {
                        this.reloadChooseLocationButton(locationId);
                    }
                });
            }
            if (this.currentValue.item_status?.length) {
                const itemStatus = this.currentValue.item_status.split(',');
                itemStatus.forEach((status) => {
                    this.advancedFilterValues[status] = true;
                });
            }
            if (this.currentValue.option_choices?.length) {
                this.advancedFilterOptionSets = this.currentValue.option_choices.split(',');
            }
            if (this.currentValue.price_min?.length || this.currentValue.price_max?.length) {
                if (Number(this.currentValue.price_min) > 0) {
                    this.advancedFilterPriceRange.min = Number(this.currentValue.price_min);
                }
                if (Number(this.currentValue.price_max) > 0) {
                    this.advancedFilterPriceRange.max = Number(this.currentValue.price_max);
                }
            }

            if (this.parentCategory?.square_online_id) {
                this.defaultCategoryPaneId = this.parentCategory.square_online_id;
            }

            this.currentPane = this.defaultCategoryPaneId;
        },
        /**
         * Map categories to parent category
         * @return {Object}
         */
        mapCategoriesToParent() {
            const categoriesToParent = {};
            this.categoryHierarchy.forEach((mainCategory) => {
                if (this.parentCategory?.square_online_id) {
                    categoriesToParent[`id_${mainCategory.square_online_id}`] = this.parentCategory.square_online_id;
                }
                if (mainCategory.children?.length) {
                    mainCategory.children.forEach((category) => {
                        categoriesToParent[`id_${category.square_online_id}`] = mainCategory.square_online_id;

                        if (category.children?.length) {
                            category.children.forEach((child) => {
                                categoriesToParent[`id_${child.square_online_id}`] = category.square_online_id;
                            });
                        }
                    });
                }
            });
            return categoriesToParent;
        },
        /**
         * Categories with a children are not selectable and automatically added to the query
         * when its child is selected so get the selectable category ids
         * @return {Array}
         */
        getSelectableCategoryIds() {
            const selectableCategoryIds = [];
            this.categoryHierarchy.forEach((mainCategory) => {
                if (this.parentCategory?.square_online_id && !mainCategory.children?.length) {
                    selectableCategoryIds.push(mainCategory.square_online_id);
                }
                if (mainCategory.children?.length) {
                    mainCategory.children.forEach((category) => {
                        if (category.children?.length) {
                            category.children.forEach((child) => {
                                if (child.children?.length) {
                                    child.children.forEach((subChild) => {
                                        selectableCategoryIds.push(subChild.square_online_id);
                                    });
                                } else {
                                    selectableCategoryIds.push(child.square_online_id);
                                }
                            });
                        } else {
                            selectableCategoryIds.push(category.square_online_id);
                        }
                    });
                } else {
                    selectableCategoryIds.push(mainCategory.square_online_id);
                }
            });
            return selectableCategoryIds;
        },
        /**
         * Animate back to the parent level
         */
        backToParentLevel() {
            const parentPane = this.mapCategoriesToParent()[`id_${this.currentPane}`];
            this.updateCurrentPane(parentPane ?? this.defaultCategoryPaneId);
        },
        /**
         * Get the total number of selected ids
         * @param {Number} parentId
         * @return {Number}
         */
        getSelectedIdsCount(parentId) {
            if (this.categoriesValue[parentId]) {
                // 0 means the categories are at top level
                if (parentId === 0) {
                    return Object.values(this.categoriesValue[parentId]).length;
                }
                return Object.values(this.categoriesValue[parentId])
                    .filter((selectedId) => this.getSelectableCategoryIds().includes(selectedId)).length;
            }
            return 0;
        },
        /**
         * Get the selected sub categories count
         * @param {Number} parentId
         * @return {String}
         */
        getSubCategoriesCount(parentId) {
            const total = this.getSelectedIdsCount(parentId);
            return total > 0 ? `(${this.translations.subCategoriesCount.replace('{{total}}', total)})` : '';
        },
        /**
         * Update current pane
         * @param {String} pane
         */
        updateCurrentPane(pane) {
            this.currentPane = pane;
            this.$nextTick(() => {
                this.isBackButtonVisible = Number(pane) !== Number(this.defaultCategoryPaneId);
            });
        },
        /**
         * Fetch location and update the choose location button with the location address
         * @param {String} locationId
         */
        reloadChooseLocationButton(locationId) {
            const location = Alpine.store('global').locations?.find((loc) => loc.id === locationId) ?? {};
            if (locationId && !this.advancedFilterValues[Constants.FULFILLMENT_PICKUP]) {
                this.advancedFilterValues[Constants.FULFILLMENT_PICKUP] = true;
            }
            const chooseLocationLink = document.querySelector(`#${this.chooseLocationTemplateId}`);
            if (Object.values(location).length && chooseLocationLink) {
                Utils.refreshTemplate({
                    template: 'partials/components/store/filters/choose-location-link',
                    props: {
                        location,
                        action: 'openChooseLocation()',
                    },
                    el: chooseLocationLink,
                });
            }
        },
        /**
         * Checks if the advanced filter options are visible
         * @return {Boolean}
         */
        isAdvancedFiltersVisible() {
            return Alpine.store('global').isMobile
                ? Alpine.store('dialog').isDialogOpen
                : this.isDropdownVisible;
        },
        /**
         * Checks if the pickup location is selected
         * @return {Boolean}
         */
        hasPickupLocationSelected() {
            return Alpine.store('shop').locationId?.length;
        },
        /**
         * Disable the apply button if no filters are selected
         * @return {Boolean}
         */
        shouldDisableApplyButton() {
            if (this.$store.dialog.isDialogOpen) {
                return !this.getAllSelectedFiltersCount() && !this.getAppliedFiltersCount() && !this.getCurrentCategoriesCount();
            }
            return !this.getSelectedFiltersCount() && !this.getAppliedFiltersCount();
        },
        /**
         * Cache selection before opening the secondary dialog
         */
        cacheLastSelection() {
            const globalStore = Alpine.store('global');
            const { searchParams } = new URL(this.getPageUrl(this.getPageQuery()));
            globalStore.updateHistory('advancedFilters', Object.fromEntries(searchParams));
        },
        /**
         * Clear the cached selection before closing the dialog
         */
        clearCachedSelection() {
            const globalStore = Alpine.store('global');
            globalStore.updateHistory('advancedFilters', null);
        },
        /**
         * Opens locations dialog
         */
        openChooseLocation() {
            const templateProps = {
                fulfillment: Constants.FULFILLMENT_PICKUP,
                locationId: Alpine.store('shop').locationId,
                locations: [],
                alpine_store_name: 'shop',
            };
            const dialogAction = this.$store.dialog.isDialogOpen ? 'openSecondaryDialog' : 'openPrimaryDialog';

            if (this.$store.dialog.isDialogOpen) {
                this.cacheLastSelection();
            }

            this.$store.dialog[dialogAction]({
                templateUrl: 'templates/components/dialogs/locations-content',
                dialogOptions: {
                    scrollable: false,
                    size: 'large',
                    showPrimaryButton: true,
                    showSecondaryButton: true,
                    disablePrimaryButton: true,
                    primaryButtonText: 'Update',
                    buttonPosition: 'header',
                },
                templateProps,
            });
        },
        /**
         * Gets currently applied filters count
         * @return {Number}
         */
        getAppliedFiltersCount() {
            const selectedValues = [
                this.currentValue.location_id,
                ...[this.currentValue.fulfillments?.split(',') ?? []],
                ...[this.currentValue.item_status?.split(',') ?? []],
                ...[this.currentValue.option_choices?.split(',') ?? []],
                this.currentValue.price_min,
                this.currentValue.price_max,
            ].filter((value) => {
                if (typeof value === 'boolean') {
                    return Boolean(value);
                }
                if (Number(value)) {
                    return Number(value) > 0;
                }
                return value?.length;
            });
            return selectedValues.length;
        },
        /**
         * Gets current categories count
         * @return {Number}
         */
        getCurrentCategoriesCount() {
            const selectedValues = this.currentValue.category_ids?.split(',')?.filter((selectedId) => this.getSelectableCategoryIds().includes(selectedId)) ?? [];
            return selectedValues.length;
        },
        /**
         * Gets selected filters count
         * @return {Number}
         */
        getSelectedFiltersCount() {
            const selectedValues = [
                ...Object.values(this.advancedFilterValues).filter((bool) => bool),
                ...Object.values(this.advancedFilterOptionSets).filter((value) => value?.length),
            ];
            const isPriceRangeValid = !this.advancedFilterPriceRange.min
                || !this.advancedFilterPriceRange.max
                || Number(this.advancedFilterPriceRange.min) < Number(this.advancedFilterPriceRange.max);

            if (isPriceRangeValid) {
                selectedValues.push(...Object.values(this.advancedFilterPriceRange).filter((price) => Number(price) > 0));
            }

            return selectedValues.length;
        },
        /**
         * Gets selected categories count
         * @return {Number}
         */
        getSelectedCategoriesCount() {
            const selectedValues = Object.values(this.categoriesValue).flat()
                .filter((categoryId) => this.getSelectableCategoryIds().includes(categoryId));
            return selectedValues.length;
        },
        /**
         * Gets all selected filters and categories count
         * @return {Number}
         */
        getAllSelectedFiltersCount() {
            return this.getSelectedFiltersCount() + this.getSelectedCategoriesCount();
        },
        /**
         * Gets the translated string for selected filters count
         * @return {String}
         */
        getAllSelectedFiltersCountText() {
            return this.translations.selectedCount.replace('{{total}}', this.getAllSelectedFiltersCount());
        },
        /**
         * Resets the advanced filters selection
         */
        resetAdvancedFilters() {
            this.advancedFilterValues = {};
            this.advancedFilterOptionSets = [];
            this.advancedFilterPriceRange = {};

            if (Alpine.store('shop').locationId?.length) {
                Alpine.store('shop').updateProperty('locationId', '');
            }
        },
        /**
         * Resets the advanced/categories filters selection
         */
        resetAdvancedFiltersAndCategories() {
            this.resetAdvancedFilters();
            this.categoriesValue = {};
        },
        /**
         * Gets page query
         * @return {Object}
         */
        getPageQuery() {
            const pageProps = {
                ...this.getCurrentPageQuery(),
                fulfillments: [],
                locationId: '',
                isOnSale: false,
                isInStock: false,
                choiceIds: [],
                priceMin: 0,
                priceMax: 0,
                categoryIds: [],
                page: 1,
            };

            const globalOptionValues = Object.values(this.advancedFilterOptionSets);

            if (this.advancedFilterValues[Constants.FULFILLMENT_SHIPPING]) {
                pageProps.fulfillments.push(Constants.FULFILLMENT_SHIPPING);
            }
            if (this.advancedFilterValues[Constants.FULFILLMENT_PICKUP]) {
                pageProps.fulfillments.push(Constants.FULFILLMENT_PICKUP);

                if (Alpine.store('shop').locationId?.length) {
                    pageProps.locationId = Alpine.store('shop').locationId;
                }
            }
            if (this.advancedFilterValues.on_sale) {
                pageProps.isOnSale = true;
            }
            if (this.advancedFilterValues.in_stock) {
                pageProps.isInStock = true;
            }
            if (globalOptionValues.length) {
                pageProps.choiceIds = globalOptionValues;
            }
            if (Object.values(this.advancedFilterPriceRange).length) {
                if (Number(this.advancedFilterPriceRange.min) > 0) {
                    pageProps.priceMin = Number(this.advancedFilterPriceRange.min);
                }
                if (Number(this.advancedFilterPriceRange.max) > 0
                    && Number(this.advancedFilterPriceRange.max) > Number(this.advancedFilterPriceRange.min)) {
                    pageProps.priceMax = Number(this.advancedFilterPriceRange.max);
                }
            }
            const categoryIds = Object.values(this.categoriesValue).flat();
            Object.keys(this.categoriesValue).forEach((parentId) => {
                const isNotMainCategory = Number(parentId) !== Number(this.defaultCategoryPaneId);
                const hasSubCategoriesSelected = this.categoriesValue[parentId]?.length;

                // Auto-select a parent category if its sub category is selected
                if (isNotMainCategory && !categoryIds.includes(parentId) && hasSubCategoriesSelected) {
                    categoryIds.push(parentId);
                }
            });
            pageProps.categoryIds = categoryIds;
            return pageProps;
        },
        /**
         * Reload the page with the filters query
         */
        applyFilters() {
            Alpine.store('global').goToPage(this.getPageUrl(this.getPageQuery()));
        },
        /**
         * Category option hover event
         */
        onCategoryOptionHover() {
            const sibling = Utils.getPreviousSiblingBySelector(this.$el, '.filters__category-option');

            if (sibling) {
                sibling.classList.add('filters__category-option--hide-divider');
            }
        },
        /**
         * Category option blur event
         */
        onCategoryOptionBlur() {
            const siblingElements = this.$el.parentNode.querySelectorAll('.filters__category-option--hide-divider');
            siblingElements.forEach((element) => {
                element.classList.remove('filters__category-option--hide-divider');
            });
        },
    });

    const createAdvancedFilterDropdownData = () => ({
        /**
         * Initial events
         */
        async init() {
            this.$nextTick(() => {
                if (this.$refs.tooltip) {
                    UITooltip.createPopper(this.$refs.advancedButton, this.$refs.tooltip, { placement: 'bottom-start' });
                }
            });
            this.$watch('$store.global.isMobile', (isMobile) => {
                if (isMobile && this.isDropdownVisible) {
                    this.toggleDropdown(false);

                    if (!this.$store.dialog.isDialogOpen) {
                        this.openAdvancedFiltersDialog();
                    }
                }
            });
        },
        /**
         * Toggle dropdown on desktop or open the filters dialog on mobile
         */
        handleFiltersButtonClick() {
            if (!Alpine.store('global').isMobile) {
                this.toggleDropdown(!this.isDropdownVisible);
            } else if (!this.$store.dialog.isDialogOpen) {
                this.openAdvancedFiltersDialog();
            }
        },
        /**
         * Close the filters dropdown
         * @param {Boolean} isVisible
         */
        closeAdvancedFiltersDropdown() {
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
         * Open the advanced filters dialog
         */
        openAdvancedFiltersDialog() {
            this.$store.dialog.openPrimaryDialog({
                templateUrl: 'templates/components/dialogs/advanced-filters-content',
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
                templateProps: this.filtersDialogProps,
            });
        },
    });

    const createAdvancedFilterOptionData = (property) => ({
        property,
        /**
         * Initial events
         */
        init() {
            if (this.property === Constants.FULFILLMENT_PICKUP) {
                this.$watch('$store.shop.locationId', (locationId) => {
                    if (this.isAdvancedFiltersVisible()) {
                        this.reloadChooseLocationButton(locationId);
                    }
                });
                this.$watch('isDropdownVisible', () => {
                    if (this.isAdvancedFiltersVisible() && this.$store.shop.locationId) {
                        this.reloadChooseLocationButton(this.$store.shop.locationId);
                    }
                });
            }
            this.$watch('advancedFilterValues', (value) => {
                this.model = Boolean(value[this.property]);
            });
            this.$watch('model', (value) => {
                this.advancedFilterValues[this.property] = value;
            });
        },
    });

    Alpine.data('advancedFilter', createAdvancedFilterData);
    Alpine.data('advancedFilterDropdown', createAdvancedFilterDropdownData);
    Alpine.data('advancedFilterOption', createAdvancedFilterOptionData);
});
