document.addEventListener('alpine:init', () => {
    const { UITooltip } = window;

    const createCategoriesFilterDropdownData = () => ({
        isDropdownVisible: false,
        /**
         * Initial events
         */
        init() {
            this.$nextTick(() => {
                UITooltip.createPopper(this.$refs.categoriesButton, this.$refs.tooltip, { placement: 'bottom-start' });
            });
            this.$watch('$store.global.isMobile', (isMobile) => {
                if (isMobile && this.isDropdownVisible) {
                    this.toggleDropdown(false);
                }
            });
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
         * Disable the apply button if no filters are selected
         * @return {Boolean}
         */
        shouldDisableApplyButton() {
            const categoryIds = Object.values(this.categoriesValue).flat();
            return !categoryIds.length && !this.getCurrentCategoriesCount();
        },
        /**
         * Resets the categories selection
         */
        resetCategoriesFilters() {
            this.categoriesValue = {};
        },
    });

    const createSelectAllOptionData = (dataId) => ({
        parentId: null,
        options: [],
        categoryIds: [],
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.categoryIds = Object.values(this.options)
                .filter((option) => !option.hasSubCategories)
                .map((option) => option.value);

            this.$watch('model', (value) => {
                const selectedCount = this.getSelectedIdsCount(this.parentId);
                if (value && selectedCount < this.categoryIds.length) {
                    this.categoriesValue[this.parentId] = this.categoryIds;
                } else if (!value && selectedCount === this.categoryIds.length) {
                    this.categoriesValue[this.parentId] = [];
                }
            });

            this.$watch('categoriesValue', (value) => {
                if (value[this.parentId]) {
                    const selectedCount = this.getSelectedIdsCount(this.parentId);

                    if (!this.model && selectedCount === this.categoryIds.length) {
                        this.model = true;
                    } else if (this.model && selectedCount < this.categoryIds.length) {
                        this.model = false;
                    }
                }
            });
        },
        /**
         * Select all checkbox classes
         * @param {String} id
         * @return {Object}
         */
        getSelectAllClasses(id) {
            const optionsCount = this.categoryIds.length;
            const selectedCount = this.getSelectedIdsCount(id);
            return {
                'filters__category-select-all--partial': selectedCount > 0 && selectedCount < optionsCount,
            };
        },
    });

    const createCategoryFilterOptionData = (dataId) => ({
        parentId: null,
        optionValue: null,
        options: [],
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            if (this.currentValue.category_ids?.length) {
                this.setDefaultValues(this.currentValue.category_ids.split(','));
            }

            this.$watch('model', (value) => {
                let ids = this.categoriesValue[this.parentId] ?? [];
                ids = ids.filter((id) => Number(id) !== Number(this.optionValue));

                if (value) {
                    ids.push(this.optionValue);
                }

                this.categoriesValue[this.parentId] = [...new Set(ids)];
            });

            this.$watch('categoriesValue', (value) => {
                this.model = value[this.parentId]?.includes(this.optionValue);
            });
        },
        /**
         * Set default values
         */
        setDefaultValues(categoryIds = []) {
            const optionValues = this.options.map((option) => Number(option.value));
            const selectedCategoryIds = categoryIds.filter((id) => optionValues.includes(Number(id)));
            const isParentSelected = categoryIds.some((id) => Number(id) === Number(this.parentId));

            if (isParentSelected || selectedCategoryIds?.length) {
                this.categoriesValue[this.parentId] = selectedCategoryIds;
                this.model = selectedCategoryIds.includes(this.optionValue);
            }
        },
    });

    const createCategoryFilterButtonData = (level = 0) => ({
        /**
         * Drill in to sub categories pane
         * @param {Number} categoryId
         */
        navigateToSubCategories(categoryId) {
            if (categoryId && level < 2 && document.getElementById(`pane_${categoryId}`)) {
                this.updateCurrentPane(categoryId);
            }
        },
    });

    Alpine.data('categoriesFilterDropdown', createCategoriesFilterDropdownData);
    Alpine.data('categoriesSelectAllOption', createSelectAllOptionData);
    Alpine.data('categoryFilterOption', createCategoryFilterOptionData);
    Alpine.data('categoryFilterButton', createCategoryFilterButtonData);
});
