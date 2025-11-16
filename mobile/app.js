// Minimal app logic: open windowed apps that load markdown from ../data/*.md
(function(){
  const apps = {
    skills: { title: 'Skills', src: '../data/skills.md' },
    cv: { title: 'CV', src: '../data/cv.md' }
  };

  function mdToHtml(md){
    // Very small markdown subset renderer: headings, lists, paragraphs, links, code blocks
    const lines = md.replace(/^\s+|\s+$/g,'').split(/\r?\n/);
    let out = '';
    let inList = false;
    for(let line of lines){
      if(/^#{1,6}\s+/.test(line)){
        if(inList){ out += '</ul>'; inList=false }
        const m = line.match(/^(#{1,6})\s+(.*)$/);
        const level = m[1].length; const text = m[2];
        out += `<h${level}>${escapeHtml(inline(text))}</h${level}>`;
      } else if(/^[-*]\s+/.test(line)){
        if(!inList){ out += '<ul>'; inList=true }
        const item = line.replace(/^[-*]\s+/, ''); out += `<li>${escapeHtml(inline(item))}</li>`;
      } else if(/^```/.test(line)){
        if(inList){ out += '</ul>'; inList=false }
        // simple codeblock: collect until closing ```
        const parts = md.split(/```/).slice(1);
        if(parts.length>0){ out += '<pre><code>'+escapeHtml(parts[0])+'</code></pre>'; break }
      } else if(line.trim()===''){
        if(inList){ out += '</ul>'; inList=false }
        out += '';
      } else {
        if(inList){ out += '</ul>'; inList=false }
        out += `<p>${escapeHtml(inline(line))}</p>`;
      }
    }
    if(inList) out += '</ul>';
    return out;
  }

  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
  function inline(s){
    // links [text](url) and bold **text** and *italic*
    return s
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  }

  function openApp(name){
    const app = apps[name];
    if(!app) return;
    const win = document.createElement('div'); win.className='window';
    const tb = document.createElement('div'); tb.className='titlebar';
    const t = document.createElement('div'); t.className='title'; t.textContent = app.title;
    const ctrl = document.createElement('div'); ctrl.className='controls';
    const close = document.createElement('button'); close.className='btn'; close.textContent='X';
    close.addEventListener('click', ()=>{ win.remove(); });
    ctrl.appendChild(close); tb.appendChild(t); tb.appendChild(ctrl);
    const content = document.createElement('div'); content.className='content'; content.innerHTML = '<em>Loading…</em>';
    win.appendChild(tb); win.appendChild(content);
    document.getElementById('windows').appendChild(win);

    // fetch markdown
    fetch(app.src).then(r=>{
      if(!r.ok) throw new Error('Could not load');
      return r.text();
    }).then(md => {
      content.innerHTML = mdToHtml(md);
    }).catch(err=>{
      content.innerHTML = '<p><strong>Error</strong> loading app content.</p>';
    });
  }

  // attach icon handlers
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest && ev.target.closest('.icon');
    if(btn){ const app = btn.dataset.app; openApp(app); }
  });

  // accessibility: close windows with Escape
  document.addEventListener('keydown', (ev)=>{ if(ev.key==='Escape'){ const w=document.querySelector('.window'); if(w) w.remove(); } });

})();
