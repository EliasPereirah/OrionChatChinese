let can_delete_history = false;
let max_chats_history = 500;
let chosen_platform = localStorage.getItem('chosen_platform');
let model = localStorage.getItem('selected_model');
let is_mobile = window.matchMedia("(max-width: 768px)").matches;
let api_key = localStorage.getItem(`${chosen_platform}.api_key`)
let base64String = '';
let mimeType = '';
let story = '';
let endpoint = localStorage.getItem('endpoint');
let last_role = '';
let last_cnt = '';
let last_user_input = '';
let last_auto_yt_fn_call = 0;
let is_chat_enabled = true;
let SITE_TITLE = "猎户座";
let js_code = '';
let js_code_exec_finished = true;
let js_code_exec_output = '';
let original_code = '';
let temp_safe_mode = false;
let pre_function_text = '';
let azure_endpoint = localStorage.getItem('azure_endpoint');
let all_chunks = [];
let has_chunk_error = false;

// Markdown 转为 HTML
showdown.setFlavor('github');
showdown.setOption('ghMentions', false); // 如果 true "@something" 变成 github.com/something
showdown.setOption("openLinksInNewWindow", true);
let converter = new showdown.Converter();


///您可以添加任何与 OpenAI API 兼容的提供程序
let PLATFORM_DATA = {
    deepseek: {
        models: [
            "deepseek-reasoner",
            "deepseek-chat"
        ],
        name: "DeepSeek",
        endpoint: "https://api.deepseek.com/chat/completions"
    },
    openai: {
        models: [
            "gpt-4o",
            "gpt-4o-mini",
            "o1-preview",
            "o1-mini"
        ],
        name: "OpenAI",
        endpoint: "https://api.openai.com/v1/chat/completions"
    },
    google: {
        models: [
            "gemini-2.0-flash-exp",
            "gemini-exp-1206",
            "learnlm-1.5-pro-experimental",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b"
        ],
        name: "Google",
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{{model}}:{{gen_mode}}?key={{api_key}}'
    },
    anthropic: {
        models: [
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
            "claude-3-haiku-20240307"
        ],
        name: "Anthropic",
        endpoint: "https://api.anthropic.com/v1/messages"
    },
    cohere: {
        models: [
            "command-r-plus-08-2024",
            "command-r-plus-04-2024",
            "c4ai-aya-expanse-32b",
            "c4ai-aya-23-35b",
            "command-light"
        ],
        name: "Cohere",
        endpoint: "https://api.cohere.com/v2/chat"
    },
    groq: {
        models: [
            "llama-3.3-70b-versatile",
            "llama-3.2-90b-vision-preview",
            "llama-3.3-70b-specdec",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ],
        name: "Groq",
        endpoint: "https://api.groq.com/openai/v1/chat/completions"
    },
    sambanova: {
        models: [
            "Qwen2.5-Coder-32B-Instruct",
            "Meta-Llama-3.1-405B-Instruct",
            "Llama-3.2-90B-Vision-Instruct"
        ],
        name: "SambaNova",
        endpoint: "https://api.sambanova.ai/v1/chat/completions"

    },
    cerebras: {
        models: [
            "llama3.1-8b",
            "llama3.1-70b"
        ],
        name: "Cerebras",
        endpoint: "https://api.cerebras.ai/v1/chat/completions"
    },
    xai: {
        models: [
            "grok-beta"
        ],
        name: "xAI",
        endpoint: "https://api.x.ai/v1/chat/completions"
    },
    openrouter: {
        models: [
            "google/gemini-2.0-flash-exp:free"
        ],
        name: "OpenRouter",
        endpoint: "https://openrouter.ai/api/v1/chat/completions"
    },

    together: {
        models: [
            "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
        ],
        name: "Together AI",
        endpoint: "https://api.together.xyz/v1/chat/completions"
    },
    deepinfra: {
        models: [
            "meta-llama/Llama-3.3-70B-Instruct-Turbo"
        ],
        name: "Deep Infra",
        endpoint: "https://api.deepinfra.com/v1/openai/chat/completions"
    },
    ollama: {
        models: [],
        name: "Ollama",
        get_models_endpoint: "http://localhost:11434/v1/models",
        endpoint: "http://localhost:11434/v1/chat/completions"
    }
    /* nvidia: {
         models: [
             "meta/llama-3.1-405b-instruct",
             "nvidia/llama-3.1-nemotron-70b-instruct"
         ],
         name: "NVIDIA",
         endpoint: "https://integrate.api.nvidia.com/v1/chat/completions"
     }*/
}


if (azure_endpoint) {
    PLATFORM_DATA.azure = {
        models: [
            "gpt-4o-mini"
        ],
        name: "Azure",
        endpoint: azure_endpoint
    };
}

const language_extension = {
    "python": "py",
    "markdown": "md",
    "javascript": "js",
    "java": "java",
    "c": "c",
    "cpp": "cpp",
    "csharp": "cs",
    "ruby": "rb",
    "go": "go",
    "swift": "swift",
    "kotlin": "kt",
    "php": "php",
    "typescript": "ts",
    "rust": "rs",
    "dart": "dart",
    "scala": "scala",
    "perl": "pl",
    "r": "r",
    "shell": "sh",
    "haskell": "hs",
    "lua": "lua",
    "objectivec": "m",
    "matlab": "m",
    "sql": "sql",
    "html": "html",
    "css": "css",
    "json": "json",
    "xml": "xml",
    "yaml": "yaml",
    "txt": "txt"
}


let settings = document.querySelector("#settings");
settings.onclick = () => {
    let conversations = document.querySelector(".conversations");
    conversations.style.display = 'block';
    //localStorage.setItem("hide_conversations", '0');
    let hasTopic = document.querySelector(".conversations .topic");
    if (!hasTopic) {
        let ele = document.createElement('div');
        ele.innerText = '无历史记录';
        ele.classList.add('no_history')
        conversations.append(ele)
        setTimeout(() => {
            ele.remove();
            conversations.style.display = 'none';
        }, 3000);
    }
}


let options = document.querySelector("#open_options");
options.onclick = () => {
    let cvns = document.querySelector('.conversations');
    if (cvns && is_mobile) {
        cvns.style.display = 'none'; // 如果打开，则会在移动设备上关闭
    }

    setOptions();
}


let new_chat = document.querySelector("#new_chat");
new_chat.addEventListener('click', () => {
    newChat(); // 开始新聊天
})

jsClose = document.querySelector(".jsClose");
jsClose.onclick = () => {
    document.querySelector('.conversations').style.display = 'none';
    //localStorage.setItem("hide_conversations", '1');
}


setTimeout(() => {
    let chatMessages = document.querySelector("#chat-messages");
    chatMessages.scroll(0, 9559999);
}, 1000);


let conversations = {
    'messages': []
};


function removeAttachment() {
    let has_att = document.querySelector(".has_attachment");
    if (has_att) {
        has_att.classList.remove('has_attachment');
    }
}

function addConversation(role, content, add_to_document = true, do_scroll = true) {
    closeDialogs();

    removeAttachment();
    if (!content.trim()) {
        addWarning('空洞的对话', true);
        return false;
    }
    let new_talk = {'role': role, 'content': content};
    conversations.messages.push(new_talk);
    //chat_textarea.focus();
    let cnt;
    let div = document.createElement('div');
    div.classList.add('message');
    if (role === 'user') {
        div.classList.add('user');
        cnt = converter.makeHtml(content);
        if (temp_safe_mode) {
            div.innerText = cnt;
        } else {
            div.innerHTML = cnt;
        }
        temp_safe_mode = false;
        if (base64String) {
            let media = mimeType.split("/")[0];
            if (media === 'image') {
                let imgEle = document.createElement('img');
                imgEle.src = base64String;
                div.prepend(imgEle);
                imgEle.className = 'appended_pic';
            } else if (media === 'audio') {
                let audioEle = document.createElement('audio');
                audioEle.src = base64String;
                audioEle.controls = true;
                div.prepend(audioEle);
                audioEle.className = 'appended_audio';
            } else if (media === 'video') {
                let videoEle = document.createElement('video');
                videoEle.src = base64String;
                videoEle.controls = true;
                div.prepend(videoEle);
                videoEle.className = 'appended_video';
            }

        }

    } else {
        if (add_to_document) {
            div.classList.add('bot');

            cnt = converter.makeHtml(content);
            if (temp_safe_mode) {
                div.innerText = cnt;
            } else {
                div.innerHTML = cnt;
            }
            temp_safe_mode = false;
            genAudio(content, div);
        } else {
            let lastBot = document.querySelectorAll(".bot")[document.querySelectorAll(".bot").length - 1];
            genAudio(content, lastBot);
        }

    }
    document.querySelector('#chat-messages').append(div);
    mediaFull();
    if (do_scroll) {
        div.scrollIntoView();

    }
    saveLocalHistory();
}


function saveLocalHistory() {
    localStorage.setItem(chat_id, JSON.stringify(conversations));
    loadOldChatTopics();
}

function getPreviousChatTopic() {
    let all_topics = [];
    // pega todos ids
    let ids = [];
    let total_chats = 0;
    for (let i = 0; i < localStorage.length; i++) {
        let id = localStorage.key(i);
        id = parseInt(id);
        if (!isNaN(id)) {
            // 正确的顺序很重要
            ids.push(id);
        }
    }
    ids.sort((a, b) => b - a);  // 后代顺序
    let all_keys = [];

    ids.forEach(key => {
        if (total_chats >= max_chats_history) {
            // 如果有太多消息，则删除旧消息
            localStorage.removeItem(key.toString());
        } else {
            all_keys.push(key);
        }
        total_chats++;
    })

    all_keys.forEach(id => {
        try {
            let topic = JSON.parse(localStorage.getItem(id))?.messages?.[0]?.content ?? '';
            let last_interaction = JSON.parse(localStorage.getItem(id))?.last_interact ?? id;
            if (topic) {
                all_topics.push({'topic': topic, 'id': id, 'last_interaction': last_interaction});
            }
        } catch (error) {
            console.error('JSON 错误解析器：' + error)
        }
    });
    return all_topics;
}

// force=true 将忽略 can_delete_history
function removeChat(div, id, force = false) {
    if (can_delete_history || force) {
        let the_chat = JSON.parse(localStorage.getItem(id));
        if (div.classList.contains('confirm_deletion')) {
            localStorage.removeItem(id);
        } else {
            let tot_msgs = the_chat.messages.length;
            div.classList.add('confirm_deletion');
            if (tot_msgs < 19) {
                localStorage.removeItem(id);
            } else {
                let alert_msg =
                    `<p>您确定要删除吗？</p><p>此对话有 ${tot_msgs} 条消息。</p>
                   <p>如果是，请再次单击以删除。</p>`;
                addWarning(alert_msg, false)
                div.classList.add('del_caution')
                return false;
            }
        }
        document.querySelectorAll(".del_caution").forEach((dc => {
            dc.classList.remove('del_caution');
        }))

        document.querySelectorAll(".confirm_deletion").forEach((cd => {
            cd.classList.remove('confirm_deletion');
        }))


        localStorage.removeItem(id);
        let ele = document.createElement('div');
        let content = document.querySelector(".container");
        ele.classList.add('chat_deleted_msg');
        if (id === chat_id) {
            // 当前聊天 - 因此清理屏幕
            let all_user_msg = document.querySelectorAll("#chat-messages .message.user");
            let all_bot_msg = document.querySelectorAll("#chat-messages .message.bot");
            if (all_user_msg) {
                all_user_msg.forEach(um => {
                    um.remove();
                })
            }
            if (all_bot_msg) {
                all_bot_msg.forEach(bm => {
                    bm.remove();
                })
            }
            ele.innerText = "当前聊天已删除！";
            content.prepend(ele);
            conversations.messages = []; // 清理旧对话
            chat_id = new Date().getTime(); // 生成一个新的 chat_id

        } else {
            content.prepend(ele);
            ele.innerText = "聊天已删除";
        }
        setTimeout(() => {
            ele.remove();
        }, 2000);
        div.remove();
    }
}

/**
 * 开始新的聊天，不包含之前对话的任何内容
 **/
function newChat() {
    //toggleAnimation(true);
    toggleAiGenAnimation(false);
    closeDialogs();
    document.title = SITE_TITLE;
    chat_id = new Date().getTime(); // 生成一个新的 chat_id
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    new_url += "#" + chat_id;
    history.pushState({url: new_url}, '', new_url);
    removeScreenConversation();
    conversations.messages = []; // 清理旧对话


}

function removeScreenConversation() {
    let chatMessages = document.querySelector("#chat-messages")
    //删除屏幕上的旧消息
    chatMessages.querySelectorAll(".message.user").forEach(userMsg => {
        userMsg.remove();
    })
    chatMessages.querySelectorAll(".message.bot").forEach(botMsg => {
        botMsg.remove();
    })
}


function loadOldConversation(old_talk_id) {
    chat_id = old_talk_id;
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    new_url += "#" + old_talk_id;
    history.pushState({url: new_url}, '', new_url);

    let past_talk = localStorage.getItem(old_talk_id); // 抓取旧对话

    localStorage.removeItem(old_talk_id); // 从本地存储中删除旧对话
    let last_interaction_id = new Date().getTime();

    //let btn_star_old_chat = document.querySelector("[data-id='" + old_talk_id + "']");
    let btn_star_old_chat = document.querySelector("[data-id='" + old_talk_id + "']");

    //btn_star_old_chat.setAttribute("data-id", chat_id);
    btn_star_old_chat.setAttribute("data-last-interaction", last_interaction_id.toString());
    document.title = btn_star_old_chat.innerText;


    let chatMessages = document.querySelector("#chat-messages");
    if (past_talk) {
        let messages = JSON.parse(past_talk).messages;
        conversations.messages = messages;
        conversations.last_interact = last_interaction_id;
        localStorage.setItem(old_talk_id.toString(), JSON.stringify(conversations));

        removeScreenConversation();
        messages.forEach(msg => {
            let div_talk = document.createElement('div');
            div_talk.classList.add('message');
            if (msg.role === 'user') {
                div_talk.classList.add('user');
                div_talk.innerHTML = converter.makeHtml(msg.content);
            } else {
                div_talk.classList.add('bot');
                div_talk.innerHTML = converter.makeHtml(msg.content);
            }

            chatMessages.append(div_talk);

        });


    } else {
        let topic_with_no_chat = document.querySelector(".topic[data-id='" + chat_id + "']");
        if (topic_with_no_chat) {
            topic_with_no_chat.remove();
        }
        createDialog('未找到对话', 10)
    }
    hljs.highlightAll();
    setTimeout(() => {
        enableCopyForCode();
    }, 500)

}


function loadOldChatTopics() {
    let all_topics = getPreviousChatTopic();
    let history = document.querySelector(".conversations .history");
    let to_remove = history.querySelectorAll(".topic");
    // 删除并再次添加，更新当前聊天内容
    to_remove.forEach(ele => {
        ele.remove();
    })
    for (let i = 0; i < all_topics.length; i++) {
        let prev = all_topics[i];
        let div = document.createElement('div');
        let divWrap = document.createElement('div');
        div.classList.add('topic');
        div.classList.add('truncate');
        if (can_delete_history) {
            div.classList.add('deletable')
        }
        div.textContent = prev.topic.substring(0, 50);
        div.title = prev.topic.substring(0, 90);

        div.setAttribute('data-id', prev.id)
        div.setAttribute('data-last-interaction', prev.last_interaction)
        div.addEventListener('click', () => {
            let the_id = div.getAttribute('data-id');
            if (can_delete_history) {
                removeChat(div, the_id);
            } else {
                let all_active_topic = document.querySelectorAll(".active_topic");
                all_active_topic.forEach(t => {
                    t.classList.remove('active_topic');
                })
                div.classList.add('active_topic')
                loadOldConversation(the_id)
            }
        })
        divWrap.append(div);
        history.append(divWrap);
    }
}

loadOldChatTopics();

function getSystemPrompt() {
    let system_prompt = localStorage.getItem('system_prompt');
    if (!system_prompt) {
        return system_prompt;
    }
    let today = whatTimeIsIt();
    system_prompt = system_prompt.replaceAll("{{date}}", today);
    system_prompt = system_prompt.replaceAll("{{lang}}", navigator.language)
    return system_prompt;
}


function toggleAiGenAnimation(do_animate = 'toggle') {
    //return ''; // remove
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if(do_animate === 'toggle'){
        let has_old = document.querySelector(".thinking-container");
        do_animate = !has_old;
    }
    if (do_animate === true && ele) {
        if (ele.classList.contains('user')) {
            let ai_gen_animation = document.createElement('div');
            ai_gen_animation.innerHTML =
                 `<div class="ai-avatar">AI</div>
                 <div class="ai_dots-container">
                   <div class="dot_ai"></div>
                   <div class="dot_ai"></div>
                   <div class="dot_ai"></div>
                 </div>`;
            ai_gen_animation.classList.add('thinking-container');
            ele.insertAdjacentElement('afterend', ai_gen_animation)
            ai_gen_animation.scrollIntoView();
        }
    }else if (do_animate === false){
        let thinking_container = document.querySelector(".thinking-container");
        if(thinking_container){
            thinking_container.remove();
        }
    }
}

function chat() {
    toggleAiGenAnimation(true);
    if (chosen_platform === 'google') {
        // endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        return geminiChat();
    }
    return streamChat();
}


/**
 * 删除聊天中的最后一条消息
 * 如果 from_user = true，则仅删除来自用户的消息
 **/
function removeLastMessage(from_user = true) {
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (ele) {
        if (!ele.classList.contains('user') && from_user) {
            return false;
        }
        document.querySelector(".chat-input textarea").value = ele.innerText;
        toggleBtnOptions();
        conversations.messages.pop();
        if (conversations.messages.length) {
            localStorage.setItem(chat_id.toString(), JSON.stringify(conversations));
        } else {
            localStorage.removeItem(chat_id.toString());
        }
        ele.remove();
    }
}

let chatButton = document.querySelector("#send");
let chat_textarea = document.querySelector(".chat-input textarea");
let voice_rec = document.getElementById('voice_rec');

function toggleBtnOptions() {
    // when not fired by addEventListener
    if (chat_textarea.value.trim().length) {
        chatButton.classList.remove('ds_none');
        voice_rec.classList.add('ds_none');
    } else {
        voice_rec.classList.remove('ds_none');
        chatButton.classList.add('ds_none');
    }
    // when fired by addEventListener
    chat_textarea.addEventListener('input', () => {
        if (chat_textarea.value.trim().length) {
            chatButton.classList.remove('ds_none');
            voice_rec.classList.add('ds_none');
        } else {
            voice_rec.classList.remove('ds_none');
            chatButton.classList.add('ds_none');
        }
    })
}

toggleBtnOptions();
voice_rec.addEventListener('click', () => {
    chatButton.classList.remove('ds_none');
    voice_rec.classList.add('ds_none');
    recordVoice();
})


function startChat() {
    stopRecorder();
    if (!is_chat_enabled) {
        //addWarning('Chat is busy. Please wait!');
        return false;
    }
    let input_text = chat_textarea.value;
    if (input_text.trim().length > 0) {
        //toggleAnimation();
        toggleAiGenAnimation();
        chat_textarea.value = '';
        toggleBtnOptions();
        disableChat()
        addConversation('user', input_text);
        chat();
    }
}

chatButton.onclick = () => {
    startChat();
}
chat_textarea.onkeyup = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        startChat();
    }
}


function addWarning(msg, self_remove = true, add_class = '') {
    if (typeof (msg) != 'string') {
        msg = JSON.stringify(msg);
    }
    let duration = 0;
    if (self_remove) {
        duration = 7;
    }
    createDialog(msg, duration, add_class)
}


function disableChat() {
    is_chat_enabled = false;
}

function enableChat() {
    is_chat_enabled = true;
}

function toggleAnimation(force_off = false) {
    let loading = document.querySelector("#loading")
    if (loading.style.display === 'inline-flex') {
        loading.style.display = 'none';
    } else {
        loading.style.display = 'inline-flex';
    }
    if (force_off) {
        loading.style.display = 'none';
    }
}


let can_delete = document.querySelector("#can_delete");
if (can_delete != null) {
    can_delete.addEventListener('change', (event) => {
        if (event.target.checked) {
            can_delete_history = true;
            let all_topics = document.querySelectorAll(".conversations .topic");
            all_topics.forEach(topic => {
                topic.classList.add('deletable');
            })
        } else {
            can_delete_history = false;
            let all_topics = document.querySelectorAll(".conversations .topic");
            all_topics.forEach(topic => {
                topic.classList.remove('deletable');
            })
        }
    });
}

function closeDialogs() {
    let dialog_close = document.querySelectorAll(".dialog_close");
    if (dialog_close) {
        dialog_close.forEach(dc => {
            if (dc.classList.contains('can_delete')) {
                dc.click();
            }
        })
    }

}


function enableCopyForCode(enable_down_too = true) {
    document.querySelectorAll('code.hljs').forEach(block => {
        let block_group = block.nextElementSibling;
        let has_copy_btn = false;
        if (block_group) {
            has_copy_btn = block_group.querySelector(".copy-btn");
        }
        if (!has_copy_btn) {   // 不再一次添加
            const button = document.createElement('button');
            const div_ele = document.createElement('div');
            div_ele.className = 'btn-group';
            button.className = 'copy-btn';
            button.innerText = '复制';
            button.title = "复制代码";
            const btn_down = button.cloneNode(false);
            btn_down.className = 'down-btn';
            btn_down.innerText = 'Down';
            btn_down.title = "下载代码";
            div_ele.append(button);
            if (enable_down_too) {
                div_ele.append(btn_down);
            }
            let pre = block.parentElement;
            pre.classList.add('code_header');
            pre.append(div_ele);

            let code_lines_length = block.innerText.split("\n").length
            if(code_lines_length > 30){
                // 如果代码超过 x 行，按钮也会位于顶部
                const div_ele_bottom = div_ele.cloneNode(true);
                div_ele_bottom.classList.add('btn-group-top');
                pre.prepend(div_ele_bottom);
                let btn_top = div_ele_bottom.querySelector(".copy-btn");
                addEventClickToDownAndCopyBtn(btn_top, block);
            }

            addEventClickToDownAndCopyBtn(button, block);
        }
    });

    if (enable_down_too) {
        enableCodeDownload();
    }
    enableFullTextCopy();
}

function addEventClickToDownAndCopyBtn(button, block) {
    button.addEventListener('click', () => {
        const codeText = block.innerText.replace('复制', '');
        navigator.clipboard.writeText(codeText)
            .then(() => {
                button.innerText = '已复制!';
                setTimeout(() => button.innerText = '复制', 2000);
            })
            .catch(err => console.error('Error:', err));
    });
}


function enableFullTextCopy() {
    document.querySelectorAll('.chat .bot').forEach(div => {
        let div_copy = document.createElement('div');
        div_copy.innerHTML = div.innerHTML;
        let btn_groups = div_copy.querySelectorAll(".btn-group");
        btn_groups.forEach(btn => {
            // 这样它就不会随文本一起复制
            btn.remove();
        })

        let all_ele = div_copy.querySelectorAll("*");
        all_ele.forEach(element => {
            element.removeAttribute('id');
        })

        let play_audio_btn = div_copy.querySelector(".play_audio_btn");
        if (play_audio_btn) {
            // 这样它就不会随文本一起复制
            play_audio_btn.remove();
        }

        let has_copy_btn = div.classList.contains('has_full_text_copy_btn')
        if (!has_copy_btn) {   // 不再一次添加
            const button = document.createElement('button');
            const ele = document.createElement('div');
            ele.className = 'btn-ft-group';
            button.className = 'copy-btn';
            button.innerText = '复制文本';
            ele.append(button);
            div.append(ele);
            button.addEventListener('click', () => {
                const full_text = div_copy.innerHTML;
                navigator.clipboard.writeText(full_text)
                    .then(() => {
                        button.innerText = '已复制!';
                        setTimeout(() => button.innerText = '复制文本', 2000);
                    })
                    .catch(err => console.error('Error:', err));
            });
            div.classList.add('has_full_text_copy_btn');
        }
    });

}


function enableCodeDownload() {
    let downloadCodeBtn = document.querySelectorAll(".down-btn");
    if (downloadCodeBtn) {
        downloadCodeBtn.forEach(btn => {
            btn.addEventListener("click", function () {
                const code = btn.parentElement.parentElement.querySelector("code");
                let lang_name = code.classList[0] ?? 'txt';
                if (lang_name === "hljs") {
                    lang_name = code.classList[1]?.split("-")[1] ?? 'txt';
                }
                let extension = language_extension[lang_name] ?? 'txt';
                let ai_full_text = btn.parentElement.parentElement.parentElement.innerHTML;
                let file_name = ai_full_text.match(new RegExp(`([a-zA-Z0-9_-]+\\.${extension})`, 'g'));
                let more_than_one = btn.parentElement.parentElement.parentElement.querySelectorAll("." + lang_name);
                // more_then_one = 多个具有相同扩展名的代码
                if (file_name) {
                    file_name = file_name[0];
                    if (more_than_one.length >= 2) {
                        file_name = 'file.' + extension;
                        // 无法准确确定文件名（因为有两个或更多），
                        // 因此 file_name 将默认为 file.ext
                    }
                } else {
                    file_name = 'file.' + extension;
                }


                let code_text = code.innerText;
                const blob = new Blob([code_text]);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file_name;
                a.click();
                URL.revokeObjectURL(url);
            });
        })
    }
}


/**
 * 在屏幕上添加一条消息
 * - text：要添加的文本
 * - duration_seconds：可选 - 总持续时间（秒）
 * - add_class_name：可选 - 添加个性化类以向对话框添加新样式
 * - can_delete - 用户是否能够删除对话框
 **/
function createDialog(text, duration_seconds = 0, add_class_name = '', can_delete = true) {
    let all_dialogs = document.getElementById("all_dialogs");
    let dialog_close = document.createElement('span');
    dialog_close.classList.add('dialog_close');
    let dialog = document.createElement('div');
    dialog.classList.add('dialog');
    if (add_class_name) {
        dialog.classList.add(add_class_name);
    }
    dialog.innerHTML = text;
    dialog.append(dialog_close);
    dialog.style.display = 'block';
    all_dialogs.append(dialog);
    if (can_delete) {
        dialog_close.classList.add('can_delete');
    }
    dialog_close.onclick = () => {
        dialog.remove();
    }

    if (duration_seconds) {
        let ms = duration_seconds * 1000;
        setTimeout(() => {
            dialog.remove();
        }, ms)
    }


}

function geminiChat(fileUri = '', with_stream = true, the_data = '') {
    let all_parts = [];
    let system_prompt = getSystemPrompt();
    addFileToPrompt();
    conversations.messages.forEach(part => {
        let role = part.role === 'assistant' ? 'model' : part.role;
        all_parts.push({
            "role": role,
            "parts": [
                {
                    "text": part.content
                }
            ]
        });
    })


    if (base64String) {
        geminiUploadImage().then(response => {
            console.log('uploading')
            return response;
        }).then(fileUri => {
            base64String = '';
            geminiChat(fileUri)
        })
        return false;
    }

    if (fileUri) {
        all_parts[(all_parts.length - 1)].parts.push({
            "file_data":
                {
                    "mime_type": mimeType,
                    "file_uri": fileUri
                }
        })
    }
    mimeType = '';
    let data = {
        "contents": [all_parts]
    };

    if (system_prompt) {
        data.systemInstruction = {
            "role": "user",
            "parts": [
                {
                    "text": system_prompt
                }
            ]
        };
    }

    last_user_input = conversations.messages[conversations.messages.length - 1].content;
    let cmd = commandManager(last_user_input)
    if (cmd) {
        let last_part = data.contents[0].pop();
        last_part.parts[0].text = cmd;
        data.contents[0].push(last_part);
    }

    data.safetySettings = [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ];


    data.generationConfig = {
        // "temperature": 1,
        // "topK": 40,
        // "topP": 0.95,
        // "maxOutputTokens": 8192,
    };

    if (the_data) {
        data = the_data;
    }

    if (needToolUse(last_user_input)) {
        let tool_name = whichTool(last_user_input);
        let tool_compatibility = `google_compatible`;
        let the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
        if (the_tool) {
            with_stream = false; // 在这种情况下，对于工具使用，我们不会使用流模式
            data.tools = [the_tool];
            data.toolConfig = {
                "functionCallingConfig": {
                    "mode": "ANY"
                }
            };
        }
    }

    if (!data.tools) {
        if (last_user_input.match(/^py:|python:/i)) {
            //代码执行命令
            data.tools = [{'code_execution': {}}];
        }
    }


    if (with_stream) {
        return geminiStreamChat(fileUri, data);
    }

    //let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${{model}}:generateContent?key=${{api_key}}`
    let gemini_endpoint = endpoint.replaceAll("{{model}}", model);
    gemini_endpoint = gemini_endpoint.replaceAll("{{api_key}}", api_key);
    gemini_endpoint = gemini_endpoint.replaceAll("{{gen_mode}}", "generateContent");

    let invalid_key = false;
    fetch(gemini_endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            let text = '';
            if (typeof data === "object") {
                try {
                    text = data.candidates[0].content.parts[0]?.text ?? '';
                    let g_tool = data.candidates[0].content.parts[0]?.functionCall ?? '';
                    if (g_tool === '') {
                        g_tool = data.candidates[0].content.parts[1]?.functionCall ?? '';
                    }
                    if (g_tool) {
                        pre_function_text = text;
                        toolHandle(g_tool);
                    }
                    if (!text && !g_tool) {
                        addWarning('错误：意外响应', true, 'fail_dialog')
                    }

                    let finished_reason = data.candidates[0].finishReason ?? '';
                    if (finished_reason && finished_reason !== 'STOP') {
                        setTimeout(() => {
                            addWarning('finishReason: ' + finished_reason, false, 'fail_dialog')
                        }, 500)
                    }

                } catch {
                    text += '<pre>' + JSON.stringify(data) + '</pre>';
                    try {
                        // 验证是否是 api key 无效的错误
                        let tt = data.error.message;
                        if (tt.match(/API key not valid/)) {
                            invalid_key = true;
                        }
                    } catch {
                        console.error('操作错误，否：data.error.message')
                    }
                    removeLastMessage()
                }
            } else {
                text = data;
            }
            if (text !== '') {
                addConversation('assistant', text);
            }

        })
        .catch(error => {
            addWarning('Error: ' + error, false);
            removeLastMessage();
        }).finally(() => {
        //toggleAnimation(true);
        toggleAiGenAnimation(false);
        enableChat();
        if (invalid_key) {
            setApiKeyDialog();
        }
        hljs.highlightAll();
        enableCopyForCode();

    })


}


function setApiKey() {
    let set_api_key = document.querySelector('#set_api_key');
    if (set_api_key) {
        api_key = set_api_key.value.trim();
        if (api_key.length > 10) {
            localStorage.setItem(`${chosen_platform}.api_key`, api_key)
            closeDialogs();
            createDialog('儲存成功！', 4);
        }
    }
}


function setApiKeyDialog() {
    let platform_name = PLATFORM_DATA[chosen_platform].name;
    let cnt =
        `<div>E输入您的<strong>${platform_name}的 API 密钥！</div>
         <input id="set_api_key" type="text" name="api_key" placeholder="Your API key">
         <button onclick="setApiKey()">Save</button>
         <div>
         <p>您的 API 密钥将保存在 localStorage 中。</p>
         </div>`;
    createDialog(cnt, 0, 'setApiDialog');
}


function ragEndpointDialog() {
    let use_rag = localStorage.getItem('use_rag_endpoint');
    let disable_advanced_rag = '';
    if (use_rag === 'yes' || use_rag == null) {
        disable_advanced_rag = `
             <div><p><b class="beta_warning">警告</b>如果您不再希望使用或看到此警报，请单击禁用。</p>
             <button onclick="disableRag()">禁用</button></div>`;
    }
    let cnt =
        `<div>
          <p>配置高级搜索的端点。</p>
         </div>
         <input id="set_rag_endpoint" type="text" name="set_rag_endpoint" placeholder="RAG endpoint">
         <button onclick="saveRagEndpoint()">Activate</button>
         <div>
         ${disable_advanced_rag}
         <p>在此了解有关此功能的更多信息：:
          <a href="https://github.com/EliasPereirah/OrionChatChinese#rag-端点">RAG endpoint</a></p>
         </div>`;
    createDialog(cnt, 0, 'optionsDialog');
}

function disableRag() {
    localStorage.setItem('use_rag_endpoint', 'no');
    closeDialogs();
}

function saveRagEndpoint(activate) {
    let input_ele = document.querySelector('#set_rag_endpoint');
    if (input_ele) {
        let rag_endpoint = input_ele.value.trim();
        if (rag_endpoint) {
            localStorage.setItem("rag_endpoint", rag_endpoint)
            localStorage.setItem('use_rag_endpoint', 'yes');
        }
    }
    closeDialogs()
}

function setOptions() {
    closeDialogs(); // 在显示选项对话框之前关闭打开的对话框
    let system_prompt = localStorage.getItem('system_prompt');
    if (!system_prompt) {
        system_prompt = '';
    }
    let prompts_options = '';
    let prompt_id = 0;
    let by_user = '';
    if (typeof (all_prompts) !== "undefined") {
        prompts_options += '<select name="prompt"><option selected="selected" disabled="disabled">很棒的提示</option>';
        all_prompts.forEach(the_prompt => {
            if(the_prompt.by_user){
                by_user = `class="by_user" data-created_time="${the_prompt.created_time}"`;
            }else {
                by_user = '';
            }
            let prompt_text = the_prompt.prompt.replace(/"/g, '&quot;');
            prompts_options += `<option ${by_user} id="prompt_id${prompt_id}" value="${prompt_text}">${the_prompt.act}</option>`;
            prompt_id++;
        });
        prompts_options += '</select>';
    }
    let platform_info = '';
    let platform_name = '';
    if (chosen_platform) {
        platform_name = PLATFORM_DATA[chosen_platform].name ?? '';
        platform_info = `<p class="platform_info">积极的:<b> ${model}</b> 从 <b>${platform_name}</b></p>`;
    }
    let platform_options = '<div><p>选择模型</p><select name="platform"><option disabled="disabled" selected="selected">选择</option>';
    let mark_as_select = '';
    Object.keys(PLATFORM_DATA).forEach(platform => {
        let list_models = PLATFORM_DATA[platform].models;
        let platform_name = PLATFORM_DATA[platform].name;
        platform_options += `<optgroup label="${platform_name}">`;
        list_models.forEach(model_name => {
            if (model_name === model) {
                mark_as_select = "selected='selected'";
            }
            platform_options += `<option ${mark_as_select} data-platform="${platform}" value="${model_name}">${model_name}</option>`;
            mark_as_select = '';
        })
        platform_options += `</optgroup>`;
    })
    platform_options += `</select></div>`;

    let plugin_option = `<button class="plugin_opt_btn" onclick="pluginOptions()">插件</button>`;
    let add_new_models = `<button class="more_opt_btn" onclick="addModelsOptions()">添加模型</button>`;
    let more_option = `<button class="more_opt_btn" onclick="moreOptions()">更多选项</button>`;
    let btn_youtube_api = `<button class="more_opt_btn" onclick="dialogSetYouTubeCaptionApiEndpoint()">YouTube 字幕</button>`;
    btn_youtube_api = '';
    let cnt =
        `<div>${platform_options}
         <input type="text" name="api_key" placeholder="API 密钥（如果尚未定义）">
         <button onclick="saveModel()" class="save_model">保存模型</button></div><hr>
         <div><strong>系统提示</strong>
         ${prompts_options}
         <input id="prompt_name" type="text" name="prompt_name" placeholder="命名您的提示">
         <textarea class="system_prompt" placeholder="（可选）人工智能应该如何回应？">${system_prompt}</textarea>
         <button onclick="savePrompt()" class="save_prompt">保存提示</button> <button id="delete_prompt">删除提示</button><br>
         ${platform_info}
          <span>${add_new_models}</span>
         <span>${plugin_option}</span>
         <span>${more_option}</span>
         <span>${btn_youtube_api}</span>
        
         </div>`;
    createDialog(cnt, 0, 'optionsDialog');

    setTimeout(() => {

        let sys_prompt = document.querySelector("textarea.system_prompt");
        let last_prompt = sys_prompt.value.trim();
        let prompt_name = document.querySelector("#prompt_name");
        if (sys_prompt) {
            sys_prompt.onkeyup = () => {
                let current_prompt = sys_prompt.value.trim();
                if(current_prompt !== last_prompt){
                    prompt_name.style.display = 'inline-block';
                    prompt_name.setAttribute("required", "true");
                    let del_prompt = document.querySelector("#delete_prompt");
                    if(del_prompt){
                        del_prompt.style.display = 'none';
                    }
                }else{
                    prompt_name.style.display = 'none';
                    prompt_name.value = '';
                    prompt_name.setAttribute("required", "false");

                }
            }
        }

        let sl_platform = document.querySelector("select[name=platform]");
        if (sl_platform) {
            sl_platform.onchange = () => {
                let btn_sm = document.querySelector('.save_model');
                if (btn_sm) {
                    btn_sm.classList.add('animate');
                }
            }
        }

        let sl_prompt = document.querySelector("select[name=prompt]");
        if (sl_prompt) {
            sl_prompt.onchange = (item => {
                let selectedOption = sl_prompt.options[sl_prompt.selectedIndex];
                let delete_prompt_bnt = document.querySelector("#delete_prompt");
                if(selectedOption.getAttribute('data-created_time')){
                    if(delete_prompt_bnt){
                        delete_prompt_bnt.style.display = 'inline-block';
                        delete_prompt_bnt.onclick = ()=>{
                            deletePrompt();
                        }
                    }
                }else {
                    delete_prompt_bnt.style.display = 'none';
                }
                prompt_name.style.display = 'none';
                prompt_name.value = '';
                prompt_name.setAttribute("required", "false");
                let btn_sp = document.querySelector('.save_prompt');
                if (btn_sp) {
                    btn_sp.classList.add('animate');
                }
                let txt_area = document.querySelector("textarea.system_prompt");
                if (txt_area) {
                    txt_area.value = item.target.value;
                    last_prompt = item.target.value;
                }

            })
        }
    }, 500)

}

function loadPlugins() {
    let plugin_url = localStorage.getItem("plugin_url");
    if (plugin_url) {
        let sc = document.createElement('script');
        sc.src = plugin_url.trim();
        document.body.append(sc);
    }
    let plugin_code = localStorage.getItem("plugin_code");
    if (plugin_code) {
        let sc_inline = document.createElement('script');
        sc_inline.innerHTML = plugin_code.trim();
        document.body.append(sc_inline);

    }
}

function savePlugin() {
    let plugin_url = document.querySelector("#plugin_url");
    let plugin_code = document.querySelector("#plugin_code");
    if (plugin_code && plugin_code.value.trim()) {
        plugin_code = plugin_code.value.trim();
        if (plugin_code) {
            localStorage.setItem("plugin_code", plugin_code);
        }
    } else {
        localStorage.removeItem("plugin_code");
    }
    if (plugin_url && plugin_url.value.trim()) {
        plugin_url = plugin_url.value.trim();
        if (plugin_url) {
            localStorage.setItem('plugin_url', plugin_url)
        }
    } else {
        localStorage.removeItem("plugin_url");
    }
    closeDialogs();
}

function pluginOptions() {
    closeDialogs(); // close opened dialogs before show options dialog
    let plugin_url = localStorage.getItem("plugin_url")
    let plugin_code = localStorage.getItem("plugin_code");
    let value_plugin_code = '';
    if (plugin_code) {
        value_plugin_code = `${plugin_code}`;
    }

    let value_plugin_url = '';
    if (plugin_url) {
        value_plugin_url = `value="${plugin_url}"`;
    }
    let cnt =
        `<div>
         <p>通过添加脚本来添加新功能。</p>
         <input ${value_plugin_url} placeholder="JavaScript URL" type="url" id="plugin_url">
         <p>和/或代码</p>
         <textarea placeholder="JavaScript code" id="plugin_code">${value_plugin_code}</textarea>
         <p><button onclick="savePlugin()">保存插件</button></p>
         </div>`;

    createDialog(cnt, 0, 'optionsDialog');
}// 结尾 addPlugin


function moreOptions(show = 'all') {
    closeDialogs(); // 在显示选项对话框之前关闭打开的对话框

    let m_disable_audio_option = '';
    let m_is_audio_feature_active = localStorage.getItem('audio_feature')
    m_is_audio_feature_active = parseInt(m_is_audio_feature_active);
    let m_is_eleven_keys_set = localStorage.elabs_api_key ?? '';
    if (m_is_audio_feature_active) {
        m_disable_audio_option = `<p><b id="audio_txt_status">音频活动：</b> <button class="disable_btn" onclick="disableAudioFeature()">禁用音频</button></p>`;
    } else {
        if (m_is_eleven_keys_set) {
            m_disable_audio_option = `<p><b id="audio_txt_status">音频已禁用：</b> <button onclick="enableAudioFeature()">启用音频</button></p>`;
        }
    }
    let m_audio_options =
        `<p>如果您想要音频响应，您可以在下面为 ElevenLabs 设置 API 密钥。</p>
         <input type="text" name="elabs_api_key" placeholder="ElevenLabs API 密钥">
         <button onclick="enableAudioFeature()">保存密钥</button>
        `;
    let cse_option = `
    <hr>
    <p><span class="beta_warning"></span><b>RAG：使用 Google 搜索</b></p>
    <p>通过启用 Google <abbr title="Custom Search Engine">CSE</abbr>，您将能够让 AI 搜索互联网。</p>
    <input type="text" id="cse_google_api_key" name="cse_google_api_key" placeholder="Google CSE API 密钥">
    <input type="text" id="cse_google_cx_id" name="cse_google_cx_id" placeholder="Google CX ID">
    <button onclick="enableGoogleCse()">激活</button>
    `;
    if(show === 'all'){
        cse_option = '';
    }

    let rag_options = `
             <div><hr>
             <p>为了提高 RAG 的效率，请配置高级搜索</p>
             <button onclick="ragEndpointDialog()">先进的</button>
             </div>`;
    rag_options = '';

    let g_cse_status = '';
    if (isGoogleCseActive()) {
        g_cse_status = `<button id="disable_g_cse" class="disable_btn" onclick="disableGoogleCse()">禁用 CSE</button`;
    }


    let import_export_configs =
        `<div>
         <hr>
         <p>导入或导出设置和已保存的聊天内容。</p>
          <button onclick="downloadChatHistory()">出口</button>
          <button onclick="restoreChatHistory()">进口</button>
         </div>`;

    let cnt =
        `<div>
         ${m_audio_options}
         ${m_disable_audio_option}
         ${cse_option}
         ${g_cse_status}
         ${rag_options}
         ${import_export_configs}
         </div>`;
    if (show === 'cse') {
        cnt =
            `<div>
              ${cse_option}
              ${g_cse_status}
         </div>`;
    }
    createDialog(cnt, 0, 'optionsDialog');
}


function addModelsOptions() {
    closeDialogs(); // 关闭已打开的对话框，然后显示新的对话框
    let provider_options =
        '<div><p>添加新的 AI 模型</p>' +
        '<p>选择您想要添加新模型的提供商。</p>' +
        '<select name="provider">' +
        '<option disabled="disabled" selected="selected">选择</option>';

    Object.keys(PLATFORM_DATA).forEach(platform => {
        if (platform !== 'ollama') {
            // 自动获取 Ollama 模型
            let platform_name = PLATFORM_DATA[platform].name;
            provider_options += `<option value="${platform}">${platform_name}</option>`;
        }

    })


    let extra_models = localStorage.getItem("extra_models");
    extra_models = JSON.parse(extra_models);
    let remove_models = '';
    if (extra_models) {
        remove_models = '<div><p>您也可以删除这些模型！</p>';
    }
    for (const provider in extra_models) {
        if (extra_models.hasOwnProperty(provider)) {
            let provide_name = PLATFORM_DATA[provider].name;
            let idx = 0;
            extra_models[provider].forEach(model => {
                remove_models += `<button class="remove_model_btn" data-id="js_btn_${idx}" onclick="removeModel('${provider}', '${model}', ${idx})" title="从 ${provide_name}">消除 ${model}</button>`;
                let has_model = PLATFORM_DATA[provider].models.includes(model);
                if (!has_model) {
                    PLATFORM_DATA[provider].models.push(model);
                }
                idx++;
            })
        }
    }
    if (remove_models) {
        remove_models += '</div>';
    }

    provider_options += `</select></div>`;

    let new_model =
        '<input name="new_model" placeholder="模型 ID">' +
        '<button onclick="addNewModel()" class="save_new_model">添加模型</button>';
    let cnt =
        `<div>${provider_options}</div><div>${new_model}</div>${remove_models}`;
    createDialog(cnt, 0, 'optionsDialog');
}


function removeModel(provider, model, id) {
    let extra_models = localStorage.getItem('extra_models');
    extra_models = JSON.parse(extra_models);
    extra_models[provider] = extra_models[provider].filter(item => item !== model);
    localStorage.setItem('extra_models', JSON.stringify(extra_models));
    let btn = document.querySelector(`[data-id=js_btn_${id}]`);
    btn.remove();
    loadExtraModels();
}

function addNewModel() {
    let provider = document.querySelector("select[name=provider]");
    let new_model = document.querySelector("input[name=new_model]");
    new_model = new_model.value.trim();
    provider = provider.value.trim().toLowerCase();
    if (provider === 'select') {
        addWarning('请选择提供商', true, 'fail_dialog');
        provider = '';
    }
    if (provider && new_model) {
        let has_model = PLATFORM_DATA[provider]?.models?.includes(new_model) ?? false;
        if (!has_model) {
            let extra_models = localStorage.getItem("extra_models");
            if (extra_models === null) {
                extra_models = '{}';
            }
            extra_models = JSON.parse(extra_models);
            if (extra_models[provider]) {
                extra_models[provider].push(new_model);
            } else {
                extra_models[provider] = [new_model];
            }
            localStorage.setItem('extra_models', JSON.stringify(extra_models));
            addWarning('新模型添加成功！', true, 'success_dialog');
        } else {
            let msg = `${provider} 的模型${new_model} 已存在！`;
            addWarning(msg, true, 'fail_dialog');
        }
    }
    loadExtraModels();
}

function setYouTubeCaptionApiEndpoint() {
    let ele = document.querySelector("#yt_down_caption_endpoint");
    if (ele) {
        let yt_down_caption_endpoint = ele.value.trim();
        localStorage.setItem('yt_down_caption_endpoint', yt_down_caption_endpoint);
    }
    closeDialogs();
}

function dialogSetYouTubeCaptionApiEndpoint() {
    let path_name = location.pathname.replace(/\/$/, ""); // 删除末尾的“/”
    let caption_api_endpoint = `${location.origin}${path_name}/plugins/php/yt_caption.php`;
    let input_value = '';
    if (!location.hostname.match("github.io")) {
        input_value = `value="${caption_api_endpoint}"`;
    }
    let cnt =
        `<div><p>配置 YouTube 字幕提取 API 端点。</p>
        <input ${input_value} id="yt_down_caption_endpoint" name="yt_down_caption_endpoint" placeholder="API 端点">
        <button onclick="setYouTubeCaptionApiEndpoint()">Save</button>
        <p>这将允许您分享 YouTube URL，AI 将根据共享视频的标题做出响应。</p></div>
        <div><p>欲了解更多信息，请查看
        <a target="_blank" href="https://github.com/EliasPereirah/OrionChatChinese/tree/master#youtube-字幕">链接</a></p></div>
        `

    createDialog(cnt, 0, 'optionsDialog');
}


function orderTopics() {
    let topics = document.querySelectorAll('.topic');
    if (topics.length) {
        let topicsArray = Array.prototype.slice.call(topics);
        topicsArray.sort(function (a, b) {
            let interactionA = parseInt(a.getAttribute('data-last-interaction'));
            let interactionB = parseInt(b.getAttribute('data-last-interaction'));
            return interactionB - interactionA;
        });
        let parent = topicsArray[0].parentNode;
        topicsArray.forEach(function (topic) {
            parent.appendChild(topic);
        });
    }

}

function savePrompt(close_dialog = true) {
    let btn_sp = document.querySelector('.save_prompt');
    if (btn_sp) {
        btn_sp.classList.remove('animate');
    }
    let sys_prompt = document.querySelector("textarea.system_prompt").value.trim();
    if (sys_prompt.length) {
        let prompt_name = document.querySelector("#prompt_name");
        if (prompt_name && prompt_name.value.trim().length > 0) {
            // new prompt add by the user
            let user_prompts = localStorage.getItem('user_new_prompts');
            if(user_prompts){
                user_prompts = JSON.parse(user_prompts);
            }else {
                user_prompts = [];
            }
            let current_time = Date.now();
            let u_new_prompt = {act: prompt_name.value,  prompt: sys_prompt, by_user: true, created_time: current_time};
            user_prompts.unshift(u_new_prompt);
            all_prompts.unshift(u_new_prompt);
            localStorage.setItem('user_new_prompts', JSON.stringify(user_prompts));
        }
        localStorage.setItem('system_prompt', sys_prompt);
    } else {
        localStorage.removeItem('system_prompt')
    }

    saveModel();
   if(close_dialog){
       closeDialogs();
   }
}

function saveModel() {
    let btn_sm = document.querySelector('.save_model');
    if (btn_sm) {
        btn_sm.classList.remove('animate');
    }

    let sl_platform = document.querySelector("select[name=platform]")
    let selected_option = sl_platform.options[sl_platform.selectedIndex];
    model = selected_option.value.trim();
    localStorage.setItem('selected_model', model);
    let selected_platform = selected_option.getAttribute('data-platform');
    let input_api_key = document.querySelector("input[name=api_key]").value.trim();
    if (input_api_key) {
        api_key = input_api_key; // 需要这样
    }
    localStorage.setItem('chosen_platform', selected_platform);
    chosen_platform = selected_platform;
    let platform_name = PLATFORM_DATA[chosen_platform].name;
    endpoint = PLATFORM_DATA[selected_platform].endpoint;
    localStorage.setItem('endpoint', endpoint)
    if (input_api_key) {
        localStorage.setItem(`${chosen_platform}.api_key`, api_key)
    } else {
        api_key = localStorage.getItem(`${chosen_platform}.api_key`)
    }
    if (!api_key && chosen_platform === 'ollama') {
        api_key = 'i_love_ollama_'.repeat(3);
        localStorage.setItem(`${chosen_platform}.api_key`, api_key);
    }
    let platform_info = document.querySelector(".platform_info");
    if (platform_info) {
        platform_info.innerHTML = `Active: <b>${model}</b> from <b>${platform_name}</b>`;
    }
    createDialog('儲存成功！ ', 3)

}

let hc = localStorage.getItem("hide_conversations");
if (hc === '1') {
    //  document.querySelector('.conversations').style.display = 'none';
} else {
    if (!is_mobile) {
        //  document.querySelector('.conversations').style.display = 'block';
    }
}

if (!api_key) {
    let open_options = document.querySelector("#open_options");
    open_options.click();
}

let page_chat_id = document.URL.split("#")[1];
let current_chat = document.querySelector("[data-id='" + page_chat_id + "']");

if (current_chat) {
    current_chat.click();
} else if (page_chat_id) {
    // 聊天 ID 不存在，将更新主页的 URL
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    history.pushState({url: new_url}, '', new_url);
}

orderTopics();


function ollamaGuide() {
    if (is_mobile) {
        console.log('用户似乎正在使用移动设备')
        return false;
    }
    let this_domain = `${location.protocol}//${location.hostname}`;
    let guide = `<div>
    <p>如果您想使用 Ollama，您可能需要在本地 Ollama 设置中进行一些配置。</p>
    <p>请查看 Ollama 文档：</p>
    <p>查看这些链接：<br>
    -> <a target="_blank" href="https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama">其他网络来源</a><br>
    -> <a target="_blank" href="https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux">设置环境变量</a>
  </p>
  <p>Linux CLI example:</p>
  <pre><code>systemctl edit ollama.service</code></pre>
  <p>添加以下内容：</p>
  <pre><code>[Service]
Environment="OLLAMA_ORIGINS=${this_domain}"</code></pre>
  <p><br>这将允许 <strong>${this_domain}</strong> 访问 http://localhost:11434/</p>
</div>`

    createDialog(guide, 0, 'cl_justify')
    hljs.highlightAll();
    setTimeout(() => {
        enableCopyForCode(false);
    }, 500)

}


function getOllamaModels() {
    let ollama_models_endpoint = PLATFORM_DATA.ollama.get_models_endpoint;
    let optgroup_ollama = document.querySelector("select[name=platform] [label=Ollama]")
    let start_time = new Date().getTime();
    fetch(ollama_models_endpoint)
        .then(response => {
            return response.json();
        })
        .then(data => {
            data = data.data ?? [];
            data.forEach(ollama_model => {
                let option_element = document.createElement('option');
                option_element.setAttribute("data-platform", "ollama");
                option_element.value = ollama_model.id;
                option_element.innerText = ollama_model.id;
                if (optgroup_ollama) {
                    optgroup_ollama.append(option_element)
                }
                PLATFORM_DATA.ollama.models.push(ollama_model.id);
            })
        }).catch(error => {
            console.warn(error)
            let end_time = new Date().getTime()
            let past_time = end_time - start_time;
            if (past_time > 1200) {
                //console.log("用户似乎没有运行 ollama");
            } else {
                console.log('用户似乎已使用 cors 策略运行 Ollama')
                let guide_warnings = localStorage.getItem('guide_warnings');
                if (!guide_warnings) {
                    guide_warnings = 0;
                }
                guide_warnings = parseInt(guide_warnings);
                guide_warnings++
                if (guide_warnings <= 4) {
                    ollamaGuide();
                }
                localStorage.setItem('guide_warnings', guide_warnings.toString());
            }
        }
    )
}

getOllamaModels();

function disableAudioFeature() {
    let audio_txt_status = document.querySelector("#audio_txt_status");
    audio_txt_status.innerText = '音频已禁用！'
    localStorage.setItem('audio_feature', '0');
    addWarning('音频功能已禁用', true)
}

function enableAudioFeature() {
    let audio_txt_status = document.querySelector("#audio_txt_status");
    localStorage.setItem('audio_feature', '1');
    let input_ele = document.querySelector("input[name=elabs_api_key]");

    if (input_ele && input_ele.value.trim().length > 5) {
        elabs_api_key = input_ele.value.trim();
        localStorage.setItem('elabs_api_key', elabs_api_key)
        addWarning('已启用音频功能', true)
        if (audio_txt_status) {
            audio_txt_status.innerText = '音频已启用！'
        }
    } else {
        if (!elabs_api_key) {
            addWarning('操作。没有提供钥匙！', false)
        } else {
            addWarning('已启用音频功能', true)
            if (audio_txt_status) {
                audio_txt_status.innerText = '音频已启用！'
            }
        }
    }

}


function needToolUse(last_user_input) {
    let lui = last_user_input.trim();
    let cmd = lui.match(/^[a-z]+:/i)?.[0];
    let cmd_list = [
        'search:', 's:',
        'javascript:', 'js:',
        'youtube:', 'yt:'
    ]
    if (cmd_list.includes(cmd)) {
        return true;
    } else if (last_user_input.match(/youtube\.com|youtu\.be/)) {
        let time_now = new Date().getTime();
        let past_seconds = (time_now - last_auto_yt_fn_call) / 1000;
        if (past_seconds > 10) {
            last_auto_yt_fn_call = time_now;
            return true
        }
    }
    return false;
}

function whichTool(last_user_input) {
    let lui = last_user_input.trim();
    let cmd = lui.match(/^[a-z]+:/i)?.[0] ?? '';
    if (cmd === "search:" || cmd === 's:') {
        return 'googleSearch';
    } else if (cmd === 'javascript:' || cmd === 'js:') {
        return 'javascriptCodeExecution';
    } else if (cmd === 'youtube:' || cmd === 'yt:') {
        return 'youtubeCaption';
    } else if (last_user_input.match(/youtube\.com|youtu\.be/)) {
        return 'youtubeCaption';
    }
    return '';
}

function commandManager(input_text) {
    input_text = input_text.trim() + " ";
    let arr = input_text.match(/^[a-z]+:(.*?)\s/i);
    let cmd = '';
    let args = '';
    if (arr) {
        cmd = arr[0];
        cmd = cmd.replace(/:(.*)/, "");
        if (arr[1]) {
            args = arr[1];
        }
    }

    let prompt = especial_prompts[cmd] ?? '';
    if (!prompt) {
        return false; // 没有命令传递
    }

    input_text = input_text.replace(/^[a-z]+:(.*?)\s/i, " ").trim();
    prompt = prompt.replaceAll("{{USER_INPUT}}", input_text);

    prompt = prompt.replaceAll("{{ARG1}}", args);
    return prompt; //返回新的提示格式

}


async function youtubeCaption(data) {
    let video_title = '';
    let yt_down_caption_endpoint = localStorage.getItem("yt_down_caption_endpoint") ?? ''
    if (!yt_down_caption_endpoint) {
        dialogSetYouTubeCaptionApiEndpoint();
        removeLastMessage();
        enableChat();
        //toggleAnimation(true);
        toggleAiGenAnimation(false);
        return false;
    }

    let url = data.url ?? '';
    if (!url) {
        addWarning('youtubeCaption() 未收到 URL 参数');
    }
    console.log('提取标题 ' + url);
    let caption = '';


    const urlencoded = new URLSearchParams();
    urlencoded.append('yt_url', url);
    let data_init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded
    }
    await fetch(yt_down_caption_endpoint, data_init).then(function (res) {
        return res.json();
    }).then(function (json) {
        if (json.caption) {
            caption = json.caption;
        }
        if (json.title) {
            video_title = json.title;
        }

    });
    if (caption === '') {
        addWarning('无法获取此视频的字幕', false)
        removeLastMessage();
    } else {
        let last_input = last_user_input.replace(/^[a-z]+:(.*?)\s/i, " "); // remove cmd
        let ele = document.querySelector(".message:nth-last-of-type(1)");
        if (pre_function_text) {
            last_input = pre_function_text;
        }
        let cnt = `${last_input} <details><summary><b>标题</b>: ${video_title}</summary><br><b>标题</b>: ${caption}</details>`;
        if (ele) {
            ele.innerHTML = cnt;
        }
        pre_function_text = '';
        conversations.messages[conversations.messages.length - 1].content = cnt;
        setTimeout(() => {
            loadVideo()
        }, 1000)
        if (chosen_platform === 'google') {
            await geminiChat()
           // toggleAnimation(true);
            toggleAiGenAnimation(false);
        } else {
            await streamChat(false); // false 以防止无限循环
           // toggleAnimation(true);
            toggleAiGenAnimation(false)
        }

    }


} // youtubeCaption


async function streamChat(can_use_tools = true) {
    let first_response = true;
    addFileToPrompt();
    last_user_input = conversations.messages[conversations.messages.length - 1].content;
    let cmd = commandManager(last_user_input)
    let all_parts = [];
    let invalid_key = false;
    let system_prompt_text = getSystemPrompt();
    if (system_prompt_text) {
        let system_prompt = {content: system_prompt_text, 'role': 'system'};
        if (chosen_platform !== 'anthropic') {
            if (!cmd) {
                if (!base64String) {
                    all_parts.push(system_prompt);
                }
            }
        }
    }

    conversations.messages.forEach(part => {
            //let role = part.role === 'assistant' ? 'model' : part.role;
            let cnt = part.content;
            last_role = part.role;
            last_cnt = part.content;
            if (chosen_platform === 'anthropic') {
                let ant_part =
                    {
                        role: part.role,
                        content: [{type: 'text', text: cnt}]
                    }
                all_parts.push(ant_part);
            } else if (chosen_platform === 'cohere') {
                let cohere_part =
                    {
                        role: part.role,
                        content: cnt
                    };
                all_parts.push(cohere_part);

            } else {
                all_parts.push({content: part.content, role: part.role});
            }

        }
    ); // 结尾 forEach

    if (base64String && last_role === 'user' && chosen_platform === 'anthropic') {
        let ant_part = {
            role: last_role,
            content: [{
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": mimeType,
                    "data": base64String.split(',')[1]
                }
            }, {type: 'text', text: last_cnt}]
        };
        all_parts.pop(); // 删除最后一个
        all_parts.push(ant_part); // 添加图像方案
        base64String = '';
        mimeType = '';
    } else if (base64String && last_role === 'user') {
        all_parts.pop();
        all_parts.push({
            "role": last_role,
            "content": [
                {
                    "type": "text",
                    "text": last_cnt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": base64String
                    }
                }]
        });
        base64String = '';
        mimeType = '';
    }

    if (cmd) {
        all_parts.pop() // 删除最后一个
        // 有 cmd - 因此将刚刚过去命令中的最后一条用户消息
        if (chosen_platform === 'anthropic') {
            let ant_part =
                {
                    role: 'user',
                    content: [{type: 'text', text: cmd}]
                };
            all_parts.push(ant_part);
        } else {
            all_parts.push({content: cmd, role: 'user'});
        }
    }

    let data =
        {
            model: model,
            stream: true,
            messages: all_parts,
        }
    if (chosen_platform === 'anthropic') {
        data.max_tokens = 4096;
        if (system_prompt_text) {
            data.system = system_prompt_text;
        }
    }


    let HTTP_HEADERS = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
        'x-api-key': `${api_key}`, // 为了 Anthropic

    };
    if (chosen_platform === 'anthropic') {
        HTTP_HEADERS["anthropic-version"] = "2023-06-01";
        HTTP_HEADERS['anthropic-dangerous-direct-browser-access'] = "true";
    }

    if (chosen_platform === "azure") {
        HTTP_HEADERS['api-key'] = api_key;
    }
    if (chosen_platform === 'ollama') {
        HTTP_HEADERS = {};
    }
    let the_tool = '';
    if (can_use_tools) {
        if (needToolUse(last_user_input)) {
            let tool_name = whichTool(last_user_input);
            let tool_compatibility = `openai_compatible`;
            if (chosen_platform === 'anthropic') {
                tool_compatibility = 'anthropic_compatible';
            } else if (chosen_platform === 'cohere') {
                tool_compatibility = 'cohere_compatible';
            }

            the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
            if (the_tool) {
                data.stream = false; // 在这种情况下，对于工具使用，我们不会使用流模式
                data.tools = [the_tool];
                if (chosen_platform !== 'cohere') {
                    data.tool_choice = "required";
                }
                if (chosen_platform === 'anthropic') {
                    data.tools = [the_tool];
                    data.tool_choice = {"type": "tool", "name": tool_name};
                }
            }
        }
    }


    const requestOptions = {
        method: 'POST',
        headers: HTTP_HEADERS,
        body: JSON.stringify(data)
    };


    if (!endpoint) {
        setOptions();
       // toggleAnimation(true);
        toggleAiGenAnimation(false);
        removeLastMessage();
        enableChat();
        return false;
    }

    try {
        const response = await fetch(endpoint, requestOptions);
        if (!response.ok) {
            response.json().then(data => {
                setTimeout(() => {
                    addWarning(data);
                }, 500)
                removeLastMessage();
                //toggleAnimation(true);
                toggleAiGenAnimation(false);
                enableChat();
                let the_code = data.code ?? data.error?.code ?? data.error?.message ?? data.message ?? '';
                if (the_code === "wrong_api_key" || the_code === "invalid_api_key" || the_code === "invalid x-api-key" || the_code === "invalid api token") {
                    setApiKeyDialog();
                }
            })
            return false;
        }


        story = '';
        let cloned_response = response.clone();
        const reader = response.body.getReader();
        let chatContainer = document.querySelector('#chat-messages');
        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot');
        if (!the_tool) {
            chatContainer.append(botMessageDiv);
        }
        let buffer = '';
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                if (story === '') {
                    cloned_response.json().then(data => {
                        processFullData(data);
                        if (story) {
                            addConversation('assistant', story, true, true);
                            enableCopyForCode(true);
                            hljs.highlightAll();
                        } else {
                            // probably not stream - tool use
                           // toggleAnimation(true);
                            toggleAiGenAnimation(false);
                            toolHandle(data);
                            return false;
                        }
                    }, error => {
                        addWarning(error)
                    })

                } else {
                    processBuffer(buffer);
                    addConversation('assistant', story, false, false);
                }

                break;
            }

            const textDecoder = new TextDecoder('utf-8');
            const chunk = textDecoder.decode(value, {stream: true});
            buffer += chunk;
            let separator = chosen_platform === 'anthropic' ? '\n\n' : '\n';
            let parts = buffer.split(separator);

            buffer = parts.pop() || '';

            for (let part of parts) {
                if (part.startsWith('data: ') || part.startsWith('event: content_block_delta')) {
                    if (!part.startsWith('data: [DONE]')) {
                        try {
                            processDataPart(part);
                        } catch (jsonError) {
                            addWarning(JSON.stringify(jsonError));
                            console.error("JSON error: ", jsonError);
                        }
                    }
                }
            }

            botMessageDiv.innerHTML = converter.makeHtml(story);
            hljs.highlightAll();
            if (first_response) {
                first_response = false;
                //toggleAnimation(true);
                //toggleAiGenAnimation(false);
                botMessageDiv.scrollIntoView();
            }

        }

    } catch (error) {
        console.error("Error:", error);
        if (error === {}) {
            error = 'Error: {}';

        }

        addWarning(error, false)
        // Display error message in the chat
        if (invalid_key) {
            setApiKeyDialog();
        }
    } finally {
        enableCopyForCode();
        enableChat();
        toggleAiGenAnimation(false);
        toggleAiGenAnimation(false);
    }
}


// 将 json、md、txt 等文件添加到用户提示
// 如果不是音频、视频或图像文件，则会进行添加
function addFileToPrompt() {
    if (base64String === '') {
        return false;
    }

    let gemini_supported_mimeTypes = [
        "application/pdf",
        "application/x-javascript",
        "text/javascript",
        "application/x-python",
        "text/x-python",
        "text/plain",
        "text/html",
        "text/css",
        "text/md",
        "text/csv",
        "text/xml",
        "text/rtf"
    ]

    if (chosen_platform === 'google' && gemini_supported_mimeTypes.includes(mimeType)) {
        // 无需转换为文本，gemini 可以处理该类型的文件
        return false;
    }


    let last_input_from_user = conversations.messages[conversations.messages.length - 1].content;
    let mime = mimeType.split("/")[0].toLowerCase();
    let the_type = mimeType.split("/")[1];
    if (the_type && the_type.toLowerCase() === 'pdf') {
        return false;
    }
    let except = ['audio', 'video', 'image'];
    let appended_txt_file = '';
    if (!except.includes(mime)) {
        let real_b64 = base64String.split(',')[1];
        appended_txt_file = atob(real_b64)
        let ele = document.querySelector(".message:nth-last-of-type(1)");
        if (appended_txt_file.trim().length > 0) {
            last_input_from_user = `${last_input_from_user} \n <pre><code>${appended_txt_file}</code></pre>`;
        }
        if (ele && ele.classList.contains('user')) {
            ele.innerHTML = last_input_from_user;
        }
        conversations.messages[conversations.messages.length - 1].content = last_input_from_user;
        base64String = '';
        mimeType = '';
    }
}

function detectAttachment() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                mimeType = file.type;
                const reader = new FileReader();
                reader.onload = function (event) {
                    base64String = event.target.result;
                    fileInput.parentElement.classList.add('has_attachment')
                    fileInput.value = '';
                }
                reader.readAsDataURL(file);
            }
        }
    }
}


detectAttachment();

async function geminiUploadImage() {
    if (!base64String) {
        return false;
    }

   // Google Gemini 23 小时内不会再次上传相同内容
    let md5_value = MD5(decodeURIComponent(encodeURIComponent(base64String)));
    let upload_date = localStorage.getItem(md5_value);
    let today_date = new Date().getTime();
    if (upload_date) {
        upload_date = parseInt(upload_date);
        upload_date = new Date(upload_date);
        const differ_ms = today_date - upload_date;
        const d_seconds = Math.floor(differ_ms / 1000);
        const d_minutes = Math.floor(d_seconds / 60);
        const d_hours = Math.floor(d_minutes / 60);
        if (d_hours < 48) {
            let store_fileUri = localStorage.getItem('file_' + md5_value); //存储了 fileUri
            if (store_fileUri) {
                console.log('无需再次上传')
                return store_fileUri;
            }
        }

    } else {
        console.log('文件是新的')
    }

    let baseUrl = 'https://generativelanguage.googleapis.com';

    mimeType = base64String.substring(base64String.indexOf(":") + 1, base64String.indexOf(";"));

    const byteCharacters = atob(base64String.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    let imgBlob = new Blob([byteArray], {type: mimeType});
    try {
        const startUploadOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': imgBlob.size,
                'X-Goog-Upload-Header-Content-Type': imgBlob.type,
            },
            body: JSON.stringify({'file': {'display_name': 'TEXT'}}),
        };

        const startRes = await fetch(`${baseUrl}/upload/v1beta/files?key=${api_key}`, startUploadOptions);
        const uploadUrl = startRes.headers.get('X-Goog-Upload-URL');

        // Upload the actual bytes
        const uploadOptions = {
            method: 'POST',
            headers: {
                'Content-Length': imgBlob.size,
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: imgBlob,
        };

        const uploadRes = await fetch(uploadUrl, uploadOptions);
        const fileInfo = await uploadRes.json();
        const fileUri = fileInfo.file.uri;


        let file_state = ''
        let start_time = new Date().getTime();
        while (file_state !== 'ACTIVE') {
            console.log('while: file_state:' + file_state)
            await fetch(fileUri + "?key=" + api_key)
                .then(response => response.json())
                .then(data => {
                    file_state = data.state;
                })
                .catch(error => {
                    console.error('Request error:', error);
                });
            if (file_state === 'ACTIVE') {
                break;
            } else {
                await delay(5000); // wait 5 seconds
                // wait 5 secs before verify again
            }
            let past_time = new Date().getTime() - start_time;
            let past_seconds = past_time / 1000;
            if (past_seconds > 180) {
                addWarning('上传耗时过长。请稍后重试。', false)
                console.log('上传耗时过长')
                break;
            }


        }

        localStorage.setItem('file_' + md5_value, fileUri);
        localStorage.setItem(md5_value, new Date().getTime().toString());

        return fileUri;


    } catch (error) {
        console.error('Error:', error);
    }
    return false;
}


async function geminiStreamChat(fileUri, data) {
    last_user_input = conversations.messages[conversations.messages.length - 1].content;
    if (needToolUse(last_user_input)) {
        let tool_name = whichTool(last_user_input);
        let tool_compatibility = `google_compatible`;
        let the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
        if (the_tool) {
            geminiChat(fileUri, false)
        } else {
            console.log('没有工具')
        }
    }
    // const endpoint_stream = `https://generativelanguage.googleapis.com/v1beta/models/${{model}}:streamGenerateContent?alt=sse&key=${{api_key}}`;

    let endpoint_stream = endpoint.replaceAll("{{model}}", model);
    endpoint_stream = endpoint_stream.replaceAll("{{gen_mode}}", "streamGenerateContent");
    endpoint_stream = endpoint_stream.replaceAll("{{api_key}}", api_key + "&alt=sse");

    let first_response = true;
    try {
        const the_response = await fetch(endpoint_stream, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!the_response.ok) {
            the_response.json().then(data => {
                setTimeout(() => {
                    addWarning(data);
                }, 500)
                removeLastMessage();
               // toggleAnimation(true);
                toggleAiGenAnimation(false);
                enableChat();
                let tt = data.error?.message ?? 'nada';
                if (tt.match(/API key not valid/)) {
                    setApiKeyDialog();
                }
            })
            return false;
        }
        const reader = the_response.body.getReader();
        let chatContainer = document.querySelector('#chat-messages'); // 获取聊天容器
        const botMessageDiv = document.createElement('div');  // 创建机器人消息 div
        botMessageDiv.classList.add('message', 'bot');      // 添加类
        chatContainer.append(botMessageDiv); // 附加到聊天

        story = '';

        all_chunks = [];
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                if (story) {
                    addConversation('assistant', story, false, false)
                    //toggleAnimation(true)
                    //toggleAiGenAnimation(false);
                }
                break;
            }

            const textDecoder = new TextDecoder('utf-8');
            const chunk = textDecoder.decode(value);
            all_chunks.push(chunk);
            // 解析 SSE 流
            chunk.split('\n').forEach(part => {
                if (part.startsWith('data: ')) {
                    try {
                        let jsonData = null;
                        try {
                            jsonData = JSON.parse(part.substring('data: '.length));
                        }catch{
                            has_chunk_error = true;
                            return false;
                        }

                        processPartGemini(jsonData);

                    } catch (error) {
                        addWarning(error, false);
                        console.error("Error:", error);
                    }
                }
            });
            if (first_response) {
                first_response = false;
                //toggleAnimation(true);
                //toggleAiGenAnimation(false);
                botMessageDiv.scrollIntoView();
            }
            if (story) {
                botMessageDiv.innerHTML = converter.makeHtml(story);
            }
            hljs.highlightAll();
        }


        /// 解决 json 解析错误的解决方法
        story = '';
        if(has_chunk_error){
            let all_fixed_chunks = '';
            let pieces = [];
            all_chunks.forEach(the_chunk=>{
                if(the_chunk.startsWith('data: ')){
                    try {
                        JSON.parse(the_chunk.substring('data: '.length));
                        if(pieces.length > 0){
                            let the_piece = pieces.join('');
                            all_fixed_chunks += the_piece;
                            pieces = [];
                        }
                        all_fixed_chunks += the_chunk;
                    }catch{
                        pieces.push(the_chunk);
                    }
                }else {
                    pieces.push(the_chunk);
                }
            })

            all_fixed_chunks = all_fixed_chunks.split("\ndata: ");
            all_fixed_chunks[0] = all_fixed_chunks[0].replace(/^data: /, '');
            all_fixed_chunks.forEach(fixed_chunk=>{
                let jsonData = null;
                try {
                    jsonData = JSON.parse(fixed_chunk);
                }catch{
                    return false;
                }
                processPartGemini(jsonData);
            })
            if (story) {
                let story_content = story.replace(/<img[^>]*>/g, ''); // 删除 base64 图像以保存 token
                conversations.messages[conversations.messages.length -1].content = story_content;
                saveLocalHistory();
               botMessageDiv.innerHTML = converter.makeHtml(story);
            }
            hljs.highlightAll();
        } // end has_chunk_error

        all_chunks = [];



    } catch (error) {
        console.error("Error:", error);
        addWarning('Error: ' + error.message)
        //toggleAnimation(true);
       // toggleAiGenAnimation(false);
        //enableChat();
    } finally {
        enableCopyForCode();
        enableChat();
        //toggleAnimation(true)
        toggleAiGenAnimation(false);
        toggleAiGenAnimation(false);
    }
} // geminiStreamChat


function processPartGemini(jsonData){
    let inlineData = '';
    if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
        story += jsonData.candidates[0].content?.parts[0].text;
        inlineData = jsonData.candidates[0].content?.parts[0]?.inlineData ?? '';
        if(!inlineData){
            inlineData = jsonData.candidates[0].content?.parts[1]?.inlineData ?? '';
        }
        if (inlineData) {
            inlineData = `<img class="img_output" src="data:${inlineData.mimeType};base64,${inlineData.data}" alt="">`
        }
        story += inlineData;
    } else if (jsonData.candidates?.[0]?.content?.parts?.[0]?.executableCode?.code) {
        let code = jsonData.candidates[0].content.parts[0].executableCode.code;
        let code_lang = jsonData.candidates[0].content.parts[0].executableCode.language;
        code_lang = code_lang.toLowerCase();
        code = `<pre><code class="${code_lang} language-${code_lang} hljs code_execution">${code}</code></pre>`;
        story += code;
        inlineData = jsonData.candidates[0].content?.parts[0]?.inlineData ?? '';
        if(!inlineData){
            inlineData = jsonData.candidates[0].content?.parts[1]?.inlineData ?? '';
        }
        if (inlineData) {
            inlineData = `<img class="img_output" src="data:${inlineData.mimeType};base64,${inlineData.data}" alt="">`
        }
        story += inlineData;
    } else if (jsonData.candidates?.[0]?.content?.parts?.[0]?.codeExecutionResult?.output) {
        let ce_outcome = jsonData.candidates[0].content.parts[0].codeExecutionResult.outcome; // OUTCOME_OK == success
        let ce_output = jsonData.candidates[0].content.parts[0].codeExecutionResult.output;
        ce_output = ce_output.replaceAll("\n", "<br>");
        story += `<div class="code_outcome ${ce_outcome}">${ce_output}</div>`;

        inlineData = jsonData.candidates[0].content?.parts[0]?.inlineData ?? '';
        if(!inlineData){
            inlineData = jsonData.candidates[0].content?.parts[1]?.inlineData ?? '';
        }
        if (inlineData) {
            inlineData = `<img class="img_output" src="data:${inlineData.mimeType};base64,${inlineData.data}" alt="">`
        }
        story += inlineData;
    }


    let finished_reason = jsonData.candidates[0].finishReason ?? '';
    if (finished_reason && finished_reason !== 'STOP') {
        setTimeout(() => {
            addWarning('finishReason: ' + finished_reason, false, 'fail_dialog')
        }, 500)
    }
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function processDataPart(part) {
    let jsonData;
    if (chosen_platform === 'anthropic') {
        jsonData = JSON.parse(part.substring('event: content_block_delta'.length + 6));
        if (jsonData.delta?.text) {
            story += jsonData.delta.text;
        }
    } else {
        jsonData = JSON.parse(part.toString().substring('data: '.length));
        if (chosen_platform === 'cohere') {
            if (jsonData.delta?.message?.content?.text) {
                story += jsonData.delta.message.content.text;
            }
        } else {
            if (jsonData.choices?.[0]?.delta?.content) {
                story += jsonData.choices[0].delta.content;
            }
        }
    }
}


function processFullData(jsonData) {
    if (chosen_platform === 'anthropic') {
        if (jsonData.content?.[0].text) {
            story += jsonData.content[0].text;
        }
    } else {
        if (chosen_platform === 'cohere') {
            if (jsonData.message?.content?.[0]?.text) {
                story += jsonData.message.content[0].text;
            }
        } else {
            if (jsonData.choices?.[0]?.message?.content) {
                story += jsonData.choices[0].message.content;
            }
        }
    }
}

function processBuffer(remainingBuffer) {
    if (remainingBuffer.trim().length > 0) {
        try {
            processDataPart(remainingBuffer);
        } catch (error) {
            console.error('处理最终缓冲区时出错', error);
            addWarning(JSON.stringify(error));
        }
    }
}

function enableGoogleCse() {
    let g_api_key = document.querySelector("#cse_google_api_key")?.value.trim() ?? '';
    let g_cx_id = document.querySelector("#cse_google_cx_id")?.value.trim() ?? '';
    if (g_api_key && g_cx_id) {
        localStorage.setItem('cse_google_api_key', g_api_key)
        localStorage.setItem('cse_google_cx_id', g_cx_id)
        closeDialogs();
        addWarning('Google CSE 成功定义！', true, 'success_dialog');
    } else {
        addWarning("错误：未为 Google 自定义搜索定义 API 密钥和/或 CX ID", true, 'fail_dialog')
    }
}

function disableGoogleCse() {
    localStorage.removeItem('cse_google_api_key')
    localStorage.removeItem('cse_google_cx_id')
    let disable_g_cse = document.querySelector("#disable_g_cse");
    if (disable_g_cse) {
        disable_g_cse.remove();
    }
    closeDialogs();
}

function isGoogleCseActive() {
    let g_api_key = localStorage.getItem('cse_google_api_key')
    let g_cx_id = localStorage.getItem('cse_google_cx_id')
    return !!(g_api_key && g_cx_id);

}

async function gcseActive() {
    return isGoogleCseActive();
}


async function googleSearch(data) {
    let is_cse_active = await isGoogleCseActive();
    if (!is_cse_active) {
        let cse_opt = `<button class="more_opt_btn" onclick="moreOptions('cse')">查看选项</button>`;
        cse_opt = `<p>您需要激活 Google CSE 才能使用此功能！</p> <p>${cse_opt}</p>`;
        cse_opt += "<p>一旦启用，只需输入：<code><span class='hljs-meta'>s：问题</span></code> 或者 <code><span class='hljs-meta'>search: 或者</span></code> 在哪里 <span class='hljs-meta'>或者</span> 人工智能将根据网络结果回答这个问题吗.</p>";
        addWarning(cse_opt, false, 'dialog_warning');
       // toggleAnimation(true);
        toggleAiGenAnimation(false);
        enableChat();
        removeLastMessage();
        return false;
    }

    let term = data.term ?? '';
    if (!term) {
        addWarning('googleSearch() 没有收到搜索参数');
    }
    console.log('正在搜索: ' + term);
    let gs = new GoogleSearch();
    let results = await gs.search(term);
    let txt_result = '';
    if (results.items) {
        results.items.forEach(item => {
            txt_result += `\n- **标题**: ${item.title}\n- **片段**: ${item.snippet}\n\n`;
        })
    } else if (results.text || results.snippets) {
        txt_result += results.text;
        let snippets = '';
        let sp_id = 1;
        results.snippets.forEach(snpt => {
            snippets += `<p>${sp_id}: ${snpt}</p>`;
        })
        txt_result += " \n <b>片段</b>: "+snippets;
    } else {
        if (is_cse_active) {
            addWarning('Google 搜索未找到任何结果');
        }
        removeLastMessage();
       //toggleAnimation();
        toggleAiGenAnimation()
        enableChat();
        return false;
    }
    //  let last_input = conversations.messages[conversations.messages.length - 1].content;

    let last_input = last_user_input.replace(/^[a-z]+:(.*?)\s/i, " "); // remove cmd
    if (pre_function_text) {
        last_input = pre_function_text;
    }
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (ele) {
        let cnt = `${last_input} <details><summary>搜索结果 [${term}]: </summary>${txt_result}</details>`;
        ele.innerHTML = converter.makeHtml(cnt);
    }
    pre_function_text = '';

    conversations.messages[conversations.messages.length - 1].content = `用户提示: ${last_input} \n 根据此上下文做出回应: <details><summary>搜索结果 [${term}]: </summary>${txt_result}</details>`;
    if (chosen_platform === 'google') {
        await geminiChat()
        //toggleAnimation(true);
        toggleAiGenAnimation(false);
    } else {
        await streamChat(false); // false 以防止无限循环
        //toggleAnimation(true);
        toggleAiGenAnimation(false);

    }

}

function toolHandle(data) {
    if (chosen_platform === 'google') {
        try {
            let fn_name = data.name;
            let arguments = data.args;
            this[fn_name](arguments);
        } catch (error) {
            console.log(error)
        }
    } else if (chosen_platform === 'anthropic') {
        if (data.content?.[0]) {
            let fn_name = data.content[0].name;
            let arguments = data.content[0].input;
            this[fn_name](arguments);
        } else {
            addWarning('本来期待一个工具，但却没有得到。', false)
        }
    } else if (chosen_platform === 'cohere') {
        if (data.message?.tool_calls?.[0]?.function) {
            let fn_name = data.message.tool_calls[0]?.function.name
            let arguments = JSON.parse(data.message.tool_calls[0]?.function.arguments)
            this[fn_name](arguments);
        } else {
            addWarning('本来期待一个工具，但却没有得到。', false)
        }
    } else {
        if (data.choices?.[0]?.message?.tool_calls?.[0]?.function) {
            let tool = data.choices[0].message.tool_calls[0].function;
            let fn_name = tool.name;
            let arguments = JSON.parse(tool.arguments);
            this[fn_name](arguments);
        } else {
            addWarning(data, false);
        }
    }
}

let start_msg = document.querySelector(".start_msg");
let doc_title = document.title;
start_msg.onmouseover = () => {
    document.title = model + ' -> ' + chosen_platform;
    start_msg.title = document.title;
}
start_msg.onmouseleave = () => {
    document.title = doc_title;
    start_msg.removeAttribute('title');
}

chatButton.onmouseover = () => {
    document.title = '发送至 ' + model + ' -> ' + chosen_platform;
}

chatButton.onmouseleave = () => {
    document.title = doc_title;
}

function removeOnlineOfflineMessages() {
    let off_ele = document.querySelectorAll(".offline");
    off_ele.forEach(ele => {
        ele.remove();
    });

    let on_ele = document.querySelectorAll(".online");
    on_ele.forEach(ele => {
        ele.remove();
    })
}

window.addEventListener('online', () => {
    removeOnlineOfflineMessages();
    addWarning("您又上线了", false, 'online')
});

window.addEventListener('offline', () => {
    removeOnlineOfflineMessages();
    addWarning("您当前离线", false, 'offline')
});


function javascriptCodeExecution(obj) {
   //toggleAnimation(true);
    toggleAiGenAnimation(false);
    js_code = obj.code;
    js_code.replace(/\\n/g, "\n")
        .replace(/\\"/g, "'")
        .replace(/\\'/g, "'")
        .replace(/console\.log/g, "")
        .replace(/document\.write/, "")
        .replace("<script>", "")
        .replace("<script", "")
        .replace("</script>", "");
    original_code = obj.code;
    let msg = `AI想要执行以下代码： <div class="center"><button class="accept_code_execution" onclick="executeJsCode(js_code, original_code)">Accept</button></div> <pre class="exclude_btn_group"><code class="javascript language-javascript hljs">${obj.code}</code></pre>`;
    addWarning(msg, false)
    setTimeout(() => {
        hljs.highlightAll();
    }, 500)
}

async function executeJsCode(code, realCode = '') {
    js_code = ''; // reset
    original_code = '' // reset
    let response;
    try {
        // response = await eval(code)
        response = await jsCodeExecutionSandbox(code);
    } catch (error) {
        response = error;
    }
    if (realCode) {
        // 将显示的代码
        code = realCode;
    }
    let timer_jc = setInterval(() => {
        if (js_code_exec_finished) {
            clearInterval(timer_jc);
            chat_textarea.value = `Executing the following code: <pre><code class="javascript language-javascript hljs">${code}</code></pre>\nGot this output:  <span class="js_output">${js_code_exec_output}</span>`;
            document.querySelector("#send").click();
        }
    })
}


async function jsCodeExecutionSandbox(code) {
    js_code_exec_finished = false;
    js_code_exec_output = '';
    let old_iframe = document.querySelector("iframe#sandbox");
    if (old_iframe) {
        old_iframe.remove();
    }
    let results = '';
    const targetOrigin = window.location.origin;
    const iframe = document.createElement("iframe");
    iframe.id = 'sandbox';
    iframe.style.display = 'none';
    iframe.src = "sandbox.html";
    document.body.append(iframe)
    iframe.onload = () => {
        iframe.contentWindow.postMessage({code: code}, targetOrigin);
    };
    window.onmessage = (event) => {
        if (event.data) {
            console.log(event.data)
            let clog = event.data?.args?.[0] ?? false;
            if (clog !== false) {
                clog = stringifyComplexValue(clog)
                results += clog + '<br>';
            } else {
                results += stringifyComplexValue(event.data);
                if (event.data.type === undefined) {
                    js_code_exec_output = results;
                    js_code_exec_finished = true;
                }
            }
        } else {
            js_code_exec_output = results;
            js_code_exec_finished = true;
        }
    }
}

loadPlugins(); // 加载插件

function reloadPage() {
    // 此方法可由插件使用
    document.location.reload()
}


// 在流模式下，滚动可能会被阻塞，这应该可以释放滚动
function unlockScroll() {
    let chat_msg = document.querySelector("#chat-messages");
    if (chat_msg) {
        let last_position = chat_msg.scrollTop;
        //  chat_msg.addEventListener("keydown", (event) => {
        window.addEventListener("keydown", (event) => {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return; // 焦点在输入或文本区域
            }
            if (event.key === "ArrowDown") {
                if (chat_msg.scrollTop <= last_position) {
                    chat_msg.scrollTop += 30;
                }
                last_position = chat_msg.scrollTop;
            } else if (event.key === "ArrowUp") {
                if (chat_msg.scrollTop >= last_position) {
                    chat_msg.scrollTop -= 30;
                }
                last_position = chat_msg.scrollTop;
            }
        })
    }
}

unlockScroll();


function stringifyComplexValue(value, indent = 0) {
    const indentString = "  ".repeat(indent); // 缩进两个空格
    if (value === null) {
        return "null";
    } else if (typeof value === 'undefined') {
        return "undefined";
    } else if (typeof value !== 'object') { //处理非对象和非数组值
        return String(value); // 将非对象、非数组和空值转换为字符串
    } else if (Array.isArray(value)) {
        const elements = value.map(item => stringifyComplexValue(item, indent + 1));
        return `[\n${indentString}  ${elements.join(`,\n${indentString}  `)}\n${indentString}]`;
    } else { // Handle objects
        const properties = Object.entries(value)
            .map(([key, val]) => `${indentString}  "${key}": ${stringifyComplexValue(val, indent + 1)}`)
            .join(`,\n`);
        return `{\n${properties}\n${indentString}}`;
    }
}

function whatTimeIsIt() {
    const today = new Date();
    return today.toLocaleDateString('zh-CN') + " " + today.toLocaleTimeString('zh-CN');
    // 例如：2025/1/18 10:46:24
}

function extractVideoId(text) {
    let video_id = text.match(/youtube.com\/watch\?v=(.*)/)?.[1] ?? null;
    if (video_id) {
        return video_id.substring(0, 11);
    }
    return null;
}

function loadVideo() {
    let all_user_msgs = document.querySelectorAll(".user");
    if (all_user_msgs.length) {
        let last_user_msg_ele = all_user_msgs[all_user_msgs.length - 1];
        let last_user_msg = last_user_msg_ele.innerHTML;
        let videoId = extractVideoId(last_user_msg);
        if (!videoId) {
            return
        }
        let videoContainer = document.createElement("div");
        videoContainer.className = "video-container";
        const videoFrame = document.createElement("iframe");
        videoFrame.id = "videoFrame";
        videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
        videoContainer.append(videoFrame);
        last_user_msg_ele.prepend(videoContainer)

    }

}


function mediaFull() {
    const all_images = document.querySelectorAll(".user img");
    all_images.forEach(media => {
        media.onclick = () => {
            let newTab = window.open();
            newTab.document.body.innerHTML = `<img src="${media.src}" alt="Imagem Base64">`;
        };
    });
}

mediaFull();


function loadExtraModels() {
    let extra_models = localStorage.getItem("extra_models");
    extra_models = JSON.parse(extra_models);
    for (const provider in extra_models) {
        if (extra_models.hasOwnProperty(provider)) {
            extra_models[provider].forEach(model => {
                let has_model = PLATFORM_DATA[provider].models.includes(model);
                if (!has_model) {
                    PLATFORM_DATA[provider].models.push(model);
                }
            })
        }
    }
}

loadExtraModels();

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'q') {
        //关闭当前聊天并开始新的聊天
        newChat();
        e.preventDefault();
    } else if (!e.ctrlKey && !e.altKey && e.key) {
        let active_tagName = document.activeElement.tagName
        if (active_tagName !== 'INPUT' && active_tagName !== 'TEXTAREA') {
            if (/^[a-zA-Z0-9]$/.test(e.key)) {
                document.getElementById('ta_chat').focus();
            }
        }
    } else if (e.ctrlKey && e.key === 'Delete') {
        let div_topic = document.querySelector(`[data-id='${chat_id}']`);
        if (div_topic) {
            removeChat(div_topic, chat_id, true);
        }
    }

});

function loadUserAddedPrompts(){
    let u_prompt = localStorage.getItem('user_new_prompts');
    if(u_prompt){
       try {
           u_prompt = JSON.parse(u_prompt);
           u_prompt.forEach(new_prompt => {
               all_prompts.unshift(new_prompt)

           })
       }catch (e) {
           console.error(e)
       }
    }
}
loadUserAddedPrompts()


function deletePrompt(){
    let sl_prompt = document.querySelector("select[name=prompt]");
    let selectedOption = sl_prompt.options[sl_prompt.selectedIndex];
    if(selectedOption){
        let created_time = selectedOption.getAttribute('data-created_time');
        if(created_time){
            created_time = parseInt(created_time);
            let all_user_prompt = localStorage.getItem('user_new_prompts');
            if(all_user_prompt){
                all_user_prompt = JSON.parse(all_user_prompt);
                for (let i = 0; i < all_user_prompt.length; i++) {
                    if (all_user_prompt[i].created_time === created_time) {
                        all_user_prompt.splice(i, 1);
                        break;
                    }
                }
                localStorage.setItem('user_new_prompts', JSON.stringify(all_user_prompt));

                // 更新 all_prompts 删除已删除的提示
                for (let i = 0; i < all_prompts.length; i++) {
                    if (all_prompts[i].created_time === created_time) {
                        all_prompts.splice(i, 1);
                        break;
                    }
                }


                selectedOption.remove();
                console.log(selectedOption)
                document.querySelector("textarea.system_prompt").value = '';
                savePrompt();
            }

        }
    }

}

let new_url = document.URL;
new_url = new_url.split('?')[0];
new_url = new_url.split("#")[0];
new_url += "#" + chat_id;
history.pushState({url: new_url}, '', new_url);
