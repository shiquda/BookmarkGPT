chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method == "searchBookmark") {
        chrome.storage.sync.get(['apiKey', 'model', 'domain', 'language'], function (items) {
            const apiKey = items.apiKey;
            const model = items.model;
            const domain = items.domain ? items.domain : "api.openai.com";
            const language = items.language ? items.language : "English";
            // Call GPT model to get the answer
            callGPTModel(request.query, apiKey, model, domain, language)
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

function callGPTModel(query, apiKey, selectedModel, domain, language) {
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
                        { role: "system", content: `You need to find the corresponding URL that meets his needs from the bookmarks provided by the user. If there aren't any, select the three most likely bookmarks. You may need to speculate on their possible uses based on the URL, the name of the bookmark, and your knowledge. You need to inform the user whether such a bookmark exists, and return the description and URL of the bookmark. Please use ${language}.` },
                        { role: "user", content: `bookmarks:\n${bookmarks}\nquery:\n${query}` }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
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

