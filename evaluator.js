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
        @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@500;700&family=IBM+Plex+Sans+Arabic:wght@700&display=swap");
        :root {
            --primary: #3b82f6;
            --bg-dark: #1e293b;
            --bg-darker: #0f172a;
            --text: #f8fafc;
            --border: rgba(255,255,255,0.1);
        }
        body { margin: 0; overflow: hidden; background: var(--bg-darker); font-family: "Cairo", sans-serif; }
        #qm-app { 
            display: flex; height: 100vh; width: 100vw; overflow: hidden; 
            direction: rtl; 
        }
        
        #qm-sidebar {
            width: 420px; 
            min-width: 420px;
            background: var(--bg-dark);
            border-left: 1px solid var(--border);
            display: flex; flex-direction: column;
            padding: 24px; box-sizing: border-box;
            box-shadow: -5px 0 25px rgba(0,0,0,0.5);
            z-index: 10000;
        }

        #qm-frame-box { flex: 1; position: relative; background: #fff; }
        iframe { width: 100%; height: 100%; border: none; }

        @media (max-width: 768px) {
            #qm-app { flex-direction: column-reverse; }
            #qm-sidebar { 
                width: 100%; min-width: 100%; height: 60vh; 
                border-left: none; border-top: 1px solid var(--border);
                border-radius: 24px 24px 0 0;
            }
        }

        .qm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .qm-title { 
            margin: 0; font-family: "IBM Plex Sans Arabic"; font-size: 1.6rem; 
            background: linear-gradient(90deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
        }
        .qm-close {
            background: rgba(255,255,255,0.05); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);
            width: 36px; height: 36px; border-radius: 10px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; font-size: 1.4rem; transition: 0.2s;
            padding: 0; margin: 0; line-height: 1;
        }
        .qm-close:hover { background: #ef4444; color: #fff; }

        .qm-stats { display: flex; justify-content: space-between; font-size: 0.9rem; color: #94a3b8; margin-bottom: 12px; font-weight: 700; }
        .qm-list { 
            flex: 1; overflow-y: auto; background: rgba(0,0,0,0.2); 
            border: 1px solid var(--border); border-radius: 16px; padding: 8px; margin-bottom: 20px;
        }
        .qm-item {
            display: flex; align-items: center; padding: 12px; margin-bottom: 6px;
            background: rgba(255,255,255,0.03); border-radius: 10px; cursor: pointer; transition: 0.2s;
            color: var(--text); user-select: none;
        }
        .qm-item:hover { background: rgba(255,255,255,0.08); transform: translateX(-3px); }
        .qm-item input { margin-left: 12px; accent-color: var(--primary); width: 18px; height: 18px; cursor: pointer; }
        .qm-item span { font-size: 0.95rem; font-weight: 600; }

        .qm-controls { display: flex; flex-direction: column; gap: 12px; }
        select {
            width: 100%; padding: 14px; background: rgba(0,0,0,0.3); color: #fff; 
            border: 1px solid var(--border); border-radius: 12px; outline: none; 
            font-family: inherit; font-size: 1rem; cursor: pointer;
        }
        select option { background: #1e293b; color: #fff; padding: 10px; }
        
        #qm-run {
            width: 100%; padding: 16px; border: none; border-radius: 99px;
            background: linear-gradient(90deg, #2563eb, #4f46e5); color: #fff;
            font-family: "IBM Plex Sans Arabic"; font-size: 1.1rem; font-weight: 700;
            cursor: pointer; box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4); transition: 0.3s;
        }
        #qm-run:hover { transform: translateY(-2px); filter: brightness(1.1); }
        #qm-run:disabled { background: #334155; color: #94a3b8; transform: none; box-shadow: none; cursor: not-allowed; }

        #qm-status { margin-top: 20px; text-align: center; font-size: 0.95rem; font-weight: 600; color: #fbbf24; min-height: 20px; }
        .qm-footer { margin-top: auto; text-align: center; font-size: 0.8rem; color: #64748b; padding-top: 15px; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
    `;

    const itemsHTML = courses.map(c => 
        `<label class="qm-item"><input type="checkbox" class="chk" value="${c.id}" checked><span>${c.name}</span></label>`
    ).join('');

    d.body.innerHTML = `<style>${css}</style>
    <div id="qm-app">
        <div id="qm-sidebar">
            <div class="qm-header">
                <h2 class="qm-title">المقيم الآلي</h2>
                <button class="qm-close" onclick="location.reload()" title="إغلاق">×</button>
            </div>
            
            <div class="qm-stats">
                <label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" id="qm-all" checked style="margin-left:8px"> تحديد الكل</label>
                <span id="qm-count">${courses.length}/${courses.length}</span>
            </div>

            <div class="qm-list">${itemsHTML}</div>

            <div class="qm-controls">
                <select id="qm-rate">
                    <option value="0">موافق بشدة (Strongly Agree)</option>
                    <option value="1" selected>موافق (Agree)</option>
                    <option value="2">محايد (Neutral)</option>
                    <option value="3">غير موافق (Disagree)</option>
                    <option value="4">غير موافق بشدة (Strongly Disagree)</option>
                </select>
                <button id="qm-run">بدء التقييم 🚀</button>
            </div>

            <div id="qm-status">جاهز للبدء...</div>
            <div class="qm-footer">Developed by MUTLAQ</div>
        </div>
        <div id="qm-frame-box"><iframe id="qm-ifr" src="${loc}"></iframe></div>
    </div>`;

    const ifr = d.getElementById('qm-ifr');
    const btn = d.getElementById('qm-run');
    const st = d.getElementById('qm-status');
    const all = d.getElementById('qm-all');
    const cnt = d.getElementById('qm-count');
    const chks = d.querySelectorAll('.chk');
    const sel = d.getElementById('qm-rate');
    
    let queue = [], active = false, retries = 0;

    const updateUI = () => {
        const n = d.querySelectorAll('.chk:checked').length;
        cnt.innerText = `${n}/${courses.length}`;
        btn.innerText = n > 0 ? `بدء تقييم (${n}) مواد` : 'يرجى اختيار مواد';
        btn.disabled = n === 0;
    };

    all.onchange = (e) => { chks.forEach(c => c.checked = e.target.checked); updateUI(); };
    chks.forEach(c => c.onchange = updateUI);
    updateUI();

    btn.onclick = () => {
        queue = Array.from(d.querySelectorAll('.chk:checked')).map(c => c.value);
        if(!queue.length) return;
        
        active = true;
        [btn, all, sel, ...chks].forEach(el => el.disabled = true);
        btn.innerText = 'جاري المعالجة...';
        processQueue();
    };

    const processQueue = () => {
        if(!active) return;
        const timer = setInterval(() => {
            try {
                const doc = ifr.contentDocument;
                if(!doc || doc.readyState !== 'complete') return;

                const hasMsg = doc.getElementById('frm:errorMsg2');
                const backBtn = doc.querySelector('a[id*="back"], a[class*="btn"], input[value*="عودة"]');
                const isBacking = backBtn && (backBtn.innerText.includes('رجوع') || backBtn.innerText.includes('Back') || backBtn.value?.includes('عودة'));

                if((hasMsg || doc.body.innerText.includes('تم حفظ')) && isBacking) {
                    st.innerText = '🔙 تم الحفظ، جاري العودة...';
                    st.style.color = '#4ade80';
                    backBtn.click();
                    clearInterval(timer);
                    setTimeout(processQueue, 800);
                    return;
                }

                if(doc.querySelector('table.rowFlow')) {
                    if(queue.length === 0) {
                        active = false;
                        st.innerText = '✅ تم الانتهاء بنجاح!';
                        btn.innerText = 'تمت المهمة 🎉';
                        btn.style.background = '#10b981';
                        alert('تم الانتهاء من جميع المواد المحددة.');
                        clearInterval(timer);
                        return;
                    }

                    const cid = queue[0];
                    const link = doc.querySelector(`a[onmousedown*="setIndex(${cid})"]`);

                    if(link) {
                        st.innerText = `⏳ جاري فتح المادة ${cid}...`;
                        st.style.color = '#60a5fa';
                        const evt = d.createEvent('MouseEvents');
                        evt.initEvent('mousedown', true, true);
                        link.dispatchEvent(evt);
                        link.click();
                        queue.shift();
                        retries = 0;
                        clearInterval(timer);
                        setTimeout(processQueue, 1000);
                    } else {
                        retries++;
                        if(retries > 10) { queue.shift(); retries = 0; }
                    }
                    return;
                }

                const radios = doc.querySelectorAll('input[type="radio"]');
                if(radios.length) {
                    st.innerText = '✍️ تعبئة الاستبيان...';
                    st.style.color = '#fbbf24';
                    const ratingVal = parseInt(sel.value);
                    let traps = 0;

                    doc.querySelectorAll('table tbody tr').forEach(row => {
                        const rds = row.querySelectorAll('input[type="radio"]');
                        if(rds.length > 2) {
                            if(/ظلل|تأكد|Select|خيار|Choose|Consistent/.test(row.innerText)) {
                                rds[rds.length - 1].checked = true;
                                traps++;
                            } else if(rds[ratingVal]) {
                                rds[ratingVal].checked = true;
                            }
                        }
                    });

                    doc.querySelectorAll('textarea').forEach(t => t.value = '.');
                    st.innerText = `💾 جاري الحفظ (${traps} فخ)...`;
                    
                    const script = doc.createElement('script');
                    script.textContent = "if(typeof submitForm=='function'){submitForm('/qu')}else{document.forms[0].submit()}";
                    doc.body.appendChild(script);
                    
                    clearInterval(timer);
                    setTimeout(processQueue, 1500);
                }
            } catch(e) {}
        }, 500);
    };
})();
