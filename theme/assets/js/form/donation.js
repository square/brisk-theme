document.addEventListener('alpine:init', () => {
    const createDonationFormData = (dataId) => ({
        options: [],
        formatter: null,
        customValue: null,
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            const { locale, currency } = Alpine.store('global');
            this.formatter = Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
                useGrouping: false,
            });

            this.$watch('customValue', (value) => {
                if (value > 0 && this.$el.querySelector('.form-element__sublabel')) {
                    // Updates the sublabel with the formatted custom value
                    this.$el.querySelector('.form-element__sublabel').innerHTML = this.formatter.format(value);
                    this.formData.donation = { value };
                }
            });
        },
    });

    const createDonationFormChoicesData = () => ({
        /**
         * Initial events
         */
        init() {
            this.$watch('model', (value) => {
                const selectedOption = this.options.find((o) => o.value === value);
                if (selectedOption?.label && this.$el.querySelector('.form-element__sublabel')) {
                    this.$el.querySelector('.form-element__sublabel').innerHTML = selectedOption.label;
                }
                this.formData.donation = { value };
            });
            this.$watch('formData', ({ donation } = {}) => {
                const optionValues = this.options.map((option) => option.value);
                if (!optionValues.includes(donation?.value)) {
                    this.model = '';
                }
            });
        },
    });

    Alpine.data('donationForm', createDonationFormData);
    Alpine.data('donationFormChoices', createDonationFormChoicesData);
});
