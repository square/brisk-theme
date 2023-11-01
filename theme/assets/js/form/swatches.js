if (!window.onSwatchesFormReady) {
    window.onSwatchesFormReady = () => {
        const { UITooltip } = window;
        Alpine.data('swatchesFormOption', (optionValue, tooltipBoundary) => ({
            isDisabled: false,
            isChecked: false,
            updateSwatchOption(modelValue) {
                this.isDisabled = this.disabledChoices?.includes(optionValue);
                this.isChecked = modelValue?.includes(optionValue) || modelValue === optionValue;
                const tooltipConfig = tooltipBoundary?.length ? { boundary: tooltipBoundary } : {};
                UITooltip.createPopper(this.$refs.input, this.$refs.tooltip, tooltipConfig);
            },
        }));
    };
}

document.addEventListener('alpine:init', window.onSwatchesFormReady);

document.addEventListener('async:alpine:init', window.onSwatchesFormReady);
