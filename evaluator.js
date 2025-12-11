(function() {
    'use strict';
    const d = document;
    const loc = d.location.href;
    const table = d.querySelector('table.rowFlow');

    if (!table) return alert('⚠️ يرجى تشغيل الأداة في صفحة "تقييم المقررات"');

    let courses = [];
    d.querySelectorAll('table.rowFlow tbody tr').forEach(r => {
        const a = r.querySelector('a[onmousedown*="setIndex"]');
        if (a) {
            const m = a.getAttribute('onmousedown').match(/\d+/);
            if (m) courses.push({ id: m[0], name: r.cells[1] ? r.cells[1].innerText : 'M' + m[0] });
        }
    });

    if (!courses.length) return alert('لا يوجد مواد متاحة');

    const css = `
        :root{--p:#3b82f6;--bg:#1e293b;--fg:#f1f5f9;--bd:#334155;--h:#2563eb}
        body{margin:0;overflow:hidden;font-family:system-ui,sans-serif;background:var(--bg);color:var(--fg)}
        #app{display:flex;height:100vh}
        #side{width:300px;background:#0f172a;border-left:1px solid var(--bd);display:flex;flex-direction:column;padding:15px;box-shadow:-5px 0 15px rgba(0,0,0,0.3);z-index:99}
        #main{flex:1;position:relative;background:#fff}
        iframe{width:100%;height:100%;border:none}
        h2{margin:0 0 10px;font-size:1.2rem;color:var(--p)}
        .info-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:0.85rem;color:#94a3b8}
        .list-wrap{flex:1;overflow-y:auto;border:1px solid var(--bd);border-radius:6px;background:rgba(255,255,255,0.03);margin-bottom:15px}
        .c-row{display:flex;align-items:center;padding:10px;border-bottom:1px solid var(--bd);cursor:pointer;transition:0.2s}
        .c-row:hover{background:rgba(255,255,255,0.05)}
        .c-row input{margin-left:10px;transform:scale(1.2);accent-color:var(--p)}
        .controls{display:flex;flex-direction:column;gap:10px}
        select, .btn{width:100%;padding:10px;border-radius:6px;border:none;font-weight:600}
        select{background:var(--bd);color:#fff;outline:none}
        .btn{background:var(--p);color:#fff;cursor:pointer;transition:0.2s}
        .btn:hover{background:var(--h)}
        .btn:disabled{background:#475569;cursor:not-allowed;opacity:0.7}
        #status{margin-top:10px;text-align:center;font-size:0.85rem;min-height:1.5em;color:#fbbf24}
        .close{position:absolute;top:10px;left:10px;background:#ef4444;color:#fff;border:none;border-radius:4px;width:30px;height:30px;font-size:1.2rem;cursor:pointer;z-index:100}
    `;

    const listHTML = courses.map(c => 
        `<label class="c-row"><input type="checkbox" class="chk" value="${c.id}" checked><span>${c.name}</span></label>`
    ).join('');

    d.body.innerHTML = `<style>${css}</style>
    <div id="app">
        <div id="main">
            <button class="close" onclick="location.reload()">×</button>
            <iframe id="frm" src="${loc}"></iframe>
        </div>
        <div id="side">
            <h2>المقيم الذكي</h2>
            <div class="info-bar">
                <label style="cursor:pointer"><input type="checkbox" id="sel-all" checked> تحديد الكل</label>
                <span id="count">0/${courses.length}</span>
            </div>
            <div class="list-wrap">${listHTML}</div>
            <div class="controls">
                <select id="rate">
                    <option value="0">موافق بشدة</option>
                    <option value="1" selected>موافق</option>
                    <option value="2">محايد</option>
                </select>
                <button id="go" class="btn">بدء التقييم 🚀</button>
            </div>
            <div id="status">جاهز...</div>
        </div>
    </div>`;

    const fr = d.getElementById('frm');
    const goBtn = d.getElementById('go');
    const stat = d.getElementById('status');
    const selAll = d.getElementById('sel-all');
    const countSpan = d.getElementById('count');
    const checks = d.querySelectorAll('.chk');
    
    let queue = [], active = false, retry = 0;

    const updateCount = () => {
        const n = d.querySelectorAll('.chk:checked').length;
        countSpan.innerText = `${n}/${courses.length}`;
        goBtn.innerText = `تقييم (${n}) مقرر`;
    };

    selAll.onchange = (e) => {
        checks.forEach(c => c.checked = e.target.checked);
        updateCount();
    };

    checks.forEach(c => c.onchange = updateCount);
    updateCount();

    goBtn.onclick = () => {
        queue = Array.from(d.querySelectorAll('.chk:checked')).map(c => c.value);
        if (!queue.length) return alert('يرجى اختيار مقرر واحد على الأقل');
        
        active = true;
        goBtn.disabled = true;
        d.getElementById('rate').disabled = true;
        selAll.disabled = true;
        checks.forEach(c => c.disabled = true);
        process();
    };

    const process = () => {
        if (!active) return;
        const timer = setInterval(() => {
            try {
                const doc = fr.contentDocument;
                if (!doc || doc.readyState !== 'complete') return;

                const success = doc.body.innerText.includes('تم حفظ الاستبيان') || doc.getElementById('frm:errorMsg2');
                const backBtn = doc.querySelector('a[id*="back"], a[class*="btn"]');
                const isBack = backBtn && (backBtn.innerText.includes('رجوع') || backBtn.innerText.includes('Back'));

                if (success && isBack) {
                    stat.innerText = '✅ تم الحفظ، عودة...';
                    stat.style.color = '#4ade80';
                    backBtn.click();
                    clearInterval(timer);
                    setTimeout(process, 800);
                    return;
                }

                if (doc.querySelector('table.rowFlow')) {
                    if (queue.length === 0) {
                        active = false;
                        stat.innerText = '🎉 انتهى التقييم!';
                        goBtn.innerText = 'تم الانتهاء';
                        alert('تم الانتهاء من جميع المواد المحددة');
                        clearInterval(timer);
                        return;
                    }

                    const cid = queue[0];
                    const link = doc.querySelector(`a[onmousedown*="setIndex(${cid})"]`);

                    if (link) {
                        stat.innerText = `⏳ جاري فتح المادة ${cid}...`;
                        stat.style.color = '#60a5fa';
                        const evt = d.createEvent('MouseEvents');
                        evt.initEvent('mousedown', true, true);
                        link.dispatchEvent(evt);
                        link.click();
                        queue.shift();
                        retry = 0;
                        clearInterval(timer);
                        setTimeout(process, 1000);
                    } else {
                        retry++;
                        if (retry > 10) { queue.shift(); retry = 0; }
                    }
                    return;
                }

                const radios = doc.querySelectorAll('input[type="radio"]');
                if (radios.length) {
                    stat.innerText = '✍️ تعبئة وحل الأسئلة...';
                    const rateVal = parseInt(d.getElementById('rate').value);
                    let traps = 0;

                    doc.querySelectorAll('table tbody tr').forEach(row => {
                        const rds = row.querySelectorAll('input[type="radio"]');
                        if (rds.length > 2) {
                            if (/ظلل|تأكد|Select|خيار/.test(row.innerText)) {
                                rds[rds.length - 1].checked = true;
                                traps++;
                            } else if (rds[rateVal]) {
                                rds[rateVal].checked = true;
                            }
                        }
                    });

                    doc.querySelectorAll('textarea').forEach(t => t.value = '.');
                    stat.innerText = `💾 جاري الحفظ (${traps} فخ)...`;
                    
                    const s = doc.createElement('script');
                    s.textContent = "typeof submitForm=='function'?submitForm('/qu'):document.forms[0].submit()";
                    doc.body.appendChild(s);
                    
                    clearInterval(timer);
                    setTimeout(process, 1500);
                }
            } catch (e) { console.error(e); }
        }, 500);
    };
})();
