document.addEventListener('alpine:init', () => {
    // Shop store shared between shop components
    Alpine.store('shop', {
        location: {},
        /**
         * Updates the store data
         * @param {String} property
         * @param {Array|Object|String|Number} value
         */
        updateProperty(property, value) {
            this[property] = value;
        },
    });

    const MAP_SORT_BY_AND_ORDER = {
        name_desc: {
            sortValue: 'name',
            orderValue: 'desc',
        },
        name_asc: {
            sortValue: 'name',
            orderValue: 'asc',
        },
        price_desc: {
            sortValue: 'price',
            orderValue: 'desc',
        },
        price_asc: {
            sortValue: 'price',
            orderValue: 'asc',
        },
        popularity_score: {
            sortValue: 'popularity_score',
            orderValue: '',
        },
        category_order: {
            sortValue: 'category_order',
            orderValue: '',
        },
        score: {
            sortValue: 'score',
            orderValue: '',
        },
        created_date: {
            sortValue: 'created_date',
            orderValue: '',
        },
    };

    const createItemListData = (dataId) => ({
        pageUrl: '',
        paginate: {},
        pagination: {
            perPage: { value: 100 },
            currentPage: { value: 1 },
            totalPages: 1,
        },
        sortValue: 'popularity_score',
        searchTerm: null,
        translations: {},
        init() {
            const shopData = JSON.parse(document.getElementById(dataId)?.innerHTML ?? {});
            Object.keys(shopData).forEach((property) => {
                if (!shopData[property]) {
                    return;
                }
                if (['perPage', 'currentPage'].includes(property)) {
                    this.pagination[property].value = parseInt(shopData[property], 10);
                } else if (property === 'totalPages') {
                    this.pagination.totalPages = shopData[property];
                } else {
                    this[property] = shopData[property];
                }
            });
        },
        /**
         * Get sort value
         * @return {String}
         */
        getSortProp() {
            return MAP_SORT_BY_AND_ORDER[this.sortValue]?.sortValue ?? this.sortValue;
        },
        /**
         * Get sort order value
         * @return {String}
         */
        getOrderValue() {
            return MAP_SORT_BY_AND_ORDER[this.sortValue]?.orderValue ?? '';
        },
        /**
         * Get current page query
         * @return {Object}
         */
        getCurrentPageQuery() {
            const url = new URLSearchParams(window.location.search);
            const urlParams = Object.fromEntries(url.entries());
            const query = {};

            if (urlParams.page) {
                query.page = urlParams.page;
            }
            if (urlParams.limit) {
                query.limit = urlParams.limit;
            }
            if (urlParams.q) {
                query.q = urlParams.q;
            }
            if (urlParams.fulfillments?.length) {
                query.fulfillments = urlParams.fulfillments.split(',');
            }
            if (urlParams.location_id?.length) {
                query.locationId = urlParams.location_id;
            }
            if (urlParams.item_status?.length) {
                const statuses = urlParams.item_status.split(',');
                query.isOnSale = statuses.includes('on_sale');
                query.isInStock = statuses.includes('in_stock');
            }
            if (urlParams.category_ids?.length) {
                query.categoryIds = urlParams.category_ids.split(',');
            }
            if (urlParams.option_choices?.length) {
                query.choiceIds = urlParams.option_choices.split(',');
            }
            if (Number(urlParams.price_min) > 0) {
                query.priceMin = urlParams.price_min;
            }
            if (Number(urlParams.price_max) > 0) {
                query.priceMax = urlParams.price_max;
            }
            return query;
        },
        /**
         * Generate page url with filters
         * @param {Number} payload.page current page
         * @param {Number} payload.limit page size
         * @param {String} payload.locationId
         * @param {Boolean} payload.isOnSale
         * @param {Boolean} payload.isInStock
         * @param {Array} payload.categoryIds
         * @param {Array} payload.choiceIds
         * @param {Number} payload.priceMin
         * @param {Number} payload.priceMax
         * @return {String}
         */
        getPageUrl({
            page, limit, fulfillments, locationId, isOnSale, isInStock, categoryIds, choiceIds, priceMin, priceMax,
        } = {}) {
            const url = new URL(this.pageUrl);
            const query = url.searchParams;
            const statuses = [];

            query.set('page', page ?? this.pagination.currentPage.value);
            query.set('limit', limit ?? this.pagination.perPage.value);
            query.set('sort_by', this.getSortProp());

            if (this.searchTerm?.length) {
                query.set('q', this.searchTerm);
            }

            if (this.getOrderValue().length) {
                query.set('sort_order', this.getOrderValue());
            }
            if (fulfillments?.length) {
                query.set('fulfillments', fulfillments);
            }
            if (locationId?.length) {
                query.set('location_id', locationId);
            }
            if (isOnSale) {
                statuses.push('on_sale');
            }
            if (isInStock) {
                statuses.push('in_stock');
            }
            if (statuses.length) {
                query.set('item_status', statuses);
            }
            if (categoryIds?.length) {
                query.set('category_ids', categoryIds);
            }
            if (choiceIds?.length) {
                query.set('option_choices', choiceIds);
            }
            if (Number(priceMin) > 0) {
                query.set('price_min', Number(priceMin));
            }
            if (Number(priceMax) > 0) {
                query.set('price_max', Number(priceMax));
            }

            return url.toString();
        },
    });

    const createItemListPaginationData = () => ({
        /**
         * Initial events
         */
        init() {
            this.perPage = this.pagination.perPage;
            this.currentPage = this.pagination.currentPage;
            this.totalPages = this.pagination.totalPages;
            const globalStore = Alpine.store('global');

            this.$watch('currentPage', ({ value }) => {
                if (this.paginate.current_page === (value - 1) && this.paginate.next) {
                    globalStore.goToPage(this.paginate.next);
                } else if (this.paginate.current_page === (value + 1) && this.paginate.previous) {
                    globalStore.goToPage(this.paginate.previous);
                } else if (value <= this.paginate.total_pages) {
                    globalStore.goToPage(this.getPageUrl({ ...this.getCurrentPageQuery(), page: value }));
                }
            });

            this.$watch('perPage', ({ value }) => {
                this.pagination.perPage.value = parseInt(value, 10);
                globalStore.goToPage(this.getPageUrl({ ...this.getCurrentPageQuery(), page: 1, limit: value }));
            });
        },
    });

    Alpine.data('itemList', createItemListData);
    Alpine.data('itemListPagination', createItemListPaginationData);
});
