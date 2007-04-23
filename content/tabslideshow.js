// Reference to XPCOM preference service
// Reference to XPCOM preference service
var gPref = Components.classes['@mozilla.org/preferences-service;1'].
    getService(Components.interfaces.nsIPrefService);

function tabSlideShowInit()
{
    // Set timer for cycle
    var tabslideshowPrefs = gPref.getBranch('tabslideshow.');
    try {
        if (tabslideshowPrefs) {
            tabslideshowTime = tabslideshowPrefs.getIntPref('time');
            if (tabslideshowTime) {
                setTimeout(cycleToNextTab, 1000 * tabslideshowTime);
                return true;
            }
        }
    } catch (e) { }

    setTimeout(cycleToNextTab, 30000);
    return true;
}

function cycleToNextTab()
{
    // Get tab info
    var numTabs = gBrowser.tabContainer.childNodes.length;
    var currentTabNum = gBrowser.tabContainer.selectedIndex;
    var nextTab = gBrowser.tabContainer.childNodes[
        (currentTabNum + 1) % numTabs];
    var upcomingTab = gBrowser.tabContainer.childNodes[
        (currentTabNum + 2) % numTabs];

    // Set next tab
    gBrowser.selectedTab = nextTab;

    try {
        // Reload upcoming tab?
        var tabslideshowPrefs = gPref.getBranch('tabslideshow.');
        if (tabslideshowPrefs) {
            tabslideshowRefresh = tabslideshowPrefs.getBoolPref('refresh');
            if (tabslideshowRefresh) {
                gBrowser.reloadTab(upcomingTab);
            }
        }

        // Set timer for next cycle
        if (tabslideshowPrefs) {
            tabslideshowTime = tabslideshowPrefs.getIntPref('time');
            if (tabslideshowTime) {
                setTimeout(cycleToNextTab, 1000 * tabslideshowTime);
                return true;
            }
        }
    } catch (e) { }

    setTimeout(cycleToNextTab, 30000);
    return true;
}
