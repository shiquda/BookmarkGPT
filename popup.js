document.getElementById('searchButton').onclick = function () {
    var query = document.getElementById('searchInput').value;
    chrome.runtime.sendMessage({ method: "searchBookmark", query: query }, function (response) {
        document.getElementById('result').innerHTML = response.result;
    });
};
