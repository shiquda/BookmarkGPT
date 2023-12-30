chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method == "searchBookmark") {
        chrome.storage.sync.get(['apiKey', 'model', 'domain'], function (items) {
            const apiKey = items.apiKey;
            const model = items.model;
            const domain = items.domain ? items.domain : "api.openai.com";
            // Call GPT model to get the answer
            callGPTModel(request.query, apiKey, model, domain)
                .then(gptResponse => {
                    // send the response back to popup.js
                    sendResponse({ result: gptResponse });
                })
                .catch(error => {
                    console.error('Error:', error);
                    sendResponse({ result: 'Error: ' + error });
                });
        });
    }
    return true;  // will respond asynchronously
});




function getBookmarks(callback) {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        var bookmarks = '';
        traverseBookmarks(bookmarkTreeNodes, function (title, url) {
            bookmarks += title + ': ' + url + '\n';
        });
        callback(bookmarks);
    });
}

function traverseBookmarks(bookmarkTreeNodes, callback) {
    for (var i = 0; i < bookmarkTreeNodes.length; i++) {
        var node = bookmarkTreeNodes[i];
        if (node.url) {
            callback(node.title, node.url);
        }
        if (node.children) {
            traverseBookmarks(node.children, callback);
        }
    }
}

function callGPTModel(query, apiKey, selectedModel, domain) {
    return new Promise((resolve, reject) => {
        getBookmarks(function (bookmarks) {
            fetch(`${domain}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stream: false,
                    model: selectedModel,
                    messages: [
                        { role: "system", content: "You need to find the corresponding URL that meets his needs in the bookmarks provided by the user. You may need to speculate their possible uses based on the URL, the name of bookmark and your knowledge. You need to tell the user whether there is such a bookmark, and return **the description and URL** of the bookmark. Please use the same language as one after 'query:'." },
                        { role: "user", content: `bookmarks:\n${bookmarks}\nquery:\n${query}` }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data && data.choices && data.choices.length > 0) {
                        resolve(data.choices[0].message.content);
                    } else {
                        reject('No response from GPT model');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    reject(error);
                });
        });
    });
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

