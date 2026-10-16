'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const outfits = {
    alicia:{
      name:'Alicia Felicia',description:'Nuestra exploradora del bosque encantado',
      hair:'#75452b', skin:'#f6d4bc', curls:true,
      dress:[
        {name:'Vestido del bosque',type:'apron',color:'#5e9658',light:'#a0c285',trim:'#fff0c8'},
        {name:'Vestido de flores',type:'petal',color:'#ee94b5',light:'#ffcfdf',trim:'#fff7ee'},
        {name:'Vestido de fiesta',type:'balloon',color:'#9d7acd',light:'#d7bcf3',trim:'#ffffff'},
        {name:'Vestido de gala',type:'layered',color:'#ddb85e',light:'#f5dfa0',trim:'#fff8ec'}
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
        {name:'Vestido real rosa',type:'ballgown',color:'#f49ac9',light:'#ffe0ed',trim:'#fff9ff'},
        {name:'Vestido celeste',type:'frill',color:'#7bb9df',light:'#d8f4ff',trim:'#fffdf8'},
        {name:'Vestido lila',type:'ruffle',color:'#ad86e2',light:'#e6d9ff',trim:'#fffafd'},
        {name:'Vestido dorado',type:'sun',color:'#e3b857',light:'#faeab0',trim:'#fff8e8'}
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
    let skirt='';
    switch(d.type){
      case 'apron': skirt='<path d="M-50 43 Q0 75 50 43 L70 249 H-70Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="6"/><path d="M-21 78 L21 78 L27 214 L-27 214 Z" fill="'+d.light+'" opacity=".75"/><rect x="-18" y="55" width="36" height="16" rx="7" fill="'+d.trim+'"/>';break;
      case 'petal': skirt='<path d="M-54 42 Q0 73 54 42 C38 100 24 134 8 164 C32 184 55 212 75 248 H-75 C-55 212 -32 184 -8 164 C-24 134 -38 100 -54 42Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="6"/><path d="M-35 115 Q0 137 35 115" fill="none" stroke="'+d.light+'" stroke-width="7"/>';break;
      case 'balloon': skirt='<path d="M-55 43 Q0 73 55 43 C83 96 92 186 68 248 H-68 C-92 186 -83 96 -55 43Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="6"/><circle cx="0" cy="125" r="9" fill="'+d.trim+'"/>';break;
      case 'layered': skirt='<path d="M-55 42 Q0 73 55 42 L70 114 Q0 144 -70 114Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="5"/><path d="M-70 114 Q0 151 70 114 L82 181 Q0 216 -82 181Z" fill="'+d.light+'" stroke="'+d.trim+'" stroke-width="5"/><path d="M-82 181 Q0 213 82 181 L88 249 H-88Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="5"/>';break;
      case 'ballgown': skirt='<path d="M-55 42 Q0 73 55 42 C90 90 110 178 105 249 H-105 C-110 178 -90 90 -55 42Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="6"/><path d="M-73 136 Q0 109 73 136" fill="none" stroke="'+d.light+'" stroke-width="8"/>';break;
      case 'frill': skirt='<path d="M-54 42 Q0 73 54 42 L72 104 Q0 139 -72 104Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="5"/><path d="M-72 104 Q0 142 72 104 L85 168 Q0 207 -85 168Z" fill="'+d.light+'" stroke="'+d.trim+'" stroke-width="5"/><path d="M-85 168 Q0 210 85 168 L94 249 H-94Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="5"/>';break;
      case 'ruffle': skirt='<path d="M-55 43 Q0 73 55 43 C56 78 86 103 82 139 C78 188 72 221 64 249 H-64 C-72 221 -78 188 -82 139 C-86 103 -56 78 -55 43Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="6"/><path d="M-51 101 Q0 83 51 101 M-57 152 Q0 132 57 152" fill="none" stroke="'+d.light+'" stroke-width="8"/>';break;
      default: skirt='<path d="M-55 43 Q0 73 55 43 L86 249 H-86 Z" fill="'+d.color+'" stroke="'+d.trim+'" stroke-width="6"/><path d="M-40 111 L0 89 L40 111" stroke="'+d.light+'" stroke-width="7" fill="none"/>';break;
    }
    S.push(skirt);
    S.push('<path d="M-46 -14 Q0 -38 46 -14 L52 61 Q0 94 -52 61 Z" fill="'+d.light+'" stroke="'+d.trim+'" stroke-width="5"/>');
    S.push('<path d="M-48 15 Q-72 37 -87 112 M48 15 Q72 37 87 112" stroke="'+who.skin+'" stroke-width="23" stroke-linecap="round"/>');
    S.push('<ellipse cx="-58" cy="25" rx="22" ry="24" fill="'+d.light+'"/><ellipse cx="58" cy="25" rx="22" ry="24" fill="'+d.light+'"/>');
    S.push('<rect x="-20" y="65" width="40" height="17" rx="8" fill="'+d.trim+'"/>');
    // La silueta capilar conserva las principales características del personaje.
    S.push('<path d="M-73 -91 C-83 -163 83 -163 76 -91 L70 -42 Q62 -75 43 -105 Q0 -133 -43 -105 Q-66 -74 -68 -43Z" fill="'+who.hair+'"/>');
    if(who.curls)S.push('<path d="M-63 -85 C-100 -39 -97 42 -69 67" stroke="'+who.hair+'" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M63 -85 C100 -39 97 42 69 67" stroke="'+who.hair+'" stroke-width="20" fill="none" stroke-linecap="round"/>');
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

  // Previews are original SVG garment/accessory illustrations, not color swatches.
  function garmentPreview(group,entry) {
    const a=entry.color, b=entry.light||'#ffe9c8', c=entry.trim||'#fff9eb';
    if(group==='dress') {
      let hem='';
      if(entry.type==='apron') hem='<path d="M18 50 l-8 60 h84 l-8-60 Q52 72 18 50z" fill="'+a+'"/><path d="M42 59 h20 v38 H42z" fill="'+b+'" opacity=".8"/>';
      else if(entry.type==='petal') hem='<path d="M18 50 Q30 76 14 110 H94 Q78 78 86 50 Q52 70 18 50z" fill="'+a+'"/><path d="M17 95 Q52 112 87 95" stroke="'+c+'" stroke-width="5" fill="none"/>';
      else if(entry.type==='balloon') hem='<path d="M18 50 C-2 74 2 98 13 110 H91 C102 98 106 74 86 50 Q52 69 18 50z" fill="'+a+'"/><circle cx="52" cy="91" r="5" fill="'+c+'"/>';
      else if(entry.type==='layered') hem='<path d="M18 51 Q52 70 86 51 L94 70 H10Z" fill="'+a+'"/><path d="M10 70 Q52 91 94 70 L100 89 H4Z" fill="'+b+'"/><path d="M4 89 Q52 106 100 89 L104 110 H0Z" fill="'+a+'"/>';
      else if(entry.type==='ballgown') hem='<path d="M18 51 Q52 69 86 51 C100 70 107 92 109 110 H-5 C-3 92 4 70 18 51Z" fill="'+a+'"/><path d="M20 79 Q52 66 84 79" fill="none" stroke="'+c+'" stroke-width="4"/>';
      else if(entry.type==='frill') hem='<path d="M18 51 Q52 69 86 51 L94 71 Q52 91 10 71Z" fill="'+a+'"/><path d="M10 71 Q52 93 94 71 L105 110 H-1Z" fill="'+b+'"/>';
      else if(entry.type==='ruffle') hem='<path d="M18 51 Q52 69 86 51 C72 78 100 94 91 110 H13 C4 94 32 78 18 51Z" fill="'+a+'"/><path d="M22 81 Q52 69 82 81 M21 95 Q52 85 83 95" fill="none" stroke="'+c+'" stroke-width="4"/>';
      else hem='<path d="M18 51 Q52 70 86 51 L103 110 H1 Z" fill="'+a+'"/><path d="M30 80 L52 69 L74 80" stroke="'+c+'" stroke-width="4" fill="none"/>';
      return '<svg viewBox="0 0 104 124" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M34 23 Q52 9 70 23 L86 50 Q52 70 18 50Z" fill="'+b+'" stroke="'+c+'" stroke-width="3"/>'+hem+'<rect x="44" y="52" width="16" height="8" rx="4" fill="'+c+'"/></svg>';
    }
    if(group==='shoes')return '<svg viewBox="0 0 104 124" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="32" cy="79" rx="23" ry="11" fill="'+a+'" stroke="'+b+'" stroke-width="5"/><ellipse cx="73" cy="79" rx="23" ry="11" fill="'+a+'" stroke="'+b+'" stroke-width="5"/><path d="M22 76 H42 M63 76 H83" stroke="#fff5e2" stroke-width="3"/></svg>';
    if(group==='cape')return entry.color==='none'?
      '<svg viewBox="0 0 104 124" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M23 66 Q52 43 81 66" stroke="#ae9dbd" stroke-width="5" fill="none"/><text x="52" y="92" text-anchor="middle" font-family="Arial" font-size="14" fill="#836b99">Sin capa</text></svg>':
      '<svg viewBox="0 0 104 124" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M33 17 Q52 7 71 17 C88 53 90 88 78 111 L55 83 H49 L26 111 C14 88 16 53 33 17Z" fill="'+a+'" stroke="'+b+'" stroke-width="5"/></svg>';
    if(group==='crown') {
      let art=entry.type==='flowers'?
        '<path d="M17 76 Q52 47 87 76" stroke="#71a16c" stroke-width="5" fill="none"/>'+[26,43,60,78].map(x=>'<circle cx="'+x+'" cy="68" r="10" fill="'+a+'" stroke="#fff4bb" stroke-width="3"/>').join(''):
        entry.type==='hearts'?
        '<path d="M17 78 Q52 54 87 78" stroke="#c3915d" stroke-width="5" fill="none"/>'+[30,52,74].map(x=>'<path d="M'+(x-7)+' 60 c-8-8-18 4-7 13 l7 7 7-7 c11-9 1-21-7-13z" fill="'+a+'" stroke="#fff7ee" stroke-width="2"/>').join(''):
        entry.type==='stars'?
        '<path d="M17 79 Q52 54 87 79" stroke="#ae89ca" stroke-width="5" fill="none"/>'+[31,52,73].map(x=>'<path d="M'+x+' 47 l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="'+a+'" stroke="#fff2d1" stroke-width="2"/>').join(''):
        '<path d="M19 78 L27 50 L41 67 L52 38 L63 67 L77 50 L85 78Z" fill="'+a+'" stroke="#ba8b45" stroke-width="4"/><circle cx="52" cy="60" r="7" fill="#fff9c7"/>';
      return '<svg viewBox="0 0 104 124" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+art+'</svg>';
    }
    let icon='';
    if(entry.type==='bag')icon='<path d="M37 50 Q37 26 52 26 Q67 26 67 50" stroke="#f4dfad" stroke-width="5" fill="none"/><rect x="29" y="48" width="46" height="48" rx="11" fill="'+a+'" stroke="#e7cc90" stroke-width="4"/>';
    else if(entry.type==='butterfly')icon='<ellipse cx="37" cy="52" rx="20" ry="14" fill="'+a+'"/><ellipse cx="67" cy="52" rx="20" ry="14" fill="#d5bdff"/><ellipse cx="40" cy="75" rx="14" ry="12" fill="#e7dcff"/><ellipse cx="64" cy="75" rx="14" ry="12" fill="#b6efff"/><path d="M52 42 v43" stroke="#71548e" stroke-width="5"/>';
    else if(entry.type==='wand')icon='<path d="M30 100 L68 35" stroke="#c68b9c" stroke-width="7"/><path d="M68 18 l6 14 15 1-11 10 3 15-13-8-13 8 3-15-11-10 15-1z" fill="'+a+'" stroke="#fff4ca" stroke-width="3"/>';
    else if(entry.type==='teddy')icon='<circle cx="52" cy="46" r="22" fill="'+a+'"/><circle cx="35" cy="28" r="10" fill="'+a+'"/><circle cx="69" cy="28" r="10" fill="'+a+'"/><ellipse cx="52" cy="80" rx="25" ry="29" fill="'+a+'"/><circle cx="45" cy="47" r="3" fill="#553b29"/><circle cx="59" cy="47" r="3" fill="#553b29"/>';
    else if(entry.type==='gem')icon='<path d="M52 28 L78 54 L65 90 H39 L26 54 Z" fill="'+a+'" stroke="#fff2d2" stroke-width="5"/><path d="M52 36 L64 56 L52 82 L40 56Z" fill="#ffeafa"/>';
    else icon='<path d="M52 42 v50" stroke="#72ab70" stroke-width="5"/>'+[[-13,0],[13,0],[0,-14],[0,13]].map(([x,y])=>'<circle cx="'+(52+x)+'" cy="'+(51+y)+'" r="13" fill="'+a+'"/>').join('')+'<circle cx="52" cy="51" r="6" fill="#fff0a1"/>';
    return '<svg viewBox="0 0 104 124" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+icon+'</svg>';
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
        const preview=document.createElement('span');preview.className='vestidor-thumbnail';
        preview.innerHTML=garmentPreview(group,entry);
        const label=document.createElement('span');label.className='vestidor-choice-label';label.textContent=entry.name;
        b.append(preview,label);
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
      save();repaint();phrase('🌸 ¡Volvimos al vestuario original!');
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