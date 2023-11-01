if (!window.onPriceRangeFormReady) {
    window.onPriceRangeFormReady = () => {
        Alpine.data('priceRangeForm', () => ({
            init() {
                this.$watch('error', ({ min, max }) => {
                    this.isInvalid = min || max;
                });
            },
            validatePriceRange() {
                this.error.min = this.model.min > 0
                    && this.model.max > 0
                    && this.model.min > this.model.max;
                this.error.max = this.model.min > 0
                    && this.model.max > 0
                    && this.model.max <= this.model.min;
            },
        }));
    };
}

document.addEventListener('alpine:init', window.onPriceRangeFormReady);

document.addEventListener('async:alpine:init', window.onPriceRangeFormReady);
