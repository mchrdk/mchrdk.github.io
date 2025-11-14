// DOS standalone logic (extracted from combined script) + commands, without paradox visuals
(function(){
    let bootTimers=[]; let bootDone=false; let inputBuffer='';
    const screen=document.getElementById('dosScreen'); if(!screen) return;
    const printLine=(text='')=>{ const div=document.createElement('div'); div.className='line'; div.textContent=text; screen.appendChild(div); screen.scrollTop=screen.scrollHeight; };
    const setPrompt=()=>{ const prompt=document.createElement('div'); prompt.className='line'; prompt.innerHTML='C:\\><span class="dos-cursor">_</span>'; screen.appendChild(prompt); screen.scrollTop=screen.scrollHeight; };
    const clearBoot=()=>{ bootTimers.forEach(t=>clearTimeout(t)); bootTimers=[]; };
    const runBoot=()=>{ screen.innerHTML=''; bootDone=false; inputBuffer=''; clearBoot(); const steps=[
        {t:0,s:'AMIBIOS System Configuration (C) 1985-1992, American Megatrends Inc.,'},
        {t:250,s:''},{t:500,s:' Main Processor    : 80386DX             Base Memory Size  : 640 KB'},
        {t:800,s:' Numeric Processor : None                Ext. Memory Size   : 7168 KB'},
        {t:1100,s:' Floppy Drive A:   1.44 MB, 3"       Hard Disk C: Type   : 47'},
        {t:1400,s:' Floppy Drive B:   360 KB, 5"        Hard Disk D: Type   : None'},
        {t:1700,s:' Display Type      : VGA/PGA/EGA        Serial Port(s)     : 3F8,2F8'},
        {t:2000,s:' AMIBIOS Date      : 06/06/92           Parallel Port(s)   : 378'},
        {t:2400,s:''},{t:2600,s:'64KB CACHE MEMORY'},{t:3200,s:'Starting MS-DOS...'},
        {t:4200,s:''},{t:4400,s:'C:\\>REM C:\\DOS\\SMARTDRV.EXE'},{t:4800,s:'C:\\>ver'},{t:5200,s:'MS-DOS Version 6.00'},{t:5600,s:''}
    ]; steps.forEach(step=>bootTimers.push(setTimeout(()=>printLine(step.s),step.t))); bootTimers.push(setTimeout(()=>{bootDone=true; setPrompt();},6000)); };
    runBoot();
    // Load profile for CV/skills commands
    fetch('../data/profile.json').then(r=>r.ok?r.json():null).then(p=>{ window.__cv_profile=p; }).catch(()=>{});

    // small markdown loader + renderer -> converts basic markdown to plain-text lines
    const renderMarkdownToLines = (mdText)=>{
        return mdText.split('\n').map(line=>{
            if(!line) return '';
            // headings: make H1 uppercase, others indented
            const h = line.match(/^(#{1,6})\s+(.*)$/);
            if(h){ const lvl=h[1].length; const text=h[2]; return lvl===1?text.toUpperCase():('  '+text); }
            // unordered list
            if(/^\s*[-*+]\s+/.test(line)) return '  * '+line.replace(/^\s*[-*+]\s+/,'');
            // numbered list
            if(/^\s*\d+\.\s+/.test(line)) return '  '+line.replace(/^\s*\d+\.\s+/,'');
            // inline links [text](url) -> text (url)
            line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1 ($2)');
            // codeblocks (indented or fenced) - leave as-is but trim
            return line.replace(/\t/g,'    ');
        });
    };

    const fetchAndPrintMarkdown = (path, fallback)=>{
        fetch(path).then(r=>{
            if(!r.ok) throw new Error('no-file');
            return r.text();
        }).then(text=>{
            const lines = renderMarkdownToLines(text);
            lines.forEach(l=>printLine(l));
        }).catch(()=>{
            if(typeof fallback==='function') fallback(); else printLine(fallback||'Unable to load file');
        });
    };

    // command processor extracted so mobile input can reuse it
    const handleCommand = (cmdRaw)=>{
        const cmd = (cmdRaw||'').trim().toLowerCase();
        if(cmd==='ver'){ printLine('MS-DOS Version 6.00'); }
        else if(cmd==='dir'||cmd==='dir.exe'){
            printLine(' Volume in drive C is PARADOX'); printLine(' Volume Serial Number is 42A7-1987'); printLine(' Directory of C:\\'); const now=new Date(); const pad=n=>n.toString().padStart(2,'0'); const dateStr=`${pad(now.getMonth()+1)}-${pad(now.getDate())}-${now.getFullYear().toString().slice(-2)}`; printLine('');
            printLine(`${dateStr}  12:00p            27,648 DIR.EXE`); printLine(`${dateStr}  12:00p            32,768 SKILLS.EXE`); printLine(`${dateStr}  12:00p            64,512 CV.EXE`); printLine(`${dateStr}  12:00p           393,216 DOOM.EXE`);
            printLine('               5 File(s)        518,144 bytes'); printLine('               0 Dir(s)   12,345,678 bytes free');
        }
        else if(cmd==='cv'||cmd==='cv.exe'){
            // prefer a markdown file for richer CV content; fallback to JSON-based summary
            fetchAndPrintMarkdown('../data/cv.md', ()=>{
                const prof=window.__cv_profile; if(!prof){ printLine('Unable to load profile data'); } else { printLine('--- CV SUMMARY ---'); printLine(prof.name||''); if(prof.headline) printLine(prof.headline); if(prof.summary) printLine(prof.summary.replace(/\n+/g,' ')); if(Array.isArray(prof.experience)&&prof.experience.length){ printLine(''); printLine('EXPERIENCE:'); prof.experience.slice(0,5).forEach(c=>{ if(c.company) printLine(' '+c.company); (c.roles||[]).slice(0,2).forEach(r=>{ const timeframe=[r.start||'', r.end||'Present'].filter(Boolean).join(' - '); printLine(`   ${r.title||''} (${timeframe})`); (r.highlights||[]).slice(0,2).forEach(h=>printLine('     * '+h)); }); }); }
                if(prof.skills){ printLine(''); printLine('SKILLS: '+prof.skills.slice(0,20).join(', ')); } if(prof.contact&&prof.contact.email){ printLine('CONTACT: '+prof.contact.email); } printLine('--- END CV ---'); }
            });
        }
        else if(cmd==='skills'||cmd==='skills.exe'){
            fetchAndPrintMarkdown('../data/skills.md', ()=>{
                const prof=window.__cv_profile; if(!prof||!Array.isArray(prof.skills)||!prof.skills.length){ printLine('No skills data loaded'); } else { printLine('--- SKILLS ---'); prof.skills.forEach(s=>printLine(' '+s)); printLine('--- END SKILLS ---'); }
            });
        }
        else if(cmd==='doom'||cmd==='doom.exe'){
            printLine('Launching DOOM (open in new tab)...'); window.open('https://diekmann.github.io/wasm-fizzbuzz/doom/','_blank','noopener');
        }
        else if(cmd==='help'){
            fetchAndPrintMarkdown('../data/help.md', ()=>{ printLine('Commands: VER, DIR, CV.EXE, SKILLS.EXE, DOOM.EXE, CLS, HELP, EXIT'); });
        }
        else if(cmd==='cls'){ screen.innerHTML=''; }
        else if(cmd==='exit'){ /* stays in DOS theme, but could hide screen if desired */ }
        else if(cmd){ printLine('Bad command or file name'); }
        setPrompt();
    };

    document.addEventListener('keydown',e=>{
        if(!screen) return;
    if(!bootDone){ clearBoot(); printLine('...'); printLine('C:\\>ver'); printLine('MS-DOS Version 6.22'); bootDone=true; setPrompt(); return; }
        const key=e.key;
        if(key==='Enter'){
            const last=screen.lastElementChild; const cmd=inputBuffer.trim().toLowerCase(); last.innerHTML='C:\\>'+inputBuffer; inputBuffer='';
            handleCommand(cmd);
            e.preventDefault();
    } else if(key==='Backspace'){ inputBuffer=inputBuffer.slice(0,-1); const last=screen.lastElementChild; if(last) last.innerHTML='C:\\>'+inputBuffer+'<span class="dos-cursor">_</span>'; e.preventDefault(); }
    else if(key.length===1 && !e.ctrlKey && !e.metaKey){ inputBuffer+=key; const last=screen.lastElementChild; if(last) last.innerHTML='C:\\>'+inputBuffer+'<span class="dos-cursor">_</span>'; e.preventDefault(); }
    });

    // Mobile support: visible text input on touch devices that summons the virtual keyboard
    try{
        const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints>0;
        if(isTouchDevice){
            console.log('dos: touch device detected, enabling mobile keyboard helper');
            // inject CSS to ensure the helper UI is visible on all devices/browsers
            try{
                const style = document.createElement('style');
                style.id = 'dos-mobile-helper-style';
                style.textContent = `
                    #openKeyboardBtn{position:fixed; right:12px; bottom:64px; z-index:2147483647; width:48px; height:48px; border-radius:8px; font-size:20px; background:#222; color:#fff; border:none; box-shadow:0 2px 6px rgba(0,0,0,0.3);}
                    #mobileKeyboardInput{position:fixed; left:10px; right:10px; bottom:10px; z-index:2147483646; padding:8px 12px; font-size:18px; border-radius:8px; border:1px solid rgba(0,0,0,0.25); background:#fff; box-sizing:border-box;}
                `;
                (document.head||document.documentElement).appendChild(style);
            }catch(e){console.warn('dos: failed to inject mobile helper styles', e);} 
            const mobileInput = document.createElement('input');
            mobileInput.type = 'text';
            mobileInput.id = 'mobileKeyboardInput';
            mobileInput.autocapitalize = 'off';
            mobileInput.autocorrect = 'off';
            mobileInput.setAttribute('autocomplete','off');
            mobileInput.setAttribute('inputmode','text');
            mobileInput.setAttribute('enterkeyhint','done');
            mobileInput.spellcheck = false;
            // basic inline style so we don't require CSS changes
            Object.assign(mobileInput.style,{
                position: 'fixed',
                left: '10px',
                right: '10px',
                bottom: '10px',
                zIndex: 9999,
                padding: '8px 12px',
                fontSize: '18px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.25)',
                background: 'white',
                boxSizing: 'border-box'
            });
            // For touch devices we'll show the input so the virtual keyboard can be summoned.
            // Some Android browsers don't open the keyboard on passive touch handlers or when
            // the devicePixelRatio/viewport makes the media query false, so prefer touch detection.
            Object.assign(mobileInput.style,{display:'block'});
            document.body.appendChild(mobileInput);

            // Add a visible 'Open keyboard' button to guarantee a direct user gesture
            const kbBtn = document.createElement('button');
            kbBtn.id = 'openKeyboardBtn';
            kbBtn.type = 'button';
            kbBtn.title = 'Open keyboard';
            kbBtn.textContent = '⌨︎';
            Object.assign(kbBtn.style,{
                position:'fixed',
                right:'12px',
                bottom:'64px',
                zIndex:99999,
                width:'48px',
                height:'48px',
                borderRadius:'8px',
                fontSize:'20px',
                background:'#222',
                color:'white',
                border:'none',
                boxShadow:'0 2px 6px rgba(0,0,0,0.3)'
            });
            document.body.appendChild(kbBtn);
            console.log('dos: openKeyboardBtn appended to body');

            const openKeyboard = (ev)=>{
                try{
                    console.log('Attempting to focus mobile input (user gesture)');
                    mobileInput.focus();
                    // Some Android browsers require a short delay
                    setTimeout(()=>{
                        try{ mobileInput.focus(); mobileInput.click(); }catch(e){}
                    },50);
                    // prevent default to keep gesture ownership
                    if(ev && ev.preventDefault) ev.preventDefault();
                }catch(e){ console.warn('focus attempt failed', e); }
            };
            kbBtn.addEventListener('click', openKeyboard, false);
            kbBtn.addEventListener('touchend', openKeyboard, false);
            // reflect input into DOS inputBuffer and screen
            mobileInput.addEventListener('input', ()=>{
                inputBuffer = mobileInput.value;
                const last = screen.lastElementChild;
                if(last) last.innerHTML = 'C:\\>'+inputBuffer+'<span class="dos-cursor">_</span>';
            });

            // handle Enter key on the mobile input
            mobileInput.addEventListener('keydown', (e)=>{
                if(e.key==='Enter'){
                    const last = screen.lastElementChild; last.innerHTML = 'C:\\>'+inputBuffer;
                    const cmd = inputBuffer.trim().toLowerCase(); inputBuffer=''; mobileInput.value='';
                    handleCommand(cmd);
                    // keep focus so user can continue typing
                    setTimeout(()=>mobileInput.focus(),50);
                    e.preventDefault();
                }
            });

            // focus input when user taps the screen to open keyboard quickly.
            // Use touchend/click (non-passive) which works more reliably on Android.
            const focusMobileInput = (ev)=>{
                const target = ev.target;
                if(target && (target.tagName==='INPUT' || target.tagName==='BUTTON' || target.tagName==='A' || target.isContentEditable)) return;
                try{ mobileInput.focus(); }catch(e){}
            };
            document.addEventListener('touchend', focusMobileInput, false);
            document.addEventListener('click', focusMobileInput, false);
        }
    }catch(err){ /* non-critical */ }
})();