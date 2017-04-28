require('../styles/redfin-api-panel.scss');
const moment = require('moment');
const checkIfJson = require('./json-viewer/check-if-json');
const highlightContent = require('./json-viewer/highlight-content');

let list, detail, filter, clearBtn, startBtn, stopBtn;

let recording = true,
    lastReq = 0,
    requests = [];

chrome.devtools.network.onRequestFinished.addListener(function(request) {
    request.getContent(function(content, encoding) {
        if (recording && content.indexOf('{}&&{') === 0) {
            let now = moment();
            if (now.valueOf() - lastReq > 5000) {
                let h = document.createElement('li');
                h.className = 'heading';
                h.innerText = now.format('LTS');
                list.appendChild(h);
            }
            lastReq = now.valueOf();

            let li = document.createElement('li'),
                data = {
                    url: request.request.url,
                    request: request.request,
                    response: request.response,
                    content,
                    encoding,
                };

            let parts = request.request.url.split('/'),
                host = parts[2],
                path = parts.slice(3).join('/');

            li.innerHTML = `<span class="main"><span class="method">${request.request.method}</span> ${path}</span><span class="host">${host}</span>`;
            li.setAttribute('data-request', requests.length);
            list.appendChild(li);

            requests.push(data);
        }
    });
});

window.addEventListener('load', function() {
    list = document.getElementById('request-list');
    detail = document.getElementById('request-detail');
    clearBtn = document.getElementById('clear-btn');
    startBtn = document.getElementById('start-btn');
    stopBtn = document.getElementById('stop-btn');
    filter = document.getElementById('filter');

    startBtn.style.display = 'none';

    clearBtn.addEventListener('click', function() {
        requests = [];
        list.innerHTML = '';
        detail.innerHTML = '';
    });

    startBtn.addEventListener('click', function() {
        recording = true;
        startBtn.style.display = 'none';
        stopBtn.style.display = '';
    });

    stopBtn.addEventListener('click', function() {
        recording = false;
        stopBtn.style.display = 'none';
        startBtn.style.display = '';
    });

    filter.addEventListener('change', function() {
        let items = list.querySelectorAll('li'), searchText = filter.value;

        for (let i = 0, len = items.length; i < len; i++) {
            let text = items[i].innerText;
            items[i].style.display = (searchText === '' || text.indexOf(searchText) > -1) ? 'block' :'none';
        }
    });

    list.addEventListener('click', function(e) {
        let li = e.target;
        while (li && li.nodeName !== 'LI') {
            li = li.parentNode;
        }

        if (li) {
            let oldLi = document.querySelector('li.selected');
            if (oldLi) {
                if (oldLi === li) return;
                oldLi.classList.remove('selected');
            }

            let idx = parseInt(li.getAttribute('data-request'));
            if (isFinite(idx) && requests[idx] && requests[idx].content) {
                li.classList.add('selected');
                detail.innerHTML = '';

                let oldCode = document.querySelector('.CodeMirror');
                if (oldCode) {
                    document.removeChild(oldCode);
                    oldCode = null;
                }

                let pre = document.createElement('pre');

                // This should also be pretty easy to implement at a later time...
                // req = requests[idx].request,
                // res = requests[idx].response,
                // reqHead = "// Request Headers:\n" + req.headers.map(l => `// ${l.name}: ${l.value}\n`) + "\n",
                // resHead = "";

                pre.innerText = requests[idx].content;
                detail.appendChild(pre);

                checkIfJson(pre => {
                    pre.hidden = true;
                    // pre.innerText = reqHead + resHead + pre.innerText;
                    highlightContent(pre, true, detail, {});
                }, pre);
            }
        }
    });
});
