if (!window.onChoiceCarouselFormReady) {
    window.onChoiceCarouselFormReady = () => {
        Alpine.data('choiceCarouselForm', (optionValue) => ({
            isDisabled: false,
            updateChoiceCarouselOption() {
                this.isDisabled = this.disabledChoices?.includes(optionValue);
            },
        }));
    };
}

document.addEventListener('alpine:init', window.onChoiceCarouselFormReady);

document.addEventListener('async:alpine:init', window.onChoiceCarouselFormReady);
