const $ = (s)=>document.querySelector(s);
const $$=(s)=>Array.from(document.querySelectorAll(s));
const state={level:null,mode:null,round:0,totalRounds:5,score:0,current:null};

const BANK={
 "4-6":{
  find:[{word:"apple",emoji:"🍎",heb:"תפוח"},{word:"cat",emoji:"🐱",heb:"חתול"},{word:"ball",emoji:"⚽",heb:"כדור"},{word:"car",emoji:"🚗",heb:"אוטו"},{word:"book",emoji:"📘",heb:"ספר"},{word:"sun",emoji:"☀️",heb:"שמש"}],
  build:[{sentence:"I like apples",tokens:["I","like","apples"]},{sentence:"This is a cat",tokens:["This","is","a","cat"]},{sentence:"I have a ball",tokens:["I","have","a","ball"]}],
  listen:[{text:"hello"},{text:"thank you"},{text:"good morning"},{text:"cat"},{text:"apple"}]
 },
 "7-10":{
  find:[{word:"library",emoji:"📚",heb:"ספרייה"},{word:"pencil",emoji:"✏️",heb:"עיפרון"},{word:"teacher",emoji:"🧑‍🏫",heb:"מורה"},{word:"sandwich",emoji:"🥪",heb:"כריך"},{word:"umbrella",emoji:"☂️",heb:"מטרייה"},{word:"planet",emoji:"🪐",heb:"כוכב לכת"}],
  build:[{sentence:"I am going to school",tokens:["I","am","going","to","school"]},{sentence:"She likes playing soccer",tokens:["She","likes","playing","soccer"]},{sentence:"We are reading a book",tokens:["We","are","reading","a","book"]}],
  listen:[{text:"Where is the bus stop?"},{text:"I would like some water."},{text:"Can you help me, please?"},{text:"This is my favorite game."}]
 },
 "10-12":{
  find:[{word:"decision",emoji:"🧠",heb:"החלטה"},{word:"schedule",emoji:"🗓️",heb:"לו״ז"},{word:"adventure",emoji:"🧭",heb:"הרפתקה"},{word:"challenge",emoji:"🏁",heb:"אתגר"},{word:"information",emoji:"ℹ️",heb:"מידע"},{word:"environment",emoji:"🌿",heb:"סביבה"}],
  build:[{sentence:"I have been learning English for a year",tokens:["I","have","been","learning","English","for","a","year"]},{sentence:"If it rains, we will stay at home",tokens:["If","it","rains,","we","will","stay","at","home"]},{sentence:"My goal is to speak clearly and confidently",tokens:["My","goal","is","to","speak","clearly","and","confidently"]}],
  listen:[{text:"Could you repeat that a little more slowly?"},{text:"I think this solution is more efficient."},{text:"Let's meet tomorrow at half past three."},{text:"Please explain the rules in simple words."}]
 }
};

const screens={home:$("#screenHome"),game:$("#screenGame"),done:$("#screenDone")};
const levelPill=$("#levelPill"), bubbleText=$("#bubbleText"), gameBubble=$("#gameBubble"), startBtn=$("#startBtn");
const panelFind=$("#panelFind"), panelBuild=$("#panelBuild"), panelListen=$("#panelListen");
const findWord=$("#findWord"), findGrid=$("#findGrid");
const buildTokens=$("#buildTokens"), buildAnswer=$("#buildAnswer"), buildUndo=$("#buildUndo"), buildCheck=$("#buildCheck");
const listenInput=$("#listenInput"), listenReplay=$("#listenReplay"), listenCheck=$("#listenCheck");
const sayBtn=$("#sayBtn"), hintBtn=$("#hintBtn"), quitBtn=$("#quitBtn");
const roundText=$("#roundText"), scoreText=$("#scoreText"), barFill=$("#barFill"), toast=$("#toast");
const doneMeta=$("#doneMeta"), playAgain=$("#playAgain"), backHome=$("#backHome");

function speak(text){
  try{
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang="en-US"; u.rate=.95; u.pitch=1.05;
    window.speechSynthesis.speak(u);
    return true;
  }catch(e){ return false; }
}
const normalize=(s)=> (s||"").toLowerCase().trim().replace(/\s+/g," ");
function showToast(msg,kind=""){
  toast.textContent=msg; toast.classList.remove("hidden");
  toast.style.borderColor=kind==="good"?"rgba(31,209,122,.55)":kind==="bad"?"rgba(255,77,95,.55)":"rgba(255,255,255,.16)";
  setTimeout(()=>toast.classList.add("hidden"),1200);
}
function labelMode(m){return m==="mixed"?"Quest מעורב":m==="find"?"מצא את המילה":m==="build"?"בנה משפט":"שמע והקלד";}
function refreshStartEnabled(){startBtn.disabled=!(state.level&&state.mode);}

$$("[data-level]").forEach(btn=>btn.addEventListener("click",()=>{
  state.level=btn.dataset.level;
  levelPill.textContent=`רמה: ${state.level}`;
  bubbleText.textContent=`בחרת רמת גיל ${state.level}. עכשיו בחר מצב משחק!`;
  refreshStartEnabled();
}));
$$("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  state.mode=btn.dataset.mode;
  bubbleText.textContent=`מצב משחק: ${labelMode(state.mode)}. מוכן להתחיל?`;
  refreshStartEnabled();
}));

startBtn.addEventListener("click", startGame);
quitBtn.addEventListener("click", ()=>goHome());
playAgain.addEventListener("click", ()=>{screens.done.classList.add("hidden"); startGame();});
backHome.addEventListener("click", ()=>goHome());
sayBtn.addEventListener("click", ()=>{if(state.current?.say) speak(state.current.say);});
hintBtn.addEventListener("click", ()=>{if(state.current?.hint) gameBubble.textContent=state.current.hint;});

function startGame(){
  state.round=0; state.score=0;
  state.totalRounds=(state.mode==="mixed")?5:6;
  screens.home.classList.add("hidden");
  screens.done.classList.add("hidden");
  screens.game.classList.remove("hidden");
  gameBubble.textContent="יאללה! מתחילים 🚀";
  nextRound();
}
function goHome(){
  screens.game.classList.add("hidden");
  screens.done.classList.add("hidden");
  screens.home.classList.remove("hidden");
}
function updateHud(){
  roundText.textContent=`סבב ${Math.min(state.round,state.totalRounds)}/${state.totalRounds}`;
  scoreText.textContent=`ניקוד: ${state.score}`;
  const pct=Math.round((Math.min(state.round-1,state.totalRounds)/state.totalRounds)*100);
  barFill.style.width=`${pct}%`;
}
function hidePanels(){
  panelFind.classList.add("hidden");
  panelBuild.classList.add("hidden");
  panelListen.classList.add("hidden");
  toast.classList.add("hidden");
}
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
const randFrom=(a)=>a[Math.floor(Math.random()*a.length)];
function pickType(){
  if(state.mode!=="mixed") return state.mode;
  const order=["find","build","listen","find","listen"];
  return order[(state.round-1)%order.length];
}

function nextRound(){
  state.round+=1; updateHud(); hidePanels();
  if(state.round>state.totalRounds){finish(); return;}
  const t=pickType();
  if(t==="find") loadFind();
  else if(t==="build") loadBuild();
  else loadListen();
}

function loadFind(){
  panelFind.classList.remove("hidden");
  const bank=BANK[state.level].find;
  const correct=randFrom(bank);
  const distract=shuffle(bank.filter(x=>x.word!==correct.word)).slice(0,3);
  const choices=shuffle([correct,...distract]);

  state.current={kind:"find",answer:correct.word,say:correct.word,hint:`רמז: זה אומר "${correct.heb}"`};
  findWord.textContent=correct.word;
  findGrid.innerHTML="";

  choices.forEach(ch=>{
    const el=document.createElement("div");
    el.className="cardChoice";
    el.innerHTML=`<div class="emoji">${ch.emoji}</div><div style="flex:1"><div class="word">${ch.word}</div><div class="small">tap</div></div>`;
    el.addEventListener("click",()=>{
      if(ch.word===correct.word){
        state.score+=10;
        showToast("✅ Awesome!","good");
        gameBubble.textContent=`מעולה! "${correct.word}" ✅`;
        speak(correct.word);
        setTimeout(nextRound,600);
      }else{
        state.score=Math.max(0,state.score-2);
        showToast("❌ Try again","bad");
        gameBubble.textContent="לא זה… נסה שוב 🙂";
      }
      updateHud();
    });
    findGrid.appendChild(el);
  });

  setTimeout(()=>speak(correct.word),200);
}

function countIn(arr,w){return arr.filter(x=>x===w).length;}
function esc(s){return (s||"").replace(/[&<>"]/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));}

function loadBuild(){
  panelBuild.classList.remove("hidden");
  const item=randFrom(BANK[state.level].build);
  const tokens=shuffle([...item.tokens]);
  const chosen=[];
  buildTokens.innerHTML="";
  buildAnswer.innerHTML="";
  state.current={kind:"build",answer:item.sentence,say:item.sentence,hint:"רמז: Subject → Verb → Object",chosen,tokens:item.tokens};

  function render(){
    buildTokens.querySelectorAll(".token").forEach(t=>{
      const w=t.dataset.word;
      t.classList.toggle("used", countIn(chosen,w) >= countIn(item.tokens,w));
    });
    buildAnswer.innerHTML=chosen.map(w=>`<span class="token">${esc(w)}</span>`).join("");
  }

  tokens.forEach(w=>{
    const t=document.createElement("div");
    t.className="token";
    t.dataset.word=w;
    t.textContent=w;
    t.addEventListener("click",()=>{
      if(countIn(chosen,w) < countIn(item.tokens,w)){
        chosen.push(w);
        render();
      }
    });
    buildTokens.appendChild(t);
  });

  buildUndo.onclick=()=>{chosen.pop(); render();};
  buildCheck.onclick=()=>{
    const attempt=normalize(chosen.join(" "));
    const target=normalize(item.sentence);
    if(attempt===target){
      state.score+=12;
      showToast("✅ Great sentence!","good");
      gameBubble.textContent="בול! משפט נכון 💪";
      speak(item.sentence);
      updateHud();
      setTimeout(nextRound,650);
    }else{
      state.score=Math.max(0,state.score-2);
      showToast("❌ Not quite","bad");
      gameBubble.textContent="כמעט! נסה לסדר מחדש 🙂";
      updateHud();
    }
  };

  render();
  setTimeout(()=>speak(item.sentence),250);
}

function distance(a,b){
  const m=a.length,n=b.length;
  const dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0]=i;
  for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
    const cost=a[i-1]===b[j-1]?0:1;
    dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
  }
  return dp[m][n];
}

function loadListen(){
  panelListen.classList.remove("hidden");
  const item=randFrom(BANK[state.level].listen);
  listenInput.value="";
  listenInput.focus();
  state.current={kind:"listen",answer:item.text,say:item.text,hint:"רמז: אפשר להשמיע שוב 🔊"};

  const doSpeak=()=>speak(item.text);
  listenReplay.onclick=doSpeak;
  sayBtn.onclick=doSpeak;

  listenCheck.onclick=()=>{
    const attempt=normalize(listenInput.value);
    const target=normalize(item.text);
    if(attempt && (attempt===target || distance(attempt,target)<=2)){
      state.score+=14;
      showToast("✅ Nice!","good");
      gameBubble.textContent="מעולה! שמיעה מצוינת 👂";
      updateHud();
      setTimeout(nextRound,650);
    }else{
      state.score=Math.max(0,state.score-2);
      showToast("❌ Try again","bad");
      gameBubble.textContent="לא בדיוק… תנסה שוב. אפשר להשמיע עוד פעם.";
      updateHud();
    }
  };

  setTimeout(doSpeak,250);
}

function finish(){
  barFill.style.width="100%";
  screens.game.classList.add("hidden");
  screens.done.classList.remove("hidden");
  doneMeta.textContent=`רמה: ${state.level} • מצב: ${labelMode(state.mode)} • ניקוד: ${state.score}`;
}