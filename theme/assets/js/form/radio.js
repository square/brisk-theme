if (!window.onRadioFormReady) {
    window.onRadioFormReady = () => {
        Alpine.data('radioForm', (optionValue) => ({
            isDisabled: false,
            updateRadioOption() {
                this.isDisabled = this.disabledChoices?.includes(optionValue);
            },
            onRadioOptionHover() {
                if (this.$el.previousElementSibling) {
                    this.$el.previousElementSibling.classList.add('form-radio__option--hide-divider');
                }
            },
            onRadioOptionBlur() {
                const siblingElements = this.$el.parentNode.querySelectorAll('.form-radio__option--hide-divider');
                siblingElements.forEach((element) => {
                    element.classList.remove('form-radio__option--hide-divider');
                });
            },
        }));
    };
}

document.addEventListener('alpine:init', window.onRadioFormReady);

document.addEventListener('async:alpine:init', window.onRadioFormReady);
