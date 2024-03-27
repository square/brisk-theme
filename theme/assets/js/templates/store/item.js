document.addEventListener('alpine:init', () => {
    // Product store shared between product components
    Alpine.store('product', {
        fulfillment: '',
        locationId: '',
        product: {},
        locations: [],
        formData: {},
        init() {
            window.onbeforeunload = () => {
                Alpine.store('global').updateHistory(this.product.square_online_id, this.formData);
            };
        },
        /**
         * Sets the product data
         * @param {Object} product
         */
        setProduct(product) {
            this.product = product;
        },
        /**
         * Sets the locations data
         * @param {Array} locations
         */
        setLocations(locations) {
            this.locations = locations;
        },
        /**
         * Updates the store data
         * @param {String} property
         * @param {Array|Object|String|Number} value
         */
        updateProperty(property, value) {
            this[property] = value;
        },
    });

    const createProductPageData = (fulfillment = '', locationId = '') => ({
        isLoadingPrice: false,
        /**
         * Initial events
         */
        init() {
            const productStore = Alpine.store('product');
            productStore.fulfillment = fulfillment;
            productStore.locationId = locationId;
        },
        /**
         * Scroll to the product reviews section
         */
        goToProductReviews() {
            const productReviewsEl = document.querySelector('.product-reviews');
            if (productReviewsEl) {
                Utils.scrollToEaseIn(productReviewsEl.offsetTop, () => {
                    const nextFocusableElement = Utils.getNextFocusableElement('.product-reviews');
                    if (nextFocusableElement) {
                        setTimeout(() => {
                            this.$nextTick(nextFocusableElement.focus({ focusVisible: true }));
                        }, 1000);
                    }
                });
            }
        },
        /**
         * Toggles the add to cart button
         * @param {Object} $el
         * @param {Boolean} disabled
         */
        toggleAddToCartButton($el, disabled) {
            const buttons = $el.getElementsByTagName('button');
            Object.values(buttons).forEach((button) => {
                const buttonElement = button;
                buttonElement.disabled = disabled;
            });
        },
    });

    const createProductFormData = (dataId) => ({
        translations: {},
        product: {},
        productVariations: [],
        productOptions: [],
        productModifiers: [],
        optionalChoices: ['Gift message', 'Gift wrap', 'subscription', 'donation'],
        formData: {},
        disabledChoices: [],
        invalidOptionIds: [],
        invalidModifierIds: [],
        isInvalidVariationId: false,
        invalidQuantity: false,
        isAddToCartDisabled: false,
        isAddingItemToCart: false,
        isBuyingItem: false,
        isFailedToBuy: false,
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.product = Alpine.store('product').product;
            this.productVariations = this.product.variations ?? [];
            this.productOptions = this.product.item_options ?? [];
            this.productModifiers = this.product.modifier_lists ?? [];

            // quantity
            this.formData.quantity = { value: 1 };

            // product options
            this.productOptions.forEach((item) => {
                this.formData[item.id] = { value: '', name: item.name, propertyKey: Constants.SDK_FORM_OPTION_KEY };
            });

            // product modifiers
            this.productModifiers.forEach((item) => {
                let value = '';

                switch (item.type) {
                case 'CHOICE': {
                    const canSelectSingleOption = (item.min_selected_modifiers && item.max_selected_modifiers) >= 1;
                    value = !canSelectSingleOption ? [] : '';
                    break;
                }
                case 'GIFT_WRAP':
                    value = false;
                    break;
                case 'GIFT_MESSAGE':
                case 'TEXT':
                    value = '';
                    break;
                default:
                    value = '';
                    break;
                }

                this.formData[item.id] = {
                    value, name: item.name, type: item.type, propertyKey: Constants.SDK_FORM_MODIFIER_KEY,
                };
            });

            this.$watch('formData', () => {
                this.$nextTick(() => {
                    this.onFormDataChange();
                });
            });

            this.$watch('$store.product.fulfillment', (fulfillment) => {
                const isPreorderItem = fulfillment === Constants.FULFILLMENT_PICKUP
                    && this.product.fulfillment_availability?.PICKUP?.length;
                if (isPreorderItem) {
                    this.isAddToCartDisabled = SquareWebSDK.helpers.item.isPreorderItemCutoffInThePast(this.product);
                } else {
                    this.isAddToCartDisabled = SquareWebSDK.helpers.item.isItemSoldOut(this.product);
                }
            });

            this.checkAddToCartButtonStatus();
        },
        /**
         * Disable add to cart if item is sold out, event is past, or preorder cutoff time is in the past
         */
        checkAddToCartButtonStatus() {
            const isItemSoldOut = SquareWebSDK.helpers.item.isItemSoldOut(this.product);
            const isEventItem = this.product.square_online_type === 'EVENT';
            const isPreorderItem = Alpine.store('product').fulfillment === Constants.FULFILLMENT_PICKUP
                && this.product.fulfillment_availability?.PICKUP?.length;

            if (isItemSoldOut) {
                this.isAddToCartDisabled = isItemSoldOut;
            } else if (isEventItem) {
                this.isAddToCartDisabled = SquareWebSDK.helpers.item.isEventItemInThePast(this.product);
            } else if (isPreorderItem) {
                this.isAddToCartDisabled = SquareWebSDK.helpers.item.isPreorderItemCutoffInThePast(this.product);
            }
        },
        /**
         * No product options mean the item is has a flat variation
         * @return {Boolean}
         */
        isFlatVariation() {
            return !this.productOptions?.length;
        },
        /**
         * Get the formatted selected options
         * @return {Array}
         */
        getSelectedOptions() {
            return Utils.getSelectedOptionsForSdk(this.formData);
        },
        /**
         * Get the formatted selected modifiers
         * @return {Array}
         */
        getSelectedModifiers() {
            return Utils.getSelectedModifiersForSdk(this.formData);
        },
        /**
         * Get the selected variation id
         * @return {String}
         */
        getSelectedVariationId() {
            return this.isFlatVariation()
                ? (this.formData.variation?.value ?? '')
                : '';
        },
        /**
         * Validates the form data and updates the price
         */
        onFormDataChange() {
            this.disabledChoices = Utils.getDisabledChoicesFromSdk(this.product, this.getSelectedOptions(this.formData));
            this.isAddToCartDisabled = false;
            this.invalidQuantity = false;

            Alpine.store('product').updateProperty('formData', this.formData);
            this.updatePriceAndBadge();
        },
        /**
         * Updates the price and badge
         */
        async updatePriceAndBadge() {
            const globalStore = Alpine.store('global');
            const formData = Object.values(this.formData);
            let regularPriceAmount = this.product.price.regular_high.amount;
            let finalPriceAmount = this.product.price.regular_low.amount;
            let isLowStock = false;
            let isOutOfStock = false;
            const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
            const timeDiffInMs = new Date().getTime() - new Date(this.product.create_at).getTime();
            const isNew = timeDiffInMs <= thirtyDaysInMs; // Mark as new if the created date is within 30 days
            const lowStockThreshold = 5;
            let firstVariation = null;

            this.isLoadingPrice = true;

            // Find the first variation match
            if (this.isFlatVariation()) {
                const selectedVariation = this.product.variations.find((variation) => variation.id === this.getSelectedVariationId());
                firstVariation = selectedVariation ?? this.product.variations.find((v) => !SquareWebSDK.helpers.item.isVariationSoldOut(v));
            } else {
                const variationsInStockForChoices = SquareWebSDK.helpers.item.getInStockVariationsForSelectedOptionsOrVariation({
                    item: this.product,
                    selectedOptions: this.getSelectedOptions(),
                });
                firstVariation = variationsInStockForChoices[0];
            }

            // Update price with the first variation
            if (firstVariation) {
                regularPriceAmount = firstVariation.price.regular.amount;
                finalPriceAmount = firstVariation.price.sale.amount;

                if (Number.isInteger(firstVariation.inventory)) {
                    isOutOfStock = Boolean(firstVariation.inventory === 0);
                    isLowStock = Boolean(firstVariation.inventory < lowStockThreshold);
                }
            }

            // Update price with modifier selections
            formData.forEach(({ value }, i) => {
                const property = Object.keys(this.formData)[i];

                if ((value && value.length) || value === true) {
                    const selectedModifier = this.productModifiers.find((modifier) => modifier.id === property);
                    const selectedModifierChoices = selectedModifier?.modifiers?.filter((modifier) => {
                        if (Array.isArray(value)) {
                            return value.includes(modifier.id);
                        }
                        return typeof value === 'boolean' ? value : modifier.id === value;
                    });

                    selectedModifierChoices?.forEach((choice) => {
                        if (choice?.price_money) {
                            regularPriceAmount += choice.price_money.amount;
                            finalPriceAmount += choice.price_money.amount;
                        }
                    });
                }
            });

            if (this.$refs.productBadges) {
                Utils.refreshTemplate({
                    template: 'partials/components/store/item/badges',
                    props: {
                        badges: {
                            on_sale: regularPriceAmount > finalPriceAmount,
                            low_stock: isLowStock,
                            out_of_stock: isOutOfStock,
                            is_new: isNew,
                            has_discount: false,
                        },
                    },
                    el: this.$refs.productBadges,
                });
            }

            const itemPrice = this.$el.querySelector('#itemPrice');
            if (itemPrice) {
                const caloriesText = this.product.item_type_details?.calorie_count
                    ? this.translations.caloriesLabel.replace('{{calories}}', this.product.item_type_details.calorie_count)
                    : '';
                await Utils.refreshTemplate({
                    template: 'partials/ui/price',
                    props: {
                        price: {
                            regular_low: {
                                amount: finalPriceAmount,
                                currency: globalStore.currency,
                                formatted: SquareWebSDK.helpers.money.formatAmount(finalPriceAmount, globalStore.currency, globalStore.locale),
                            },
                            regular_high: {
                                amount: regularPriceAmount,
                                currency: globalStore.currency,
                                formatted: SquareWebSDK.helpers.money.formatAmount(regularPriceAmount, globalStore.currency, globalStore.locale),
                            },
                            currency: globalStore.currency,
                        },
                        secondaryText: caloriesText,
                        size: 'small',
                    },
                    el: itemPrice,
                });
            }

            this.isLoadingPrice = false;
        },
        /**
         * Validates the form data
         */
        validateFormData() {
            let isInvalid = false;

            if (!this.productOptions.length && !this.productModifiers.length) {
                return !isInvalid;
            }

            try {
                SquareWebSDK.helpers.item.validateItem({
                    item: this.product,
                    selectedOptions: this.getSelectedOptions(),
                    selectedModifiers: this.getSelectedModifiers(),
                    selectedVariationId: this.getSelectedVariationId(),
                });
            } catch (error) {
                this.invalidOptionIds = error.itemOptionIds ?? [];
                this.invalidModifierIds = error.modifierListIds ?? [];
                this.isInvalidVariationId = Boolean(error.variationId);
                this.invalidQuantity = Boolean(error.quantityErrorType);
                isInvalid = true;
            }

            this.$nextTick(() => {
                const scrollTo = document.querySelector('.form-element__error--visible')?.closest('.form-element');
                if (scrollTo) {
                    window.scrollTo({ top: scrollTo.offsetTop, behavior: 'smooth' });
                }
            });

            return !isInvalid;
        },
        /**
         * Updates the global store with the current selection before adding to the cart
         */
        onBeforeItemPurchase() {
            const productStore = Alpine.store('product');
            productStore.updateProperty('formData', this.formData);
            const globalStore = Alpine.store('global');
            globalStore.updateProperty('fulfillment', productStore.fulfillment);
            globalStore.updateProperty('locationId', productStore.locationId);
        },
        /**
         * Generates the cart data
         * @param {Boolean} isBuyNow
         * @return {Object}
         */
        generateCartData(isBuyNow = false) {
            const globalStore = Alpine.store('global');
            let variationId = null;
            let subscriptionPlanVariationId = null;
            let modifiers = [];
            let priceOverride = null;

            // Get variation
            if (this.isFlatVariation()) {
                const firstVariation = this.product.variations.find((v) => !SquareWebSDK.helpers.item.isVariationSoldOut(v));
                variationId = this.getSelectedVariationId()?.length
                    ? this.getSelectedVariationId()
                    : firstVariation?.id;
            } else {
                const variationsInStockForChoices = SquareWebSDK.helpers.item.getInStockVariationsForSelectedOptionsOrVariation({
                    item: this.product,
                    selectedOptions: this.getSelectedOptions(),
                });
                const firstVariation = variationsInStockForChoices[0];
                variationId = firstVariation?.id;
            }

            // Get variation
            if (this.productModifiers.length) {
                // Get modifiers - note text modifer and gift options are not yet supported
                const productModifiers = this.productModifiers.filter((modifier) => modifier.id).map((modifier) => modifier.id);
                const selectedModifiers = Object.keys(this.formData)
                    .filter((id) => productModifiers.includes(id) && (this.formData[id]?.value?.length || this.formData[id]?.value === true));
                modifiers = selectedModifiers.reduce((acc, id) => {
                    const { value } = this.formData[id];
                    const { type } = this.formData[id];
                    const selection = {
                        id,
                        type,
                    };
                    if (type === 'CHOICE') {
                        if (Array.isArray(value)) {
                            selection.choiceSelections = value;
                        } else {
                            selection.choiceSelections = [value];
                        }
                    } else if (type === 'GIFT_WRAP') {
                        selection.choiceSelections = [id];
                    } else {
                        selection.textEntry = value;
                    }
                    return acc.concat(selection);
                }, []);
            }

            if (isBuyNow && this.formData.subscription?.value) {
                subscriptionPlanVariationId = this.formData.subscription.value;
            }

            if (this.formData.donation?.value) {
                const donationVariation = this.productVariations.find((variation) => variation.id === this.formData.donation.value);
                if (!donationVariation) {
                    variationId = this.productVariations.find((variation) => variation.pricing_type === 'VARIABLE_PRICING')?.id;
                    priceOverride = {
                        amount: Number(this.formData.donation.value) * 100,
                        currency: globalStore.currency,
                    };
                } else {
                    variationId = donationVariation.id;
                }
            }

            const output = {
                itemId: this.product.id,
                variationId,
                quantity: this.formData.quantity.value,
                modifiers: Alpine.raw(modifiers),
            };

            if (priceOverride) {
                output.priceOverride = priceOverride;
            }

            if (isBuyNow) {
                if (subscriptionPlanVariationId) {
                    output.subscriptionPlanVariationId = subscriptionPlanVariationId;
                }
            }

            return output;
        },
        /**
         * Add the item to the cart
         */
        processAddToCart() {
            this.onBeforeItemPurchase();
            this.isAddingItemToCart = true;

            this.$nextTick(async () => {
                try {
                    await Alpine.store('cart').addToCart(this.generateCartData());
                } catch (e) {
                    this.isFailedToBuy = true;
                } finally {
                    this.isAddingItemToCart = false;
                }
            });
        },
        /**
         * Instant purchase the item
         * @param {Boolean} isManualFulfillment
         */
        processBuyNow(isManualFulfillment = false) {
            this.onBeforeItemPurchase();
            this.isBuyingItem = true;

            this.$nextTick(async () => {
                try {
                    await Alpine.store('cart').buyNow(this.generateCartData(true), isManualFulfillment);
                } catch (e) {
                    this.isFailedToBuy = true;
                } finally {
                    this.isBuyingItem = false;
                }
            });
        },
    });

    const createProductFormButtonsData = (isManualFulfillment = false) => ({
        isSubscribeButton: false,
        isManualFulfillment,
        /**
         * Initial events
         */
        init() {
            this.$watch('isAddToCartDisabled', (value) => {
                this.toggleAddToCartButton(this.$el, value);
            });
            this.$watch('formData.subscription', ({ value } = {}) => {
                this.isSubscribeButton = Boolean(value);
            });
        },
        /**
         * Add to cart action
         */
        addToCart() {
            if (this.validateFormData()) {
                this.processAddToCart();
            } else {
                this.isAddToCartDisabled = true;
            }
        },
        /**
         * Buy now action
         */
        buyNow() {
            if (this.validateFormData()) {
                this.processBuyNow(this.isManualFulfillment);
            } else {
                this.isAddToCartDisabled = true;
            }
        },
    });

    Alpine.data('productPage', createProductPageData);
    Alpine.data('productForm', createProductFormData);
    Alpine.data('productFormButtons', createProductFormButtonsData);
});
