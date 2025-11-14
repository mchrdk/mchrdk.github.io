(function(){
    // Nokia-style small-screen DOS-like interface
    const screen=document.getElementById('nokiaScreen'); if(!screen) return;
    let inputBuffer=''; let bootDone=false; let bootTimers=[]; let mobileInput=null;

    // print helper for the nokia screen
    const nokiaPrint=(text='')=>{ const div=document.createElement('div'); div.className='line'; div.textContent=text; screen.appendChild(div); ensureScroll(); };
    const setPromptNokia=()=>{ const prompt=document.createElement('div'); prompt.className='line'; prompt.innerHTML='C:\\> <span class="nokia-cursor">_</span>'; screen.appendChild(prompt); ensureScroll(); };

    function ensureScroll(){
        try{
            if(mobileInput && document.activeElement===mobileInput){
                const extra=(mobileInput.offsetHeight||56)+20;
                screen.scrollTop = Math.max(0, screen.scrollHeight - screen.clientHeight + extra);
                return;
            }
        }catch(e){}
        screen.scrollTop = screen.scrollHeight;
    }

    function clearBoot(){ bootTimers.forEach(t=>clearTimeout(t)); bootTimers=[]; }
    function runBoot(){ screen.innerHTML=''; bootDone=false; inputBuffer=''; clearBoot(); const steps=[
        {t:0,s:'NOKIA 7110 Emulator'},
        {t:300,s:'Initializing system...'},
        {t:700,s:'Loading profile...'},
        {t:1100,s:''},{t:1400,s:'Starting interface...'}
    ]; steps.forEach(step=>bootTimers.push(setTimeout(()=>nokiaPrint(step.s),step.t)));
        bootTimers.push(setTimeout(()=>{bootDone=true; setPromptNokia();},1700));
    }
    runBoot();

    // load profile
    fetch('../data/profile.json').then(r=>r.ok?r.json():null).then(p=>{ window.__cv_profile=p; }).catch(()=>{});

    // markdown -> lines (simple)
    const renderMarkdownToLines=(md)=>md.split('\n').map(l=>{ if(!l) return ''; const h=l.match(/^(#{1,6})\s+(.*)$/); if(h){return h[1].length===1? h[2].toUpperCase():('  '+h[2]); } if(/^\s*[-*+]\s+/.test(l)) return '  * '+l.replace(/^\s*[-*+]\s+/,''); l=l.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1 ($2)'); return l; });

    const fetchAndPrint=(path, fallback)=>{
        fetch(path).then(r=>{ if(!r.ok) throw new Error('no'); return r.text(); }).then(text=>{ renderMarkdownToLines(text).forEach(l=>nokiaPrint(l)); }).catch(()=>{ if(typeof fallback==='function') fallback(); else nokiaPrint(fallback||'Unable to load file'); });
    };

    // commands
    function handleCommandNokia(cmdRaw){ const cmd=(cmdRaw||'').trim().toLowerCase();
        if(cmd==='ver'){ nokiaPrint('NOKIA DOS v1.0'); }
        else if(cmd==='dir' || cmd==='dir.exe'){
            nokiaPrint(' Directory of C:'); const now=new Date(); const d=(n)=>String(n).padStart(2,'0'); const date=`${d(now.getMonth()+1)}-${d(now.getDate())}-${String(now.getFullYear()).slice(-2)}`;
            nokiaPrint(''); nokiaPrint(`${date}  12:00p  27,648  DIR.EXE`); nokiaPrint(`${date}  12:00p  32,768  SKILLS.EXE`); nokiaPrint(`${date}  12:00p  64,512  CV.EXE`);
            nokiaPrint(' 5 File(s)  518,144 bytes');
        }
        else if(cmd==='cv' || cmd==='cv.exe'){
            fetchAndPrint('../data/cv.md', ()=>{
                const prof=window.__cv_profile; if(!prof){ nokiaPrint('Unable to load profile'); } else { nokiaPrint('--- CV ---'); nokiaPrint(prof.name||''); if(prof.headline) nokiaPrint(prof.headline); if(prof.summary) nokiaPrint(prof.summary.replace(/\n+/g,' ')); nokiaPrint('--- END ---'); }
            });
        }
        else if(cmd==='skills' || cmd==='skills.exe'){
            fetchAndPrint('../data/skills.md', ()=>{ const prof=window.__cv_profile; if(!prof||!Array.isArray(prof.skills)||!prof.skills.length) nokiaPrint('No skills loaded'); else { nokiaPrint('--- SKILLS ---'); prof.skills.forEach(s=>nokiaPrint(' '+s)); nokiaPrint('--- END ---'); }});
        }
        else if(cmd==='doom' || cmd==='doom.exe'){ nokiaPrint('Launching DOOM...'); window.open('https://diekmann.github.io/wasm-fizzbuzz/doom/','_blank','noopener'); }
        else if(cmd==='help'){ fetchAndPrint('../data/help.md', ()=>nokiaPrint('Commands: VER, DIR, CV.EXE, SKILLS.EXE, DOOM.EXE, CLS, HELP, EXIT')); }
        else if(cmd==='cls'){ screen.innerHTML=''; }
        else if(cmd==='exit'){ /* noop */ }
        else if(cmd){ nokiaPrint('Bad command or file name'); }
        setPromptNokia();
    }

    // keyboard handling (desktop keyboard)
    document.addEventListener('keydown', e=>{
        if(!bootDone){ clearBoot(); nokiaPrint('...'); nokiaPrint('NOKIA BOOT'); bootDone=true; setPromptNokia(); return; }
        const k=e.key;
        if(k==='Enter'){ const last=screen.lastElementChild; if(last) last.innerHTML='C:\\>'+inputBuffer; const cmd=inputBuffer.trim().toLowerCase(); inputBuffer=''; handleCommandNokia(cmd); e.preventDefault(); }
        else if(k==='Backspace'){ inputBuffer=inputBuffer.slice(0,-1); const last=screen.lastElementChild; if(last) last.innerHTML='C:\\>'+inputBuffer+'<span class="nokia-cursor">_</span>'; e.preventDefault(); }
        else if(k.length===1 && !e.ctrlKey && !e.metaKey){ inputBuffer+=k; const last=screen.lastElementChild; if(last) last.innerHTML='C:\\>'+inputBuffer+'<span class="nokia-cursor">_</span>'; e.preventDefault(); }
    });

    // Mobile input: hidden but used to summon keyboard and keep parity with dos version
    try{
        const isTouch=('ontouchstart' in window) || navigator.maxTouchPoints>0;
        if(isTouch){
            mobileInput = document.createElement('input');
            mobileInput.id='nokiaMobileInput'; mobileInput.type='text'; mobileInput.autocorrect='off'; mobileInput.autocapitalize='off'; mobileInput.spellcheck=false; mobileInput.setAttribute('inputmode','text');
            mobileInput.style.display='block'; mobileInput.style.position='fixed'; mobileInput.style.left='12px'; mobileInput.style.right='12px'; mobileInput.style.bottom='12px'; mobileInput.style.zIndex='99999';
            document.body.appendChild(mobileInput);
            // open button
            const openBtn=document.getElementById('openNokiaKeyboard');
            if(openBtn){ openBtn.addEventListener('click', (ev)=>{ try{ mobileInput.focus(); setTimeout(()=>mobileInput.focus(),120); ev.preventDefault(); }catch(e){}}, false); }

            mobileInput.addEventListener('input', ()=>{ inputBuffer=mobileInput.value; const last=screen.lastElementChild; if(last) last.innerHTML='C:\\>'+inputBuffer+'<span class="nokia-cursor">_</span>'; });
            mobileInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ const last=screen.lastElementChild; if(last) last.innerHTML='C:\\>'+inputBuffer; const cmd=inputBuffer.trim().toLowerCase(); inputBuffer=''; mobileInput.value=''; handleCommandNokia(cmd); setTimeout(()=>mobileInput.focus(),50); e.preventDefault(); }});

            mobileInput.addEventListener('focus', ()=>setTimeout(ensureScroll,300));
            document.addEventListener('touchend', (ev)=>{ const t=ev.target; if(t && (t.tagName==='INPUT' || t.tagName==='BUTTON' || t.tagName==='A' || t.isContentEditable)) return; try{ mobileInput.focus(); }catch(e){} }, false);
        }
    }catch(e){}
})();
