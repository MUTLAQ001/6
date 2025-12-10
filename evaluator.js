(function(){
    var d=document;
    var u=d.location.href;
    if(!d.querySelector('table.rowFlow')) return alert('⚠️ يرجى تشغيل الأداة في صفحة "تقييم المقررات"');
    
    var rs=d.querySelectorAll('table.rowFlow tbody tr');
    var chks='';
    var cnt=0;
    rs.forEach(function(r){
        var a=r.querySelector('a[onmousedown*="setIndex"]');
        if(a){
            var idMatch=a.getAttribute('onmousedown').match(/\d+/);
            if(idMatch){
                var id=idMatch[0];
                var nm=r.cells[1]?r.cells[1].innerText:'M'+id;
                chks+='<label class="course-item"><input type="checkbox" class="cc" value="'+id+'" checked><div class="checkmark"></div><span class="c-name">'+nm+'</span></label>';
                cnt++;
            }
        }
    });
    
    if(cnt==0) return alert('لا يوجد مواد متاحة للتقييم');
    
    var css='@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap");:root{--primary:#5e9cff;--primary-dark:#4b7dcc;--bg:#0a0a0a;--card:rgba(20,20,22,0.9);--border:rgba(255,255,255,0.1);--text:#e0e0e0;--green:#00c853}body{margin:0;overflow:hidden;font-family:"Cairo",sans-serif}#qm-root{position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;background:var(--bg);direction:rtl;display:flex;justify-content:center;align-items:center;font-family:"Cairo",sans-serif}#nebula{position:absolute;top:50%;left:50%;width:90vmax;height:90vmax;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(94,156,255,0.15) 0%,rgba(167,119,255,0.1) 40%,transparent 70%);filter:blur(80px);border-radius:50%;animation:move-nebula 20s infinite alternate ease-in-out;z-index:1}@keyframes move-nebula{0%{transform:translate(-50%,-50%) scale(1) rotate(0deg)}100%{transform:translate(-50%,-50%) scale(1.2) rotate(10deg)}}#stars{position:absolute;width:100%;height:100%;background-image:radial-gradient(white 1px,transparent 1px);background-size:50px 50px;opacity:0.15;z-index:0}#qm-card{position:relative;z-index:10;width:420px;max-height:85vh;background:var(--card);border:1px solid var(--border);border-radius:24px;padding:2rem;backdrop-filter:blur(20px);box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);display:flex;flex-direction:column;animation:scaleIn 0.5s cubic-bezier(0.2,0.8,0.2,1)}@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}h1{font-family:"IBM Plex Sans Arabic";margin:0 0 5px 0;font-size:2.2rem;font-weight:700;background:linear-gradient(90deg,var(--primary-dark),var(--primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center}p.sub{color:#999;text-align:center;font-size:0.95rem;margin-bottom:25px}label.lbl{color:var(--text);font-size:1rem;margin-bottom:12px;display:block;font-weight:700}.custom-select{position:relative;width:100%;margin-bottom:20px;font-family:"IBM Plex Sans Arabic"}.select-trigger{display:flex;justify-content:center;align-items:center;background:rgba(255,255,255,0.05);padding:15px;border-radius:16px;border:1px solid var(--border);color:#fff;font-size:1.2rem;font-weight:700;cursor:pointer;transition:0.3s}.select-trigger:hover{border-color:var(--primary);background:rgba(255,255,255,0.1)}.select-options{position:absolute;top:110%;left:0;right:0;background:rgba(30,30,35,0.95);border:1px solid var(--border);border-radius:16px;overflow:hidden;opacity:0;visibility:hidden;transform:translateY(-10px);transition:0.3s;z-index:100;box-shadow:0 10px 40px rgba(0,0,0,0.5)}.select-options.open{opacity:1;visibility:visible;transform:translateY(0)}.option{padding:15px;text-align:center;cursor:pointer;color:#ccc;transition:0.2s;border-bottom:1px solid rgba(255,255,255,0.05);font-size:1.1rem}.option:hover{background:var(--primary);color:#fff}.option.selected{color:var(--primary);font-weight:700}.option.selected:hover{color:#fff}#c-list{flex:1;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:16px;padding:10px;margin-bottom:20px;border:1px solid var(--border)}.course-item{display:flex;align-items:center;padding:12px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:0.2s;border-radius:12px;background:rgba(255,255,255,0.02);margin-bottom:8px}.course-item:hover{background:rgba(255,255,255,0.05);transform:translateY(-2px)}.course-item input{display:none}.checkmark{width:24px;height:24px;border:2px solid rgba(255,255,255,0.3);border-radius:8px;margin-left:12px;position:relative;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);background:rgba(0,0,0,0.3)}.course-item input:checked ~ .checkmark{background:var(--primary);border-color:var(--primary);box-shadow:0 0 10px rgba(94,156,255,0.5);transform:scale(1.05)}.course-item input:checked ~ .checkmark::after{content:"";position:absolute;left:9px;top:5px;width:5px;height:10px;border:solid white;border-width:0 3px 3px 0;transform:rotate(45deg);animation:checkAnim 0.2s forwards}@keyframes checkAnim{from{opacity:0;transform:rotate(45deg) scale(0)}to{opacity:1;transform:rotate(45deg) scale(1)}}.c-name{color:var(--text);font-size:0.95rem}#go-btn{font-family:"IBM Plex Sans Arabic";width:100%;padding:16px;border:none;border-radius:99px;background:linear-gradient(90deg,var(--primary-dark),var(--primary));color:#fff;font-size:1.2rem;font-weight:700;cursor:pointer;transition:0.3s;box-shadow:0 4px 15px rgba(94,156,255,0.3);display:flex;justify-content:center;align-items:center;gap:10px}#go-btn:hover{transform:translateY(-3px);filter:brightness(1.1)}#go-btn:disabled{background:#333;color:#777;cursor:not-allowed;box-shadow:none;transform:none}#status{text-align:center;margin-top:20px;font-size:0.95rem;color:var(--primary);font-weight:600;min-height:20px}#close-btn{position:absolute;top:20px;left:20px;background:none;border:none;color:#666;font-size:1.8rem;cursor:pointer;transition:0.2s;line-height:1;padding:5px}#close-btn:hover{color:#fff;transform:rotate(90deg)}#qm-frame{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}#header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}#toggle-all{color:var(--primary);font-size:0.85rem;cursor:pointer;font-weight:600;transition:0.2s}#toggle-all:hover{color:#fff}#footer{margin-top:25px;text-align:center;font-family:"IBM Plex Sans Arabic";background:rgba(255,255,255,0.05);padding:12px;border-radius:12px;display:flex;justify-content:center;align-items:center;gap:8px}#footer span{color:#bbb;font-size:1rem}#footer a{color:var(--primary);text-decoration:none;font-weight:700;font-size:1.1rem;letter-spacing:1px;transition:0.3s}#footer a:hover{color:#fff;text-shadow:0 0 15px var(--primary);transform:scale(1.1)}';
    
    d.body.innerHTML=html;
    
    var trigger=d.getElementById('select-trigger');
    var options=d.getElementById('select-options');
    var allOptions=d.querySelectorAll('.option');
    var rIdx=1;
    
    trigger.addEventListener('click',function(){options.classList.toggle('open')});
    
    allOptions.forEach(function(opt){
        opt.addEventListener('click',function(){
            rIdx=this.getAttribute('data-value');
            trigger.textContent=this.textContent;
            allOptions.forEach(function(o){o.classList.remove('selected')});
            this.classList.add('selected');
            options.classList.remove('open');
        });
    });
    
    d.addEventListener('click',function(e){if(!trigger.contains(e.target)&&!options.contains(e.target)){options.classList.remove('open')}});
    
    var toggleBtn=d.getElementById('toggle-all');
    toggleBtn.onclick=function(){
        var cbs=d.querySelectorAll('.cc');
        var isAll=toggleBtn.innerText==='تحديد الكل';
        cbs.forEach(function(c){c.checked=isAll});
        toggleBtn.innerText=isAll?'إلغاء تحديد الكل':'تحديد الكل';
    };
    
    var fr=d.getElementById('qm-frame');
    var btn=d.getElementById('go-btn');
    var st=d.getElementById('status');
    var run=false;
    var q=[];
    var step='L'; 
    var totalSelected=0;
    var retryCount=0;
    
    btn.onclick=function(){
        q=[];
        d.querySelectorAll('.cc:checked').forEach(function(c){q.push(c.value)});
        if(q.length==0) return alert('اختر مادة على الأقل!');
        totalSelected=q.length;
        run=true;
        btn.disabled=true;
        btn.innerHTML='جاري العمل...';
        d.querySelectorAll('input').forEach(function(i){i.disabled=true});
        trigger.style.pointerEvents='none';
        toggleBtn.style.pointerEvents='none';
    };
    
    setInterval(function(){
        if(!run) return;
        
        try{
            var fd=fr.contentDocument;
            if(!fd || fd.readyState!=='complete') return;
            
            var suc = fd.getElementById('frm:errorMsg2');
            var b3 = fd.getElementById('frm:back3');
            var b2 = fd.getElementById('frm:back2');
            var allLinks = Array.from(fd.querySelectorAll('a'));
            var bGen = allLinks.find(a => a.innerText.includes('رجوع') || a.innerText.includes('عودة') || (a.className.includes('btn') && a.innerText.includes('Back')));

            if(suc || (step=='B' && (b3||b2||bGen))){
                var done = totalSelected - q.length + 1; 
                if(done > totalSelected) done = totalSelected;
                st.innerText='🔙 تم الحفظ، جاري العودة... (مكتمل: '+done+' | متبقي: '+(q.length-1)+')';
                if(b3) b3.click();
                else if(b2) b2.click();
                else if(bGen) bGen.click();
                
                if(step == 'B') {
                    q.shift();
                    step='L';
                    retryCount=0;
                }
                return;
            }
            
            if(fd.querySelector('table.rowFlow')){
                if(step == 'B') {
                     q.shift();
                     step='L';
                     retryCount=0;
                     return;
                }

                if(q.length==0){
                    run=false;
                    st.innerText='✅ تم الانتهاء من جميع المواد ('+totalSelected+')!';
                    st.style.color='#00c853';
                    btn.innerHTML='تم الانتهاء';
                    btn.style.background='var(--green)';
                    alert('تم الانتهاء من جميع المواد المحددة!');
                    d.location.reload();
                    return;
                }

                var currentId = q[0];
                var done = totalSelected - q.length;

                if(step == 'L'){
                    var l=fd.querySelector('a[onmousedown*="setIndex('+currentId+')"]');
                    if(l){
                        st.innerText='⏳ جاري فتح المادة '+currentId+' (متبقي '+q.length+')...';
                        
                        var mdown = d.createEvent('MouseEvents');
                        mdown.initEvent('mousedown', true, true);
                        l.dispatchEvent(mdown);
                        
                        var mup = d.createEvent('MouseEvents');
                        mup.initEvent('mouseup', true, true);
                        l.dispatchEvent(mup);
                        
                        var clk = d.createEvent('MouseEvents');
                        clk.initEvent('click', true, true);
                        l.dispatchEvent(clk);
                        
                        setTimeout(function(){ l.click(); }, 200);

                        step='W'; 
                        retryCount=0;
                    } else {
                        st.innerText='⚠️ تخطي '+currentId+' (مكتمل: '+done+' | متبقي: '+q.length+')...';
                        q.shift();
                    }
                } else if(step == 'W') {
                    retryCount++;
                    if(retryCount > 2) {
                         st.innerText='🔄 محاولة الضغط مجدداً...';
                         step = 'L'; 
                         retryCount = 0;
                    }
                }
            } 
            else if(fd.querySelector('input[type="radio"]')){
                if(step=='W' || step=='L'){
                    var done = totalSelected - q.length;
                    st.innerText='📝 جاري التقييم وحل الأفخاخ...';
                    var trs=fd.querySelectorAll('table tbody tr');
                    var trick=0;
                    trs.forEach(function(r){
                        var i=r.querySelectorAll('input[type="radio"]');
                        if(i.length>2){
                            if(r.innerText.includes('ظلل') || r.innerText.includes('تأكد') || r.innerText.includes('Select') || r.innerText.includes('خيار')){
                                i[i.length-1].checked=true; 
                                trick++;
                            }else{
                                if(i[rIdx]) i[rIdx].checked=true;
                            }
                        }
                    });
                    fd.querySelectorAll('textarea').forEach(function(t){t.value='.'});
                    
                    st.innerText='💾 جاري الحفظ... (فخ: '+trick+' | مكتمل: '+done+' | متبقي: '+q.length+')';
                    step='B';
                    
                    setTimeout(function(){
                        var s=fd.createElement('script');
                        s.innerHTML="if(typeof submitForm === 'function'){ submitForm('/qu'); } else { document.forms[0].submit(); }";
                        fd.body.appendChild(s);
                    }, 500);
                }
            }
        }catch(e){}
    }, 1500);
})();
