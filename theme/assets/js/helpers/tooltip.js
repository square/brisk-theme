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
    toggleTooltip(tooltip, shouldShow = true, delay = 0) {
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
                    tooltip.setAttribute('data-show', '');
                    tooltipInstance.update();
                }, delay);
            } else {
                tooltip.setAttribute('data-show', '');
                tooltipInstance.update();
            }
        } else {
            tooltip.removeAttribute('data-show');
        }
    },
};
