require('../styles/redfin-api-panel.scss');
const checkIfJson = require('./json-viewer/check-if-json');
const highlightContent = require('./json-viewer/highlight-content');

let list, detail, requests = [];

chrome.devtools.network.onRequestFinished.addListener(function(request) {
    request.getContent(function(content, encoding) {
        if (content.indexOf('{}&&{') === 0) {
            let li = document.createElement('li'),
                data = {
                    url: request.request.url,
                    content,
                    encoding,
                };

            li.innerText = request.request.url;
            li.setAttribute('data-request', requests.length);
            list.appendChild(li);

            requests.push(data);
        }
    });
});

window.addEventListener('load', function() {
    list = document.getElementById('request-list');
    detail = document.getElementById('request-detail');

    list.addEventListener('click', function(e) {
        let li = e.target;
        while (li && li.nodeName !== 'LI') {
            li = li.parentNode;
        }

        if (li) {
            let idx = parseInt(li.getAttribute('data-request'));
            if (isFinite(idx) && requests[idx] && requests[idx].content) {
                detail.innerHTML = '';

                let oldCode = document.querySelector('.CodeMirror');
                if (oldCode) {
                    document.removeChild(oldCode);
                    oldCode = null;
                }

                let pre = document.createElement('pre');
                pre.innerText = requests[idx].content;
                detail.appendChild(pre);

                checkIfJson(pre => {
                    pre.hidden = true;
                    highlightContent(pre, true, detail);
                }, pre);
            }
        }
    });
});
