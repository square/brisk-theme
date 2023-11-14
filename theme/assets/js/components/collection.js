window.onCollectionReady = () => {
    const { Utils } = window;

    const createCollectionData = () => ({
        formData: {},
        formDataId: null,
        timeout: null,
        itemsStatus: {},
        clickedItemId: null,
        focusedItemId: null,
        collectionImageHeight: 0,
        scrollOffset: 0,
        isDragging: false,
        /**
         * Initial events
         */
        init() {
            this.updateCollectionImageHeight();
            this.setScrollOffset(this.$store.global.isMobile);

            this.$watch('$store.global.isMobile', (isMobile) => {
                this.setScrollOffset(isMobile);
            });
        },
        /**
         * Sets scroll offset
         * @param {Boolean} isMobile
         */
        setScrollOffset(isMobile = false) {
            if (isMobile) {
                this.scrollOffset = 32; // this should match var(--theme-container-padding)
            } else {
                this.scrollOffset = 0;
            }
        },
        /**
         * Quick add item
         * @param {Object} item
         */
        async quickAddItem(item) {
            if (!item) {
                return;
            }
            const itemId = item.square_online_id;
            const formData = this.formData[this.formDataId];
            const availableFields = Object.keys(this.quickAddRendererToOptionId);
            const selectedFields = availableFields.filter((field) => formData[this.quickAddRendererToOptionId[field]]?.value);
            const allFieldsSelected = selectedFields.length && availableFields.length === selectedFields.length;

            // Wait until all fields are selected then quick add
            if (allFieldsSelected) {
                const variationsInStockForChoices = SquareWebSDK.helpers.item.getInStockVariationsForSelectedOptionsOrVariation({
                    item,
                    selectedOptions: Utils.getSelectedOptionsForSdk(formData),
                });
                const firstVariation = variationsInStockForChoices[0];

                if (firstVariation) {
                    this.itemsStatus[itemId] = {
                        loading: true,
                        complete: false,
                    };

                    try {
                        await Alpine.store('cart').addToCart({
                            itemId: item.id,
                            variationId: firstVariation.id,
                            quantity: 1,
                        });
                        this.itemsStatus[itemId].complete = true;
                    } catch (e) {
                        this.itemsStatus[itemId].failed = true;
                    } finally {
                        this.itemsStatus[itemId].loading = false;
                    }
                }
            }
        },
        /**
         * Checks if an item is being added to cart
         * @param {String} id
         * @return {Boolean}
         */
        isAddingItemToCart(id) {
            return this.itemsStatus[id]?.loading;
        },
        /**
         * Checks if an item added to cart
         * @param {String} id
         * @return {Boolean}
         */
        isItemAddedToCart(id) {
            return this.itemsStatus[id]?.complete;
        },
        /**
         * Checks if an item failed to add
         * @param {String} id
         * @return {Boolean}
         */
        isItemFailedToAdd(id) {
            return this.itemsStatus[id]?.failed;
        },
        /**
         * Show the item status if an item is being added, succesfully added, or failed to add
         * @param {String} id
         * @return {Boolean}
         */
        shouldShowItemStatus(id) {
            return this.isAddingItemToCart(id)
                || this.isItemAddedToCart(id)
                || this.isItemFailedToAdd(id);
        },
        /**
         * Show the quick add on desktop only
         * @return {Boolean}
         */
        shouldShowQuickAdd(id) {
            return !Alpine.store('global').isMobile && !this.shouldShowItemStatus(id);
        },
        /**
         * Item clicked event
         * isDragging can be set from the parent element to prevent click while dragging items
         * @param {String} id
         */
        onItemClicked(event, id) {
            if (!event.target.closest('.collection__tile-size') && event.target.tagName === 'INPUT' && !this.isDragging) {
                // Remember the last clicked item id to skip the focus event
                this.clickedItemId = id;
            } else if (!event.target.closest('.collection__tile-quick-add')) {
                Alpine.store('global').goToPage(this.$el.getAttribute('data-href'));
            }
        },
        /**
         * Set focused item id
         * @param {String} id
         */
        onItemFocused(id) {
            if (!this.clickedItemId) {
                this.focusedItemId = id;
            }
        },
        /**
         * Unset focused item id
         */
        onItemBlur() {
            this.focusedItemId = null;
            this.clickedItemId = null;
        },
        /**
         * Checks if the current item is focused
         * @param {String} id
         * @return {Boolean}
         */
        isItemFocused(id) {
            return this.focusedItemId === id;
        },
        /**
         * Get the collection tile image height and apply to the featured tile image
         */
        updateCollectionImageHeight() {
            this.collectionImageHeight = this.$el?.querySelector('.collection__tile-image')?.offsetHeight ?? 0;
        },

    });

    const createCollectionTileData = (dataId) => ({
        item: {},
        quickAddKey: null,
        optionId: null,
        options: [],
        quickAddRendererToOptionId: {},
        disabledChoices: [],
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            const itemId = this.item.square_online_id;

            this.optionId = this.quickAddRendererToOptionId[this.quickAddKey];
            this.resetFormData(itemId);

            this.$watch('model', (value) => {
                this.formDataId = itemId;
                if (!this.optionId?.length) {
                    // eslint-disable-next-line
                    console.error('option id is empty');
                    return;
                }
                this.formData[itemId][this.optionId].value = value;
                this.$nextTick(async () => {
                    await this.quickAddItem(this.item);
                    if (this.shouldShowItemStatus(itemId)) {
                        this.onQuickAddComplete(itemId);
                    }
                });
            });
            this.$watch('formData', () => {
                if (this.formDataId === itemId && this.formData[itemId]) {
                    this.resetModel(itemId);
                }
                this.$nextTick(() => {
                    this.disabledChoices = Utils.getDisabledChoicesFromSdk(
                        this.item,
                        Utils.getSelectedOptionsForSdk(this.formData[itemId]),
                    );
                });
            });

            if (this.model !== this.formData[itemId][this.optionId].value) {
                this.formData[itemId][this.optionId].value = this.model;
            }
        },
        /**
         * Resets model
         */
        resetModel(itemId) {
            const formDataValue = Utils.deepGet(this.formData, `${itemId}.${this.optionId}.value`, '');
            if (this.model?.length && !formDataValue.length) {
                this.model = '';
            }
        },
        /**
         * Resets formData
         * @param {String} itemId
         */
        resetFormData(itemId) {
            Object.values(this.quickAddRendererToOptionId).forEach((optionId) => {
                this.formData[itemId] = {
                    ...this.formData?.[itemId] ?? {},
                    [optionId]: { value: '', propertyKey: Constants.SDK_FORM_OPTION_KEY },
                };
            });
        },
        /**
         * Callback after an item is added to cart
         * @param {String} itemId
         */
        onQuickAddComplete(itemId) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.itemsStatus[itemId] = {};
                this.resetFormData(itemId);
            }, 2000);
        },
    });

    Alpine.data('collection', createCollectionData);
    Alpine.data('collectionTile', createCollectionTileData);
};

document.addEventListener('alpine:init', window.onCollectionReady);

document.addEventListener('async:alpine:init', window.onCollectionReady);
