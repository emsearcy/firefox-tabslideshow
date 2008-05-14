/*
 * tabslideshow.js
 *
 * Tab Slideshow Firefox extension
 * emsearcy@osuosl.org
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

        this.time = this.prefs.getIntPref('time');
        this.refresh = this.prefs.getBoolPref('refresh');
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
        if (p_this.refresh && (nexttab != upcomingtab)) {
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
            setTimeout(this.cycle, 1000 * this.time, this);
        }
    },

    // clean up
    shutdown: function()
    {
        this.prefs.removeObserver("", this);
    }
}

window.addEventListener('load', function(e) { tabslideshow.startup(); },
        false);
window.addEventListener('unload', function(e) { tabslideshow.shutdown(); },
        false);
