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
    active: 0,
    time: 5,
    refresh: false,

    // initialize the extension
    startup: function()
    {
        // grab services
        this.prefs = Components.classes['@mozilla.org/preferences-service;1']
                .getService(Components.interfaces.nsIPrefService)
                .getBranch('tabslideshow.');
        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.prefs.addObserver('', this, false);

        // save prefs
        this.time = this.prefs.getIntPref('time');
        this.refresh = this.prefs.getBoolPref('refresh');

        // add tab context menu entries and hook
        var tabmenu = tabslideshow_gettabcontextmenu();
        tabmenu.insertBefore(document.getElementById('tabslideshow-refresh'),
                document.getElementById('context_closeTab'));
        tabmenu.insertBefore(document.getElementById('tabslideshow-separator'),
                document.getElementById('context_closeTab'));
        tabmenu.addEventListener('popupshowing', tabslideshow.tabmenushow,
                false);
        // remove now-empty menupopup container
        var popup = document.getElementById("tabslideshowPopup");
        popup.parentNode.removeChild(popup);

        // initial tabs refresh settings
        for ( var tab in gBrowser.tabContainer.childNodes ) {
            gBrowser.tabContainer.childNodes[tab].tabslideshowrefresh =
                    this.refresh;
        }

        // add listener for new tabs
        gBrowser.tabContainer.addEventListener('TabOpen', function(e) {
                tabslideshow.checknewtab(e);
            }, false);

        // initial fullscreen
        if (this.prefs.getBoolPref('start')) {
            this.toggle();
        }
    },

    // timer function to cycle tabs
    cycle: function(p_this)
    {
        // only cycle if active
        if (p_this.active < 2) {
            p_this.active = 0;
            return;
        }

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
        if (p_this.refresh && upcomingtab.tabslideshowrefresh &&
                (nexttab != upcomingtab)) {
            gBrowser.reloadTab(upcomingtab);
        }

        // next cycle
        setTimeout(p_this.cycle, 1000 * p_this.time, p_this);
    },

    // handler for prefs change
    observe: function(subject, topic, data)
    {
        if (topic != 'nsPref:changed') return;

        switch(data) {
            case 'time':
                this.time = this.prefs.getIntPref('time');
                break;
            case 'refresh':
                this.refresh = this.prefs.getBoolPref('refresh');
                break;
        }
    },

    // handle new tab refresh settings
    checknewtab: function(e)
    {
        Components.utils.reportError("checknewtab")
        e.target.tabslideshowrefresh = this.refresh;
    },

    // per-tab menu adjustments
    tabmenushow: function(e)
    {
        Components.utils.reportError('tabmenushow');

        if (e.originalTarget != gBrowser.tabContextMenu) {
            Components.utils.reportError("branch A")
            return true;
        }

        var item;
        var refresh = document.getElementById('tabslideshow-refresh');
        if (document.popupNode.parentNode) {
            Components.utils.reportError("branch B")
            item = document.popupNode.parentNode.parentNode.id;
        }
        // XXX: copied from tabmixplus, not sure what does
        if (item && (item == "btn_tabslist" || item == "btn_tabslistSorted" ||
                item == "alltabs-button")) {
            Components.utils.reportError("branch C")
            gBrowser.mContextTab = document.popupNode.tab;
        }

        var clickOutTabs = document.popupNode.localName == "tabs";
        var aTab = clickOutTabs ? gBrowser.mCurrentTab : gBrowser.mContextTab;
           
        if (clickOutTabs) refresh.disabled = true;
        else refresh.disabled = false;

        if (aTab.tabslideshowrefresh) {
            refresh.setAttribute("checked", "true");
        } else {
            refresh.removeAttribute("checked");
        }

    },

    // toggle whether slideshowing
    toggle: function()
    {
        if (this.active == 2) {
            // disabled
            var node = document.getElementById('tabslideshow-toggle');
            if (node) node.setAttribute('label', 'Start Tab Slideshow');
            this.active = 1;
        } else if (this.active == 1) {
            // disabled with active timeout
            var node = document.getElementById('tabslideshow-toggle');
            if (node) node.setAttribute('label', 'Stop Tab Slideshow');
            this.active = 2;
        } else {
            // disabled, no active timeout
            var node = document.getElementById('tabslideshow-toggle');
            if (node) node.setAttribute('label', 'Stop Tab Slideshow');
            this.active = 2;
            setTimeout(this.cycle, 1500, this);
        }
    },

    // change refresh flag on tab
    togglerefresh: function(e)
    {
        Components.utils.reportError('togglerefresh');
        e.tabslideshowrefresh = !e.tabslideshowrefresh;
    },

    // clean up
    shutdown: function()
    {
        this.prefs.removeObserver("", this);
    },

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

window.addEventListener('load', function(e) { tabslideshow.startup(); },
        false);
window.addEventListener('unload', function(e) { tabslideshow.shutdown(); },
        false);
