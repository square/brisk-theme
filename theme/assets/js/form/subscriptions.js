document.addEventListener('alpine:init', () => {
    const createSubscriptionFormData = (dataId) => ({
        DAYS: 'days',
        WEEKS: 'weeks',
        MONTHS: 'months',
        YEARS: 'years',
        cadences: {},
        subscriptionCards: {},
        isSubscriptionSelected: false,
        subscriptionModel: '',
        currency: Constants.DEFAULT_CURRENCY,
        translations: {},
        /**
         * Initial events
         */
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);

            this.subscriptionModel = Object.values(this.subscriptionCards)[0]?.options[0]?.value;

            this.$watch('formData.subscription', ({ id } = {}) => {
                if (id) {
                    this.$nextTick(() => {
                        this.updateSelectLabelWidth();
                    });
                }
            });

            this.$watch('subscriptionModel', (value) => {
                this.formData.subscription.value = value;
                this.updateSubscriptionPriceAndBadge();
            });
        },
        /**
         * Updates the subscription price and badge
         */
        updateSubscriptionPriceAndBadge() {
            const selectedSubscriptionId = this.formData.subscription?.id;
            const card = this.subscriptionCards[selectedSubscriptionId]?.options?.find((option) => option.value === this.subscriptionModel);

            if (card) {
                const subscriptionPrice = {
                    regular_high: card.phase.pricing.regular,
                    regular_low: card.phase.pricing.subscription,
                    currency: this.currency,
                };
                if (Square.async.templates[`subscription-price-${selectedSubscriptionId}`]) {
                    Square.async.refreshAsyncTemplate(`subscription-price-${selectedSubscriptionId}`, {
                        price: subscriptionPrice,
                        size: 'small',
                    });
                }
            }
            if (card.phase?.pricing?.discounts?.[0] && selectedSubscriptionId) {
                Square.async.refreshAsyncTemplate(`subscription-badge-${selectedSubscriptionId}`, {
                    template: 'emphasis',
                    label: `${card.phase.pricing.discounts[0].percentage}% off`,
                    shouldAnnounce: true,
                });
            }
        },
        /**
         * Updates the subscription label width
         */
        updateSelectLabelWidth() {
            const index = Object.keys(this.subscriptionCards).findIndex((id) => id === this.formData.subscription?.id);
            const selectLabel = this.$el.querySelectorAll('.form-fieldset__label')[index];
            const priceWidth = this.$el.querySelectorAll('.form-subscription__price')?.[index]?.offsetWidth;

            if (selectLabel && priceWidth) {
                selectLabel.style.width = `calc(100% - ${priceWidth}px)`;
            }
        },
        /**
         * Gets the subscription duration
         * @param {String} id
         * @return {Object|null}
         */
        getSubscriptionDuration(id) {
            const phase = this.subscriptionCards[id]?.options?.[0]?.phase;

            if (!phase) {
                return null;
            }

            const { periods, cadence } = phase;
            const cadenceDefinition = this.cadences[cadence]?.definition;

            if (periods && cadenceDefinition) {
                const count = (periods) * (cadenceDefinition?.frequency || 1);

                return {
                    cadence: cadenceDefinition.cadence,
                    count,
                };
            }
            return null;
        },
        /**
         * Gets the subscription billing cycle label
         * @param {String} id
         * @return {String}
         */
        getSubscriptionBillingCycleLabel(id) {
            const phase = this.subscriptionCards[id]?.options?.[0]?.phase;

            if (!phase) {
                return '';
            }

            const duration = this.getSubscriptionDuration(phase);

            // If no billing cycles/periods defined, the subscription is indefinite
            if (duration) {
                const { cadence, count } = duration;
                switch (cadence) {
                case this.DAYS:
                    return count === 1
                        ? this.translations.billingCycleOneDay
                        : this.translations.billingCycleDays.replace('{{days}}', count);
                case this.WEEKS:
                    return count === 1
                        ? this.translations.billingCycleOneWeek
                        : this.translations.billingCycleWeeks.replace('{{weeks}}', count);
                case this.MONTHS:
                    return count === 1
                        ? this.translations.billingCycleOneMonth
                        : this.translations.billingCycleMonths.replace('{{months}}', count);
                case this.YEARS:
                    return count === 1
                        ? this.translations.billingCycleOneYear
                        : this.translations.billingCycleYears.replace('{{years}}', count);
                default:
                    return '';
                }
            }
            return '';
        },
    });

    const createSubscriptionCardData = (id, defaultValue) => ({
        isOpen: false,
        id,
        /**
         * Initial events
         */
        init() {
            this.$watch('formData.subscription', (subscription = {}) => {
                this.isOpen = subscription.id === this.id;
            });

            this.$watch('isOpen', (isOpen) => {
                if (isOpen) {
                    this.$nextTick(() => {
                        this.formData.subscription.value = defaultValue;
                    });
                }
            });
        },
    });

    Alpine.data('subscriptionForm', createSubscriptionFormData);
    Alpine.data('subscriptionCard', createSubscriptionCardData);
});
