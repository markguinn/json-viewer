var chrome = require('chrome-framework');
chrome.devtools.panels.create("Redfin API", "toast.png", "/pages/redfin-api-panel.html", function(panel) {
    // This would be doable to hook into the building search better, but it's not documented very well and would take
    // a bit of experimentation (i.e. pass a message to the panel and have it perform the search there)...
    panel.onSearch.addListener(function(type, queryString) {
        if (type === 'performSearch') {
            alert('Try Ctrl-F to search within the highlighted code. This browser search is not hooked up yet.');
        }
        //     chrome.runtime.sendMessage({a,b,c});
        //     chrome.extension.sendMessage({a,b,c});
    });
});
