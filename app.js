
function toast(t){const el=document.getElementById('toast');if(!el)return;el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}
document.querySelectorAll('.navbtn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.navbtn').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
document.querySelectorAll('[data-check]').forEach(el=>{const k='check_'+el.dataset.check;el.checked=localStorage.getItem(k)==='1';el.addEventListener('change',()=>localStorage.setItem(k,el.checked?'1':'0'))});
document.querySelectorAll('.favbtn').forEach(btn=>{const k='fav_'+btn.dataset.fav;const sync=()=>btn.textContent=localStorage.getItem(k)==='1'?'★ Favori':'☆ Favori';sync();btn.addEventListener('click',()=>{localStorage.setItem(k,localStorage.getItem(k)==='1'?'0':'1');sync();toast(btn.textContent.startsWith('★')?'Ajouté aux favoris':'Retiré des favoris')})});

const HOTEL={lat:39.5384,lon:2.4495,label:"l’hôtel"};
let distanceOrigin=HOTEL;
function haversineKm(a,b){const R=6371,rad=x=>x*Math.PI/180;const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);const la1=rad(a.lat),la2=rad(b.lat);const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function formatDistance(km){return km<1?`${Math.max(50,Math.round(km*1000/50)*50)} m`:`${km.toFixed(1)} km`}
function refreshDistances(origin){distanceOrigin=origin;document.querySelectorAll('.spot[data-lat]').forEach(card=>{const dest={lat:Number(card.dataset.lat),lon:Number(card.dataset.lon)};const el=card.querySelector('.distance-value');const route=card.querySelector('.route-link');const mode=card.dataset.travelmode||'driving';if(origin===HOTEL){if(el)el.textContent=`${card.dataset.hotelDistance} - ${card.dataset.hotelTime}`;if(route)route.href=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Valentin Grand Park Suite Hotel Peguera')}&destination=${dest.lat},${dest.lon}&travelmode=${mode}`;}else{if(el)el.textContent=`${formatDistance(haversineKm(origin,dest))} en ligne droite depuis votre position`;if(route)route.href=`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${dest.lat},${dest.lon}&travelmode=${mode}`;}})}
const hotelBtn=document.getElementById('hotelDistanceBtn'),geoBtn=document.getElementById('geoDistanceBtn'),distanceStatus=document.getElementById('distanceStatus');
if(hotelBtn)hotelBtn.addEventListener('click',()=>{refreshDistances(HOTEL);distanceStatus.textContent='Affichage actuel : distances pratiques vérifiées depuis l’hôtel (route ou marche).';toast('Distances recalculées depuis l’hôtel')});
if(geoBtn)geoBtn.addEventListener('click',()=>{if(!navigator.geolocation){distanceStatus.textContent='La géolocalisation n’est pas disponible dans ce navigateur.';return}geoBtn.classList.add('loading');geoBtn.textContent='Localisation…';navigator.geolocation.getCurrentPosition(pos=>{const origin={lat:pos.coords.latitude,lon:pos.coords.longitude,label:'votre position'};refreshDistances(origin);distanceStatus.textContent=`Position détectée (précision ±${Math.round(pos.coords.accuracy)} m). Distances directes indicatives ; utilisez Itinéraire pour le trajet réel.`;geoBtn.classList.remove('loading');geoBtn.textContent='Actualiser ma position';toast('Distances recalculées depuis votre position')},err=>{distanceStatus.textContent=err.code===1?'Autorisez la localisation pour calculer les distances depuis votre position.':'Position indisponible. Les distances depuis l’hôtel restent affichées.';geoBtn.classList.remove('loading');geoBtn.textContent='Depuis ma position'},{enableHighAccuracy:true,timeout:10000,maximumAge:300000})});
refreshDistances(HOTEL);



const LIVE_DEFAULT={lat:39.5384,lon:2.4495,name:'Peguera'};
const els=id=>document.getElementById(id);
function compass(deg){const d=['N','NE','E','SE','S','SO','O','NO'];return d[Math.round((deg||0)/45)%8]}
function seaLabel(w){if(w==null)return '--';if(w<0.35)return 'très calme';if(w<0.7)return 'calme';if(w<1.2)return 'formée';return 'agitée'}
function makeRecommendation({temp,wind,gust,rain,wave}){
  if(rain>=3)return 'Pluie significative : Palma, shopping, cafés et visites couvertes. Gardez la côte pour une autre fenêtre.';
  if(gust>=45 || wind>=30 || wave>=1.2)return 'Mer et vent peu favorables : renoncez au bateau léger. Préférez Palma, Valldemossa ou une balade côtière abritée.';
  if(wind<=16 && wave<0.6 && rain<1)return 'Fenêtre mer favorable : bateau, snorkeling ou activité nautique le matin. Confirmez néanmoins auprès du loueur.';
  if(temp>=33)return 'Chaleur forte : sortie tôt, pause longue au frais, plage ou piscine après 17 h. Évitez Palma en milieu de journée.';
  if(wind<=24 && wave<0.9)return 'Conditions polyvalentes : Camp de Mar, Illetes tôt ou activité côtière. La mer reste à vérifier visuellement.';
  return 'Journée idéale pour marcher et découvrir : Peguera, Port d’Andratx ou Tramuntana selon l’heure.';
}
async function loadLiveWeather(coords=LIVE_DEFAULT){
  const dot=els('liveDot'),rec=els('recommendationText');
  if(dot)dot.className='status-dot warn'; if(rec)rec.textContent=`Actualisation météo pour ${coords.name||'votre position'}…`;
  try{
    const wurl=`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto&wind_speed_unit=kmh`;
    const murl=`https://marine-api.open-meteo.com/v1/marine?latitude=${coords.lat}&longitude=${coords.lon}&current=wave_height,wave_period,sea_surface_temperature&timezone=auto&cell_selection=sea`;
    const [wr,mr]=await Promise.all([fetch(wurl),fetch(murl)]);
    if(!wr.ok)throw new Error('weather');
    const w=await wr.json(); const m=mr.ok?await mr.json():{}; const c=w.current||{},mc=m.current||{};
    els('liveTemp').textContent=c.temperature_2m!=null?`${Math.round(c.temperature_2m)} °C`:'--';
    els('liveWind').textContent=c.wind_speed_10m!=null?`${Math.round(c.wind_speed_10m)} km/h ${compass(c.wind_direction_10m)}`:'--';
    els('liveGust').textContent=c.wind_gusts_10m!=null?`${Math.round(c.wind_gusts_10m)} km/h`:'--';
    els('liveRain').textContent=c.precipitation!=null?`${c.precipitation.toFixed(1)} mm`:'--';
    els('liveWave').textContent=mc.wave_height!=null?`${mc.wave_height.toFixed(1)} m`:'--';
    els('livePeriod').textContent=mc.wave_period!=null?`${mc.wave_period.toFixed(0)} s`:'--';
    els('liveSeaTemp').textContent=mc.sea_surface_temperature!=null?`${mc.sea_surface_temperature.toFixed(0)} °C`:'--';
    els('liveSeaRead').textContent=seaLabel(mc.wave_height);
    const msg=makeRecommendation({temp:c.temperature_2m||0,wind:c.wind_speed_10m||0,gust:c.wind_gusts_10m||0,rain:c.precipitation||0,wave:mc.wave_height||0});
    rec.textContent=msg; els('weatherUpdated').textContent=`Mis à jour ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} - ${coords.name||'position actuelle'}`;
    dot.className='status-dot ok'; localStorage.setItem('liveCache',JSON.stringify({t:Date.now(),coords,w:c,m:mc,msg}));
  }catch(e){
    const cached=localStorage.getItem('liveCache');
    if(cached){const x=JSON.parse(cached);rec.textContent=`Hors ligne - dernière lecture : ${x.msg}`;dot.className='status-dot warn';els('weatherUpdated').textContent='Données en cache.'}
    else{rec.textContent='Prévisions indisponibles. Utilisez Windy et demandez confirmation au prestataire nautique.';dot.className='status-dot bad';els('weatherUpdated').textContent='Aucune donnée en cache.'}
  }
}
if(els('refreshLive'))els('refreshLive').addEventListener('click',()=>loadLiveWeather(LIVE_DEFAULT));
if(els('weatherHere'))els('weatherHere').addEventListener('click',()=>{if(!navigator.geolocation)return toast('Géolocalisation indisponible');navigator.geolocation.getCurrentPosition(p=>loadLiveWeather({lat:p.coords.latitude,lon:p.coords.longitude,name:'votre position'}),()=>toast('Position non autorisée'),{enableHighAccuracy:true,timeout:10000,maximumAge:300000})});
loadLiveWeather(LIVE_DEFAULT);

if('serviceWorker' in navigator && location.protocol.startsWith('http')){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
// Iteration 2: recherche, favoris, espace Papa robuste et partage
const spotSearch=document.getElementById('spotSearch');
const favoritesOnly=document.getElementById('favoritesOnly');
const clearSearch=document.getElementById('clearSearch');
const spotsEmpty=document.getElementById('spotsEmpty');
let favOnly=false;
function applySpotSearch(){
  const q=(spotSearch?.value||'').trim().toLowerCase();
  let shown=0;
  document.querySelectorAll('#spotsGrid .spot').forEach(card=>{
    const key='fav_'+card.querySelector('.favbtn')?.dataset.fav;
    const matchesText=!q || card.textContent.toLowerCase().includes(q) || (card.dataset.name||'').includes(q);
    const matchesFav=!favOnly || localStorage.getItem(key)==='1';
    const cssHidden=getComputedStyle(card).display==='none';
    card.classList.toggle('search-hidden',!(matchesText&&matchesFav));
    card.style.visibility='';
    card.style.position='';
    if(matchesText&&matchesFav&&!cssHidden)shown++;
  });
  if(spotsEmpty)spotsEmpty.style.display=shown?'none':'block';
}
if(spotSearch)spotSearch.addEventListener('input',applySpotSearch);
if(favoritesOnly)favoritesOnly.addEventListener('click',()=>{favOnly=!favOnly;favoritesOnly.classList.toggle('active',favOnly);favoritesOnly.textContent=favOnly?'★ Favoris seulement':'☆ Favoris seulement';applySpotSearch()});
if(clearSearch)clearSearch.addEventListener('click',()=>{if(spotSearch)spotSearch.value='';favOnly=false;if(favoritesOnly){favoritesOnly.classList.remove('active');favoritesOnly.textContent='☆ Favoris seulement'}applySpotSearch()});
document.querySelectorAll('.filter-radio').forEach(x=>x.addEventListener('change',()=>setTimeout(applySpotSearch,0)));
document.querySelectorAll('.favbtn').forEach(btn=>btn.addEventListener('click',()=>setTimeout(applySpotSearch,0)));
const extraStyle=document.createElement('style');extraStyle.textContent='.spot.search-hidden{display:none!important}';document.head.appendChild(extraStyle);

const papaCode=document.getElementById('papaCode'),unlockPapa=document.getElementById('unlockPapa'),papaPanel=document.getElementById('papaPanel'),papaError=document.getElementById('papaError'),papaHint=document.getElementById('papaHint');
function setPapa(open){if(!papaPanel)return;papaPanel.classList.toggle('visible',open);if(papaHint)papaHint.textContent=open?'Espace Papa déverrouillé sur cet appareil.':'Le code reste mémorisé sur cet appareil.';if(papaError)papaError.classList.remove('visible')}
function tryPapa(){const ok=(papaCode?.value||'')==='1011';setPapa(ok);if(ok){sessionStorage.setItem('papaUnlocked','1');toast('Espace Papa déverrouillé')}else if(papaError)papaError.classList.add('visible')}
if(unlockPapa)unlockPapa.addEventListener('click',tryPapa);
if(papaCode)papaCode.addEventListener('keydown',e=>{if(e.key==='Enter')tryPapa()});
if(sessionStorage.getItem('papaUnlocked')==='1')setPapa(true);

// Surligne la journée correspondant à la date du séjour lorsqu'elle existe.
const now=new Date();
const fmt=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(now).toLowerCase();
document.querySelectorAll('#agendaGrid .day-date').forEach(d=>{if(fmt.includes(d.textContent.toLowerCase().replace('mercredi ','').replace('jeudi ','').replace('vendredi ','').replace('samedi ','').replace('dimanche ','').replace('lundi ','').replace('mardi ',''))){d.closest('.day')?.classList.add('today-agenda')}});

if(navigator.share){
  const share=document.createElement('button');share.className='btn secondary';share.textContent='Partager l’app';share.addEventListener('click',()=>navigator.share({title:document.title,text:'Notre assistant Majorque',url:location.href.split('#')[0]}).catch(()=>{}));document.querySelector('.toolbar')?.appendChild(share);
}
