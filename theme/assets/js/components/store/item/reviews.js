document.addEventListener('alpine:init', () => {
    const SORT_OPTIONS = {
        newest: 'newest',
        highest: 'rating_highest',
        lowest: 'rating_lowest',
    };

    const createItemReviewsData = (dataId) => ({
        isLoadingReviews: false,
        pagination: {
            sortBy: SORT_OPTIONS.newest,
            perPage: { value: 2 },
            currentPage: { value: 1 },
            totalPages: 1,
        },
        reviews: [],
        disabledChoices: [],
        productName: '',
        translations: {},
        /**
         * Initial events
         */
        init() {
            const itemReviewsData = JSON.parse(document.getElementById(dataId)?.innerHTML ?? {});
            Object.keys(itemReviewsData).forEach((property) => {
                if (!itemReviewsData[property]) {
                    return;
                }
                if (['perPage', 'currentPage'].includes(property)) {
                    this.pagination[property].value = parseInt(itemReviewsData[property], 10);
                } else if (property === 'totalPages') {
                    this.pagination.totalPages = itemReviewsData[property];
                } else {
                    this[property] = itemReviewsData[property];
                }
            });

            const { reviews, name } = Alpine.store('product').product;
            this.reviews = reviews;
            this.productName = name;

            this.$watch('pagination.sortBy', () => {
                this.pagination.currentPage.value = 1;
                this.refreshReviews();
            });

            this.$watch('pagination.currentPage', () => {
                this.refreshReviews();
            });
        },
        /**
         * Sort reviews by the selection
         * @return {Array}
         */
        getSortedReviews(sortBy) {
            const sortByValue = sortBy ?? this.pagination.sortBy;
            const sortByNewest = this.reviews.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            if (sortByValue === SORT_OPTIONS.highest) {
                return sortByNewest.sort((a, b) => b.rating - a.rating);
            } if (sortByValue === SORT_OPTIONS.lowest) {
                return sortByNewest.sort((a, b) => a.rating - b.rating);
            }
            return sortByNewest;
        },
        /**
         * Reload the customer reviews by the pagination or sort selection
         */
        async refreshReviews() {
            this.isLoadingReviews = true;

            if (this.$refs.customerReviews) {
                await Utils.refreshTemplate({
                    template: 'partials/components/store/item/customer-reviews',
                    props: {
                        reviews: this.reviews,
                        currentPage: this.pagination.currentPage.value,
                        perPage: this.pagination.perPage.value,
                        sortBy: this.pagination.sortBy,
                        productName: this.productName,
                    },
                    el: this.$refs.customerReviews,
                });
            }

            this.isLoadingReviews = false;
        },
        /**
         * Opens the dialog with all reviews with images
         */
        openReviewImagesModal(activeIndex = 0, sortBy = SORT_OPTIONS.newest) {
            const { product } = Alpine.store('product');
            const reviews = this.getSortedReviews(sortBy).filter((review) => review.images?.length);
            const templateProps = {
                reviews,
                productName: product.name,
                activeIndex,
            };
            this.$store.dialog.openPrimaryDialog({
                templateUrl: 'templates/components/dialogs/product-reviews-content',
                dialogOptions: {
                    title: this.translations.imagesDialogTitle,
                    size: 'large',
                    variant: 'multi-pane',
                    currentPane: Number(activeIndex),
                    totalPane: reviews.length,
                    primaryButtonText: this.translations.imagesDialogNext,
                    secondaryButtonText: this.translations.imagesDialogPrev,
                },
                templateProps,
            });
        },
    });

    const createReviewsPaginationData = () => ({
        /**
         * Initial events
         */
        init() {
            this.perPage = this.pagination.perPage;
            this.currentPage = this.pagination.currentPage;
            this.totalPages = this.pagination.totalPages;

            this.$watch('currentPage', ({ value }) => {
                this.pagination.currentPage.value = parseInt(value, 10);
            });

            this.$watch('perPage', ({ value }) => {
                if (value === 'all') {
                    this.pagination.perPage.value = this.reviews.length;
                } else {
                    this.pagination.perPage.value = parseInt(value, 10);
                }
                this.currentPage.value = 1;
                this.totalPages = Math.ceil(this.reviews.length / this.pagination.perPage.value);
                this.$nextTick(this.refreshReviews());
            });

            this.$watch('pagination.currentPage', (value) => {
                this.currentPage = value;
            });
        },
    });

    Alpine.data('itemReviews', createItemReviewsData);
    Alpine.data('reviewsPagination', createReviewsPaginationData);
});
