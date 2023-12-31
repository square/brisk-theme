window.UITooltip = {
    tooltipInstances: [],
    tooltipTimeout: null,
    /**
     * Gets the tooltip options
     * See https://popper.js.org/docs/v2/modifiers/ for config options
     * @param {Object} config
     */
    getTooltipOptions(config = {}) {
        return {
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 8],
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        boundary: config.boundary ? document.querySelector(config.boundary) : 'document',
                    },
                },
            ],
            ...config,
        };
    },
    /**
     * Creates the popper instance
     * @param {Object} reference
     * @param {Object} tooltip
     * @param {Object} config
     */
    createPopper(reference, tooltip, config = {}) {
        const tooltipId = tooltip.getAttribute('id');

        if (!tooltipId) {
            // eslint-disable-next-line
            console.error('tooltip id required');
            return;
        }

        this.tooltipInstances[tooltipId] = Popper.createPopper(reference, tooltip, this.getTooltipOptions(config));
    },
    /**
     * Toggles the tooltip
     * @param {Object} tooltip
     * @param {Boolean} shouldShow
     */
    async toggleTooltip(tooltip, shouldShow = true, delay = 0) {
        const tooltipId = tooltip.getAttribute('id');
        const tooltipInstance = this.tooltipInstances[tooltipId];

        if (!tooltipInstance || !tooltip) {
            // eslint-disable-next-line
            console.error('tooltip instance required');
            return;
        }

        clearTimeout(this.tooltipTimeout);

        if (shouldShow) {
            if (delay > 0) {
                this.tooltipTimeout = setTimeout(() => {
                    // eslint-disable-next-line no-param-reassign
                    tooltip.style.height = 'auto';
                    tooltip.setAttribute('data-show', '');
                    tooltipInstance.update();
                }, delay);
            } else {
                // eslint-disable-next-line no-param-reassign
                tooltip.style.height = 'auto';
                tooltip.setAttribute('data-show', '');
                tooltipInstance.update();
            }
        } else {
            tooltip.removeAttribute('data-show');
            this.tooltipTimeout = setTimeout(() => {
                // eslint-disable-next-line no-param-reassign
                tooltip.style.height = '0';
            }, 1000);
        }
    },
};
