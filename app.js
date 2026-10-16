'use strict';
(() => {
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const safeStorage = { get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}} };
  const state = { activeTab:'color', sound:safeStorage.get('aliciaSound')!=='off', toastTimer:null };
  const announce = (message) => { const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el.classList.remove('visible'),3000); };

  // Sounds are synthesized locally, so the game never depends on downloading audio files.
  let audioCtx;
  function context(){ if(!state.sound)return null;try {audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;} catch {return null;} }
  function tone(freq=620,duration=.12,type='sine',volume=.045,delay=0,endFreq){
    const c=context(); if(!c)return;
    const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(40,endFreq),t+duration);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.02);
  }
  const sfx={tap(){tone(660,.07,'sine',.035);},paint(){tone(650,.07,'sine',.045);tone(880,.12,'sine',.03,.055);},star(){tone(700,.12,'sine',.05);tone(990,.13,'sine',.048,.12);tone(1340,.18,'sine',.045,.23);},hit(){tone(240,.22,'sawtooth',.035,0,75);},magic(){[523,659,784,1047].forEach((v,i)=>tone(v,.24,'sine',.048,i*.09));},win(){[523,659,784,1047,1175,1568].forEach((v,i)=>tone(v,.38,'sine',.055,i*.135));},lose(){[430,340,260].forEach((v,i)=>tone(v,.21,'triangle',.035,i*.16));}};
  function confetti(){const target=$('#confetti');target.textContent='';for(let i=0;i<54;i++){const p=document.createElement('div');p.className='confetti-piece';p.style.left=`${Math.random()*100}%`;p.style.animationDelay=`${Math.random()*1.2}s`;p.style.background=['#ffbcd7','#ffdc81','#8ad7bb','#c8b2ff','#fff5e2'][i%5];p.style.setProperty('--drift',`${Math.random()*240-120}px`);target.append(p);}setTimeout(()=>target.replaceChildren(),4600);}
  const updateSound = () => {$('#soundText').textContent=state.sound?'Sonidos activados':'Sonidos apagados';$('#soundIcon').textContent=state.sound?'♫':'♪̸';$('#soundToggle').setAttribute('aria-pressed',String(state.sound));};
  $('#soundToggle').addEventListener('click',()=>{state.sound=!state.sound;safeStorage.set('aliciaSound',state.sound?'on':'off');updateSound();if(state.sound)sfx.tap();announce(state.sound?'🔔 ¡Sonidos activados!':'🔇 Sonidos silenciados');}); updateSound();

  function openTab(next){
    if(next===state.activeTab)return;
    state.activeTab=next;sfx.tap();
    $$('.mode-tab').forEach(b=>{const active=b.dataset.tab===next;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    $$('.game-panel[role="tabpanel"]').forEach(p=>{p.hidden=p.id!==`panel-${next}`;});
    if(next!=='dragon' && game.mode==='playing')pauseGame();
    if(next==='book'){ readerOpen(); } else { readerClose(); }
    if(next==='memo'){window.memoStartUI&&window.memoStartUI();}else{window.memoStopUI&&window.memoStopUI();}
  }
  $$('.mode-tab').forEach(b=>{
    b.addEventListener('click',()=>openTab(b.dataset.tab));
    b.addEventListener('keydown',e=>{
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        e.preventDefault();const keys=['book','color','dragon','memo'];const n=keys.indexOf(b.dataset.tab);const next=keys[(n+(e.key==='ArrowRight'?1:keys.length-1))%keys.length];openTab(next);$(`#tab-${next}`).focus();
      }
    });
  });

  // LECTOR DIGITAL — 21 high-resolution illustrations taken directly from the supplied PDF.
  // Sheet 1 is the cover, while sheets 2–21 each contain two facing storybook pages.
  // On phones, each half is presented individually for more readable type.
  const bookSaved = Number(safeStorage.get('aliciaBookPosition'));
  const reader={position:Number.isFinite(bookSaved)?Math.min(40,Math.max(0,Math.round(bookSaved))):0,
    turning:false,musicWanted:safeStorage.get('aliciaReaderMusic')!=='off',audio:null,track:null,
    mobile:()=>window.matchMedia('(max-width: 700px)').matches};
  const sceneNames=[
    'Érase una vez...', 'El bosque encantado','La cueva misteriosa','Una nueva amiga',
    'Una promesa valiente','Un camino de cristales','El dragón dormido','La espada mágica',
    '¡El dragón despierta!','Una huida valiente','¡La ardillita es libre!','La corona mágica',
    'Un mensaje urgente','El hechizo de Martina','Camino al castillo','El castillo oscuro',
    'Una persecución','Un encuentro inesperado','La corona brilla','La bruja aparece',
    'Juntos otra vez'
  ];
  const bookFile=sheet=>`assets/libro/pagina_${String(sheet).padStart(2,'0')}.webp`;
  const readerSheet=pos=>pos===0?1:Math.floor((pos-1)/2)+2;
  const readerChapter=sheet=>sheet<=3?'bosque':sheet<=6?'cueva':sheet<=11?'dragon':sheet<=19?'castillo':'final';
  function readerAudio(){
    if(!reader.audio){reader.audio=new Audio();reader.audio.loop=true;reader.audio.volume=.24;reader.audio.preload='auto';reader.audio.addEventListener('error',()=>{if(state.activeTab==='book')announce('No se pudo cargar la música. Podés seguir leyendo igualmente.');});}
    return reader.audio;
  }
  function readerSoundUpdate(){
    const active=reader.musicWanted&&state.sound;
    $('#readerMusic').setAttribute('aria-pressed',String(reader.musicWanted));
    $('#readerMusicSymbol').textContent=active?'♫':'♪̸';
    $('#readerMusicLabel').textContent=active?'Música activada':reader.musicWanted?'Música silenciada':'Música pausada';
  }
  function readerPlayMusic(){
    readerSoundUpdate();
    if(!reader.musicWanted || !state.sound || state.activeTab!=='book'){
      if(reader.audio)reader.audio.pause();return;
    }
    const sheet=readerSheet(reader.position);
    const track=readerChapter(sheet);
    const audio=readerAudio();
    if(reader.track!==track){reader.track=track;audio.pause();audio.src=`assets/musica/${track}.mp3`;audio.load();}
    const promise=audio.play();if(promise&&typeof promise.catch==='function')promise.catch(()=>{readerSoundUpdate();});
  }
  function readerOpen(){readerRender();readerPlayMusic();}
  function readerClose(){if(reader.audio)reader.audio.pause();}
  const readerLast=()=>reader.mobile()?40:39;
  const readerPrevious=pos=>reader.mobile()?Math.max(0,pos-1):pos===0?0:pos<=2?0:Math.max(1,(Math.floor((pos-1)/2)-1)*2+1);
  const readerFollowing=pos=>reader.mobile()?Math.min(40,pos+1):pos===0?1:Math.min(39,(Math.floor((pos-1)/2)+1)*2+1);
  function readerRender(){
    const pos=reader.position,sheet=readerSheet(pos),cover=pos===0,mobile=reader.mobile();
    const book=$('#readerBook'),img=$('#readerImage');
    book.classList.toggle('is-cover',cover);
    book.classList.toggle('is-spread',!cover&&!mobile);
    book.classList.toggle('is-single',!cover&&mobile);
    img.classList.toggle('is-right',!cover&&mobile&&pos%2===0);
    const path=bookFile(sheet);
    if(!img.src.endsWith(path))img.src=path;
    img.alt=cover?'Portada original: Alicia Felicia y la Princesa Martina, las niñas del bosque y el dragón de fuego':
      `Ilustración original del cuento, ${sceneNames[sheet-1]}. ${mobile?(pos%2?'Página izquierda':'Página derecha'):'Doble página'}.`;
    const label=cover?'Portada':mobile?`Página ${pos} de 40`:`Doble página ${sheet-1} de 20`;
    $('#readerPageLabel').textContent=label;
    $('#readerPageSubtitle').textContent=cover?'Tu aventura comienza aquí':sceneNames[sheet-1];
    $('#readerChapter').textContent=`✧ ${sceneNames[sheet-1]}`;
    $('#readerProgressFill').style.width=`${Math.round((mobile?pos/40:cover?0:(sheet-1)/20)*100)}%`;
    const prev=pos===0,next=pos>=readerLast();
    $('#readerPrev').disabled=prev;$('#readerPrevSide').disabled=prev;
    $('#readerNext').disabled=next;$('#readerNextSide').disabled=next;
    $('#readerNext').querySelector('span').textContent=cover?'Abrir cuento':next?'Fin del cuento':'Siguiente';
    $('#readerClickHint').innerHTML=cover?'Tocá para abrir el cuento <span>›</span>':next?'¡Fin del cuento! ✨':`Tocá para pasar página <span>›</span>`;
    $('#readerClickHint').classList.toggle('is-ending',next);
    $$('.reader-chapter-chip').forEach(b=>{let start=Number(b.dataset.bookJump);b.classList.toggle('is-current',pos>=start && (b.nextElementSibling?pos<Number(b.nextElementSibling.dataset.bookJump):true));});
    safeStorage.set('aliciaBookPosition',String(pos));
    const lookahead=readerFollowing(pos);
    if(lookahead!==pos){let upcoming=bookFile(readerSheet(lookahead));let load=new Image();load.src=upcoming;}
  }
  function readerGo(target){
    const next=Math.min(readerLast(),Math.max(0,Math.round(target)));
    if(next===reader.position)return;
    // Rapid taps should remain responsive: replace an unfinished turn with the latest one.
    if(reader.turning){reader.turning=false;$('#readerTurnLayer').replaceChildren();}
    const turnNumber=reader.turnNumber=(reader.turnNumber||0)+1;
    const previous=reader.position;
    const oldImage=$('#readerImage').cloneNode();oldImage.removeAttribute('id');
    const oldCover=previous===0,oldMobile=reader.mobile();
    const layer=$('#readerTurnLayer');layer.replaceChildren();
    const leaf=document.createElement('div');leaf.className=`reader-leaf ${oldCover?'leaf-cover':oldMobile?'leaf-single':'leaf-spread'} ${next>previous?'turn-next':'turn-prev'}`;
    const clip=document.createElement('div');clip.className='reader-leaf-image-clip';
    clip.append(oldImage);leaf.append(clip);layer.append(leaf);
    reader.turning=true;
    reader.position=next;
    readerRender();readerPlayMusic();sfx.tap();
    const finish=()=>{if(reader.turnNumber!==turnNumber)return;reader.turning=false;layer.replaceChildren();};
    leaf.addEventListener('animationend',finish,{once:true});
    setTimeout(()=>{if(reader.turning)finish();},850);
  }
  function readerChange(direction){readerGo(direction>0?readerFollowing(reader.position):readerPrevious(reader.position));}
  $('#readerPrev').addEventListener('click',()=>readerChange(-1));
  $('#readerNext').addEventListener('click',()=>readerChange(1));
  $('#readerPrevSide').addEventListener('click',()=>readerChange(-1));
  $('#readerNextSide').addEventListener('click',()=>readerChange(1));
  $('#readerBook').addEventListener('click',e=>{
    if(reader.mobile()){readerChange(1);return;}
    const {left,width}=$('#readerBook').getBoundingClientRect();
    if(reader.position!==0 && e.clientX<left+width*.36)readerChange(-1);else readerChange(1);
  });
  $('#readerBook').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();readerChange(1);}});
  document.addEventListener('keydown',e=>{
    if(state.activeTab!=='book'||e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();readerChange(1)}
    if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();readerChange(-1)}
  });
  $$('.reader-chapter-chip').forEach(b=>b.addEventListener('click',()=>{
    const index=Number(b.dataset.bookJump);
    const target=reader.mobile()?index:index===0?0:Math.min(39,2*Math.floor((index-1)/2)+1);
    readerGo(target);
  }));
  $('#readerMusic').addEventListener('click',()=>{
    reader.musicWanted=!reader.musicWanted;
    safeStorage.set('aliciaReaderMusic',reader.musicWanted?'on':'off');
    readerPlayMusic();announce(reader.musicWanted?'♫ Música del cuento activada':'♪ Música del cuento pausada');
  });
  $('#readerFullscreen').addEventListener('click',async()=>{
    try{
      const space=$('#readerSpace');
      if(document.fullscreenElement){await document.exitFullscreen();return;}
      if(space.requestFullscreen)await space.requestFullscreen();
      else announce('Tu navegador no permite pantalla completa.');
    }catch{announce('Pantalla completa no disponible en este dispositivo.');}
  });
  $('#soundToggle').addEventListener('click',()=>readerPlayMusic());
  window.addEventListener('resize',()=>{if(state.activeTab==='book'&&!reader.turning){
    reader.position=reader.mobile()?Math.min(40,reader.position):reader.position===0?0:2*Math.floor((reader.position-1)/2)+1;
    readerRender();}});
  readerRender();readerSoundUpdate();


  // COLORING BOOK — four original SVG outlines inspired by the characters of the PDF.
  const C=[
    ['Rosa chicle','#ff78af'],['Amarillo sol','#ffd45c'],['Turquesa','#71d8cb'],['Lila','#b58beb'],['Verde hoja','#80c575'],['Rojo dragón','#f36b61'],
    ['Azul cielo','#76bcf3'],['Naranja','#ffa55a'],['Morado','#8257b3'],['Marrón','#bb7d57'],['Crema','#ffe6ba'],['Negro noche','#4a3e67'],
    ['Blanco nube','#fffdf5'],['Dorado mágico','#eeb955'],['Verde oscuro','#4c9780'],['Fucsia','#d64b92'],['Gris plata','#b8b8cb'],['Melocotón','#ffbd96']
  ];
  const artState={character:'alicia',paint:'#ff78af',history:{alicia:[],martina:[],dragon:[],ardilla:[]},colored:{alicia:{},martina:{},dragon:{},ardilla:{}}};
  try {const saved=JSON.parse(safeStorage.get('aliciaPaint')||'{}');for(const name of Object.keys(artState.colored))if(saved[name]&&typeof saved[name]==='object')artState.colored[name]=saved[name];}catch{}
  const persistPaint=()=>safeStorage.set('aliciaPaint',JSON.stringify(artState.colored));
  const outline='#684573';
  const baseSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480" aria-label="Dibujo para colorear" role="img"><defs><radialGradient id="paperGlow"><stop stop-color="#fffdf8"/><stop offset="1" stop-color="#fff2e5"/></radialGradient></defs><rect width="600" height="480" fill="url(#paperGlow)"/><g fill="#f7d78e" opacity=".85"><path d="m92 64 6 16 16 6-16 5-6 16-6-16-16-5 16-6Z"/><path d="m507 65 5 12 13 4-13 4-5 13-5-13-13-4 13-4Z"/><circle cx="510" cy="199" r="4"/><circle cx="84" cy="252" r="4"/><circle cx="454" cy="41" r="3"/></g><path d="M0 403Q100 375 205 410T400 403T600 392V480H0Z" fill="#e1eedc"/><path d="M0 447Q128 428 259 450T600 438V480H0Z" fill="#d4e7cc"/><g fill="#eca0bd"><circle cx="66" cy="401" r="8"/><circle cx="74" cy="393" r="8"/><circle cx="82" cy="401" r="8"/><circle cx="74" cy="408" r="8"/><circle cx="74" cy="401" r="4" fill="#ffe9a7"/><circle cx="527" cy="418" r="7"/><circle cx="535" cy="410" r="7"/><circle cx="543" cy="418" r="7"/><circle cx="535" cy="426" r="7"/><circle cx="535" cy="418" r="4" fill="#ffe9a7"/></g>`;
  function zone(id,path,extra=''){return `<path data-zone="${id}" fill="#fffefa" stroke="${outline}" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round" d="${path}" ${extra}/>`;}
  function ellipse(id,cx,cy,rx,ry,extra=''){return `<ellipse data-zone="${id}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fffefa" stroke="${outline}" stroke-width="4.2" ${extra}/>`;}
  const eye=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="0" cy="0" rx="10" ry="14" fill="#fff"/><ellipse cx="2" cy="1" rx="5.8" ry="9.2" fill="#352741"/><circle cx="4" cy="-3" r="2.4" fill="#fff"/></g>`;
  const mouth=(x,y)=>`<path d="M${x-9} ${y} Q${x} ${y+12} ${x+9} ${y}" stroke="#995363" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const bow=(x,y)=>`<g>${zone('lacito-izq',`M${x} ${y}q-46-32-44-5 0 27 44 12Z`)}${zone('lacito-der',`M${x} ${y}q46-32 44-5 0 27-44 12Z`)}<circle cx="${x}" cy="${y}" r="9" fill="#fffefa" stroke="${outline}" stroke-width="3" data-zone="centro-lazo"/></g>`;
  const pieces={
    alicia:()=>`${baseSvg}
      ${zone('capa','M254 256Q195 236 128 341Q194 321 242 352L305 306Z')}
      ${zone('botas-izq','M255 353L242 418Q231 438 262 443L292 439 285 367Z')}${zone('botas-der','M324 352L331 415Q350 437 322 443L294 442 297 365Z')}
      ${zone('falda','M262 295Q211 330 195 388Q298 432 410 388Q387 337 328 294Z')}
      ${zone('vestido','M261 250Q305 224 335 251L359 324Q304 352 244 322Z')}
      ${zone('brazo-izq','M257 262Q221 256 204 300Q206 329 225 321L266 295Z')}${zone('mano-izq','M204 298Q174 300 180 321Q189 335 217 319Z')}
      ${zone('brazo-der','M337 257Q374 268 386 303L367 321 323 287Z')}${zone('mano-der','M385 297Q406 289 410 309Q410 327 373 326Z')}
      ${ellipse('cabello',298,182,109,107)}
      ${zone('flequillo','M191 179Q189 87 272 89Q331 67 397 137L391 179Q367 149 348 151Q314 119 274 153Q223 128 191 179Z')}
      ${ellipse('cara',300,193,83,91)}
      ${zone('rulito-izq','M218 153Q180 145 184 198Q182 233 216 254Q196 210 223 185Z')}
      ${zone('rulito-der','M379 144Q418 155 413 203Q420 239 381 251Q404 210 378 184Z')}
      ${eye(272,187,1.05)}${eye(332,187,1.05)}${mouth(303,230)}
      <ellipse cx="248" cy="226" rx="13" ry="7" fill="#ffc6b9" opacity=".67"/><ellipse cx="354" cy="226" rx="13" ry="7" fill="#ffc6b9" opacity=".67"/>
      ${zone('vincha','M215 130Q298 75 381 138L378 151Q306 106 219 145Z')}
      ${zone('flor-izq','M253 118Q238 96 245 89 260 91 263 108 270 87 284 95 294 111 276 121 296 126 285 140 268 144 264 131 257 151 245 143 241 131Z')}
      <circle cx="265" cy="120" r="7" fill="#ffe9a5" stroke="${outline}" stroke-width="2"/></svg>`,
    martina:()=>`${baseSvg}
      ${zone('zapato-izq','M263 384L253 424Q245 441 273 447L295 441 292 379Z')}${zone('zapato-der','M329 382L331 426Q344 441 322 448L297 443 305 385Z')}
      ${zone('falda-exterior','M258 281Q208 306 160 402Q295 454 444 399Q416 329 347 277Z')}
      ${zone('falda-interior','M267 307Q255 363 232 420Q300 446 368 421Q344 363 334 309Z')}
      ${zone('cuerpo-vestido','M263 256Q302 239 345 258L355 322Q304 342 250 322Z')}
      ${ellipse('manga-izquierda',249,273,32,25)}${ellipse('manga-derecha',354,273,32,25)}
      ${zone('brazo-izq','M235 283Q218 305 235 338L251 332 267 288Z')}${zone('brazo-der','M363 281Q390 303 374 336L356 330 343 287Z')}
      ${zone('mano-izq','M234 331Q224 348 245 352L258 333Z')}${zone('mano-der','M373 332Q389 346 365 356L351 334Z')}
      ${ellipse('cabello',302,173,107,106)}${zone('rizo-izq','M210 160Q170 221 224 273Q193 215 238 180Z')}${zone('rizo-der','M388 160Q433 217 375 275Q398 219 362 176Z')}
      ${ellipse('cara',302,188,79,82)}
      ${zone('flequillo','M223 158Q217 101 260 113Q297 77 327 121Q361 95 382 161Q356 149 340 159Q311 120 280 153Q248 139 223 158Z')}
      ${eye(277,192,.95)}${eye(329,192,.95)}${mouth(305,229)}
      <ellipse cx="250" cy="218" rx="12" ry="6" fill="#ffd4cc"/><ellipse cx="352" cy="218" rx="12" ry="6" fill="#ffd4cc"/>
      ${zone('corona','M247 107L239 53 276 78 300 35 325 80 362 52 354 113Z')}
      ${ellipse('gema',301,92,12,14)}${bow(302,311)}
      <path d="M191 413Q296 437 410 413" stroke="#c8a0cf" stroke-width="3" stroke-dasharray="7 8" fill="none"/></svg>`,
    dragon:()=>`${baseSvg}
      ${zone('ala-izquierda','M271 231Q107 172 104 89L165 128 172 52 219 118 241 75 303 190Z')}
      ${zone('ala-derecha','M326 209Q437 58 515 91L478 152 533 172 459 218 467 269 359 259Z')}
      ${zone('cola','M379 324Q497 347 485 412Q458 447 414 413Q457 405 453 379Q421 370 361 379Z')}
      ${ellipse('cuerpo',304,283,131,133)}
      ${zone('pancita','M263 230Q308 210 343 236Q389 308 340 402Q283 432 244 380Q225 309 263 230Z')}
      ${zone('pierna-izq','M225 335Q180 355 185 403L266 418 283 358Z')}${zone('pierna-der','M358 347Q419 362 421 403L351 419 335 359Z')}
      ${zone('brazo-izq','M209 244Q155 279 178 327L215 315 252 269Z')}${zone('brazo-der','M389 250Q443 277 415 327L381 318 351 273Z')}
      ${zone('cabeza','M259 166Q219 110 269 83Q341 50 383 106Q409 140 379 187L371 230Q322 271 269 229Z')}
      ${zone('hocico','M284 199Q335 190 378 208Q400 239 370 259Q321 269 282 244Z')}
      ${zone('cuerno-izq','M264 109L246 47 294 93Z')}${zone('cuerno-der','M339 95L357 37 374 115Z')}
      ${zone('cresta-1','M225 165L183 153 221 127Z')}${zone('cresta-2','M221 198L179 208 227 175Z')}
      <ellipse cx="286" cy="169" rx="13" ry="16" fill="#fff"/><ellipse cx="355" cy="163" rx="13" ry="16" fill="#fff"/><circle cx="289" cy="173" r="7" fill="#49305c"/><circle cx="353" cy="168" r="7" fill="#49305c"/><circle cx="291" cy="170" r="3" fill="white"/><circle cx="355" cy="165" r="3" fill="white"/>
      <ellipse cx="366" cy="229" rx="5" ry="4" fill="#654577"/>${mouth(330,240)}
      <path d="M268 312Q305 323 343 311M267 344Q308 359 347 344M278 375Q307 388 338 372" fill="none" stroke="#bca0a8" stroke-width="3"/></svg>`,
    ardilla:()=>`${baseSvg}
      ${zone('colita','M347 349Q449 367 450 254Q442 170 389 192Q418 132 488 164Q556 211 515 321Q485 404 371 394Z')}
      ${zone('cola-centro','M430 324Q483 324 487 244Q488 211 455 212Q472 275 430 324Z')}
      ${zone('pata-izq','M262 372Q226 388 243 414L298 420 308 372Z')}${zone('pata-der','M343 374Q368 381 369 410L318 421 307 380Z')}
      ${ellipse('cuerpo',304,328,91,106)}
      ${ellipse('panza',303,349,60,73)}
      ${zone('oreja-izq','M249 184Q218 104 250 100Q286 108 278 189Z')}${zone('oreja-der','M339 189Q344 109 375 102Q398 121 364 203Z')}
      ${zone('oreja-interior-izq','M249 162Q237 119 255 117Q267 128 263 161Z')}${zone('oreja-interior-der','M354 163Q358 124 372 120Q381 138 365 174Z')}
      ${ellipse('cabeza',305,225,92,84)}
      ${zone('mejilla-izq','M244 226Q215 227 218 251Q225 267 259 262Z')}${zone('mejilla-der','M362 227Q392 226 393 249Q386 267 350 262Z')}
      ${ellipse('hocico',305,255,40,29)}
      ${ellipse('nariz',304,243,10,7)}
      ${eye(270,212,.7)}${eye(340,212,.7)}
      <path d="M303 249V266M303 266Q291 278 281 265M303 266Q317 280 329 263" fill="none" stroke="#78576d" stroke-width="3" stroke-linecap="round"/>
      ${zone('brazito-izq','M238 307Q207 320 225 347Q241 356 267 335Z')}${zone('brazito-der','M368 308Q396 327 379 346Q359 351 341 335Z')}
      ${bow(307,314)}</svg>`
  };
  function renderArt(){const name=artState.character;$('#drawingStage').innerHTML=pieces[name]();const paint=artState.colored[name];$$('[data-zone]',$('#drawingStage')).forEach(zone=>{if(paint[zone.dataset.zone])zone.setAttribute('fill',paint[zone.dataset.zone]);});$('#drawingTitle').textContent={alicia:'Alicia Felicia',martina:'Princesa Martina',dragon:'El dragón de fuego',ardilla:'La ardillita'}[name];updateColorProgress();$('#undoPaint').disabled=artState.history[name].length===0;}
  function updateColorProgress(){const all=new Set($$('[data-zone]',$('#drawingStage')).map(z=>z.dataset.zone));let colored=0;for(const key of all)if(artState.colored[artState.character][key])colored++;$('#colorProgress').textContent=`${colored} / ${all.size} zonas`;} 
  function selectPaint(idx){artState.paint=C[idx][1];$$('.paint-swatch').forEach((el,i)=>{el.classList.toggle('selected',i===idx);el.setAttribute('aria-pressed',String(i===idx));});$('#brushDot').style.background=artState.paint;$('#colorName').textContent=C[idx][0];sfx.tap();}
  const palette=$('#colorPalette');C.forEach(([name,hex],i)=>{const b=document.createElement('button');b.type='button';b.className='paint-swatch'+(i===0?' selected':'');b.style.setProperty('--swatch',hex);b.style.setProperty('--check',i===12||i===10?'#574064':'#fff');b.setAttribute('aria-label',name);b.setAttribute('aria-pressed',String(i===0));b.title=name;b.addEventListener('click',()=>selectPaint(i));palette.append(b);});
  $$('.character-card').forEach(b=>b.addEventListener('click',()=>{artState.character=b.dataset.character;$$('.character-card').forEach(e=>{const selected=e===b;e.classList.toggle('selected',selected);e.setAttribute('aria-pressed',String(selected));});renderArt();sfx.tap();}));
  function storeUndo(){artState.history[artState.character].push({...artState.colored[artState.character]});if(artState.history[artState.character].length>35)artState.history[artState.character].shift();$('#undoPaint').disabled=false;}
  $('#drawingStage').addEventListener('click',e=>{const zone=e.target.closest?.('[data-zone]');if(!zone)return;const id=zone.dataset.zone;const painting=artState.colored[artState.character];if(painting[id]===artState.paint)return;storeUndo();painting[id]=artState.paint;$$('[data-zone]',$('#drawingStage')).filter(z=>z.dataset.zone===id).forEach(z=>z.setAttribute('fill',artState.paint));updateColorProgress();persistPaint();sfx.paint();});
  $('#undoPaint').addEventListener('click',()=>{const h=artState.history[artState.character];if(!h.length)return;artState.colored[artState.character]=h.pop();renderArt();persistPaint();sfx.tap();});
  $('#clearPaint').addEventListener('click',()=>{if(!Object.keys(artState.colored[artState.character]).length)return;storeUndo();artState.colored[artState.character]={};renderArt();persistPaint();sfx.tap();announce('¡Tu hoja está lista para una nueva obra!');});
  $('#magicFill').addEventListener('click',()=>{storeUndo();const painting={};const ids=[...new Set($$('[data-zone]',$('#drawingStage')).map(e=>e.dataset.zone))];const presets={alicia:['#966549','#5fb99d','#efb97d','#89c4a1','#ffd3af','#df765b'],martina:['#ffc6dd','#e8a4cc','#f6cc64','#ffdf9b','#ffc6b1'],dragon:['#f78e5f','#e7ba60','#ed6b64','#a65dc8','#ffd58d'],ardilla:['#bd855c','#e8c49c','#ffb0bf','#c48b68']};ids.forEach((id,i)=>{const pool=presets[artState.character];painting[id]=pool[(i+Math.floor(i/3))%pool.length];});artState.colored[artState.character]=painting;renderArt();persistPaint();sfx.magic();confetti();announce('✨ ¡Tu personaje se llenó de magia!');});
  $('#savePaint').addEventListener('click',()=>{try{const svg=$('#drawingStage svg');const clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');const xml=new XMLSerializer().serializeToString(clone);const url=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=960;const c=canvas.getContext('2d');c.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);canvas.toBlob(blob=>{if(!blob){announce('No se pudo guardar el dibujo.');return;}const imageURL=URL.createObjectURL(blob);const a=document.createElement('a');a.href=imageURL;a.download=`mi-dibujo-${artState.character}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(imageURL),5000);announce('🎨 ¡Tu obra está lista para guardar!');sfx.magic();},'image/png');};img.onerror=()=>{URL.revokeObjectURL(url);announce('No se pudo preparar la imagen.');};img.src=url;}catch{announce('Tu navegador no pudo exportar la imagen.');}});
  renderArt();

  // DRAGON RESCUE — frame-independent canvas game, keyboard and pointer controls.
  const canvas=$('#arcade'),ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  const background=new Image();background.src='assets/bosque.webp';
  const game={mode:'intro',player:{x:95,y:362,r:24,invincible:0},lives:3,stars:0,wins:Math.max(0,Number(safeStorage.get('aliciaWins'))||0),needed:3,t:0,lastFrame:0,fireballs:[],particles:[],spawnIn:1.7,keys:new Set(),touchDirs:new Set(),starSpots:[],fireCount:0,animationId:0};
  $('#winsValue').textContent=String(game.wins);
  const random=(a,b)=>a+Math.random()*(b-a);
  function resetWorld(){game.player={x:91,y:361,r:24,invincible:0};game.lives=3;game.stars=0;game.t=0;game.fireballs=[];game.particles=[];game.fireCount=0;game.spawnIn=2;game.starSpots=[{x:244,y:361,pulse:0},{x:474,y:193,pulse:1.8},{x:727,y:365,pulse:3.1}];updateHUD();}
  function updateHUD(){$('#livesValue').textContent=String(game.lives);$('#starsValue').textContent=String(game.stars);$('#winsValue').textContent=String(game.wins);}
  function overlay(emoji,eyebrow,title,description,button){$('#overlayMascot').textContent=emoji;$('#overlayEyebrow').textContent=eyebrow;$('#overlayTitle').textContent=title;$('#overlayDescription').textContent=description;$('#playDragon').textContent=button;$('#arcadeOverlay').hidden=false;}
  function startGame(){resetWorld();game.mode='playing';game.keys.clear();game.touchDirs.clear();$('#arcadeOverlay').hidden=true;$('#pauseDragon').textContent='Ⅱ Pausa';game.lastFrame=0;canvas.focus({preventScroll:true});sfx.magic();}
  function pauseGame(){if(game.mode!=='playing')return;game.mode='paused';game.keys.clear();game.touchDirs.clear();$('#pauseDragon').textContent='▶ Continuar';overlay('🌸','UN PEQUEÑO DESCANSO','¡Pausa mágica!','Alicia te espera. Cuando quieras, continuamos la misión.','▶ Continuar aventura');}
  function resumeGame(){game.mode='playing';game.lastFrame=0;$('#arcadeOverlay').hidden=true;$('#pauseDragon').textContent='Ⅱ Pausa';canvas.focus({preventScroll:true});sfx.tap();}
  $('#playDragon').addEventListener('click',()=>game.mode==='paused'?resumeGame():startGame());
  $('#pauseDragon').addEventListener('click',()=>{if(game.mode==='playing')pauseGame();else if(game.mode==='paused')resumeGame();else startGame();});
  $('#restartDragon').addEventListener('click',startGame);
  const keys={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
  document.addEventListener('keydown',e=>{if(state.activeTab!=='dragon')return;const d=keys[e.key.toLowerCase()];if(d){if(game.mode==='playing'){game.keys.add(d);e.preventDefault();}return;}if(e.key===' '&&game.mode==='playing'&&!e.repeat){e.preventDefault();pauseGame();}});
  document.addEventListener('keyup',e=>{const d=keys[e.key.toLowerCase()];if(d)game.keys.delete(d);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();});
  window.addEventListener('blur',()=>{game.keys.clear();game.touchDirs.clear();if(game.mode==='playing')pauseGame();});
  $$('.dpad-key').forEach(b=>{const d=b.dataset.dir;const stop=e=>{game.touchDirs.delete(d);b.classList.remove('pressed');try{if(b.hasPointerCapture(e.pointerId))b.releasePointerCapture(e.pointerId)}catch{}};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(game.mode==='playing')game.touchDirs.add(d);b.classList.add('pressed');});b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('lostpointercapture',()=>{game.touchDirs.delete(d);b.classList.remove('pressed');});});
  function addParticles(x,y,color,count=14){for(let i=0;i<count;i++)game.particles.push({x,y,vx:random(-145,145),vy:random(-180,50),life:random(.4,.95),max:.95,color,r:random(2.3,6.5)});}
  function winGame(){game.mode='won';game.wins++;safeStorage.set('aliciaWins',String(game.wins));updateHUD();addParticles(game.player.x,game.player.y,'#ffe9a1',38);sfx.win();confetti();overlay('🐿️','¡MISIÓN CUMPLIDA!','¡Rescataste a la ardillita!','¡Qué valiente! Alicia y su amiguita te dan las gracias. ¡El bosque vuelve a estar lleno de alegría!','✦ ¡Jugar otra vez!');}
  function loseGame(){game.mode='lost';sfx.lose();overlay('💗','¡SEGUIMOS INTENTANDO!','¡Casi lo lográs!','Las aventuras tienen desafíos. ¡Alicia quiere intentarlo de nuevo con vos!','♥ Volver a intentar');}
  function update(dt){if(game.mode!=='playing')return;game.t+=dt;const p=game.player;p.invincible=Math.max(0,p.invincible-dt);let dx=0,dy=0;const pressed=(v)=>game.keys.has(v)||game.touchDirs.has(v);if(pressed('right'))dx++;if(pressed('left'))dx--;if(pressed('up'))dy--;if(pressed('down'))dy++;const len=Math.hypot(dx,dy)||1;p.x=Math.max(39,Math.min(W-43,p.x+dx/len*255*dt));p.y=Math.max(130,Math.min(H-44,p.y+dy/len*255*dt));
    game.spawnIn-=dt;if(game.spawnIn<=0){game.spawnIn=random(1.05,1.7);const targetY=random(175,460);game.fireballs.push({x:W+40,y:targetY,vx:random(-295,-215),vy:random(-24,24),size:random(17,25),r:0});game.fireCount++;}
    for(const f of game.fireballs){f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*5;if(f.x<-80)f.gone=true;
      if(p.invincible<=0&&Math.hypot(p.x-f.x,p.y-f.y)<p.r+f.size*.55){f.gone=true;game.lives--;p.invincible=1.8;addParticles(p.x,p.y,'#ffd4aa');sfx.hit();updateHUD();if(game.lives<=0){loseGame();return;}}}
    game.fireballs=game.fireballs.filter(f=>!f.gone);
    for(const star of game.starSpots){star.pulse+=dt*3;if(Math.hypot(p.x-star.x,p.y-star.y)<42){game.stars++;addParticles(star.x,star.y,'#ffe390',22);star.collected=true;updateHUD();sfx.star();if(game.stars===3)announce('✨ ¡Las tres estrellas! Ahora rescatá a la ardillita.');}}
    game.starSpots=game.starSpots.filter(s=>!s.collected);
    game.particles.forEach(a=>{a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=300*dt;a.life-=dt;});game.particles=game.particles.filter(a=>a.life>0);
    if(game.stars>=3&&Math.hypot(p.x-872,p.y-367)<70)winGame();
  }
  function rounded(x,y,w,h,r,fill,stroke=null,width=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
  function circle(x,y,r,fill,stroke=null,width=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
  function oval(x,y,rx,ry,fill,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.restore();}
  function path(steps,fill,stroke=null,sw=2){ctx.beginPath();steps(ctx);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke();}}
  function polygon(pts,fill,stroke=null,sw=2){path(c=>{c.moveTo(...pts[0]);pts.slice(1).forEach(v=>c.lineTo(...v));c.closePath();},fill,stroke,sw);}
  function star(x,y,r,color,angle=0){const pts=[];for(let i=0;i<10;i++){const a=angle-Math.PI/2+i*Math.PI/5;const rad=i%2?r*.48:r;pts.push([x+Math.cos(a)*rad,y+Math.sin(a)*rad]);}polygon(pts,color,'#fffcdd',2);}
  function drawScene(){
    ctx.clearRect(0,0,W,H);
    if(background.complete&&background.naturalWidth){ctx.drawImage(background,0,200,background.width,background.height-200,0,0,W,H);}else{const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#7054a1');sky.addColorStop(.7,'#88c6a1');sky.addColorStop(1,'#348566');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);}
    const dusk=ctx.createLinearGradient(0,0,0,H);dusk.addColorStop(0,'#24104e66');dusk.addColorStop(.7,'#3b275122');dusk.addColorStop(1,'#132c2299');ctx.fillStyle=dusk;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#25174c77';ctx.fillRect(0,0,W,82);
    // Ribbon for the mission.
    rounded(22,17,520,50,14,'#331a59bb','#ffddae99',2);ctx.textAlign='left';ctx.font='600 25px Fredoka, sans-serif';ctx.fillStyle='#fff5d8';ctx.fillText(game.stars>=3?'✨ ¡LLEGÁ HASTA LA ARDILLITA!':'⭐ JUNTÁ LAS 3 ESTRELLAS MÁGICAS',43,49);
    // Dragon, far behind the flames.
    drawDragon(854,99);
    // Forest path and clouds of flowers.
    path(c=>{c.moveTo(0,459);c.bezierCurveTo(250,407,540,490,960,440);c.lineTo(960,H);c.lineTo(0,H);c.closePath();},'#b6d69e66');
    for(let i=0;i<20;i++){const x=i*53+19,y=493+Math.sin(i*2)*13;oval(x,y,12,5,i%3===0?'#ffeaba':'#f9a1bf');circle(x,y,3,'#fff2ce');}
    // Friendly squirrel is near the right edge.
    drawSquirrel(873,365);
    for(const s of game.starSpots){const pulse=Math.sin(s.pulse)*3;circle(s.x,s.y,31+pulse,'#ffe69b33','#ffe7a488',2);star(s.x,s.y,22+pulse,'#ffdf6a',s.pulse/6);circle(s.x,s.y,4,'white');}
    for(const f of game.fireballs)drawFlame(f);
    if(game.player.invincible===0||Math.floor(game.t*9)%2===0)drawAlicia(game.player.x,game.player.y,game.t);
    for(const a of game.particles){ctx.globalAlpha=Math.max(0,Math.min(1,a.life/.65));circle(a.x,a.y,a.r,a.color);ctx.globalAlpha=1;}
    if(game.stars<3){ctx.textAlign='center';ctx.font='600 17px Fredoka, sans-serif';ctx.fillStyle='#fff9dc';ctx.fillText('¡Juntá primero las estrellas!',855,462);}else{ctx.textAlign='center';ctx.font='600 21px Fredoka, sans-serif';ctx.fillStyle='#fff3b2';ctx.fillText('¡VENÍ, ALICIA!',856,462);}
  }
  function drawAlicia(x,y,t){ctx.save();ctx.translate(x,y);const hop=Math.sin(t*11)*((game.keys.size||game.touchDirs.size)?2.8:1);ctx.translate(0,hop);ctx.lineJoin='round';ctx.lineCap='round';
    oval(0,22,31,9,'#152d3260');
    // Cape and skirts, with a golden hem.
    polygon([[-10,-3],[-37,24],[-3,15],[15,10]],'#4b9f7e','#fff0c9',3);
    polygon([[-16,-4],[-26,26],[26,26],[17,-4]],'#f5b866','#795076',3);
    path(c=>{c.moveTo(-20,-9);c.lineTo(-34,22);c.quadraticCurveTo(0,34,35,22);c.lineTo(19,-9);c.closePath();},'#70cba3','#6d4b6e',3);
    ctx.strokeStyle='#ffd88d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-28,19);ctx.quadraticCurveTo(0,29,28,19);ctx.stroke();
    oval(-13,20,10,5,'#875d68');oval(14,20,10,5,'#875d68');
    // Hair and face.
    circle(0,-31,33,'#875434','#5a3652',3);circle(-21,-33,14,'#a06c45');circle(24,-28,13,'#9b6040');
    oval(1,-32,26,28,'#ffd2a6');
    circle(-9,-34,3.8,'#382d45');circle(12,-34,3.8,'#382d45');circle(-10,-35,1.3,'white');circle(11,-35,1.3,'white');
    oval(-16,-19,6,3,'#f0a6a8');oval(18,-18,6,3,'#f0a6a8');
    path(c=>{c.moveTo(-5,-16);c.quadraticCurveTo(2,-8,9,-16);},null,'#8e4b59',2.5);
    path(c=>{c.moveTo(-28,-46);c.bezierCurveTo(-15,-75,19,-72,31,-45);c.bezierCurveTo(9,-56,4,-53,-7,-47);c.lineTo(-28,-46);},'#9a643d','#6b4158',2);
    // Flowers and cape pin.
    circle(-17,-57,6,'#ffe1e1');circle(-17,-57,2.6,'#f4c967');circle(-7,-59,5,'#ffe3a9');circle(-7,-59,2,'#ee98ad');
    ctx.restore();}
  function drawSquirrel(x,y){ctx.save();ctx.translate(x,y);ctx.lineJoin='round';
    // Glowing rescue bubble.
    circle(0,0,57,'#fff8c92c','#ffe293',game.stars>=3?4:2);star(39,-47,8,'#ffdd84');star(-48,26,7,'#ffec9d');
    oval(29,0,25,38,'#bb7650',-.4);oval(35,-7,13,22,'#f5c78a',-.3);
    oval(0,17,24,32,'#c78854');oval(0,22,13,24,'#ffdb9e');
    polygon([[-22,-24],[-24,-52],[-5,-29]],'#c48d60','#85506b',2);polygon([[10,-29],[27,-50],[25,-17]],'#c48d60','#85506b',2);
    circle(0,-15,28,'#cd8b5a','#89566e',2);oval(0,-3,17,13,'#ffdda8');circle(-9,-19,3.5,'#2d263c');circle(10,-19,3.5,'#2d263c');circle(0,-7,4,'#8a5376');
    oval(-14,27,9,13,'#be7b50');oval(13,27,9,13,'#be7b50');
    ctx.restore();}
  function drawDragon(x,y){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(game.t*1.3)*.035);
    // The story's dragon watches from the hill.
    polygon([[-46,9],[-100,-32],[-102,20],[-67,0],[-70,44]],'#e66c55','#ffc06a',3);
    polygon([[39,4],[93,-28],[87,26],[61,7],[68,44]],'#dd694e','#ffc068',3);
    oval(0,24,47,32,'#e68a51');oval(0,31,20,23,'#ffd17e');
    oval(0,-13,46,35,'#e06b4e');oval(6,1,35,15,'#f5a15a');
    polygon([[-29,-31],[-35,-69],[-5,-39]],'#ffc371','#aa4c57',3);polygon([[25,-35],[38,-74],[48,-31]],'#ffbf6a','#a44f5b',3);
    circle(-14,-22,7,'white');circle(18,-22,7,'white');circle(-13,-21,4,'#372848');circle(19,-21,4,'#372848');
    circle(24,4,4,'#8d4b58');ctx.restore();}
  function drawFlame(f){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(-Math.PI/2+Math.sin(f.r)*.12);ctx.shadowColor='#ff8a35';ctx.shadowBlur=22;
    const sz=f.size;
    path(c=>{c.moveTo(0,-sz*1.45);c.bezierCurveTo(sz*.8,-sz*.45,sz*1.1,sz*.3,0,sz);c.bezierCurveTo(-sz*1.2,sz*.3,-sz*.7,-sz*.7,0,-sz*1.45);},'#ff783a','#ffce7e',2);
    path(c=>{c.moveTo(0,-sz*.75);c.bezierCurveTo(sz*.4,-sz*.1,sz*.5,sz*.5,0,sz*.62);c.bezierCurveTo(-sz*.5,sz*.4,-sz*.4,-sz*.22,0,-sz*.75);},'#ffe06f');
    ctx.shadowBlur=0;ctx.restore();}
  function frame(stamp){if(!game.lastFrame)game.lastFrame=stamp;const dt=Math.min(.05,Math.max(0,(stamp-game.lastFrame)/1000));game.lastFrame=stamp;if(state.activeTab==='dragon')update(dt);if(state.activeTab==='dragon')drawScene();game.animationId=requestAnimationFrame(frame);}resetWorld();frame(performance.now());
})();
