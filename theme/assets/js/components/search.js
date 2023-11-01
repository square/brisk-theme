document.addEventListener('alpine:init', () => {
    const createSearchData = () => ({
        model: '',
        items: [],
        suggestionApiConfig: {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.head.querySelector("meta[name='csrf-token']")?.content,
                'Content-Type': 'application/json',
            },
        },
        /**
         * Generates the suggestion api url
         */
        getSuggestionUrl() {
            return '/s/api/v1/resource';
        },
        reset() {
            this.model = '';
            this.items = [];
            this.refreshResults();
        },
        /**
             * Input change event
             */
        async onInputChange() {
            await this.getSuggestions();
        },
        /**
         * Gets the items suggestion
         */
        async getSuggestions() {
            const config = {
                ...this.suggestionApiConfig,
                body: JSON.stringify({
                    input: {
                        items: {
                            type: 'item-list',
                            filters: {
                                search: this.model,
                            },
                        },
                    },
                }),
            };

            await fetch(this.getSuggestionUrl(), config)
                .then(async (response) => (response.ok ? response.text() : '{}'))
                .then(async (text) => {
                    const { data, items } = JSON.parse(text);
                    if (data || items) {
                        this.items = data ?? items;
                    } else {
                        this.items = [];
                    }
                    // Display the results of the search in the Search Results component
                    await this.refreshResults();
                });
        },
        async refreshResults() {
            if (Square.async.templates?.['search-results']) {
                const props = { items: this.items, query: this.model };
                Square.async.refreshAsyncTemplate('search-results', props, { replaceContent: true });
            }
        },
    });
    Alpine.data('search', createSearchData);
});
