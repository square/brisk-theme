if (!window.onChoiceFormReady) {
    window.onChoiceFormReady = () => {
        Alpine.data('choiceForm', (optionValue) => ({
            isDisabled: false,
            isSelected: false,
            updateChoiceOption(selectedValue) {
                this.isSelected = typeof selectedValue === 'object'
                    ? Object.values(selectedValue).includes(optionValue)
                    : selectedValue === optionValue;
                this.isDisabled = this.disabledChoices?.includes(optionValue);
            },
        }));
    };
}

document.addEventListener('alpine:init', window.onChoiceFormReady);

document.addEventListener('async:alpine:init', window.onChoiceFormReady);
