if (!window.onCheckboxFormReady) {
    window.onCheckboxFormReady = () => {
        Alpine.data('checkboxForm', (optionValue) => ({
            isDisabled: false,
            updateCheckboxOption() {
                this.isDisabled = this.disabledChoices?.includes(optionValue);
            },
            onCheckboxOptionHover() {
                if (this.$el.previousElementSibling) {
                    this.$el.previousElementSibling.classList.add('form-checkbox__option--hide-divider');
                }
            },
            onCheckboxOptionBlur() {
                const siblingElements = this.$el.parentNode.querySelectorAll('.form-checkbox__option--hide-divider');
                siblingElements.forEach((element) => {
                    element.classList.remove('form-checkbox__options--hide-divider');
                });
            },
        }));
    };
}

document.addEventListener('alpine:init', window.onCheckboxFormReady);

document.addEventListener('async:alpine:init', window.onCheckboxFormReady);
