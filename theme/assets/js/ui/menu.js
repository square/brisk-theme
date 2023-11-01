if (!window.onMenuUIReady) {
    window.onMenuUIReady = () => {
        const createMenuUIData = (dataId) => ({
            menuTriggerEl: null,
            menuTriggerRef: '',
            menuValue: null,
            menuItems: [],
            hoverIndex: 0,
            totalItems: 0,
            /**
             * Initial events (We can't use `init()` b/c it'll get overwritten by the block data)
             */
            initMenuUI() {
                Utils.loadJsonDataIntoComponent.call(this, dataId);
            },
            /**
             * Menu item focus event
             */
            onMenuItemFocus() {
                this.menuTriggerEl = this.$refs[this.menuTriggerRef];
                if (this.hoverIndex === 0) {
                    this.hoverIndex = 1;
                }
                this.totalItems = this.$refs.menu.querySelectorAll('li').length;
            },
            /**
             * Menu item blur event
             */
            onMenuItemBlur() {
                this.hoverIndex = this.menuTriggerEl ? 0 : 1;
            },
            /**
             * Keyboard arrow down event
             */
            onKeyDown() {
                if (this.totalItems && this.hoverIndex < this.totalItems) {
                    this.hoverIndex += 1;
                    this.scrollToHoverItem();
                }
            },
            /**
             * Keyboard arrow up event
             */
            onKeyUp() {
                const minIndex = this.menuTriggerEl ? 0 : 1;
                if (this.totalItems && this.hoverIndex > minIndex && this.hoverIndex <= this.totalItems) {
                    this.hoverIndex -= 1;

                    if (this.hoverIndex === 0 && this.menuTriggerEl) {
                        this.menuTriggerEl.focus();
                    }

                    if (this.hoverIndex > 0) {
                        this.scrollToHoverItem();
                    }
                }
            },
            /**
             * Keyboard enter event
             */
            onKeyEnter() {
                const selectedIndex = this.hoverIndex - 1;
                this.onMenuItemClick(this.hoverIndex, this.menuItems[selectedIndex]?.value);
            },
            /**
             * Menu item click event
             * @param {Number} index
             * @param {Object} value
             */
            onMenuItemClick(index, value) {
                this.menuValue = this.menuItems[index - 1] ?? value;
            },
            /**
             * Scroll to the hover item
             */
            scrollToHoverItem() {
                const hoverItem = this.$refs.menu.querySelectorAll('li')[this.hoverIndex - 1];
                const hoverItemOffset = hoverItem.offsetTop;
                const menuHeight = this.$refs.menu.offsetHeight;
                const menuScrollTop = this.$refs.menu.scrollTop;
                const scrollMax = menuHeight + ((menuHeight - menuScrollTop) % menuHeight);

                if (hoverItem && hoverItemOffset < scrollMax) {
                    this.$refs.menu.scrollTo({
                        top: hoverItem.offsetTop,
                        behavior: 'smooth',
                    });
                }
            },
        });

        Alpine.data('menuUI', createMenuUIData);
    };
}

document.addEventListener('alpine:init', window.onMenuUIReady);
document.addEventListener('async:alpine:init', window.onMenuUIReady);
