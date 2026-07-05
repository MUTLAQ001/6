(function() {
    'use strict';
    const d = document;
    const loc = d.location.href;
    const table = d.querySelector('table.rowFlow');

    if (!table) return alert('⚠️ يرجى تشغيل الأداة في صفحة "تقييم المقررات"');

    const buildFingerprint = (r) => {
        const code = r.cells[0] ? r.cells[0].innerText.trim() : '';
        const name = r.cells[1] ? r.cells[1].innerText.trim() : '';
        const activity = r.cells[2] ? r.cells[2].innerText.trim() : '';
        let fullName = name;
        if (code) fullName = code + ' - ' + fullName;
        if (activity) fullName = fullName + ' (' + activity + ')';
        return fullName.trim().replace(/\s+/g, ' ');
    };

    let courses = [];
    d.querySelectorAll('table.rowFlow tbody tr').forEach(r => {
        const a = r.querySelector('a[onmousedown*="setIndex"]');
        if (a) {
            const m = a.getAttribute('onmousedown').match(/\d+/);
            if (m) courses.push({ id: m[0], name: buildFingerprint(r) });
        }
    });

    if (!courses.length) return alert('لا يوجد مواد متاحة');

    const RATE_KEY = 'qm_last_rate';
    const savedRate = (() => {
        try { return localStorage.getItem(RATE_KEY); } catch (e) { return null; }
    })();
    const rateLabels = ['موافق بشدة', 'موافق', 'محايد', 'غير موافق', 'غير موافق بشدة'];
    const initialRate = (savedRate !== null && rateLabels[savedRate]) ? savedRate : '1';

    const css = `
        @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Alexandria:wght@600;700&display=swap");
        :root {
            --primary: #6ea8ff;
            --primary-dark: #4b7dcc;
            --primary-soft: rgba(110, 168, 255, 0.12);
            --primary-glow: rgba(110, 168, 255, 0.35);
            --success: #34d399;
            --warn: #fbbf24;
            --danger: #f87171;
            --bg: #08090c;
            --card: rgba(18, 20, 26, 0.72);
            --card-solid: #14161d;
            --border: rgba(255, 255, 255, 0.08);
            --border-strong: rgba(255, 255, 255, 0.16);
            --text: #e7e9ee;
            --text-muted: #8b909c;
            --font-body: "IBM Plex Sans Arabic", sans-serif;
            --font-title: "Alexandria", "IBM Plex Sans Arabic", sans-serif;
            --radius: 14px;
            --radius-lg: 20px;
            --anim: 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        * { -webkit-tap-highlight-color: transparent; }
        body { margin: 0; overflow: hidden; background: var(--bg); font-family: var(--font-body); color: var(--text); }

        #qm-root {
            display: flex; height: 100vh; width: 100vw; overflow: hidden;
            direction: rtl; opacity: 0; animation: qmFade 0.45s ease forwards;
        }
        @keyframes qmFade { to { opacity: 1; } }
        @keyframes qmSlide { from { transform: translateX(16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes qmSpin { to { transform: rotate(360deg); } }
        @keyframes qmPop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }

        #qm-sidebar {
            width: 420px; min-width: 420px;
            background: var(--card);
            border-left: 1px solid var(--border);
            display: flex; flex-direction: column;
            padding: 22px; box-sizing: border-box;
            box-shadow: -20px 0 60px rgba(0,0,0,0.45);
            z-index: 1000; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
            position: relative; overflow-y: auto;
            transition: height 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        #qm-frame-box { flex: 1; position: relative; background: #fff; border-radius: 22px 0 0 22px; overflow: hidden; margin: 10px 0 10px 10px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05); }
        iframe { width: 100%; height: 100%; border: none; }

        .qm-handle { display: none; width: 46px; height: 5px; background: var(--border-strong); border-radius: 99px; margin: -8px auto 14px; cursor: pointer; transition: var(--anim); }
        .qm-handle:hover { background: var(--primary); }

        .qm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .qm-brand { cursor: pointer; }
        .qm-title { margin: 0; font-family: var(--font-title); font-size: 1.4rem; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
        .qm-subtitle { margin: 1px 0 0; font-size: 0.72rem; color: var(--text-muted); font-weight: 500; }

        .qm-close {
            background: rgba(255,255,255,0.04); color: var(--text-muted); border: 1px solid var(--border);
            width: 38px; height: 38px; border-radius: 11px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; font-size: 1.4rem; transition: var(--anim); flex-shrink: 0;
        }
        .qm-close:hover { background: rgba(248,113,113,0.14); color: var(--danger); border-color: rgba(248,113,113,0.3); transform: rotate(90deg); }

        .qm-progress-wrap { margin-bottom: 16px; }
        .qm-progress-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .qm-progress-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .qm-progress-pct { font-family: var(--font-title); font-size: 1.05rem; font-weight: 700; color: var(--primary); }
        .qm-progress-bar { height: 8px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; position: relative; }
        .qm-progress-fill { height: 100%; width: 0%; border-radius: 99px; background: linear-gradient(90deg, var(--primary-dark), var(--primary)); transition: width 0.5s cubic-bezier(0.25,1,0.5,1); box-shadow: 0 0 12px var(--primary-glow); }

        .qm-chips { display: flex; gap: 8px; margin-bottom: 16px; }
        .qm-chip { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 9px 6px; text-align: center; }
        .qm-chip-val { font-family: var(--font-title); font-size: 1.15rem; font-weight: 700; color: var(--text); line-height: 1.1; }
        .qm-chip-lbl { font-size: 0.65rem; color: var(--text-muted); margin-top: 3px; font-weight: 500; }
        .qm-chip.done .qm-chip-val { color: var(--success); }
        .qm-chip.left .qm-chip-val { color: var(--warn); }

        .qm-search-box { position: relative; margin-bottom: 12px; }
        .qm-search {
            width: 100%; box-sizing: border-box; padding: 11px 40px 11px 14px;
            background: rgba(0,0,0,0.28); border: 1px solid var(--border); border-radius: 12px;
            color: var(--text); font-family: var(--font-body); font-size: 0.88rem; font-weight: 500; transition: var(--anim);
        }
        .qm-search::placeholder { color: var(--text-muted); }
        .qm-search:focus { outline: none; border-color: var(--primary); background: rgba(0,0,0,0.4); }
        .qm-search-icon { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; font-size: 0.9rem; }

        .qm-stats { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 600; padding: 0 2px; }
        .qm-chk-wrap { display: flex; align-items: center; cursor: pointer; gap: 8px; transition: var(--anim); }
        .qm-chk-wrap:hover { color: var(--text); }
        .qm-chk-wrap input { accent-color: var(--primary); width: 17px; height: 17px; cursor: pointer; }
        .qm-count { font-family: var(--font-title); font-size: 0.95em; color: var(--text); }

        .qm-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; margin-bottom: 18px; padding-right: 4px; }
        .qm-header, .qm-progress-wrap, .qm-chips, .qm-search-box, .qm-stats, .qm-controls, #qm-status, .qm-footer { flex-shrink: 0; }
        .qm-empty { text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 30px 0; }

        .qm-item { display: block; position: relative; margin-bottom: 9px; cursor: pointer; user-select: none; animation: qmSlide 0.35s var(--anim) backwards; }
        .qm-item.hidden { display: none; }
        .qm-item input { position: absolute; opacity: 0; height: 0; width: 0; }

        .qm-card-ui {
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            padding: 14px 16px; background: rgba(255,255,255,0.025);
            border: 1px solid var(--border); border-radius: var(--radius);
            transition: var(--anim); color: var(--text); position: relative; overflow: hidden;
        }
        .qm-card-ui span { font-size: 0.92rem; font-weight: 600; z-index: 2; text-align: right; line-height: 1.4; }
        .qm-item:hover .qm-card-ui { transform: translateY(-1px); border-color: var(--border-strong); background: rgba(255,255,255,0.04); }
        .qm-item input:checked ~ .qm-card-ui {
            border-color: rgba(110,168,255,0.5); background: var(--primary-soft);
            box-shadow: inset 0 0 0 1px rgba(110,168,255,0.14);
        }
        .qm-item input:checked ~ .qm-card-ui span { color: #fff; }

        .qm-item.state-done .qm-card-ui { border-color: rgba(52,211,153,0.4); background: rgba(52,211,153,0.07); opacity: 0.75; }
        .qm-item.state-active .qm-card-ui { border-color: var(--warn); background: rgba(251,191,36,0.08); }

        .qm-icon {
            width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.18);
            display: flex; align-items: center; justify-content: center; transition: var(--anim);
            color: transparent; font-size: 12px; z-index: 2; flex-shrink: 0;
        }
        .qm-item input:checked ~ .qm-card-ui .qm-icon { background: var(--primary); border-color: var(--primary); color: #fff; box-shadow: 0 0 12px var(--primary-glow); }
        .qm-item.state-done .qm-card-ui .qm-icon { background: var(--success); border-color: var(--success); color: #fff; box-shadow: 0 0 12px rgba(52,211,153,0.5); animation: qmPop 0.4s ease; }
        .qm-item.state-active .qm-card-ui .qm-icon { border-color: var(--warn); color: var(--warn); animation: qmSpin 0.9s linear infinite; }

        .qm-controls { display: flex; flex-direction: column; gap: 12px; margin-top: auto; }

        .custom-select { position: relative; width: 100%; }
        .select-trigger {
            display: flex; justify-content: space-between; align-items: center;
            padding: 14px 16px; background: rgba(0,0,0,0.28); color: var(--text);
            border: 1px solid var(--border); border-radius: 12px;
            font-size: 0.92rem; font-weight: 600; cursor: pointer; transition: var(--anim); user-select: none;
        }
        .select-trigger:hover, .custom-select.active .select-trigger { border-color: var(--primary); background: rgba(0,0,0,0.42); color: #fff; }
        .select-trigger::after { content: ''; border: 5px solid transparent; border-top-color: var(--text-muted); margin-top: 4px; transition: var(--anim); }
        .custom-select.active .select-trigger::after { transform: rotate(180deg); border-top-color: var(--primary); margin-top: -4px; }

        .select-options {
            position: absolute; bottom: 112%; left: 0; right: 0;
            background: var(--card-solid); border: 1px solid var(--border-strong);
            border-radius: 12px; overflow: hidden; opacity: 0; visibility: hidden; transform: translateY(8px);
            transition: var(--anim); z-index: 100; box-shadow: 0 14px 44px rgba(0,0,0,0.55);
        }
        .custom-select.active .select-options { opacity: 1; visibility: visible; transform: translateY(0); }
        .option { padding: 12px 16px; cursor: pointer; color: var(--text); transition: var(--anim); border-bottom: 1px solid rgba(255,255,255,0.04); font-weight: 600; font-size: 0.9rem; }
        .option:last-child { border-bottom: none; }
        .option:hover { background: var(--primary-soft); color: #fff; padding-right: 22px; }
        .option.selected { color: var(--primary); background: rgba(110,168,255,0.06); }

        .qm-btn-row { display: flex; gap: 10px; }
        #qm-run {
            flex: 1; padding: 16px; border: none; border-radius: 99px;
            background: linear-gradient(90deg, var(--primary-dark), var(--primary));
            color: #fff; font-family: var(--font-title); font-size: 1.02rem; font-weight: 700;
            cursor: pointer; box-shadow: 0 6px 22px var(--primary-glow); transition: var(--anim);
            display: flex; justify-content: center; align-items: center; gap: 9px;
        }
        #qm-run:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px var(--primary-glow); }
        #qm-run:disabled { background: #23262e; color: #5c616b; box-shadow: none; cursor: not-allowed; }

        #qm-pause {
            display: none; width: 54px; border: 1px solid var(--border-strong); border-radius: 99px;
            background: rgba(255,255,255,0.04); color: var(--text); font-size: 1.1rem; cursor: pointer; transition: var(--anim);
            align-items: center; justify-content: center;
        }
        #qm-pause:hover { background: rgba(255,255,255,0.1); border-color: var(--primary); }
        #qm-pause.visible { display: flex; }

        #qm-status {
            margin-top: 14px; display: flex; align-items: center; gap: 8px; justify-content: center;
            font-size: 0.9rem; font-weight: 600; color: var(--text-muted); min-height: 22px; transition: var(--anim); text-align: center;
        }
        .qm-status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; transition: var(--anim); }
        #qm-status.busy .qm-status-dot { background: var(--warn); box-shadow: 0 0 8px var(--warn); animation: qmPulse 1s infinite; }
        #qm-status.ok .qm-status-dot { background: var(--success); box-shadow: 0 0 8px var(--success); }
        @keyframes qmPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

        .qm-footer { margin-top: 14px; text-align: center; font-size: 0.78rem; color: var(--text-muted); padding-top: 12px; border-top: 1px solid var(--border); font-family: var(--font-title); }
        .qm-footer a { color: var(--primary); text-decoration: none; transition: var(--anim); }
        .qm-footer a:hover { color: #fff; text-shadow: 0 0 10px var(--primary); }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

        @media (max-width: 768px) {
            #qm-root { flex-direction: column-reverse; }
            #qm-sidebar { width: 100%; min-width: 100%; height: 72vh; border-left: none; border-top: 1px solid var(--border); border-radius: 22px 22px 0 0; padding: 18px 18px 12px; }
            #qm-sidebar.expanded { height: 92vh; }
            #qm-sidebar.collapsed { height: 120px; padding-bottom: 5px; }
            #qm-sidebar.collapsed .qm-search-box,
            #qm-sidebar.collapsed .qm-chips,
            #qm-sidebar.collapsed .qm-stats,
            #qm-sidebar.collapsed .qm-list,
            #qm-sidebar.collapsed .qm-controls,
            #qm-sidebar.collapsed .qm-footer { display: none !important; }
            #qm-frame-box { margin: 0; border-radius: 0; }
            .qm-handle { display: block; }
        }
    `;

    const itemsHTML = courses.map((c, i) =>
        `<label class="qm-item" data-name="${c.name}" style="animation-delay:${i*40}ms">
            <input type="checkbox" class="chk" value="${c.id}" data-name="${c.name}">
            <div class="qm-card-ui"><span>${c.name}</span><div class="qm-icon">✓</div></div>
        </label>`
    ).join('');

    const optionsHTML = rateLabels.map((lbl, i) =>
        `<div class="option${String(i)===initialRate?' selected':''}" data-value="${i}">${lbl}</div>`
    ).join('');

    d.body.innerHTML = `<style>${css}</style>
    <div id="qm-root">
        <div id="qm-sidebar">
            <div class="qm-handle" id="qm-drag"></div>
            <div class="qm-header">
                <div class="qm-brand" id="qm-brand">
                    <div>
                        <h2 class="qm-title">المقيّم الآلي</h2>
                        <p class="qm-subtitle">تقييم المقررات — جامعة القصيم</p>
                    </div>
                </div>
                <button class="qm-close" onclick="location.reload()" title="إغلاق">×</button>
            </div>

            <div class="qm-progress-wrap">
                <div class="qm-progress-top">
                    <span class="qm-progress-label">التقدّم الكلي</span>
                    <span class="qm-progress-pct" id="qm-pct">0%</span>
                </div>
                <div class="qm-progress-bar"><div class="qm-progress-fill" id="qm-fill"></div></div>
            </div>

            <div class="qm-chips">
                <div class="qm-chip done"><div class="qm-chip-val" id="qm-done">0</div><div class="qm-chip-lbl">مكتملة</div></div>
                <div class="qm-chip left"><div class="qm-chip-val" id="qm-left">—</div><div class="qm-chip-lbl">متبقية</div></div>
                <div class="qm-chip"><div class="qm-chip-val" id="qm-time">0:00</div><div class="qm-chip-lbl">الوقت</div></div>
            </div>

            <div class="qm-search-box">
                <input type="text" class="qm-search" id="qm-search" placeholder="ابحث عن مقرر...">
                <span class="qm-search-icon">🔍</span>
            </div>

            <div class="qm-stats">
                <label class="qm-chk-wrap"><input type="checkbox" id="qm-all"> تحديد الكل</label>
                <span class="qm-count" id="qm-count">0/${courses.length}</span>
            </div>

            <div class="qm-list" id="qm-list">${itemsHTML}</div>

            <div class="qm-controls">
                <div class="custom-select" id="custom-select">
                    <div class="select-trigger" id="select-trigger">${rateLabels[initialRate]}</div>
                    <div class="select-options">${optionsHTML}</div>
                    <input type="hidden" id="selected-rate" value="${initialRate}">
                </div>
                <div class="qm-btn-row">
                    <button id="qm-run"><span>بدء التقييم</span> 🚀</button>
                    <button id="qm-pause" title="إيقاف مؤقت">⏸</button>
                </div>
            </div>

            <div id="qm-status"><span class="qm-status-dot"></span><span id="qm-status-txt">جاهز للبدء</span></div>
            <div class="qm-footer">Developed by <a href="https://t.me/MUTLAQ1" target="_blank">MUTLAQ</a></div>
        </div>
        <div id="qm-frame-box"><iframe id="qm-ifr" src="${loc}"></iframe></div>
    </div>`;

    const $ = id => d.getElementById(id);
    const ifr = $('qm-ifr'), btn = $('qm-run'), pauseBtn = $('qm-pause');
    const stWrap = $('qm-status'), stTxt = $('qm-status-txt');
    const all = $('qm-all'), cnt = $('qm-count'), listEl = $('qm-list'), searchEl = $('qm-search');
    const sidebar = $('qm-sidebar'), dragHandle = $('qm-drag'), brand = $('qm-brand');
    const selectEl = $('custom-select'), trigger = $('select-trigger'), hiddenInput = $('selected-rate');
    const fillEl = $('qm-fill'), pctEl = $('qm-pct'), doneEl = $('qm-done'), leftEl = $('qm-left'), timeEl = $('qm-time');
    let chks = Array.from(d.querySelectorAll('.chk'));
    const options = selectEl.querySelectorAll('.option');

    const setStatus = (txt, type) => {
        stTxt.innerText = txt;
        stWrap.className = type || '';
    };

    let totalTarget = 0, doneCount = 0, startTime = null, timerInt = null;
    const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    const updateProgress = () => {
        const pct = totalTarget ? Math.round((doneCount/totalTarget)*100) : 0;
        fillEl.style.width = pct + '%';
        pctEl.innerText = pct + '%';
        doneEl.innerText = doneCount;
        leftEl.innerText = Math.max(0, totalTarget - doneCount);
    };
    const startTimer = () => {
        startTime = Date.now();
        timerInt = setInterval(() => { timeEl.innerText = fmtTime(Math.floor((Date.now()-startTime)/1000)); }, 1000);
    };
    const stopTimer = () => { if (timerInt) clearInterval(timerInt); };

    const syncAll = () => {
        const visible = chks.filter(c => !c.closest('.qm-item').classList.contains('hidden'));
        all.checked = visible.length > 0 && visible.every(c => c.checked);
    };

    const updateUI = () => {
        const n = d.querySelectorAll('.chk:checked').length;
        cnt.innerText = `${n}/${courses.length}`;
        if (n > 0) { btn.innerHTML = `<span>بدء التقييم (${n})</span> 🚀`; btn.disabled = false; }
        else { btn.innerHTML = '<span>اختر مقرراً</span>'; btn.disabled = true; }
        syncAll();
    };

    all.onchange = e => { chks.forEach(c => { if (!c.closest('.qm-item').classList.contains('hidden')) c.checked = e.target.checked; }); updateUI(); };
    chks.forEach(c => c.onchange = updateUI);
    updateUI();

    searchEl.addEventListener('input', () => {
        const q = searchEl.value.trim().toLowerCase();
        let visible = 0, empty = listEl.querySelector('.qm-empty');
        d.querySelectorAll('.qm-item').forEach(it => {
            const match = it.dataset.name.toLowerCase().includes(q);
            it.classList.toggle('hidden', !match);
            if (match) visible++;
        });
        if (!visible && !empty) { const e = d.createElement('div'); e.className = 'qm-empty'; e.innerText = 'لا نتائج'; listEl.appendChild(e); }
        else if (visible && empty) empty.remove();
        syncAll();
    });

    const handleToggle = e => {
        if (e.target.closest('.qm-close')) return;
        if (window.innerWidth <= 768) { sidebar.classList.remove('collapsed'); sidebar.classList.toggle('expanded'); }
    };
    const brandToggle = e => {
        if (e.target.closest('.qm-close')) return;
        if (window.innerWidth <= 768) { sidebar.classList.remove('expanded'); sidebar.classList.toggle('collapsed'); }
    };
    dragHandle.addEventListener('click', handleToggle);
    brand.addEventListener('click', brandToggle);

    trigger.addEventListener('click', e => { e.stopPropagation(); selectEl.classList.toggle('active'); });
    options.forEach(opt => opt.addEventListener('click', e => {
        e.stopPropagation();
        const val = opt.getAttribute('data-value');
        trigger.innerText = opt.innerText;
        hiddenInput.value = val;
        try { localStorage.setItem(RATE_KEY, val); } catch (er) {}
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectEl.classList.remove('active');
    }));
    d.addEventListener('click', e => { if (!selectEl.contains(e.target)) selectEl.classList.remove('active'); });

    let queue = [], active = false, paused = false, retries = 0, processingCid = null, activeCourseName = null;

    const markItem = (name, state) => {
        const it = d.querySelector(`.qm-item[data-name="${CSS.escape(name)}"]`);
        if (!it) return;
        it.classList.remove('state-active', 'state-done');
        if (state) it.classList.add('state-' + state);
    };

    pauseBtn.onclick = () => {
        paused = !paused;
        pauseBtn.innerText = paused ? '▶' : '⏸';
        pauseBtn.title = paused ? 'استئناف' : 'إيقاف مؤقت';
        if (paused) { setStatus('موقوف مؤقتاً', ''); }
        else { setStatus('جارٍ المتابعة...', 'busy'); processQueue(); }
    };

    btn.onclick = () => {
        queue = Array.from(d.querySelectorAll('.chk:checked')).map(c => c.getAttribute('data-name'));
        if (!queue.length) return;

        active = true; paused = false; doneCount = 0; totalTarget = queue.length;
        updateProgress(); startTimer();
        queue.forEach(n => markItem(n, null));

        [btn, all, searchEl, ...chks].forEach(el => el.disabled = true);
        selectEl.style.pointerEvents = 'none'; selectEl.style.opacity = '0.6';
        btn.innerHTML = '<span>جارٍ المعالجة</span> ⏳';
        pauseBtn.classList.add('visible');
        setStatus('بدء المعالجة...', 'busy');

        if (window.innerWidth <= 768) sidebar.classList.add('collapsed');
        processQueue();
    };

    const finish = (msg) => {
        active = false; stopTimer();
        setStatus(msg, 'ok');
        btn.innerHTML = '<span>تمت المهمة</span> 🎉';
        btn.style.background = 'linear-gradient(90deg, var(--success), #059669)';
        btn.style.boxShadow = '0 6px 22px rgba(52,211,153,0.4)';
        pauseBtn.classList.remove('visible');
        if (window.innerWidth <= 768) sidebar.classList.remove('collapsed');
    };

    const processQueue = () => {
        if (!active || paused) return;
        const timer = setInterval(() => {
            if (paused) { clearInterval(timer); return; }
            try {
                const doc = ifr.contentDocument;
                if (!doc || doc.readyState !== 'complete') return;

                const hasMsg = doc.getElementById('frm:errorMsg2');
                const backBtn = doc.querySelector('a[id*="back"], a[class*="btn"], input[value*="عودة"]');
                const isBacking = backBtn && (backBtn.innerText.includes('رجوع') || backBtn.innerText.includes('Back') || backBtn.value?.includes('عودة'));

                if ((hasMsg || doc.body.innerText.includes('تم حفظ')) && isBacking) {
                    setStatus('تم الحفظ، جارٍ العودة...', 'ok');
                    processingCid = null;
                    backBtn.click();
                    clearInterval(timer);
                    setTimeout(processQueue, 800);
                    return;
                }

                if (doc.querySelector('table.rowFlow')) {
                    let targetLink = null, targetName = null;
                    doc.querySelectorAll('table.rowFlow tbody tr').forEach(r => {
                        const a = r.querySelector('a[onmousedown*="setIndex"]');
                        if (a) {
                            const m = a.getAttribute('onmousedown').match(/\d+/);
                            const fullName = buildFingerprint(r);
                            if (m && queue.includes(fullName) && !targetLink) {
                                targetLink = a; targetName = fullName; processingCid = m[0];
                            }
                        }
                    });

                    if (!targetLink && processingCid === null) {
                        finish('اكتملت جميع المواد بنجاح');
                        clearInterval(timer);
                        alert('✅ تم الانتهاء من جميع المواد المحددة.');
                        return;
                    }

                    if (processingCid !== null && targetLink) {
                        const shortName = targetName.split(' - ')[1] || targetName;
                        setStatus(`فتح: ${shortName}`, 'busy');
                        activeCourseName = targetName;
                        markItem(targetName, 'active');

                        const evt = d.createEvent('MouseEvents');
                        evt.initEvent('mousedown', true, true);
                        targetLink.dispatchEvent(evt);
                        targetLink.click();
                        retries = 0;
                        clearInterval(timer);
                        setTimeout(processQueue, 1000);
                    } else {
                        retries++;
                        if (retries > 12) {
                            setStatus('تخطي مقرر غير مستجيب', '');
                            queue = queue.filter(n => n !== activeCourseName);
                            markItem(activeCourseName, null);
                            processingCid = null; activeCourseName = null; retries = 0;
                        }
                    }
                    return;
                }

                const radios = doc.querySelectorAll('input[type="radio"]');
                if (radios.length) {
                    if (activeCourseName !== null) {
                        markItem(activeCourseName, 'done');
                        doneCount++; updateProgress();
                        queue = queue.filter(n => n !== activeCourseName);
                        processingCid = null; activeCourseName = null; retries = 0;
                    }

                    setStatus('تعبئة الاستبيان...', 'busy');
                    const ratingVal = parseInt(hiddenInput.value);
                    let traps = 0;
                    doc.querySelectorAll('table tbody tr').forEach(row => {
                        const rds = row.querySelectorAll('input[type="radio"]');
                        if (rds.length > 2) {
                            if (/ظلل|تأكد|Select|خيار|Choose|Consistent/.test(row.innerText)) { rds[rds.length-1].checked = true; traps++; }
                            else if (rds[ratingVal]) rds[ratingVal].checked = true;
                        }
                    });
                    doc.querySelectorAll('textarea').forEach(t => t.value = '.');
                    setStatus(`حفظ${traps ? ` (${traps} تحقق)` : ''}...`, 'busy');

                    const script = doc.createElement('script');
                    script.textContent = "if(typeof submitForm=='function'){submitForm('/qu')}else{document.forms[0].submit()}";
                    doc.body.appendChild(script);
                    clearInterval(timer);
                    setTimeout(processQueue, 1500);
                }
            } catch (e) {}
        }, 500);
    };
})();
