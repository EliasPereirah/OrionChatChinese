// 下载/上传聊天记录和配置
// 请谨慎保存这些文件
// 该文件将以 JSON 格式保存，且未加密
// 该文件将包含敏感信息，如您的对话和 API 密钥
function downloadChatHistory() {
    let file_name = 'orion_chat_history_backup.json';
    let chatHistory = JSON.stringify(localStorage);
    let file_type = 'application/json';
    try {
        if (chatHistory) {
            chatHistory = JSON.parse(chatHistory);
        } else {
            chatHistory = []; // 如果未找到数据，则返回一个空数组
            addWarning(`未找到聊天记录！`, true, 'fail_dialog');
        }
    } catch (error) {
        console.error("从 localStorage 解析 JSON 时出错:", error);
        addWarning("加载聊天记录时出错。localStorage 中的数据可能已损坏。", false, 'fail_dialog');
        return; // 如果解析失败则停止执行
    }


    const jsonBlob = new Blob([JSON.stringify(chatHistory, null, 2)], {type: file_type});
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file_name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addWarning("请谨慎保存此文件，因为它包含你的秘密 API 密钥和与 AI 的私人对话", false);

}

// 从 JSON 文件恢复聊天历史记录
function restoreChatHistory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                let chatHistory = JSON.parse(e.target.result);
                for (let idx in chatHistory) {
                    localStorage.setItem(idx.toString(), chatHistory[idx]);
                }
                addWarning("聊天记录恢复成功！", true, 'success_dialog');
                setTimeout(()=>{
                    document.location = document.location;
                },5000)
            } catch (error) {
                console.error("解析 JSON 文件时出错:", error);
                addWarning("恢复聊天记录时出错。请确保您选择了有效的 JSON 文件。", false, 'fail_dialog');
            }
        };
        reader.readAsText(file);
    };
    input.click();

}
