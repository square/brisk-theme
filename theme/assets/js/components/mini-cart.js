if (!window.onMiniCartReady) {
    window.onMiniCartReady = () => {
        Alpine.data('miniCart', (total = 0) => ({
            isMiniCartLoading: false,
            failedToUpdateOrderId: null,
            isReloadingMiniCartTemplate: false,
            isShiftKeyPressed: false,
            init() {
                document.dispatchEvent(new CustomEvent('async:alpine:init'));
                this.$store.cart.miniCartItemsTotal = total;
                this.$nextTick(() => {
                    this.$store.cart.isReady = true;
                });
            },
            onMiniCartBlur() {
                if (!this.isReloadingMiniCartTemplate && !this.isShiftKeyPressed) {
                    this.$store.cart.isInteractingMiniCart = false;
                    this.$store.cart.isMiniCartOpen = false;
                }
            },
        }));
        Alpine.data('miniCartItem', () => ({
            updateItemQuantity(orderItemId, quantity) {
                this.isMiniCartLoading = true;
                this.failedToUpdateOrderId = null;
                this.isReloadingMiniCartTemplate = true;

                this.$store.cart.updateItemQuantity(orderItemId, quantity).then(() => {
                    this.isMiniCartLoading = false;
                }).catch(() => {
                    this.failedToUpdateOrderId = orderItemId;
                }).finally(() => {
                    this.isMiniCartLoading = false;
                });
            },
            deleteItem(orderItemId) {
                this.isMiniCartLoading = true;
                this.failedToUpdateOrderId = null;
                this.isReloadingMiniCartTemplate = true;

                this.$store.cart.deleteItem(orderItemId).then(() => {
                    this.isMiniCartLoading = false;
                }).catch(() => {
                    this.failedToUpdateOrderId = orderItemId;
                }).finally(() => {
                    this.isMiniCartLoading = false;
                });
            },
        }));
    };
}

document.addEventListener('alpine:init', window.onMiniCartReady);
