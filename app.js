(() => {
  'use strict';

  const ROUND_COUNT = 3;
  const SHOW_SECONDS = 5;
  const W = 1448, H = 1086;

  // One immutable coordinate source for preview, verification and final grid.
  const TREASURES = [
  {
    "id": 1,
    "gx": 3,
    "gy": 3,
    "title": "מימין לסלעים התחתונים ומשמאל למזח",
    "approved": [
      "מימין לסלעים התחתונים ומשמאל למזח",
      "בין הסלעים התחתונים למזח"
    ]
  },
  {
    "id": 2,
    "gx": 3,
    "gy": 4,
    "title": "מימין לעץ ומעל הסלעים התחתונים",
    "approved": [
      "מימין לעץ ומעל הסלעים התחתונים",
      "מימין לעץ הגדול ומעל הסלעים",
      "מעל הסלעים התחתונים ומימין לעץ"
    ]
  },
  {
    "id": 3,
    "gx": 2,
    "gy": 6,
    "title": "מעל העץ ומשמאל לאגם",
    "approved": [
      "מעל העץ ומשמאל לאגם",
      "משמאל לאגם ומעל העץ"
    ]
  },
  {
    "id": 4,
    "gx": 5,
    "gy": 7,
    "title": "בחלק הימני של האגם מתחת לסלעים העליונים",
    "approved": [
      "בחלק הימני של האגם מתחת לסלעים העליונים",
      "בצד ימין של האגם",
      "בחלק הימני של האגם"
    ]
  },
  {
    "id": 5,
    "gx": 7,
    "gy": 6,
    "title": "מימין לנהר ומעל הגשר",
    "approved": [
      "מימין לנהר ומעל הגשר",
      "מעל הגשר ומימין לנהר"
    ]
  },
  {
    "id": 6,
    "gx": 5,
    "gy": 5,
    "title": "משמאל לגשר ומתחת לאגם",
    "approved": [
      "משמאל לגשר ומתחת לאגם",
      "מתחת לאגם ומשמאל לגשר"
    ]
  },
  {
    "id": 7,
    "gx": 8,
    "gy": 3,
    "title": "מימין לשפך הנהר ומתחת לסלעים הימניים",
    "approved": [
      "מימין לשפך הנהר ומתחת לסלעים הימניים",
      "מימין לשפך הנחל"
    ]
  },
  {
    "id": 8,
    "gx": 7,
    "gy": 7,
    "title": "בין הסלעים העליונים לדקל",
    "approved": [
      "בין הסלעים העליונים לדקל",
      "מימין לסלעים העליונים ומשמאל לדקל"
    ]
  },
  {
    "id": 9,
    "gx": 3,
    "gy": 2,
    "title": "משמאל למזח ומתחת לסלעים התחתונים",
    "approved": [
      "משמאל למזח ומתחת לסלעים התחתונים",
      "מתחת לסלעים התחתונים ומשמאל למזח"
    ]
  },
  {
    "id": 10,
    "gx": 6,
    "gy": 2,
    "title": "מימין לסירה ומשמאל לשפך הנהר",
    "approved": [
      "מימין לסירה ומשמאל לשפך הנהר",
      "בין הסירה לשפך הנהר"
    ]
  },
  {
    "id": 11,
    "gx": 4,
    "gy": 5,
    "title": "מתחת לאגם ומימין לעץ",
    "approved": [
      "מתחת לאגם ומימין לעץ",
      "מימין לעץ ומתחת לאגם"
    ]
  },
  {
    "id": 12,
    "gx": 8,
    "gy": 5,
    "title": "מתחת לדקל ומימין לגשר",
    "approved": [
      "מתחת לדקל ומימין לגשר",
      "מימין לגשר ומתחת לדקל"
    ]
  },
  {
    "id": 13,
    "gx": 9,
    "gy": 6,
    "title": "מימין לדקל ומעל הסלעים הימניים",
    "approved": [
      "מימין לדקל ומעל הסלעים הימניים",
      "מעל הסלעים הימניים ומימין לדקל"
    ]
  },
  {
    "id": 14,
    "gx": 6,
    "gy": 9,
    "title": "מעל הסלעים העליונים ליד החוף",
    "approved": [
      "מעל הסלעים העליונים ליד החוף",
      "מעל הסלעים שלמעלה ליד החוף"
    ]
  },
  {
    "id": 15,
    "gx": 2,
    "gy": 4,
    "title": "בין העץ לסלעים התחתונים",
    "approved": [
      "בין העץ לסלעים התחתונים",
      "מתחת לעץ ומעל הסלעים התחתונים"
    ]
  }
].map(p => Object.freeze({...p, x:p.gx*W/10, y:(10-p.gy)*H/10}));

  const state = { round:0, game:[], phase:'intro', seconds:SHOW_SECONDS, timer:null, attempts:[], descriptions:[], confirmed:[], guesses:[], shown:[], sound:true };
  const $ = id => document.getElementById(id);
  const panel = $('panel'), chest = $('treasureChest'), guessMarker = $('guessMarker'), actualMarker = $('actualMarker'), gridLayer = $('gridLayer');

  function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
  function clearTimer(){ if(state.timer) clearInterval(state.timer); state.timer=null; }
  function setAt(el,p){ el.setAttribute('transform',`translate(${p.x} ${p.y})`); }
  function hideMarks(){ drawCandidates(); chest.classList.add('hidden'); guessMarker.classList.add('hidden'); actualMarker.classList.add('hidden'); $('mapMessage').classList.add('hidden'); }
  function esc(s){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function norm(s){ return String(s||'').toLowerCase().replace(/[״”]/g,'"').replace(/[׳’]/g,"'").replace(/[.,!?;:()\-]/g,' ').replace(/\s+/g,' ').trim(); }
  function has(t,re){ return re.test(t); }

  // Interpret relations relative to visible landmarks, independently of the hidden target.
  const LANDMARKS = [
    {name:'גשר', re:/גשר/, points:[[890,555]]},
    {name:'אגם', re:/אגם/, points:[[480,310],[650,350]]},
    {name:'סלעים', re:/סלע/, points:[[275,725],[790,130],[895,210],[1290,595]]},
    {name:'דקל', re:/דקל/, points:[[1190,380]]},
    {name:'עץ', re:/עץ/, points:[[305,535]]},
    {name:'מזח', re:/מזח|רציף/, points:[[550,850]]},
    {name:'סירה', re:/סירה|ספינה/, points:[[660,905]]},
    {name:'נהר', re:/נהר|נחל/, points:[[805,465],[945,650],[1010,765]]},
    {name:'שביל', re:/שביל|דרך/, points:[[430,675],[690,600],[1120,590]]},
    {name:'חוף', re:/חוף|חול/, points:[[155,405],[370,775],[1150,825],[1330,455]]},
    {name:'גדה', re:/גדה|גדת/, points:[[740,440],[880,460],[900,690],[1030,680]]}
  ];
  function descriptionKey(text){
    return norm(text).replace(/^(?:תיבת האוצר|התיבה|האוצר) (?:נמצאת|נמצא|הייתה|היה) /,'')
      .replace(/עץ הדקל/g,'דקל').replace(/העץ הגדול/g,'העץ').replace(/נחל/g,'נהר')
      .replace(/(?:בצד|מצד) ימין של /g,'מימין ל').replace(/(?:בצד|מצד) שמאל של /g,'משמאל ל')
      .replace(/לבין /g,'ל').replace(/ו(?=מימין|משמאל|מעל|מתחת)/g,'')
      .split(/\s+(?=מימין|משמאל|מעל|מתחת)/).map(x=>x.trim()).sort().join(' | ');
  }
  function interpret(text){
    const t=norm(text);
    if(!t || /(?:^|\s)לא(?:\s|$)/.test(t)) return {status:'weak'};
    const exact=TREASURES.find(p=>p.approved.some(d=>descriptionKey(d)===descriptionKey(t)));
    if(exact) return {status:'ok',best:exact};
    let landmarks=LANDMARKS.filter(l=>l.re.test(t));
    if(/דקל/.test(t)) landmarks=landmarks.filter(l=>l.name!=='עץ');
    if(!landmarks.length) return {status:'weak'};
    const candidates=[];
    for(const l of landmarks){
      let points=l.points;
      if(l.name==='סלעים'){
        const qualifier=t.slice(t.search(l.re));
        if(/עליונ|למעלה/.test(qualifier)) points=points.filter(p=>p[1]<300);
        else if(/תחתונ|למטה|שמאל/.test(qualifier)) points=points.filter(p=>p[0]<400);
        else if(/ימינ|ימין/.test(qualifier)) points=points.filter(p=>p[0]>1000);
      }
      // Bind a direction to the noun following it, not to every noun in the sentence.
      const before=t.slice(0,t.search(l.re)).split(/[,،]| וגם | ומעל | ומתחת /).pop();
      let dx=0,dy=0;
      if(/מימין|ימינה|מצד ימין|בצד ימין/.test(before)) dx=110;
      if(/משמאל|שמאלה|מצד שמאל|בצד שמאל/.test(before)) dx=-110;
      if(/מעל/.test(before)) dy=-110;
      if(/מתחת/.test(before)) dy=110;
      if(l.name==='אגם'){
        if(/בתוך|באמצע|במרכז/.test(t)) points=[[560,325]];
        if(/שמאל/.test(t)) points=[points[0]];
        if(/ימין|ימני/.test(t)) points=[[650,350]];
      }
      if(l.name==='נהר' && /שפך|נשפך/.test(t)) points=[[1010,765]];
      for(const [x,y] of points) candidates.push({x:Math.max(45,Math.min(W-45,x+dx)),y:Math.max(45,Math.min(H-45,y+dy)),title:l.name});
    }
    if(/בין/.test(t) && landmarks.length===2 && candidates.length===2){
      return {status:'ok',best:{x:(candidates[0].x+candidates[1].x)/2,y:(candidates[0].y+candidates[1].y)/2}};
    }
    // Multiple references need agreement; do not silently ignore a conflicting clause.
    if(landmarks.length>1) return {status:'ambiguous',candidates:candidates.slice(0,4)};
    if(candidates.length!==1) return {status:'ambiguous',candidates:candidates.slice(0,4)};
    return {status:'ok',best:candidates[0]};
  }
  const WORD_BANK='גשר, מזח, סירה, סלע, אגם, נהר, נחל, עץ, דקל, חוף, גדה, שביל, ליד, מימין, משמאל, מעל, מתחת, בין, בקצה.';
  function hintMarkup(){ return `<div id="hintArea" ${state.attempts[state.round-1]?.length?'':'class="hidden"'}><button id="hintBtn" class="btn btn-secondary" aria-expanded="false" aria-controls="wordBank">רמז</button><div id="wordBank" class="instruction-box hidden">אפשר להיעזר במילים: ${WORD_BANK}</div></div>`; }
  function bindHint(){ $('hintBtn').onclick=()=>{const open=$('wordBank').classList.toggle('hidden');$('hintBtn').setAttribute('aria-expanded',String(!open));}; }
  function drawCandidates(points=[]){
    $('candidateLayer').innerHTML=points.map((p,i)=>`<g transform="translate(${p.x} ${p.y})"><circle r="30" fill="white" stroke="#832058" stroke-width="4"/><text text-anchor="middle" y="10" font-size="30" fill="#832058">?</text></g>`).join('');
  }
  function finishRound(confirmed){
    state.confirmed[state.round-1]=confirmed;
    hideMarks();
    if(state.round<ROUND_COUNT){state.round++;showRound();}else renderSummary();
  }

  function updateStatus(){
    $('mapStage').classList.toggle('coordinates-visible',state.phase==='coords');
    const labels={intro:'פתיחה',show:'זוכרים את המקום',describe:'מתארים במילים',guess:'ממקמים את התיבה',summary:'סיכום',coords:'הפתרון המתמטי'};
    $('helpBtn').disabled=state.phase==='show';
    $('stageLabel').textContent=labels[state.phase]||'משחק';
    $('roundCounter').textContent=state.round?`${state.round}/${ROUND_COUNT}`:`0/${ROUND_COUNT}`;
    $('timerLabel').textContent=state.phase==='show'?`${state.seconds} שנ׳`:'—';
    const base=Math.max(0,state.round-1)*25;
    const pct={intro:0,show:base+8,describe:base+14,guess:base+22,summary:82,coords:100}[state.phase]??0;
    $('progressBar').style.width=pct+'%';
  }

  function mapInfo(text,num='',small=''){ $('mapInfoText').textContent=text; $('mapInfoNumber').textContent=num; $('mapInfoSmall').textContent=small; }
  function showMessage(text){ $('mapMessage').textContent=text; $('mapMessage').classList.remove('hidden'); }

  function renderIntro(){
    stopSound();state.guesses=[];state.shown=[];clearTimer(); state.phase='intro'; state.round=0; state.attempts=[]; state.descriptions=[]; state.confirmed=[]; hideMarks(); gridLayer.classList.add('hidden'); gridLayer.innerHTML=''; mapInfo('מוכנים?');
    panel.innerHTML=`
      <h2 class="panel-title">ברוכים הבאים לאי האוצר</h2>
      <p class="panel-lead">בכל סיבוב תופיע תיבה למשך ${SHOW_SECONDS} שניות ותיעלם. לאחר מכן עליכם לתאר במילים היכן התיבה הייתה.</p>
      
      <button id="startBtn" class="btn btn-primary btn-wide">התחל במשימה</button>`;
    $('startBtn').onclick=startGame; updateStatus();
  }

  let remaining=[];
  try { const saved=JSON.parse(localStorage.getItem('treasure-pool-v2')||'[]');
    if(Array.isArray(saved)&&new Set(saved).size===saved.length&&saved.every(id=>TREASURES.some(p=>p.id===id))) remaining=saved;
  } catch {}
  function pickBalancedGame(){
    if(remaining.length<ROUND_COUNT) remaining=shuffle(TREASURES.map(p=>p.id));
    const ids=remaining.splice(0,ROUND_COUNT);
    try {localStorage.setItem('treasure-pool-v2',JSON.stringify(remaining));}catch{}
    return ids.map(id=>TREASURES.find(p=>p.id===id));
  }
  const sounds={
    success:new Audio('assets/prisma/'+encodeURIComponent('Short_cheerful_chime_#1-1790234353826.mp3')),
    error:new Audio('assets/prisma/'+encodeURIComponent('Descending_two-note__#2-1790234655673.mp3')),
    finish:new Audio('assets/prisma/'+encodeURIComponent('Happy_orchestral_fin_#1-1790234881964.mp3'))
  };
  function stopSound(){Object.values(sounds).forEach(a=>{a.pause();a.currentTime=0;});}
  function playSound(kind){stopSound();if(!state.sound)return;const a=sounds[kind];a.volume=.35;a.play().catch(()=>{});}
  function isCorrect(guess,target){return Math.hypot((guess.x-target.x)/(W/10),(guess.y-target.y)/(H/10))<=.48;}
  function toggleSound(){state.sound=!state.sound;stopSound();$('soundBtn').setAttribute('aria-pressed',String(state.sound));$('soundIcon').src=`assets/prisma/${state.sound?'speaker':'mute'}_circle.svg`;$('soundText').textContent=state.sound?'צליל פעיל':'ללא צליל';}

  function startGame(){ stopSound();state.guesses=[];state.shown=[]; state.game=pickBalancedGame(); state.round=1; state.attempts=[]; state.descriptions=[]; state.confirmed=[]; showRound(); }

  function showRound(){
    stopSound();clearTimer(); hideMarks(); gridLayer.classList.add('hidden'); state.phase='show'; state.seconds=SHOW_SECONDS;
    const target=state.game[state.round-1]; state.shown[state.round-1]=Object.freeze({...target});setAt(chest,target); chest.classList.remove('hidden'); mapInfo('התיבה תיעלם בעוד',state.seconds,'שניות');
    panel.innerHTML=`<h2 class="panel-title">סיבוב ${state.round} מתוך ${ROUND_COUNT}</h2><p class="panel-lead">התבוננו היטב במקום שבו נמצאת תיבת האוצר.</p>`;
    updateStatus();
    state.timer=setInterval(()=>{ state.seconds--; mapInfo('התיבה תיעלם בעוד',state.seconds,'שניות'); updateStatus(); if(state.seconds<=0){ clearTimer(); chest.classList.add('hidden'); renderDescribe(''); } },1000);
  }

  function renderDescribe(previous){
    stopSound();state.phase='describe'; hideMarks(); mapInfo('התיבה נעלמה','','עכשיו מתארים במילים');
    panel.innerHTML=`
      <h2 class="panel-title">היכן הייתה תיבת האוצר?</h2>
      <p class="panel-lead">תארו במילים את המקום שבו הופיעה התיבה.</p>
      
      <label class="textarea-label" for="descriptionInput">התיאור שלכם:</label>
      <textarea id="descriptionInput" class="answer-area" maxlength="260" placeholder="כתבו כאן...">${esc(previous||'')}</textarea>
      <div id="feedback" role="status" aria-live="polite"></div>${hintMarkup()}
      <div class="action-row"><button id="checkBtn" class="btn btn-primary">מקם את התיבה</button><button id="skipBtn" class="btn btn-outline">לא הצלחתי, ממשיכים</button></div>`;
    bindHint(); $('skipBtn').onclick=()=>finishRound(false); $('checkBtn').onclick=checkDescription; $('descriptionInput').focus(); updateStatus();
  }

  function checkDescription(){
    const input=$('descriptionInput'); const text=input.value.trim(); const result=interpret(text); const fb=$('feedback');
    if(!text){fb.innerHTML='<div class="feedback-box warning">כתבו תיאור במילים לפני המיקום.</div>';return;}
    (state.attempts[state.round-1] ||= []).push(text);
    state.descriptions[state.round-1]=text;
    $('hintArea').classList.remove('hidden');
    drawCandidates();
    if(result.status!=='ok'){
      playSound('error');drawCandidates(result.candidates);
      fb.innerHTML=`<div class="feedback-box warning">עדיין לא הבנתי בדיוק. נסו לדייק: באיזה חלק של העצם, או באיזה צד שלו? ${result.candidates?.length?'סימני השאלה מציינים מקומות אפשריים בלבד. אפשר להוסיף מילים כדי להבהיר.':''}<br>אפשר להיעזר בכפתור רמז. בכל שלב אפשר ללחוץ על איפוס כדי להתחיל מההתחלה.</div>`;
      return;
    }
    state.phase='guess'; hideMarks();
    const guess={...result.best};state.guesses[state.round-1]=guess;
    const correct=isCorrect(guess,state.shown[state.round-1]);
    state.confirmed[state.round-1]=correct;
    setAt(chest,guess);chest.classList.remove('hidden');
    setAt(guessMarker,guess);guessMarker.classList.remove('hidden');
    mapInfo(correct?'המיקום מתאים!':'המיקום עדיין לא מתאים');
    playSound(correct?'success':'error');
    panel.innerHTML=`
      <h2 class="panel-title">${correct?'מצאתם את המקום!':'עוד ניסיון?'}</h2>
      <div class="feedback-box ${correct?'':'warning'}" role="status"><strong>${correct?'הצלחה':'המיקום שונה ממקום התיבה המקורי'}</strong><br>${correct?'המחשב מיקם את התיבה קרוב מספיק למקום שבו הופיעה.':'כך המחשב הבין את התיאור. אם זו לא כוונתכם, נסו להוסיף כיוון או עצם נוסף. אפשר גם לנסות להיזכר מחדש במקום התיבה.'}</div>
      <p class="panel-lead">התיאור שלכם: ${esc(text)}</p>
      <div class="action-row">${correct?'<button id="nextBtn" class="btn btn-primary">לסיבוב הבא</button>':'<button id="retryBtn" class="btn btn-primary">אנסה לתאר שוב</button><button id="skipBtn" class="btn btn-outline">סיום הסיבוב ללא הצלחה</button>'}</div>`;
    if(correct) $('nextBtn').onclick=()=>finishRound(true);
    else {$('retryBtn').onclick=()=>renderDescribe(text);$('skipBtn').onclick=()=>finishRound(false);}
    updateStatus();
  }

  function renderSummary(){
    state.phase='summary'; playSound('finish');hideMarks(); mapInfo('סיימתם שלושה סיבובים');
    const success=state.confirmed.filter(Boolean).length;
    const words=state.attempts.flat().reduce((n,t)=>n+t.split(/\s+/).filter(Boolean).length,0);
    panel.innerHTML=`
      <h2 class="panel-title">שלוש תיבות — שלושה תיאורים שונים</h2>
      <p class="panel-lead">הצלחתם למקם את התיבה ב־${success} מתוך ${ROUND_COUNT} סיבובים.</p>
      <p>בסך הכול שלחתם ${state.attempts.flat().length} תיאורים והשתמשתם ב־${words} מילים, כולל הניסוחים החוזרים.</p>
      <div class="action-row"><button id="tryAgainBtn" class="btn btn-outline">רוצים לנסות שוב?</button><button id="coordsBtn" class="btn btn-primary">רוצים להכיר דרך נוספת לתאר מקום?</button></div>`;
    $('tryAgainBtn').onclick=startGame;
    $('coordsBtn').onclick=showCoordinates; updateStatus();
  }

  function gridCoord(p){ return {x:p.gx, y:p.gy}; }
  function showCoordinates(){
    stopSound();state.phase='coords'; hideMarks(); drawGrid(); gridLayer.classList.remove('hidden');
    drawRoundMarkers();
    mapInfo('אותם 3 מקומות — עכשיו עם כתובת','','מערכת צירים');
    const rows=state.shown.map((p,i)=>{
      const c=gridCoord(p);
      const desc=state.descriptions[i] || 'לא נשמר תיאור';
      return `<div class="answer-card" data-round="${i+1}">
        <div class="answer-card-head"><span class="round-dot">${i+1}</span><strong>סיבוב ${i+1}</strong><strong class="coord-badge">(${c.x}, ${c.y})</strong></div>
        <button class="btn btn-outline replay-btn" data-round="${i}">הצגת התיבה מסיבוב ${i+1}</button><div class="answer-line"><span>המקום המקורי:</span><b>${esc(p.title)}</b></div>
        <div class="answer-line"><span>ניסיונות:</span><span>${state.attempts[i]?.length||0} · ${state.confirmed[i]?'הצלחה':'ללא הצלחה'}</span></div><div class="answer-line"><span>התיאור האחרון:</span><span>${esc(desc)}</span></div>
      </div>`;
    }).join('');
    panel.innerHTML=`
      <h2 class="panel-title">הוספנו למפה מערכת צירים</h2>
      <p class="panel-lead">על המפה מסומנים <strong>1, 2, 3</strong> — אלה המקומות המקוריים שבהם הופיעה התיבה. לחצו על סיבוב כדי לראות שוב את התיבה באותו מקום בדיוק.</p>
      <div class="instruction-box"><strong>איך מתארים מקום בעזרת שני מספרים?</strong><br>
      קודם קוראים את <b>x</b> — כמה ימינה. אחר כך את <b>y</b> — כמה למעלה.<br>
      לדוגמה: <span dir="ltr"><b>(6, 4)</b></span> פירושו 6 ימינה ו־4 למעלה.</div>
      <p id="replayStatus" role="status" class="small-note">בחרו סיבוב להצגת התיבה המקורית.</p><label class="compare-toggle"><input id="compareGuesses" type="checkbox"> הצגת הניחוש האחרון בכל סיבוב בקו מקווקו</label><div class="answer-list">${rows}</div>
      <div class="tip-box">תיאור במילים יכול להיות לא מדויק, ארוך או בעל כמה משמעויות. המתמטיקה מאפשרת לנו לתאר מקום בצורה מדויקת בעזרת שני מספרים.</div>
      <button id="againBtn" class="btn btn-primary btn-wide">משחק חדש</button>`;
    $('againBtn').onclick=startGame;
    panel.querySelectorAll('.replay-btn').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.round);setAt(chest,state.shown[i]);chest.classList.remove('hidden');$('replayStatus').textContent=`מוצגת כעת התיבה המקורית מסיבוב ${i+1}`;});
    $('compareGuesses').onchange=()=>{drawGrid();drawRoundMarkers();if($('compareGuesses').checked)drawGuesses();};
    updateStatus();
  }

  function drawRoundMarkers(){
    const ns='http://www.w3.org/2000/svg';
    state.shown.forEach((p,i)=>{
      const g=document.createElementNS(ns,'g');
      g.setAttribute('transform',`translate(${p.x} ${p.y})`);g.setAttribute('data-original-round',String(i+1));
      const circle=document.createElementNS(ns,'circle');
      circle.setAttribute('r','30'); circle.setAttribute('fill','#832058');
      circle.setAttribute('stroke','#fff'); circle.setAttribute('stroke-width','6');
      const txt=document.createElementNS(ns,'text');
      txt.setAttribute('x','0');txt.setAttribute('y','9');txt.setAttribute('text-anchor','middle');
      txt.setAttribute('font-size','28');txt.setAttribute('font-weight','700');txt.setAttribute('fill','#fff');
      txt.textContent=String(i+1);
      g.appendChild(circle); g.appendChild(txt); gridLayer.appendChild(g);
    });
    const ns2=ns;
    const xLab=document.createElementNS(ns2,'text'); xLab.setAttribute('x',W-32);xLab.setAttribute('y',H-28);xLab.setAttribute('font-size','34');xLab.setAttribute('font-weight','700');xLab.setAttribute('fill','#17365e');xLab.textContent='x'; gridLayer.appendChild(xLab);
    const yLab=document.createElementNS(ns2,'text'); yLab.setAttribute('x','22');yLab.setAttribute('y','42');yLab.setAttribute('font-size','34');yLab.setAttribute('font-weight','700');yLab.setAttribute('fill','#17365e');yLab.textContent='y'; gridLayer.appendChild(yLab);
  }

  function drawGuesses(){
    const ns='http://www.w3.org/2000/svg';
    state.guesses.forEach((p,i)=>{
      const g=document.createElementNS(ns,'g');g.setAttribute('data-guess-round',String(i+1));g.setAttribute('transform',`translate(${p.x} ${p.y})`);
      g.innerHTML=`<circle r="43" fill="none" stroke="#a14b26" stroke-width="5" stroke-dasharray="9 6"/><text x="48" y="10" font-size="25" fill="#a14b26">${i+1}?</text>`;gridLayer.appendChild(g);
    });
  }

  function drawGrid(){
    gridLayer.innerHTML=''; const ns='http://www.w3.org/2000/svg';
    for(let i=0;i<=10;i++){
      const x=i*W/10, y=i*H/10;
      const vl=document.createElementNS(ns,'line'); vl.setAttribute('x1',x);vl.setAttribute('x2',x);vl.setAttribute('y1',0);vl.setAttribute('y2',H);vl.setAttribute('stroke','#17365e');vl.setAttribute('stroke-width',i===0?'12':'2');vl.setAttribute('opacity',i===0||i===10?'.9':'.38'); gridLayer.appendChild(vl);
      const hl=document.createElementNS(ns,'line'); hl.setAttribute('x1',0);hl.setAttribute('x2',W);hl.setAttribute('y1',y);hl.setAttribute('y2',y);hl.setAttribute('stroke','#17365e');hl.setAttribute('stroke-width',i===10?'12':'2');hl.setAttribute('opacity',i===0||i===10?'.9':'.38'); gridLayer.appendChild(hl);
      if(i<10){
        const tx=document.createElementNS(ns,'text'); tx.setAttribute('x',x+8);tx.setAttribute('y',H-12);tx.setAttribute('font-size','24');tx.setAttribute('font-weight','700');tx.setAttribute('fill','#17365e');tx.textContent=i;gridLayer.appendChild(tx);
        const ty=document.createElementNS(ns,'text'); ty.setAttribute('x','10');ty.setAttribute('y',H-y-8);ty.setAttribute('font-size','24');ty.setAttribute('font-weight','700');ty.setAttribute('fill','#17365e');ty.textContent=i===0?'':i;gridLayer.appendChild(ty);
      }
    }
  }

  // Keep the chest above both guess circles and the final grid markers.
  $('overlaySvg').appendChild(chest);
  $('soundBtn').onclick=toggleSound;
  $('helpBtn').onclick=()=>{if(state.phase==='show')return;$('helpDialog').showModal();};
  $('closeHelpBtn').onclick=()=>$('helpDialog').close();
  $('newGameBtn').onclick=startGame;
  $('resetBtn').onclick=renderIntro;
  renderIntro();
})();
