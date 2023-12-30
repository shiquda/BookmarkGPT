document.getElementById('saveButton').onclick = function () {
    var apiKey = document.getElementById('apiKey').value;
    var model = document.getElementById('model').value;
    var domain = document.getElementById('domain').value;
    chrome.storage.sync.set({ apiKey: apiKey, model: model, domain: domain }, function () {
        alert('Settings saved');
    });
};

chrome.storage.sync.get(['apiKey', 'model', 'domain'], function (items) {
    document.getElementById('apiKey').value = items.apiKey || '';
    document.getElementById('model').value = items.model || '';
    document.getElementById('domain').value = items.domain || '';
});
