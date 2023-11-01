document.addEventListener('alpine:init', () => {
    const createNestedMenuData = (dataId) => ({
        defaultPaneId: 0,
        currentPane: 0,
        navPanes: [],
        isBackButtonVisible: false,
        init() {
            Utils.loadJsonDataIntoComponent.call(this, dataId);
            this.updateCurrentPane(this.defaultPaneId);
        },
        /**
         * Update current pane
         * @param {String} paneId
         */
        updateCurrentPane(paneId) {
            this.currentPane = paneId;
            this.$nextTick(() => {
                this.isBackButtonVisible = paneId !== this.defaultPaneId;
            });
        },
        /**
         * Animate back to the parent level
         */
        backToParentLevel() {
            const parentPane = this.mapLinksToParent()[this.currentPane];
            this.updateCurrentPane(parentPane ?? this.defaultPaneId);
        },
        openPane(id) {
            this.updateCurrentPane(id ?? this.defaultPaneId);
        },
        /**
         * Map links to parent link
         * Recurse through all links, map link to parentId
         * @return {Object}
         */
        mapLinksToParent() {
            const linksToParent = {};
            this.navPanes.forEach((navLinkPane) => {
                if (navLinkPane.children?.length) {
                    navLinkPane.children.forEach((link) => {
                        linksToParent[link.paneId] = link.parentId;

                        if (link.children?.length) {
                            link.children.forEach((child) => {
                                linksToParent[child.paneId] = child.parentId;
                            });
                        }
                    });
                }
            });
            return linksToParent;
        },
    });
    Alpine.data('nestedMenu', createNestedMenuData);
});
