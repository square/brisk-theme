window.FormStepper = {
    /**
     * Checks if the input is disabled
     * @param {Object} stepperInput
     * @param {Number} value
     */
    checkDisabled(stepperInput, value) {
        return {
            min: Number(value) === Number(stepperInput?.getAttribute('min')),
            max: Number(value) === Number(stepperInput?.getAttribute('max')),
        };
    },
    /**
     * Generates the input width by the text length
     * @param {Number} value
     * @return {Number}
     */
    getInputWidth(value) {
        return value.toString().length * 8 + 25; // 8px per character
    },
    /**
     * Checks the min/max value and returns the correct input value
     * @param {Number} value
     * @param {Number} min
     * @param {Number} max
     * @param {Number} defaultValue
     * @return {Number}
     */
    getInputValue(value, min, max, defaultValue) {
        const minValue = Number(min);
        const maxValue = Number(max);

        if (!minValue && !maxValue) {
            return Number(value);
        }
        if (value >= minValue && value <= maxValue) {
            return Number(value);
        }
        if (value > maxValue) {
            return maxValue;
        }
        return value <= minValue ? Number(value) : Number(defaultValue);
    },
};

if (!window.onStepperFormReady) {
    window.onStepperFormReady = () => {
        const { FormStepper } = window;
        Alpine.data('stepperForm', (minValue, defaultValue) => ({
            isLoading: false,
            isInvalid: false,
            disabled: { min: false, max: false },
            model: minValue,
            inputWidth: FormStepper.getInputWidth(defaultValue),
            updateStepperInput() {
                this.inputWidth = FormStepper.getInputWidth(this.model);
                this.disabled = FormStepper.checkDisabled(this.$refs.stepperInput, this.model);
            },
        }));
    };
}

document.addEventListener('alpine:init', window.onStepperFormReady);

document.addEventListener('async:alpine:init', window.onStepperFormReady);
