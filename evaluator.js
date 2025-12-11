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
        :root{--p:#2563eb;--bg:#0f172a;--tx:#f8fafc;--bd:#334155;--h:#3b82f6;--err:#ef4444}
        body{margin:0;overflow:hidden;font-family:system-ui,'Segoe UI',sans-serif;background:var(--bg);color:var(--tx)}
        #app{display:flex;height:100vh;width:100vw;overflow:hidden}
        #frame-wrap{flex:1;position:relative;background:#fff}
        iframe{width:100%;height:100%;border:none;display:block}
        #sidebar{width:320px;min-width:320px;background:var(--bg);border-left:1px solid var(--bd);display:flex;flex-direction:column;padding:16px;box-shadow:-4px 0 24px rgba(0,0,0,0.4);z-index:9999;direction:rtl}
        .header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--bd)}
        h2{margin:0;font-size:1.25rem;color:var(--p);font-weight:800}
        .close-btn{background:rgba(255,255,255,0.05);color:var(--err);border:1px solid var(--bd);border-radius:8px;width:32px;height:32px;font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.2s;line-height:0}
        .close-btn:hover{background:var(--err);color:#fff;border-color:var(--err)}
        .stats{display:flex;justify-content:space-between;font-size:0.85rem;color:#94a3b8;margin-bottom:10px}
        .scroll-area{flex:1;overflow-y:auto;border:1px solid var(--bd);border-radius:8px;background:rgba(0,0,0,0.2);margin-bottom:16px;padding:4px}
        .c-item{display:flex;align-items:center;padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:0.2s;font-size:0.9rem}
        .c-item:hover{background:rgba(255,255,255,0.05)}
        .c-item input{margin-left:10px;width:16px;height:16px;accent-color:var(--p)}
        .actions{display:flex;flex-direction:column;gap:10px}
        select, .btn{width:100%;padding:12px;border-radius:8px;border:none;font-weight:700;font-family:inherit;font-size:0.95rem}
        select{background:#1e293b;color:#fff;border:1px solid var(--bd);outline:none}
        .btn{background:var(--p);color:#fff;cursor:pointer;transition:0.2s}
        .btn:hover{background:var(--h);transform:translateY(-1px)}
        .btn:disabled{background:#475569;cursor:wait;opacity:0.8;transform:none}
        #status{margin-top:16px;text-align:center;font-size:0.9rem;font-weight:600;min-height:1.2em;color:#fbbf24}
        .footer{margin-top:auto;text-align:center;font-size:0.75rem;color:#475569;padding-top:10px}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#475569;border-radius:3px}
    `;

    const listItems = courses.map(c => 
        `<label class="c-item"><input type="checkbox" class="chk" value="${c.id}" checked><span>${c.name}</span></label>`
    ).join('');

    d.body.innerHTML = `<style>${css}</style>
    <div id="app">
        <div id="frame-wrap"><iframe id="ifr" src="${loc}"></iframe></div>
        <div id="sidebar">
            <div class="header-row">
                <h2>المقيم الآلي</h2>
                <button class="close-btn" onclick="location.reload()" title="إغلاق">×</button>
            </div>
            <div class="stats">
                <label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" id="all" checked style="margin-left:6px"> تحديد الكل</label>
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
            <div id="status">جاهز...</div>
            <div class="footer">Developed by MUTLAQ</div>
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
        runBtn.innerText = n > 0 ? `تقييم (${n})` : 'اختر مواد';
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
                const backBtn = doc.querySelector('a[id*="back"], a[class*="btn"], input[value*="عودة"]');
                const isBack = backBtn && (backBtn.innerText.includes('رجوع') || backBtn.innerText.includes('Back') || backBtn.value?.includes('عودة'));

                if ((msg || doc.body.innerText.includes('تم حفظ')) && isBack) {
                    status.innerText = '🔙 تم الحفظ، عودة...';
                    status.style.color = '#34d399';
                    backBtn.click();
                    clearInterval(loop);
                    setTimeout(startLoop, 800);
                    return;
                }

                if (doc.querySelector('table.rowFlow')) {
                    if (queue.length === 0) {
                        active = false;
                        status.innerText = '✅ تم الانتهاء!';
                        status.style.color = '#4ade80';
                        runBtn.innerText = 'تمت المهمة';
                        alert('تم الانتهاء بنجاح');
                        clearInterval(loop);
                        return;
                    }

                    const cid = queue[0];
                    const link = doc.querySelector(`a[onmousedown*="setIndex(${cid})"]`);

                    if (link) {
                        status.innerText = `⏳ جاري فتح ${cid}...`;
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
                        if (retry > 10) { queue.shift(); retry = 0; }
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
                            if (/ظلل|تأكد|Select|خيار|Choose/.test(row.innerText)) {
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
            } catch (e) { console.error(e); }
        }, 500);
    };
})();
