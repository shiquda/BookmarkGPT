document.getElementById('saveButton').onclick = function () {
    let apiKey = document.getElementById('apiKey').value;
    let model = document.getElementById('model').value;
    let domain = document.getElementById('domain').value;
    let language = document.getElementById('language').value;
    chrome.storage.sync.set({ apiKey: apiKey, model: model, domain: domain, language: language }, function () {
        alert('Settings saved');
    });
};

chrome.storage.sync.get(['apiKey', 'model', 'domain'], function (items) {
    document.getElementById('apiKey').value = items.apiKey || '';
    document.getElementById('model').value = items.model || '';
    document.getElementById('domain').value = items.domain || '';
    document.getElementById('language').value = items.language || '';
});
