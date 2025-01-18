class GoogleSearch {
    constructor() {
        this.search_results = {};
    }

    /**
     * 除非设置了 rag_endpoint，否则搜索将只返回来自 Google 结果的标题和摘要。
     * **/
    async search(term, max_results = 10, start = 0) {
        let use_rag_endpoint = localStorage.getItem('use_rag_endpoint');
        if(use_rag_endpoint == null){
            ragEndpointDialog();
            toggleAiGenAnimation(false)
            removeLastMessage();
            enableChat();
            return false;
        }
        if (use_rag_endpoint === 'yes') {
            // 高级搜索
            return this.advancedSearch(term, 5);
        }
        let cse_active = await gcseActive();
        if (!cse_active) {
            addWarning('Google 自定义搜索未激活！')
            return false;
        }

        let GOOGLE_SEARCH_API_KEY = localStorage.getItem('cse_google_api_key')
        let GOOGLE_SEARCH_CX = localStorage.getItem('cse_google_cx_id')

        if (max_results > 10) {
            throw new Error('每页最多 10 条结果.');
        }
        if (start > 91) {
            throw new Error('无法列出超过 100 个结果，起始 = 91 是最大可能');
        }

        const encodedTerm = encodeURIComponent(term);
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_CX}&q=${encodedTerm}&num=${max_results}&start=${start}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) {
                addWarning('Google CSE -> 错误详情：' + JSON.stringify(data));
                console.error('Google CSE -> 错误详情：', data.error);
            }
            return this.search_results = data || {};
        } catch (error) {
            throw new Error(`Fetch Error: ${error.message}`);
        }
    }


    async advancedSearch(term, max_results = 5) {
        let is_cse_active = await gcseActive();
        if (!is_cse_active) {
            moreOptions('cse')
            addWarning('请设置 Google CSE API 密钥和 CX ID');
            toggleAiGenAnimation(false)
            enableChat();
            removeLastMessage();
            return false;
        }

        let GOOGLE_SEARCH_API_KEY = localStorage.getItem('cse_google_api_key')
        let GOOGLE_SEARCH_CX = localStorage.getItem('cse_google_cx_id')

        if (max_results > 10) {
            max_results = 10;
        }

        let rag_endpoint = localStorage.getItem("rag_endpoint");
        if (!rag_endpoint) {
            addWarning("未找到 [rag_endpoint]！");
            return false;
        }


        let lang = navigator.language.split("-")[0];
        let body_data = {
            query: term,
            //GOOGLE_SEARCH_API_KEY: GOOGLE_SEARCH_API_KEY,
            //GOOGLE_SEARCH_CX: GOOGLE_SEARCH_CX,
            max_results: max_results,
            language: lang
        };

        try {
            const response = await fetch(rag_endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(body_data)
            });
            const data = await response.json();
            if (data.error) {
                addWarning('高级搜索错误： ' + JSON.stringify(data));
                console.error('高级搜索错误：', data.error);
            }
            return this.search_results = data || {};
        } catch (error) {
            throw new Error(`Fetch Error: ${error.message}`);
        }
    }


}