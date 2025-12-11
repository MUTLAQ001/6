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
        :root{--p:#2563eb;--bg:#0f172a;--tx:#f1f5f9;--bd:#334155;--h:#3b82f6}
        body{margin:0;overflow:hidden;font-family:system-ui,'Segoe UI',sans-serif;background:var(--bg);color:var(--tx)}
        #app{display:flex;height:100vh;width:100vw;flex-direction:row;overflow:hidden}
        #frame-wrap{flex:1;position:relative;background:#fff;height:100%}
        iframe{width:100%;height:100%;border:none;display:block}
        #sidebar{width:320px;background:var(--bg);border-left:1px solid var(--bd);display:flex;flex-direction:column;padding:15px;box-shadow:-5px 0 20px rgba(0,0,0,0.4);z-index:999;direction:rtl}
        h2{margin:0 0 15px;font-size:1.3rem;color:var(--p);font-weight:800;text-align:center}
        .stats{display:flex;justify-content:space-between;font-size:0.85rem;color:#94a3b8;margin-bottom:10px;padding:0 5px}
        .scroll-area{flex:1;overflow-y:auto;border:1px solid var(--bd);border-radius:8px;background:rgba(0,0,0,0.2);margin-bottom:15px;padding:5px}
        .c-item{display:flex;align-items:center;padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:0.2s;font-size:0.9rem}
        .c-item:hover{background:rgba(255,255,255,0.05)}
        .c-item input{margin-left:10px;width:16px;height:16px;accent-color:var(--p);cursor:pointer}
        .actions{display:flex;flex-direction:column;gap:12px}
        select, .btn{width:100%;padding:12px;border-radius:8px;border:none;font-weight:700;font-family:inherit}
        select{background:#1e293b;color:#fff;border:1px solid var(--bd);outline:none}
        .btn{background:var(--p);color:#fff;cursor:pointer;transition:transform 0.1s, background 0.2s}
        .btn:hover{background:var(--h);transform:translateY(-1px)}
        .btn:disabled{background:#475569;cursor:wait;opacity:0.8;transform:none}
        #status{margin-top:15px;text-align:center;font-size:0.9rem;font-weight:600;min-height:1.2em;color:#fbbf24}
        .close-btn{position:absolute;top:15px;left:15px;background:#ef4444;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:1000;box-shadow:0 2px 10px rgba(239,68,68,0.4)}
        .close-btn:hover{background:#dc2626;transform:scale(1.1)}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#475569;border-radius:3px}
    `;

    const listItems = courses.map(c => 
        `<label class="c-item"><input type="checkbox" class="chk" value="${c.id}" checked><span>${c.name}</span></label>`
    ).join('');

    d.body.innerHTML = `<style>${css}</style>
    <div id="app">
        <div id="frame-wrap">
            <button class="close-btn" onclick="location.reload()" title="إغلاق">×</button>
            <iframe id="ifr" src="${loc}"></iframe>
        </div>
        <div id="sidebar">
            <h2>المقيم الآلي</h2>
            <div class="stats">
                <label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" id="all" checked style="margin-left:5px"> تحديد الكل</label>
                <span id="cnt">0/${courses.length}</span>
            </div>
            <div class="scroll-area">${listItems}</div>
            <div class="actions">
                <select id="rate">
                    <option value="0">موافق بشدة</option>
                    <option value="1" selected>موافق</option>
                    <option value="2">محايد</option>
                    <option value="3">غير موافق</option>
                </select>
                <button id="run" class="btn">بدء التقييم 🚀</button>
            </div>
            <div id="status">جاهز للعمل...</div>
            <div style="margin-top:auto;text-align:center;font-size:0.75rem;color:#555">Developed by MUTLAQ</div>
        </div>
    </div>`;

    const iframe = d.getElementById('ifr');
    const runBtn = d.getElementById('run');
    const status = d.getElementById('status');
    const chkAll = d.getElementById('all');
    const countDisplay = d.getElementById('cnt');
    const checks = d.querySelectorAll('.chk');
    const rateSel = d.getElementById('rate');
    
    let queue = [], active = false, retry = 0;

    const refreshCount = () => {
        const n = d.querySelectorAll('.chk:checked').length;
        countDisplay.innerText = `${n}/${courses.length}`;
        runBtn.innerText = n > 0 ? `تقييم (${n}) مواد` : 'اختر مواد';
        runBtn.disabled = n === 0;
    };

    chkAll.onchange = (e) => {
        checks.forEach(c => c.checked = e.target.checked);
        refreshCount();
    };

    checks.forEach(c => c.onchange = refreshCount);
    refreshCount();

    runBtn.onclick = () => {
        queue = Array.from(d.querySelectorAll('.chk:checked')).map(c => c.value);
        if (!queue.length) return;
        
        active = true;
        runBtn.disabled = true;
        chkAll.disabled = true;
        rateSel.disabled = true;
        checks.forEach(c => c.disabled = true);
        runBtn.innerText = 'جاري العمل...';
        
        startLoop();
    };

    const startLoop = () => {
        if (!active) return;
        const loop = setInterval(() => {
            try {
                const doc = iframe.contentDocument;
                if (!doc || doc.readyState !== 'complete') return;

                const msg = doc.getElementById('frm:errorMsg2');
                const btnBox = doc.querySelector('.commandBar'); 
                const backBtn = doc.querySelector('a[id*="back"], a[class*="btn"], input[value*="عودة"]');
                const isBack = backBtn && (backBtn.innerText.includes('رجوع') || backBtn.innerText.includes('Back') || backBtn.value?.includes('عودة'));

                if ((msg || doc.body.innerText.includes('تم حفظ')) && isBack) {
                    status.innerText = '🔙 تم الحفظ، العودة للقائمة...';
                    status.style.color = '#34d399';
                    backBtn.click();
                    clearInterval(loop);
                    setTimeout(startLoop, 800);
                    return;
                }

                if (doc.querySelector('table.rowFlow')) {
                    if (queue.length === 0) {
                        active = false;
                        status.innerText = '✅ تم الانتهاء بنجاح!';
                        status.style.color = '#4ade80';
                        runBtn.innerText = 'تمت المهمة';
                        alert('تم الانتهاء من جميع المواد المحددة.');
                        clearInterval(loop);
                        return;
                    }

                    const cid = queue[0];
                    const link = doc.querySelector(`a[onmousedown*="setIndex(${cid})"]`);

                    if (link) {
                        status.innerText = `⏳ جاري فتح المادة ${cid}...`;
                        status.style.color = '#60a5fa';
                        const evt = d.createEvent('MouseEvents');
                        evt.initEvent('mousedown', true, true);
                        link.dispatchEvent(evt);
                        link.click();
                        queue.shift();
                        retry = 0;
                        clearInterval(loop);
                        setTimeout(startLoop, 1000);
                    } else {
                        retry++;
                        if (retry > 10) { 
                            status.innerText = `⚠️ تخطي ${cid} (غير موجود)`;
                            queue.shift(); 
                            retry = 0; 
                        }
                    }
                    return;
                }

                const radios = doc.querySelectorAll('input[type="radio"]');
                if (radios.length) {
                    status.innerText = '📝 تعبئة الاستبيان...';
                    status.style.color = '#facc15';
                    const rating = parseInt(rateSel.value);
                    let traps = 0;

                    doc.querySelectorAll('table tbody tr').forEach(row => {
                        const rds = row.querySelectorAll('input[type="radio"]');
                        if (rds.length > 2) {
                            const txt = row.innerText;
                            if (/ظلل|تأكد|Select|خيار|Choose|Consistent/.test(txt)) {
                                rds[rds.length - 1].checked = true;
                                traps++;
                            } else if (rds[rating]) {
                                rds[rating].checked = true;
                            }
                        }
                    });

                    doc.querySelectorAll('textarea').forEach(t => t.value = '.');
                    status.innerText = `💾 جاري الحفظ (${traps} فخ)...`;
                    
                    const s = doc.createElement('script');
                    s.textContent = "if(typeof submitForm=='function'){submitForm('/qu')}else{document.forms[0].submit()}";
                    doc.body.appendChild(s);
                    
                    clearInterval(loop);
                    setTimeout(startLoop, 1500);
                }
            } catch (e) {
                console.error(e);
            }
        }, 500);
    };
})();
