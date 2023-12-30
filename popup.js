function submitQuestion() {
    let query = document.getElementById('searchInput').value;
    chrome.runtime.sendMessage({ method: "searchBookmark", query: query }, function (response) {
        let gptResponse = response.result;
        // 使用正则表达式找到所有的URL
        let urlMatches = gptResponse.match(/https?:\/\/[^"\s]*/g);
        if (urlMatches) {
            // 遍历所有的URL
            urlMatches.forEach(function (urlMatch) {
                let url = urlMatch.replace(/"/g, '');  // 去掉引号
                let clickableUrl = `<a href="${url}" target="_blank">${url}</a>`;
                // 替换原始URL为可点击的链接
                gptResponse = gptResponse.replace(urlMatch, clickableUrl);
            });
        }
        // 将换行符替换为HTML换行标签
        gptResponse = gptResponse.replace(/\n/g, '<br>');
        document.getElementById('result').innerHTML = gptResponse;
    });

    // 获取按钮和结果元素
    let button = document.querySelector('#searchButton');
    let result = document.querySelector('#result');

    // 初始时禁用按钮
    button.disabled = true;

    // 创建一个观察器实例
    let observer = new MutationObserver(function (mutations) {
        // 如果结果元素有任何变化，启用按钮
        button.disabled = false;
    });

    // 配置观察器：只观察子节点的变化
    let config = { childList: true };

    // 开始观察目标节点
    observer.observe(result, config);

}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchButton').addEventListener('click', submitQuestion)
    document.getElementById('searchForm').addEventListener('submit', function (event) {
        event.preventDefault(); // 阻止表单的默认提交行为
        submitQuestion()
    });

});

