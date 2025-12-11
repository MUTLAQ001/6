(function() {
    'use strict';
    const d = document;
    const loc = d.location.href;
    const table = d.querySelector('table.rowFlow');

    if (!table) return alert('⚠️ يرجى تشغيل الأداة في صفحة "تقييم المقررات" الرئيسية');

    let courses = [];
    d.querySelectorAll('table.rowFlow tbody tr').forEach(r => {
        const a = r.querySelector('a[onmousedown*="setIndex"]');
        if (a) {
            const m = a.getAttribute('onmousedown').match(/\d+/);
            if (m) courses.push({ id: m[0], name: r.cells[1] ? r.cells[1].innerText.trim() : 'M-' + m[0] });
        }
    });

    if (!courses.length) return alert('لا يوجد مواد متاحة حالياً');

    const css = `
        @import url("https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap");
        :root {
            --neon-on: #8b5cf6;
            --neon-bg: rgba(139, 92, 246, 0.15);
            --bg-panel: rgba(15, 23, 42, 0.95);
            --text-main: #fff;
        }
        body { margin: 0; overflow: hidden; background: #020617; font-family: "Tajawal", sans-serif; }
        #qm-app { display: flex; height: 100vh; width: 100vw; overflow: hidden; direction: rtl; }
        
        #qm-sidebar {
            width: 400px; min-width: 400px;
            background: var(--bg-panel);
            backdrop-filter: blur(10px);
            border-left: 1px solid rgba(255,255,255,0.05);
            display: flex; flex-direction: column;
            padding: 24px; box-sizing: border-box;
            box-shadow: -10px 0 50px rgba(0,0,0,0.8);
            z-index: 9999;
        }

        .qm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .qm-title { 
            margin: 0; font-size: 1.6rem; font-weight: 800;
            background: linear-gradient(90deg, #fff, #cbd5e1); 
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
        }

        .qm-list { 
            flex: 1; overflow-y: auto; padding: 5px; margin-bottom: 20px;
        }
        
        .qm-card {
            position: relative;
            display: flex; justify-content: space-between; align-items: center;
            padding: 14px 18px; margin-bottom: 10px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
        }

        .qm-card:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.06); }

        .qm-card.active {
            border-color: var(--neon-on);
            background: var(--neon-bg);
            box-shadow: 0 0 15px rgba(139, 92, 246, 0.4), inset 0 0 10px rgba(139, 92, 246, 0.1);
        }
        
        .qm-card span { font-size: 0.95rem; font-weight: 600; color: #cbd5e1; transition: 0.3s; }
        .qm-card.active span { color: #fff; text-shadow: 0 0 8px rgba(255,255,255,0.5); }

        .qm-check-icon { 
            width: 20px; height: 20px; border-radius: 50%; border: 2px solid #475569; 
            display: flex; align-items: center; justify-content: center;
            transition: 0.3s;
        }
        .qm-card.active .qm-check-icon {
            border-color: var(--neon-on); background: var(--neon-on); box-shadow: 0 0 10px var(--neon-on);
        }
        .qm-check-icon::after { content: '✓'; color: #fff; font-size: 12px; opacity: 0; transform: scale(0); transition: 0.2s; }
        .qm-card.active .qm-check-icon::after { opacity: 1; transform: scale(1); }

        .qm-controls { display: flex; flex-direction: column; gap: 12px; }
        select, input[type="text"] {
            width: 100%; padding: 14px; background: rgba(0,0,0,0.4); color: #fff; 
            border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; outline: none; 
            font-family: inherit; font-size: 0.9rem;
        }
        
        #qm-run {
            width: 100%; padding: 16px; border: none; border-radius: 12px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
            font-size: 1.1rem; font-weight: 700; cursor: pointer;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3); transition: 0.3s;
        }
        #qm-run:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5); }
        #qm-run:disabled { filter: grayscale(1); cursor: not-allowed; opacity: 0.5; transform: none; }

        #qm-status { margin-top: 15px; text-align: center; font-size: 0.9rem; font-weight: 600; color: #fbbf24; min-height: 20px; }
        .qm-close { background: transparent; border: 1px solid rgba(255,50,50,0.2); color: #ef4444; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
        .qm-close:hover { background: #ef4444; color: #fff; }
        
        iframe { width: 100%; height: 100%; border: none; background: #fff; }
        #qm-frame-box { flex: 1; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
    `;

    const itemsHTML = courses.map(c => `
        <div class="qm-card active" data-id="${c.id}">
            <span>${c.name}</span>
            <div class="qm-check-icon"></div>
        </div>
    `).join('');

    d.body.innerHTML = `
    <style>${css}</style>
    <div id="qm-app">
        <div id="qm-sidebar">
            <div class="qm-header">
                <h2 class="qm-title">المقيم الآلي V3</h2>
                <button class="qm-close" onclick="location.reload()">✕</button>
            </div>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:0.85rem;color:#94a3b8;font-weight:700">
                <span id="qm-toggle-all" style="cursor:pointer;color:#a5b4fc">تحديد/إلغاء الكل</span>
                <span id="qm-count">${courses.length} محدد</span>
            </div>

            <div class="qm-list" id="qm-list-container">${itemsHTML}</div>

            <div class="qm-controls">
                <select id="qm-rate">
                    <option value="0">موافق بشدة (ممتاز)</option>
                    <option value="1" selected>موافق (جيد جداً)</option>
                    <option value="2">محايد</option>
                </select>
                <input type="text" id="qm-comment" value="شكرا لكم" placeholder="التعليق...">
                <button id="qm-run">🚀 بدء التقييم</button>
            </div>

            <div id="qm-status">جاهز للبدء...</div>
        </div>
        <div id="qm-frame-box"><iframe id="qm-ifr" src="${loc}"></iframe></div>
    </div>`;

    const ifr = d.getElementById('qm-ifr');
    const btn = d.getElementById('qm-run');
    const st = d.getElementById('qm-status');
    const cnt = d.getElementById('qm-count');
    const toggleAll = d.getElementById('qm-toggle-all');
    const cards = d.querySelectorAll('.qm-card');
    const sel = d.getElementById('qm-rate');
    const txtComment = d.getElementById('qm-comment');
    
    let queue = [], active = false;

    const updateUI = () => {
        const n = d.querySelectorAll('.qm-card.active').length;
        cnt.innerText = `${n} محدد`;
        btn.innerText = n > 0 ? `بدء تقييم (${n})` : 'اختر مواد';
        btn.disabled = n === 0;
    };

    cards.forEach(c => {
        c.onclick = () => {
            if(active) return;
            c.classList.toggle('active');
            updateUI();
        };
    });

    toggleAll.onclick = () => {
        if(active) return;
        const allActive = d.querySelectorAll('.qm-card.active').length === cards.length;
        cards.forEach(c => allActive ? c.classList.remove('active') : c.classList.add('active'));
        updateUI();
    };

    btn.onclick = () => {
        queue = Array.from(d.querySelectorAll('.qm-card.active')).map(c => c.getAttribute('data-id'));
        if(!queue.length) return;
        
        active = true;
        btn.innerText = 'جاري العمل...';
        [btn, sel, txtComment].forEach(el => el.disabled = true);
        d.getElementById('qm-list-container').style.opacity = '0.5';
        d.getElementById('qm-list-container').style.pointerEvents = 'none';
        
        processQueue();
    };

    const processQueue = () => {
        if(!active) return;
        const timer = setInterval(() => {
            try {
                const doc = ifr.contentDocument;
                if(!doc || doc.readyState !== 'complete') return;

                const hasMsg = doc.getElementById('frm:errorMsg2');
                const successMsg = doc.body.innerText.includes('تم حفظ') || doc.body.innerText.includes('Saved');
                const backBtn = doc.querySelector('a[id*="back"], a[class*="btn"], input[value*="عودة"], input[value*="Back"]');

                if((hasMsg || successMsg) && backBtn) {
                    st.innerText = '🔙 تم الحفظ، عودة...';
                    st.style.color = '#4ade80';
                    backBtn.click();
                    clearInterval(timer);
                    setTimeout(processQueue, 800);
                    return;
                }

                if(doc.querySelector('table.rowFlow')) {
                    if(queue.length === 0) {
                        active = false;
                        st.innerText = '✅ تم الانتهاء!';
                        btn.innerText = 'انتهى 🎉';
                        btn.style.background = '#10b981';
                        alert('تم تقييم جميع المواد المحددة.');
                        clearInterval(timer);
                        return;
                    }

                    const cid = queue[0];
                    const link = doc.querySelector(`a[onmousedown*="setIndex(${cid})"]`);

                    if(link) {
                        st.innerText = `⏳ جاري فتح المادة...`;
                        st.style.color = '#a78bfa';
                        const evt = d.createEvent('MouseEvents');
                        evt.initEvent('mousedown', true, true);
                        link.dispatchEvent(evt);
                        link.click();
                        
                        const currentCard = d.querySelector(`.qm-card[data-id="${cid}"]`);
                        if(currentCard) {
                            currentCard.classList.remove('active');
                            currentCard.style.opacity = '0.3';
                        }

                        queue.shift();
                        clearInterval(timer);
                        setTimeout(processQueue, 1200);
                    }
                    return;
                }

                const radios = doc.querySelectorAll('input[type="radio"]');
                if(radios.length) {
                    st.innerText = '✍️ تعبئة الاستبيان...';
                    st.style.color = '#fbbf24';
                    const ratingVal = parseInt(sel.value);
                    const cVal = txtComment.value;

                    doc.querySelectorAll('table tbody tr').forEach(row => {
                        const rds = row.querySelectorAll('input[type="radio"]');
                        if(rds.length > 2) {
                            const txt = row.innerText.toLowerCase();
                            if((txt.includes('ظلل') || txt.includes('تأكد') || txt.includes('select') || txt.includes('disagree')) && 
                               (txt.includes('last') || txt.includes('الأخير') || txt.includes('strongly disagree'))) {
                                rds[rds.length - 1].checked = true;
                            } else if(rds[ratingVal]) {
                                rds[ratingVal].checked = true;
                            }
                        }
                    });

                    doc.querySelectorAll('textarea').forEach(t => t.value = cVal);
                    
                    st.innerText = '💾 جاري الحفظ...';
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
