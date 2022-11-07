(() => {
    "use strict";
    const flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(2 == webP.height);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = true === support ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    function getHash() {
        if (location.hash) return location.hash.replace("#", "");
    }
    let bodyLockStatus = true;
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }
    function FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                attributeOpenButton: "data-popup",
                attributeCloseButton: "data-close",
                fixElementSelector: "[data-lp]",
                youtubeAttribute: "data-popup-youtube",
                youtubePlaceAttribute: "data-popup-youtube-place",
                setAutoplayYoutube: true,
                classes: {
                    popup: "popup",
                    popupContent: "popup__content",
                    popupActive: "popup_show",
                    bodyActive: "popup-show"
                },
                focusCatch: true,
                closeEsc: true,
                bodyLock: true,
                hashSettings: {
                    location: true,
                    goHash: true
                },
                on: {
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.youTubeCode;
            this.isOpen = false;
            this.targetOpen = {
                selector: false,
                element: false
            };
            this.previousOpen = {
                selector: false,
                element: false
            };
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.popupLogging(`Проснулся`);
            this.eventsPopup();
        }
        eventsPopup() {
            document.addEventListener("click", function(e) {
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                    if ("error" !== this._dataValue) {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    } else this.popupLogging(`Ой ой, не заполнен атрибут у ${buttonOpen.classList}`);
                    return;
                }
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
            document.addEventListener("keydown", function(e) {
                if (this.options.closeEsc && 27 == e.which && "Escape" === e.code && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (this.options.focusCatch && 9 == e.which && this.isOpen) {
                    this._focusCatch(e);
                    return;
                }
            }.bind(this));
            if (this.options.hashSettings.goHash) {
                window.addEventListener("hashchange", function() {
                    if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
                }.bind(this));
                window.addEventListener("load", function() {
                    if (window.location.hash) this._openToHash();
                }.bind(this));
            }
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                this.bodyLock = document.documentElement.classList.contains("lock") && !this.isOpen ? true : false;
                if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    if (this.youTubeCode) {
                        const codeVideo = this.youTubeCode;
                        const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
                        const iframe = document.createElement("iframe");
                        iframe.setAttribute("allowfullscreen", "");
                        const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
                        iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
                        iframe.setAttribute("src", urlVideo);
                        if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                            this.targetOpen.element.querySelector(".popup__text").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
                        }
                        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
                    }
                    if (this.options.hashSettings.location) {
                        this._getHash();
                        this._setHash();
                    }
                    this.options.on.beforeOpen(this);
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout((() => {
                        this._focusTrap();
                    }), 50);
                    this.options.on.afterOpen(this);
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.popupLogging(`Открыл попап`);
                } else this.popupLogging(`Ой ой, такого попапа нет.Проверьте корректность ввода. `);
            }
        }
        close(selectorValue) {
            if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            this.options.on.beforeClose(this);
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            if (this.youTubeCode) if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            this.options.on.afterClose(this);
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout((() => {
                this._focusTrap();
            }), 50);
            this.popupLogging(`Закрыл попап`);
        }
        _getHash() {
            if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
        }
        _openToHash() {
            let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
            const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
            if (buttons && classInHash) this.open(classInHash);
        }
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && 0 === focusedIndex) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
        popupLogging(message) {
            this.options.logging ? FLS(`[Попапос]: ${message}`) : null;
        }
    }
    flsModules.popup = new Popup({});
    let gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                headerItemHeight = document.querySelector(headerItem).offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            document.documentElement.classList.contains("menu-open") ? menuClose() : null;
            if ("undefined" !== typeof SmoothScroll) (new SmoothScroll).animateScroll(targetBlockElement, "", options); else {
                let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
                targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
                targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
                window.scrollTo({
                    top: targetBlockElementPosition,
                    behavior: "smooth"
                });
            }
            FLS(`[gotoBlock]: Юхуу...едем к ${targetBlock}`);
        } else FLS(`[gotoBlock]: Ой ой..Такого блока нет на странице: ${targetBlock}`);
    };
    let addWindowScrollEvent = false;
    function pageNavigation() {
        document.addEventListener("click", pageNavigationAction);
        document.addEventListener("watcherCallback", pageNavigationAction);
        function pageNavigationAction(e) {
            if ("click" === e.type) {
                const targetElement = e.target;
                if (targetElement.closest("[data-goto]")) {
                    const gotoLink = targetElement.closest("[data-goto]");
                    const gotoLinkSelector = gotoLink.dataset.goto ? gotoLink.dataset.goto : "";
                    const noHeader = gotoLink.hasAttribute("data-goto-header") ? true : false;
                    const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : 500;
                    const offsetTop = gotoLink.dataset.gotoTop ? parseInt(gotoLink.dataset.gotoTop) : 0;
                    gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
                    e.preventDefault();
                }
            } else if ("watcherCallback" === e.type && e.detail) {
                const entry = e.detail.entry;
                const targetElement = entry.target;
                if ("navigator" === targetElement.dataset.watch) {
                    document.querySelector(`[data-goto]._navigator-active`);
                    let navigatorCurrentItem;
                    if (targetElement.id && document.querySelector(`[data-goto="#${targetElement.id}"]`)) navigatorCurrentItem = document.querySelector(`[data-goto="#${targetElement.id}"]`); else if (targetElement.classList.length) for (let index = 0; index < targetElement.classList.length; index++) {
                        const element = targetElement.classList[index];
                        if (document.querySelector(`[data-goto=".${element}"]`)) {
                            navigatorCurrentItem = document.querySelector(`[data-goto=".${element}"]`);
                            break;
                        }
                    }
                    if (entry.isIntersecting) navigatorCurrentItem ? navigatorCurrentItem.classList.add("_navigator-active") : null; else navigatorCurrentItem ? navigatorCurrentItem.classList.remove("_navigator-active") : null;
                }
            }
        }
        if (getHash()) {
            let goToHash;
            if (document.querySelector(`#${getHash()}`)) goToHash = `#${getHash()}`; else if (document.querySelector(`.${getHash()}`)) goToHash = `.${getHash()}`;
            goToHash ? gotoBlock(goToHash, true, 500, 20) : null;
        }
    }
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    window.addEventListener("DOMContentLoaded", (() => {
        const wrapperVideo = document.getElementById("fon");
        const video1 = document.getElementById("video1");
        const video2 = document.getElementById("video2");
        const switchPage = document.querySelector(".checkbox");
        const btnGreen2 = document.querySelector(".content__circle-2");
        const red = document.querySelector(".content__circle-3");
        const btnGreen4 = document.querySelector(".content__circle-4");
        const btnGreen5 = document.querySelector(".content__circle-5");
        const btnGear = document.querySelector(".content__circle-1");
        const noseCircle = document.querySelector(".nose-circle");
        const leftCircle = document.querySelector(".left-circle");
        const rightCircle = document.querySelector(".right-circle");
        const unsafeCircle = document.querySelector(".unsafe-circle");
        const noseReleased = document.querySelector(".nose-released ");
        const leftReleased = document.querySelector(".left-released");
        const rightReleased = document.querySelector(".right-released");
        const noseRemoved = document.querySelector(".nose-removed");
        const leftRemoved = document.querySelector(".left-removed");
        const rightRemoved = document.querySelector(".right-removed");
        const line = document.querySelector(".circle__box-2");
        const r8 = document.getElementById("r8");
        const box__left = document.getElementById("left");
        const box__right = document.getElementById("right");
        const box__nose = document.getElementById("nose");
        const removed__left = document.getElementById("removed__left");
        const removed__right = document.getElementById("removed__right");
        const removed__nose = document.getElementById("removed__nose");
        const p2 = document.getElementById("p2");
        const kv3 = document.getElementById("kv3");
        btnGear.addEventListener("mousedown", (() => {
            if (false == btnGear.classList.contains("q") && false == switchPage.classList.contains("t")) {
                btnGear.classList.add("q");
                btnGear.style.background = "rgba(164, 164, 164, 1.0)";
                btnGear.style.background = "-webkit-linear-gradient(bottom right, rgba(164, 164, 164, 1.0), rgba(15, 15, 14, 1.0))";
                btnGear.style.background = "-moz-linear-gradient(bottom right, rgba(164, 164, 164, 1.0), rgba(15, 15, 14, 1.0))";
                btnGear.style.background = "linear-gradient(to top left, rgba(164, 164, 164, 1.0), rgba(15, 15, 14, 1.0))";
                btnGreen2.style.backgroundColor = "#41ff07";
                btnGreen4.style.backgroundColor = "#41ff07";
                btnGreen5.style.backgroundColor = "#41ff07";
                noseCircle.style.backgroundColor = "#41ff07";
                leftCircle.style.backgroundColor = "#41ff07";
                rightCircle.style.backgroundColor = "#41ff07";
                noseCircle.style.opacity = ".8";
                leftCircle.style.opacity = ".8";
                rightCircle.style.opacity = ".8";
            }
        }));
        btnGear.addEventListener("mouseup", (() => {
            if (btnGear.classList.contains("q") && false == switchPage.classList.contains("t")) {
                btnGear.classList.remove("q");
                btnGear.style.background = "rgba(164, 164, 164, 1.0)";
                btnGear.style.background = "-webkit-linear-gradient(top left, rgba(164, 164, 164, 1.0), rgba(15, 15, 14, 1.0))";
                btnGear.style.background = "-moz-linear-gradient(top left, rgba(164, 164, 164, 1.0), rgba(15, 15, 14, 1.0))";
                btnGear.style.background = "linear-gradient(to bottom right, rgba(164, 164, 164, 1.0), rgba(15, 15, 14, 1.0))";
                btnGreen2.style.backgroundColor = "#378521";
                btnGreen4.style.backgroundColor = "#378521";
                btnGreen5.style.backgroundColor = "#378521";
                noseCircle.style.backgroundColor = "#378521";
                leftCircle.style.backgroundColor = "#378521";
                rightCircle.style.backgroundColor = "#378521";
                noseCircle.style.opacity = ".3";
                leftCircle.style.opacity = ".3";
                rightCircle.style.opacity = ".3";
            }
        }));
        window.onload = function() {
            switchPage.addEventListener("click", (() => {
                wrapperVideo.play();
                video1.play();
                video2.play();
                setTimeout((() => {
                    wrapperVideo.play();
                    video1.play();
                    video2.play();
                }), 1e3);
                setTimeout((() => {
                    wrapperVideo.pause();
                }), 15e3);
                setTimeout((() => {
                    video1.pause();
                }), 15105);
                setTimeout((() => {
                    video2.pause();
                }), 16055);
            }));
        };
        switchPage.addEventListener("click", (() => {
            if (false == switchPage.classList.contains("t")) {
                switchPage.classList.add("t");
                document.getElementById("checkbox").disabled = true;
                setTimeout((() => {
                    document.getElementById("checkbox").disabled = false;
                }), 16700);
                noseRemoved.style.color = "inherit";
                leftRemoved.style.color = "inherit";
                rightRemoved.style.color = "inherit";
                p2.style.transform = "rotate(9deg)";
                kv3.style.transform = "rotate(-180deg)";
                line.style.transform = "rotate(20deg)";
                removed__nose.style.transform = "rotate(-134deg)";
                removed__left.style.transform = "rotate(-134deg)";
                removed__right.style.transform = "rotate(-134deg)";
                red.style.backgroundColor = "#ff0000";
                unsafeCircle.style.backgroundColor = "#ff0000";
                unsafeCircle.style.opacity = ".8";
                setTimeout((() => {
                    btnGreen2.style.backgroundColor = "#41ff07";
                    noseReleased.style.color = "#189918";
                    noseCircle.style.backgroundColor = "#41ff07";
                    noseCircle.style.opacity = ".8";
                    r8.style.transform = "rotate(-180deg)";
                    box__nose.style.transform = "rotate(-180deg)";
                }), 14e3);
                setTimeout((() => {
                    btnGreen4.style.backgroundColor = "#41ff07";
                    leftReleased.style.color = "#189918";
                    leftCircle.style.backgroundColor = "#41ff07";
                    leftCircle.style.opacity = ".8";
                    box__left.style.transform = "rotate(-180deg)";
                }), 15e3);
                setTimeout((() => {
                    box__right.style.transform = "rotate(-180deg)";
                    btnGreen5.style.backgroundColor = "#41ff07";
                    rightReleased.style.color = "#189918";
                    rightCircle.style.backgroundColor = "#41ff07";
                    rightCircle.style.opacity = ".8";
                    unsafeCircle.style.backgroundColor = "#750202";
                    unsafeCircle.style.opacity = ".3";
                    red.style.backgroundColor = "#750202";
                }), 16700);
            } else {
                switchPage.classList.remove("t");
                document.getElementById("checkbox").disabled = true;
                setTimeout((() => {
                    document.getElementById("checkbox").disabled = false;
                }), 16e3);
                r8.style.transform = "rotate(-134deg)";
                box__nose.style.transform = "rotate(-134deg)";
                box__left.style.transform = "rotate(-134deg)";
                box__right.style.transform = "rotate(-134deg)";
                noseReleased.style.color = "inherit";
                leftReleased.style.color = "inherit";
                rightReleased.style.color = "inherit";
                line.style.transform = "rotate(-29deg)";
                kv3.style.transform = "rotate(-134deg)";
                noseCircle.style.backgroundColor = "#378521";
                noseCircle.style.opacity = ".3";
                leftCircle.style.backgroundColor = "#378521";
                leftCircle.style.opacity = ".3";
                rightCircle.style.backgroundColor = "#378521";
                rightCircle.style.opacity = ".3";
                btnGreen2.style.backgroundColor = "#378521";
                btnGreen4.style.backgroundColor = "#378521";
                btnGreen5.style.backgroundColor = "#378521";
                unsafeCircle.style.backgroundColor = "#ff0000";
                unsafeCircle.style.opacity = ".8";
                red.style.backgroundColor = "#ff0000";
                setTimeout((() => {
                    p2.style.transform = "rotate(-29deg)";
                    noseRemoved.style.color = "#189918";
                    leftRemoved.style.color = "#189918";
                    rightRemoved.style.color = "#189918";
                    removed__nose.style.transform = "rotate(-180deg)";
                    removed__left.style.transform = "rotate(-180deg)";
                    removed__right.style.transform = "rotate(-180deg)";
                    unsafeCircle.style.backgroundColor = "#750202";
                    unsafeCircle.style.opacity = ".3";
                    red.style.backgroundColor = "#750202";
                }), 13e3);
            }
        }));
    }));
    window["FLS"] = true;
    isWebp();
    pageNavigation();
})();