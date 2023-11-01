document.addEventListener('alpine:init', () => {
    const createItemModifierData = (dataId) => ({
        productId: null,
        property: null,
        options: [],
        /**
         * Initial events
        */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            if (this.property === 'giftOptions') {
                this.$watch('giftMessageModel', (value) => {
                    const giftMessageProperty = this.options.find((o) => o.type === 'GIFT_MESSAGE')?.id;
                    if (this.formData[giftMessageProperty]) {
                        this.formData[giftMessageProperty].value = value;
                    }
                });
                this.$watch('giftWrapModel', (value) => {
                    const giftWrap = this.options.find((o) => o.type === 'GIFT_WRAP');
                    if (this.formData[giftWrap?.id]) {
                        this.formData[giftWrap.id].value = value ? (giftWrap.modifiers[0]?.id ?? '') : '';
                    }
                });
            } else {
                this.$watch('model', (value) => {
                    this.formData[this.property].value = value;
                    this.isInvalid = false;
                });
            }

            // Toggles error message
            this.$watch('invalidModifierIds', (invalidModifierIds) => {
                this.isInvalid = invalidModifierIds.includes(this.property);
            });
        },
    });

    Alpine.data('itemModifier', createItemModifierData);
});
