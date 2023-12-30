chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method == "searchBookmark") {
        // Call GPT model to get the answer
        var answer = callGPTModel(request.query);
        // Search bookmarks based on the answer
        searchBookmarks(answer, function (result) {
            sendResponse({ result: result });
        });
    }
    return true;  // will respond asynchronously
});

function callGPTModel(query) {
    // Here you need to call GPT model to get the answer
    // This requires server-side programming and is beyond the scope of this guide
    // For now, we just return the query as the answer
    return query;
}

function searchBookmarks(query, callback) {
    chrome.bookmarks.search(query, function (results) {
        var result = "";
        for (var i = 0; i < results.length; i++) {
            result += "<p><a href='" + results[i].url + "' target='_blank'>" + results[i].title + "</a></p>";
        }
        callback(result);
    });
}
