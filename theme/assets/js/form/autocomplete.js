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
            suggestionApiConfig: {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.head.querySelector("meta[name='csrf-token']")?.content,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: {
                        items: {
                            type: 'item-list',
                        },
                    },
                }),
            },
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
             * Generates the suggestion api url
             */
            getSuggestionUrl() {
                return '/s/api/v1/resource';
            },
            /**
             * Gets the items suggestion
             * @param {Boolean} showDropdown - true to show the dropdown on complete
             */
            async getSuggestions(showDropdown = true) {
                this.isLoadingAutocomplete = true;
                await fetch(this.getSuggestionUrl(), this.suggestionApiConfig)
                    .then(async (response) => (response.ok ? response.text() : '{}'))
                    .then(async (text) => {
                        const { data, items } = JSON.parse(text);
                        if (data || items) {
                            this.items = this.formatSuggestions(data ?? items);
                        } else {
                            this.items = [];
                        }

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
                await Square.async.refreshAsyncTemplate('autocomplete-tooltip-menu', {
                    items: this.items,
                    value: this.model,
                    menuTriggerRef: 'input',
                });
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
