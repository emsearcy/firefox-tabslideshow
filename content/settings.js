function tabslideshowSaveOptions()
{
    // Reference to XPCOM preference service
    var tabslideshowPrefs = Components.classes['@mozilla.org/preferences-service;1'].
        getService(Components.interfaces.nsIPrefService).getBranch('tabslideshow.');

    tabslideshowPrefs.setBoolPref('refresh', document.getElementById('tabslideshowRefresh').checked);
    tabslideshowPrefs.setIntPref('time', document.getElementById('tabslideshowTime').lastGood);
}

function tabslideshowLoadOptions()
{
    try {
        // Reference to XPCOM preference service
        var tabslideshowPrefs = Components.classes['@mozilla.org/preferences-service;1'].
            getService(Components.interfaces.nsIPrefService).getBranch('tabslideshow.');

        if (tabslideshowPrefs) {
            document.getElementById('tabslideshowRefresh').checked = tabslideshowPrefs.getBoolPref('refresh');
            document.getElementById('tabslideshowTime').adjust(tabslideshowPrefs.getIntPref('time') - 30);
        }
    } catch (e) {}
}
