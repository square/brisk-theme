document.addEventListener('alpine:init', () => {
    const createItemBannersData = (dataId) => ({
        preorders: {},
        discounts: [],
        fulfillment: Constants.FULFILLMENT_SHIPPING,
        translations: {},
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.$watch('$store.product.fulfillment', (value) => {
                this.fulfillment = value;
            });
        },
        /**
         * Gets the preorder item
         * @return {Array}
         */
        getPreorder() {
            return this.preorders[this.fulfillment]?.[0] ?? [];
        },
        /**
         * Checks if the product has preorder item
         * @return {Boolean}
         */
        hasPreorder() {
            return Object.keys(this.getPreorder()).length;
        },
        /**
         * Checks if the product has discount items
         * @return {Boolean}
         */
        hasDiscount() {
            return this.discounts.length;
        },
        /**
         * Gets the preorder text
         * @return {String}
         */
        getPreorderText() {
            return this.getPreorder().text;
        },
        /**
         * Opens the preorder dialog
         */
        openPreorderDialog() {
            if (this.hasPreorder()) {
                this.$store.dialog.openPrimaryDialog({
                    templateUrl: 'templates/components/dialogs/preorder-content',
                    dialogOptions: {
                        showCloseButton: false,
                        showPrimaryButton: true,
                        primaryButtonText: this.translations.buttonClose,
                    },
                    templateProps: { preorder: this.getPreorder(), fulfillment: this.fulfillment },
                });
            }
        },
        /**
         * Opens the discount dialog
         */
        openDiscountDialog(index) {
            if (this.hasDiscount()) {
                this.$store.dialog.openPrimaryDialog({
                    templateUrl: 'templates/components/dialogs/discount-content',
                    dialogOptions: {
                        showCloseButton: false,
                        showPrimaryButton: true,
                        primaryButtonText: this.translations.buttonClose,
                    },
                    templateProps: { discount: this.discounts[index] },
                });
            }
        },
    });

    const createItemDiscountData = (dataId) => ({
        discount: {},
        isLoadingDetails: false,
        formattedEligibleItems: '',
        formattedDetails: [],
        /**
         * Initial events
         */
        async init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            const excludeProductIds = this.discount.exclude_square_online_product_ids;
            const includeProductIds = this.discount.match_square_online_product_ids;
            const details = this.discount.display_strings?.details;
            const expirationDetail = this.discount.expiration_detail;
            const recurringDetails = this.discount.recurring_details;

            this.isLoadingDetails = true;

            if (excludeProductIds.length) {
                const excludeProducts = await this.getDiscountDetails(excludeProductIds);

                this.formattedEligibleItems = this.translations.excludeItems.replace(
                    '{{list}}',
                    excludeProducts.map((product) => product.name).join(', '),
                );
            }

            if (includeProductIds.length) {
                const includeProducts = await this.getDiscountDetails(includeProductIds);
                this.formattedEligibleItems += `${includeProducts.map((product) => product.name).join(', ')}.`;
            }

            if (details?.length) {
                details.forEach((text) => {
                    this.formattedDetails.push(text);
                });
            }

            if (expirationDetail?.length) {
                this.formattedDetails.push(this.translations.expiration.replace('{{detail}}', expirationDetail));
            }

            if (recurringDetails?.length) {
                this.formattedDetails.push(this.translations.recurring.replace('{{detail}}', recurringDetails.join(', ')));
            }

            this.isLoadingDetails = false;
        },
        /**
         * Gets the discount details
         * @param {Array} itemIds
         * @return {Array}
         */
        async getDiscountDetails(itemIds = []) {
            let data = [];
            const ids = itemIds.map((id) => (typeof id === 'number' ? id.toString() : id));
            await SquareWebSDK.resource.getResource({
                products: {
                    type: 'item-list',
                    filters: {
                        ids,
                        square_online_id: true,
                    },
                },
            })
                .then(({ products }) => {
                    if (products) {
                        data = products;
                    }
                });
            return data;
        },
    });

    Alpine.data('itemBanners', createItemBannersData);
    Alpine.data('itemDiscount', createItemDiscountData);
});
