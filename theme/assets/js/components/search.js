document.addEventListener('alpine:init', () => {
    const createSearchData = () => ({
        model: '',
        items: [],
        isSearching: false,
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
            this.isSearching = true;

            await SquareWebSDK.resource.getResource({
                items: {
                    type: 'item-list',
                    filters: {
                        search: this.model,
                    },
                },
            }).then(async ({ items }) => {
                this.items = items ?? [];
                // Display the results of the search in the Search Results component
                await this.refreshResults();
            }).finally(() => {
                this.isSearching = false;
            });
        },
        async refreshResults() {
            if (this.$refs.searchResults) {
                Utils.refreshTemplate({
                    template: 'partials/components/search-results',
                    props: {
                        items: this.items,
                        query: this.model,
                    },
                    el: this.$refs.searchResults,
                });
            }
        },
    });
    Alpine.data('search', createSearchData);
});
