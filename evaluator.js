(function() {
    'use strict';
    const d = document;
    const loc = d.location.href;
    const table = d.querySelector('table.rowFlow');
    if (!table) return alert('⚠️ يرجى تشغيل الأداة في صفحة "تقييم المقررات"');

    let courses = [], selectedIdx = 1;
    
    d.querySelectorAll('table.rowFlow tbody tr').forEach(r => {
        const a = r.querySelector('a[onmousedown*="setIndex"]');
        if (a) {
            const m = a.getAttribute('onmousedown').match(/\d+/);
            if (m) courses.push({ id: m[0], name: r.cells[1] ? r.cells[1].innerText : 'M' + m[0], link: a });
        }
    });

    if (courses.length === 0) return alert('لا يوجد مواد متاحة للتقييم');

    const css = `
        :root{--p:#5e9cff;--b:#0a0a0a;--c:#141416;--t:#e0e0e0}
        body{margin:0;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;background:var(--b);color:var(--t)}
        #app{position:fixed;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;z-index:9999}
        #ui{background:var(--c);padding:1rem;border-bottom:1px solid #333;display:flex;gap:1rem;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,0.5)}
        #frame-wrap{flex:1;position:relative}
        iframe{width:100%;height:100%;border:none;background:#fff}
        .btn{background:var(--p);color:#fff;border:none;padding:0.5rem 1.5rem;border-radius:6px;font-weight:700;cursor:pointer;transition:opacity 0.2s}
        .btn:hover{opacity:0.9}.btn:disabled{background:#444;cursor:wait}
        select{background:#333;color:#fff;border:1px solid #555;padding:0.5rem;border-radius:6px;outline:none}
        .stat{font-size:0.9rem;font-weight:600}
        .close{background:transparent;color:#f55;font-size:1.5rem;padding:0 0.5rem}
    `;

    d.body.innerHTML = `<style>${css}</style>
    <div id="app">
        <div id="ui">
            <div style="display:flex;align-items:center;gap:10px">
                <button class="close" onclick="location.reload()">×</button>
                <h3>المقيم الآلي</h3>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
                <select id="rate-val">
                    <option value="0">موافق بشدة</option>
                    <option value="1" selected>موافق</option>
                    <option value="2">محايد</option>
                    <option value="3">غير موافق</option>
                    <option value="4">غير موافق بشدة</option>
                </select>
                <button id="run-btn" class="btn">بدء التقييم (${courses.length})</button>
            </div>
            <div id="status" class="stat">جاهز</div>
        </div>
        <div id="frame-wrap"><iframe id="main-fr" src="${loc}"></iframe></div>
    </div>`;

    const fr = d.getElementById('main-fr');
    const btn = d.getElementById('run-btn');
    const stat = d.getElementById('status');
    const sel = d.getElementById('rate-val');
    
    let queue = [], active = false, retry = 0;

    sel.onchange = () => selectedIdx = parseInt(sel.value);

    btn.onclick = () => {
        queue = courses.map(c => c.id);
        if (!queue.length) return;
        active = true;
        btn.disabled = true;
        sel.disabled = true;
        btn.innerText = 'جاري العمل...';
        process();
    };

    const log = (m, c = '#e0e0e0') => { stat.innerText = m; stat.style.color = c; };

    const injectSub = (doc) => {
        const s = doc.createElement('script');
        s.textContent = "typeof submitForm=='function'?submitForm('/qu'):document.forms[0].submit()";
        doc.body.appendChild(s);
    };

    const process = () => {
        if (!active) return;
        
        const timer = setInterval(() => {
            try {
                const fd = fr.contentDocument;
                if (!fd || fd.readyState !== 'complete') return;

                const hasErr = fd.getElementById('frm:errorMsg2');
                const links = Array.from(fd.querySelectorAll('a'));
                const backBtn = fd.getElementById('frm:back3') || fd.getElementById('frm:back2') || links.find(a => /رجوع|عودة|Back/i.test(a.innerText));
                
                if (hasErr || backBtn) {
                    if (backBtn && fd.body.innerText.includes('تم')) {
                        log('🔙 تم الحفظ، عودة...', '#4caf50');
                        backBtn.click();
                        clearInterval(timer);
                        setTimeout(process, 800);
                        return;
                    }
                }

                if (fd.querySelector('table.rowFlow')) {
                    if (queue.length === 0) {
                        active = false;
                        log('✅ انتهى الكل!', '#0f0');
                        btn.innerText = 'تم الانتهاء';
                        alert('تم الانتهاء بنجاح');
                        location.reload();
                        clearInterval(timer);
                        return;
                    }

                    const curID = queue[0];
                    const link = fd.querySelector(`a[onmousedown*="setIndex(${curID})"]`);
                    
                    if (link) {
                        log(`⏳ جاري فتح ${curID} (باقي ${queue.length})...`, '#5e9cff');
                        const ev = d.createEvent('MouseEvents');
                        ev.initEvent('mousedown', true, true);
                        link.dispatchEvent(ev);
                        link.click();
                        queue.shift();
                        retry = 0;
                        clearInterval(timer);
                        setTimeout(process, 1000); 
                    } else {
                        retry++;
                        if (retry > 10) { 
                            queue.shift(); 
                            retry = 0; 
                        }
                    }
                    return;
                }

                const radios = fd.querySelectorAll('input[type="radio"]');
                if (radios.length) {
                    log('📝 تعبئة النموذج وحل الفخاخ...', '#ffb74d');
                    const rows = fd.querySelectorAll('table tbody tr');
                    let trickCount = 0;
                    
                    for (const r of rows) {
                        const rads = r.querySelectorAll('input[type="radio"]');
                        if (rads.length > 2) {
                            if (/ظلل|تأكد|Select|خيار/.test(r.innerText)) {
                                rads[rads.length - 1].checked = true;
                                trickCount++;
                            } else if (rads[selectedIdx]) {
                                rads[selectedIdx].checked = true;
                            }
                        }
                    }
                    
                    fd.querySelectorAll('textarea').forEach(t => t.value = '.');
                    log(`💾 حفظ (${trickCount} فخ)...`, '#2196f3');
                    injectSub(fd);
                    clearInterval(timer);
                    setTimeout(process, 1500);
                }

            } catch (e) {
                console.error(e);
            }
        }, 400);
    };
})();
