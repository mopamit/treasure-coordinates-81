(() => {
  'use strict';

  const ROUND_COUNT = 3;
  const SHOW_SECONDS = 5;
  const W = 1448, H = 1086;

  // Ten approved treasure positions on the NEW simplified map.
  // x/y are exact pixel positions in the 1448×1086 source image.
  // The accepted descriptions are derived ONLY from the user's approved definitions.
  const TREASURES = [
    {
      id:1, x:289.6, y:760.2, gx:2, gy:3,
      title:'מימין לסלעים שבקצה השמאלי למטה',
      approved:[
        'ליד הסלעים שנמצאים בקצה השמאלי למטה של המפה, מימין לסלעים',
        'מימין לסלעים שבקצה השמאלי התחתון',
        'ליד הסלעים השמאליים התחתונים, בצד ימין שלהם',
        'בקצה השמאלי למטה, מימין לסלעים'
      ]
    },
    {
      id:2, x:434.4, y:651.6, gx:3, gy:4,
      title:'מימין לעץ שבצד שמאל ומעל הסלעים',
      approved:[
        'מימין לעץ שנמצא בצד שמאל של המפה, מעל לסלעים שנמצאים משמאל',
        'מימין לעץ הגדול שבצד שמאל',
        'ליד העץ שבשמאל, בצד ימין שלו, ומעל הסלעים',
        'מעל הסלעים השמאליים ומימין לעץ'
      ]
    },
    {
      id:3, x:289.6, y:325.8, gx:2, gy:7,
      title:'בחלק השמאלי של האגם, מעל העץ',
      approved:[
        'בחלק השמאלי של האגם מעל העץ',
        'בצד שמאל של האגם, מעל העץ',
        'ליד השפה השמאלית של האגם, מעל העץ הגדול',
        'משמאל באגם ומעל העץ'
      ]
    },
    {
      id:4, x:724.0, y:325.8, gx:5, gy:7,
      title:'בחלק הימני של האגם, משמאל לסלעים העליונים',
      approved:[
        'בחלק הימני של האגם משמאל לסלעים הנמצאים בצד ימין למעלה',
        'בצד ימין של האגם ומשמאל לסלעים שבצד ימין למעלה',
        'בין הצד הימני של האגם לבין הסלעים העליונים',
        'ליד החלק הימני של האגם, משמאל לסלעים'
      ]
    },
    {
      id:5, x:868.8, y:543.0, gx:6, gy:5,
      title:'מעל הגשר, בצד ימין של הנהר',
      approved:[
        'מעל הגשר, בצד ימין של הנהר',
        'מעל הגשר ומימין לנהר',
        'בצד ימין של הנהר מעל הגשר',
        'ליד הגשר באלכסון ימינה ולמעלה'
      ]
    },
    {
      id:6, x:724.0, y:543.0, gx:5, gy:5,
      title:'משמאל לגשר, בצד שמאל של הנהר',
      approved:[
        'משמאל לגשר בצד שמאל של הנהר',
        'משמאל לגשר ומשמאל לנהר',
        'באלכסון שמאלה ולמעלה מהגשר',
        'מעל ומשמאל לגשר בצד השמאלי של הנהר'
      ]
    },
    {
      id:7, x:1013.6, y:651.6, gx:7, gy:4,
      title:'בשפך הנהר בצד ימין, מתחת לגשר',
      approved:[
        'בשפך הנהר או הנחל בצד ימין, מתחת לגשר בצד ימין',
        'ליד שפך הנהר שבצד ימין',
        'מתחת לגשר בצד ימין',
        'באזור שבו הנהר נשפך לים בצד ימין'
      ]
    },
    {
      id:8, x:868.8, y:217.2, gx:6, gy:8,
      title:'מתחת לסלעים העליונים ומעל הדקל',
      approved:[
        'מתחת לסלעים בצד הימני למעלה, מעל עץ הדקל ובין הסלעים',
        'מתחת לסלעים הימניים העליונים ומעל הדקל',
        'בין הסלעים שבצד ימין למעלה ומעל עץ הדקל',
        'בצד ימין למעלה, מתחת לסלעים ומעל הדקל'
      ]
    },
    {
      id:9, x:579.2, y:868.8, gx:4, gy:2,
      title:'על המזח',
      approved:[
        'על המזח', 'על המזח עצמו', 'על הרציף', 'על הרציף שבתחתית המפה', 'על קצה המזח'
      ]
    },
    {
      id:10, x:724.0, y:868.8, gx:5, gy:2,
      title:'מימין לסירה',
      approved:[
        'מימין לסירה', 'בצד ימין של הסירה', 'ליד הסירה מימין', 'סמוך לסירה בצד ימין'
      ]
    }
  ];

  const state = { round:0, game:[], phase:'intro', seconds:SHOW_SECONDS, timer:null, attempts:[], descriptions:[] };
  const $ = id => document.getElementById(id);
  const panel = $('panel'), chest = $('treasureChest'), guessMarker = $('guessMarker'), actualMarker = $('actualMarker'), gridLayer = $('gridLayer');

  function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
  function clearTimer(){ if(state.timer) clearInterval(state.timer); state.timer=null; }
  function setAt(el,p){ el.setAttribute('transform',`translate(${p.x} ${p.y})`); }
  function hideMarks(){ chest.classList.add('hidden'); guessMarker.classList.add('hidden'); actualMarker.classList.add('hidden'); $('mapMessage').classList.add('hidden'); }
  function esc(s){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function norm(s){ return String(s||'').toLowerCase().replace(/[״”]/g,'"').replace(/[׳’]/g,"'").replace(/[.,!?;:()\-]/g,' ').replace(/\s+/g,' ').trim(); }
  function has(t,re){ return re.test(t); }

  // Semantic features. These are intentionally broad, but they only refer to objects that exist in the simple map.
  function features(text){
    const t=norm(text);
    return {
      t,
      right:has(t,/מימין|ימינה|בצד ימין|מצד ימין|ימני/),
      left:has(t,/משמאל|שמאלה|בצד שמאל|מצד שמאל|שמאלי/),
      above:has(t,/מעל|למעלה|עליון|בחלק העליון/),
      below:has(t,/מתחת|למטה|תחתון|בחלק התחתון/),
      near:has(t,/ליד|בסמוך|קרוב|סמוך/),
      between:has(t,/בין/),
      edge:has(t,/קצה|בקצה/),
      diagonal:has(t,/אלכסון|באלכסון/),
      lake:has(t,/אגם/),
      river:has(t,/נהר|נחל/),
      mouth:has(t,/שפך|נשפך|נשפכת|יוצא.*לים|יציאה.*לים/),
      bridge:has(t,/גשר/),
      tree:has(t,/עץ/) && !has(t,/דקל/),
      palm:has(t,/דקל/),
      rocks:has(t,/סלע/),
      dock:has(t,/מזח|רציף/),
      boat:has(t,/סירה|ספינה/),
      map:has(t,/מפה/)
    };
  }

  // Scores each of the 10 approved locations. We do NOT invent new landmarks or locations.
  function scoreLocation(id,f){
    let s=0;
    switch(id){
      case 1:
        if(f.rocks) s+=5; if(f.left) s+=2; if(f.below) s+=2; if(f.edge) s+=2; if(f.right) s+=4; if(f.near) s+=2;
        break;
      case 2:
        if(f.tree) s+=4; if(f.left) s+=2; if(f.right) s+=4; if(f.rocks) s+=2; if(f.above) s+=3;
        break;
      case 3:
        if(f.lake) s+=5; if(f.left) s+=4; if(f.above) s+=2; if(f.tree) s+=2;
        break;
      case 4:
        if(f.lake) s+=5; if(f.right) s+=3; if(f.rocks) s+=4; if(f.left) s+=2; if(f.above) s+=2;
        break;
      case 5:
        if(f.bridge) s+=6; if(f.above) s+=5; if(f.river) s+=3; if(f.right) s+=4; if(f.diagonal) s+=1;
        break;
      case 6:
        if(f.bridge) s+=6; if(f.left) s+=5; if(f.river) s+=3; if(f.above) s+=2; if(f.diagonal) s+=3;
        break;
      case 7:
        if(f.river) s+=4; if(f.mouth) s+=6; if(f.bridge) s+=3; if(f.below) s+=4; if(f.right) s+=3;
        break;
      case 8:
        if(f.rocks) s+=5; if(f.right) s+=2; if(f.above) s+=1; if(f.below) s+=4; if(f.palm) s+=6; if(f.between) s+=3;
        break;
      case 9:
        if(f.dock) s+=12; if(has(f.t,/\bעל\b/)) s+=2;
        break;
      case 10:
        if(f.boat) s+=9; if(f.right) s+=6; if(f.near) s+=2;
        break;
    }
    return s;
  }

  function interpret(text){
    const f=features(text);
    const scored=TREASURES.map(p=>({p,score:scoreLocation(p.id,f)})).sort((a,b)=>b.score-a.score);
    const best=scored[0], second=scored[1];
    if(!text.trim() || best.score<5) return {status:'weak',f,scored};
    if(best.score-second.score<2 && best.score<10) return {status:'ambiguous',f,scored};
    return {status:'ok',f,scored,best:best.p};
  }

  function updateStatus(){
    const labels={intro:'פתיחה',show:'זוכרים את המקום',describe:'מתארים במילים',guess:'ממקמים את התיבה',summary:'סיכום',coords:'הפתרון המתמטי'};
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
    clearTimer(); state.phase='intro'; state.round=0; hideMarks(); gridLayer.classList.add('hidden'); gridLayer.innerHTML=''; mapInfo('מוכנים?');
    panel.innerHTML=`
      <h2 class="panel-title">ברוכים הבאים לאי האוצר</h2>
      <p class="panel-lead">בכל סיבוב תופיע תיבה למשך ${SHOW_SECONDS} שניות ותיעלם. לאחר מכן תתארו במילים היכן היא הייתה.</p>
      <div class="instruction-box"><strong>השתמשו במילים:</strong><br>גשר, מזח, סירה, סלע, אגם, נהר, עץ, דקל, ליד, מימין, משמאל, מעל, מתחת, בין, בקצה.</div>
      <button id="startBtn" class="btn btn-primary btn-wide">התחל במשימה</button>`;
    $('startBtn').onclick=startGame; updateStatus();
  }

  function pickBalancedGame(){
    // One location from each kind of spatial situation so that a game never feels repetitive.
    // Group A: edge / fixed objects. Group B: lake / upper area. Group C: bridge / river.
    const groups = [
      [1,2,9,10],
      [3,4,8],
      [5,6,7]
    ];
    return shuffle(groups).map(group => {
      const id = group[Math.floor(Math.random()*group.length)];
      return TREASURES.find(t=>t.id===id);
    });
  }

  function startGame(){ state.game=pickBalancedGame(); state.round=1; state.attempts=[]; state.descriptions=[]; showRound(); }

  function showRound(){
    clearTimer(); hideMarks(); gridLayer.classList.add('hidden'); state.phase='show'; state.seconds=SHOW_SECONDS;
    const target=state.game[state.round-1]; setAt(chest,target); chest.classList.remove('hidden'); mapInfo('התיבה תיעלם בעוד',state.seconds,'שניות');
    panel.innerHTML=`<h2 class="panel-title">סיבוב ${state.round} מתוך ${ROUND_COUNT}</h2><p class="panel-lead">התבוננו היטב במקום שבו נמצאת תיבת האוצר.</p><div class="instruction-box"><strong>השתמשו במילים:</strong><br>גשר, מזח, סירה, סלע, אגם, נהר, עץ, דקל, ליד, מימין, משמאל, מעל, מתחת, בין, בקצה.</div>`;
    updateStatus();
    state.timer=setInterval(()=>{ state.seconds--; mapInfo('התיבה תיעלם בעוד',state.seconds,'שניות'); updateStatus(); if(state.seconds<=0){ clearTimer(); chest.classList.add('hidden'); renderDescribe(''); } },1000);
  }

  function renderDescribe(previous){
    state.phase='describe'; hideMarks(); mapInfo('התיבה נעלמה','','עכשיו מתארים במילים');
    panel.innerHTML=`
      <h2 class="panel-title">היכן הייתה התיבה?</h2>
      <p class="panel-lead">תארו במילים את המקום שבו הופיעה התיבה.</p>
      <div class="instruction-box"><strong>השתמשו במילים:</strong><br>גשר, מזח, סירה, סלע, אגם, נהר, עץ, דקל, ליד, מימין, משמאל, מעל, מתחת, בין, בקצה.</div>
      <label class="textarea-label" for="descriptionInput">התיאור שלכם:</label>
      <textarea id="descriptionInput" class="answer-area" maxlength="260" placeholder="כתבו כאן...">${esc(previous||'')}</textarea>
      <div id="feedback"></div>
      <div class="action-row"><button id="checkBtn" class="btn btn-primary">מקם את התיבה</button></div>`;
    $('checkBtn').onclick=checkDescription; $('descriptionInput').focus(); updateStatus();
  }

  function checkDescription(){
    const input=$('descriptionInput'); const text=input.value.trim(); const result=interpret(text); const fb=$('feedback');
    if(result.status==='weak'){
      fb.innerHTML='<div class="feedback-box warning">לא הצלחתי להבין מספיק את המקום. נסו לציין עצם ברור וגם יחס כמו מימין, משמאל, מעל, מתחת, ליד או בין.</div>';
      return;
    }
    if(result.status==='ambiguous'){
      const a=result.scored[0].p.title, b=result.scored[1].p.title;
      fb.innerHTML=`<div class="feedback-box warning">התיאור עדיין מתאים ליותר ממקום אחד. כרגע אני מתלבט בין:<br><strong>${esc(a)}</strong><br>לבין<br><strong>${esc(b)}</strong><br>הוסיפו עוד פרט קטן.</div>`;
      return;
    }
    state.descriptions[state.round-1]=text;
    state.phase='guess'; hideMarks(); setAt(guessMarker,result.best); guessMarker.classList.remove('hidden'); mapInfo('כך הבנתי את התיאור');
    const target=state.game[state.round-1];
    setAt(chest,result.best); chest.classList.remove('hidden');
    panel.innerHTML=`
      <h2 class="panel-title">האם זה המקום?</h2>
      <p class="panel-lead">האם הסימון שעל המפה הוא המקום שאליו התכוונתם?</p>
      <div class="action-row">
        <button id="yesBtn" class="btn btn-primary">כן, לזה התכוונתי</button>
        <button id="retryBtn" class="btn btn-outline">לא, אנסח מחדש</button>
      </div>`;
    $('retryBtn').onclick=()=>renderDescribe(text);
    $('yesBtn').onclick=()=>{
      hideMarks();
      if(state.round<ROUND_COUNT){ state.round++; showRound(); }
      else renderSummary();
    };
    updateStatus();
  }

  function renderSummary(){
    state.phase='summary'; hideMarks(); mapInfo('סיימתם שלושה סיבובים');
    panel.innerHTML=`
      <h2 class="panel-title">שלוש תיבות — שלושה תיאורים שונים</h2>
      <p class="panel-lead">הצלחנו לתאר מקומות בעזרת האגם, הסלעים, הגשר, העץ, המזח והסירה. אבל כדי להיות מדויקים נדרש לפעמים משפט ארוך.</p>
      <div class="tip-box"><strong>עכשיו נוסיף למפה רשת מספרים.</strong><br>נראה איך לכל אחד משלושת המקומות אפשר לתת כתובת קצרה אחת.</div>
      <button id="coordsBtn" class="btn btn-primary btn-wide">הצג מערכת צירים ואת 3 המקומות</button>`;
    $('coordsBtn').onclick=showCoordinates; updateStatus();
  }

  function gridCoord(p){ return {x:p.gx, y:p.gy}; }
  function showCoordinates(){
    state.phase='coords'; hideMarks(); drawGrid(); gridLayer.classList.remove('hidden');
    drawRoundMarkers();
    mapInfo('אותם 3 מקומות — עכשיו עם כתובת','','מערכת צירים');
    const rows=state.game.map((p,i)=>{
      const c=gridCoord(p);
      const desc=state.descriptions[i] || 'לא נשמר תיאור';
      return `<div class="answer-card">
        <div class="answer-card-head"><span class="round-dot">${i+1}</span><strong>סיבוב ${i+1}</strong><strong class="coord-badge">(${c.x}, ${c.y})</strong></div>
        <div class="answer-line"><span>המקום במפה:</span><b>${esc(p.title)}</b></div>
        <div class="answer-line"><span>התיאור שכתבתם:</span><span>${esc(desc)}</span></div>
      </div>`;
    }).join('');
    panel.innerHTML=`
      <h2 class="panel-title">עכשיו רואים למה צריך מערכת צירים</h2>
      <p class="panel-lead">על המפה מסומנים <strong>1, 2, 3</strong> — אותם המקומות שבהם הופיעה התיבה בשלושת הסיבובים.</p>
      <div class="instruction-box"><strong>איך קוראים זוג סדור?</strong><br>
      קודם קוראים את <b>x</b> — כמה ימינה. אחר כך את <b>y</b> — כמה למעלה.<br>
      לדוגמה: <span dir="ltr"><b>(6, 4)</b></span> פירושו 6 ימינה ו־4 למעלה.</div>
      <div class="answer-list">${rows}</div>
      <div class="tip-box"><strong>המסקנה:</strong> תיאור במילים יכול להיות ארוך או דו־משמעי. זוג סדור נותן לאותו מקום כתובת אחת קצרה ומדויקת.</div>
      <button id="againBtn" class="btn btn-primary btn-wide">משחק חדש</button>`;
    $('againBtn').onclick=startGame; updateStatus();
  }

  function drawRoundMarkers(){
    const ns='http://www.w3.org/2000/svg';
    state.game.forEach((p,i)=>{
      const g=document.createElementNS(ns,'g');
      g.setAttribute('transform',`translate(${p.x} ${p.y})`);
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

  function drawGrid(){
    gridLayer.innerHTML=''; const ns='http://www.w3.org/2000/svg';
    for(let i=0;i<=10;i++){
      const x=i*W/10, y=i*H/10;
      const vl=document.createElementNS(ns,'line'); vl.setAttribute('x1',x);vl.setAttribute('x2',x);vl.setAttribute('y1',0);vl.setAttribute('y2',H);vl.setAttribute('stroke','#17365e');vl.setAttribute('stroke-width',i===0||i===10?'4':'2');vl.setAttribute('opacity',i===0||i===10?'.9':'.38'); gridLayer.appendChild(vl);
      const hl=document.createElementNS(ns,'line'); hl.setAttribute('x1',0);hl.setAttribute('x2',W);hl.setAttribute('y1',y);hl.setAttribute('y2',y);hl.setAttribute('stroke','#17365e');hl.setAttribute('stroke-width',i===0||i===10?'4':'2');hl.setAttribute('opacity',i===0||i===10?'.9':'.38'); gridLayer.appendChild(hl);
      if(i<10){
        const tx=document.createElementNS(ns,'text'); tx.setAttribute('x',x+8);tx.setAttribute('y',H-12);tx.setAttribute('font-size','24');tx.setAttribute('font-weight','700');tx.setAttribute('fill','#17365e');tx.textContent=i;gridLayer.appendChild(tx);
        const ty=document.createElementNS(ns,'text'); ty.setAttribute('x','10');ty.setAttribute('y',H-y-8);ty.setAttribute('font-size','24');ty.setAttribute('font-weight','700');ty.setAttribute('fill','#17365e');ty.textContent=i;gridLayer.appendChild(ty);
      }
    }
  }

  $('newGameBtn').onclick=startGame;
  $('resetBtn').onclick=renderIntro;
  renderIntro();
})();
