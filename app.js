(() => {
'use strict';
const $ = (id) => document.getElementById(id);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const HOTEL = {lat:39.5384, lon:2.4495, label:"l’hôtel"};
const LIVE_DEFAULT = {lat:39.5384, lon:2.4495, name:'Peguera'};
let distanceOrigin = HOTEL;
let nowOrigin = HOTEL;
let currentConditions = {temp:null,wind:null,gust:null,rain:null,wave:null};
let favOnly = false;

function toast(text, ms=2200){ const el=$('toast'); if(!el)return; el.textContent=text; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),ms); }
function haversineKm(a,b){const R=6371,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon),la1=rad(a.lat),la2=rad(b.lat);const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function formatDistance(km){return km<1?`${Math.max(50,Math.round(km*1000/50)*50)} m`:`${km.toFixed(1)} km`;}
function compass(deg){const d=['N','NE','E','SE','S','SO','O','NO'];return d[Math.round((deg||0)/45)%8];}
function seaLabel(w){if(w==null)return '--';if(w<0.35)return 'très calme';if(w<0.7)return 'calme';if(w<1.2)return 'formée';return 'agitée';}
function geolocationMessage(err){
 if(!err)return 'Position indisponible.';
 if(err.code===1)return 'Localisation refusée. Ouvrez l’aide ci-dessous pour l’autoriser sur iPhone.';
 if(err.code===2)return 'Position momentanément indisponible. Réessayez près d’une fenêtre ou en extérieur.';
 if(err.code===3)return 'La localisation a expiré. Réessayez.';
 return 'Position indisponible.';
}
function requestPosition(onSuccess,onError){
 if(!navigator.geolocation){onError?.({code:0});return;}
 navigator.geolocation.getCurrentPosition(onSuccess,onError,{enableHighAccuracy:true,timeout:15000,maximumAge:120000});
}
function mapsDirections(dest, origin=distanceOrigin, mode='driving'){
 const o = origin===HOTEL ? 'Valentin Grand Park Suite Hotel Peguera' : `${origin.lat},${origin.lon}`;
 return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${dest.lat},${dest.lon}&travelmode=${mode}`;
}

function refreshDistances(origin){
 distanceOrigin=origin;
 $$('.spot[data-lat]').forEach(card=>{
  const dest={lat:Number(card.dataset.lat),lon:Number(card.dataset.lon)}, mode=card.dataset.travelmode||'driving';
  const el=card.querySelector('.distance-value'), route=card.querySelector('.route-link');
  if(origin===HOTEL){ if(el)el.textContent=`${card.dataset.hotelDistance} - ${card.dataset.hotelTime}`; }
  else { if(el)el.textContent=`${formatDistance(haversineKm(origin,dest))} à vol d’oiseau - trajet réel dans Maps`; }
  if(route)route.href=mapsDirections(dest,origin,mode);
 });
}

function activatePanel(hash, scroll=true){
 const id=(hash||location.hash||'#dashboard').replace('#','')||'dashboard';
 const target=$(id)||$('dashboard');
 $$('.app-panel').forEach(sec=>sec.classList.toggle('active-panel',sec===target));
 $$('.navbtn').forEach(x=>x.classList.toggle('active',x.getAttribute('href')==='#'+target.id));
 if(scroll) window.scrollTo({top:0,behavior:'instant'});
}
function setupNavigation(){
 $$('.navbtn, .home-action-grid a[href^="#"], a[href="#spots"]').forEach(a=>a.addEventListener('click',e=>{
  const h=a.getAttribute('href'); if(!h||!h.startsWith('#'))return; e.preventDefault(); history.replaceState(null,'',h); activatePanel(h);
 }));
 window.addEventListener('hashchange',()=>activatePanel(location.hash));
 activatePanel(location.hash||'#dashboard',false);
}
function setupChecksAndFavorites(){
 $$('[data-check]').forEach(el=>{const k='check_'+el.dataset.check;el.checked=localStorage.getItem(k)==='1';el.addEventListener('change',()=>localStorage.setItem(k,el.checked?'1':'0'));});
 $$('.favbtn').forEach(btn=>{const k='fav_'+btn.dataset.fav;const sync=()=>btn.textContent=localStorage.getItem(k)==='1'?'★ Favori':'☆ Favori';sync();btn.addEventListener('click',()=>{localStorage.setItem(k,localStorage.getItem(k)==='1'?'0':'1');sync();applySpotFilters();toast(btn.textContent.startsWith('★')?'Ajouté aux favoris':'Retiré des favoris');});});
}
function selectedValue(name, fallback){return document.querySelector(`input[name="${name}"]:checked`)?.id?.replace(name.replace('-filter','')+'-','')||fallback;}
function applySpotFilters(){
 const q=($('spotSearch')?.value||'').trim().toLowerCase();
 const typeId=document.querySelector('input[name="type-filter"]:checked')?.id||'type-all';
 const crowdId=document.querySelector('input[name="crowd-filter"]:checked')?.id||'crowd-all';
 const type=typeId.replace('type-',''),crowd=crowdId.replace('crowd-','');
 let shown=0;
 $$('#spotsGrid .spot').forEach(card=>{
  const key='fav_'+(card.querySelector('.favbtn')?.dataset.fav||'');
  const matchesText=!q||card.textContent.toLowerCase().includes(q)||(card.dataset.name||'').toLowerCase().includes(q);
  const normalized=(card.dataset.type||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const matchesType=type==='all'||normalized===type;
  const matchesCrowd=crowd==='all'||card.dataset.crowd===crowd;
  const matchesFav=!favOnly||localStorage.getItem(key)==='1';
  const visible=matchesText&&matchesType&&matchesCrowd&&matchesFav;
  card.classList.toggle('search-hidden',!visible); if(visible)shown++;
 });
 if($('spotsEmpty'))$('spotsEmpty').style.display=shown?'none':'block';
}
function setupFilters(){
 $('spotSearch')?.addEventListener('input',applySpotFilters);
 $$('.filter-radio').forEach(x=>x.addEventListener('change',applySpotFilters));
 $('favoritesOnly')?.addEventListener('click',()=>{favOnly=!favOnly;$('favoritesOnly').classList.toggle('active',favOnly);$('favoritesOnly').textContent=favOnly?'★ Favoris seulement':'☆ Favoris seulement';applySpotFilters();});
 $('clearSearch')?.addEventListener('click',()=>{if($('spotSearch'))$('spotSearch').value='';favOnly=false;if($('favoritesOnly')){$('favoritesOnly').classList.remove('active');$('favoritesOnly').textContent='☆ Favoris seulement';}document.querySelector('#type-all')?.click();document.querySelector('#crowd-all')?.click();applySpotFilters();});
}
function setupDistanceControls(){
 $('hotelDistanceBtn')?.addEventListener('click',()=>{refreshDistances(HOTEL);if($('distanceStatus'))$('distanceStatus').textContent='Distances pratiques depuis l’hôtel ; le bouton Itinéraire ouvre le trajet réel.';toast('Départ : hôtel');});
 $('geoDistanceBtn')?.addEventListener('click',()=>{
  const b=$('geoDistanceBtn'); if(b){b.classList.add('loading');b.textContent='Localisation…';}
  requestPosition(p=>{const o={lat:p.coords.latitude,lon:p.coords.longitude,label:'votre position'};refreshDistances(o);if($('distanceStatus'))$('distanceStatus').textContent=`Position détectée (±${Math.round(p.coords.accuracy)} m). Itinéraire réel via Maps.`;if(b){b.classList.remove('loading');b.textContent='Actualiser ma position';}toast('Distances recalculées');},err=>{if($('distanceStatus'))$('distanceStatus').textContent=geolocationMessage(err);if(b){b.classList.remove('loading');b.textContent='Depuis ma position';}$('locationHelp')?.setAttribute('open','');toast('Position non autorisée',3000);});
 });
 refreshDistances(HOTEL);
}
function makeRecommendation({temp,wind,gust,rain,wave}){if(rain>=3)return 'Pluie significative : Palma, shopping, cafés et visites couvertes.';if(gust>=45||wind>=30||wave>=1.2)return 'Vent ou mer défavorables : évitez le bateau léger ; privilégiez Palma ou les villages.';if(wind<=16&&wave<0.6&&rain<1)return 'Fenêtre mer favorable : bateau, snorkeling ou activité nautique le matin. Confirmez auprès du loueur.';if(temp>=33)return 'Chaleur forte : sortie tôt, pause au frais, plage ou piscine après 17 h.';if(wind<=24&&wave<0.9)return 'Conditions polyvalentes : Camp de Mar, Illetes tôt ou balade côtière.';return 'Journée adaptée à la marche et aux découvertes.';}
async function loadLiveWeather(coords=LIVE_DEFAULT){
 const dot=$('liveDot'),rec=$('recommendationText');if(dot)dot.className='status-dot warn';if(rec)rec.textContent=`Actualisation météo pour ${coords.name||'votre position'}…`;
 try{
  const wurl=`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto&wind_speed_unit=kmh`;
  const murl=`https://marine-api.open-meteo.com/v1/marine?latitude=${coords.lat}&longitude=${coords.lon}&current=wave_height,wave_period,sea_surface_temperature&timezone=auto&cell_selection=sea`;
  const [wr,mr]=await Promise.all([fetch(wurl),fetch(murl)]);if(!wr.ok)throw new Error('weather');
  const w=await wr.json(),m=mr.ok?await mr.json():{},c=w.current||{},mc=m.current||{};
  currentConditions={temp:c.temperature_2m||0,wind:c.wind_speed_10m||0,gust:c.wind_gusts_10m||0,rain:c.precipitation||0,wave:mc.wave_height||0};
  const vals={liveTemp:c.temperature_2m!=null?`${Math.round(c.temperature_2m)} °C`:'--',liveWind:c.wind_speed_10m!=null?`${Math.round(c.wind_speed_10m)} km/h ${compass(c.wind_direction_10m)}`:'--',liveGust:c.wind_gusts_10m!=null?`${Math.round(c.wind_gusts_10m)} km/h`:'--',liveRain:c.precipitation!=null?`${c.precipitation.toFixed(1)} mm`:'--',liveWave:mc.wave_height!=null?`${mc.wave_height.toFixed(1)} m`:'--',livePeriod:mc.wave_period!=null?`${mc.wave_period.toFixed(0)} s`:'--',liveSeaTemp:mc.sea_surface_temperature!=null?`${mc.sea_surface_temperature.toFixed(0)} °C`:'--',liveSeaRead:seaLabel(mc.wave_height)};
  Object.entries(vals).forEach(([id,v])=>{if($(id))$(id).textContent=v;});
  const msg=makeRecommendation(currentConditions);if(rec)rec.textContent=msg;if($('weatherUpdated'))$('weatherUpdated').textContent=`Mis à jour ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} - ${coords.name||'position actuelle'}`;if(dot)dot.className='status-dot ok';localStorage.setItem('liveCache',JSON.stringify({t:Date.now(),coords,w:c,m:mc,msg}));
 }catch(e){const cached=localStorage.getItem('liveCache');if(cached){const x=JSON.parse(cached);if(rec)rec.textContent=`Hors ligne - dernière lecture : ${x.msg}`;if(dot)dot.className='status-dot warn';if($('weatherUpdated'))$('weatherUpdated').textContent='Données en cache.';}else{if(rec)rec.textContent='Prévisions indisponibles. Utilisez Windy.';if(dot)dot.className='status-dot bad';}}
}
function setupWeather(){
 $('refreshLive')?.addEventListener('click',()=>loadLiveWeather(LIVE_DEFAULT));
 $('weatherHere')?.addEventListener('click',()=>requestPosition(p=>loadLiveWeather({lat:p.coords.latitude,lon:p.coords.longitude,name:'votre position'}),err=>{$('locationHelp')?.setAttribute('open','');toast(geolocationMessage(err),3500);}));
 loadLiveWeather(LIVE_DEFAULT);
}
const moodConfig={
 auto:{label:'Kairos',types:[]},
 plage:{label:'Plage / baignade',types:['Plage']},
 culture:{label:'Découverte / village',types:['Ville','Village','Port']},
 marche:{label:'Marcher',types:['Plage','Ville','Village','Port'],walkingOnly:true},
 mer:{label:'Mer / nautique',types:['Plage','Expérience','Port']},
 soir:{label:'Soirée / coucher de soleil',types:['Port','Ville','Expérience','Plage']}
};
function crowdPenalty(c){return c==='high'?24:c==='medium'?9:0;}
function timeOfDay(){const h=new Date().getHours();return h<11?'matin':h<17?'après-midi':h<20?'fin de journée':'soir';}
function parseExperienceScore(card){
 const text=[...card.querySelectorAll('.metric')].find(x=>x.textContent.includes('Score expérience'))?.querySelector('strong')?.textContent||'75';
 return Number.parseInt(text,10)||75;
}
function estimatedTravelHours(card,km){
 const walking=card.dataset.travelmode==='walking';
 return walking ? km/4.5 : km/38 + 0.12;
}
function isEligible(card,mood,duration,km){
 const cfg=moodConfig[mood]||moodConfig.auto;
 const type=card.dataset.type||'';
 if(mood!=='auto'&&!cfg.types.includes(type)) return false;
 if(cfg.walkingOnly && card.dataset.travelmode!=='walking' && km>4.5) return false;
 const oneWay=estimatedTravelHours(card,km);
 const minimumStay = type==='Expérience' ? 1.25 : type==='Ville'||type==='Village' ? 1 : 0.75;
 if((2*oneWay+minimumStay)>duration) return false;
 if(duration<=2 && km>15) return false;
 if(duration<=4 && km>35) return false;
 if(mood==='mer' && (currentConditions.gust>=45||currentConditions.wind>=30||currentConditions.wave>=1.2) && type==='Expérience') return false;
 return true;
}
function candidateScore(card,mood,duration){
 const dest={lat:+card.dataset.lat,lon:+card.dataset.lon},km=haversineKm(nowOrigin,dest),type=card.dataset.type,crowd=card.dataset.crowd;
 if(!isEligible(card,mood,duration,km)) return {score:-Infinity,km};
 let score=parseExperienceScore(card)-Math.min(38,km*1.45)-crowdPenalty(crowd);
 const tod=timeOfDay();
 if(mood==='plage'&&type==='Plage')score+=32;
 if(mood==='culture'&&(type==='Ville'||type==='Village'))score+=34;
 if(mood==='culture'&&type==='Port')score+=14;
 if(mood==='marche'&&card.dataset.travelmode==='walking')score+=42;
 if(mood==='mer'&&type==='Expérience')score+=38;
 if(mood==='mer'&&type==='Plage')score+=22;
 if(mood==='soir'&&(type==='Port'||type==='Ville'))score+=36;
 if(mood==='soir'&&type==='Expérience')score+=18;
 if(tod==='soir'&&(type==='Port'||type==='Ville'))score+=20;
 if(tod==='matin'&&(type==='Plage'||type==='Village'))score+=10;
 if(duration===2&&km<3)score+=18;
 if(duration===4&&km<15)score+=10;
 if(currentConditions.rain>=3&&(type==='Plage'||type==='Expérience'))score-=50;
 if(currentConditions.temp>=33&&(type==='Ville'||type==='Village')&&tod==='après-midi')score-=16;
 if(mood==='auto'){
   if(currentConditions.rain>=3&&(type==='Ville'||type==='Village'))score+=30;
   else if(currentConditions.wind<=16&&currentConditions.wave<0.6&&(type==='Plage'||type==='Expérience'))score+=25;
   else if(type==='Plage'||type==='Village'||type==='Port')score+=12;
 }
 return{score,km};
}
function recommendationReasons(card,mood,duration,km){
 const type=card.dataset.type||'Lieu',crowd=card.dataset.crowd||'medium';
 const reasons=[`${formatDistance(km)} à vol d’oiseau depuis ${nowOrigin===HOTEL?'l’hôtel':'votre position'}`];
 if(mood==='marche') reasons.push(card.dataset.travelmode==='walking'?'accessible à pied depuis votre départ':'balade possible à proximité');
 if(mood==='culture') reasons.push(type==='Village'?'village cohérent avec votre envie de découverte':type==='Ville'?'contenu urbain et culturel':'promenade de port');
 if(mood==='plage') reasons.push('baignade prioritaire pour ce filtre');
 if(mood==='mer') reasons.push(type==='Expérience'?'activité nautique prioritaire':'accès mer compatible');
 if(mood==='soir') reasons.push('cadre adapté à la fin de journée');
 reasons.push(crowd==='low'?'plutôt respirable':crowd==='medium'?'fréquenté mais gérable':'très fréquenté : horaire décisif');
 if(type==='Plage'&&Number(currentConditions.wave||0)<0.7)reasons.push('mer annoncée calme');
 if(duration===2)reasons.push('compatible avec une fenêtre de 2 heures');
 return reasons;
}
function renderNow(){
 const box=$('nowResults'),status=$('nowStatus');
 try{
  const duration=Number($('nowDuration')?.value||4),mood=$('nowMood')?.value||'auto';
  if(!box) throw new Error('Zone de résultats introuvable');
  const source=$$('#spotsGrid .spot[data-lat]');
  if(!source.length) throw new Error('Aucun lieu disponible');
  const ranked=source.map(card=>({card,...candidateScore(card,mood,duration)})).filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score);
  const cards=ranked.slice(0,3);
  if(!cards.length) throw new Error('Aucune option réaliste pour cette combinaison. Augmentez le temps disponible ou changez d’envie.');
  box.innerHTML=cards.map((x,i)=>{
   const c=x.card,name=c.querySelector('h3')?.textContent||'Lieu',desc=c.querySelector('p')?.textContent||'',dest={lat:Number(c.dataset.lat),lon:Number(c.dataset.lon)},route=mapsDirections(dest,nowOrigin,c.dataset.travelmode||'driving'),type=c.dataset.type||'Lieu';
   const reasons=recommendationReasons(c,mood,duration,x.km);
   return `<article class="card now-option" data-result-type="${type}" data-result-name="${name}"><div class="now-rank">${i+1}</div><span class="tag">${type}</span><h3>${name}</h3><p>${desc}</p><ul class="reason-list">${reasons.map(r=>`<li>${r}</li>`).join('')}</ul><div class="actions"><a class="link" href="${route}" target="_blank" rel="noopener">Itinéraire</a><button class="link alt" type="button" data-open-spots="1">Voir les lieux</button></div></article>`;
  }).join('');
  box.querySelectorAll('[data-open-spots]').forEach(b=>b.addEventListener('click',()=>{history.replaceState(null,'','#spots');activatePanel('#spots');}));
  if(status)status.innerHTML=`<strong>Lecture :</strong> ${timeOfDay()}, ${duration===2?'2 heures':duration===4?'demi-journée':'journée'}, envie « ${(moodConfig[mood]||moodConfig.auto).label} », départ depuis ${nowOrigin===HOTEL?'l’hôtel':'votre position'}.`;
 }catch(err){
  if(box)box.innerHTML=`<article class="card full"><h3>Impossible de calculer les options</h3><p>${err.message||'Erreur inconnue'}</p></article>`;
  if(status)status.innerHTML='<strong>Erreur :</strong> la recommandation n’a pas pu être calculée.';
  console.error('renderNow',err);
 }
}
window.KairosApp={renderNow,activatePanel};
function setupNow(){
 $('nowGo')?.addEventListener('click',renderNow);
 $('nowDuration')?.addEventListener('change',renderNow);
 $('nowMood')?.addEventListener('change',renderNow);
 $('nowHotel')?.addEventListener('click',()=>{nowOrigin=HOTEL;$('nowHotel')?.classList.add('active');$('nowHere')?.classList.remove('active');renderNow();});
 $('nowHere')?.addEventListener('click',()=>requestPosition(p=>{nowOrigin={lat:p.coords.latitude,lon:p.coords.longitude,label:'votre position'};$('nowHere')?.classList.add('active');$('nowHotel')?.classList.remove('active');renderNow();toast('Suggestions recalculées');},err=>{$('locationHelp')?.setAttribute('open','');toast(geolocationMessage(err),3500);}));
 renderNow();
}
function buildMap(){const canvas=$('mapCanvas'),detail=$('mapDetail');if(!canvas||!detail)return;canvas.querySelectorAll('.map-marker').forEach(x=>x.remove());const cards=$$('#spotsGrid .spot[data-lat]'),bounds={minLat:39.25,maxLat:39.94,minLon:2.28,maxLon:3.46};cards.forEach(c=>{const lat=+c.dataset.lat,lon=+c.dataset.lon,type=(c.dataset.type||'experience').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),x=(lon-bounds.minLon)/(bounds.maxLon-bounds.minLon)*86+7,y=(bounds.maxLat-lat)/(bounds.maxLat-bounds.minLat)*82+8,b=document.createElement('button');b.type='button';b.className=`map-marker ${type}`;b.style.left=`${Math.max(4,Math.min(96,x))}%`;b.style.top=`${Math.max(5,Math.min(95,y))}%`;b.title=c.querySelector('h3')?.textContent||'';b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>{canvas.querySelectorAll('.map-marker').forEach(m=>m.classList.remove('active'));b.classList.add('active');const name=c.querySelector('h3')?.textContent,desc=c.querySelector('p')?.textContent,dest={lat,lon},route=mapsDirections(dest,distanceOrigin,c.dataset.travelmode||'driving');detail.innerHTML=`<span class="tag">${c.dataset.type}</span><h3>${name}</h3><p>${desc}</p><div class="metric"><span>Depuis l’hôtel</span><strong>${c.querySelector('.distance-value')?.textContent||'Voir Maps'}</strong></div><div class="actions"><a class="link" href="${route}" target="_blank" rel="noopener">Itinéraire</a></div>`;});canvas.appendChild(b);});}
function setupPapa(){
 const code=$('papaCode'),panel=$('papaPanel'),error=$('papaError'),hint=$('papaHint'),lock=$('papaLock');
 const set=open=>{
  panel?.classList.toggle('visible',open);
  panel?.setAttribute('aria-hidden',open?'false':'true');
  if(lock) lock.hidden=open;
  if(hint) hint.textContent=open?'Espace Papa déverrouillé pour cette session.':'Code à 4 chiffres.';
  error?.classList.remove('visible');
  if(!open&&code) code.value='';
 };
 const attempt=()=>{
  const ok=(code?.value||'').trim()==='1011';
  if(ok){sessionStorage.setItem('papaUnlocked','1');set(true);toast('Espace Papa déverrouillé');}
  else{set(false);error?.classList.add('visible');code?.focus();}
 };
 $('unlockPapa')?.addEventListener('click',attempt);
 $('lockPapa')?.addEventListener('click',()=>{sessionStorage.removeItem('papaUnlocked');set(false);toast('Espace Papa verrouillé');});
 code?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();attempt();}});
 set(sessionStorage.getItem('papaUnlocked')==='1');
}
function setupShare(){if(navigator.share&&!document.querySelector('[data-share-app]')){const b=document.createElement('button');b.className='btn secondary';b.dataset.shareApp='1';b.textContent='Partager l’app';b.addEventListener('click',()=>navigator.share({title:document.title,text:'Assistant Majorque',url:location.href.split('#')[0]}).catch(()=>{}));document.querySelector('.toolbar')?.appendChild(b);}}
function highlightToday(){const fmt=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long'}).format(new Date()).toLowerCase();$$('#agendaGrid .day-date').forEach(d=>d.closest('.day')?.classList.toggle('today-agenda',d.textContent.toLowerCase().includes(fmt)));}
function runDiagnostics(){
 const tests=[];const t=(name,ok,detail='')=>tests.push({name,ok,detail});
 t('Bouton 3 options',!!$('nowGo')&&typeof renderNow==='function');
 t('Cartes de lieux',$$('#spotsGrid .spot[data-lat]').length>=10,`${$$('#spotsGrid .spot[data-lat]').length} fiches`);
 t('Liens d’itinéraire',$$('.route-link[href^="https://www.google.com/maps/"]').length===$$('.route-link').length);
 t('Filtres',$$('.filter-radio').length>=4);
 t('Géolocalisation',!!navigator.geolocation,location.protocol);
 t('Météo',typeof fetch==='function');
 t('Espace Papa',!!$('unlockPapa')&&!!$('papaPanel'));
 const badLinks=$$('a[href]').filter(a=>!a.getAttribute('href')||a.getAttribute('href')==='#');
 t('Liens sans destination',badLinks.length===0,badLinks.length?`${badLinks.length} lien(s)`:'aucun');
 const source=$$('#spotsGrid .spot[data-lat]');
 const top=(mood,duration)=>source.map(card=>({card,...candidateScore(card,mood,duration)})).filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score).slice(0,3);
 const walk=top('marche',2),culture=top('culture',4),beach=top('plage',2),sea=top('mer',4);
 t('Moteur - Marcher',walk.length>0&&walk.every(x=>x.card.dataset.travelmode==='walking'),walk.map(x=>x.card.querySelector('h3')?.textContent).join(', '));
 t('Moteur - Culture',culture.length>0&&culture.every(x=>['Ville','Village','Port'].includes(x.card.dataset.type)),culture.map(x=>x.card.querySelector('h3')?.textContent).join(', '));
 t('Moteur - Plage',beach.length>0&&beach.every(x=>x.card.dataset.type==='Plage'),beach.map(x=>x.card.querySelector('h3')?.textContent).join(', '));
 const signatures=[walk,culture,beach,sea].map(arr=>arr.map(x=>x.card.dataset.name).join('|'));
 t('Moteur - Filtres distincts',new Set(signatures).size>=3,`${new Set(signatures).size}/4 profils distincts`);
 const box=$('diagnosticsResults');
 if(box){box.hidden=false;box.innerHTML=tests.map(x=>`<div class="metric"><span>${x.ok?'✅':'❌'} ${x.name}</span><strong>${x.detail|| (x.ok?'OK':'À corriger')}</strong></div>`).join('');}
 if($('diagnosticsText'))$('diagnosticsText').textContent=tests.every(x=>x.ok)?'Toutes les fonctions essentielles sont chargées.':'Une anomalie a été détectée.';
 return tests;
}
function setupDiagnostics(){$('runDiagnostics')?.addEventListener('click',()=>{runDiagnostics();toast('Contrôle terminé');});setTimeout(runDiagnostics,500);}
function setupServiceWorker(){if(!('serviceWorker' in navigator)||!location.protocol.startsWith('http'))return;window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./sw.js?version=1.0.2');await reg.update();const banner=$('updateBanner'),show=()=>{if(reg.waiting&&banner)banner.hidden=false;};show();reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)show();});});$('applyUpdate')?.addEventListener('click',()=>reg.waiting?.postMessage({type:'SKIP_WAITING'}));navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());}catch(e){console.warn('SW',e);}});}
function validateExternalLinks(){$$('a[href^="http"]').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});}

function init(){setupNavigation();setupChecksAndFavorites();setupFilters();setupDistanceControls();setupWeather();setupNow();buildMap();setupPapa();setupShare();highlightToday();setupDiagnostics();setupServiceWorker();validateExternalLinks();applySpotFilters();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
