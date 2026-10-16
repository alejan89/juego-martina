'use strict';
(function () {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const people = [
    {id:'alicia', name:'Alicia Felicia', page:'02', x:26, y:59, emoji:'🌷'},
    {id:'martina', name:'Princesa Martina', page:'20', x:25, y:68, emoji:'👑'},
    {id:'dragon', name:'Dragón de fuego', page:'08', x:80, y:61, emoji:'🐉'},
    {id:'ardillita', name:'La ardillita', page:'10', x:81, y:74, emoji:'🐿️'},
    {id:'papa', name:'Príncipe Papá', page:'20', x:70, y:58, emoji:'💙'},
    {id:'bruja', name:'La bruja', page:'19', x:79, y:56, emoji:'🪄'},
    {id:'emisario', name:'El emisario', page:'12', x:28, y:53, emoji:'📜'},
    {id:'conejito', name:'El conejito', page:'02', x:29, y:86, emoji:'🐰'},
    {id:'ciervito', name:'El ciervito', page:'21', x:25, y:84, emoji:'🦌'},
    {id:'pajarito', name:'El pajarito', page:'02', x:15, y:28, emoji:'🐦'}
  ];
  const game = {level:4,first:null,locked:false,matches:0,moves:0,seconds:0,
    started:false,finished:false,timer:null,flipTimer:null,audio:null,
    musicWanted:true};
  try { game.musicWanted = localStorage.getItem('aliciaMemoMusic') !== 'off'; } catch (_) {}
  const pad = n => String(n).padStart(2,'0');
  const displayTime = seconds => pad(Math.floor(seconds / 60)) + ':' + pad(seconds % 60);
  function soundEnabled() {
    return $('#soundToggle') && $('#soundToggle').getAttribute('aria-pressed') !== 'false';
  }
  let audioContext;
  function note(frequency, duration) {
    if (!soundEnabled()) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioContext) audioContext = new AC();
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      const start = audioContext.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency,start);
      gain.gain.setValueAtTime(.0001,start);
      gain.gain.exponentialRampToValueAtTime(.035,start+.012);
      gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start+duration+.02);
    } catch (_) {}
  }
  function soundWin() {
    [523,659,784,1047].forEach((v,i)=>setTimeout(()=>note(v,.22),i*125));
  }
  function shuffle(array) {
    const items = array.slice();
    for(let i=items.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      const tmp=items[i]; items[i]=items[j]; items[j]=tmp;
    }
    return items;
  }
  function stopTimer() {
    if (game.timer!==null) { clearInterval(game.timer); game.timer=null; }
  }
  function startTimer() {
    if (game.started) return;
    game.started=true;
    resumeTimer();
  }
  function resumeTimer() {
    if (game.timer!==null||game.finished||!game.started) return;
    game.timer=setInterval(()=>{
      if($('#panel-memo').hidden) return;
      game.seconds++;
      $('#memoTime').textContent=displayTime(game.seconds);
    },1000);
  }
  function recordKey() {return 'aliciaMemoBest'+game.level;}
  function bestMoves() {
    try {return Number(localStorage.getItem(recordKey()))||0;} catch (_) {return 0;}
  }
  function updateBest() {
    const best=bestMoves();
    $('#memoBest').textContent=best ? best+' intentos' : '—';
  }
  function updateCounters() {
    $('#memoMatches').textContent=game.matches+' / '+game.level;
    $('#memoMoves').textContent=String(game.moves);
    $('#memoTime').textContent=displayTime(game.seconds);
  }
  function tell(message) {$('#memoMessage').textContent=message;}
  function makeCard(person,index) {
    const card=document.createElement('button');
    card.type='button';
    card.className='memo-card';
    card.dataset.id=person.id;
    card.setAttribute('aria-label','Carta '+(index+1)+', boca abajo');
    card.setAttribute('aria-pressed','false');
    const source='assets/libro/pagina_'+person.page+'.webp';
    const position=person.x+'% '+person.y+'%';
    card.innerHTML='<span class="memo-card-inner">'+
      '<span class="memo-card-back" aria-hidden="true"><span class="memo-back-stars">✦ ✧ ✦</span><span class="memo-back-crown">👑</span><span class="memo-back-title">ALICIA Y MARTINA</span><span class="memo-back-stars">✧ ✦ ✧</span></span>'+
      '<span class="memo-card-front" aria-hidden="true"><span class="memo-photo" style="background-image:url(&quot;'+source+'&quot;);background-position:'+position+'"></span><span class="memo-name">'+person.emoji+' '+person.name+'</span></span></span>';
    card.addEventListener('click',()=>flip(card,person));
    return card;
  }
  function flip(card,person) {
    if(game.locked||game.finished||card.classList.contains('is-open')||card.classList.contains('is-matched'))return;
    startTimer();
    card.classList.add('is-open');
    card.setAttribute('aria-pressed','true');
    card.setAttribute('aria-label',person.name+', carta descubierta');
    note(660,.09);
    if(!game.first) {
      game.first=card;
      tell('✨ ¡Muy bien! Ahora buscá su pareja.');
      return;
    }
    const previous=game.first;
    game.first=null;
    game.locked=true;
    game.moves++;
    updateCounters();
    if(previous.dataset.id===card.dataset.id) {
      previous.classList.add('is-matched');
      card.classList.add('is-matched');
      previous.setAttribute('aria-label',person.name+', pareja encontrada');
      card.setAttribute('aria-label',person.name+', pareja encontrada');
      game.matches++;
      updateCounters();
      game.locked=false;
      note(880,.18);
      if(game.matches===game.level) { win(); return; }
      tell(['🌈 ¡Excelente memoria!','💖 ¡Pareja encontrada!','🌷 ¡Qué bien te acordaste!'][game.matches%3]);
    } else {
      tell('💫 ¡Casi! Mirá bien dónde estaba cada dibujo.');
      note(350,.11);
      game.flipTimer=setTimeout(()=>{
        previous.classList.remove('is-open');
        card.classList.remove('is-open');
        previous.setAttribute('aria-pressed','false');
        card.setAttribute('aria-pressed','false');
        previous.setAttribute('aria-label','Carta boca abajo');
        card.setAttribute('aria-label','Carta boca abajo');
        game.locked=false;
        game.flipTimer=null;
      },1050);
    }
  }
  function win() {
    game.finished=true;
    stopTimer();
    const oldBest=bestMoves();
    const newRecord=!oldBest||game.moves<oldBest;
    if(newRecord) {try{localStorage.setItem(recordKey(),String(game.moves));}catch(_){}}
    updateBest();
    $('#memoVictoryDescription').textContent='¡Encontraste '+game.level+' parejas en '+game.moves+' intentos y '+displayTime(game.seconds)+'!'+(newRecord?' ¡Nuevo récord mágico! 🏆':'');
    $('#memoVictory').hidden=false;
    tell('🎉 ¡Todas las parejas encontradas!');
    soundWin();
  }
  function newGame(level) {
    stopTimer();
    if(game.flipTimer!==null) {clearTimeout(game.flipTimer);game.flipTimer=null;}
    game.level=level;
    game.first=null; game.locked=false; game.matches=0; game.moves=0;
    game.seconds=0; game.started=false; game.finished=false;
    $$('.memo-level').forEach(b=>{
      const selected=Number(b.dataset.memoLevel)===level;
      b.classList.toggle('is-selected',selected);
      b.setAttribute('aria-pressed',String(selected));
    });
    const deck=shuffle(people.slice(0,level).flatMap(p=>[p,p]));
    const board=$('#memoBoard');
    board.replaceChildren();
    board.classList.toggle('memo-expert',level===10);
    deck.forEach((person,index)=>board.append(makeCard(person,index)));
    $('#memoVictory').hidden=true;
    updateCounters();updateBest();
    tell('🌟 Elegí una carta para empezar. ¡Vos podés!');
  }
  function updateMusic() {
    const on=game.musicWanted&&soundEnabled();
    $('#memoMusic').setAttribute('aria-pressed',String(game.musicWanted));
    $('#memoMusicLabel').textContent=on?'Música suave':game.musicWanted?'Música silenciada':'Música pausada';
  }
  function playMusic() {
    updateMusic();
    if(!game.musicWanted||!soundEnabled()||$('#panel-memo').hidden) {
      if(game.audio)game.audio.pause();
      return;
    }
    if(!game.audio) {
      game.audio=new Audio('assets/musica/bosque.mp3');
      game.audio.loop=true; game.audio.volume=.15;
    }
    const result=game.audio.play();
    if(result&&result.catch)result.catch(()=>{});
  }
  window.memoStartUI = function() { playMusic(); resumeTimer(); };
  window.memoStopUI = function() { if(game.audio)game.audio.pause(); stopTimer(); };
  $$('.memo-level').forEach(b=>b.addEventListener('click',()=>{newGame(Number(b.dataset.memoLevel));note(880,.13);}));
  $('#memoRestart').addEventListener('click',()=>{newGame(game.level);note(784,.17);});
  $('#memoAgain').addEventListener('click',()=>{newGame(game.level);note(784,.17);});
  $('#memoMusic').addEventListener('click',()=>{
    game.musicWanted=!game.musicWanted;
    try{localStorage.setItem('aliciaMemoMusic',game.musicWanted?'on':'off');}catch(_){}
    playMusic();
  });
  $('#soundToggle').addEventListener('click',()=>{setTimeout(playMusic,0);});
  newGame(4);updateMusic();
})();
