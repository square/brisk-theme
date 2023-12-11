document.addEventListener('alpine:init', () => {
    const defaultState = () => ({
        isDialogOpen: false,
        isDialogLoading: true,
        isSecondaryDialogOpen: false,
        isDialogContentReady: false,
        hidePrimaryDialog: false,
        isMultiPane: false,
        isButtonVisible: false,
        isHeaderVisible: true,
        isFooterVisible: false,
    });
    const defaultOptions = () => ({
        title: '',
        currentPane: 0,
        totalPane: 1,
        size: 'small', // small or large
        variant: 'simple', // simple, multi-pane, halfsheet, fullscreen
        scrollable: true,
        flush: false, // set true to remove padding from dialog content
        showCloseButton: true,
        showPrimaryButton: false,
        showSecondaryButton: false,
        disablePrimaryButton: false,
        disableSecondaryButton: false,
        primaryButtonText: 'Confirm',
        secondaryButtonText: 'Cancel',
        buttonPosition: 'footer', // footer or header
    });

    Alpine.store('dialog', {
        primaryDialogConfig: {},
        secondaryDialogConfig: {},
        ...defaultState(),
        options: defaultOptions(),
        dialogHeading: '',
        timeout: null,
        onClose: () => {},
        clicked: false,
        /**
         * Manually updating transition attributes b/c it must be replaced before the dialog is initialized.
         * @param {Object} _
         * @param {Object} dialogOptions
         */
        updateTransitionAttrs(_, dialogOptions) {
            // Grabs all elements with `dialog-transition-override` attribute
            const elements = document.querySelectorAll('[dialog-transition-override]');
            const transitionClass = ['left', 'right', 'down'].includes(dialogOptions?.transition)
                ? `${dialogOptions.transition}`
                : 'down';

            elements.forEach((selector) => {
                selector.setAttribute('x-transition:enter', `slide-${transitionClass}-enter-active`);
                selector.setAttribute('x-transition:enter-start', `slide-${transitionClass}-enter-from`);
                selector.setAttribute('x-transition:enter-end', `slide-${transitionClass}-enter-to`);
                selector.setAttribute('x-transition:leave', `slide-${transitionClass}-leave-active`);
                selector.setAttribute('x-transition:leave-start', `slide-${transitionClass}-leave-from`);
                selector.setAttribute('x-transition:leave-end', `slide-${transitionClass}-leave-to`);
            });
        },
        /**
         * Opens the primary dialog
         * @param {String} templateUrl
         * @param {Object} dialogOptions
         * @param {Object} templateProps
         */
        openPrimaryDialog(...args) {
            this.primaryDialogConfig = args;
            this.isDialogOpen = true;
            this.isDialogLoading = true;
            this.isDialogContentReady = false;

            this.updateTransitionAttrs(...args);

            this.openDialogContent(...args).then(() => {
                setTimeout(() => {
                    this.isDialogLoading = false;
                }, 500);
            });
        },
        /**
         * Opens the secondary dialog and hides the primary dialog
         * @param {String} templateUrl
         * @param {Object} dialogOptions
         * @param {Object} templateProps
         */
        async openSecondaryDialog(...args) {
            this.secondaryDialogConfig = args;
            this.isSecondaryDialogOpen = true;
            this.isDialogLoading = true;
            this.isDialogContentReady = false;

            this.openDialogContent(...args, false).then(() => {
                setTimeout(() => {
                    this.isDialogLoading = false;
                }, 500);
            });
        },
        /**
         * Get current dialog options
         * @return {Object}
         */
        currentDialogOptions() {
            if (this.isSecondaryDialogOpen && this.isDialogLoading) {
                return { ...defaultOptions(), ...this.primaryDialogConfig[1] };
            }
            if (this.isDialogOpen && !this.isSecondaryDialogOpen && this.isDialogLoading) {
                return { ...defaultOptions(), ...this.secondaryDialogConfig[1] };
            }
            return this.options;
        },
        /**
         * Opens the dialog
         * @param {String} templateUrl
         * @param {Object} dialogOptions
         * @param {Object} templateProps
         * @param {Boolean} isPrimary
         */
        openDialogContent(templateUrl, dialogOptions = {}, templateProps = {}, isPrimary = true) {
            this.options = {
                ...defaultOptions(),
                ...dialogOptions,
            };

            if (!this.isSecondaryDialogOpen) {
                Alpine.store('global').onOverlayToggle(true, '[role="dialog"]');
            }

            const node = document.querySelector(isPrimary ? '.ui-dialog__primary-dialog [x-ref="dialogContent"]' : '.ui-dialog__secondary-dialog [x-ref="dialogContent"]');

            return SquareWebSDK.template.getTemplate({
                template: templateUrl,
                props: templateProps,
            })
                .then(async (text) => {
                    this.dialogHeading = this.options.title;
                    this.isMultiPane = this.options.variant === 'multi-pane';

                    if (this.isMultiPane) {
                        this.options.showPrimaryButton = true;
                        this.options.showSecondaryButton = true;
                    }

                    this.isButtonVisible = this.options.showPrimaryButton
                        || this.options.showSecondaryButton;
                    this.isHeaderVisible = (this.options.buttonPosition === 'header' && this.isButtonVisible)
                        || Boolean(this.dialogHeading)
                        || this.options.showCloseButton;
                    this.isFooterVisible = this.options.buttonPosition === 'footer' && this.isButtonVisible;

                    // Temporarily wrap the content with <template> so Alpine doesn't initialize x-data attributes
                    node.innerHTML = `<template>${text}<div id="async-template-wrapper"></div></template>`;
                    // Wait until the dialog content is ready
                    await Utils.waitUntil(() => node.querySelector('template')?.content);
                    // Finds all script tags
                    const templateContent = node.querySelector('template').content;
                    let scripts = templateContent.querySelectorAll('script');
                    const asyncTemplates = templateContent.querySelectorAll('[data-async-name]');
                    const asyncPromises = [];
                    const scriptPromises = [];

                    // Finds all script tags from async templates
                    asyncTemplates.forEach((templateNode) => {
                        asyncPromises.push(SquareWebSDK.template.getTemplate({
                            template: templateNode.dataset.asyncTemplate,
                            props: JSON.parse(atob(templateNode.dataset.asyncProps)),
                            loading: null,
                        }).then(async (asyncText) => {
                            templateContent.querySelector('#async-template-wrapper').innerHTML = asyncText;
                            const asyncTemplateScripts = templateContent.querySelectorAll('#async-template-wrapper script');
                            if (asyncTemplateScripts.length) {
                                scripts = [...scripts, ...asyncTemplateScripts];
                            }
                        }));
                    });

                    if (asyncPromises.length) {
                        await Promise.all(asyncPromises);
                    }

                    scripts.forEach((script) => {
                        if (script.src) {
                            scriptPromises.push(Utils.loadScript(script.src));
                        }
                    });

                    if (scriptPromises.length) {
                        // Load scripts
                        await Promise.all(scriptPromises);
                        // Initiate Alpine after all scripts are loaded
                        document.dispatchEvent(new CustomEvent('async:alpine:init'));
                    }
                    // Re-assign the dialog content without the <template> tag
                    node.innerHTML = text;

                    document.body.setAttribute('dialog-size', this.options.size);
                    document.body.setAttribute('dialog-variant', this.options.variant);

                    this.isDialogContentReady = true;
                })
                .catch(() => {
                    node.innerHTML = '<p>Something went wrong. Please try again.</p>';
                    this.isDialogLoading = false;
                });
        },
        /**
         * Checks if the primary dialog should be visible
         * @return {Boolean}
         */
        shouldShowPrimaryDialog() {
            const store = Alpine.store('dialog');
            return store.isDialogOpen && !store.isDialogLoading && !store.isSecondaryDialogOpen;
        },
        /**
         * Checks if the secondary dialog should be visible
         * @return {Boolean}
         */
        shouldShowSecondaryDialog() {
            const store = Alpine.store('dialog');
            return store.isSecondaryDialogOpen && !store.isDialogLoading;
        },
        /**
         * The secondary button click event
         */
        secondaryButtonClick() {
            const store = Alpine.store('dialog');
            if (store.isMultiPane) {
                if (store.options.currentPane > 0) {
                    store.options.currentPane -= 1;
                }
            } else {
                store.closeDialog(false);
            }
        },
        /**
         * The primary button click event
         */
        primaryButtonClick() {
            const store = Alpine.store('dialog');
            if (store.isMultiPane) {
                if (store.options.currentPane < store.options.totalPane) {
                    store.options.currentPane += 1;
                }
            } else {
                store.closeDialog(true);
            }
        },
        /**
         * Checks if the button should display in the header
         * @return {Boolean}
         */
        isButtonVisibleInHeader() {
            return this.isButtonVisible && this.options.buttonPosition === 'header';
        },
        /**
         * Checks if the secondary button should be disabled
         * @return {Boolean}
         */
        isSecondaryButtonDisabled() {
            const store = Alpine.store('dialog');
            return (store.isMultiPane && store.options.currentPane === 0) || store.options.disableSecondaryButton;
        },
        /**
         * Checks if the primary button should be disabled
         * @return {Boolean}
         */
        isPrimaryButtonDisabled() {
            const store = Alpine.store('dialog');
            return (store.isMultiPane && store.options.currentPane + 1 === store.options.totalPane) || store.options.disablePrimaryButton;
        },
        /**
         * Updates the dialog options
         */
        updateDialogOptions(key, value) {
            const store = Alpine.store('dialog');
            store.options[key] = value;
        },
        /**
         * Closes the dialog
         * @param {Boolean} isConfirmed primary (confirmed) button is clicked
         */
        async closeDialog(isConfirmed) {
            const store = Alpine.store('dialog');
            store.isDialogContentReady = false;
            store.onClose(isConfirmed, store.isSecondaryDialogOpen);

            if (store.isSecondaryDialogOpen) {
                store.isSecondaryDialogOpen = false;
                store.isDialogLoading = true;
                store.openDialogContent(...store.primaryDialogConfig).then(() => {
                    setTimeout(() => {
                        store.isDialogLoading = false;
                    }, 500);
                });
            } else {
                store.isDialogOpen = false;
                document.body.removeAttribute('dialog-size');
                document.body.removeAttribute('dialog-variant');
                Alpine.store('global').onOverlayToggle(false);
            }
        },
    });
});
