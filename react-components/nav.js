
// create an "Event Bus" emitter instance that can be used to communicate between components

window.reactEventBus = window.mitt();

// mount a react component on the #react-nav element,
// use the nav links data to generate the dom


if (window.React && window.ReactDOM) {
    const navElement = document.querySelector("#react-nav");
    const megaMenuElement = document.querySelector("#react-megamenu");

    const data = {};
    Utils.loadJsonDataIntoComponent.call(data, 'nav-links-data');

    const Navigation = ({ links }) => {

        const [displayedLink, setDisplayedLink] = React.useState(null);
        const megamenuCloseTimer = React.useRef(null);

        const onMouseEnter = (link) => {
            cancelDelayedMegaMenuClose();
            displayLinkInMegaMenu(link);
        }

        const onMouseLeave = () => {
            closeMegaMenuWithDelay();
        }

        /**
         * Close the mega menu after a delay
        */
        const closeMegaMenuWithDelay = () => {
            cancelDelayedMegaMenuClose();
            megamenuCloseTimer.current = setTimeout(() => closeMegaMenu(), 600);
        };

        /**
         * Close the mega menu
        */
        const closeMegaMenu = () => {
            displayLinkInMegaMenu(null);
        };

        /**
         * If the megamenu is about to be closed, cancels the upcoming close
        */
        const cancelDelayedMegaMenuClose = () => {
            if (megamenuCloseTimer.current) {
                clearTimeout(megamenuCloseTimer.current);
            }
        };
        

        /**
         * Show the children from that nav in the megamenu
         * @param {Object} link - the nav link
        */
        const displayLinkInMegaMenu = (link) => {
            // Get the children of the link that was hovered, display them
            setDisplayedLink(link);
            window.reactEventBus.emit('nav:display-link', link);

            Alpine.store('global').isMegaMenuVisible = !!link;
        }

        // If the megamenu was entered, don't close it
        window.reactEventBus.on('nav:megamenu-entered', cancelDelayedMegaMenuClose);

        return (
            <ul class="site-header__nav-linklist">
                {
                    Object.values(links).map(link =>
                        <li onMouseEnter={() => onMouseEnter(link)} onMouseLeave={onMouseLeave}>
                            <a class="site-header__nav-link" className={displayedLink?.title === link.title && 'is-active'} href={link.url}>
                                {link.title}
                            </a>
                        </li>
                    )
                }
            </ul>
        );
    }
    const MegaMenu = () => {
        const [displayedLink, setDisplayedLink] = React.useState(null);
        window.reactEventBus.on('nav:display-link', setDisplayedLink);

        if (!displayedLink?.children) {
            return null;
        }

        /**
         * If the megamenu is about to be closed, cancels the upcoming close
        */
        const cancelDelayedMegaMenuClose = () => {
            window.reactEventBus.emit('nav:megamenu-entered');
        };

        const onMouseLeave = () => {
            closeMegaMenu();
        }

        /**
         * Close the mega menu
        */
        const closeMegaMenu = () => {
            displayLinkInMegaMenu(null);
        };

        /**
         * Show the children from displayed link
         * @param {Object|null} link - the nav link
        */
        const displayLinkInMegaMenu = (link) => {
            // Get the children of the link that was hovered, display them
            setDisplayedLink(link);
            window.reactEventBus.emit('nav:display-link', link);
        }

        return (
            <div
                class="mega-menu container"
                onMouseLeave={onMouseLeave}
                onMouseEnter={cancelDelayedMegaMenuClose}
            >
                <div
                    class="custom-scrollbar mega-menu-scrollbar"
                >
                    <div class="mega-menu__inner row custom-scrollbar-inner">
                        <div
                            class="mega-menu__submenu-grid col"
                            col-6={displayedLink?.menu_image_url}
                            col-12={!displayedLink?.menu_image_url}
                        >
                            <div class="row">
                                {
                                    Object.values(displayedLink.children).map((navItem, menuIndex) => {
                                        return <div
                                            class="mega-menu__submenu col"
                                            col-xs-12 col-sm-6
                                            col-md-4={displayedLink?.menu_image_url}
                                            col-md-2={!displayedLink?.menu_image_url}
                                            key={menuIndex}
                                        >
                                            <div
                                                class="mega-menu__child-nav"
                                            >
                                                <a class="mega-menu__child-nav-title"
                                                    href={navItem.url}
                                                >
                                                    {navItem.title}
                                                </a>
                                                <ul
                                                    class="mega-menu__child-nav-links"
                                                >
                                                    {
                                                        navItem.children && Object.values(navItem.children).map((navItemChild, navItemChildIndex) => (<li>
                                                            <a
                                                                href={navItemChild.url}
                                                                key={navItemChildIndex}
                                                                class="mega-menu__child-nav-item">
                                                                {navItemChild.title}
                                                            </a>
                                                        </li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                        {
                            displayedLink?.menu_image_url && (
                                <div
                                    class="mega-menu__image-wrapper col"
                                    col-5 offset-1
                                >
                                    <img
                                        class="mega-menu__image"
                                        src={displayedLink.menu_image_url}
                                    />
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }

    // Render the Navigation component on the navElement
    ReactDOM.render(<Navigation links={data.navLinks} />, navElement);
    ReactDOM.render(<MegaMenu links={data.navLinks} />, megaMenuElement);
}