// Text-to-Speech 和 ElevenLabs
let voice_id  = "pFZP5JQG7iQjIQuC4Bku"; // Lily - ElevenLabs voice_id
// 更多声音在这里: https://elevenlabs.io/docs/product/voices/default-voices
let elabs_api_key = localStorage.getItem("elabs_api_key");
let audio_in_queue = false;
let pause_svg_btn = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9.5 8.5C8.94772 8.5 8.5 8.94772 8.5 9.5V14.5C8.5 15.0523 8.94772 15.5 9.5 15.5H14.5C15.0523 15.5 15.5 15.0523 15.5 14.5V9.5C15.5 8.94772 15.0523 8.5 14.5 8.5H9.5Z" fill="currentColor"></path></svg>`;

let play_svg_btn = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor">
                          </path></svg>`;

function genAudio(text, div){
    let already_generated = false;
    let audio_elem = document.createElement('audio'); // 清理旧音频
    let audio_button_ele = document.createElement('button');
    audio_button_ele.className = 'play_audio_btn';
    audio_button_ele.innerHTML = `<span>${play_svg_btn}</span>`;
    audio_button_ele.setAttribute('aria-label','大声朗读');

    if(audio_in_queue){
        console.warn('队列中有音频');
        return false;
    }
    let audio_feature_enabled = localStorage.getItem('audio_feature');
    if(audio_feature_enabled !== '1'){
        return false;
    }
    div.append(audio_button_ele);
    if(!elabs_api_key){
        console.error('ElevenLabs 没有定义 API 密钥')
        return false;
    }
    audio_button_ele.onclick = ()=>{
        if(already_generated){
            if(audio_elem.paused){
                audio_elem.play();
                audio_button_ele.innerHTML = `<span>${pause_svg_btn}</span>`;
            }else {
                audio_elem.pause();
                audio_button_ele.innerHTML = `<span>${play_svg_btn}</span>`;
            }
            return false;
        }
        already_generated = true;
        const fields = {
            text: text,
           // model_id: "eleven_multilingual_v2",
            model_id: "eleven_flash_v2_5",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        };
        let endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
        audio_in_queue = true;
        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": `${elabs_api_key}`
            },
            body: JSON.stringify(fields)
        })
            .then(response => {
                if (!response.ok) {
                    showError(response)
                    throw new Error(response.status.toString());
                }
                return response.arrayBuffer();
            })
            .then(audioData => {
                const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audio_elem = new Audio(audioUrl);
                audio_elem.className = 'eleven_audio';
                //audio.controls = true;
                ///div.append(audio);
                audio_elem.play().finally(()=>{
                    audio_in_queue = false;
                });
                audio_button_ele.innerHTML = `<span>${pause_svg_btn}</span>`;
                audio_elem.addEventListener('ended', () => {
                    audio_button_ele.innerHTML = `<span>${play_svg_btn}</span>`;
                });

                audio_elem.addEventListener('pause', () => {
                    audio_button_ele.innerHTML = `<span>${play_svg_btn}</span>`;
                });

                audio_elem.addEventListener('play', () => {
                    audio_button_ele.innerHTML = `<span>${pause_svg_btn}</span>`;
                });

            })
            .catch(error => {
                already_generated = false;
                audio_in_queue = false;
                addWarning('无法生成音频。'+error,true);
            });
    }
}

function showError(response){
    response.json().then(data=>{
        addWarning(data);
    })
}