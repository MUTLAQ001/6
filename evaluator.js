(function() {
    'use strict';
    const d = document;
    const loc = d.location.href;
    const table = d.querySelector('table.rowFlow');

    const log = (msg, type = 'info') => {
        const colors = { info: '#5e9cff', success: '#00c853', warning: '#ffc400', error: '#ff5252' };
        console.log(`%c[المقيم الآلي] ${msg}`, `color: ${colors[type]}; font-weight: bold;`);
    };

    if (!table) {
        alert('⚠️ يرجى تشغيل الأداة في صفحة "تقييم المقررات"');
        return log('الصفحة غير صحيحة', 'error');
    }

    let courses = [];
    d.querySelectorAll('table.rowFlow tbody tr').forEach(r => {
        const a = r.querySelector('a[onmousedown*="setIndex"]');
        if (a) {
            const m = a.getAttribute('onmousedown').match(/\d+/);
            if (m) {
                const courseName = r.cells[1] ? r.cells[1].innerText.trim() : 'مقرر ' + m[0];
                courses.push({ id: m[0], name: courseName });
                log(`تم العثور على مقرر: ${courseName} (${m[0]})`, 'info');
            }
        }
    });

    if (!courses.length) {
        alert('لا يوجد مواد متاحة للتقييم');
        return log('لم يتم العثور على مقررات', 'error');
    }

    log(`تم تحميل ${courses.length} مقرر`, 'success');

    const css = `
        @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@700&display=swap");
        :root {
            --primary: #5e9cff;
            --primary-dark: #4b7dcc;
            --primary-glow: rgba(94, 156, 255, 0.5);
            --bg: #0a0a0a;
            --card: rgba(20, 20, 22, 0.85);
            --border: rgba(255, 255, 255, 0.1);
            --text: #e0e0e0;
            --text-muted: #999;
            --radius: 16px;
            --anim: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        
        body { margin: 0; overflow: hidden; background: var(--bg); font-family: 'Cairo', sans-serif; color: var(--text); }
        
        #qm-root { 
            display: flex; height: 100vh; width: 100vw; overflow: hidden; 
            direction: rtl; opacity: 0; animation: fadeIn 0.5s var(--anim) forwards;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(94, 156, 255, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(94, 156, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(94, 156, 255, 0); } }

        #qm-sidebar {
            width: 400px; min-width: 400px;
            background: var(--card);
            border-left: 1px solid var(--border);
            display: flex; flex-direction: column;
            padding: 24px; box-sizing: border-box;
            box-shadow: -10px 0 40px rgba(0,0,0,0.5);
            z-index: 1000; backdrop-filter: blur(20px);
            position: relative;
        }

        #qm-frame-box { flex: 1; position: relative; background: #fff; border-radius: 24px 0 0 24px; overflow: hidden; margin: 10px 0 10px 10px; }
        iframe { width: 100%; height: 100%; border: none; }

        @media (max-width: 768px) {
            #qm-root { flex-direction: column-reverse; }
            #qm-sidebar { 
                width: 100%; min-width: 100%; height: 65vh; 
                border-left: none; border-top: 1px solid var(--border);
                border-radius: 24px 24px 0 0; padding: 20px;
            }
            #qm-frame-box { margin: 0; border-radius: 0; }
        }

        .qm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .qm-title { 
            margin: 0; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 1.8rem; font-weight: 700;
            background: linear-gradient(90deg, var(--primary-dark), var(--primary)); 
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(94, 156, 255, 0.3);
        }
        
        .qm-close {
            background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--border);
            width: 40px; height: 40px; border-radius: 12px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; font-size: 1.5rem; transition: var(--anim);
            padding: 0; line-height: 0;
        }
        .qm-close:hover { background: rgba(255, 82, 82, 0.2); color: #ff5252; border-color: rgba(255, 82, 82, 0.3); transform: rotate(90deg); }

        .qm-stats { 
            display: flex; justify-content: space-between; align-items: center; 
            font-size: 0.9rem; color: var(--text-muted); margin-bottom: 15px; font-weight: 600;
            padding: 0 5px;
        }
        
        .qm-chk-wrap { display: flex; align-items: center; cursor: pointer; gap: 8px; transition: var(--anim); }
        .qm-chk-wrap:hover { color: var(--text); }
        .qm-chk-wrap input { accent-color: var(--primary); width: 18px; height: 18px; cursor: pointer; }

        .qm-list { flex: 1; overflow-y: auto; margin-bottom: 25px; padding-right: 5px; }
        
        .qm-item { display: block; position: relative; margin-bottom: 10px; cursor: pointer; user-select: none; animation: slideIn 0.4s var(--anim) backwards; }
        .qm-item input { position: absolute; opacity: 0; height: 0; width: 0; }
        
        .qm-card-ui {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 20px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            transition: var(--anim);
            color: var(--text);
            position: relative; overflow: hidden;
        }
        
        .qm-card-ui span { font-size: 1rem; font-weight: 600; z-index: 2; }
        .qm-card-ui::before {
            content: ''; position: absolute; inset: 0;
            background: radial-gradient(circle at 100% 0, rgba(94, 156, 255, 0.1) 0%, transparent 60%);
            opacity: 0; transition: var(--anim); z-index: 1;
        }

        .qm-item:hover .qm-card-ui { transform: translateY(-2px); border-color: rgba(255,255,255,0.2); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .qm-item:hover .qm-card-ui::before { opacity: 1; }

        .qm-item input:checked ~ .qm-card-ui {
            border-color: var(--primary);
            background: rgba(94, 156, 255, 0.08);
            box-shadow: 0 0 20px rgba(94, 156, 255, 0.15), inset 0 0 0 1px rgba(94, 156, 255, 0.1);
        }
        .qm-item input:checked ~ .qm-card-ui span { color: #fff; }
        .qm-item.done .qm-card-ui { opacity: 0.5; border-color: #00c853; }
        .qm-item.done .qm-icon { background: #00c853 !important; border-color: #00c853 !important; }

        .qm-icon { 
            width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); 
            display: flex; align-items: center; justify-content: center; transition: var(--anim);
            color: transparent; font-size: 14px; z-index: 2;
        }
        .qm-item input:checked ~ .qm-card-ui .qm-icon {
            background: var(--primary); border-color: var(--primary); color: #fff;
            box-shadow: 0 0 15px var(--primary-glow);
        }

        .qm-controls { display: flex; flex-direction: column; gap: 15px; margin-top: auto; }
        
        .custom-select { position: relative; width: 100%; }
        .select-trigger {
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 20px; background: rgba(0,0,0,0.3); color: var(--text);
            border: 1px solid var(--border); border-radius: var(--radius);
            font-size: 1rem; font-weight: 600; cursor: pointer; transition: var(--anim);
            user-select: none;
        }
        .select-trigger:hover, .custom-select.active .select-trigger {
            border-color: var(--primary); background: rgba(0,0,0,0.5); color: #fff;
        }
        .select-trigger::after {
            content: ''; border: 6px solid transparent; border-top-color: var(--text-muted);
            margin-top: 4px; transition: var(--anim);
        }
        .custom-select.active .select-trigger::after {
            transform: rotate(180deg); border-top-color: var(--primary); margin-top: -4px;
        }

        .select-options {
            position: absolute; bottom: 110%; left: 0; right: 0;
            background: rgba(25, 25, 30, 0.95); border: 1px solid var(--border);
            border-radius: var(--radius); overflow: hidden;
            opacity: 0; visibility: hidden; transform: translateY(10px);
            transition: var(--anim); z-index: 100; backdrop-filter: blur(20px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .custom-select.active .select-options {
            opacity: 1; visibility: visible; transform: translateY(0);
        }

        .option {
            padding: 14px 20px; cursor: pointer; color: var(--text); transition: var(--anim);
            border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 600;
        }
        .option:last-child { border-bottom: none; }
        .option:hover { background: rgba(94, 156, 255, 0.1); color: #fff; padding-right: 25px; }
        .option.selected { color: var(--primary); background: rgba(94, 156, 255, 0.05); }

        #qm-run {
            width: 100%; padding: 18px; border: none; border-radius: 99px;
            background: linear-gradient(90deg, var(--primary-dark), var(--primary)); 
            color: #fff; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 1.2rem; font-weight: 700;
            cursor: pointer; box-shadow: 0 4px 20px rgba(94, 156, 255, 0.3); 
            transition: var(--anim); display: flex; justify-content: center; align-items: center; gap: 10px;
        }
        #qm-run:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 30px rgba(94, 156, 255, 0.4); }
        #qm-run:disabled { background: #333; color: #777; transform: none; box-shadow: none; cursor: not-allowed; }
        #qm-run.pulse { animation: pulse 1.5s infinite; }

        #qm-status { 
            margin-top: 20px; text-align: center; font-size: 1rem; font-weight: 600; 
            color: #ffc400; min-height: 24px; transition: var(--anim);
        }

        .qm-progress {
            width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px;
            margin-top: 15px; overflow: hidden; position: relative;
        }
        .qm-progress-bar {
            height: 100%; background: linear-gradient(90deg, var(--primary-dark), var(--primary));
            border-radius: 10px; transition: width 0.3s ease; box-shadow: 0 0 10px var(--primary-glow);
        }
        
        .qm-footer { 
            margin-top: 20px; text-align: center; font-size: 0.85rem; color: var(--text-muted); 
            padding-top: 15px; border-top: 1px solid var(--border);
        }
        .qm-footer a { color: var(--primary); text-decoration: none; transition: var(--anim); }
        .qm-footer a:hover { color: #fff; text-shadow: 0 0 10px var(--primary); }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    `;

    const itemsHTML = courses.map((c, i) => 
        `<label class="qm-item" data-id="${c.id}" style="animation-delay: ${i * 50}ms">
            <input type="checkbox" class="chk" value="${c.id}" checked>
            <div class="qm-card-ui">
                <span>${c.name}</span>
                <div class="qm-icon">✓</div>
            </div>
        </label>`
    ).join('');

    d.body.innerHTML = `<style>${css}</style>
    <div id="qm-root">
        <div id="qm-sidebar">
            <div class="qm-header">
                <h2 class="qm-title">المقيم الآلي المحسّن</h2>
                <button class="qm-close" onclick="location.reload()" title="إغلاق">×</button>
            </div>
            
            <div class="qm-stats">
                <label class="qm-chk-wrap"><input type="checkbox" id="qm-all" checked> تحديد الكل</label>
                <span id="qm-count" style="font-family: monospace; font-size: 1.1em;">${courses.length}/${courses.length}</span>
            </div>

            <div class="qm-list">${itemsHTML}</div>

            <div class="qm-controls">
                <div class="custom-select" id="custom-select">
                    <div class="select-trigger" id="select-trigger">موافق</div>
                    <div class="select-options">
                        <div class="option" data-value="0">موافق بشدة</div>
                        <div class="option selected" data-value="1">موافق</div>
                        <div class="option" data-value="2">محايد</div>
                        <div class="option" data-value="3">غير موافق</div>
                        <div class="option" data-value="4">غير موافق بشدة</div>
                    </div>
                    <input type="hidden" id="selected-rate" value="1">
                </div>

                <button id="qm-run" class="pulse">
                    <span>بدء التقييم</span> 🚀
                </button>
            </div>

            <div class="qm-progress"><div class="qm-progress-bar" id="qm-progress" style="width: 0%"></div></div>
            <div id="qm-status">جاهز للبدء...</div>
            
            <div class="qm-footer">
                Developed by <a href="https://t.me/MUTLAQ1" target="_blank">MUTLAQ</a>
            </div>
        </div>
        <div id="qm-frame-box"><iframe id="qm-ifr" src="${loc}"></iframe></div>
    </div>`;

    const ifr = d.getElementById('qm-ifr');
    const btn = d.getElementById('qm-run');
    const st = d.getElementById('qm-status');
    const all = d.getElementById('qm-all');
    const cnt = d.getElementById('qm-count');
    const chks = d.querySelectorAll('.chk');
    const progress = d.getElementById('qm-progress');
    
    // Custom Select Logic
    const selectEl = d.getElementById('custom-select');
    const trigger = d.getElementById('select-trigger');
    const hiddenInput = d.getElementById('selected-rate');
    const options = selectEl.querySelectorAll('.option');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        selectEl.classList.toggle('active');
    });

    options.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = opt.getAttribute('data-value');
            const txt = opt.innerText;
            
            trigger.innerText = txt;
            hiddenInput.value = val;
            
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectEl.classList.remove('active');
        });
    });

    d.addEventListener('click', (e) => {
        if (!selectEl.contains(e.target)) selectEl.classList.remove('active');
    });

    const state = {
        queue: [],
        processed: [],
        active: false,
        currentCourse: null,
        totalCourses: 0,
        stage: 'idle'
    };

    const updateProgress = () => {
        const percent = (state.processed.length / state.totalCourses) * 100;
        progress.style.width = `${percent}%`;
        log(`التقدم: ${state.processed.length}/${state.totalCourses} (${percent.toFixed(1)}%)`, 'info');
    };

    const markCourseAsDone = (courseId) => {
        const item = d.querySelector(`.qm-item[data-id="${courseId}"]`);
        if (item) {
            item.classList.add('done');
            item.querySelector('input').checked = false;
            item.querySelector('input').disabled = true;
        }
        state.processed.push(courseId);
        updateProgress();
        log(`تم الانتهاء من: ${courseId}`, 'success');
    };

    const updateUI = () => {
        const n = d.querySelectorAll('.chk:checked:not(:disabled)').length;
        cnt.innerText = `${n}/${courses.length}`;
        if (n > 0) {
            btn.innerHTML = `<span>بدء تقييم (${n})</span> 🚀`;
            btn.disabled = false;
            btn.classList.add('pulse');
        } else {
            btn.innerHTML = '<span>يرجى اختيار مواد</span>';
            btn.disabled = true;
            btn.classList.remove('pulse');
        }
    };

    all.onchange = (e) => { 
        chks.forEach(c => {
            if (!c.disabled) c.checked = e.target.checked;
        }); 
        updateUI(); 
    };
    chks.forEach(c => c.onchange = updateUI);
    updateUI();

    btn.onclick = () => {
        const selected = Array.from(d.querySelectorAll('.chk:checked:not(:disabled)')).map(c => c.value);
        if(!selected.length) {
            alert('⚠️ يرجى اختيار مقررات للتقييم');
            return;
        }
        
        state.queue = [...selected];
        state.totalCourses = selected.length;
        state.processed = [];
        state.active = true;
        state.stage = 'opening';
        
        [btn, all, ...chks].forEach(el => el.disabled = true);
        selectEl.style.pointerEvents = 'none';
        selectEl.style.opacity = '0.7';
        btn.innerHTML = '<span>جاري المعالجة...</span> ⏳';
        btn.classList.remove('pulse');
        
        log(`بدء معالجة ${state.totalCourses} مقرر`, 'success');
        processQueue();
    };

    let checkAttempts = 0;
    const MAX_ATTEMPTS = 50;

    const processQueue = () => {
        if(!state.active) {
            log('تم إيقاف المعالجة', 'warning');
            return;
        }

        const checkInterval = setInterval(() => {
            checkAttempts++;
            
            if (checkAttempts > MAX_ATTEMPTS) {
                clearInterval(checkInterval);
                log('تجاوز الحد الأقصى للمحاولات', 'error');
                st.innerText = '⚠️ انتهت المهلة - يرجى المحاولة مرة أخرى';
                st.style.color = '#ff5252';
                state.active = false;
                return;
            }

            try {
                const doc = ifr.contentDocument;
                if(!doc || doc.readyState !== 'complete') return;

                const bodyText = doc.body.innerText;

                if (state.stage === 'saving' || state.stage === 'backing') {
                    const saved = bodyText.includes('تم حفظ') || 
                                 bodyText.includes('saved') || 
                                 doc.getElementById('frm:errorMsg2') !== null;
                    
                    const backSelectors = [
                        'a[id*="back"]',
                        'a[class*="back"]', 
                        'input[value*="عودة"]',
                        'input[value*="رجوع"]',
                        'a:contains("Back")',
                        'button[onclick*="back"]'
                    ];

                    let backBtn = null;
                    for (const selector of backSelectors) {
                        backBtn = doc.querySelector(selector);
                        if (backBtn) break;
                    }

                    if (saved && backBtn) {
                        log('تم الحفظ، الضغط على زر العودة', 'success');
                        st.innerText = '🔙 تم الحفظ، جاري العودة...';
                        st.style.color = '#00c853';
                        
                        markCourseAsDone(state.currentCourse);
                        state.stage = 'opening';
                        
                        backBtn.click();
                        clearInterval(checkInterval);
                        checkAttempts = 0;
                        
                        setTimeout(processQueue, 1200);
                        return;
                    }
                }

                if(doc.querySelector('table.rowFlow')) {
                    if(state.queue.length === 0) {
                        state.active = false;
                        state.stage = 'done';
                        st.innerText = '✅ تم الانتهاء من جميع المقررات بنجاح!';
                        st.style.color = '#00c853';
                        btn.innerHTML = '<span>تمت المهمة</span> 🎉';
                        btn.style.background = 'linear-gradient(90deg, #00c853, #009624)';
                        btn.style.boxShadow = '0 5px 20px rgba(0, 200, 83, 0.4)';
                        clearInterval(checkInterval);
                        
                        log('تم الانتهاء من جميع المقررات!', 'success');
                        setTimeout(() => alert('✅ تم الانتهاء من تقييم جميع المقررات المحددة بنجاح!'), 500);
                        return;
                    }

                    state.currentCourse = state.queue[0];
                    const link = doc.querySelector(`a[onmousedown*="setIndex(${state.currentCourse})"]`);

                    if(link) {
                        log(`فتح المقرر: ${state.currentCourse}`, 'info');
                        st.innerText = `⏳ جاري فتح المقرر ${state.currentCourse}...`;
                        st.style.color = 'var(--primary)';
                        
                        const evt = d.createEvent('MouseEvents');
                        evt.initEvent('mousedown', true, true);
                        link.dispatchEvent(evt);
                        link.click();
                        
                        state.queue.shift();
                        state.stage = 'filling';
                        clearInterval(checkInterval);
                        checkAttempts = 0;
                        
                        setTimeout(processQueue, 1500);
                    } else {
                        log(`لم يتم العثور على رابط للمقرر: ${state.currentCourse}`, 'warning');
                        st.innerText = `⚠️ تخطي ${state.currentCourse} (غير موجود)`;
                        state.queue.shift();
                        checkAttempts = 0;
                    }
                    return;
                }

                const radios = doc.querySelectorAll('input[type="radio"]');
                if(radios.length && state.stage === 'filling') {
                    log('بدء تعبئة الاستبيان', 'info');
                    st.innerText = '✍️ تعبئة الاستبيان وحل الفخاخ...';
                    st.style.color = '#ffc400';
                    
                    const ratingVal = parseInt(hiddenInput.value);
                    let traps = 0;
                    let filled = 0;

                    doc.querySelectorAll('table tbody tr').forEach(row => {
                        const rds = row.querySelectorAll('input[type="radio"]');
                        if(rds.length > 2) {
                            const rowText = row.innerText;
                            const trapPatterns = [
                                /ظلل/i, /تأكد/i, /Select/i, /خيار/i, /Choose/i, 
                                /Consistent/i, /attention/i, /check/i, /verify/i,
                                /انتبه/i, /افحص/i, /تحقق/i
                            ];

                            const isTrap = trapPatterns.some(pattern => pattern.test(rowText));
                            
                            if(isTrap) {
                                rds[rds.length - 1].checked = true;
                                traps++;
                                log(`فخ تم حله: ${rowText.substring(0, 50)}...`, 'warning');
                            } else if(rds[ratingVal]) {
                                rds[ratingVal].checked = true;
                                filled++;
                            }
                        }
                    });

                    doc.querySelectorAll('textarea, input[type="text"]').forEach(t => {
                        if (t.value.trim() === '') t.value = '.';
                    });

                    log(`تم تعبئة ${filled} سؤال و ${traps} فخ`, 'success');
                    st.innerText = `💾 جاري الحفظ (${filled} سؤال، ${traps} فخ)...`;
                    st.style.color = '#00c853';
                    
                    state.stage = 'saving';
                    
                    setTimeout(() => {
                        try {
                            const submitBtn = doc.querySelector('input[type="submit"], button[type="submit"]');
                            if (submitBtn) {
                                log('إرسال عبر زر Submit', 'info');
                                submitBtn.click();
                            } else if (typeof doc.defaultView.submitForm === 'function') {
                                log('إرسال عبر submitForm()', 'info');
                                doc.defaultView.submitForm('/qu');
                            } else {
                                log('إرسال عبر form.submit()', 'info');
                                const forms = doc.querySelectorAll('form');
                                if (forms.length > 0) forms[0].submit();
                            }
                        } catch(e) {
                            log(`خطأ في الإرسال: ${e.message}`, 'error');
                        }
                        
                        clearInterval(checkInterval);
                        checkAttempts = 0;
                        setTimeout(processQueue, 2000);
                    }, 800);
                }

            } catch(e) {
                log(`خطأ في المعالجة: ${e.message}`, 'error');
            }
        }, 400);
    };

    log('تم تهيئة المقيم الآلي بنجاح', 'success');
})();
