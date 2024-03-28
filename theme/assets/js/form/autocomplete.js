if (!window.onAutocompleteFormReady) {
    window.onAutocompleteFormReady = () => {
        const { UITooltip } = window;

        const createAutocompleteFormData = (id) => ({
            model: '',
            autocompleteValue: '',
            isInvalid: false,
            tooltipEl: document.querySelector(`#${id}`),
            isLoadingAutocomplete: false,
            itemHoverIndex: 0,
            items: [],
            isDropdownOpen: false,
            /**
             * Initial events (We can't use `init()` b/c it'll get overwritten by the block data)
             */
            initAutocomplete() {
                this.$nextTick(() => {
                    UITooltip.createPopper(this.$refs.input, this.tooltipEl);
                });

                this.$watch('autocompleteValue', (value) => {
                    this.model = this.getInputValue(value);
                    this.onAutocompleteItemSelect(value);
                });
            },
            /**
             * On autocomplete item select
             */
            onAutocompleteItemSelect() {
                this.toggleDropdown(false);
            },
            /**
             * Get items by autocomplete input
             */
            loadSuggestions() {
                return SquareWebSDK.resource.getResource({
                    items: {
                        type: 'item-list',
                        filters: {
                            search: this.model,
                        },
                    },
                })
                    .then(async ({ items }) => {
                        if (items) {
                            this.items = this.formatSuggestions(items);
                        } else {
                            this.items = [];
                        }
                    });
            },
            /**
             * Gets the items suggestion
             * @param {Boolean} showDropdown - true to show the dropdown on complete
             */
            async getSuggestions(showDropdown = true) {
                this.isLoadingAutocomplete = true;
                await this.loadSuggestions()
                    .then(async () => {
                        await this.refreshDropdown();
                        this.toggleDropdown(showDropdown);
                        this.isLoadingAutocomplete = false;
                    });
            },
            /**
             * Formats the suggestions with label and value
             * @return {Array}
             */
            formatSuggestions(data) {
                return data.map((suggestion) => ({ ...suggestion, label: suggestion.name, value: Utils.deepGet(suggestion, 'square_online_id') }));
            },
            /**
             * Gets the input value to display to the user
             * @param {Object} value
             * @return {String}
             */
            getInputValue(value) {
                return value?.name ?? this.model;
            },
            /**
             * Reloads the dropdown with the new items and value
             */
            async refreshDropdown() {
                const autocompleteDropdown = document.querySelector('#autocomplete-tooltip-menu');
                if (autocompleteDropdown) {
                    await Utils.refreshTemplate({
                        template: 'partials/components/tooltip-menu',
                        props: {
                            items: this.items,
                            value: this.model,
                            menuTriggerRef: 'input',
                        },
                        el: autocompleteDropdown,
                    });
                }
            },
            /**
             * Toggles the dropdown
             * @param {Boolean} show
             */
            toggleDropdown(show = true) {
                this.isDropdownOpen = show && Boolean(this.items.length);
                UITooltip.toggleTooltip(this.tooltipEl, this.isDropdownOpen);
            },
            /**
             * Input change event
             */
            async onInputChange() {
                await this.getSuggestions();
                this.toggleDropdown(true);
            },
            /**
             * Keyboard down arrow event
             */
            onKeyDown() {
                if (!this.isDropdownOpen) {
                    this.toggleDropdown(true);
                }
                if (this.isDropdownOpen && this.tooltipEl.querySelector('[role="listbox"]')) {
                    this.tooltipEl.querySelector('[role="listbox"]').focus({ focusVisible: true });
                }
            },
            /**
             * Keyboard up arrow event
             */
            onKeyUp() {
                this.$refs.input.focus();
            },
        });

        Alpine.data('autocompleteForm', createAutocompleteFormData);
    };
}

document.addEventListener('alpine:init', window.onAutocompleteFormReady);

document.addEventListener('async:alpine:init', window.onAutocompleteFormReady);
