/*
 * tabslideshow.js
 *
 * Tab Slideshow Firefox extension
 * emsearcy@gmail.com
 *
 * Licensed under MPL (http://www.mozilla.org/MPL/MPL-1.1.html)
 */

var tabslideshow = {
    prefs: null,
    /* active values:
        0: inactive
        1: going to inactive (next timeout)
        2: active
    */
    active: false,
    delay: 5,
    refresh: false,
    timer: null,

    // initialize the extension
    startup: function()
    {
        Components.utils.reportError("startup");
        // grab services
        this.prefs = Components.classes['@mozilla.org/preferences-service;1']
                .getService(Components.interfaces.nsIPrefService)
                .getBranch('tabslideshow.');
        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.prefs.addObserver('', this, false);
        this.timer = Components.classes["@mozilla.org/timer;1"]
                .createInstance(Components.interfaces.nsITimer);

        // save prefs
        this.delay = this.prefs.getIntPref('time');
        this.refresh = this.prefs.getBoolPref('refresh');

        // add tab context menu entries and hook
        var tabmenu = tabslideshow_gettabcontextmenu();
        var target = document.getElementById('context_openTabInWindow');
        if (target) target = target.nextSibling;
        if (target) {
            tabmenu.insertBefore(document.getElementById(
                    'tabslideshow-separator'), target);
            tabmenu.insertBefore(document.getElementById(
                    'tabslideshow-refresh'), target);
        } else {
            tabmenu.appendChild(document.getElementById(
                    'tabslideshow-separator'));
            tabmenu.appendChild(document.getElementById(
                    'tabslideshow-refresh'));
        }
        tabmenu.addEventListener('popupshowing', tabslideshow.tabmenushow,
                false);
        // remove now-empty menupopup container
        var popup = document.getElementById("tabslideshowPopup");
        popup.parentNode.removeChild(popup);

        // initial tabs refresh settings
        for (var tab in gBrowser.tabContainer.childNodes) {
            gBrowser.tabContainer.childNodes[tab].tabslideshowrefresh =
                    this.refresh;
        }

        // add listener for new tabs
        gBrowser.tabContainer.addEventListener('TabOpen', function(e) {
                tabslideshow.checknewtab(e);
            }, false);

        // initial slideshow
        if (this.prefs.getBoolPref('start')) {
            this.toggle();
        }
    },

    // handler for prefs change
    observe: function(subject, topic, data)
    {
        if (topic != 'nsPref:changed') return;

        switch(data) {
            case 'time':
                this.delay = this.prefs.getIntPref('time');
                break;
            case 'refresh':
                this.refresh = this.prefs.getBoolPref('refresh');
                break;
        }
    },

    // handle new tab refresh settings
    checknewtab: function(e)
    {
        Components.utils.reportError("checknewtab");
        e.target.tabslideshowrefresh = this.refresh;
    },

    // per-tab menu adjustments
    tabmenushow: function(e)
    {
        //Components.utils.reportError('tabmenushow');
        if (e.originalTarget != gBrowser.tabContextMenu) {
            return true;
        }

        var item;
        var refresh = document.getElementById('tabslideshow-refresh');
        if (document.popupNode.parentNode) {
            item = document.popupNode.parentNode.parentNode.id;
        }
        // XXX: copied from tabmixplus, not sure what does
        if (item && (item == "btn_tabslist" || item == "btn_tabslistSorted" ||
                item == "alltabs-button")) {
            gBrowser.mContextTab = document.popupNode.tab;
        }

        // detect whether clicked right of tabs (not needed in Firefox 4)
        var clickOutTabs = document.popupNode.localName == "tabs";
        var aTab = clickOutTabs ? gBrowser.mCurrentTab : gBrowser.mContextTab;
           
        // disable refresh option for current tab when clicked outside
        //if (clickOutTabs) refresh.setAttribute("disabled", "true");
        //else refresh.setAttribute("disabled", "false");

        if (aTab.tabslideshowrefresh) {
            refresh.setAttribute("checked", "true");
        } else {
            refresh.removeAttribute("checked");
        }

    },

    // toggle whether slideshowing
    toggle: function()
    {
        Components.utils.reportError("toggle");
        if (this.active) {
            // enabled
            var node = document.getElementById('tabslideshow-toggle');
            if (node) node.setAttribute('label', 'Start Tab Slideshow');
            var node = document.getElementById('tabslideshow-appmenu-toggle');
            if (node) node.setAttribute('label', 'Start Tab Slideshow');
            this.timer.cancel();
            this.active = false;
        } else {
            // disabled
            var node = document.getElementById('tabslideshow-toggle');
            if (node) node.setAttribute('label', 'Stop Tab Slideshow');
            var node = document.getElementById('tabslideshow-appmenu-toggle');
            if (node) node.setAttribute('label', 'Stop Tab Slideshow');
            Components.utils.reportError("init timer");

            this.timer.initWithCallback(tabslideshow_cycle, this.delay*1000, Components.interfaces.nsITimer.TYPE_REPEATING_PRECISE);
            this.active = true;
        }
    },

    // change refresh flag on tab
    togglerefresh: function(e)
    {
        //Components.utils.reportError('togglerefresh');
        e.tabslideshowrefresh = !e.tabslideshowrefresh;
    },

    // clean up
    shutdown: function()
    {
        this.prefs.removeObserver("", this);
        this.timer.cancel();
    },

}

// timer event with function to cycle tabs
var tabslideshow_cycle = {
    notify: function(timer) {
        Components.utils.reportError("cycle.notify");
        // get tab info
        var numtabs = gBrowser.tabContainer.childNodes.length;
        var currenttabnum = gBrowser.tabContainer.selectedIndex;
        var nexttab = gBrowser.tabContainer.childNodes[
            (currenttabnum + 1) % numtabs];
        var upcomingtab = gBrowser.tabContainer.childNodes[
            (currenttabnum + 2) % numtabs];

        // set next tab
        gBrowser.selectedTab = nexttab;

        // optionally refresh upcoming tab
        if (upcomingtab.tabslideshowrefresh && (nexttab != upcomingtab)) {
            gBrowser.reloadTab(upcomingtab);
        }
    }
}

// return tab context menu
function tabslideshow_gettabcontextmenu()
{
    if (gBrowser.tabContextMenu) return gBrowser.tabContextMenu;

    var tabmenu = document.getAnonymousElementByAttribute(
            gBrowser, "anonid", "tabContextMenu");
    if (tabmenu) {
        gBrowser.tabContextMenu = tabmenu;
    } else if (gBrowser.tabContainer && gBrowser.tabContainer.contextMenu) {
        gBrowser.tabContextMenu = gBrowser.tabContainer.contextMenu;
    } else {
        gBrowser.tabContextMenu = document.getElementById('tabContextMenu');
    }

    if (!gBrowser.tabContextMenu.hasAttribute("id"))
        gBrowser.tabContextMenu.setAttribute("id", "tabContextMenu");

    return gBrowser.tabContextMenu;
}

Components.utils.reportError("init");
window.addEventListener('load', function(e) { tabslideshow.startup(); },
        false);
window.addEventListener('unload', function(e) { tabslideshow.shutdown(); },
        false);
