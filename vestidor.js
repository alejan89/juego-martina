'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const outfits = {
    alicia:{
      name:'Alicia Felicia',description:'Nuestra exploradora del bosque encantado',
      hair:'#75452b', skin:'#f6d4bc', curls:true,
      dress:[
        {name:'Verde del bosque',color:'#5e9658',light:'#a0c285',trim:'#fff0c8'},
        {name:'Rosa de las flores',color:'#ee94b5',light:'#ffcfdf',trim:'#fff7ee'},
        {name:'Lila encantado',color:'#9d7acd',light:'#d7bcf3',trim:'#ffffff'},
        {name:'Dorado del sol',color:'#ddb85e',light:'#f5dfa0',trim:'#fff8ec'}
      ],
      crown:[
        {name:'Flores silvestres',color:'#ffaccc',type:'flowers'},
        {name:'Corona dorada',color:'#efc864',type:'royal'},
        {name:'Estrellas mágicas',color:'#b9b5ff',type:'stars'}
      ],
      cape:[
        {name:'Capa verde',color:'#447a53',light:'#86b68e'},
        {name:'Capa violeta',color:'#7652aa',light:'#b5a0df'},
        {name:'Capa rosada',color:'#d87db2',light:'#ffbcdb'},
        {name:'Sin capa',color:'none',light:'none'}
      ],
      shoes:[
        {name:'Botitas del bosque',color:'#885a3c',light:'#ad7b50'},
        {name:'Zapatitos rosas',color:'#ef9abc',light:'#ffd4e5'},
        {name:'Zapatos dorados',color:'#d6a444',light:'#f4df9d'}
      ],
      accessory:[
        {name:'Bolso mágico',color:'#a77350',type:'bag'},
        {name:'Mariposa azul',color:'#72bee8',type:'butterfly'},
        {name:'Varita brillante',color:'#f1d77c',type:'wand'},
        {name:'Flores del bosque',color:'#ffb1d4',type:'bouquet'}
      ]
    },
    martina:{
      name:'Princesa Martina',description:'Nuestra pequeña princesa de cabellos dorados',
      hair:'#f0cb73',skin:'#fbe0ca',curls:false,
      dress:[
        {name:'Rosa de princesa',color:'#f49ac9',light:'#ffe0ed',trim:'#fff9ff'},
        {name:'Celeste de estrellas',color:'#7bb9df',light:'#d8f4ff',trim:'#fffdf8'},
        {name:'Lila de fantasía',color:'#ad86e2',light:'#e6d9ff',trim:'#fffafd'},
        {name:'Dorado brillante',color:'#e3b857',light:'#faeab0',trim:'#fff8e8'}
      ],
      crown:[
        {name:'Corona real',color:'#e8bd5b',type:'royal'},
        {name:'Corona de corazones',color:'#f58bb9',type:'hearts'},
        {name:'Flores encantadas',color:'#ffc1d1',type:'flowers'}
      ],
      cape:[
        {name:'Capa rosada',color:'#d878af',light:'#f6bbda'},
        {name:'Capa brillante',color:'#d8a657',light:'#fdebb3'},
        {name:'Capa celeste',color:'#6fafe0',light:'#b8e1fa'},
        {name:'Sin capa',color:'none',light:'none'}
      ],
      shoes:[
        {name:'Zapatos rosados',color:'#ed9fc0',light:'#ffe1eb'},
        {name:'Zapatos reales',color:'#d4aa53',light:'#fceab2'},
        {name:'Zapatos celestes',color:'#80bde2',light:'#d6f1ff'}
      ],
      accessory:[
        {name:'Osito cariñoso',color:'#ba885c',type:'teddy'},
        {name:'Gema mágica',color:'#ec8fb8',type:'gem'},
        {name:'Varita de estrella',color:'#f3d37a',type:'wand'},
        {name:'Flor encantada',color:'#f7b3d1',type:'bouquet'}
      ]
    }
  };
  const groups=[['dress','👗 Vestidos'],['crown','👑 Coronas y diademas'],['cape','✨ Capas'],['shoes','👠 Zapatos'],['accessory','🪄 Accesorios']];
  const defaults=()=>({alicia:{dress:0,crown:0,cape:0,shoes:0,accessory:0},martina:{dress:0,crown:0,cape:0,shoes:0,accessory:0}});
  const state={who:'alicia',choices:defaults(),music:true,audio:null};
  try{
    const old=JSON.parse(localStorage.getItem('martinaVestidor')||'null');
    if(old&&outfits[old.who]&&old.choices) {
      state.who=old.who;
      for(const w of ['alicia','martina'])for(const [k] of groups) {
        const i=old.choices[w]&&old.choices[w][k];
        if(Number.isInteger(i)&&i>=0&&i<outfits[w][k].length)state.choices[w][k]=i;
      }
    }
    state.music=localStorage.getItem('martinaVestidorMusica')!=='off';
  }catch(_){}
  const save=()=>{
    try{localStorage.setItem('martinaVestidor',JSON.stringify({who:state.who,choices:state.choices}));}catch(_){}
  };
  const person=()=>outfits[state.who];
  const chosen=k=>person()[k][state.choices[state.who][k]];
  const phrase=t=>{$('#vestidorMessage').textContent=t;};
  function crown(){
    const c=chosen('crown');
    const gold=c.color;
    if(c.type==='flowers')return '<path d="M-58 -144 Q0 -165 58 -144" fill="none" stroke="#619d60" stroke-width="7"/>'+[-45,-20,5,30,50].map((x,i)=>'<g transform="translate('+x+' -152)"><circle r="13" fill="'+(i%2?'#fff0a8':gold)+'"/><circle r="5" fill="#fff9f0"/></g>').join('');
    if(c.type==='hearts')return '<path d="M-56 -141 Q0 -160 56 -141" fill="none" stroke="#b88751" stroke-width="6"/>'+[-30,0,30].map(x=>'<path d="M'+(x-12)+' -167 c-14-15-32 6-12 21 l12 11 12-11 c20-15 2-36-12-21z" fill="'+gold+'" stroke="#fff4fd" stroke-width="3" transform="translate(12 0)"/>').join('');
    if(c.type==='stars')return '<path d="M-54 -142 Q0 -161 54 -142" stroke="#c8b1e2" stroke-width="6" fill="none"/>'+[-35,0,35].map(x=>'<path d="M'+x+' -176 l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="'+gold+'" stroke="#fff3bc" stroke-width="3"/>').join('');
    return '<path d="M-62 -136 L-50 -173 L-25 -150 L0 -183 L25 -150 L50 -173 L62 -136 L60 -128 L-60 -128 Z" fill="'+gold+'" stroke="#bd8135" stroke-width="5"/><circle cy="-153" r="9" fill="#fff8cd"/><circle cx="-39" cy="-140" r="5" fill="#fff9e2"/><circle cx="39" cy="-140" r="5" fill="#fff9e2"/>';
  }
  function item(){
    const a=chosen('accessory');
    const p=a.color;
    if(a.type==='wand')return '<g transform="translate(95 135) rotate(25)"><rect x="-4" y="-50" width="8" height="92" rx="4" fill="#bd85ac"/><path d="M0 -88 l11 25 27 3-20 18 6 27-24-13-24 13 6-27-20-18 27-3z" fill="'+p+'" stroke="#fff8e0" stroke-width="4"/></g>';
    if(a.type==='teddy')return '<g transform="translate(98 150)"><ellipse cx="0" cy="12" rx="29" ry="34" fill="'+p+'"/><circle cy="-23" r="23" fill="'+p+'"/><circle cx="-19" cy="-41" r="9" fill="'+p+'"/><circle cx="19" cy="-41" r="9" fill="'+p+'"/><ellipse cy="-17" rx="12" ry="10" fill="#f6dcbb"/><circle cx="-8" cy="-29" r="3" fill="#55372b"/><circle cx="8" cy="-29" r="3" fill="#55372b"/><circle cy="-20" r="3" fill="#55372b"/><ellipse cy="15" rx="16" ry="21" fill="#f0c99b"/></g>';
    if(a.type==='gem')return '<g transform="translate(98 149)"><path d="M-30 -13 L-14 -34 L15 -34 L30 -13 L0 32 Z" fill="'+p+'" stroke="#fff3ca" stroke-width="5"/><path d="M-14 -32 L0 24 L15 -32" stroke="#ffe3f1" stroke-width="4" fill="none"/></g>';
    if(a.type==='butterfly')return '<g transform="translate(99 140)"><ellipse cx="-14" cy="-12" rx="20" ry="15" fill="'+p+'"/><ellipse cx="14" cy="-12" rx="20" ry="15" fill="#cbb8ff"/><ellipse cx="-12" cy="9" rx="14" ry="11" fill="#b8e7fc"/><ellipse cx="12" cy="9" rx="14" ry="11" fill="#f5c5ff"/><rect x="-3" y="-20" width="6" height="42" rx="3" fill="#7a6298"/></g>';
    if(a.type==='bag')return '<g transform="translate(99 141)"><path d="M-23 -16 Q-23 -46 0 -46 Q23 -46 23 -16" fill="none" stroke="#ddc593" stroke-width="7"/><rect x="-32" y="-20" width="64" height="61" rx="15" fill="'+p+'" stroke="#f1dbb0" stroke-width="5"/><path d="M-12 10 l12 -11 12 11" stroke="#fceba6" stroke-width="5" fill="none"/></g>';
    return '<g transform="translate(98 138)"><path d="M0 -10 l9 64" stroke="#6caf7b" stroke-width="7"/> '+[-22,0,23].map((x,i)=>'<circle cx="'+x+'" cy="'+(-15+(i%2)*17)+'" r="16" fill="'+p+'" stroke="#fff2c2" stroke-width="4"/>').join('')+'<circle cy="-4" r="9" fill="#fff0a8"/></g>';
  }
  function svgMarkup(){
    const who=person();
    const d=chosen('dress'),cp=chosen('cape'),sh=chosen('shoes');
    const S=['<svg xmlns="http://www.w3.org/2000/svg" width="520" height="610" viewBox="0 0 520 610" role="img" aria-label="'+who.name+' vestida para una aventura mágica">'];
    S.push('<defs><linearGradient id="fairyBg" x2="1" y2="1"><stop stop-color="#fff8eb"/><stop offset="1" stop-color="#f5e8ff"/></linearGradient><radialGradient id="fairyLight"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#ffe4e6"/></radialGradient></defs>');
    S.push('<rect width="520" height="610" rx="28" fill="url(#fairyBg)"/>');
    S.push('<g opacity=".65" fill="#f6ca88"><circle cx="70" cy="93" r="5"/><circle cx="460" cy="123" r="8"/><circle cx="35" cy="420" r="6"/><circle cx="478" cy="448" r="5"/><circle cx="420" cy="55" r="4"/></g>');
    S.push('<ellipse cx="260" cy="542" rx="116" ry="20" fill="#9275a8" opacity=".19"/>');
    S.push('<g transform="translate(260 245)">');
    if(cp.color!=='none')S.push('<path d="M-58 -4 C-124 0 -131 126 -98 255 Q-52 281 -28 206 L24 205 Q57 281 100 255 C135 126 125 0 58 -4Z" fill="'+cp.color+'" stroke="'+cp.light+'" stroke-width="7"/>');
    S.push('<path d="M-31 207 V286 M31 207 V286" stroke="'+who.skin+'" stroke-width="23" stroke-linecap="round"/>');
    S.push('<ellipse cx="-36" cy="295" rx="36" ry="17" fill="'+sh.color+'" stroke="'+sh.light+'" stroke-width="6"/><ellipse cx="36" cy="295" rx="36" ry="17" fill="'+sh.color+'" stroke="'+sh.light+'" stroke-width="6"/>');
    S.push('<path d="M-48 40 Q0 8 48 40 C78 118 104 186 84 253 Q0 272 -84 253 C-104 186 -78 118 -48 40Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="7"/>');
    S.push('<path d="M-73 206 Q0 240 73 206 M-57 137 Q0 167 57 137" stroke="'+d.light+'" stroke-width="7" fill="none" opacity=".7"/>');
    S.push('<path d="M-46 -14 Q0 -38 46 -14 L52 61 Q0 94 -52 61 Z" fill="'+d.light+'" stroke="'+d.trim+'" stroke-width="5"/>');
    S.push('<path d="M-48 15 Q-72 37 -87 112 M48 15 Q72 37 87 112" stroke="'+who.skin+'" stroke-width="23" stroke-linecap="round"/>');
    S.push('<ellipse cx="-58" cy="25" rx="22" ry="24" fill="'+d.light+'"/><ellipse cx="58" cy="25" rx="22" ry="24" fill="'+d.light+'"/>');
    S.push('<rect x="-20" y="65" width="40" height="17" rx="8" fill="'+d.trim+'"/>');
    // La silueta capilar conserva las principales características del personaje.
    S.push('<path d="M-69 -87 C-79 -157 79 -163 73 -87 L82 22 Q67 57 47 65 L-48 65 Q-82 38 -82 -5 Z" fill="'+who.hair+'"/>');
    if(who.curls)S.push([-67,-52,-37,40,53,68].map((x,i)=>'<circle cx="'+x+'" cy="'+(i%2?10:34)+'" r="21" fill="'+who.hair+'"/>').join(''));
    S.push('<ellipse cx="0" cy="-76" rx="61" ry="70" fill="'+who.skin+'"/>');
    S.push('<path d="M-63 -90 Q-72 -149 -14 -149 Q38 -148 68 -103 Q42 -111 14 -121 Q-24 -104 -61 -96 Z" fill="'+who.hair+'"/>');
    if(who.curls)S.push('<path d="M-52 -117 Q-12 -153 17 -129 Q5 -108 -15 -112 Q-31 -91 -55 -89Z" fill="'+who.hair+'"/>');
    else S.push('<path d="M45 -119 Q22 -104 12 -108 Q-9 -102 -48 -107" stroke="#ffe79f" stroke-width="10" fill="none"/>');
    S.push('<ellipse cx="-22" cy="-74" rx="7" ry="9" fill="#3d2c4b"/><ellipse cx="22" cy="-74" rx="7" ry="9" fill="#3d2c4b"/>');
    S.push('<circle cx="-24" cy="-78" r="2.5" fill="#fff"/><circle cx="20" cy="-78" r="2.5" fill="#fff"/>');
    S.push('<circle cx="-42" cy="-53" r="12" fill="#f6a9ac" opacity=".65"/><circle cx="42" cy="-53" r="12" fill="#f6a9ac" opacity=".65"/>');
    S.push('<path d="M-14 -43 Q0 -29 14 -43" stroke="#bd6b75" stroke-width="4" fill="none" stroke-linecap="round"/>');
    S.push(crown());S.push(item());
    S.push('</g>');
    S.push('<rect x="75" y="556" rx="20" width="370" height="38" fill="#fffaf1" stroke="#edd4ab" stroke-width="3"/>');
    S.push('<text x="260" y="581" text-anchor="middle" font-size="22" font-family="Arial, sans-serif" font-weight="bold" fill="#674076">'+who.name+'</text>');
    S.push('</svg>');
    return S.join('');
  }
  function repaint(){
    $('#vestidorName').textContent=person().name;
    $('#vestidorDesc').textContent=person().description;
    $('#vestidorDoll').innerHTML=svgMarkup();
    $$('.vestidor-princess').forEach(b=>{
      const active=b.dataset.princess===state.who;
      b.classList.toggle('is-on',active);b.setAttribute('aria-pressed',String(active));
    });
    $('#vestidorControls').replaceChildren();
    for(const [group,title] of groups){
      const wrapper=document.createElement('section');wrapper.className='vestidor-box';
      const heading=document.createElement('h4');heading.textContent=title;wrapper.append(heading);
      const grid=document.createElement('div');grid.className='vestidor-options';
      person()[group].forEach((entry,i)=>{
        const b=document.createElement('button');b.type='button';b.className='vestidor-option';
        const active=state.choices[state.who][group]===i;
        b.classList.toggle('is-on',active);b.setAttribute('aria-pressed',String(active));
        const swatch=document.createElement('span');swatch.className='vestidor-swatch';
        swatch.style.background=entry.color==='none'?'linear-gradient(135deg,#f0f0f0 49%,#df8dab 50%)':entry.color;
        const label=document.createElement('span');label.textContent=entry.name;
        b.append(swatch,label);
        b.addEventListener('click',()=>{
          state.choices[state.who][group]=i;save();repaint();phrase('✨ ¡Elegiste '+entry.name.toLowerCase()+'!');
        });grid.append(b);
      });
      wrapper.append(grid);$('#vestidorControls').append(wrapper);
    }
  }
  function ensureAudio(){
    if(!state.audio){state.audio=new Audio('assets/musica/final.mp3');state.audio.loop=true;state.audio.volume=.14;}
  }
  function refreshMusic(){
    $('#vestidorMusicText').textContent=state.music?'Sí':'No';
    $('#vestidorMusic').setAttribute('aria-pressed',String(state.music));
  }
  function playMusic(){
    refreshMusic();if(!state.music)return;
    if($('#panel-dress').hidden)return;
    if($('#soundToggle')&&$('#soundToggle').getAttribute('aria-pressed')==='false')return;
    ensureAudio();const p=state.audio.play();if(p&&p.catch)p.catch(()=>{});
  }
  window.vestidorEnter=()=>{playMusic();};
  window.vestidorLeave=()=>{if(state.audio)state.audio.pause();};
  function saveImage(){
    const image=new Image();
    const xml=svgMarkup();
    const url=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));
    image.onload=()=>{
      const canvas=document.createElement('canvas');canvas.width=1040;canvas.height=1220;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#fff8ef';ctx.fillRect(0,0,1040,1220);
      ctx.drawImage(image,0,0,1040,1220);
      canvas.toBlob(blob=>{
        if(!blob){phrase('No se pudo guardar la imagen.');URL.revokeObjectURL(url);return;}
        const png=URL.createObjectURL(blob);const a=document.createElement('a');
        a.href=png;a.download='Princesa-'+state.who+'-vestido-magico.png';
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(png),1200);
        phrase('💖 ¡Tu princesa está lista para guardar!');
        URL.revokeObjectURL(url);
      },'image/png');
    };
    image.onerror=()=>{phrase('No se pudo generar la imagen.');URL.revokeObjectURL(url);};
    image.src=url;
  }
  function init(){
    if(!$('#panel-dress'))return;
    $$('.vestidor-princess').forEach(b=>b.addEventListener('click',()=>{
      state.who=b.dataset.princess;save();repaint();
      phrase('💖 ¡Ahora vestimos a '+person().name+'!');
    }));
    $('#vestidorSurprise').addEventListener('click',()=>{
      for(const [group] of groups)state.choices[state.who][group]=Math.floor(Math.random()*person()[group].length);
      save();repaint();phrase('✨ ¡Sorpresa! ¡Qué conjunto mágico!');
    });
    $('#vestidorReset').addEventListener('click',()=>{
      for(const [group] of groups)state.choices[state.who][group]=0;
      save();repaint();phrase('🌸 ¡Volvimos a los colores del cuento!');
    });
    $('#vestidorSave').addEventListener('click',saveImage);
    $('#vestidorMusic').addEventListener('click',()=>{
      state.music=!state.music;
      try{localStorage.setItem('martinaVestidorMusica',state.music?'on':'off');}catch(_){}
      if(state.music)playMusic();else if(state.audio)state.audio.pause();
      refreshMusic();
    });
    if($('#soundToggle'))$('#soundToggle').addEventListener('click',()=>{
      setTimeout(()=>{if($('#soundToggle').getAttribute('aria-pressed')==='false')window.vestidorLeave();else playMusic();},0);
    });
    refreshMusic();repaint();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();