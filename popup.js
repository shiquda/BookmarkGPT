function submitQuestion() {
    let query = document.getElementById('searchInput').value;
    chrome.runtime.sendMessage({ method: "searchBookmark", query: query }, function (response) {
        let gptResponse = response.result;
        // 使用正则表达式找到所有的URL
        let urls = gptResponse.match(/https?:\/\/[^"\s\)\]]*/g);

        if (urls) {
            urls = [...new Set(urls)];  // 去重，避免重复替换相同的URL

            urls.forEach(url => {
                let cleanUrl = url.replace(/"/g, '');  // 去掉引号
                let clickableUrl = `<a href="${cleanUrl}" target="_blank">${cleanUrl}</a>`;
                // 使用split和join替换replace，以防止对相同的URL进行多次替换
                gptResponse = gptResponse.split(url).join(clickableUrl);
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

