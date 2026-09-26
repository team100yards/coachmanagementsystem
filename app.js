if(typeof firebase === 'undefined'){
  document.getElementById('firebase-err').style.display='block';
  throw new Error('Firebase not loaded');
}
let app;
try{
  app=firebase.initializeApp({
    apiKey: "AIzaSyBf_L4yFf_P-SS6SIQjDA67OaZ8pJQtRuk",
    authDomain: "coachmanagementsystem.firebaseapp.com",
    projectId: "coachmanagementsystem",
    storageBucket: "coachmanagementsystem.firebasestorage.app",
    messagingSenderId: "892324628193",
    appId: "1:892324628193:web:2cbbc23fc851d15aee99a0"
  });
}catch(e){
  app=firebase.app();
}
const db=firebase.firestore();
const auth=firebase.auth();

const collection=(db,name)=>db.collection(name);
const addDoc=(ref,data)=>ref.add(data);
const getDocs=(q)=>q.get();
const getDoc=(ref)=>ref.get();
const deleteDoc=(ref)=>ref.delete();
const doc=(db,col,id)=>db.collection(col).doc(id);
const updateDoc=(ref,data)=>ref.update(data);
const onSnapshot=(q,cb,err)=>q.onSnapshot(cb,err);
const where=(f,op,v)=>({_type:'where',f,op,v});
const orderBy=(f,dir='asc')=>({_type:'orderBy',f,dir});
function query(colRef,...constraints){
  let q=colRef;
  constraints.forEach(c=>{
    if(!c)return;
    if(c._type==='where')q=q.where(c.f,c.op,c.v);
    if(c._type==='orderBy')q=q.orderBy(c.f,c.dir);
  });
  return q;
}
const writeBatch=(db)=>db.batch();

const AK='fhq_adm',PK='fhq_pin',DA='admin123',DP='1234',DAP='1234';
const DPOS=['GK','RB','LB','CB','RWB','LWB','CDM','CM','CAM','RM','LM','RW','LW','CF','ST'];
const POS_FULL={GK:'Goalkeeper',RB:'Right Back',LB:'Left Back',CB:'Centre Back',RWB:'Right Wing Back',LWB:'Left Wing Back',CDM:'Central Defensive Midfielder',CM:'Central Midfielder',CAM:'Central Attacking Midfielder',RM:'Right Midfielder',LM:'Left Midfielder',RW:'Right Winger',LW:'Left Winger',CF:'Centre Forward',ST:'Striker'};

let curTeam=null, teams=[], players=[], unsub=null, pos=[...DPOS];
let pvId=null, pvTeam=null, pvPlayers=[], pvUnsub=null, pvMergedFormationKeys=[];
let pubId=null, pubTeam=null, pfPhotoData=null;
let pubStId=null, pubStTeam=null;
let pinBuf='', pinAction='', pinTargetId='';
let editId=null, delId=null, editTeamId=null, editPhotoData=null, editStaffId=null;
let ctLogoData=null, mergedCustomFormationKeys=[];
let _adminPassVal=null, _adminPinVal=null, _editPinVal=null;
let coachChatUnsub=null, pubChatUnsub=null, coachChatMsgs=[], pubChatMsgs=[], myChatIdentity=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function posCode(position){
  const key=String(position||'').trim().toUpperCase();
  if(POS_FULL[key])return key;
  const low=key.toLowerCase();
  const map={
    'goalkeeper':'GK','keeper':'GK','gk':'GK',
    'right back':'RB','rb':'RB','right-back':'RB',
    'left back':'LB','lb':'LB','left-back':'LB',
    'centre back':'CB','center back':'CB','centre-back':'CB','center-back':'CB','sweeper':'CB','cd':'CB',
    'right wing back':'RWB','rwb':'RWB','right wingback':'RWB',
    'left wing back':'LWB','lwb':'LWB','left wingback':'LWB',
    'defensive mid':'CDM','defensive midfielder':'CDM','cdm':'CDM','dm':'CDM',
    'central mid':'CM','central midfielder':'CM','midfielder':'CM','cm':'CM','mc':'CM',
    'attacking mid':'CAM','attacking midfielder':'CAM','central attacking midfielder':'CAM','am':'CAM','cam':'CAM',
    'right midfielder':'RM','rm':'RM','right mid':'RM',
    'left midfielder':'LM','lm':'LM','left mid':'LM',
    'right winger':'RW','rw':'RW',
    'left winger':'LW','lw':'LW',
    'centre forward':'CF','center forward':'CF','cf':'CF','second striker':'CF',
    'striker':'ST','st':'ST','forward':'ST'
  };
  if(map[low])return map[low];
  if(!low)return '';
  if(low.includes('keep'))return 'GK';
  if(low.includes('right')&&low.includes('wing')&&low.includes('back'))return 'RWB';
  if(low.includes('left')&&low.includes('wing')&&low.includes('back'))return 'LWB';
  if(low.includes('right')&&low.includes('wing'))return 'RW';
  if(low.includes('left')&&low.includes('wing'))return 'LW';
  if(low.includes('right')&&(low.includes('back')||low.includes('def')||low.includes('mid')))return low.includes('mid')?'RM':'RB';
  if(low.includes('left')&&(low.includes('back')||low.includes('def')||low.includes('mid')))return low.includes('mid')?'LM':'LB';
  if(low.includes('back')||low.includes('defen')||low.includes('sweep'))return 'CB';
  if(low.includes('attack'))return 'CAM';
  if(low.includes('defensive'))return 'CDM';
  if(low.includes('forward')||low.includes('striker')||low.includes('strike'))return 'ST';
  if(low.includes('wing'))return 'RW';
  if(low.includes('mid'))return 'CM';
  return key;
}

function compressImage(file, maxDimension, quality, callback) {
  if (!file) return;
  if (!file.type || !file.type.match(/image.*/)) {
    alert('Please select a valid image file (PNG, JPG, WebP).');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality || 0.85);
      callback(dataUrl);
    };
    img.onerror = function() {
      callback(e.target.result);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function playerLineupAv(p, cls='lu-av'){
  const photo = p && p.photo ? p.photo : null;
  const num = p && (p.jersey != null && p.jersey !== '') ? p.jersey : null;
  return `<div class="lu-av-group">
    <div class="${cls}">${photo ? `<img src="${esc(photo)}" alt="">` : '👤'}</div>
    ${num != null ? `<span class="lu-jbadge">#${esc(num)}</span>` : ''}
  </div>`;
}

const getAdminPass = () => _adminPassVal || localStorage.getItem('fhq_adm_pass') || DA;
const getAdminPin = () => _adminPinVal || localStorage.getItem('fhq_adm_pin') || DAP;
const gp = () => _editPinVal || localStorage.getItem('fhq_edit_pin') || DP;

async function loadAdminCreds(){
  try{
    const snap=await db.collection('settings').doc('admin').get();
    if(snap.exists){
      const d=snap.data();
      if(d.password){ _adminPassVal=d.password; localStorage.setItem('fhq_adm_pass', d.password); }
      if(d.adminPin){ _adminPinVal=d.adminPin; localStorage.setItem('fhq_adm_pin', d.adminPin); }
      if(d.editPin){ _editPinVal=d.editPin; localStorage.setItem('fhq_edit_pin', d.editPin); }
    }
  }catch(e){
    console.warn('Could not load admin credentials from Firestore, using local cache:',e);
  }
  if(!_adminPassVal) _adminPassVal = localStorage.getItem('fhq_adm_pass') || DA;
  if(!_adminPinVal) _adminPinVal = localStorage.getItem('fhq_adm_pin') || DAP;
  if(!_editPinVal) _editPinVal = localStorage.getItem('fhq_edit_pin') || DP;
}

async function saveAdminCredsFS(updates){
  const ref=db.collection('settings').doc('admin');
  try{
    await ref.set(updates, {merge: true});
  }catch(e){
    console.warn('Firestore admin creds save notice:', e);
  }
  if(updates.password){ _adminPassVal=updates.password; localStorage.setItem('fhq_adm_pass', updates.password); }
  if(updates.editPin){ _editPinVal=updates.editPin; localStorage.setItem('fhq_edit_pin', updates.editPin); }
  if(updates.adminPin){ _adminPinVal=updates.adminPin; localStorage.setItem('fhq_adm_pin', updates.adminPin); }
}

function ss(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.mov').forEach(m=>m.classList.remove('open'));
  const target = $(id);
  if(target) target.classList.add('active');
}
function openM(id){
  const el = $(id);
  if(el) el.classList.add('open');
}
function closeM(id){
  const el = $(id);
  if(el) el.classList.remove('open');
}
function tpw(id,btn){const i=$(id);i.type=i.type==='password'?'text':'password';btn.textContent=i.type==='password'?'👁':'🙈';}

async function doLogin(){
  const p=String($('lpw').value).trim();
  const errEl=$('lerr');
  const btn=document.querySelector('#s-login .btn');
  if(!p){
    errEl.textContent='Please enter your password.';
    errEl.style.display='block';
    return;
  }
  if(btn){btn.textContent='CHECKING…';btn.disabled=true;}
  
  await loadAdminCreds();
  const validPass = getAdminPass();

  if(p === validPass || p === DA){
    try {
      if (typeof auth !== 'undefined' && auth) {
        try {
          await auth.signInWithEmailAndPassword('admin@coachapp.com', p);
        } catch (authErr) {
          if (authErr.code === 'auth/user-not-found') {
            try {
              await auth.createUserWithEmailAndPassword('admin@coachapp.com', p);
            } catch(e) {
              if (auth.signInAnonymously) await auth.signInAnonymously().catch(() => {});
            }
          } else {
            if (auth.signInAnonymously) await auth.signInAnonymously().catch(() => {});
          }
        }
      }
    } catch(e) {
      console.warn('Firebase Auth background notice:', e);
    }
    
    sessionStorage.setItem('fhq_session_active', '1');
    try { localStorage.removeItem('fhq_session_active'); } catch(e){}
    errEl.style.display='none';
    $('lpw').value='';
    if(btn){btn.textContent='LOADING…';}
    try {
      await loadAdmin();
    } catch(e) {
      console.error('loadAdmin error:', e);
    } finally {
      if(btn){btn.textContent='ENTER DASHBOARD';btn.disabled=false;}
    }
  } else {
    let authSuccess = false;
    if (typeof auth !== 'undefined' && auth && auth.signInWithEmailAndPassword) {
      try {
        await auth.signInWithEmailAndPassword('admin@coachapp.com', p);
        authSuccess = true;
      } catch(e) {}
    }
    if (authSuccess) {
      sessionStorage.setItem('fhq_session_active', '1');
      try { localStorage.removeItem('fhq_session_active'); } catch(e){}
      errEl.style.display='none';
      $('lpw').value='';
      if(btn){btn.textContent='LOADING…';}
      try {
        await loadAdmin();
      } finally {
        if(btn){btn.textContent='ENTER DASHBOARD';btn.disabled=false;}
      }
    } else {
      if(btn){btn.textContent='ENTER DASHBOARD';btn.disabled=false;}
      errEl.innerHTML='❌ Incorrect password. Default password is: <strong style="color:#fff;">admin123</strong>';
      errEl.style.display='block';
      $('lpw').value='';
    }
  }
}

async function resetAdminPassword(){
  if(!confirm('Reset admin password back to default "admin123"?')) return;
  try{
    await saveAdminCredsFS({password: DA});
    _adminPassVal = DA;
    localStorage.setItem('fhq_adm_pass', DA);
    alert('✅ Admin password reset to default: admin123');
  }catch(e){
    _adminPassVal = DA;
    localStorage.setItem('fhq_adm_pass', DA);
    alert('✅ Admin password reset to default: admin123');
  }
}

async function loadAdmin(){
  applyAdmName();
  ss('s-admin');
  $('tgrid').innerHTML='<p style="color:var(--mt);padding:20px;">Loading teams…</p>';
  try{
    const snap=await getDocs(collection(db,'teams'));
    teams=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>((b.createdAt||'')>(a.createdAt||''))?1:-1);
    try { localStorage.setItem('fhq_teams_cache', JSON.stringify(teams)); } catch(e){}
    renderAdmin();
    getDocs(collection(db,'players')).then(allPlayersSnap=>{
      allSystemPlayers=allPlayersSnap.docs.map(d=>({id:d.id,...d.data()}));
      const allPlayers=allSystemPlayers;
      teams.forEach(t=>{t.pc=allPlayers.filter(p=>p.teamId===t.id).length;});
      renderBirthdayBanner(allPlayers);
      renderAdmin();
    }).catch(e=>{
      console.warn('Could not load player counts/birthdays:', e);
    });
  }catch(e){
    console.error('loadAdmin error:',e);
    $('tgrid').innerHTML=`<div style="padding:20px;color:#e53935;background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.3);border-radius:12px;">Failed to load teams: ${esc(e.message||e)}</div>`;
  }
}

function renderBirthdayBanner(allPlayers){
  const today=new Date();
  const upcoming=[];
  allPlayers.forEach(p=>{
    if(!p.dob)return;
    const parts=p.dob.split('-');if(parts.length<3)return;
    const bday=new Date(today.getFullYear(),parseInt(parts[1])-1,parseInt(parts[2]));
    if(bday<new Date(today.getFullYear(),today.getMonth(),today.getDate())) bday.setFullYear(today.getFullYear()+1);
    const diffMs=bday-new Date(today.getFullYear(),today.getMonth(),today.getDate());
    const diffDays=Math.round(diffMs/(1000*60*60*24));
    if(diffDays<=7){
      const team=teams.find(t=>t.id===p.teamId);
      const key=(p.name||'').trim().toLowerCase()+'|'+p.dob;
      const entry={name:p.name,team:team?team.name:'',photo:p.photo||null,days:diffDays,isToday:diffDays===0,key};
      const existing=upcoming.find(u=>u.key===key);
      if(existing){
        if(!existing.team&&entry.team)Object.assign(existing,entry);
        if(!existing.photo&&entry.photo)existing.photo=entry.photo;
      }else{
        upcoming.push(entry);
      }
    }
  });
  const wrap=$('bday-banner-wrap');
  if(!upcoming.length){wrap.innerHTML='';return;}
  upcoming.sort((a,b)=>a.days-b.days);
  wrap.innerHTML=`<div class="bday-banner">
    <h4>🎂 UPCOMING BIRTHDAYS</h4>
    <div class="bday-list">${upcoming.map(b=>`
      <div class="bday-item">
        <div class="bday-av">${b.photo?`<img src="${esc(b.photo)}" alt="">`:'👤'}</div>
        <div class="bday-info">
          <span class="bday-name">${esc(b.name)}</span>
          <span class="bday-sub">${esc(b.team)}</span>
        </div>
        <span class="bday-tag ${b.isToday?'today':'soon'}">${b.isToday?'🎉 TODAY':'In '+b.days+' day'+(b.days===1?'':'s')}</span>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderAdmin(){
  const tp=teams.length,pp=teams.reduce((s,t)=>s+(t.pc||0),0);
  $('st-t').textContent=tp;$('st-p').textContent=pp;$('st-a').textContent=tp?Math.round(pp/tp):0;
  $('tgrid').innerHTML=teams.map(t=>`
    <div class="tc" onclick="promptPw('${t.id}')">
      <div class="tc-acts">
        <div class="tc-edit" title="Edit team" onclick="event.stopPropagation();adminRequestPin('editteam','${t.id}')">✏️</div>
        <div class="tc-del" title="Delete team" onclick="event.stopPropagation();adminRequestPin('delteam','${t.id}')">🗑️</div>
      </div>
      <div class="tc-badge">${t.logo?`<img src="${esc(t.logo)}" alt="">`:(t.emoji||'⚽')}</div>
      <div class="tc-name">${esc(t.name)}</div>
      <div class="tc-meta">${esc(t.season||'')}${t.motto?' · '+esc(t.motto):''}</div>
      <div class="tc-count"><strong>${t.pc||0}</strong>Players</div>
    </div>`).join('')+
  `<div class="add-tc" onclick="openM('m-create')"><div style="font-size:30px;">＋</div><span style="font-size:13px;font-weight:700;letter-spacing:1px;">New Team</span></div>`;
}

function toggleSettings(){
  var d=$('settings-dropdown');
  if(d)d.style.display=(d.style.display==='block'?'none':'block');
}
function closeSettings(){
  var d=$('settings-dropdown');if(d)d.style.display='none';
}
document.addEventListener('click',function(e){
  if(!e.target.closest('#settings-wrap')){closeSettings();}
});
function goSettings(){
  const logo = getBrandLogo();
  const prev = $('set-logo-preview');
  if(prev){
    prev.src = (logo && logo !== DEFAULT_LOGO) ? logo : '';
    prev.style.display = (logo && logo !== DEFAULT_LOGO) ? 'block' : 'none';
  }
  $('set-name').value=getBrandName();
  $('set-sub').value=getBrandSub();
  const err = $('set-branderr');
  if(err) err.style.display='none';
  ss('s-settings');
}

function handleSetLogo(input){
  const file=input.files[0];if(!file)return;
  compressImage(file, 256, 0.88, dataUrl => {
    const prev = $('set-logo-preview');
    if(prev){
      prev.src = dataUrl;
      prev.style.display = 'block';
    }
  });
}

async function saveAppBranding(){
  const name=$('set-name').value.trim()||'Coach Management System';
  const sub=$('set-sub').value.trim()||'Team Management System';
  const prev=$('set-logo-preview');
  const logoSrc=prev?prev.src:'';
  const err=$('set-branderr');
  const btn=document.querySelector('#s-settings .adm-settings .btn');
  if(btn){btn.textContent='SAVING…';btn.disabled=true;}
  
  const data={name,sub};
  if(logoSrc && logoSrc.length > 30 && logoSrc !== DEFAULT_LOGO){
    data.logo = logoSrc;
  }
  
  localStorage.setItem(ANK,name);
  localStorage.setItem(ASK,sub);
  if(data.logo) localStorage.setItem(ALK,data.logo);
  applyAdmName();
  
  try{
    const ref=db.collection('settings').doc('branding');
    await ref.set(data, {merge: true});
    if(err) err.style.display='none';
    alert('✅ Branding updated successfully!');
  }catch(e){
    console.warn('saveAppBranding Firestore note:', e);
    if(err){
      err.textContent='⚠️ Saved to this device. Firestore note: ' + (e.message || 'Check connection');
      err.style.display='block';
    }
    alert('✅ Branding saved to your browser!');
  }finally{
    if(btn){btn.textContent='💾 SAVE BRANDING';btn.disabled=false;}
  }
}

async function saveAdminPass(){
  const p1=$('adm-p1').value.trim(),p2=$('adm-p2').value.trim(),err=$('adm-perr');
  if(!p1||p1.length<4){err.textContent='Min 4 characters.';err.style.display='block';return;}
  if(p1!==p2){err.textContent='Passwords do not match.';err.style.display='block';return;}
  try{
    await saveAdminCredsFS({password:p1});
    _adminPassVal=p1;
    localStorage.setItem('fhq_adm_pass', p1);
    if(typeof auth !== 'undefined' && auth && auth.currentUser){
      try { await auth.currentUser.updatePassword(p1); } catch(e){}
    }
    err.style.display='none';$('adm-p1').value='';$('adm-p2').value='';
    alert('✅ Admin password updated!');
  }catch(e){
    _adminPassVal=p1;
    localStorage.setItem('fhq_adm_pass', p1);
    err.style.display='none';$('adm-p1').value='';$('adm-p2').value='';
    alert('✅ Admin password updated locally!');
  }
}

async function saveAdminPin(){
  const p1=String($('adm-pin1').value).trim(),p2=String($('adm-pin2').value).trim(),err=$('adm-pinerr');
  if(p1.length!==4||isNaN(p1)){err.textContent='PIN must be exactly 4 digits.';err.style.display='block';return;}
  if(p1!==p2){err.textContent='PINs do not match.';err.style.display='block';return;}
  try{
    await saveAdminCredsFS({adminPin:p1});
    _adminPinVal=p1;
    localStorage.setItem('fhq_adm_pin', p1);
    err.style.display='none';$('adm-pin1').value='';$('adm-pin2').value='';
    alert('✅ Admin PIN updated!');
  }catch(e){
    _adminPinVal=p1;
    localStorage.setItem('fhq_adm_pin', p1);
    err.style.display='none';$('adm-pin1').value='';$('adm-pin2').value='';
    alert('✅ Admin PIN updated locally!');
  }
}

function promptPw(id){
  curTeam=teams.find(t=>t.id===id);
  const b=$('tpw-badge');b.innerHTML=curTeam.logo?`<img src="${esc(curTeam.logo)}" alt="">`:(curTeam.emoji||'⚽');
  $('tpw-name').textContent=(curTeam.name||'TEAM').toUpperCase();
  $('tpw').value='';$('tpwerr').style.display='none';
  ss('s-team-pw');
}

function doTeamLogin(){
  if(!curTeam){ss('s-login');return;}
  const p=$('tpw').value;
  if(p===(curTeam.password||'team123')){
    $('tpwerr').style.display='none';$('tpw').value='';
    pos=curTeam.positions||[...DPOS];
    enterTeam();
  } else {$('tpwerr').style.display='block';$('tpw').value='';}
}

function enterTeam(){
  if($('tt-name')) $('tt-name').textContent=(curTeam.name||'TEAM').toUpperCase();
  applyTeamTopbarLogo();
  ss('s-team');showTab('squad');loadShare();subscribeTeam();
}

function goBack(){
  if(unsub){unsub();unsub=null;}
  if(coachChatUnsub){coachChatUnsub();coachChatUnsub=null;}
  if(sessionsUnsub){sessionsUnsub();sessionsUnsub=null;}
  players=[];curTeam=null;sessions=[];
  loadAdmin();
}

function showTab(n){
  if(n==='formation'){
    openFormationVisualizer(false);
    return;
  }
  if(n==='sessions'){
    openSessionPlannerDirect();
    return;
  }
  if(n==='tracker'){
    openPlayerTrackerLab();
    return;
  }
  ['squad','lineup','formation','db','setup'].forEach(x=>{
    $('page-'+x)&&$('page-'+x).classList.toggle('active',x===n);
    $('tab-'+x)&&$('tab-'+x).classList.toggle('active',x===n);
  });
  const tm=document.querySelector('#s-team .tmain');
  if(tm)tm.classList.remove('tmain-wide');
  if(n==='db'){renderPlayers();renderStaffList();}
  if(n==='setup')loadSetup();
  if(n==='squad'){renderSquad();renderStaffList();}
  if(n==='lineup'){openLineup();initCoachChat();}
  if(n==='chat'){showTab('lineup');initCoachChat();}
}

function backToPlayingList(){
  showTab('lineup');
}

function openFormationVisualizer(inNewTab = true){
  const payload = buildFormationSyncPayload();
  try {
    localStorage.setItem('formation_sync_payload', JSON.stringify(payload));
  } catch(e){}

  if(inNewTab){
    window.open('formation-builder.html', '_blank');
  } else {
    ['squad','lineup','formation','sessions','db','setup'].forEach(x=>{
      $('page-'+x)&&$('page-'+x).classList.toggle('active', x==='formation');
      $('tab-'+x)&&$('tab-'+x).classList.toggle('active', x==='formation');
    });
    const tm=document.querySelector('#s-team .tmain');
    if(tm)tm.classList.add('tmain-wide');
    initCoachChat();
    sendFormationSync();
    setTimeout(sendFormationSync, 80);
    setTimeout(sendFormationSync, 300);
  }
}

function openVideoAnalyzer(){
  try {
    const matchPosMap = new Map();
    if (Array.isArray(luSlots)) {
      luSlots.forEach(s => {
        if (s && s.id && (s.matchPosition || s.position)) {
          matchPosMap.set(s.id, s.matchPosition || s.position);
        }
      });
    }
    const sq = curTeam && curTeam.squad;
    if (sq && Array.isArray(sq.slots)) {
      sq.slots.forEach(s => {
        if (s && s.player && s.player.id && (s.player.matchPosition || s.player.position)) {
          if (!matchPosMap.has(s.player.id)) {
            matchPosMap.set(s.player.id, s.player.matchPosition || s.player.position);
          }
        }
      });
    }

    const payload = {
      teamId: curTeam ? curTeam.id : null,
      teamName: curTeam ? curTeam.name : 'Team Squad',
      teamEmoji: curTeam ? curTeam.emoji : '⚽',
      players: (players || []).map(p => ({
        id: p.id,
        name: p.name,
        number: p.jersey || p.playernum || '-',
        jersey2: p.jersey2 || '',
        position: matchPosMap.get(p.id) || p.position || 'CM',
        photo: p.photo || null
      }))
    };
    localStorage.setItem('cms_video_analyzer_squad', JSON.stringify(payload));
  } catch(e){}
  window.open('video-analyzer.html', '_blank');
}

function openVideoClipper(){
  window.open('video-clipper.html', '_blank');
}

function openPlayerTrackerLab(){
  try {
    const payload = {
      teamId: curTeam ? curTeam.id : null,
      teamName: curTeam ? curTeam.name : 'Team Squad',
      teamEmoji: curTeam ? curTeam.emoji : '⚽',
      players: (players || []).map(p => ({
        id: p.id,
        name: p.name,
        number: p.jersey || p.playernum || '1',
        position: p.position || 'CM',
        photo: p.photo || null
      }))
    };
    localStorage.setItem('cms_player_tracker_squad', JSON.stringify(payload));
  } catch(e){}
  window.open('player-tracker-lab.html', '_blank');
}

function openSessionPlannerDirect(){
  const tid = curTeam ? curTeam.id : (localStorage.getItem('cms_active_team_id') || '');
  const url = 'session-planner.html' + (tid && tid !== 'all' ? '?teamId=' + encodeURIComponent(tid) : '');
  window.open(url, '_blank');
}

function backToPlayingList(){
  showTab('lineup');
}

function openMatchReport(fromDashboard = false){
  const adminScreen = $('s-admin');
  const onDashboard = fromDashboard || !curTeam || (adminScreen && adminScreen.classList.contains('active'));

  if (onDashboard) {
    try {
      const payload = {
        fromDashboard: true,
        teamId: null,
        homeTeam: '',
        awayTeam: '',
        competition: '',
        venue: '',
        formation: '4-3-3',
        startingXI: [],
        substitutes: [],
        squad: [],
        updatedAt: Date.now()
      };
      localStorage.setItem('cms_match_report_context', JSON.stringify(payload));
    } catch(e) {
      console.warn('Could not reset match report context for dashboard:', e);
    }
    window.open('match-report.html?source=dashboard', '_blank');
    return;
  }

  try {
    const sq = curTeam ? curTeam.squad : null;
    const opponent = ($('lu-opponent') ? $('lu-opponent').value.trim() : '') || (sq && sq.opponent) || '';
    const tournament = ($('lu-tournament') ? $('lu-tournament').value.trim() : '') || (sq && sq.tournament) || '';
    const venue = ($('lu-venue') ? $('lu-venue').value.trim() : '') || (sq && sq.venue) || '';
    const formation = luFormation || (sq && sq.formation) || '4-4-2';
    
    // Starting XI players
    const startingXI = (luSlots || []).filter(s => s && s.name).map(s => ({
      name: s.name,
      position: s.matchPosition || s.position || '',
      jersey: s.jersey || ''
    }));

    // Subs / Game Changers
    const substitutes = (luSubs || []).filter(Boolean).map(s => ({
      name: s.name,
      position: s.position || '',
      jersey: s.jersey || ''
    }));

    // Full team squad players
    const squadList = ((players && players.length ? players : (curTeam && curTeam.players)) || []).map(p => ({
      id: p.id,
      name: p.name,
      position: p.position || '',
      jersey: p.jersey || p.playernum || ''
    }));

    const payload = {
      fromDashboard: false,
      teamId: curTeam ? curTeam.id : null,
      homeTeam: curTeam ? curTeam.name : 'Home Team',
      awayTeam: opponent,
      competition: tournament,
      venue: venue,
      formation: formation,
      startingXI: startingXI,
      substitutes: substitutes,
      squad: squadList,
      updatedAt: Date.now()
    };
    localStorage.setItem('cms_match_report_context', JSON.stringify(payload));
  } catch(e) {
    console.warn('Could not export match report context:', e);
  }
  window.open('match-report.html?teamId=' + encodeURIComponent(curTeam ? curTeam.id : ''), '_blank');
}


let currentShareType = 'player';

function getPlayerRegLink(){
  const t = curTeam || pvTeam;
  if(!t || !t.id) return `${location.origin}${location.pathname}`;
  return `${location.origin}${location.pathname}?team=${t.id}`;
}

function getMgmtRegLink(){
  const t = curTeam || pvTeam;
  if(!t || !t.id) return `${location.origin}${location.pathname}`;
  return `${location.origin}${location.pathname}?team=${t.id}&type=staff`;
}

function getTeamViewLink(){
  const t = curTeam || pvTeam;
  if(!t || !t.id) return `${location.origin}${location.pathname}`;
  return `${location.origin}${location.pathname}?view=${t.id}`;
}

function openShareLinkModal(type){
  currentShareType = type || 'player';
  let link = '';
  let title = '';
  let sub = '';

  if(currentShareType === 'player'){
    link = getPlayerRegLink();
    title = '⚽ Share Player Registration';
    sub = 'Share player self-serve registration link';
  } else if(currentShareType === 'staff'){
    link = getMgmtRegLink();
    title = '🧑‍💼 Share Management Registration';
    sub = 'Share coach & staff onboarding link';
  } else if(currentShareType === 'view'){
    link = getTeamViewLink();
    title = '👁️ Share Team View Link';
    sub = 'Read-only view link for players and parents (no login needed)';
  }

  const titleEl = $('share-modal-title');
  const subEl = $('share-modal-sub');
  const inputEl = $('share-modal-input');
  const copyBtn = $('share-modal-copy-btn');
  const copyMsgBtn = $('share-modal-copy-msg-btn');

  if(titleEl) titleEl.innerHTML = title;
  if(subEl) subEl.textContent = sub;
  if(inputEl) inputEl.value = link;
  if(copyBtn) copyBtn.textContent = 'Copy';
  if(copyMsgBtn) copyMsgBtn.innerHTML = '<span class="sm-icon">📋</span><span>Copy Link</span>';

  openM('m-share-popup');
}

function copyShareModalLink(btn){
  let link = '';
  if(currentShareType === 'player') link = getPlayerRegLink();
  else if(currentShareType === 'staff') link = getMgmtRegLink();
  else if(currentShareType === 'view') link = getTeamViewLink();

  const inputEl = $('share-modal-input');
  const targetLink = link || (inputEl ? inputEl.value : '');

  copyToClipboard(targetLink).then(()=>{
    const copyBtn = $('share-modal-copy-btn');
    if(copyBtn){
      const orig = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(()=>{ copyBtn.textContent = orig; }, 2000);
    }
    const target = btn || $('share-modal-copy-msg-btn');
    if(target && target !== copyBtn){
      const orig = target.innerHTML;
      target.innerHTML = '<span class="sm-icon">✓</span><span>Copied!</span>';
      setTimeout(()=>{ target.innerHTML = orig; }, 2000);
    }
  });
}

function copyShareModalMessage(btn){
  copyShareModalLink(btn);
}

function shareEmailModal(){
  const t = curTeam || pvTeam || {};
  const tName = (t.name || 'Team').toUpperCase();
  let subject = '';
  if(currentShareType === 'player') subject = `${tName} — Player Registration Link`;
  else if(currentShareType === 'staff') subject = `${tName} — Management Registration Link`;
  else subject = `${tName} — Match Squad & Tactics Studio`;

  const body = getShareText(currentShareType);
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

function shareSMSModal(){
  const body = getShareText(currentShareType);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const separator = isIOS ? '&' : '?';
  const smsUrl = `sms:${separator}body=${encodeURIComponent(body)}`;
  window.location.href = smsUrl;
}

function loadShare(){
  const t=curTeam;
  if(!t) return;
  const b=$('sh-badge');
  if(b) b.innerHTML=t.logo?`<img src="${esc(t.logo)}" alt="">`:(t.emoji||'⚽');
  if($('sh-name')) $('sh-name').textContent=(t.name||'TEAM').toUpperCase();
  if($('sh-motto')) $('sh-motto').textContent=t.motto||'Player Registration';
  if($('vlink')) $('vlink').value=getTeamViewLink();
}

function copyToClipboard(text){
  if(navigator && navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      resolve();
    } catch(e) {
      reject(e);
    }
  });
}

function copyLink(){
  copyToClipboard(getPlayerRegLink()).then(()=>{
    const b=$('slink')?$('slink').nextElementSibling:null;
    if(b){ b.textContent='Copied Link!';setTimeout(()=>b.textContent='Copy Link',2000); }
  });
}

function copyMgmtLink(){
  copyToClipboard(getMgmtRegLink()).then(()=>{
    const b=$('mlink')?$('mlink').nextElementSibling:null;
    if(b){ b.textContent='Copied Link!';setTimeout(()=>b.textContent='Copy Link',2000); }
  });
}

function copyViewLink(){
  copyToClipboard($('vlink').value).then(()=>{
    const b=$('vlink').nextElementSibling;b.textContent='Copied Link!';setTimeout(()=>b.textContent='Copy Link',2000);
  });
}

function getShareText(type){
  const t = curTeam || pvTeam || {};
  const tName = (t.name || 'Team').toUpperCase();
  const origin = window.location.origin;
  const path = window.location.pathname;
  const tid = t.id || pvId || curTeam?.id || '';

  if(type === 'player'){
    const link = getPlayerRegLink();
    return `⚽ *${tName} — Player Registration*\n\nPlease click the link below to submit your player registration:\n👉 ${link}`;
  }
  if(type === 'staff'){
    const link = getMgmtRegLink();
    return `🧑‍💼 *${tName} — Management Registration*\n\nCoaches & management staff, please submit your registration details here:\n👉 ${link}`;
  }
  if(type === 'view'){
    const link = $('vlink')?.value || `${origin}${path}?view=${tid}`;
    return `🎯 *${tName} — Match Squad & Tactics Studio*\n\nView our match lineup, game changers, and squad here:\n👉 ${link}`;
  }
  return '';
}

function shareWhatsApp(type){
  const msg = getShareText(type);
  if(!msg) return;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

function copyShareMessage(type, btnEl){
  const msg = getShareText(type);
  if(!msg) return;
  copyToClipboard(msg).then(()=>{
    if(btnEl){
      const sub = btnEl.querySelector('.act-sub') || btnEl;
      const orig = sub.textContent;
      sub.textContent = 'Copied Message!';
      setTimeout(()=>{ sub.textContent = orig; }, 2000);
    }
  }).catch(()=>{
    alert('Could not copy to clipboard.');
  });
}

function renderSquad(){
  const el=$('squad-content');if(!el)return;
  const totalPlayers = players.length;
  const positions = new Set(players.map(p=>posCode(p.position)).filter(Boolean));
  const ages = players.filter(p=>p.age).map(p=>parseInt(p.age));
  const avgAge = ages.length ? Math.round(ages.reduce((a,b)=>a+b)/ages.length) : null;

  const topBarHTML = `
    <div class="squad-top-bar">
      <!-- Left: Squad Stats Badges -->
      <div class="squad-stat-group">
        <div class="sc"><div class="num">${totalPlayers}</div><div class="lbl">Players</div></div>
        <div class="sc"><div class="num">${positions.size}</div><div class="lbl">Positions</div></div>
        ${avgAge !== null ? `<div class="sc"><div class="num">${avgAge}</div><div class="lbl">Avg Age</div></div>` : ''}
      </div>

      <!-- Right: Symmetrical Registration Cards with 2 buttons below each line -->
      <div class="squad-reg-cards-grid">
        <!-- 1. Player Registration Card -->
        <div class="squad-reg-box">
          <div class="squad-reg-box-header">
            <span class="reg-badge-icon">⚽</span>
            <div class="reg-box-title-group">
              <div class="reg-box-title">PLAYER REGISTRATION</div>
              <div class="reg-box-sub">Self-serve player onboarding link</div>
            </div>
          </div>
          <div class="squad-reg-btn-row">
            <button type="button" class="squad-reg-btn share" onclick="openShareLinkModal('player')" title="Share Link (Copy, Email, SMS)">
              <span>🔗</span> Share
            </button>
            <button type="button" class="squad-reg-btn wa" onclick="shareWhatsApp('player')" title="Share via WhatsApp">
              <span>📱</span> WhatsApp
            </button>
          </div>
        </div>

        <!-- 2. Management Registration Card -->
        <div class="squad-reg-box mgmt">
          <div class="squad-reg-box-header">
            <span class="reg-badge-icon">🧑‍💼</span>
            <div class="reg-box-title-group">
              <div class="reg-box-title">MANAGEMENT REGISTRATION</div>
              <div class="reg-box-sub">Coach & staff onboarding link</div>
            </div>
          </div>
          <div class="squad-reg-btn-row">
            <button type="button" class="squad-reg-btn share" onclick="openShareLinkModal('staff')" title="Share Link (Copy, Email, SMS)">
              <span>🔗</span> Share
            </button>
            <button type="button" class="squad-reg-btn wa" onclick="shareWhatsApp('staff')" title="Share via WhatsApp">
              <span>📱</span> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  if(!players.length){
    el.innerHTML = `
      ${topBarHTML}
      <div class="squad-empty">
        <div class="ei">🏟️</div>
        <p style="font-weight:700;font-size:16px;color:var(--tx);margin-bottom:6px;">No players in the squad yet</p>
        <p style="font-size:13px;color:var(--mt);margin:0 0 16px;">Share the registration link above via WhatsApp or message to let players register, or add them manually in the Database tab.</p>
        <button class="mok" onclick="openAddPlayerModal()" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;font-size:14px;">➕ Add Player Manually</button>
      </div>
    `;
    return;
  }

  const posList=(curTeam&&curTeam.positions&&curTeam.positions.length)?curTeam.positions:(pos&&pos.length?pos:[...DPOS]);
  const grouped={};
  posList.forEach(p=>grouped[p]=[]);
  grouped['Other']=[];
  players.forEach(p=>{
    const code=posCode(p.position);
    const key=posList.includes(code)?code:'Other';
    grouped[key].push(p);
  });

  const sectionsHTML=posList.filter(p=>grouped[p]&&grouped[p].length).map(posName=>`
    <div class="squad-section">
      <div class="squad-section-title">
        <span class="pos-badge">${esc(posName)}</span>
        <span style="color:var(--mt);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;">${grouped[posName].length} player${grouped[posName].length!==1?'s':''}</span>
      </div>
      <div class="squad-grid">
        ${grouped[posName].map(p=>`
          <div class="spc">
            <div class="spc-av">${p.photo?`<img src="${esc(p.photo)}" alt="">`:'👤'}</div>
            <div class="spc-info">
              <div class="spc-name">${esc(p.name)}</div>
              <div class="spc-meta">
                ${p.jersey?`<span class="spc-j">#${esc(p.jersey)}</span>`:''}
                ${p.age?`<span>Age ${p.age}</span>`:''}
                ${p.foot?`<span>${esc(p.foot)} Foot</span>`:''}
                ${p.fit?`<span>Fit: ${p.fit}%</span>`:''}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  const othersHTML=grouped['Other']&&grouped['Other'].length?`
    <div class="squad-section">
      <div class="squad-section-title"><span class="pos-badge">Other</span><span style="color:var(--mt);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;">${grouped['Other'].length} player(s)</span></div>
      <div class="squad-grid">
        ${grouped['Other'].map(p=>`
          <div class="spc">
            <div class="spc-av">${p.photo?`<img src="${esc(p.photo)}" alt="">`:'👤'}</div>
            <div class="spc-info">
              <div class="spc-name">${esc(p.name)}</div>
              <div class="spc-meta">
                ${p.position?`<span>${esc(posCode(p.position))}</span>`:''}
                ${p.jersey?`<span class="spc-j">#${esc(p.jersey)}</span>`:''}
                ${p.age?`<span>Age ${p.age}</span>`:''}
                ${p.foot?`<span>${esc(p.foot)} Foot</span>`:''}
                ${p.fit?`<span>Fit: ${p.fit}%</span>`:''}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`:'';

  el.innerHTML = topBarHTML + sectionsHTML + othersHTML;
}

function subscribeTeam(){
  if(unsub){unsub();unsub=null;}
  if(!curTeam)return;
  unsub=onSnapshot(
    query(collection(db,'players'),where('teamId','==',curTeam.id)),
    snap=>{
      players=snap.docs.map(d=>({id:d.id,...d.data()}))
        .sort((a,b)=>((b.registeredAt||'')>(a.registeredAt||''))?1:-1);
      renderPlayers();
      renderSquad();
    },
    err=>{console.error('subscribeTeam error:',err);}
  );
}

function renderPlayers(){
  const s=($('dbsearch')?.value||'').toLowerCase(),pf=$('dbfilter')?.value||'';
  const fil=players.filter(p=>(!s||(p.name||'').toLowerCase().includes(s)||posCode(p.position).toLowerCase().includes(s))&&(!pf||posCode(p.position)===pf));
  const posList=(curTeam&&curTeam.positions&&curTeam.positions.length)?curTeam.positions:(pos&&pos.length?pos:[...DPOS]);
  const fd=$('dbfilter');
  if(fd){const c=fd.value;fd.innerHTML='<option value="">All Positions</option>'+posList.map(x=>`<option value="${esc(x)}"${x===c?' selected':''}>${esc(x)}</option>`).join('');}
  $('plstats').style.display=players.length?'grid':'none';
  $('pst').textContent=players.length;$('psp').textContent=new Set(players.map(p=>posCode(p.position))).size;
  const ages=players.filter(p=>p.age).map(p=>parseInt(p.age));
  $('psa').textContent=ages.length?Math.round(ages.reduce((a,b)=>a+b)/ages.length):'—';
  const list=$('plist');if(!list)return;
  if(!fil.length){list.innerHTML=`<div class="empty"><div class="ei">🏟️</div><p>${players.length?'No players match your search.':'No players yet. Click "Add Player" to register your first squad member or share the registration link!'}</p>${!players.length?'<button class="mok" onclick="openAddPlayerModal()" style="margin-top:12px;display:inline-block;">➕ Add Player</button>':''}</div>`;return;}
  list.innerHTML=fil.map(p=>`
    <div class="pcard">
      <div class="pav">${p.photo?`<img src="${esc(p.photo)}" alt="">`:'👤'}</div>
      <div class="pi">
        <div class="pn">${esc(p.name)}<span class="jb">#${esc(p.jersey)}</span>${p.jersey2?`<span class="jb alt">#${esc(p.jersey2)}</span>`:''}</div>
        <div class="pm">
          <span class="mi">⚽ <strong>${esc(posCode(p.position))}</strong></span>
          <span class="mi">🎂 <strong>Age ${p.age||'—'}</strong></span>
          ${p.playernum?`<span class="mi">🔢 <strong>#${esc(p.playernum)}</strong></span>`:''}
          <span class="mi">📞 ${esc(p.phone||'—')}</span>
        </div>
        <div class="pm">
          <span class="mi">👨 <strong>${esc(p.father||'—')}</strong></span>
          <span class="mi">📍 ${esc((p.address||'').substring(0,36))}${(p.address||'').length>36?'…':''}</span>
          ${p.foot?`<span class="mi"><strong>${esc(p.foot)} Foot</strong></span>`:''}
        </div>
        ${p.notes?`<div class="pm"><span class="mi" style="color:var(--mt);">📝 ${esc(p.notes.substring(0,80))}${p.notes.length>80?'…':''}</span></div>`:''}
      </div>
      <div class="cacts">
        <button class="ib" onclick="viewPlayer('${p.id}')" title="View Form">👁</button>
        <button class="ib" onclick="requestPin('edit','${p.id}')">✏️</button>
        <button class="ib del" onclick="requestPin('delete','${p.id}')">✕</button>
      </div>
    </div>`).join('');
}

function requestPin(a,id){
  pinBuf='';pinAct=a;pinTgt=id;updDots();$('perrmsg').style.display='none';
  const m={
    delete:['🗑️','CONFIRM DELETE','Enter PIN to delete.'],
    edit:['✏️','EDIT PLAYER','Enter PIN to edit.'],
    clearall:['🗑️','CLEAR ALL','Enter PIN to delete ALL players.'],
    edit_session:['✏️','EDIT SESSION','Enter 4-digit PIN to edit this training session.'],
    delete_session:['🗑️','DELETE SESSION','Enter 4-digit PIN to delete this training session.']
  }[a]||['🔢','ENTER PIN','Enter your PIN.'];
  $('pico').textContent=m[0];$('ptit').textContent=m[1];$('pdesc').textContent=m[2];openM('m-pin');
}
function pk(k){
  if(k==='cancel'){closeM('m-pin');return;}
  if(k==='del'){pinBuf=pinBuf.slice(0,-1);updDots();return;}
  if(pinBuf.length>=4)return;pinBuf+=k;updDots();
  if(pinBuf.length===4)setTimeout(checkPin,150);
}
function updDots(){for(let i=0;i<4;i++)$('pd'+i).classList.toggle('filled',i<pinBuf.length);}
function checkPin(){
  if(pinBuf===gp()){
    closeM('m-pin');$('perrmsg').style.display='none';
    if(pinAct==='delete')doDel(pinTgt);
    if(pinAct==='edit')openEdit(pinTgt);
    if(pinAct==='clearall')doClearAll();
    if(pinAct==='edit_session')doEditSession(pinTgt);
    if(pinAct==='delete_session')doDeleteSession(pinTgt);
  } else {$('perrmsg').textContent='❌ Incorrect PIN';$('perrmsg').style.display='block';pinBuf='';updDots();}
}

async function doDel(id){try{await deleteDoc(doc(db,'players',id));}catch(e){alert('❌ Could not delete: '+(e.message||e));}}
async function doClearAll(){
  try{const snap=await getDocs(query(collection(db,'players'),where('teamId','==',curTeam.id)));const b=writeBatch(db);snap.docs.forEach(d=>b.delete(d.ref));await b.commit();}
  catch(e){alert('❌ Failed.');}
}

function openAddPlayerModal(){
  if(!curTeam){alert('Please select or open a team first.');return;}
  editId=null;
  editPhotoData=null;
  const mtit=document.querySelector('#m-edit .mtit');
  if(mtit)mtit.textContent='➕ ADD NEW PLAYER';
  const epPrev=$('e-photo-preview'),epPh=$('e-photo-ph'),epInp=$('e-photo-inp');
  if(epInp)epInp.value='';
  if(epPrev&&epPh){
    epPrev.style.display='none';
    epPrev.src='';
    epPh.style.display='block';
  }
  $('e-name').value='';$('e-dob').value='';$('e-age').value='';
  $('e-father').value='';$('e-addr').value='';
  $('e-ph').value='';
  $('e-j1').value='';$('e-j2').value='';$('e-sq').value='';$('e-foot').value='';$('e-notes').value='';
  const posList=(curTeam&&curTeam.positions&&curTeam.positions.length)?curTeam.positions:(pos&&pos.length?pos:[...DPOS]);
  $('e-pos').innerHTML='<option value="">Select Position</option>'+posList.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  openM('m-edit');
}

function openEdit(id){
  const p=players.find(x=>x.id===id);if(!p)return;editId=id;
  const mtit=document.querySelector('#m-edit .mtit');
  if(mtit)mtit.textContent='✏️ EDIT PLAYER';
  editPhotoData=p.photo||null;
  const epPrev=$('e-photo-preview'),epPh=$('e-photo-ph'),epInp=$('e-photo-inp');
  if(epInp)epInp.value='';
  if(epPrev&&epPh){
    if(p.photo){epPrev.src=p.photo;epPrev.style.display='block';epPh.style.display='none';}
    else{epPrev.style.display='none';epPrev.src='';epPh.style.display='block';}
  }
  $('e-name').value=p.name||'';$('e-dob').value=p.dob||'';$('e-age').value=p.age||'';
  $('e-father').value=p.father||'';$('e-addr').value=p.address||'';
  $('e-ph').value=(p.phone||'').replace('+91','');
  $('e-j1').value=p.jersey||'';$('e-j2').value=p.jersey2||'';$('e-sq').value=p.playernum||'';$('e-foot').value=p.foot||'';$('e-notes').value=p.notes||'';
  const posList=(curTeam&&curTeam.positions&&curTeam.positions.length)?curTeam.positions:(pos&&pos.length?pos:[...DPOS]);
  $('e-pos').innerHTML='<option value="">Select</option>'+posList.map(x=>`<option value="${esc(x)}"${x===posCode(p.position)?' selected':''}>${esc(x)}</option>`).join('');
  openM('m-edit');
}
function handleEditPhoto(input){
  const file=input.files[0];if(!file)return;
  compressImage(file, 300, 0.85, dataUrl => {
    editPhotoData=dataUrl;
    const prev=$('e-photo-preview'),ph=$('e-photo-ph');
    if(prev){prev.src=editPhotoData;prev.style.display='block';}
    if(ph){ph.style.display='none';}
  });
}
function eAge(){
  const d=$('e-dob').value;if(!d)return;
  const t=new Date(),b=new Date(d);let a=t.getFullYear()-b.getFullYear();
  if(t.getMonth()-b.getMonth()<0||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;
  $('e-age').value=a;
}
async function saveEdit(){
  const name=$('e-name').value.trim(),ph=$('e-ph').value.trim();
  if(!name){alert('Name is required.');return;}
  if(ph&&ph.length!==10){alert('Phone must be 10 digits.');return;}
  try{
    const updateData={
      teamId:curTeam.id,
      name,
      dob:$('e-dob').value,
      age:$('e-age').value,
      father:$('e-father').value.trim(),
      address:$('e-addr').value.trim(),
      phone:ph?'+91'+ph:'',
      position:$('e-pos').value,
      jersey:$('e-j1').value,
      jersey2:$('e-j2').value,
      playernum:$('e-sq').value,
      foot:$('e-foot').value,
      notes:$('e-notes').value.trim(),
      updatedAt:new Date().toISOString()
    };
    if(editPhotoData!==undefined&&editPhotoData!==null){
      updateData.photo=editPhotoData;
    }
    if(editId){
      await updateDoc(doc(db,'players',editId),updateData);
    }else{
      updateData.createdAt=new Date().toISOString();
      await addDoc(collection(db,'players'),updateData);
    }
    closeM('m-edit');
  }catch(e){alert('❌ Could not save: '+(e.message||e));}
}

const FORMATIONS={
  '4-4-2':[{r:'GK',n:1},{r:'DEF',n:4},{r:'MID',n:4},{r:'FWD',n:2}],
  '4-3-3':[{r:'GK',n:1},{r:'DEF',n:4},{r:'MID',n:3},{r:'FWD',n:3}],
  '3-5-2':[{r:'GK',n:1},{r:'DEF',n:3},{r:'MID',n:5},{r:'FWD',n:2}],
  '4-2-3-1':[{r:'GK',n:1},{r:'DEF',n:4},{r:'MID',n:2,lbl:'Def. Mid'},{r:'MID',n:3,lbl:'Att. Mid'},{r:'FWD',n:1}],
  '3-4-3':[{r:'GK',n:1},{r:'DEF',n:3},{r:'MID',n:4},{r:'FWD',n:3}],
  '5-3-2':[{r:'GK',n:1},{r:'DEF',n:5},{r:'MID',n:3},{r:'FWD',n:2}],
  '4-1-4-1':[{r:'GK',n:1},{r:'DEF',n:4},{r:'MID',n:1,lbl:'Hold. Mid'},{r:'MID',n:4},{r:'FWD',n:1}],
  '3-3-2':[{r:'GK',n:1},{r:'DEF',n:3},{r:'MID',n:3},{r:'FWD',n:2}],
  '3-4-1':[{r:'GK',n:1},{r:'DEF',n:3},{r:'MID',n:4},{r:'FWD',n:1}],
  '4-3-1':[{r:'GK',n:1},{r:'DEF',n:4},{r:'MID',n:3},{r:'FWD',n:1}],
  '3-2-1':[{r:'GK',n:1},{r:'DEF',n:3},{r:'MID',n:2},{r:'FWD',n:1}],
  '2-3-1':[{r:'GK',n:1},{r:'DEF',n:2},{r:'MID',n:3},{r:'FWD',n:1}],
  '2-2-2':[{r:'GK',n:1},{r:'DEF',n:2},{r:'MID',n:2},{r:'FWD',n:2}],
  '2-1-1':[{r:'GK',n:1},{r:'DEF',n:2},{r:'MID',n:1},{r:'FWD',n:1}],
  '1-2-1':[{r:'GK',n:1},{r:'DEF',n:1},{r:'MID',n:2},{r:'FWD',n:1}],
  '1-1':[{r:'GK',n:1},{r:'DEF',n:1},{r:'FWD',n:1}],
};
const ASIDE_FORMATIONS={
  3:['1-1'],
  5:['2-1-1','1-2-1'],
  7:['3-2-1','2-3-1','2-2-2'],
  9:['3-3-2','3-4-1','4-3-1'],
  11:['4-4-2','4-3-3','3-5-2','4-2-3-1','3-4-3','5-3-2','4-1-4-1'],
};
function formationTotal(key){return (FORMATIONS[key]||[]).reduce((s,l)=>s+l.n,0);}
function roleLabel(r){return r==='GK'?'Goalkeeper':r==='DEF'?'Defender':r==='MID'?'Midfielder':'Forward';}
function slotSideLabel(role,x,lbl){
  if(role==='GK')return 'Goalkeeper';
  const side=x<35?'Left':x>65?'Right':'Center';
  const word=lbl||(role==='DEF'?'Back':role==='MID'?'Mid':'Striker');
  return `${side} ${word}`;
}
function flattenFormation(key){
  const lines=FORMATIONS[key]||FORMATIONS['4-4-2'];
  const outfield=lines.length-1,out=[];
  lines.forEach((line,li)=>{
    let y;
    if(li===0){y=88;}
    else if(outfield===1){y=45;}
    else{y=76-((li-1)*(64/(outfield-1)));}
    for(let i=0;i<line.n;i++){
      const x=8+(84/(line.n+1))*(i+1);
      out.push({role:line.r,label:line.lbl||roleLabel(line.r),x,y});
    }
  });
  return out;
}
function classifyPos(position){
  const code=posCode(position);
  if(code==='GK')return 'GK';
  if(code==='RB'||code==='LB'||code==='CB'||code==='RWB'||code==='LWB')return 'DEF';
  if(code==='RW'||code==='LW'||code==='CF'||code==='ST')return 'FWD';
  return 'MID';
}
function toFBPositionCode(position){return posCode(position)||'ST';}

function mergeCustomFormations(){
  mergedCustomFormationKeys.forEach(k=>{delete FORMATIONS[k];});
  mergedCustomFormationKeys=[];
  (curTeam&&curTeam.customFormations||[]).forEach(f=>{
    if(f&&f.key&&f.def){FORMATIONS[f.key]=f.def;mergedCustomFormationKeys.push(f.key);}
  });
}

function buildFormationSyncPayload(){
  mergeCustomFormations();
  const vState = curTeam && curTeam.visualizerState;
  const sq = curTeam && curTeam.squad;
  
  // Prefer active in-memory luSlots (even before saving), fallback to saved squad
  const hasActiveSlots = Array.isArray(luSlots) && luSlots.some(Boolean);
  const activeSlots = hasActiveSlots ? luSlots : (sq && sq.slots ? sq.slots.map(s => s && s.player) : []);
  const hasActiveSubs = Array.isArray(luSubs) && luSubs.some(Boolean);
  const activeSubs = hasActiveSubs ? luSubs.filter(Boolean) : (sq && sq.subs ? sq.subs : []);

  let payload = {};
  if(activeSlots.some(Boolean) || activeSubs.length){
    const management = (sq && sq.staff ? sq.staff : (curTeam && curTeam.staff || [])).map(s=>({id:s.id,name:s.name,role:s.role||'Other'}));
    const when = sq && sq.updatedAt ? new Date(sq.updatedAt).toLocaleDateString() : '';
    const source = `Synced from Tactics Studio${sq && sq.name ? ' — '+sq.name : ''}${when ? ' (saved '+when+')' : ''}`;
    
    // Starters mapped 1-to-1 with the slot and exact match position chosen by coach
    const starters = activeSlots.map(p => p ? {
      id: p.id,
      name: p.name,
      number: p.jersey || '-',
      position: toFBPositionCode(p.matchPosition || p.position)
    } : null);

    const subs = activeSubs.map(s => ({
      id: s.id,
      name: s.name,
      number: s.jersey || '-',
      position: toFBPositionCode(s.position)
    }));

    const usedIds = new Set();
    activeSlots.forEach(p => { if(p && p.id) usedIds.add(p.id); });
    activeSubs.forEach(s => { if(s && s.id) usedIds.add(s.id); });

    const outOfSquad = (players||[]).filter(p=>!usedIds.has(p.id)).map(p=>({id:p.id,name:p.name,number:p.jersey||'-',position:toFBPositionCode(p.position)}));
    const formationKey = luFormation || (sq && sq.formation) || (vState && vState.formationKey) || '4-4-2';
    const formationDef = FORMATIONS[formationKey] || null;
    payload = {isCoach:true, formation:formationKey, formationDef, starters, subs, outOfSquad, management, source};
  } else {
    const rosterPlayers = (players||[]).map(p=>({id:p.id,name:p.name,number:p.jersey||'-',position:toFBPositionCode(p.position)}));
    const management = (curTeam&&curTeam.staff||[]).map(s=>({id:s.id,name:s.name,role:s.role||'Other'}));
    const formationKey = luFormation || (sq && sq.formation) || (vState && vState.formationKey) || '4-4-2';
    const formationDef = FORMATIONS[formationKey] || null;
    payload = {isCoach:true, formation:formationKey, formationDef, players:rosterPlayers, management, source:'No saved Tactics Studio lineup yet — loaded full player database instead'};
  }
  if(vState){
    if(vState.customPos) payload.customPos = vState.customPos;
    if(vState.ballPos) payload.ballPos = vState.ballPos;
    if(vState.formationKey) payload.visualizerFormation = vState.formationKey;
    if(typeof vState.showZones === 'boolean') payload.showZones = vState.showZones;
    if(typeof vState.showThirds === 'boolean') payload.showThirds = vState.showThirds;
    if(typeof vState.unitCoverShift === 'boolean') payload.unitCoverShift = vState.unitCoverShift;
    if(typeof vState.showCoverLines === 'boolean') payload.showCoverLines = vState.showCoverLines;
    if(Array.isArray(vState.activeLines)) payload.activeLines = vState.activeLines;
  }
  if(curTeam){
    payload.teamId = curTeam.id;
    payload.teamName = curTeam.name || 'Team';
  }
  return payload;
}

function sendFormationSync(){
  const frame=$('formation-builder-frame');
  if(!frame||!frame.contentWindow)return;
  frame.contentWindow.postMessage(Object.assign({type:'ff-sync'},buildFormationSyncPayload()),'*');
  sendFrameChatSync();
}

function sendPubFormationSync(){
  const frame=$('pv-formation-frame');
  if(!frame||!frame.contentWindow||!pvTeam)return;
  frame.contentWindow.postMessage(Object.assign({type:'ff-sync'},buildPubFormationSyncPayload()),'*');
  sendFrameChatSync();
}

function sendFrameChatSync(){
  const teamFrame = $('formation-builder-frame');
  const pubFrame = $('pv-formation-frame');
  if(teamFrame && teamFrame.contentWindow && curTeam){
    teamFrame.contentWindow.postMessage({
      type: 'ff-chat-sync',
      msgs: coachChatMsgs,
      isCoach: true,
      currentId: { name: (curTeam.name ? curTeam.name + ' (Coach)' : 'Coach'), role: 'coach' }
    }, '*');
  }
  if(pubFrame && pubFrame.contentWindow && pvId){
    pubFrame.contentWindow.postMessage({
      type: 'ff-chat-sync',
      msgs: pubChatMsgs,
      isCoach: false,
      currentId: getChatIdentity()
    }, '*');
  }
}

window.addEventListener('message',e=>{
  const d=e.data;
  if(!d||typeof d!=='object')return;
  if(d.type==='ff-ready'||d.type==='ff-request-sync'){
    const teamFrame=$('formation-builder-frame');
    const pubFrame=$('pv-formation-frame');
    if(teamFrame&&e.source===teamFrame.contentWindow)sendFormationSync();
    if(pubFrame&&e.source===pubFrame.contentWindow)sendPubFormationSync();
  }
  if(d.type==='ff-height'&&d.height){
    const teamFrame=$('formation-builder-frame');
    const pubFrame=$('pv-formation-frame');
    const safeH = Math.min(Math.max(720, d.height+10), 1350);
    if(teamFrame&&e.source===teamFrame.contentWindow)teamFrame.style.height=safeH+'px';
    if(pubFrame&&e.source===pubFrame.contentWindow)pubFrame.style.height=safeH+'px';
  }
  if(d.type==='ff-chat-send'){
    const teamFrame=$('formation-builder-frame');
    const pubFrame=$('pv-formation-frame');
    if(teamFrame&&e.source===teamFrame.contentWindow)sendCoachChatDirect(d.text);
    if(pubFrame&&e.source===pubFrame.contentWindow)sendPubChatDirect(d.text);
  }
  if(d.type==='ff-chat-pin'){
    togglePinChat(d.msgId, d.currentPinned);
  }
  if(d.type==='ff-chat-delete'){
    deleteChatMessage(d.msgId);
  }
  if(d.type==='ff-chat-clear'){
    clearTeamChat();
  }
  if(d.type==='ff-chat-change-id'){
    openChatIdentityModal();
  }
  if(d.type==='ff-chat-toggle'){
    toggleLineupChat(d.isCoach ? 'coach' : 'pub');
  }
  if(d.type==='ff-open-share'){
    openShareLinkModal(d.shareType || 'view');
  }
  if(d.type==='ff-formation-change'&&d.formationKey){
    if(FORMATIONS[d.formationKey]){
      changeFormation(d.formationKey);
    }
  }
  if(d.type==='ff-visualizer-save'&&curTeam){
    const vState = {
      customPos: d.customPos || {},
      ballPos: d.ballPos || { x: 50, y: 50 },
      formationKey: d.formationKey || curTeam.squad?.formation || '4-4-2',
      showZones: typeof d.showZones === 'boolean' ? d.showZones : true,
      showThirds: typeof d.showThirds === 'boolean' ? d.showThirds : false,
      unitCoverShift: typeof d.unitCoverShift === 'boolean' ? d.unitCoverShift : true,
      showCoverLines: typeof d.showCoverLines === 'boolean' ? d.showCoverLines : true,
      activeLines: Array.isArray(d.activeLines) ? d.activeLines : ['GK','DEF','MID','FWD'],
      updatedAt: new Date().toISOString()
    };
    curTeam.visualizerState = vState;
    clearTimeout(_visSaveTimer);
    _visSaveTimer = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'teams', curTeam.id), {
          visualizerState: vState
        });
      } catch(err) {
        console.warn('Error persisting visualizer state:', err);
      }
    }, 150);
  }
});
let _visSaveTimer = null;

let luFormation='4-4-2',luAside=11,luSlots=[],luSubs=[],luStaff=[],luActive=-1,luBenchActive=-1,luFilterRole='ALL',luFilterExact='',luBenchFilterRole='ALL',luBenchFilterExact='';

function openLineup(){
  mergeCustomFormations();
  luBenchFilterRole='ALL';
  luBenchFilterExact='';
  if(!players.length){
    $('lu-formation-row').innerHTML='';
    $('lu-pitch').innerHTML='';
    $('lu-picker').innerHTML='<p class="lu-hint">No players in the database yet. Share your registration link to add players before building a match squad.</p>';
    $('lu-bench').innerHTML='';
    const bp = $('lu-bench-picker');
    if(bp) bp.innerHTML='<p class="lu-hint">No players available.</p>';
    $('lu-benchcount').textContent='0';
    const oosEl = $('lu-out-of-squad');
    if(oosEl) oosEl.innerHTML='<p class="lu-hint">No players available.</p>';
    const oosCount = $('lu-outofsquatcount');
    if(oosCount) oosCount.textContent='0';
    $('lu-staff').innerHTML='';
    if($('lu-opponent')) $('lu-opponent').value='';
    if($('lu-tournament')) $('lu-tournament').value='';
    if($('lu-venue')) $('lu-venue').value='';
    if($('lu-name')) $('lu-name').value='';
    $('lu-squadsize').value='';
    return;
  }
  const sq=curTeam&&curTeam.squad;
  luFormation=(sq&&sq.formation&&FORMATIONS[sq.formation])?sq.formation:'4-4-2';
  luAside=formationTotal(luFormation);
  const flat=flattenFormation(luFormation);
  luSlots=flat.map((_,i)=>{
    if(sq&&sq.slots&&sq.slots[i]&&sq.slots[i].player){
      const sp=sq.slots[i].player;
      const found=players.find(pl=>pl.id===sp.id);
      return {
        id: sp.id,
        name: found ? found.name : sp.name,
        position: found ? found.position : sp.position,
        jersey: (found && found.jersey != null && found.jersey !== '') ? found.jersey : (sp.jersey || ''),
        photo: (found && found.photo) ? found.photo : (sp.photo || null),
        matchPosition: posCode(sp.matchPosition || (found && found.position) || sp.position)
      };
    }
    return null;
  });
  
  const maxSubs=getMaxSubs();
  luSubs=[];
  for(let i=0;i<maxSubs;i++){
    if(sq&&sq.subs&&sq.subs[i]){
      const sb=sq.subs[i];
      const found=players.find(pl=>pl.id===sb.id);
      if(found){
        luSubs.push({
          id: found.id,
          name: found.name,
          position: found.position,
          jersey: (found.jersey != null && found.jersey !== '') ? found.jersey : (sb.jersey || ''),
          photo: found.photo || sb.photo || null
        });
      } else {
        luSubs.push({
          id: sb.id,
          name: sb.name,
          position: sb.position,
          jersey: sb.jersey || '',
          photo: sb.photo || null
        });
      }
    } else {
      luSubs.push(null);
    }
  }
  luBenchActive=luSubs.findIndex(s=>!s);
  if(luBenchActive<0)luBenchActive=0;

  luStaff=[];
  if(sq&&sq.staff){
    sq.staff.forEach(s=>{const found=(curTeam.staff||[]).find(st=>st.id===s.id);if(found)luStaff.push({id:found.id,name:found.name,role:found.role});});
  }
  luActive=luSlots.findIndex(s=>!s);
  luFilterRole=luActive>=0?flat[luActive].role:'ALL';luFilterExact='';
  if($('lu-opponent')) $('lu-opponent').value=(sq&&sq.opponent)||(sq&&sq.name)||'';
  if($('lu-tournament')) $('lu-tournament').value=(sq&&sq.tournament)||'';
  if($('lu-venue')) $('lu-venue').value=(sq&&sq.venue)||'';
  if($('lu-name')) $('lu-name').value=(sq&&sq.name)||'';
  $('lu-squadsize').value=(sq&&sq.squadSize)||'';
  renderLineupModal();
}

function renderFormationRow(){
  const el=$('lu-formation-row');if(!el)return;
  const customKeys=new Set((curTeam&&curTeam.customFormations||[]).map(f=>f.key));
  const validKeys=(ASIDE_FORMATIONS[luAside]||[]).concat([...customKeys].filter(k=>formationTotal(k)===luAside));
  const keys=[...new Set(validKeys)];
  const opts=keys.map(k=>`<option value="${esc(k)}" ${k===luFormation?'selected':''}>${esc(k)}${customKeys.has(k)?' (custom)':''}</option>`).join('');
  el.innerHTML=`<select id="lu-formation-select" class="matchset-select" onchange="if(this.value==='__manage__'){this.value=luFormation;openFormationManager();}else{changeFormation(this.value);}">
    ${opts}
    <option value="__manage__">⚙️ Manage formations…</option>
  </select>`;
  const asideSel=$('lu-aside');if(asideSel)asideSel.value=String(luAside);
}

function changeAside(n){
  if(n===luAside)return;
  luAside=n;
  const options=ASIDE_FORMATIONS[luAside]||[];
  const stillValid=options.includes(luFormation)&&formationTotal(luFormation)===luAside;
  const nextFormation=stillValid?luFormation:(options[0]||luFormation);
  changeFormation(nextFormation);
}

function changeFormation(key){
  const assigned=luSlots.filter(Boolean);
  const newFlat=flattenFormation(key);
  luFormation=key;
  luSlots=newFlat.map((_,i)=>assigned[i]?{...assigned[i]}:null);
  if(assigned.length>newFlat.length){
    assigned.slice(newFlat.length).forEach(pl=>{
      if(!luSubs.some(s=>s.id===pl.id))luSubs.push({...pl});
    });
  }
  const firstEmpty=luSlots.findIndex(s=>!s);
  luActive=firstEmpty;
  luFilterRole=luActive>=0?newFlat[luActive].role:'ALL';
  luFilterExact='';
  renderLineupModal();
}

const BUILTIN_FORMATION_KEYS=new Set(['4-4-2','4-3-3','3-5-2','4-2-3-1','3-4-3','5-3-2','4-1-4-1','3-3-2','3-4-1','4-3-1','3-2-1','2-3-1','2-2-2','2-1-1','1-2-1','1-1']);
function openFormationManager(){
  const outfield=Math.max(0,luAside-1);
  const def=Math.max(1,Math.floor(outfield/2));
  const fwd=outfield>=2?1:0;
  const cdm=0;
  const wing=0;
  const mid=Math.max(0,outfield-def-fwd-cdm-wing);
  $('cf-def').value=def;$('cf-cdm').value=cdm;$('cf-mid').value=mid;$('cf-wing').value=wing;$('cf-fwd').value=fwd;$('cf-label').value='';
  $('cf-aside-note').textContent=`Building a ${luAside}-a-side formation — 1 goalkeeper + ${outfield} outfield player${outfield===1?'':'s'}.`;
  renderFormationManagerList();
  openM('m-formations');
}

function renderFormationManagerList(){
  const list=((curTeam&&curTeam.customFormations)||[]).filter(f=>formationTotal(f.key)===luAside||(f.def&&f.def.reduce((s,l)=>s+l.n,0)===luAside));
  const el=$('cf-list');
  if(!list.length){el.innerHTML=`<p class="lu-hint">No custom ${luAside}-a-side formations yet — add one below.</p>`;return;}
  el.innerHTML=list.map(f=>`<div class="lu-item"><div class="lu-info"><div class="lu-name">${esc(f.label||f.key)}</div><div class="lu-meta">${esc(f.key)}</div></div><div class="lu-tag" style="cursor:pointer;background:#e5393522;color:#e53935;" onclick="deleteCustomFormation('${esc(f.key).replace(/'/g,"\\'")}')">Delete</div></div>`).join('');
}

async function saveCustomFormation(){
  const def=parseInt($('cf-def').value)||0,cdm=parseInt($('cf-cdm').value)||0,mid=parseInt($('cf-mid').value)||0,wing=parseInt($('cf-wing').value)||0,fwd=parseInt($('cf-fwd').value)||0;
  const total=1+def+cdm+mid+wing+fwd;
  if(total!==luAside){alert(`Defenders + CDM + Midfielders + Wingers + Strikers + Goalkeeper must add up to ${luAside} for a ${luAside}-a-side game. Currently: ${total}`);return;}
  let label=$('cf-label').value.trim()||`${def}-${cdm?cdm+'-':''}${mid}${wing?'-'+wing:''}-${fwd}`;
  let key=label;
  const list=[...(curTeam.customFormations||[])];
  if(BUILTIN_FORMATION_KEYS.has(key)||list.some(f=>f.key===key)){
    if(!confirm(`"${key}" already exists — overwrite it?`))return;
  }
  const formDef=[{r:'GK',n:1}];
  if(def>0)formDef.push({r:'DEF',n:def});
  if(cdm>0)formDef.push({r:'MID',n:cdm,lbl:'CDM'});
  if(mid>0)formDef.push({r:'MID',n:mid});
  if(wing>0)formDef.push({r:'FWD',n:wing,lbl:'Winger'});
  if(fwd>0)formDef.push({r:'FWD',n:fwd,lbl:'Striker'});
  const idx=list.findIndex(f=>f.key===key);
  const entry={key,label,def:formDef};
  if(idx>=0)list[idx]=entry;else list.push(entry);
  try{
    await updateDoc(doc(db,'teams',curTeam.id),{customFormations:list});
    curTeam.customFormations=list;
    mergeCustomFormations();
    renderFormationManagerList();
    renderFormationRow();
    alert('✅ Formation saved! You can now pick it from the formation dropdown.');
  }catch(e){alert('❌ Could not save formation: '+(e.message||e));}
}

async function deleteCustomFormation(key){
  if(!confirm('Delete this custom formation?'))return;
  const list=(curTeam.customFormations||[]).filter(f=>f.key!==key);
  try{
    await updateDoc(doc(db,'teams',curTeam.id),{customFormations:list});
    curTeam.customFormations=list;
    renderFormationManagerList();
    if(luFormation===key){changeFormation((ASIDE_FORMATIONS[luAside]||['4-4-2'])[0]);}else{renderFormationRow();}
  }catch(e){alert('❌ Could not delete formation: '+(e.message||e));}
}

function renderPitch(){
  const el=$('lu-pitch');if(!el)return;
  const lines=FORMATIONS[luFormation]||FORMATIONS['4-4-2'];
  const flat=flattenFormation(luFormation);
  const posList=(curTeam&&curTeam.positions)||DPOS;
  let idx=0,html='';
  lines.forEach((line, lineIdx)=>{
    const label=line.lbl||roleLabel(line.r);
    const header=line.n>1?`${label}s (${line.n})`:label;
    const isFirst = lineIdx === 0;
    html+=`<div class="lc-title" style="margin:${isFirst ? '4px 0 6px' : '14px 0 6px'};">${esc(header.toUpperCase())}</div>`;
    for(let k=0;k<line.n;k++){
      const i=idx;idx++;
      const p=luSlots[i];
      const sideLabel=slotSideLabel(line.r,flat[i]?flat[i].x:50,line.lbl);
      const cls=`lu-item ${p?'filled':'empty-slot'} ${i===luActive?'active-slot':''}`;
      const av=p?playerLineupAv(p):'<div class="lu-av">+</div>';
      const name=p?esc(p.name):esc(label);
      const meta=p?`${esc(posCode(p.position)||'—')} <span class="lu-slotside">· ${esc(sideLabel)}</span>`:`Tap to assign <span class="lu-slotside">· ${esc(sideLabel)}</span>`;
      const mpos=p?(p.matchPosition||posCode(p.position)||''):'';
      const posOptions=posList.map(po=>`<option value="${esc(po)}" ${po===mpos?'selected':''}>${esc(po)}</option>`).join('');
      const actions=p?`<div class="lu-slot-actions" onclick="event.stopPropagation();">
          <select class="lu-possel" title="Actual playing position for this match" onchange="setSlotMatchPosition(${i},this.value)">${posOptions}</select>
          <div class="lu-tag lu-remove-tag" onclick="removeSlot(${i})">Remove</div>
        </div>`:`<div class="lu-tag">Assign</div>`;
      html+=`<div class="${cls}" id="lu-slot-item-${i}" data-slot-index="${i}" onclick="selectSlot(${i})">
        ${av}
        <div class="lu-info"><div class="lu-name">${name}</div><div class="lu-meta">${meta}</div></div>
        ${actions}
      </div>`;
    }
  });
  el.innerHTML=html;
  renderMiniPitch(false);

  // Update squad slots counter badge
  const totalCount = flat.length;
  const filledCount = luSlots.slice(0, totalCount).filter(Boolean).length;
  const countBadge = $('lu-slots-count-badge');
  if(countBadge){
    countBadge.textContent = `${filledCount}/${totalCount} Assigned`;
    countBadge.style.background = filledCount === totalCount ? '#1a5c1a' : '#2d3748';
  }
}

function renderMiniJerseySvg(p, slotDef, isCurrentActive){
  const isGK = slotDef.role === 'GK' || (p && p.matchPosition === 'GK') || (p && p.position === 'Goalkeeper');
  const mpos = p ? (p.matchPosition || posCode(p.position) || slotDef.role) : (slotDef.label || slotDef.role);
  const group = isGK ? 'GK' : classifyPos(mpos);
  
  let strokeColor = '#3D7DB0';
  let fillColor = '#F4F1E8';
  let textColor = '#132B1C';

  if(isGK){
    strokeColor = '#E67E22';
    fillColor = '#E8B34C';
    textColor = '#132B1C';
  } else if(group === 'DEF'){
    strokeColor = '#3D7DB0';
    fillColor = '#F4F1E8';
    textColor = '#132B1C';
  } else if(group === 'MID'){
    strokeColor = '#D9A63E';
    fillColor = '#F4F1E8';
    textColor = '#132B1C';
  } else if(group === 'FWD'){
    strokeColor = '#C0453A';
    fillColor = '#F4F1E8';
    textColor = '#132B1C';
  }

  if(!p){
    fillColor = 'rgba(244,241,232,0.22)';
    textColor = 'rgba(255,255,255,0.9)';
    strokeColor = isCurrentActive ? '#F1C40F' : 'rgba(244,241,232,0.7)';
  } else if(isCurrentActive){
    strokeColor = '#F1C40F';
  }

  const jNum = p ? (p.jersey != null && p.jersey !== '' ? String(p.jersey) : (posCode(mpos) || '—')) : (posCode(mpos) || '—');
  const activeShadow = isCurrentActive ? 'filter:drop-shadow(0 0 8px rgba(241,196,15,0.95));' : 'filter:drop-shadow(0 3px 5px rgba(0,0,0,0.45));';
  const fontSize = jNum.length > 2 ? '13' : '17';
  const textY = jNum.length > 2 ? '40' : '42';

  return `
    <div class="mini-pitch-jersey-wrap">
      <svg width="38" height="38" viewBox="0 0 64 64" style="${activeShadow} pointer-events:none;">
        <path
          d="M20,6 L8,14 L14,26 L20,22 L20,58 L44,58 L44,22 L50,26 L56,14 L44,6 L38,10 Q32,16 26,10 Z"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${isCurrentActive ? '3.5' : '2.5'}"
          stroke-linejoin="round"
          ${!p ? 'stroke-dasharray="3.5 2.5"' : ''}
        />
        <text
          x="32" y="${textY}"
          text-anchor="middle"
          font-size="${fontSize}"
          font-weight="800"
          fill="${textColor}"
          font-family="'JetBrains Mono', 'Bebas Neue', 'DM Sans', monospace"
        >
          ${esc(jNum)}
        </text>
      </svg>
    </div>
  `;
}

function formatMiniPitchName(rawName){
  if(!rawName) return '';
  const str = String(rawName).trim();
  const parts = str.split(/\s+/);
  if(parts.length === 2){
    return `${esc(parts[0])}<br>${esc(parts[1])}`;
  } else if(parts.length > 2){
    const mid = Math.ceil(parts.length / 2);
    const line1 = parts.slice(0, mid).join(' ');
    const line2 = parts.slice(mid).join(' ');
    return `${esc(line1)}<br>${esc(line2)}`;
  }
  return esc(str);
}

function renderMiniPitch(isPub){
  const el=$(isPub ? 'pv-lu-mini-pitch' : 'lu-mini-pitch');
  if(!el)return;
  const fBadge=$(isPub ? 'pv-lu-pitch-formation-badge' : 'lu-pitch-formation-badge');
  const formationKey = isPub ? (pvTeam?.squad?.formation || '4-4-2') : luFormation;
  if(fBadge) fBadge.textContent = formationKey;

  const flat=flattenFormation(formationKey);
  const slots=isPub ? (pvTeam?.squad?.slots || []) : luSlots;
  const activeIdx=isPub ? -1 : luActive;

  let tokensHtml='';
  flat.forEach((slotDef,i)=>{
    const p=isPub ? (slots[i]?.player || null) : slots[i];
    const isGK=slotDef.role==='GK';
    const isCurrentActive=activeIdx===i;
    const name=p?.name || slotDef.label || roleLabel(slotDef.role);
    const mpos=p?(p.matchPosition||posCode(p.position)||slotDef.role):(slotDef.label||slotDef.role);
    const jerseySvg=renderMiniJerseySvg(p, slotDef, isCurrentActive);

    const clickHandler=isPub ? '' : `onclick="selectSlot(${i})"`;
    const cursorStyle=isPub ? 'cursor:default;' : 'cursor:pointer;';

    tokensHtml+=`
      <div class="mini-pitch-token ${p?'filled':'empty'} ${isGK?'gk':''} ${isCurrentActive?'active':''}" 
           style="left:${slotDef.x}%;top:${slotDef.y}%;${cursorStyle}" 
           ${clickHandler} 
           title="${esc(name)} (${esc(mpos)})">
        ${jerseySvg}
        <div class="mini-pitch-token-lbl">
          <div class="mini-pitch-token-name" style="white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;word-break:break-word;line-height:1.1;max-width:70px;text-align:center;font-size:8.5px;font-weight:700;">${formatMiniPitchName(name)}</div>
          <div class="mini-pitch-token-pos">${esc(posCode(mpos)||mpos)}</div>
        </div>
      </div>
    `;
  });

  const svgLines=`
    <svg class="mini-pitch-lines" viewBox="0 0 100 147" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="96" height="143" rx="3" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.2" />
      <line x1="2" y1="73.5" x2="98" y2="73.5" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" />
      <circle cx="50" cy="73.5" r="16" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" />
      <circle cx="50" cy="73.5" r="1.2" fill="rgba(255,255,255,0.8)" />
      <rect x="36" y="2" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" />
      <rect x="23" y="2" width="54" height="24" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" />
      <circle cx="50" cy="18" r="1.2" fill="rgba(255,255,255,0.8)" />
      <path d="M 38 26 A 14 14 0 0 0 62 26" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" />
      <rect x="36" y="137" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" />
      <rect x="23" y="121" width="54" height="24" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" />
      <circle cx="50" cy="129" r="1.2" fill="rgba(255,255,255,0.8)" />
      <path d="M 38 121 A 14 14 0 0 1 62 121" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" />
      <path d="M 2 6 A 4 4 0 0 0 6 2" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1" />
      <path d="M 94 2 A 4 4 0 0 0 98 6" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1" />
      <path d="M 2 141 A 4 4 0 0 1 6 145" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1" />
      <path d="M 98 141 A 4 4 0 0 0 94 145" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1" />
    </svg>
  `;

  el.innerHTML=`${svgLines}${tokensHtml}`;
}

function setSlotMatchPosition(i,value){
  if(!luSlots[i])return;
  luSlots[i].matchPosition=value;
  renderPitch();
  renderMiniPitch(false);
}
function selectSlot(i){
  if(luActive===i){luActive=-1;renderPitch();renderMiniPitch(false);renderPicker();return;}
  luActive=i;
  const flat=flattenFormation(luFormation);
  luFilterRole=flat[i].role;luFilterExact='';
  renderPitch();renderMiniPitch(false);renderPicker();

  // Scroll active slot smoothly within container
  setTimeout(()=>{
    const slotEl = $(`lu-slot-item-${i}`);
    const container = $('lu-slots-scroll-container');
    if(slotEl && container){
      const cRect = container.getBoundingClientRect();
      const sRect = slotEl.getBoundingClientRect();
      if(sRect.top < cRect.top || sRect.bottom > cRect.bottom){
        slotEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, 10);
}
function removeSlot(i){
  luSlots[i]=null;luActive=i;
  const flat=flattenFormation(luFormation);
  luFilterRole=flat[i].role;luFilterExact='';
  renderPitch();renderMiniPitch(false);renderPicker();renderBench();renderOutOfSquad();
}
function usedIdsSet(excludeSlotIdx){
  const s=new Set();
  luSlots.forEach((p,i)=>{if(p&&p.id&&i!==excludeSlotIdx)s.add(p.id);});
  luSubs.forEach(p=>{if(p&&p.id)s.add(p.id);});
  return s;
}
function benchUsedIdsSet(){
  const s=new Set();
  luSlots.forEach(p=>{if(p&&p.id)s.add(p.id);});
  luSubs.forEach(p=>{if(p&&p.id)s.add(p.id);});
  return s;
}
function setFilterRole(r){luFilterRole=r;luFilterExact='';renderPicker();}
function setFilterExact(p){luFilterExact=(luFilterExact===p)?'':p;renderPicker();}

function renderPicker(){
  const el=$('lu-picker');if(!el)return;
  const subtitleEl=$('lu-picker-subtitle');
  if(luActive<0){
    if(subtitleEl) subtitleEl.textContent='Tap to Assign';
    el.innerHTML='<div style="padding:24px 14px;text-align:center;background:rgba(26,92,26,0.03);border:1.5px dashed var(--bd);border-radius:12px;margin:auto 0;"><div style="font-size:24px;margin-bottom:8px;">👆</div><p class="lu-hint" style="margin:0;line-height:1.4;">Tap any position on the tactical pitch or starting XI list to assign a player.</p></div>';
    return;
  }
  const flat=flattenFormation(luFormation),slotDef=flat[luActive],current=luSlots[luActive];
  const used=usedIdsSet(luActive);
  const avail=players.filter(p=>!used.has(p.id));
  const roleOrder=['GK','DEF','MID','FWD'];
  const rolesPresent=roleOrder.filter(r=>avail.some(p=>classifyPos(p.position)===r));
  const roleChips=['ALL',...rolesPresent].map(r=>`<button type="button" class="fchip ${luFilterRole===r?'active':''}" onclick="setFilterRole('${r}')">${r==='ALL'?'All':roleLabel(r)+'s'}</button>`).join('');
  const scoped=luFilterRole==='ALL'?avail:avail.filter(p=>classifyPos(p.position)===luFilterRole);
  const exactPositions=[...new Set(scoped.map(p=>posCode(p.position)).filter(Boolean))].sort();
  const exactChips=exactPositions.length>1?`<div id="lu-exact-row" style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 2px;">${exactPositions.map(p=>`<button type="button" class="fchip ${luFilterExact===p?'active':''}" style="padding:4px 9px;font-size:10.5px;" onclick="setFilterExact('${esc(p).replace(/'/g,"\\'")}')">${esc(p)}</button>`).join('')}</div>`:'';
  const finalList=luFilterExact?scoped.filter(p=>posCode(p.position)===luFilterExact):scoped;
  const row=list=>list.map(p=>`<div class="lu-item" onclick="assignSlot(${luActive},'${p.id}')">
      ${playerLineupAv(p)}
      <div class="lu-info"><div class="lu-name">${esc(p.name)}</div><div class="lu-meta">${esc(posCode(p.position)||'—')}</div></div>
      <div class="lu-tag">Pick</div>
    </div>`).join('');

  const sideTxt = esc(slotSideLabel(slotDef.role,slotDef.x,slotDef.label!==roleLabel(slotDef.role)?slotDef.label:null));
  if(subtitleEl) subtitleEl.textContent=sideTxt;

  el.innerHTML=`
    <div style="flex-shrink:0;">
      <div class="lu-picker-head" style="margin:0 0 6px;">Assigning: <strong style="color:var(--tx);">${sideTxt}</strong></div>
      ${current?`<div class="lu-item filled" style="margin-bottom:8px;">${playerLineupAv(current)}<div class="lu-info"><div class="lu-name">${esc(current.name)}</div><div class="lu-meta">Currently in this position</div></div><div class="lu-tag lu-remove-tag" style="cursor:pointer;" onclick="removeSlot(${luActive})">Remove</div></div>`:''}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 4px;">${roleChips}</div>
      ${exactChips}
    </div>
    <div style="flex:1;min-height:0;overflow-y:auto;margin-top:6px;padding-right:2px;">
      ${finalList.length?`<div class="lu-list">${row(finalList)}</div>`:'<p class="lu-hint" style="margin-top:8px;">No available players in this filter.</p>'}
    </div>
  `;
}

function assignSlot(i,pid){
  const p=players.find(pl=>pl.id===pid);if(!p)return;
  luSubs=luSubs.map(s=>(s&&s.id===pid)?null:s);
  luSlots=luSlots.map(s=>(s&&s.id===pid)?null:s);
  luSlots[i]={id:p.id,name:p.name,position:p.position,jersey:p.jersey,photo:p.photo||null,matchPosition:posCode(p.position)};
  let next=-1;
  for(let k=1;k<=luSlots.length;k++){const idx=(i+k)%luSlots.length;if(!luSlots[idx]){next=idx;break;}}
  luActive=next;
  if(next>=0){
    const flat=flattenFormation(luFormation);
    luFilterRole=(flat[next]&&flat[next].role)?flat[next].role:'ALL';
    luFilterExact='';
  } else {
    luFilterRole='ALL';
    luFilterExact='';
  }
  renderPitch();renderMiniPitch(false);renderPicker();renderBench();renderOutOfSquad();

  if(next>=0){
    setTimeout(()=>{
      const slotEl = $(`lu-slot-item-${next}`);
      const container = $('lu-slots-scroll-container');
      if(slotEl && container){
        slotEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 10);
  }
}

function validateSquadSize(){
  const inp=$('lu-squadsize');
  if(!inp)return;
  const v=parseInt(inp.value);
  if(v&&v<luAside){
    alert(`Squad size (${v}) can't be smaller than the game size — ${luAside}-a-side needs at least ${luAside} players. Please enter ${luAside} or more.`);
    inp.value=luAside;
  }
  renderBench();
}

function getMaxSubs(){
  const size=parseInt($('lu-squadsize')?.value)||null;
  const xi=flattenFormation(luFormation).length;
  return size?Math.max(0,size-xi):9;
}

function setBenchFilterRole(r){
  luBenchFilterRole=r;
  luBenchFilterExact='';
  renderBenchPicker();
}

function setBenchFilterExact(p){
  luBenchFilterExact=(luBenchFilterExact===p)?'':p;
  renderBenchPicker();
}

function renderBench(){
  const benchEl=$('lu-bench');
  if(!benchEl)return;
  const maxSubs=getMaxSubs();

  while(luSubs.length<maxSubs)luSubs.push(null);
  if(luSubs.length>maxSubs)luSubs=luSubs.slice(0,maxSubs);

  const filledCount=luSubs.filter(Boolean).length;
  const countEl=$('lu-benchcount');if(countEl)countEl.textContent=filledCount;
  const maxEl=$('lu-benchmax');if(maxEl)maxEl.textContent=maxSubs;

  if(luBenchActive>=maxSubs||luBenchActive<0){
    luBenchActive=luSubs.findIndex(s=>!s);
    if(luBenchActive<0)luBenchActive=0;
  }

  let html='';
  for(let i=0;i<maxSubs;i++){
    const p=luSubs[i];
    const cls=`lu-item ${p?'filled':'empty-slot'} ${i===luBenchActive?'active-slot':''}`;
    const av=p?playerLineupAv(p):'<div class="lu-av">+</div>';
    const name=p?esc(p.name):`Game Changer ${i+1}`;
    const meta=p?`${esc(posCode(p.position)||'—')} <span class="lu-slotside">· Bench Slot ${i+1}</span>`:`Tap to assign <span class="lu-slotside">· Bench Slot ${i+1}</span>`;
    const actions=p?`<div class="lu-slot-actions" onclick="event.stopPropagation();">
        <div class="lu-tag lu-remove-tag" onclick="removeBenchSlot(${i})">Remove</div>
      </div>`:`<div class="lu-tag">Assign</div>`;

    html+=`<div class="${cls}" onclick="selectBenchSlot(${i})">
      ${av}
      <div class="lu-info">
        <div class="lu-name">${name}</div>
        <div class="lu-meta">${meta}</div>
      </div>
      ${actions}
    </div>`;
  }
  benchEl.innerHTML=html;

  renderBenchPicker();
}

function selectBenchSlot(i){
  luBenchActive=i;
  renderBench();
}

function removeBenchSlot(i){
  luSubs[i]=null;
  luBenchActive=i;
  renderBench();
  renderPicker();
  renderOutOfSquad();
}

function assignBenchSlot(i,pid){
  const p=players.find(pl=>pl.id===pid);if(!p)return;
  const maxSubs=getMaxSubs();

  let targetIdx = i;
  if(targetIdx < 0 || targetIdx >= maxSubs || luSubs[targetIdx]){
    const emptyIdx = luSubs.findIndex(s=>!s);
    if(emptyIdx >= 0) targetIdx = emptyIdx;
    else if(targetIdx < 0 || targetIdx >= maxSubs) targetIdx = 0;
  }

  luSlots=luSlots.map(s=>(s&&s.id===pid)?null:s);
  luSubs=luSubs.map((s,idx)=>(s&&s.id===pid&&idx!==targetIdx)?null:s);

  luSubs[targetIdx]={
    id:p.id,
    name:p.name,
    position:p.position,
    jersey:p.jersey,
    photo:p.photo||null
  };

  let next=-1;
  for(let k=1;k<=maxSubs;k++){
    const idx=(targetIdx+k)%maxSubs;
    if(!luSubs[idx]){
      next=idx;
      break;
    }
  }
  luBenchActive=next;
  renderPitch();
  renderPicker();
  renderBench();
  renderOutOfSquad();
}

function renderBenchPicker(){
  const el=$('lu-bench-picker');
  if(!el)return;
  const maxSubs=getMaxSubs();

  if(maxSubs <= 0){
    el.innerHTML='<div style="padding:16px;text-align:center;background:rgba(26,92,26,0.03);border:1.5px dashed var(--bd);border-radius:12px;"><p class="lu-hint" style="margin:0;">No Game Changer slots allocated for this squad size.</p></div>';
    return;
  }

  const filledCount=luSubs.filter(Boolean).length;
  const hasEmptySlot=luSubs.some(s=>!s);

  // When all Game Changers slots are occupied, no players are left in the right panel
  if(!hasEmptySlot || filledCount >= maxSubs){
    el.innerHTML=`
      <div style="padding:18px 14px;text-align:center;background:rgba(26,92,26,0.03);border:1.5px dashed var(--bd);border-radius:12px;">
        <div style="font-size:22px;margin-bottom:6px;">⚡</div>
        <div style="font-weight:700;color:var(--tx);font-size:13px;">All Game Changer Slots Occupied (${filledCount}/${maxSubs})</div>
        <p class="lu-hint" style="margin:6px 0 0;font-size:12px;">All ${maxSubs} slots are filled. All other players are categorized in the Out of Squad section below.</p>
      </div>
    `;
    return;
  }

  const used=benchUsedIdsSet();
  const avail=players.filter(p=>!used.has(p.id));

  if(!avail.length){
    el.innerHTML='<p class="lu-hint">All available team players are already added to the squad.</p>';
    return;
  }

  const roleOrder=['GK','DEF','MID','FWD'];
  const rolesPresent=roleOrder.filter(r=>avail.some(p=>classifyPos(p.position)===r));
  const roleChips=['ALL',...rolesPresent].map(r=>
    `<button type="button" class="fchip ${luBenchFilterRole===r?'active':''}" onclick="setBenchFilterRole('${r}')">${r==='ALL'?'All':roleLabel(r)+'s'}</button>`
  ).join('');

  const scoped=luBenchFilterRole==='ALL'?avail:avail.filter(p=>classifyPos(p.position)===luBenchFilterRole);
  const exactPositions=[...new Set(scoped.map(p=>posCode(p.position)).filter(Boolean))].sort();
  const exactChips=exactPositions.length>1?`
    <div id="lu-bench-exact-row" style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 4px;">
      ${exactPositions.map(p=>`<button type="button" class="fchip ${luBenchFilterExact===p?'active':''}" style="padding:5px 11px;font-size:11px;" onclick="setBenchFilterExact('${esc(p).replace(/'/g,"\\'")}')">${esc(p)}</button>`).join('')}
    </div>`:'' ;

  const finalList=luBenchFilterExact?scoped.filter(p=>posCode(p.position)===luBenchFilterExact):scoped;

  const targetSlotIdx = (luBenchActive>=0 && luBenchActive<maxSubs && !luSubs[luBenchActive]) ? luBenchActive : luSubs.findIndex(s=>!s);
  const targetLabel = targetSlotIdx >= 0 ? `Game Changer Slot ${targetSlotIdx+1}` : 'Game Changer Slot';

  const row=list=>list.map(p=>`
    <div class="lu-item" onclick="assignBenchSlot(${targetSlotIdx >= 0 ? targetSlotIdx : 0},'${p.id}')">
      ${playerLineupAv(p)}
      <div class="lu-info">
        <div class="lu-name">${esc(p.name)}</div>
        <div class="lu-meta">${esc(posCode(p.position)||'—')}</div>
      </div>
      <div class="lu-tag">Pick</div>
    </div>
  `).join('');

  el.innerHTML=`
    <div class="lu-picker-head">Assigning to: <strong style="color:var(--tx);">${targetLabel}</strong></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 2px;">${roleChips}</div>
    ${exactChips}
    ${finalList.length?`<div class="lu-list" style="margin-top:8px;">${row(finalList)}</div>`:'<p class="lu-hint">No available players in this filter.</p>'}
  `;
}

function renderOutOfSquad(){
  const el=$('lu-out-of-squad');
  const countEl=$('lu-outofsquatcount');
  if(!el) return;

  const used=benchUsedIdsSet();
  const outPlayers=(players||[]).filter(p=>!used.has(p.id));

  if(countEl) countEl.textContent=outPlayers.length;

  if(!outPlayers.length){
    el.innerHTML='<div style="padding:14px;text-align:center;background:rgba(26,92,26,0.02);border:1px dashed var(--bd);border-radius:10px;"><p class="lu-hint" style="margin:0;">All players from the team are included in the match squad.</p></div>';
    return;
  }

  let html='<div class="squad-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:8px;">';
  outPlayers.forEach(p=>{
    html+=`<div class="lu-item" style="cursor:default;padding:8px 10px;">
      <div class="lu-av">${p.photo?`<img src="${esc(p.photo)}" alt="">`:playerLineupAv(p)}</div>
      <div class="lu-info" style="min-width:0;">
        <div class="lu-name" style="font-size:13px;">${esc(p.name)}${p.jersey!=null&&p.jersey!==''?` <span style="color:var(--mt);font-weight:400;font-size:11px;">#${esc(p.jersey)}</span>`:''}</div>
        <div class="lu-meta" style="font-size:11px;color:var(--mt);display:flex;align-items:center;gap:6px;margin-top:2px;">
          <span class="pos-badge" style="font-size:10px;padding:1px 6px;">${esc(posCode(p.position)||'—')}</span>
          <span style="font-size:10px;color:var(--mt);">Out of Squad</span>
        </div>
      </div>
    </div>`;
  });
  html+='</div>';
  el.innerHTML=html;
}

function renderStaffPicker(){
  const el=$('lu-staff');if(!el)return;
  const list=curTeam&&curTeam.staff||[];
  $('lu-staffcount').textContent=luStaff.length;
  if(!list.length){el.innerHTML='<p class="lu-hint">No management staff added yet. Add coaches, manager, physio etc. from the Management tab.</p>';return;}
  el.innerHTML=list.map(s=>{
    const sel=luStaff.some(x=>x.id===s.id);
    return `<div class="lu-item ${sel?'sub':''}" onclick="toggleStaffPick('${s.id}')">
      <div class="lu-av">🧑‍💼</div>
      <div class="lu-info"><div class="lu-name">${esc(s.name)}</div><div class="lu-meta">${esc(s.role||'—')}</div></div>
      <div class="lu-tag">${sel?'Added':'Add'}</div>
    </div>`;
  }).join('');
}

function toggleStaffPick(id){
  const idx=luStaff.findIndex(s=>s.id===id);
  if(idx>=0){luStaff.splice(idx,1);}
  else{
    const s=(curTeam.staff||[]).find(st=>st.id===id);if(!s)return;
    luStaff.push({id:s.id,name:s.name,role:s.role});
  }
  renderStaffPicker();
}

function renderLineupModal(){renderFormationRow();renderPitch();renderMiniPitch(false);renderPicker();renderBench();renderStaffPicker();renderOutOfSquad();setupStudioScrollTrap();}

function buildSquadObject(){
  const flat=flattenFormation(luFormation);
  const opponent = $('lu-opponent') ? $('lu-opponent').value.trim() : '';
  const tournament = $('lu-tournament') ? $('lu-tournament').value.trim() : '';
  const venue = $('lu-venue') ? $('lu-venue').value.trim() : '';
  const name = (opponent && tournament) ? `${opponent} (${tournament})` : (opponent || tournament || ($('lu-name') ? $('lu-name').value.trim() : ''));
  const squadSize=$('lu-squadsize')&&$('lu-squadsize').value ? parseInt($('lu-squadsize').value) : null;
  const slots=flat.map((s,i)=>{
    const p=luSlots[i];
    return {
      role:s.role || '',
      label:s.label || '',
      player:p?{
        id:p.id || '',
        name:p.name || '',
        position:p.position || '',
        jersey:p.jersey||'',
        matchPosition:p.matchPosition||posCode(p.position)||''
      }:null
    };
  });
  const validSubs=(luSubs||[]).filter(Boolean);
  const subs=validSubs.map(s=>({
    id:s.id || '',
    name:s.name || '',
    position:s.position || '',
    jersey:s.jersey||''
  }));
  const staff=(luStaff||[]).map(s=>({id:s.id || '',name:s.name || '',role:s.role||'Other'}));
  return {
    formation:luFormation || '4-4-2',
    name: name || '',
    opponent: opponent || '',
    tournament: tournament || '',
    venue: venue || '',
    squadSize: squadSize != null ? squadSize : null,
    slots,
    subs,
    staff,
    updatedAt:new Date().toISOString()
  };
}

async function saveLineup(){
  const squad=buildSquadObject();
  const validSubs=(squad.subs||[]);
  if(!squad.slots.some(s=>s&&s.player)&&!validSubs.length){alert('Assign at least one player to the squad.');return;}
  if(squad.squadSize!=null&&squad.squadSize<luAside){alert(`Squad size (${squad.squadSize}) can't be smaller than the game size — ${luAside}-a-side needs at least ${luAside} players.`);return;}
  try{
    if (db && curTeam && curTeam.id) {
      await updateDoc(doc(db,'teams',curTeam.id),{squad});
    }
    if (curTeam) curTeam.squad=squad;
    try {
      localStorage.setItem('formation_sync_payload', JSON.stringify(buildFormationSyncPayload()));
    } catch(e) {}
    sendFormationSync();
    alert('✅ Match squad saved!');
  }catch(e){
    console.error('Save squad error:', e);
    alert('❌ Could not save squad: '+(e.message||e));
  }
}

async function clearLineup(){
  if(!confirm('Clear the saved match squad?'))return;
  try{
    await updateDoc(doc(db,'teams',curTeam.id),{squad:null});
    curTeam.squad=null;
    try {
      localStorage.removeItem('formation_sync_payload');
    } catch(e){}
    openLineup();
    sendFormationSync();
  }catch(e){alert('❌ Could not clear squad.');}
}

const STAFF_ROLES=['Manager','Coach','Assistant Coach','2nd Coach','Physio','Kit Man','Other'];

function openStaffModal(id){
  editStaffId=id||null;
  const st=id?(curTeam.staff||[]).find(s=>s.id===id):null;
  $('staff-mtit').textContent=id?'✏️ EDIT TEAM MEMBER':'➕ ADD TEAM MEMBER';
  $('st-name').value=st?st.name:'';
  const knownRole=st&&STAFF_ROLES.includes(st.role)?st.role:(st?'Other':'Manager');
  $('st-role').value=knownRole;
  $('st-role-other').style.display=knownRole==='Other'?'block':'none';
  $('st-role-custom').value=(st&&knownRole==='Other')?st.role:'';
  $('st-phone').value=st?(st.phone||'').replace('+91',''):'';
  $('st-notes').value=st?(st.notes||''):'';
  openM('m-staff');
}

async function saveStaffMember(){
  const name=$('st-name').value.trim();
  if(!name){alert('Please enter a name.');return;}
  let role=$('st-role').value;
  if(role==='Other'){role=$('st-role-custom').value.trim()||'Other';}
  const phoneDigits=$('st-phone').value.trim();
  const entry={
    id:editStaffId||('st_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)),
    name,role,phone:phoneDigits?('+91'+phoneDigits):'',notes:$('st-notes').value.trim()
  };
  const list=[...(curTeam.staff||[])];
  if(editStaffId){
    const idx=list.findIndex(s=>s.id===editStaffId);
    if(idx>=0)list[idx]=entry;else list.push(entry);
  }else{list.push(entry);}
  try{
    await updateDoc(doc(db,'teams',curTeam.id),{staff:list});
    curTeam.staff=list;
    closeM('m-staff');
    renderStaffList();
  }catch(e){alert('❌ Could not save: '+(e.message||e));}
}

async function deleteStaffMember(id){
  if(!confirm('Remove this team member?'))return;
  const list=(curTeam.staff||[]).filter(s=>s.id!==id);
  try{
    await updateDoc(doc(db,'teams',curTeam.id),{staff:list});
    curTeam.staff=list;
    renderStaffList();
  }catch(e){alert('❌ Could not remove: '+(e.message||e));}
}

function renderStaffList(){
  const list=[...(curTeam&&curTeam.staff||[])].sort((a,b)=>{
    const ra=STAFF_ROLES.indexOf(a.role),rb=STAFF_ROLES.indexOf(b.role);
    const oa=ra<0?STAFF_ROLES.length:ra,ob=rb<0?STAFF_ROLES.length:rb;
    return oa-ob||(a.name||'').localeCompare(b.name||'');
  });
  const html=!list.length?'<div class="empty"><div class="ei">🧑‍💼</div><p>No management staff added yet. Tap "Add Member" to add a coach, manager, physio, or other staff.</p></div>':list.map(s=>`
    <div class="pcard">
      <div class="pav">🧑‍💼</div>
      <div class="pi">
        <div class="pn">${esc(s.name)}<span class="jb">${esc(s.role)}</span></div>
        <div class="pm">
          ${s.phone?`<span class="mi">📞 ${esc(s.phone)}</span>`:''}
        </div>
        ${s.notes?`<div class="pm"><span class="mi" style="color:var(--mt);">📝 ${esc(s.notes.substring(0,100))}${s.notes.length>100?'…':''}</span></div>`:''}
      </div>
      <div class="cacts">
        <button class="ib" onclick="openStaffModal('${s.id}')">✏️</button>
        <button class="ib del" onclick="deleteStaffMember('${s.id}')">✕</button>
      </div>
    </div>`).join('');
  ['stafflist','stafflist-db'].forEach(id=>{const el=$(id);if(el)el.innerHTML=html;});
}

function exportCSV(){
  if(!players.length && !(curTeam.staff && curTeam.staff.length)){alert('No data to export.');return;}
  
  // Players Data
  const pRows = players.map(p=>['Player',p.name,p.dob||'',p.age||'',p.father||'',(p.address||'').replace(/\n/g,' '),p.phone||'',posCode(p.position)||'',p.jersey||'',p.jersey2||'',p.playernum||'',p.foot||'',p.notes||'',p.registeredAt||''].map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(','));
  
  // Staff Data
  const sRows = (curTeam.staff || []).map(s=>['Staff',s.name,'','','','',s.phone||'',s.role||'','','','','',s.notes||'',s.registeredAt||''].map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(','));
  
  const csv=['Type,Name,DOB,Age,Father,Address,Phone,Position/Role,Jersey 1st,Jersey 2nd,Squad#,Pref Foot,Notes,Registered'].concat(pRows).concat(sRows).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download=`${(curTeam?.name||'team').replace(/\s+/g,'_')}_data.csv`;
  a.click();
}

async function importCSV(input){
  const file=input.files[0];if(!file)return;
  const text=await file.text();const lines=text.trim().split('\n');if(lines.length<2){alert('No data rows.');return;}
  const h=lines[0].split(',').map(x=>x.replace(/"/g,'').trim().toLowerCase());
  const ix=k=>h.findIndex(x=>x.includes(k));
  
  const ti=ix('type'), ni=ix('name'), di=ix('dob'), ai=ix('age'), fi=ix('father'), adri=ix('address'), phi=ix('phone');
  const posi=ix('position')!==-1 ? ix('position') : ix('role');
  const ji=h.findIndex(x=>x.includes('jersey')&&x.includes('1')), j2i=h.findIndex(x=>x.includes('jersey')&&x.includes('2')), sqi=h.findIndex(x=>x.includes('squad'));
  const footi=ix('foot'), notesi=ix('notes');

  if(ni===-1){alert('CSV must have a Name column.');return;}
  const cell=(c,i)=>i>=0?(c[i]||'').replace(/^"|"$/g,'').trim():'';
  
  let ok=0, fail=0, staffModified=false;
  let staffList = [...(curTeam.staff || [])];

  for(let i=1;i<lines.length;i++){
    const c=lines[i].match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map(x=>x.replace(/,$/,''))||lines[i].split(',');
    const name=cell(c,ni);if(!name)continue;
    const type = ti>=0 ? cell(c,ti).toLowerCase() : 'player';
    const phone = cell(c,phi);

    try{
      if (type === 'staff') {
        const role = cell(c,posi) || 'Staff';
        const notes = notesi>=0 ? cell(c,notesi) : '';
        const existingIdx = staffList.findIndex(s => s.name.toLowerCase() === name.toLowerCase() && s.phone === phone);
        
        if (existingIdx >= 0) {
          staffList[existingIdx] = { ...staffList[existingIdx], role, phone, notes }; // Update existing
        } else {
          staffList.push({
            id:'st_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
            name, role, phone, notes, registeredAt:new Date().toISOString()
          }); // Add new
        }
        staffModified = true;
        ok++;
      } else {
        const updateData = {
          teamId:curTeam.id, name, dob:cell(c,di), age:cell(c,ai),
          father:cell(c,fi), address:cell(c,adri), phone,
          position:cell(c,posi), jersey:cell(c,ji), jersey2:cell(c,j2i),
          playernum:cell(c,sqi), foot:cell(c,footi), notes:cell(c,notesi)
        };
        
        const existing = players.find(p => p.name.toLowerCase() === name.toLowerCase() && p.phone === phone);
        if (existing) {
          await updateDoc(doc(db,'players',existing.id), updateData); // Update existing
        } else {
          updateData.registeredAt = new Date().toISOString();
          await addDoc(collection(db,'players'), updateData); // Add new
        }
        ok++;
      }
    } catch(e){fail++;}
  }
  
  if (staffModified) {
    try {
      await updateDoc(doc(db,'teams',curTeam.id), {staff: staffList});
      curTeam.staff = staffList;
      renderStaffList();
    } catch(e) { console.error('Failed to update staff array', e); }
  }
  
  input.value='';alert(`✅ Imported/Updated ${ok} entry(s).${fail?' '+fail+' failed.':''}`);
}

function loadSetup(){
  if(!curTeam)return;
  $('cfg-name').value=curTeam.name||'';$('cfg-motto').value=curTeam.motto||'';
  $('cfg-season').value=curTeam.season||'';$('cfg-emoji').value=curTeam.emoji||'⚽';
  if(curTeam.logo){$('logo-pi').src=curTeam.logo;$('logo-pr').style.display='flex';$('logo-ph').style.display='none';}
  else{$('logo-pr').style.display='none';$('logo-ph').style.display='block';}
  renderPosList();
}

async function saveTeamPass(){
  const p1=$('tp1').value,p2=$('tp2').value,err=$('tperr');
  if(!p1||p1.length<4){err.textContent='Min 4 characters.';err.style.display='block';return;}
  if(p1!==p2){err.textContent='Passwords do not match.';err.style.display='block';return;}
  try{await updateDoc(doc(db,'teams',curTeam.id),{password:p1});curTeam.password=p1;err.style.display='none';$('tp1').value='';$('tp2').value='';alert('✅ Team password updated!');}
  catch(e){err.textContent='❌ Failed.';err.style.display='block';}
}

async function savePIN(){
  const p1=String($('pin1').value).trim(),p2=String($('pin2').value).trim(),err=$('pinerr');
  if(p1.length!==4||isNaN(p1)){err.textContent='PIN must be exactly 4 digits.';err.style.display='block';return;}
  if(p1!==p2){err.textContent='PINs do not match.';err.style.display='block';return;}
  try{
    await saveAdminCredsFS({editPin:p1});
    err.style.display='none';$('pin1').value='';$('pin2').value='';
    alert('✅ PIN updated!');
  }catch(e){err.textContent='❌ '+ (e.message || 'Failed to save');err.style.display='block';}
}

async function saveBranding(){
  if(!curTeam)return;
  const logoSrc = $('logo-pi')?.src;
  const logo = (logoSrc && logoSrc.length > 30) ? logoSrc : (curTeam.logo || null);
  const data={
    name: ($('cfg-name')?.value || '').trim() || curTeam.name || '',
    motto: ($('cfg-motto')?.value || '').trim() || '',
    emoji: $('cfg-emoji')?.value || '⚽',
    season: ($('cfg-season')?.value || '').trim() || '',
    logo: logo
  };
  try{
    await updateDoc(doc(db,'teams',curTeam.id),data);
    Object.assign(curTeam,data);
    if($('tt-name')) $('tt-name').textContent=(data.name||'TEAM').toUpperCase();
    if($('sh-name')) $('sh-name').textContent=(data.name||'TEAM').toUpperCase();
    if($('sh-motto')) $('sh-motto').textContent=data.motto||'Player Registration';
    const sb=$('sh-badge');
    if(sb) sb.innerHTML=data.logo?`<img src="${esc(data.logo)}" alt="">`:(data.emoji||'⚽');
    applyTeamTopbarLogo();
    renderSquad();
    alert('✅ Team branding saved!');
  }catch(e){
    console.error('saveBranding error:', e);
    alert('❌ Could not save team branding: ' + (e.message || e));
  }
}

function handleLogo(input){
  const file=input.files[0];if(!file)return;
  compressImage(file, 256, 0.88, dataUrl => {
    if($('logo-pi')) $('logo-pi').src=dataUrl;
    if($('logo-pr')) $('logo-pr').style.display='flex';
    if($('logo-ph')) $('logo-ph').style.display='none';
    if(curTeam) curTeam.logo=dataUrl;
  });
}

async function removeLogo(e){
  e.stopPropagation();
  if($('logo-pi')) $('logo-pi').src='';
  if($('logo-pr')) $('logo-pr').style.display='none';
  if($('logo-ph')) $('logo-ph').style.display='block';
  if($('logo-inp')) $('logo-inp').value='';
  if(curTeam){await updateDoc(doc(db,'teams',curTeam.id),{logo:null});curTeam.logo=null;applyTeamTopbarLogo();}
}

let posArr=[...DPOS];
function renderPosList(){
  posArr=curTeam?.positions||[...DPOS];pos=posArr;
  $('poslist').innerHTML=posArr.map((p,i)=>`
    <div class="pi-item" draggable="true" ondragstart="pdS(event,${i})" ondragover="pdO(event,${i})" ondrop="pdD(event,${i})" ondragend="pdE()">
      <span class="pi-handle">⠿</span><span class="pi-name">${esc(p)}</span>
      <button class="pi-del" onclick="removePos(${i})">✕</button>
    </div>`).join('');
}

async function savePosDB(){if(!curTeam)return;try{await updateDoc(doc(db,'teams',curTeam.id),{positions:posArr});curTeam.positions=[...posArr];pos=[...posArr];}catch(e){}renderPosList();}
async function addPos(){const inp=$('newpos'),v=inp.value.trim();if(!v)return;if(posArr.some(p=>p.toLowerCase()===v.toLowerCase())){alert('Already exists.');return;}posArr.push(v);inp.value='';await savePosDB();}
async function removePos(i){if(!confirm(`Remove "${posArr[i]}"?`))return;posArr.splice(i,1);await savePosDB();}
let ds=null;
function pdS(e,i){ds=i;e.target.classList.add('dragging');}
function pdO(e,i){e.preventDefault();document.querySelectorAll('.pi-item').forEach(el=>el.classList.remove('drag-over'));e.currentTarget.classList.add('drag-over');}
function pdD(e,i){e.preventDefault();if(ds===null||ds===i)return;const m=posArr.splice(ds,1)[0];posArr.splice(i,0,m);savePosDB();}
function pdE(){ds=null;document.querySelectorAll('.pi-item').forEach(el=>el.classList.remove('dragging','drag-over'));}

function handleCtLogo(input){
  var file=input.files[0];if(!file)return;
  compressImage(file, 256, 0.88, function(dataUrl){
    ctLogoData=dataUrl;
    var prev=document.getElementById('ct-logo-preview');
    if(prev) prev.innerHTML='<img src="'+ctLogoData+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
  });
}

function clearCtLogo(){
  ctLogoData=null;
  $('ct-logo-inp').value='';
  $('ct-logo-preview').innerHTML=$('ct-emoji').value||'⚽';
}

async function createTeam(){
  const name=$('ct-name').value.trim(),pass=$('ct-pass').value,err=$('ct-err');
  if(!name){err.textContent='Team name is required.';err.style.display='block';return;}
  if(!pass||pass.length<4){err.textContent='Password must be at least 4 characters.';err.style.display='block';return;}
  const okBtn=document.querySelector('#m-create .mok');
  okBtn.textContent='CREATING…';okBtn.disabled=true;err.style.display='none';
  try{
    await addDoc(collection(db,'teams'),{name,season:$('ct-season').value.trim(),motto:$('ct-motto').value.trim(),emoji:$('ct-emoji').value,password:pass,positions:[...DPOS],logo:ctLogoData||null,createdAt:new Date().toISOString()});
    ctLogoData=null;$('ct-logo-inp').value='';$('ct-logo-preview').innerHTML='⚽';closeM('m-create');['ct-name','ct-season','ct-motto','ct-pass'].forEach(id=>$(id).value='');err.style.display='none';
    await loadAdmin();
  }catch(e){
    const msg=e&&e.code==='permission-denied'
      ?'Permission denied — Firestore rules are blocking writes. Open your Firebase console and set rules to allow read/write.'
      :e&&e.message?e.message:'Failed. Check your internet connection and try again.';
    err.textContent='❌ '+msg;err.style.display='block';
    console.error('createTeam error:',e);
  }finally{okBtn.textContent='CREATE';okBtn.disabled=false;}
}

function promptDelTeam(id){
  delId=id;const t=teams.find(x=>x.id===id);
  $('del-desc').textContent=`Delete "${t?.name}"? This removes the team and all ${t?.pc||0} player(s). Cannot be undone.`;
  openM('m-del-team');
}

async function confirmDel(){
  if(!delId)return;closeM('m-del-team');
  try{const ps=await getDocs(query(collection(db,'players'),where('teamId','==',delId)));const b=writeBatch(db);ps.docs.forEach(d=>b.delete(d.ref));b.delete(doc(db,'teams',delId));await b.commit();delId=null;await loadAdmin();}
  catch(e){alert('❌ Could not delete.');}
}

let adminPinBuf='',adminPinAct=null,adminPinTgt=null;

function adminRequestPin(action, id){
  adminPinBuf='';adminPinAct=action;adminPinTgt=id;
  updAdminDots();$('aperrmsg').style.display='none';
  const cfg={
    editteam:['✏️','EDIT TEAM','Enter admin PIN to edit this team.'],
    delteam:['🗑️','DELETE TEAM','Enter admin PIN to delete this team.'],
    saveadminpin:['🔐','SET ADMIN PIN','Enter current admin PIN to set a new one.'],
  }[action]||['🔐','ADMIN PIN','Enter your admin PIN.'];
  $('apico').textContent=cfg[0];$('aptit').textContent=cfg[1];$('apdesc').textContent=cfg[2];
  openM('m-admin-pin');
}
function apk(k){
  if(k==='cancel'){closeM('m-admin-pin');return;}
  if(k==='del'){adminPinBuf=adminPinBuf.slice(0,-1);updAdminDots();return;}
  if(adminPinBuf.length>=4)return;adminPinBuf+=k;updAdminDots();
  if(adminPinBuf.length===4)setTimeout(checkAdminPin,150);
}
function updAdminDots(){for(let i=0;i<4;i++)$('apd'+i).classList.toggle('filled',i<adminPinBuf.length);}
function checkAdminPin(){
  if(adminPinBuf===getAdminPin()){
    closeM('m-admin-pin');$('aperrmsg').style.display='none';
    if(adminPinAct==='delteam')promptDelTeam(adminPinTgt);
    if(adminPinAct==='editteam')openEditTeam(adminPinTgt);
  } else {
    $('aperrmsg').textContent='❌ Incorrect PIN';$('aperrmsg').style.display='block';
    adminPinBuf='';updAdminDots();
  }
}

function openEditTeam(id){
  const t=teams.find(x=>x.id===id);if(!t)return;
  editTeamId=id;
  $('et-name').value=t.name||'';
  $('et-season').value=t.season||'';
  $('et-motto').value=t.motto||'';
  $('et-emoji').value=t.emoji||'⚽';
  $('et-pass').value=t.password||'';
  $('et-err').style.display='none';
  openM('m-edit-team');
}
async function saveEditTeam(){
  const name=$('et-name').value.trim(),pass=$('et-pass').value.trim(),err=$('et-err');
  if(!name){err.textContent='Team name is required.';err.style.display='block';return;}
  if(!pass||pass.length<4){err.textContent='Password must be at least 4 characters.';err.style.display='block';return;}
  const btn=$('et-save-btn');btn.textContent='SAVING…';btn.disabled=true;
  try{
    await updateDoc(doc(db,'teams',editTeamId),{
      name,
      season:$('et-season').value.trim(),
      motto:$('et-motto').value.trim(),
      emoji:$('et-emoji').value,
      password:pass
    });
    closeM('m-edit-team');
    await loadAdmin();
  }catch(e){
    err.textContent='❌ '+(e.message||'Failed. Try again.');err.style.display='block';
  }finally{btn.textContent='SAVE';btn.disabled=false;}
}

function handlePfPhoto(input) {
  const file = input.files[0];
  if(!file) return;
  compressImage(file, 300, 0.85, dataUrl => {
    pfPhotoData = dataUrl;
    const prev = document.getElementById('pf-photo-preview');
    if(prev) {
      prev.src = pfPhotoData;
      prev.style.display = 'block';
    }
    const ph = document.getElementById('pf-photo-ph');
    if(ph) ph.style.display = 'none';
  });
}

async function initPub(tid){
  pubId=tid;ss('s-public');
  try{
    const snap=await getDoc(doc(db,'teams',tid));
    if(!snap.exists){$('pub-tname').textContent='Team Not Found';return;}
    pubTeam={id:snap.id,...snap.data()};
    $('pub-tname').textContent=(pubTeam.name||'TEAM').toUpperCase();
    $('pub-motto').textContent=pubTeam.motto||'Player Registration';
    const b=$('pub-badge');b.innerHTML=pubTeam.logo?`<img src="${esc(pubTeam.logo)}" alt="">`:(pubTeam.emoji||'⚽');
    const pp=pubTeam.positions||DPOS;
    $('pf-pos').innerHTML='<option value="">Select position</option>'+pp.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
  }catch(e){console.error('initPub error:',e);$('pub-tname').textContent='Error Loading';$('pub-motto').textContent=e.message||'Unknown error';}
}

function pAge(){
  const d=$('pf-dob').value;if(!d)return;
  const t=new Date(),b=new Date(d);let a=t.getFullYear()-b.getFullYear();
  if(t.getMonth()-b.getMonth()<0||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;
  $('pf-age').value=a;
}

async function submitPub(){
  const name=$('pf-name').value.trim(),ph=$('pf-ph').value.trim(),j=$('pf-j1').value,p=$('pf-pos').value,dob=$('pf-dob').value,father=$('pf-father').value.trim(),addr=$('pf-addr').value.trim();
  if(!name||!dob||!father||!addr||!ph||!p||!j){alert('Please fill all required fields (*).');return;}
  if(ph.length!==10){alert('Phone must be 10 digits.');return;}
  const btn=document.querySelector('.sub-btn');btn.textContent='⏳ SAVING…';btn.disabled=true;
  try{
    const phoneFormatted = '+91'+ph;
    const dataToSave = {
      teamId:pubId, name, dob, age:$('pf-age').value,
      father, address:addr, phone:phoneFormatted,
      position:p, jersey:j, jersey2:$('pf-j2').value,
      playernum:$('pf-sq').value, foot:$('pf-foot').value,
      notes:$('pf-notes').value.trim(), photo: pfPhotoData,
      registeredAt:new Date().toISOString()
    };
    
    // Duplication Check (by name & phone)
    const existingSnap = await db.collection('players').where('teamId','==',pubId).where('name','==',name).where('phone','==',phoneFormatted).get();
    if (!existingSnap.empty) {
      await updateDoc(doc(db,'players',existingSnap.docs[0].id), dataToSave);
    } else {
      await addDoc(collection(db,'players'), dataToSave);
    }
    $('pub-form').style.display='none';$('pub-success').style.display='block';
  }catch(e){alert('❌ Registration failed. Check your connection.');}
  finally{btn.textContent='⚡ SUBMIT REGISTRATION';btn.disabled=false;}
}

function resetPub(){
  $('pub-form').style.display='block';$('pub-success').style.display='none';
  ['pf-name','pf-dob','pf-age','pf-father','pf-addr','pf-ph','pf-j1','pf-j2','pf-sq','pf-notes'].forEach(id=>$(id).value='');$('pf-pos').value='';$('pf-foot').value='';
  
  pfPhotoData = null;
  const photoInp = $('pf-photo-inp'); if(photoInp) photoInp.value = '';
  const photoPrev = $('pf-photo-preview'); 
  if(photoPrev) { photoPrev.style.display = 'none'; photoPrev.src = ''; }
  const photoPh = $('pf-photo-ph'); if(photoPh) photoPh.style.display = 'block';
}

async function initPubStaff(tid){
  pubStId=tid;ss('s-public-staff');
  try{
    const snap=await getDoc(doc(db,'teams',tid));
    if(!snap.exists){$('pubst-tname').textContent='Team Not Found';return;}
    pubStTeam={id:snap.id,...snap.data()};
    $('pubst-tname').textContent=(pubStTeam.name||'TEAM').toUpperCase();
    $('pubst-motto').textContent='Management Registration';
    const b=$('pubst-badge');b.innerHTML=pubStTeam.logo?`<img src="${esc(pubStTeam.logo)}" alt="">`:'🧑\u200d💼';
  }catch(e){console.error('initPubStaff error:',e);$('pubst-tname').textContent='Error Loading';$('pubst-motto').textContent=e.message||'Unknown error';}
}

async function submitPubStaff(){
  const name=$('pst-name').value.trim();
  if(!name){alert('Please enter your name.');return;}
  let role=$('pst-role').value;
  if(role==='Other'){role=$('pst-role-custom').value.trim()||'Other';}
  const phoneDigits=$('pst-phone').value.trim();
  const phoneFormatted = phoneDigits ? '+91'+phoneDigits : '';
  const btn=document.querySelector('#pubst-form .sub-btn');btn.textContent='⏳ SAVING…';btn.disabled=true;
  try{
    // Retrieve latest team doc to check for duplicates
    const teamSnap = await getDoc(doc(db,'teams',pubStId));
    let staffList = (teamSnap.data() && teamSnap.data().staff) ? teamSnap.data().staff : [];
    const existingIdx = staffList.findIndex(s => s.name.toLowerCase() === name.toLowerCase() && s.phone === phoneFormatted);
    
    if (existingIdx >= 0) {
      // Update existing
      staffList[existingIdx] = { ...staffList[existingIdx], role, phone: phoneFormatted };
    } else {
      // Add new
      staffList.push({
        id:'st_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
        name,role,phone:phoneFormatted,notes:'',registeredAt:new Date().toISOString()
      });
    }
    
    await updateDoc(doc(db,'teams',pubStId),{staff: staffList});
    $('pubst-form').style.display='none';$('pubst-success').style.display='block';
  }catch(e){alert('❌ Registration failed. Check your connection.');}
  finally{btn.textContent='⚡ SUBMIT REGISTRATION';btn.disabled=false;}
}

function resetPubStaff(){
  $('pubst-form').style.display='block';$('pubst-success').style.display='none';
  $('pst-name').value='';$('pst-role').value='Manager';$('pst-role-other').style.display='none';$('pst-role-custom').value='';$('pst-phone').value='';
}

function initPublicView(tid){
  pvId=tid;ss('s-public-view');
  if(pvUnsub){pvUnsub();pvUnsub=null;}
  getDoc(doc(db,'teams',tid)).then(snap=>{
    if(!snap.exists){$('pv-tname').textContent='Team Not Found';return;}
    pvTeam={id:snap.id,...snap.data()};
    $('pv-tname').textContent=(pvTeam.name||'TEAM').toUpperCase();
    $('pv-motto').textContent=pvTeam.motto||'Team Overview';
    $('pv-badge').innerHTML=pvTeam.logo?`<img src="${esc(pvTeam.logo)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`:(pvTeam.emoji||'⚽');
    renderPubLineup();
    sendPubFormationSync();
    initPubChat();
  }).catch(e=>{console.error('initPublicView error:',e);$('pv-tname').textContent='Error Loading';$('pv-motto').textContent=e.message||'Unknown error';});
  pvUnsub=onSnapshot(query(collection(db,'players'),where('teamId','==',tid)),snap=>{
    pvPlayers=snap.docs.map(d=>({id:d.id,...d.data()}));
    renderPubSquad();
  },e=>console.error('pv players sub error:',e));
  onSnapshot(doc(db,'teams',tid),snap=>{
    if(!snap.exists)return;
    pvTeam={id:snap.id,...snap.data()};
    renderPubLineup();
    sendPubFormationSync();
  },e=>console.error('pv team sub error:',e));
  initPubChat();
}

function showPubTab(n){
  ['squad','lineup','sessions'].forEach(x=>{
    $('pv-page-'+x)&&$('pv-page-'+x).classList.toggle('active',x===n);
    $('pv-tab-'+x)&&$('pv-tab-'+x).classList.toggle('active',x===n);
  });
  $('pv-page-formation')&&$('pv-page-formation').classList.remove('active');
  $('pv-tmain')&&$('pv-tmain').classList.remove('tmain-wide');
  if(n==='lineup')initPubChat();
  if(n==='sessions'){subscribePubSessions();renderPubSessions();}
  if(n==='chat'){showPubTab('lineup');initPubChat();}
}
function openPubFormationVisualizer(inNewTab = false){
  const payload = typeof buildPubFormationSyncPayload === 'function' ? buildPubFormationSyncPayload() : {};
  try {
    localStorage.setItem('formation_sync_payload', JSON.stringify(payload));
  } catch(e){}

  if(inNewTab){
    window.open('formation-builder.html', '_blank');
  } else {
    ['squad','lineup','sessions'].forEach(x=>{
      $('pv-page-'+x)&&$('pv-page-'+x).classList.remove('active');
    });
    $('pv-page-formation').classList.add('active');
    $('pv-tmain').classList.add('tmain-wide');
    initPubChat();
    sendPubFormationSync();
    setTimeout(sendPubFormationSync, 80);
    setTimeout(sendPubFormationSync, 300);
  }
}
function backToPubPlayingList(){
  showPubTab('lineup');
}

function renderPubSquad(){
  const el=$('pv-squad-content');if(!el)return;
  if(!pvPlayers.length){
    el.innerHTML=`<div class="squad-empty"><div class="ei">🏟️</div><p style="font-weight:700;font-size:16px;color:var(--tx);margin-bottom:6px;">No players registered yet.</p></div>`;
    return;
  }
  const posList=(pvTeam&&pvTeam.positions&&pvTeam.positions.length)?pvTeam.positions:[...DPOS];
  const grouped={};
  posList.forEach(p=>grouped[p]=[]);
  grouped['Other']=[];
  pvPlayers.forEach(p=>{
    const code=posCode(p.position);
    const key=posList.includes(code)?code:'Other';
    grouped[key].push(p);
  });

  const totalPlayers = pvPlayers.length;
  const positions = new Set(pvPlayers.map(p=>posCode(p.position)).filter(Boolean));
  const ages = pvPlayers.filter(p=>p.age).map(p=>parseInt(p.age));
  const avgAge = ages.length ? Math.round(ages.reduce((a,b)=>a+b)/ages.length) : null;

  let html=`
    <div class="squad-top-bar" style="margin-bottom:20px;">
      <div class="squad-stat-group" style="width:100%;">
        <div class="sc" style="flex:1;"><div class="num">${totalPlayers}</div><div class="lbl">Players</div></div>
        <div class="sc" style="flex:1;"><div class="num">${positions.size}</div><div class="lbl">Positions</div></div>
        ${avgAge !== null ? `<div class="sc" style="flex:1;"><div class="num">${avgAge}</div><div class="lbl">Avg Age</div></div>` : ''}
      </div>
    </div>
  `;

  posList.filter(p=>grouped[p]&&grouped[p].length).forEach(posName=>{
    html+=`
      <div class="squad-section">
        <div class="squad-section-title">
          <span class="pos-badge">${esc(posName)}</span>
          <span style="color:var(--mt);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;">${grouped[posName].length} player${grouped[posName].length!==1?'s':''}</span>
        </div>
        <div class="squad-grid">
          ${grouped[posName].map(p=>`
            <div class="spc">
              <div class="spc-av">${p.photo?`<img src="${esc(p.photo)}" alt="">`:'👤'}</div>
              <div class="spc-info">
                <div class="spc-name">${esc(p.name)}</div>
                <div class="spc-meta">
                  ${p.jersey?`<span class="spc-j">#${esc(p.jersey)}</span>`:''}
                  ${p.age?`<span>Age ${p.age}</span>`:''}
                  ${p.foot?`<span>${esc(p.foot)} Foot</span>`:''}
                  ${p.fit?`<span>Fit: ${p.fit}%</span>`:''}
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    `;
  });

  if(grouped['Other']&&grouped['Other'].length){
    html+=`
      <div class="squad-section">
        <div class="squad-section-title">
          <span class="pos-badge">Other</span>
          <span style="color:var(--mt);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;">${grouped['Other'].length} player(s)</span>
        </div>
        <div class="squad-grid">
          ${grouped['Other'].map(p=>`
            <div class="spc">
              <div class="spc-av">${p.photo?`<img src="${esc(p.photo)}" alt="">`:'👤'}</div>
              <div class="spc-info">
                <div class="spc-name">${esc(p.name)}</div>
                <div class="spc-meta">
                  ${p.jersey?`<span class="spc-j">#${esc(p.jersey)}</span>`:''}
                  ${p.age?`<span>Age ${p.age}</span>`:''}
                  ${p.foot?`<span>${esc(p.foot)} Foot</span>`:''}
                  ${p.fit?`<span>Fit: ${p.fit}%</span>`:''}
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  el.innerHTML=html;
}

function renderPubLineup(){
  const el=$('pv-lineup-content');if(!el)return;
  const sq=pvTeam&&pvTeam.squad;
  if(!sq||!(sq.slots&&sq.slots.some(s=>s&&s.player)||sq.subs&&sq.subs.length)){
    el.innerHTML=`<div class="squad-empty"><div class="ei">🎯</div><p style="font-weight:700;font-size:16px;color:var(--tx);margin-bottom:6px;">No Tactics Studio lineup published yet.</p></div>`;
    return;
  }

  const startingPlayers = (sq.slots||[]).filter(s=>s&&s.player);
  let startingList='';
  (sq.slots||[]).forEach((s, idx)=>{
    if(!s||!s.player)return;
    const p=s.player;
    const found=pvPlayers.find(x=>x.id===p.id);
    const pPhoto=(found&&found.photo)||p.photo||null;
    const pJersey=(found&&found.jersey!=null&&found.jersey!=='')?found.jersey:(p.jersey||'');
    const mpos = posCode(p.matchPosition||p.position)||'—';
    startingList+=`
      <div class="spc" style="padding:10px 14px;">
        <div class="spc-av" style="width:36px;height:36px;font-size:17px;">
          ${pPhoto?`<img src="${esc(pPhoto)}" alt="">`:'👤'}
        </div>
        <div class="spc-info">
          <div class="spc-name" style="font-size:14px;">${esc(p.name)}</div>
          <div class="spc-meta">
            ${pJersey?`<span class="spc-j">#${esc(pJersey)}</span>`:''}
            <span class="pos-badge" style="padding:1px 6px;font-size:10px;">${esc(mpos)}</span>
          </div>
        </div>
      </div>`;
  });

  let html=`
    <div class="ssec" style="padding:20px;margin-bottom:18px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
        <div>
          <div class="lc-title" style="margin:0;font-size:16px;">${esc(sq.name||'Match Starting XI')}</div>
          <div style="font-size:12px;color:var(--mt);margin-top:2px;">Published Formation &amp; Lineup</div>
        </div>
        <div class="mini-pitch-formation-tag" style="font-size:13px;padding:4px 12px;">${esc(sq.formation||'4-4-2')}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:18px;align-items:start;">
        <div class="mini-pitch-card" style="margin:0;">
          <div class="mini-pitch-header">
            <div class="mini-pitch-title">⚽ TACTICAL FORMATION</div>
            <span id="pv-lu-pitch-formation-badge" class="mini-pitch-formation-tag">${esc(sq.formation||'4-4-2')}</span>
          </div>
          <div class="mini-pitch-board" id="pv-lu-mini-pitch"></div>
        </div>
        <div>
          <div class="squad-section-title" style="margin-top:0;">
            <span class="pos-badge">Starting XI</span>
            <span style="color:var(--mt);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;">${startingPlayers.length} Players</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:480px;overflow-y:auto;padding-right:4px;">
            ${startingList}
          </div>
        </div>
      </div>
    </div>
  `;

  if(sq.subs&&sq.subs.length){
    html+=`
      <div class="ssec" style="padding:20px;margin-bottom:18px;">
        <div class="squad-section-title" style="margin-top:0;">
          <span class="pos-badge" style="background:rgba(243,156,18,0.12);color:#d35400;border-color:rgba(243,156,18,0.3);">⚡ Game Changers</span>
          <span style="color:var(--mt);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;">${sq.subs.length} Substitutes</span>
        </div>
        <div class="squad-grid">
          ${sq.subs.map(p=>{
            const found=pvPlayers.find(x=>x.id===p.id);
            const pPhoto=(found&&found.photo)||p.photo||null;
            const pJersey=(found&&found.jersey!=null&&found.jersey!=='')?found.jersey:(p.jersey||'');
            return `
              <div class="spc">
                <div class="spc-av">${pPhoto?`<img src="${esc(pPhoto)}" alt="">`:'👤'}</div>
                <div class="spc-info">
                  <div class="spc-name">${esc(p.name)}</div>
                  <div class="spc-meta">
                    ${pJersey?`<span class="spc-j">#${esc(pJersey)}</span>`:''}
                    <span class="pos-badge">${esc(posCode(p.position)||'—')}</span>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  const usedPubIds = new Set();
  (sq.slots||[]).forEach(s=>{if(s&&s.player&&s.player.id)usedPubIds.add(s.player.id);});
  (sq.subs||[]).forEach(s=>{if(s&&s.id)usedPubIds.add(s.id);});
  const pubOutOfSquad = (pvPlayers||[]).filter(p=>!usedPubIds.has(p.id));

  if(pubOutOfSquad.length){
    html+=`
      <div class="ssec" style="padding:20px;margin-bottom:18px;">
        <div class="squad-section-title" style="margin-top:0;">
          <span class="pos-badge" style="background:rgba(100,100,100,0.08);color:var(--mt);">📋 Out of Squad</span>
          <span style="color:var(--mt);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;">${pubOutOfSquad.length} Players</span>
        </div>
        <div class="squad-grid">
          ${pubOutOfSquad.map(p=>`
            <div class="spc" style="opacity:0.85;">
              <div class="spc-av">${p.photo?`<img src="${esc(p.photo)}" alt="">`:'👤'}</div>
              <div class="spc-info">
                <div class="spc-name">${esc(p.name)}</div>
                <div class="spc-meta">
                  ${p.jersey!=null&&p.jersey!==''?`<span class="spc-j">#${esc(p.jersey)}</span>`:''}
                  <span class="pos-badge">${esc(posCode(p.position)||'—')}</span>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  if(sq.staff&&sq.staff.length){
    html+=`
      <div class="ssec" style="padding:20px;margin-bottom:18px;">
        <div class="squad-section-title" style="margin-top:0;">
          <span class="pos-badge" style="background:rgba(232,179,76,0.12);color:#b7791f;border-color:rgba(232,179,76,0.3);">🧑‍💼 Match Day Management</span>
          <span style="color:var(--mt);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:400;">${sq.staff.length} Staff</span>
        </div>
        <div class="squad-grid">
          ${sq.staff.map(s=>`
            <div class="spc">
              <div class="spc-av" style="background:rgba(232,179,76,0.12);border-color:#b7791f;">🧑‍💼</div>
              <div class="spc-info">
                <div class="spc-name">${esc(s.name)}</div>
                <div class="spc-meta">
                  <span class="pos-badge" style="background:rgba(232,179,76,0.12);color:#b7791f;">${esc(s.role||'Management')}</span>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  el.innerHTML=html;
  renderMiniPitch(true);
}

function buildPubFormationSyncPayload(){
  pvMergedFormationKeys.forEach(k=>{delete FORMATIONS[k];});
  pvMergedFormationKeys=[];
  (pvTeam&&pvTeam.customFormations||[]).forEach(f=>{
    if(f&&f.key&&f.def){FORMATIONS[f.key]=f.def;pvMergedFormationKeys.push(f.key);}
  });
  const vState = pvTeam && pvTeam.visualizerState;
  const sq = pvTeam && pvTeam.squad;
  let payload = {};
  if(sq && (sq.slots && sq.slots.some(s=>s&&s.player) || sq.subs && sq.subs.length)){
    const management = (sq.staff||[]).map(s=>({id:s.id,name:s.name,role:s.role||'Other'}));
    const when = sq.updatedAt ? new Date(sq.updatedAt).toLocaleDateString() : '';
    const source = `Synced from Tactics Studio${sq.name?' — '+sq.name:''}${when?' (saved '+when+')':''}`;
    const starters = (sq.slots||[]).map(s=>s&&s.player?{id:s.player.id,name:s.player.name,number:s.player.jersey||'-',position:toFBPositionCode(s.player.matchPosition||s.player.position)}:null);
    const subs = (sq.subs||[]).map(s=>({id:s.id,name:s.name,number:s.jersey||'-',position:toFBPositionCode(s.position)}));
    const usedIds = new Set();
    (sq.slots||[]).forEach(s=>{if(s&&s.player&&s.player.id)usedIds.add(s.player.id);});
    (sq.subs||[]).forEach(s=>{if(s&&s.id)usedIds.add(s.id);});
    const outOfSquad = (pvPlayers||[]).filter(p=>!usedIds.has(p.id)).map(p=>({id:p.id,name:p.name,number:p.jersey||'-',position:toFBPositionCode(p.position)}));
    const formationKey = sq.formation || (vState && vState.formationKey) || '4-4-2';
    const formationDef = FORMATIONS[formationKey] || null;
    payload = {isCoach:false, formation:formationKey, formationDef, starters, subs, outOfSquad, management, source};
  } else {
    const rosterPlayers = (pvPlayers||[]).map(p=>({id:p.id,name:p.name,number:p.jersey||'-',position:toFBPositionCode(p.position)}));
    const management = (pvTeam&&pvTeam.staff||[]).map(s=>({id:s.id,name:s.name,role:s.role||'Other'}));
    const formationKey = (sq && sq.formation) || (vState && vState.formationKey) || '4-4-2';
    const formationDef = FORMATIONS[formationKey] || null;
    payload = {isCoach:false, formation:formationKey, formationDef, players:rosterPlayers, management, source:'No saved Tactics Studio lineup yet — loaded full player database instead'};
  }
  if(vState){
    if(vState.customPos) payload.customPos = vState.customPos;
    if(vState.ballPos) payload.ballPos = vState.ballPos;
    if(vState.formationKey) payload.visualizerFormation = vState.formationKey;
    if(typeof vState.showZones === 'boolean') payload.showZones = vState.showZones;
    if(typeof vState.showThirds === 'boolean') payload.showThirds = vState.showThirds;
    if(typeof vState.unitCoverShift === 'boolean') payload.unitCoverShift = vState.unitCoverShift;
    if(typeof vState.showCoverLines === 'boolean') payload.showCoverLines = vState.showCoverLines;
    if(Array.isArray(vState.activeLines)) payload.activeLines = vState.activeLines;
  }
  return payload;
}

function sendPubFormationSync(){
  const frame=$('pv-formation-frame');
  if(!frame||!frame.contentWindow||!pvTeam)return;
  frame.contentWindow.postMessage(Object.assign({type:'ff-sync'},buildPubFormationSyncPayload()),'*');
}

let _vpPhoto=null;
function viewPlayer(id){
  const p=players.find(x=>x.id===id);
  if(!p){alert('Player not found.');return;}
  const t=curTeam||{};
  $('pf-form-inner').innerHTML=`
    <div class="pf-header">
      <div class="pf-club-badge">${t.logo?`<img src="${esc(t.logo)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">`:esc(t.emoji||'⚽')}</div>
      <div class="pf-club-info">
        <div class="pf-club-name">${esc(t.name||'FOOTBALL CLUB')}</div>
        <div class="pf-club-sub">${esc(t.season||'')}${t.motto?' · '+esc(t.motto):''}</div>
      </div>
      <div class="pf-title">PLAYER<br>REGISTRATION</div>
    </div>
    <div class="pf-photo-row">
      <div class="pf-photo-box" onclick="document.getElementById('vp-photo-inp').click()">
        ${p.photo?`<img src="${esc(p.photo)}" alt="">`:''}
        <div class="ph-hint"${p.photo?' style="display:none"':''}>📷<br>Tap to add photo</div>
        <input type="file" id="vp-photo-inp" accept="image/*" onchange="loadPlayerPhoto(this,'${p.id}')">
      </div>
      <div class="pf-fields">
        <div class="pf-row">
          <div class="pf-field"><label>Full Name</label><div class="val">${esc(p.name||'')}</div></div>
          <div class="pf-field"><label>Date of Birth</label><div class="val">${esc(p.dob||'')}</div></div>
        </div>
        <div class="pf-row">
          <div class="pf-field"><label>Age</label><div class="val">${esc(p.age||'')}</div></div>
          <div class="pf-field"><label>Position</label><div class="val">${esc(posCode(p.position)||'')}</div></div>
        </div>
        <div class="pf-row">
          <div class="pf-field"><label>Jersey # (1st)</label><div class="val">${esc(p.jersey||'')}</div></div>
          <div class="pf-field"><label>Jersey # (2nd)</label><div class="val">${esc(p.jersey2||'')}</div></div>
        </div>
        <div class="pf-row">
          <div class="pf-field"><label>Squad #</label><div class="val">${esc(p.playernum||'')}</div></div>
          <div class="pf-field"><label>Preferred Foot</label><div class="val">${esc(p.foot||'')}</div></div>
        </div>
      </div>
    </div>
    <div class="pf-section-title">PERSONAL DETAILS</div>
    <div class="pf-row">
      <div class="pf-field"><label>Father's Name</label><div class="val">${esc(p.father||'')}</div></div>
      <div class="pf-field"><label>Phone</label><div class="val">${esc(p.phone||'')}</div></div>
    </div>
    <div class="pf-row full"><div class="pf-field"><label>Address</label><div class="val">${esc(p.address||'')}</div></div></div>
    ${p.notes?`<div class="pf-section-title">NOTES</div><div class="pf-notes-box">${esc(p.notes)}</div>`:''}
    <div class="pf-sig-section">
      <div class="pf-sig-box"><div class="pf-sig-label">Player Signature</div><div class="pf-sig-area">Sign here</div></div>
      <div class="pf-sig-box"><div class="pf-sig-label">Coach Signature</div><div class="pf-sig-area">Sign here</div></div>
    </div>
    <div class="pf-footer">Generated by Coach Management System · ${esc(t.name||'')} · ${new Date().toLocaleDateString()}</div>`;
  openM('m-player-form');
}

function loadPlayerPhoto(input,playerId){
  const file=input.files[0];if(!file)return;
  compressImage(file, 300, 0.85, async dataUrl=>{
    const box=input.closest('.pf-photo-box');
    if(box){
      let img=box.querySelector('img');
      if(!img){img=document.createElement('img');box.prepend(img);}
      img.src=dataUrl;
      const hint=box.querySelector('.ph-hint');
      if(hint)hint.style.display='none';
    }
    const pl = players.find(x=>x.id===playerId);
    if(pl) pl.photo=dataUrl;
    try{
      await updateDoc(doc(db,'players',playerId),{photo:dataUrl});
      renderPlayers();
      renderSquad();
    }catch(e){console.error('Photo save failed:',e);}
  });
}

function printPlayerForm(){window.print();}

const ANK='hy_name', ASK='hy_sub', ALK='hy_logo';
const DEFAULT_LOGO='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function getBrandName(){return localStorage.getItem(ANK)||'Coach Management System';}
function getBrandSub(){return localStorage.getItem(ASK)||'Team Management System';}
function getBrandLogo(){
  const saved = localStorage.getItem(ALK);
  return (saved && saved.length > 30) ? saved : DEFAULT_LOGO;
}

function applyAdmName(){
  const name=getBrandName(), sub=getBrandSub(), logo=getBrandLogo();
  const li=$('login-logo-img');if(li)li.src=logo;
  const ln=$('login-club-name');if(ln)ln.textContent=name;
  const ls=$('login-club-sub');if(ls)ls.textContent=sub;
  const tli=$('topbar-logo-img');
  if(tli){
    if(logo && logo !== DEFAULT_LOGO){
      tli.src=logo;
      tli.style.display='inline-block';
    } else {
      tli.style.display='none';
    }
  }
  const tln=$('topbar-club-name');if(tln)tln.textContent=name;
  const stli=$('sp-topbar-logo-img');
  if(stli){
    if(logo && logo !== DEFAULT_LOGO){
      stli.src=logo;
      stli.style.display='inline-block';
    } else {
      stli.style.display='none';
    }
  }
  const stln=$('sp-topbar-club-name');if(stln)stln.textContent=name;
}

function applyTeamTopbarLogo(){
  const tl=$('team-topbar-logo');
  if(tl){
    const logo=(curTeam&&curTeam.logo)?curTeam.logo:getBrandLogo();
    if(logo && logo !== DEFAULT_LOGO){
      tl.src=logo;
      tl.style.display='inline-block';
    } else {
      tl.style.display='none';
    }
  }
}

// TEAM DISCUSSION / CHAT
function getChatIdentity(){
  if(myChatIdentity) return myChatIdentity;
  try {
    const saved = localStorage.getItem('cms_chat_identity');
    if(saved) {
      myChatIdentity = JSON.parse(saved);
      return myChatIdentity;
    }
  }catch(e){}
  myChatIdentity = { name: 'Visitor', role: 'member' };
  return myChatIdentity;
}

function updateChatIdentityUI(){
  const id = getChatIdentity();
  document.querySelectorAll('.chat-current-name').forEach(el => {
    el.textContent = id.name || 'Visitor';
  });
  document.querySelectorAll('.chat-current-badge').forEach(badgeEl => {
    badgeEl.textContent = (id.role || 'member').toUpperCase();
    badgeEl.className = 'chat-role-badge ' + (id.role || 'member') + ' chat-current-badge';
  });
}

function openChatIdentityModal(){
  const list = (pvPlayers && pvPlayers.length) ? pvPlayers : (players || []);
  const staff = (pvTeam?.staff || curTeam?.staff || []);
  const sel = $('chat-id-select');
  if(sel){
    let opts = '<option value="">-- Or enter custom name below --</option>';
    if(list.length){
      opts += '<optgroup label="Squad Players">';
      list.forEach(p => {
        const num = p.jersey ? `#${p.jersey} ` : '';
        opts += `<option value="player|${esc(p.name)}">${num}${esc(p.name)} (${esc(posCode(p.position)||'Player')})</option>`;
      });
      opts += '</optgroup>';
    }
    if(staff.length){
      opts += '<optgroup label="Management / Staff">';
      staff.forEach(s => {
        opts += `<option value="staff|${esc(s.name)}">${esc(s.name)} (${esc(s.role||'Staff')})</option>`;
      });
      opts += '</optgroup>';
    }
    sel.innerHTML = opts;
  }
  const id = getChatIdentity();
  const nameInp = $('chat-id-name');
  if(nameInp) nameInp.value = (id.name !== 'Visitor' && id.name !== 'Team Member') ? id.name : '';
  openM('m-chat-identity');
}

function handleChatSelectChange(sel){
  const val = sel.value;
  if(!val) return;
  const parts = val.split('|');
  const name = parts[1];
  const nameInp = $('chat-id-name');
  if(nameInp && name) nameInp.value = name;
}

function saveChatIdentity(){
  const nameInp = $('chat-id-name');
  const sel = $('chat-id-select');
  const name = nameInp ? nameInp.value.trim() : '';
  if(!name){
    alert('Please enter your name.');
    return;
  }
  let role = 'member';
  if(sel && sel.value){
    const parts = sel.value.split('|');
    if(parts[0]) role = parts[0];
  }
  myChatIdentity = { name, role };
  try {
    localStorage.setItem('cms_chat_identity', JSON.stringify(myChatIdentity));
  }catch(e){}
  updateChatIdentityUI();
  closeM('m-chat-identity');
}

function formatChatTime(isoString){
  if(!isoString) return '';
  try {
    const d = new Date(isoString);
    if(isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }catch(e){ return ''; }
}

function renderChatMessages(isCoach){
  const containers = document.querySelectorAll(isCoach ? '.chat-msgs-coach' : '.chat-msgs-pub');
  const pinnedBoxes = document.querySelectorAll(isCoach ? '.chat-pinned-box-coach' : '.chat-pinned-box-pub');
  const pinnedTexts = document.querySelectorAll(isCoach ? '.chat-pinned-text-coach' : '.chat-pinned-text-pub');

  const msgs = isCoach ? coachChatMsgs : pubChatMsgs;
  const myId = isCoach ? { name: (curTeam?.name ? curTeam.name + ' (Coach)' : 'Coach'), role: 'coach' } : getChatIdentity();

  const pinned = msgs.find(m => m.pinned);
  pinnedBoxes.forEach((pBox, idx) => {
    const pText = pinnedTexts[idx];
    if(pinned && pText){
      pText.textContent = `${pinned.senderName} (${formatChatTime(pinned.createdAt)}): ${pinned.text}`;
      pBox.style.display = 'flex';
    } else if(pBox) {
      pBox.style.display = 'none';
    }
  });

  if(!containers.length) return;

  if(!msgs.length){
    const emptyHtml = `
      <div class="chat-empty">
        <div class="cei">💬</div>
        <p>No messages yet.</p>
        <p style="font-size:11.5px;margin-top:4px;color:var(--mt);">Start a conversation, share match updates, or discuss strategies!</p>
      </div>
    `;
    containers.forEach(c => { c.innerHTML = emptyHtml; });
    return;
  }

  let html = '';
  msgs.forEach(m => {
    const isMine = isCoach ? (m.senderRole === 'coach') : (m.senderName === myId.name);
    const isCoachMsg = m.senderRole === 'coach';
    const roleCls = m.senderRole || 'member';
    const roleLabel = m.senderRole ? m.senderRole.toUpperCase() : 'MEMBER';
    const timeStr = formatChatTime(m.createdAt);

    let avatar = '💬';
    if(isCoachMsg) avatar = '👑';
    else if(m.senderRole === 'player') avatar = '⚽';
    else if(m.senderRole === 'staff') avatar = '🧑‍💼';

    const actions = isCoach ? `
      <div class="chat-actions">
        <button class="chat-act-btn" onclick="togglePinChat('${m.id}', ${!!m.pinned})" title="${m.pinned ? 'Unpin message' : 'Pin message to top'}">${m.pinned ? '📌 Unpin' : '📌 Pin'}</button>
        <button class="chat-act-btn" onclick="deleteChatMessage('${m.id}')" title="Delete message">🗑️</button>
      </div>
    ` : '';

    html += `
      <div class="chat-msg ${isMine ? 'mine' : ''} ${isCoachMsg ? 'coach-msg' : ''}">
        <div class="chat-av">${avatar}</div>
        <div class="chat-bubble-wrap">
          <div class="chat-meta">
            <span class="chat-sender">${esc(m.senderName)}</span>
            <span class="chat-role-badge ${roleCls}">${roleLabel}</span>
          </div>
          <div class="chat-bubble">
            ${actions}
            <div class="chat-text">${esc(m.text)}</div>
            <div class="chat-time">${timeStr} ${m.pinned ? '📌' : ''}</div>
          </div>
        </div>
      </div>
    `;
  });

  containers.forEach(c => {
    c.innerHTML = html;
    c.scrollTop = c.scrollHeight;
  });
  const countBadge = document.getElementById(isCoach ? 'chat-count-coach' : 'chat-count-pub');
  if(countBadge) countBadge.textContent = msgs.length;
  sendFrameChatSync();
}

let lineupChatVisible = {
  coach: localStorage.getItem('cms_chat_coach') === 'open',
  pub: localStorage.getItem('cms_chat_pub') === 'open'
};

function toggleLineupChat(mode){
  if(mode === 'coach'){
    lineupChatVisible.coach = !lineupChatVisible.coach;
    try { localStorage.setItem('cms_chat_coach', lineupChatVisible.coach ? 'open' : 'min'); } catch(e) {}
    applyLineupChatVisibility('coach');
  } else {
    lineupChatVisible.pub = !lineupChatVisible.pub;
    try { localStorage.setItem('cms_chat_pub', lineupChatVisible.pub ? 'open' : 'min'); } catch(e) {}
    applyLineupChatVisibility('pub');
  }
}

function applyLineupChatVisibility(mode){
  if(!mode || mode === 'coach'){
    const isVis = lineupChatVisible.coach;
    const win = document.getElementById('chat-window-coach');
    const btn = $('btn-toggle-chat-coach');
    const countBadge = document.getElementById('chat-count-coach');
    if(win){
      if(isVis) win.classList.add('open');
      else win.classList.remove('open');
    }
    if(btn) btn.innerHTML = isVis ? '💬 Close Chat' : '💬 Chat (Popup)';
    if(countBadge && coachChatMsgs) countBadge.textContent = coachChatMsgs.length;
  }
  if(!mode || mode === 'pub'){
    const isVis = lineupChatVisible.pub;
    const win = document.getElementById('chat-window-pub');
    const btn = $('btn-toggle-chat-pub');
    const countBadge = document.getElementById('chat-count-pub');
    if(win){
      if(isVis) win.classList.add('open');
      else win.classList.remove('open');
    }
    if(btn) btn.innerHTML = isVis ? '💬 Close Chat' : '💬 Chat (Popup)';
    if(countBadge && pubChatMsgs) countBadge.textContent = pubChatMsgs.length;
  }
}

function initCoachChat(){
  if(!curTeam) return;
  applyLineupChatVisibility('coach');
  if(coachChatUnsub) coachChatUnsub();

  const col = db.collection('teams').doc(curTeam.id).collection('discussions');
  coachChatUnsub = col.orderBy('createdAt', 'asc').limit(100).onSnapshot(snap => {
    coachChatMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderChatMessages(true);
  }, err => console.error('Coach chat error:', err));
}

function initPubChat(){
  if(!pvId) return;
  applyLineupChatVisibility('pub');
  updateChatIdentityUI();
  if(pubChatUnsub) pubChatUnsub();

  const col = db.collection('teams').doc(pvId).collection('discussions');
  pubChatUnsub = col.orderBy('createdAt', 'asc').limit(100).onSnapshot(snap => {
    pubChatMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderChatMessages(false);
  }, err => console.error('Pub chat error:', err));
}

async function sendCoachChatDirect(text){
  if(!curTeam || !text || !text.trim()) return;
  const senderName = curTeam.name ? (curTeam.name + ' (Coach)') : 'Head Coach';
  try {
    await db.collection('teams').doc(curTeam.id).collection('discussions').add({
      teamId: curTeam.id,
      senderName,
      senderRole: 'coach',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      pinned: false
    });
  } catch(e) {
    alert('❌ Could not send message.');
  }
}

async function sendPubChatDirect(text){
  if(!pvId || !text || !text.trim()) return;
  const id = getChatIdentity();
  if(!id.name || id.name === 'Visitor' || id.name === 'Team Member'){
    openChatIdentityModal();
    return;
  }
  try {
    await db.collection('teams').doc(pvId).collection('discussions').add({
      teamId: pvId,
      senderName: id.name,
      senderRole: id.role || 'member',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      pinned: false
    });
  } catch(e) {
    alert('❌ Could not send message.');
  }
}

async function sendCoachChat(originEl){
  if(!curTeam) return;
  let text = '';
  if(originEl && originEl.tagName === 'INPUT'){
    text = originEl.value.trim();
  } else if(originEl && originEl.parentElement) {
    const siblingInp = originEl.parentElement.querySelector('.chat-inp-coach');
    if(siblingInp) text = siblingInp.value.trim();
  }
  if(!text){
    const firstInp = document.querySelector('.chat-inp-coach');
    if(firstInp) text = firstInp.value.trim();
  }
  if(!text) return;

  document.querySelectorAll('.chat-inp-coach').forEach(inp => { inp.value = ''; });
  await sendCoachChatDirect(text);
}

async function sendPubChat(originEl){
  if(!pvId) return;
  let text = '';
  if(originEl && originEl.tagName === 'INPUT'){
    text = originEl.value.trim();
  } else if(originEl && originEl.parentElement) {
    const siblingInp = originEl.parentElement.querySelector('.chat-inp-pub');
    if(siblingInp) text = siblingInp.value.trim();
  }
  if(!text){
    const firstInp = document.querySelector('.chat-inp-pub');
    if(firstInp) text = firstInp.value.trim();
  }
  if(!text) return;

  const id = getChatIdentity();
  if(!id.name || id.name === 'Visitor' || id.name === 'Team Member'){
    openChatIdentityModal();
    return;
  }

  document.querySelectorAll('.chat-inp-pub').forEach(inp => { inp.value = ''; });
  await sendPubChatDirect(text);
}

async function togglePinChat(msgId, currentPinned){
  if(!curTeam) return;
  try {
    if(!currentPinned){
      const prevPinned = coachChatMsgs.filter(m => m.pinned && m.id !== msgId);
      for(const p of prevPinned){
        await db.collection('teams').doc(curTeam.id).collection('discussions').doc(p.id).update({ pinned: false });
      }
    }
    await db.collection('teams').doc(curTeam.id).collection('discussions').doc(msgId).update({ pinned: !currentPinned });
  } catch(e) {
    alert('❌ Could not pin/unpin message.');
  }
}

async function unpinCurrentChat(isCoach){
  if(!curTeam) return;
  const pinned = coachChatMsgs.find(m => m.pinned);
  if(pinned){
    try {
      await db.collection('teams').doc(curTeam.id).collection('discussions').doc(pinned.id).update({ pinned: false });
    } catch(e){}
  }
}

async function deleteChatMessage(msgId){
  if(!curTeam) return;
  if(!confirm('Delete this message?')) return;
  try {
    await db.collection('teams').doc(curTeam.id).collection('discussions').doc(msgId).delete();
  } catch(e) {
    alert('❌ Could not delete message.');
  }
}

async function clearTeamChat(){
  if(!curTeam) return;
  if(!confirm('⚠️ Are you sure you want to clear all chat messages for this team? This action cannot be undone.')) return;

  try {
    const snap = await db.collection('teams').doc(curTeam.id).collection('discussions').get();
    if(snap.empty){
      alert('Chat is already empty.');
      return;
    }
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    coachChatMsgs = [];
    renderChatMessages(true);
  } catch(e) {
    alert('❌ Could not clear chat: ' + (e.message || e));
  }
}

function doLogout(){
  sessionStorage.removeItem('fhq_session_active');
  if (typeof auth !== 'undefined' && auth && auth.signOut) {
    auth.signOut().catch(() => {});
  }
  if(unsub){unsub();unsub=null;}
  if(coachChatUnsub){coachChatUnsub();coachChatUnsub=null;}
  curTeam=null;teams=[];players=[];
  const lpw = $('lpw');
  if(lpw) lpw.value='';
  ss('s-login');
}

async function loadBrandingFS(){
  try{
    const snap=await db.collection('settings').doc('branding').get();
    if(snap.exists){
      const d=snap.data();
      if(d.name)localStorage.setItem(ANK,d.name);
      if(d.sub)localStorage.setItem(ASK,d.sub);
      if(d.logo && d.logo.length > 30)localStorage.setItem(ALK,d.logo);
      applyAdmName();
    }
  }catch(e){console.warn('Could not load branding from Firestore:', e);}
}

applyAdmName(); 
loadBrandingFS(); 
loadAdminCreds();

const up=new URLSearchParams(location.search);
try { localStorage.removeItem('fhq_session_active'); } catch(e){}
const isUserAuth = sessionStorage.getItem('fhq_session_active') === '1';

if(up.get('team')) { 
  if(up.get('type')==='staff') initPubStaff(up.get('team')); 
  else initPub(up.get('team')); 
} else if(up.get('view')) { 
  initPublicView(up.get('view')); 
} else {
  if(isUserAuth){
    ss('s-admin');
    loadAdmin();
  } else {
    ss('s-login');
  }
}

/* ==========================================================================
   SESSION PLANNER MODULE
   ========================================================================== */

let sessions = [];
let sessionsUnsub = null;
let pvSessions = [];
let pvSessionsUnsub = null;
let currentEditingSession = null;
let currentEditingDrillIndex = null;
let currentBoardTool = 'red';
let boardPitchType = 'half';
let boardObjects = [];
let boardHistory = [];
let isDrawingLine = false;
let lineStart = null;
let sessionAttendanceState = {};
let allSystemPlayers = [];
let currentStudioTeamId = 'all';
let sessionStudioReturnTarget = 's-admin';

function openSessionStudio(targetTeamId = '', returnTarget = 's-admin'){
  sessionStudioReturnTarget = returnTarget;
  applyAdmName();

  // Populate sp-studio-team-select
  const teamSel = $('sp-studio-team-select');
  if(teamSel){
    let opts = '<option value="all">🌐 All Teams (Global View)</option>';
    if(Array.isArray(teams) && teams.length){
      opts += teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
    }
    teamSel.innerHTML = opts;

    let tidToSet = 'all';
    if(targetTeamId && targetTeamId !== 'all' && Array.isArray(teams) && teams.some(t => t.id === targetTeamId)){
      tidToSet = targetTeamId;
    } else if(targetTeamId === 'all'){
      tidToSet = 'all';
    } else if(curTeam && curTeam.id && Array.isArray(teams) && teams.some(t => t.id === curTeam.id)){
      tidToSet = curTeam.id;
    }
    teamSel.value = tidToSet;
    currentStudioTeamId = tidToSet;
  } else {
    currentStudioTeamId = targetTeamId || 'all';
  }

  if(currentStudioTeamId && currentStudioTeamId !== 'all' && Array.isArray(teams)){
    const tMatch = teams.find(t => t.id === currentStudioTeamId);
    if(tMatch) curTeam = tMatch;
  }

  // Update back button label based on return target
  const backBtn = document.querySelector('#s-session-studio .tbtn.back');
  if(backBtn){
    if(returnTarget === 's-team' && curTeam && curTeam.name){
      backBtn.textContent = `← Back to ${curTeam.name}`;
    } else {
      backBtn.textContent = '← Dashboard';
    }
  }

  updateStudioPlayers(currentStudioTeamId);
  ss('s-session-studio');
  subscribeSessions(currentStudioTeamId);
}

function onStudioTeamSelectChange(newTeamId){
  currentStudioTeamId = newTeamId;
  if(newTeamId && newTeamId !== 'all' && Array.isArray(teams)){
    const tMatch = teams.find(t => t.id === newTeamId);
    if(tMatch) curTeam = tMatch;
  } else {
    if(!curTeam && Array.isArray(teams) && teams.length > 0) curTeam = teams[0];
  }
  updateStudioPlayers(newTeamId);
  subscribeSessions(newTeamId);
}

function updateStudioPlayers(teamId){
  if(teamId && teamId !== 'all'){
    if(Array.isArray(allSystemPlayers) && allSystemPlayers.length){
      players = allSystemPlayers.filter(p => p.teamId === teamId);
    } else if(typeof db !== 'undefined' && db){
      getDocs(query(collection(db, 'players'), where('teamId', '==', teamId))).then(snap => {
        players = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if(currentEditingSession) renderSessionAttendance();
      }).catch(e => console.warn(e));
    }
  } else {
    players = allSystemPlayers || [];
  }
}

function exitSessionStudio(){
  if(sessionsUnsub){ sessionsUnsub(); sessionsUnsub = null; }
  try {
    if(window.location.search.includes('mode=sessions') || window.location.search.includes('tab=sessions') || window.location.search.includes('auth=1')){
      history.replaceState(null, '', window.location.pathname);
    }
  } catch(e){}
  if(sessionStudioReturnTarget === 's-team' && curTeam){
    ss('s-team');
    showTab('squad');
  } else {
    loadAdmin();
    ss('s-admin');
  }
}

function onSessionEditorTeamChanged(newTeamId){
  if(!currentEditingSession) return;
  currentEditingSession.teamId = newTeamId;
  const activeEditorTeam = Array.isArray(teams) ? teams.find(t => t.id === newTeamId) : null;

  const coachSelect = $('se-coach');
  if(coachSelect){
    const staffList = (activeEditorTeam && activeEditorTeam.staff) || [];
    coachSelect.innerHTML = '<option value="">Select Coach</option>' + staffList.map(st => `
      <option value="${esc(st.name)}">${esc(st.name)} (${esc(st.role || 'Staff')})</option>
    `).join('');
  }

  if(Array.isArray(allSystemPlayers) && allSystemPlayers.length){
    players = allSystemPlayers.filter(p => p.teamId === newTeamId);
    renderSessionAttendance();
  } else if(typeof db !== 'undefined' && db){
    getDocs(query(collection(db, 'players'), where('teamId', '==', newTeamId))).then(snap => {
      players = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderSessionAttendance();
    }).catch(e => console.warn(e));
  }
}

const EQUIPMENT_PRESETS = [
  { id: 'balls', label: 'Footballs (12)', icon: '<img src="soccer-ball.svg" style="width:14px;height:14px;vertical-align:middle;display:inline-block;border-radius:50%;margin-right:2px;" alt="Ball" />', def: true },
  { id: 'cones_orange', label: 'Orange Cones', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><ellipse cx="8" cy="13.5" rx="6" ry="1.8" fill="#880e4f"/><path d="M3 13.5L7 3h2l4 10.5H3z" fill="#ff3d00" stroke="#c62828" stroke-width="0.8"/><path d="M5 9h6l.8 2H4.2L5 9z" fill="#fff"/></svg>', def: true },
  { id: 'cones_yellow', label: 'Yellow Discs', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><ellipse cx="8" cy="10" rx="6.5" ry="3" fill="#ffd600" stroke="#f57f17" stroke-width="0.8"/><ellipse cx="8" cy="9.5" rx="1.6" ry="0.8" fill="#bf360c"/></svg>', def: true },
  { id: 'bibs_yellow', label: 'Yellow Bibs (10)', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><path d="M4 3l2-1h4l2 1v11H4V3z" fill="#ffd600" stroke="#f57f17" stroke-width="0.8"/></svg>', def: true },
  { id: 'bibs_blue', label: 'Blue Bibs (10)', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><path d="M4 3l2-1h4l2 1v11H4V3z" fill="#1e88e5" stroke="#0d47a1" stroke-width="0.8"/></svg>', def: true },
  { id: 'bibs_red', label: 'Red Bibs (10)', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><path d="M4 3l2-1h4l2 1v11H4V3z" fill="#e53935" stroke="#b71c1c" stroke-width="0.8"/></svg>', def: false },
  { id: 'goals_mini', label: 'Mini Goals', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="9" fill="rgba(255,255,255,0.4)" stroke="#455a64" stroke-width="1.2"/><line x1="2" y1="8" x2="14" y2="8" stroke="#cfd8dc"/><line x1="8" y1="4" x2="8" y2="13" stroke="#cfd8dc"/></svg>', def: true },
  { id: 'hurdles', label: 'Agility Hurdles', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><path d="M2 13v-7c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v7" fill="none" stroke="#ff6d00" stroke-width="1.8"/></svg>', def: false },
  { id: 'ladders', label: 'Agility Ladders', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><line x1="4" y1="2" x2="4" y2="14" stroke="#1a237e" stroke-width="1.5"/><line x1="12" y1="2" x2="12" y2="14" stroke="#1a237e" stroke-width="1.5"/><line x1="3" y1="5" x2="13" y2="5" stroke="#ffd600" stroke-width="1.4"/><line x1="3" y1="9" x2="13" y2="9" stroke="#ffd600" stroke-width="1.4"/><line x1="3" y1="13" x2="13" y2="13" stroke="#ffd600" stroke-width="1.4"/></svg>', def: false },
  { id: 'poles', label: 'Slalom Poles', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><line x1="8" y1="2" x2="8" y2="14" stroke="#ffd600" stroke-width="1.8"/><polygon points="8,2 14,4.5 8,7" fill="#ff1744"/></svg>', def: false },
  { id: 'mannequins', label: 'Mannequins', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><circle cx="8" cy="3" r="2" fill="#00e676"/><rect x="4" y="6" width="8" height="2" rx="1" fill="#00e676"/><rect x="4.5" y="9" width="7" height="2" rx="1" fill="#00e676"/><line x1="8" y1="5" x2="8" y2="14" stroke="#37474f" stroke-width="1.5"/></svg>', def: false },
  { id: 'stopwatch', label: 'Stopwatch & Whistle', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><circle cx="8" cy="9" r="6" fill="none" stroke="#546e7a" stroke-width="1.5"/><line x1="8" y1="9" x2="8" y2="5" stroke="#e53935" stroke-width="1.2"/><line x1="8" y1="1" x2="8" y2="3" stroke="#546e7a" stroke-width="1.5"/></svg>', def: true },
  { id: 'board', label: 'Tactical Board', icon: '<svg class="sp-tb-icon" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="1.5" fill="#2e7d32" stroke="#1b5e20" stroke-width="1.2"/><circle cx="8" cy="8" r="2.5" fill="none" stroke="#fff" stroke-width="0.8"/></svg>', def: true }
];

const DRILL_LIBRARY = [
  {
    id: 'd_rondo_5v2',
    phase: 'Warm-Up',
    name: '5v2 Fast-Paced Transition Rondo',
    duration: 15,
    dimensions: '10x10m Grid',
    players: '7 Players (5v2)',
    description: '5 attackers on the outside keep possession with 1-2 touch max. 2 defenders in the middle press. If defenders win the ball or force a mistake, the player who made the error switches with the defender.',
    coachingPoints: '• Open body shape facing the grid\n• Weight and accuracy of first touch\n• Scan 360° before receiving the ball\n• High intensity defensive pressing triggers',
    diagram: ''
  },
  {
    id: 'd_y_passing',
    phase: 'Technical',
    name: 'Y-Pattern Combination Passing & Third Man Run',
    duration: 20,
    dimensions: '25x20m Zone',
    players: '8-12 Players',
    description: 'Player A passes to B who checks away. B sets ball back to A. A plays diagonal penetrative pass to C making an overlapping run. C crosses or finishes into mini-goal. Rotate positions A->B->C->A.',
    coachingPoints: '• Timing of the checking movement\n• Firm punchy passes on the ground\n• Dynamic acceleration after releasing the ball\n• Communication (verbal + visual hand gestures)',
    diagram: ''
  },
  {
    id: 'd_1v1_finishing',
    phase: 'Technical',
    name: '1v1 Channel Duel & Rapid Box Finishing',
    duration: 20,
    dimensions: '30x20m with Goal',
    players: '8 Players + 1 GK',
    description: 'Attacker receives pass from coach, turns and attacks defender in a 1v1 channel. Attacker has 6 seconds to beat defender and take a shot on goal. If defender wins ball, they score into mini-counter goals.',
    coachingPoints: '• Direct positive first touch toward goal\n• Change of pace and deceptive body feints\n• Clinical early finishing across the goalkeeper\n• Defender stays low and delays attacker',
    diagram: ''
  },
  {
    id: 'd_4v4_3_possession',
    phase: 'Tactical',
    name: '4v4 + 3 Neutral Positional Possession',
    duration: 25,
    dimensions: '30x25m Box',
    players: '11 Players (4v4 + 3)',
    description: '4 vs 4 inside the grid with 3 Neutral/Floaters (1 at each end, 1 central #10). Team in possession looks to connect 6 passes or transfer ball from end neutral to opposite end neutral for 1 point.',
    coachingPoints: '• Create passing triangles & diamonds\n• Exploit central #10 to draw defenders and switch play\n• Counter-press instantly within 3 seconds of losing ball\n• Width and depth to stretch opposition',
    diagram: ''
  },
  {
    id: 'd_high_press_ssg',
    phase: 'SSG',
    name: '6v6 + 2 Flank Gate Pressing Game',
    duration: 25,
    dimensions: '45x35m Pitch with 2 Goals',
    players: '12 Players + 2 GKs',
    description: '6v6 with 2 mini target gates on the flanks. Defending team sets pressing line at midfield. If defending team wins ball in attacking half and scores within 8 seconds, the goal counts double.',
    coachingPoints: '• Pressing triggers (bad touch, back-pass, ball in the air)\n• Whole team shifts together to close passing lanes\n• Aggressive forward runs immediately on turnover\n• GK acts as sweeper-keeper high line',
    diagram: ''
  },
  {
    id: 'd_11v11_phase',
    phase: 'Match Play',
    name: '11v11 Half-Pitch Tactical Phase Play',
    duration: 20,
    dimensions: 'Full Half-Pitch',
    players: 'Full Squad + 2 GKs',
    description: 'Attacking XI builds out from goalkeeper against defensive compact block. Attackers focus on breaking lines through half-spaces and overlapping full-backs. Defending XI counters into target mini-goals.',
    coachingPoints: '• Positional discipline and spacing\n• Overlaps and underlaps from full-backs\n• Defensive low-block sliding and compactness\n• Communication across defensive back-line',
    diagram: ''
  },
  {
    id: 'd_cooldown_stretch',
    phase: 'Cool Down',
    name: 'Dynamic Cool Down, Static Stretching & Coach Debrief',
    duration: 10,
    dimensions: 'Penalty Box Area',
    players: 'Full Squad',
    description: 'Light jog and dynamic mobility followed by full-body static stretching (hamstrings, quads, calves, hip flexors, groin). Coach reviews session highlights and assigns match preparations.',
    coachingPoints: '• Deep breathing and gradual heart-rate recovery\n• Hold each stretch for 20-30 seconds\n• Hydration and nutritional recovery intake\n• Team unity and constructive coach feedback',
    diagram: ''
  }
];

const SESSION_PRESETS = [
  {
    id: 'preset_high_press_433',
    title: '4-3-3 High Pressing & Rapid Counter-Attack',
    category: 'Tactical',
    intensity: 'High',
    duration: 90,
    objectives: '• Establish high-intensity pressing triggers in the opponent half\n• Cut off central passing lanes and force play wide\n• Rapid 3-second transition to score upon winning possession',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch', 'board'],
    drills: [
      {
        phase: 'Warm-Up',
        name: 'Dynamic SAQ Activation & 5v2 Rondo',
        duration: 15,
        dimensions: '15x15m',
        players: 'Squad split in 2 groups',
        description: '5 minutes of ladder/hurdle agility activation followed by 10 minutes of high-tempo 5v2 keep-away with 2 touches max.',
        coachingPoints: '• Quick footwork and sharp acceleration\n• Instant pressing response on ball loss',
        diagram: ''
      },
      {
        phase: 'Technical',
        name: 'Forward Penetration & Quick 1-2 Combinations',
        duration: 20,
        dimensions: '25x20m',
        players: 'Full Squad',
        description: 'Fast combination passing drill simulating midfield line-breaking passes into winger and striker check-runs.',
        coachingPoints: '• Crisp passing velocity\n• Open body shape to see forward options\n• Third-man off-the-ball run',
        diagram: ''
      },
      {
        phase: 'Tactical',
        name: '4v4+3 Central Positional Pressing Grid',
        duration: 25,
        dimensions: '35x25m',
        players: '11 Players (4v4+3)',
        description: 'Team out of possession works as a 4-man pressing unit to intercept and immediately hit target neutral striker.',
        coachingPoints: '• Compact 4-man block movement\n• Curved pressing runs to block return pass\n• Direct vertical pass on turnover',
        diagram: ''
      },
      {
        phase: 'SSG',
        name: '7v7 + 1 Neutral High Press Transition Game',
        duration: 20,
        dimensions: '55x40m (2 Box-to-Box)',
        players: '15 Players + 2 GKs',
        description: '7v7 match. Goals scored within 8 seconds of winning the ball in attacking half count as 2 goals.',
        coachingPoints: '• Aggressive hunt in packs\n• Quick forward shot or cross before opponent recovers\n• Sweeper-keeper communication',
        diagram: ''
      },
      {
        phase: 'Cool Down',
        name: 'Recovery Walk, Static Stretch & Tactical Review',
        duration: 10,
        dimensions: 'Half Pitch',
        players: 'All Players',
        description: 'Light active recovery, hamstring & groin stretches, followed by 5-minute tactical recap with the coaching staff.',
        coachingPoints: '• Lower heart rate\n• Reinforce key tactical takeaways for upcoming match',
        diagram: ''
      }
    ]
  },
  {
    id: 'preset_tikitaka_possession',
    title: 'Tiki-Taka 3rd Man Possession & Combination Play',
    category: 'Technical',
    intensity: 'Medium',
    duration: 90,
    objectives: '• Master triangle & diamond passing structures\n• Exploit third-man runs to break defensive lines\n• Maintain high ball retention under aggressive pressure',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch'],
    drills: [
      {
        phase: 'Warm-Up',
        name: 'Passing Diamond & Continuous Overlaps',
        duration: 15,
        dimensions: '18x18m Diamond',
        players: 'Squad in 2 groups',
        description: 'Continuous 1-touch and 2-touch passing diamond with give-and-go overlaps and blindside check-runs.',
        coachingPoints: '• Weight of pass to back foot\n• Disguise intentions with eye movement\n• Sharp deceleration into space',
        diagram: ''
      },
      {
        phase: 'Technical',
        name: '3v1 to 3v3 Positional Transfer Channels',
        duration: 20,
        dimensions: '30x15m (3 Channels)',
        players: '12 Players (4 teams of 3)',
        description: 'Teams keep 3v1 in end zone, after 4 passes they must transfer ball through central midfield zone to opposite end.',
        coachingPoints: '• Calmness on the ball under tight pressure\n• Penetrative pass through the central pocket\n• Supporting angles from midfielders',
        diagram: ''
      },
      {
        phase: 'Tactical',
        name: '6v6 + 3 Possession Overload Game',
        duration: 25,
        dimensions: '40x35m',
        players: '15 Players',
        description: '6v6 with 3 neutral players creating a constant +3 attacking overload. Aim is 10 consecutive passes for 1 point.',
        coachingPoints: '• Constant movement off the ball\n• Use neutrals to reset tempo when closed down\n• Quick one-touch switch to weak side',
        diagram: ''
      },
      {
        phase: 'SSG',
        name: '8v8 Small-Sided Game with 4 Mini Goals',
        duration: 20,
        dimensions: '50x40m',
        players: '16 Players',
        description: '8v8 playing to 4 wide mini-goals to encourage switching play and combination passing into wide channels.',
        coachingPoints: '• Quick ball circulation from side to side\n• Exploit underloaded side with overlapping run\n• Speed of play in final third',
        diagram: ''
      },
      {
        phase: 'Cool Down',
        name: 'Gradual De-load & Hip Mobility Routine',
        duration: 10,
        dimensions: 'Center Circle',
        players: 'All Players',
        description: 'Gentle mobility flow, calf/hip stretches, and hydration check-in.',
        coachingPoints: '• Controlled deep breathing\n• Rehydrate with electrolytes',
        diagram: ''
      }
    ]
  },
  {
    id: 'preset_finishing_crossing',
    title: 'Direct Wing Play, Crossing & Box Penetration',
    category: 'Technical',
    intensity: 'High',
    duration: 90,
    objectives: '• Deliver accurate early crosses into danger zones\n• Attack near post, far post, and cut-back areas with staggered runs\n• High clinical conversion rate on first-time finishes',
    equipment: ['balls', 'cones_orange', 'bibs_yellow', 'bibs_blue', 'mannequins', 'stopwatch'],
    drills: [
      {
        phase: 'Warm-Up',
        name: 'Dynamic Box Agility & Header/Volley Warmup',
        duration: 15,
        dimensions: '20x20m',
        players: 'Pairs with ball',
        description: 'Dynamic movement across cones with aerial ball control, headers, and half-volleys to partner hands/feet.',
        coachingPoints: '• Attack the ball at the highest point\n• Soft cushioned touch on chest control\n• Knee over ball on volleys',
        diagram: ''
      },
      {
        phase: 'Technical',
        name: 'Overlap Combination & Unopposed Crossing Circuit',
        duration: 20,
        dimensions: 'Full Width Final Third',
        players: 'Wingers, Full-backs, Strikers + 2 GKs',
        description: 'Fullback overlaps winger around mannequin, delivers low hard cross or whipped far-post ball to 3 attacking runners.',
        coachingPoints: '• Crosser looks up before striking\n• Run 1: Near post dart across front of defender\n• Run 2: Central penalty spot late arrival\n• Run 3: Far post sweep / cut-back edge of box',
        diagram: ''
      },
      {
        phase: 'Tactical',
        name: '3v2 / 4v3 Rapid Box Overload Attacks',
        duration: 25,
        dimensions: 'Half Pitch with 1 Main Goal',
        players: 'Attackers vs Defenders + 1 GK',
        description: 'Wave after wave of 3v2 and 4v3 attacks originating from wide areas against 2-3 retreating center-backs.',
        coachingPoints: '• Drive at defenders with speed\n• Commit the center-back before releasing wide\n• Rebound anticipation from all attackers',
        diagram: ''
      },
      {
        phase: 'SSG',
        name: '7v7 + 2 Wide Floaters Crossing Match',
        duration: 20,
        dimensions: 'Penalty Box to Penalty Box with Wings',
        players: '14 Players + 2 Wide Floaters + 2 GKs',
        description: '7v7 game where wide floaters have 2 touch free crossing zones. Goals scored from crosses count for 2 points.',
        coachingPoints: '• Early delivery before defense is set\n• Aggressive aerial duels in both boxes\n• Defensive clearance away from danger zone',
        diagram: ''
      },
      {
        phase: 'Cool Down',
        name: 'Quad & Groin Recovery Stretching',
        duration: 10,
        dimensions: 'Penalty Box',
        players: 'Full Squad',
        description: 'Static stretching for legs, lower back, and coach feedback on finishing metrics.',
        coachingPoints: '• Stretch hip flexors and quads\n• Celebrate clinical execution and goal scorers',
        diagram: ''
      }
    ]
  },
  {
    id: 'preset_low_block_defense',
    title: 'Defensive Low-Block Organization & Compactness',
    category: 'Tactical',
    intensity: 'Medium',
    duration: 90,
    objectives: '• Maintain tight vertical and horizontal distances (compact 4-4-2 or 5-3-2)\n• Deny central penetration and protect the penalty area\n• Force opponent into low-probability wide crosses and win second balls',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch', 'board'],
    drills: [
      {
        phase: 'Warm-Up',
        name: 'Back-4 Sliding & Shift Reaction Drill',
        duration: 15,
        dimensions: '35x20m',
        players: 'Back 4 + 2 Midfielders',
        description: 'Coach points or plays ball to different zones; back line slides, steps up, or drops in unison maintaining 8-10m distances.',
        coachingPoints: '• Vocal communication from center-backs and GK\n• Body shape side-on ready to sprint back\n• Step up together when ball is played backwards',
        diagram: ''
      },
      {
        phase: 'Technical',
        name: 'Defending 1v1 & 2v2 Duels in the Box',
        duration: 20,
        dimensions: 'Penalty Box Area',
        players: 'Defenders & Attackers + 1 GK',
        description: 'High-intensity 1v1 and 2v2 duels. Defender works on body positioning, blocking shots, and avoiding cheap fouls in the box.',
        coachingPoints: '• Stay on feet, do not dive into tackles\n• Force attacker onto their weaker foot\n• Hands tucked in to avoid handball',
        diagram: ''
      },
      {
        phase: 'Tactical',
        name: '8 vs 6 Low Block Defense vs Waves of Attack',
        duration: 25,
        dimensions: 'Defensive Half Pitch',
        players: '8 Defenders vs 6 Attackers + 1 GK',
        description: 'Attacking team attempts to break through central zones. Defending unit slides and stays ultra-compact.',
        coachingPoints: '• Deny the half-spaces and #10 pocket\n• Clearances must be high and wide\n• Instant transition pass to target mini-goals',
        diagram: ''
      },
      {
        phase: 'Match Play',
        name: '10v10 Game with Zonal Constraints',
        duration: 20,
        dimensions: '65x45m Pitch',
        players: '20 Players + 2 GKs',
        description: 'Full match where team defending low block earns points for clean sheet every 5 minutes + counter goals.',
        coachingPoints: '• Game management under pressure\n• Defensive discipline without losing shape',
        diagram: ''
      },
      {
        phase: 'Cool Down',
        name: 'Team Circle Stretch & Leadership Review',
        duration: 10,
        dimensions: 'Center Circle',
        players: 'All Players',
        description: 'Static stretching and captain/coach debrief on defensive resilience.',
        coachingPoints: '• Praise defensive work ethic\n• Mental focus reinforcement',
        diagram: ''
      }
    ]
  }
];

function subscribeSessions(targetTeamId){
  if(sessionsUnsub){sessionsUnsub(); sessionsUnsub = null;}
  const tid = (typeof targetTeamId === 'string') ? targetTeamId : (currentStudioTeamId || (curTeam ? curTeam.id : 'all'));
  currentStudioTeamId = tid;

  const isSpecificTeam = tid && tid !== 'all';
  const cacheKey = isSpecificTeam ? ('fhq_sessions_' + tid) : 'fhq_sessions_all';

  // Load from local storage cache first for instant response (deduplicated)
  try {
    const cached = localStorage.getItem(cacheKey);
    if(cached) {
      const parsed = JSON.parse(cached);
      const uniqueMap = new Map();
      (Array.isArray(parsed) ? parsed : []).forEach(s => {
        if(s && s.id) uniqueMap.set(s.id, s);
      });
      sessions = Array.from(uniqueMap.values());
      renderSessions();
    }
  } catch(e){}

  try {
    const q = isSpecificTeam
      ? query(collection(db, 'sessions'), where('teamId', '==', tid))
      : collection(db, 'sessions');

    sessionsUnsub = onSnapshot(
      q,
      snap => {
        const uniqueMap = new Map();
        snap.docs.forEach(d => {
          uniqueMap.set(d.id, { id: d.id, ...d.data() });
        });
        sessions = Array.from(uniqueMap.values())
          .sort((a, b) => (String(b.date || '') + String(b.time || '')).localeCompare(String(a.date || '') + String(a.time || '')));
        try { localStorage.setItem(cacheKey, JSON.stringify(sessions)); } catch(e){}
        renderSessions();
      },
      err => {
        console.warn('Firestore sessions subscription notice:', err);
      }
    );
  } catch(e){
    console.warn('Could not initialize sessions snapshot:', e);
  }
}

function subscribePubSessions(){
  if(pvSessionsUnsub){pvSessionsUnsub(); pvSessionsUnsub = null;}
  if(!pvTeam) return;
  try {
    pvSessionsUnsub = onSnapshot(
      query(collection(db, 'sessions'), where('teamId', '==', pvTeam.id)),
      snap => {
        const uniqueMap = new Map();
        snap.docs.forEach(d => {
          uniqueMap.set(d.id, { id: d.id, ...d.data() });
        });
        pvSessions = Array.from(uniqueMap.values())
          .sort((a, b) => (String(b.date || '') + String(b.time || '')).localeCompare(String(a.date || '') + String(a.time || '')));
        renderPubSessions();
      },
      err => console.warn('pv sessions error:', err)
    );
  } catch(e){}
}

function getPhaseClass(phase){
  const p = String(phase || '').toLowerCase();
  if(p.includes('warm')) return 'phase-warmup';
  if(p.includes('tech')) return 'phase-technical';
  if(p.includes('tact')) return 'phase-tactical';
  if(p.includes('ssg') || p.includes('small')) return 'phase-ssg';
  if(p.includes('match') || p.includes('game')) return 'phase-match';
  return 'phase-recovery';
}

function getCategoryBadgeClass(cat){
  const c = String(cat || '').toLowerCase();
  if(c.includes('tact')) return 'sp-badge-tactical';
  if(c.includes('tech')) return 'sp-badge-technical';
  if(c.includes('ssg')) return 'sp-badge-ssg';
  if(c.includes('phys')) return 'sp-badge-physical';
  if(c.includes('match')) return 'sp-badge-match';
  if(c.includes('set')) return 'sp-badge-setpiece';
  return 'sp-badge-recovery';
}

function renderSessions(){
  const search = ($('sp-search')?.value || '').toLowerCase().trim();
  const catFilter = $('sp-filter-cat')?.value || '';
  const statusFilter = $('sp-filter-status')?.value || '';
  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = sessions.filter(s => {
    if(catFilter && s.category !== catFilter) return false;
    if(statusFilter === 'upcoming' && (s.date < todayStr)) return false;
    if(statusFilter === 'today' && (s.date !== todayStr)) return false;
    if(statusFilter === 'completed' && (s.date > todayStr && s.debrief?.status !== 'completed')) return false;
    if(search){
      const matchTitle = (s.title || '').toLowerCase().includes(search);
      const matchObj = (s.objectives || '').toLowerCase().includes(search);
      const matchVenue = (s.venue || '').toLowerCase().includes(search);
      const matchDrills = (s.drills || []).some(d => (d.name || '').toLowerCase().includes(search) || (d.description || '').toLowerCase().includes(search));
      if(!matchTitle && !matchObj && !matchVenue && !matchDrills) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalSessions = sessions.length;
  const upcomingCount = sessions.filter(s => (s.date || '') >= todayStr).length;
  const totalMins = sessions.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0);
  const totalHours = (totalMins / 60).toFixed(1);

  let attTotalP = 0, attTotalA = 0;
  sessions.forEach(s => {
    if(s.attendance){
      const vals = Object.values(s.attendance);
      if(vals.length){
        const presentCount = vals.filter(v => v === 'present' || v === 'late').length;
        attTotalP += presentCount;
        attTotalA += vals.length;
      }
    }
  });
  const avgAtt = attTotalA > 0 ? Math.round((attTotalP / attTotalA) * 100) : (players.length ? 100 : 0);

  if($('sp-st-total')) $('sp-st-total').textContent = totalSessions;
  if($('sp-st-upcoming')) $('sp-st-upcoming').textContent = upcomingCount;
  if($('sp-st-hours')) $('sp-st-hours').textContent = totalHours + 'h';
  if($('sp-st-att')) $('sp-st-att').textContent = avgAtt + '%';

  const listEl = $('sp-list');
  if(!listEl) return;

  if(!filtered.length){
    listEl.innerHTML = `
      <div class="empty" style="grid-column: 1/-1; padding: 40px 20px;">
        <div class="ei">📋</div>
        <p style="font-size:16px;font-weight:700;color:var(--tx);margin-bottom:6px;">${sessions.length ? 'No sessions match your search filters.' : 'No training sessions planned yet.'}</p>
        <p style="font-size:13px;color:var(--mt);margin-bottom:18px;">Create your first structured practice plan or pick from ready-made tactical presets.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="mok" onclick="openTemplatePicker()">⚡ Use Ready-Made Preset</button>
          <button class="obtn" onclick="openNewSession()">＋ Plan From Scratch</button>
        </div>
      </div>`;
    return;
  }

  listEl.innerHTML = filtered.map(s => {
    const drills = s.drills || [];
    const totalDrillMins = drills.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0) || s.duration || 90;
    
    // Timeline mini bar segments
    const timelineBarHTML = drills.length ? `
      <div class="sp-timeline-bar-mini">
        ${drills.map(d => {
          const pct = Math.max(5, Math.round(((parseInt(d.duration) || 15) / totalDrillMins) * 100));
          return `<div class="${getPhaseClass(d.phase)}" style="width:${pct}%;" title="${esc(d.name)} (${d.duration}m)"></div>`;
        }).join('')}
      </div>` : '';

    // Attendance pill
    let attText = '';
    if(s.attendance && Object.keys(s.attendance).length){
      const vals = Object.values(s.attendance);
      const pres = vals.filter(v => v === 'present' || v === 'late').length;
      const rate = Math.round((pres / vals.length) * 100);
      attText = `👥 ${pres}/${vals.length} (${rate}%)`;
    } else if(players.length) {
      attText = `👥 ${players.length} Squad`;
    }

    const intensityClass = s.intensity === 'High' ? 'sp-intensity-high' : (s.intensity === 'Low' ? 'sp-intensity-low' : (s.intensity === 'Match' ? 'sp-intensity-match' : 'sp-intensity-med'));
    const teamObj = Array.isArray(teams) ? teams.find(t => t.id === s.teamId) : null;
    const teamBadgeHTML = teamObj ? `<span class="sp-badge" style="background:rgba(26,92,26,0.1);color:#1a5c1a;border:1px solid rgba(26,92,26,0.25);font-weight:700;">⚽ ${esc(teamObj.name)}</span>` : '';

    return `
      <div class="sp-card">
        <div class="sp-card-head">
          <div class="sp-date-badge">
            <span>📅</span>
            <span>${formatSessionDate(s.date)}</span>
            ${s.time ? `<span style="font-weight:400;opacity:.8;">${s.time}</span>` : ''}
          </div>
          <div class="sp-badge-group">
            ${teamBadgeHTML}
            <span class="sp-badge ${getCategoryBadgeClass(s.category)}">${esc(s.category || 'Tactical')}</span>
            <span class="sp-badge ${intensityClass}">⚡ ${esc(s.intensity || 'Medium')}</span>
          </div>
        </div>

        <div class="sp-card-title">${esc(s.title || 'Training Session')}</div>
        <div class="sp-card-topic">${esc(s.objectives ? s.objectives.split('\n')[0] : (s.venue ? '📍 ' + s.venue : 'General Practice'))}</div>

        ${timelineBarHTML}

        <div class="sp-drills-chips">
          ${drills.slice(0, 4).map(d => `
            <div class="sp-drill-chip">
              <span class="dot ${getPhaseClass(d.phase)}"></span>
              <span><strong>${d.duration || 15}m</strong> ${esc(d.name || d.phase)}</span>
            </div>
          `).join('')}
          ${drills.length > 4 ? `<div class="sp-drill-chip" style="font-weight:700;">+${drills.length - 4} more</div>` : ''}
        </div>

        <div class="sp-card-footer">
          <div class="sp-card-meta">
            <span>⏱️ <strong>${s.duration || totalDrillMins}m</strong></span>
            ${attText ? `<span>·</span><span>${attText}</span>` : ''}
            ${s.venue ? `<span>·</span><span>📍 ${esc(s.venue)}</span>` : ''}
          </div>
          <div class="sp-card-acts">
            <button class="sp-act-btn" onclick="openSessionPrint('${s.id}')" title="Print coaching clipboard sheet">🖨️</button>
            <button class="sp-act-btn" onclick="shareSessionWhatsApp('${s.id}')" title="Share plan to WhatsApp">📱</button>
            <button class="sp-act-btn" onclick="duplicateSession('${s.id}')" title="Duplicate session plan">📋</button>
            <button class="sp-act-btn primary" onclick="editSession('${s.id}')" title="Edit session">✏️ Edit</button>
            <button class="sp-act-btn del" onclick="deleteSession('${s.id}')" title="Delete session">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPubSessions(){
  const listEl = $('pv-sessions-list');
  if(!listEl) return;
  if(!pvSessions.length){
    listEl.innerHTML = `<div class="empty" style="grid-column:1/-1;"><div class="ei">📋</div><p>No training sessions scheduled yet.</p></div>`;
    return;
  }
  listEl.innerHTML = pvSessions.map(s => {
    const drills = s.drills || [];
    return `
      <div class="sp-card">
        <div class="sp-card-head">
          <div class="sp-date-badge">
            <span>📅</span>
            <span>${formatSessionDate(s.date)}</span>
            ${s.time ? `<span style="font-weight:400;">${s.time}</span>` : ''}
          </div>
          <div class="sp-badge-group">
            <span class="sp-badge ${getCategoryBadgeClass(s.category)}">${esc(s.category || 'Tactical')}</span>
            <span class="sp-badge sp-intensity-med">⏱️ ${s.duration || 90} mins</span>
          </div>
        </div>
        <div class="sp-card-title">${esc(s.title || 'Training Session')}</div>
        <div class="sp-card-topic">${esc(s.objectives || 'Team training session')}</div>
        ${s.venue ? `<div style="font-size:12px;color:var(--mt);margin-bottom:10px;">📍 <strong>Venue:</strong> ${esc(s.venue)}</div>` : ''}
        <div class="sp-drills-chips">
          ${drills.map(d => `
            <div class="sp-drill-chip">
              <span class="dot ${getPhaseClass(d.phase)}"></span>
              <span><strong>${d.duration || 15}m</strong> ${esc(d.name)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function formatSessionDate(dateStr){
  if(!dateStr) return 'TBD';
  try {
    const parts = dateStr.split('-');
    if(parts.length === 3){
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  } catch(e){}
  return dateStr;
}

/* ==========================================================================
   SESSION PLANNER EDITOR & DRILL BUILDER
   ========================================================================== */

let initialSessionStateSnapshot = null;
let initialDrillBoardSnapshot = null;

function takeSessionStateSnapshot(){
  const s = currentEditingSession;
  if(!s) return null;
  return JSON.stringify({
    id: s.id || null,
    title: ($('se-title')?.value || '').trim(),
    date: $('se-date')?.value || '',
    time: $('se-time')?.value || '',
    venue: ($('se-venue')?.value || '').trim(),
    category: $('se-category')?.value || '',
    intensity: $('se-intensity')?.value || '',
    coach: $('se-coach')?.value || '',
    objectives: ($('se-objectives')?.value || '').trim(),
    equipment: s.equipment || [],
    drills: (s.drills || []).map(d => ({
      title: d.title,
      phase: d.phase,
      duration: d.duration,
      intensity: d.intensity,
      description: d.description,
      keyPoints: d.keyPoints,
      diagram: d.diagram || null,
      boardObjects: d.boardObjects || null,
      pitchType: d.pitchType || null
    })),
    attendance: sessionAttendanceState || {},
    rating: $('se-rating')?.value || '',
    status: $('se-status')?.value || 'scheduled',
    notes: ($('se-notes')?.value || '').trim()
  });
}

function isSessionEditorDirty(){
  if(!$('m-session-editor')?.classList.contains('open')) return false;
  if(!initialSessionStateSnapshot || !currentEditingSession) return false;
  const current = takeSessionStateSnapshot();
  return initialSessionStateSnapshot !== current;
}

function closeSessionEditor(){
  if(isSessionEditorDirty()){
    if(!confirm('⚠️ You have unsaved changes in this training session.\n\nAre you sure you want to discard your changes and exit?')){
      return;
    }
  }
  initialSessionStateSnapshot = null;
  currentEditingSession = null;
  closeM('m-session-editor');
}

function openNewSession(){
  if(isSessionEditorDirty() && !confirm('⚠️ You have unsaved changes in the current session plan.\n\nDiscard and create a new session?')) return;
  const today = new Date().toISOString().split('T')[0];
  const assignedTeamId = (currentStudioTeamId && currentStudioTeamId !== 'all') ? currentStudioTeamId : (curTeam ? curTeam.id : (teams[0] ? teams[0].id : ''));
  currentEditingSession = {
    id: null,
    teamId: assignedTeamId,
    title: '',
    date: today,
    time: '17:30',
    venue: '',
    category: 'Tactical',
    intensity: 'Medium',
    coach: '',
    objectives: '',
    equipment: ['balls', 'cones_orange', 'cones_yellow', 'bibs_yellow', 'bibs_blue', 'goals_mini', 'stopwatch', 'board'],
    drills: JSON.parse(JSON.stringify(DRILL_LIBRARY.slice(0, 4))),
    attendance: {},
    debrief: { rating: '', status: 'scheduled', notes: '' }
  };
  populateSessionEditorForm();
  openM('m-session-editor');
}

function openSessionWithPreset(presetId){
  if(isSessionEditorDirty() && !confirm('⚠️ You have unsaved changes in the current session plan.\n\nDiscard and load preset?')) return;
  closeM('m-template-picker');
  const preset = SESSION_PRESETS.find(p => p.id === presetId);
  if(!preset) return;
  const today = new Date().toISOString().split('T')[0];
  const assignedTeamId = (currentStudioTeamId && currentStudioTeamId !== 'all') ? currentStudioTeamId : (curTeam ? curTeam.id : (teams[0] ? teams[0].id : ''));
  currentEditingSession = {
    id: null,
    teamId: assignedTeamId,
    title: preset.title,
    date: today,
    time: '17:30',
    venue: '',
    category: preset.category,
    intensity: preset.intensity,
    coach: '',
    objectives: preset.objectives,
    equipment: [...(preset.equipment || ['balls', 'cones_orange', 'bibs_yellow', 'bibs_blue', 'stopwatch'])],
    drills: JSON.parse(JSON.stringify(preset.drills)),
    attendance: {},
    debrief: { rating: '', status: 'scheduled', notes: '' }
  };
  populateSessionEditorForm();
  openM('m-session-editor');
}

function editSession(id){
  requestPin('edit_session', id);
}

function doEditSession(id){
  if(isSessionEditorDirty() && !confirm('⚠️ You have unsaved changes in the current session plan.\n\nDiscard and open this session?')) return;
  const s = sessions.find(item => item.id === id);
  if(!s) return;
  currentEditingSession = JSON.parse(JSON.stringify(s));
  populateSessionEditorForm();
  openM('m-session-editor');
}

function duplicateSession(id){
  const s = sessions.find(item => item.id === id);
  if(!s) return;
  const clone = JSON.parse(JSON.stringify(s));
  delete clone.id;
  clone.title = 'Copy of ' + (clone.title || 'Session');
  clone.createdAt = new Date().toISOString();
  clone.updatedAt = new Date().toISOString();
  const dupTeamId = clone.teamId || (currentStudioTeamId && currentStudioTeamId !== 'all' ? currentStudioTeamId : (curTeam ? curTeam.id : (teams[0] ? teams[0].id : '')));
  try {
    addDoc(collection(db, 'sessions'), { ...clone, teamId: dupTeamId });
    alert('✅ Session duplicated successfully!');
  } catch(e){
    alert('❌ Could not duplicate session: ' + (e.message || e));
  }
}

function deleteSession(id){
  requestPin('delete_session', id);
}

async function doDeleteSession(id){
  if(!confirm('Are you sure you want to delete this training session plan?')) return;
  try {
    await deleteDoc(doc(db, 'sessions', id));
    sessions = sessions.filter(s => s.id !== id);
    const delTeamId = (currentStudioTeamId && currentStudioTeamId !== 'all') ? currentStudioTeamId : (curTeam ? curTeam.id : '');
    const cacheKey = delTeamId ? ('fhq_sessions_' + delTeamId) : 'fhq_sessions_all';
    try { localStorage.setItem(cacheKey, JSON.stringify(sessions)); } catch(e){}
    renderSessions();
    alert('✅ Training session deleted.');
  } catch(e){
    alert('❌ Could not delete session: ' + (e.message || e));
  }
}

function populateSessionEditorForm(){
  const s = currentEditingSession;
  if(!s) return;

  $('se-modal-title').textContent = s.id ? '✏️ EDIT TRAINING SESSION' : '📋 PLAN TRAINING SESSION';
  $('se-title').value = s.title || '';
  $('se-date').value = s.date || new Date().toISOString().split('T')[0];
  $('se-time').value = s.time || '17:30';
  $('se-venue').value = s.venue || '';
  $('se-category').value = s.category || 'Tactical';
  $('se-intensity').value = s.intensity || 'Medium';
  $('se-objectives').value = s.objectives || '';
  $('se-rating').value = s.debrief?.rating || '';
  $('se-status').value = s.debrief?.status || 'scheduled';
  $('se-notes').value = s.debrief?.notes || '';

  // Team dropdown in editor
  const teamSelect = $('se-team');
  if(teamSelect){
    let opts = '';
    if(Array.isArray(teams) && teams.length){
      opts = teams.map(t => `<option value="${t.id}"${(s.teamId === t.id) ? ' selected' : ''}>${esc(t.name)}</option>`).join('');
    }
    teamSelect.innerHTML = opts;
    if(!s.teamId && teams.length > 0){
      s.teamId = teams[0].id;
    }
  }

  const activeEditorTeamId = s.teamId || (curTeam ? curTeam.id : (teams[0] ? teams[0].id : ''));
  const activeEditorTeam = Array.isArray(teams) ? teams.find(t => t.id === activeEditorTeamId) : curTeam;

  // Coach dropdown
  const coachSelect = $('se-coach');
  if(coachSelect){
    const staffList = (activeEditorTeam && activeEditorTeam.staff) || [];
    coachSelect.innerHTML = '<option value="">Select Coach</option>' + staffList.map(st => `
      <option value="${esc(st.name)}"${s.coach === st.name ? ' selected' : ''}>${esc(st.name)} (${esc(st.role || 'Staff')})</option>
    `).join('');
  }

  // Update players for attendance
  if(activeEditorTeamId){
    if(Array.isArray(allSystemPlayers) && allSystemPlayers.length){
      players = allSystemPlayers.filter(p => p.teamId === activeEditorTeamId);
    }
  }

  // Equipment Checklist
  renderEquipmentChecklist();

  // Drill Timeline
  renderDrillTimeline();

  // Squad Attendance Roster
  renderSessionAttendance();

  // Capture clean snapshot of initial session state
  initialSessionStateSnapshot = takeSessionStateSnapshot();
}

function renderEquipmentChecklist(){
  const grid = $('se-equip-grid');
  if(!grid) return;
  const currentEquip = currentEditingSession.equipment || [];
  grid.innerHTML = EQUIPMENT_PRESETS.map(eq => {
    const isSelected = currentEquip.includes(eq.id);
    return `
      <div class="sp-equip-chip ${isSelected ? 'selected' : ''}" onclick="toggleEquipment('${eq.id}')">
        <span style="display:inline-flex;align-items:center;gap:6px;">
          ${eq.icon || ''}
          <span>${eq.label}</span>
        </span>
        ${isSelected ? '<span style="font-weight:700;margin-left:4px;">✓</span>' : ''}
      </div>
    `;
  }).join('');
}

function toggleEquipment(id){
  if(!currentEditingSession.equipment) currentEditingSession.equipment = [];
  const idx = currentEditingSession.equipment.indexOf(id);
  if(idx > -1){
    currentEditingSession.equipment.splice(idx, 1);
  } else {
    currentEditingSession.equipment.push(id);
  }
  renderEquipmentChecklist();
}

function renderDrillTimeline(){
  const listEl = $('se-drills-list');
  const drills = currentEditingSession.drills || [];
  const totalMins = drills.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0);

  if($('se-total-mins')) $('se-total-mins').textContent = totalMins + ' mins';
  if($('se-drill-count')) $('se-drill-count').textContent = drills.length + ' Drill Block' + (drills.length === 1 ? '' : 's');

  // Timeline bar
  const barEl = $('se-timeline-bar');
  if(barEl){
    if(!drills.length){
      barEl.innerHTML = '<div style="background:var(--bd);width:100%;height:100%;"></div>';
    } else {
      barEl.innerHTML = drills.map(d => {
        const pct = Math.max(4, Math.round(((parseInt(d.duration) || 15) / Math.max(1, totalMins)) * 100));
        return `<div class="sp-timeline-seg ${getPhaseClass(d.phase)}" style="width:${pct}%;" title="${esc(d.name)} (${d.duration}m)"></div>`;
      }).join('');
    }
  }

  if(!listEl) return;

  if(!drills.length){
    listEl.innerHTML = `<div class="empty" style="padding:20px;"><p>No drill blocks added yet. Click <strong>➕ Add Drill</strong> or choose from the <strong>📚 Library</strong> above.</p></div>`;
    return;
  }

  listEl.innerHTML = drills.map((d, idx) => {
    const cardClass = getPhaseClass(d.phase).replace('phase-', '');
    return `
      <div class="sp-drill-card ${cardClass}">
        <div class="sp-drill-card-head">
          <select style="width:auto;padding:7px 11px;font-size:13px;font-weight:700;" onchange="updateDrillField(${idx}, 'phase', this.value); renderDrillTimeline();">
            <option value="Warm-Up"${d.phase === 'Warm-Up' ? ' selected' : ''}>🟠 Warm-Up</option>
            <option value="Technical"${d.phase === 'Technical' ? ' selected' : ''}>🔵 Technical</option>
            <option value="Tactical"${d.phase === 'Tactical' ? ' selected' : ''}>🟢 Tactical</option>
            <option value="SSG"${d.phase === 'SSG' ? ' selected' : ''}>🟣 Small-Sided Game (SSG)</option>
            <option value="Match Play"${d.phase === 'Match Play' ? ' selected' : ''}>🔴 Match Simulation</option>
            <option value="Cool Down"${d.phase === 'Cool Down' ? ' selected' : ''}>🩵 Cool Down &amp; Debrief</option>
          </select>

          <div style="display:flex;align-items:center;gap:6px;">
            <label style="font-size:11px;color:var(--mt);font-weight:700;margin:0;">MINS:</label>
            <input type="number" min="1" max="180" style="width:70px;padding:7px 10px;font-size:14px;font-weight:700;text-align:center;" value="${d.duration || 15}" oninput="updateDrillField(${idx}, 'duration', parseInt(this.value)||0)" onchange="renderDrillTimeline()">
          </div>

          <div class="sp-drill-card-acts">
            <button class="sp-act-btn" onclick="moveDrillBlock(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:.4"' : ''} title="Move Up">⬆️</button>
            <button class="sp-act-btn" onclick="moveDrillBlock(${idx}, 1)" ${idx === drills.length - 1 ? 'disabled style="opacity:.4"' : ''} title="Move Down">⬇️</button>
            <button class="sp-act-btn" onclick="duplicateDrillBlock(${idx})" title="Duplicate Drill">📋</button>
            <button class="sp-act-btn del" onclick="removeDrillBlock(${idx})" title="Delete Drill">🗑️</button>
          </div>
        </div>

        <div class="field" style="margin-bottom:10px;">
          <input type="text" placeholder="Drill Name (e.g. 5v2 Fast Transition Rondo)" style="font-weight:700;font-size:15px;" value="${esc(d.name || '')}" oninput="updateDrillField(${idx}, 'name', this.value)">
        </div>

        <div class="grid-2" style="margin-bottom:10px;">
          <div class="field" style="margin-bottom:0;">
            <label>Pitch / Grid Dimensions</label>
            <input type="text" placeholder="e.g. 20x20m / Half Pitch" value="${esc(d.dimensions || '')}" oninput="updateDrillField(${idx}, 'dimensions', this.value)">
          </div>
          <div class="field" style="margin-bottom:0;">
            <label>Players / Team Setup</label>
            <input type="text" placeholder="e.g. 6v6 + 2 Neutrals" value="${esc(d.players || '')}" oninput="updateDrillField(${idx}, 'players', this.value)">
          </div>
        </div>

        <div class="field" style="margin-bottom:10px;">
          <label>Setup, Rules &amp; Progression</label>
          <textarea placeholder="Explain how the drill operates, scoring rules, and player rotations…" style="min-height:65px;" oninput="updateDrillField(${idx}, 'description', this.value)">${esc(d.description || '')}</textarea>
        </div>

        <div class="field" style="margin-bottom:10px;">
          <label>Key Coaching Points (Cues)</label>
          <textarea placeholder="• Body shape when receiving&#10;• Accuracy of forward pass&#10;• Counter-pressing intensity" style="min-height:55px;" oninput="updateDrillField(${idx}, 'coachingPoints', this.value)">${esc(d.coachingPoints || '')}</textarea>
        </div>

        <!-- Tactical Pitch Diagram Box -->
        <div class="sp-drill-diagram-box">
          ${d.diagram ? `
            <div class="sp-diagram-thumb-wrap" onclick="openPitchDiagramPopup(${idx})" title="🔍 Click to open Full Demonstration View">
              <img src="${d.diagram}" class="sp-drill-diagram-thumb" alt="Drill Diagram">
              <div class="sp-diagram-thumb-overlay">🔍 Expand</div>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:700;color:var(--tx);display:flex;align-items:center;gap:6px;">
                <span>Tactical Pitch Diagram Attached</span>
                <span class="sp-badge sp-badge-tactical" style="font-size:9.5px;padding:2px 6px;">Ready</span>
              </div>
              <div style="font-size:11px;color:var(--mt);margin-top:2px;">Custom player positions, passes &amp; movement lines.</div>
              <div style="font-size:11px;color:var(--g);font-weight:600;margin-top:4px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;" onclick="openPitchDiagramPopup(${idx})">
                🔍 <u>Click thumbnail to open full demonstration</u>
              </div>
            </div>
            <button class="sp-act-btn" onclick="openPitchDiagramPopup(${idx})">🔍 View Full</button>
            <button class="sp-act-btn" onclick="openDrillBoard(${idx})">✏️ Edit</button>
            <button class="sp-act-btn del" onclick="removeDrillDiagram(${idx})">✕</button>
          ` : `
            <div style="font-size:24px;">🎨</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;color:var(--tx);">No Pitch Diagram</div>
              <div style="font-size:11.5px;color:var(--mt);">Sketch player positions, movement arrows, passes &amp; cones.</div>
            </div>
            <button class="sp-act-btn primary" onclick="openDrillBoard(${idx})">🎨 Draw Pitch Diagram</button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

let currentViewingDrillIdx = null;

function openPitchDiagramPopup(drillIdx){
  currentViewingDrillIdx = drillIdx;
  if(!currentEditingSession || !currentEditingSession.drills || !currentEditingSession.drills[drillIdx]) return;
  const d = currentEditingSession.drills[drillIdx];
  if(!d.diagram) return;

  if($('diag-view-title')) $('diag-view-title').textContent = (d.name || 'Tactical Drill').toUpperCase();
  if($('diag-view-phase')) {
    $('diag-view-phase').textContent = d.phase || 'Tactical';
    $('diag-view-phase').className = `sp-badge ${getPhaseClass(d.phase).replace('phase-', 'sp-badge-')}`;
  }
  if($('diag-view-subtitle')) {
    $('diag-view-subtitle').textContent = `⏱️ ${d.duration || 20} mins ${d.dimensions ? '· 📐 ' + d.dimensions : ''} ${d.players ? '· 👥 ' + d.players : ''}`;
  }
  if($('diag-view-img')) $('diag-view-img').src = d.diagram;

  let notesHtml = '';
  if(d.description) notesHtml += `<div><strong>Setup:</strong> ${esc(d.description)}</div>`;
  if(d.coachingPoints) notesHtml += `<div style="margin-top:4px;color:#1b5e20;"><strong>Coaching Keys:</strong> ${esc(d.coachingPoints)}</div>`;
  if($('diag-view-notes')) $('diag-view-notes').innerHTML = notesHtml || '<div style="color:var(--mt);">No extra setup notes provided.</div>';

  openM('m-drill-diagram-viewer');
}

function editCurrentViewingDiagram(){
  if(currentViewingDrillIdx !== null){
    closeM('m-drill-diagram-viewer');
    openDrillBoard(currentViewingDrillIdx);
  }
}

function updateDrillField(idx, field, value){
  if(currentEditingSession && currentEditingSession.drills && currentEditingSession.drills[idx]){
    currentEditingSession.drills[idx][field] = value;
  }
}

function addDrillBlock(initialDrill){
  if(!currentEditingSession.drills) currentEditingSession.drills = [];
  const newDrill = initialDrill ? JSON.parse(JSON.stringify(initialDrill)) : {
    phase: 'Tactical',
    name: 'New Tactical Exercise',
    duration: 20,
    dimensions: '30x20m Grid',
    players: 'Squad',
    description: '',
    coachingPoints: '',
    diagram: ''
  };
  currentEditingSession.drills.push(newDrill);
  renderDrillTimeline();
}

function removeDrillBlock(idx){
  if(!confirm('Remove this drill block from the session timeline?')) return;
  currentEditingSession.drills.splice(idx, 1);
  renderDrillTimeline();
}

function moveDrillBlock(idx, dir){
  const target = idx + dir;
  if(target < 0 || target >= currentEditingSession.drills.length) return;
  const temp = currentEditingSession.drills[idx];
  currentEditingSession.drills[idx] = currentEditingSession.drills[target];
  currentEditingSession.drills[target] = temp;
  renderDrillTimeline();
}

function duplicateDrillBlock(idx){
  const copy = JSON.parse(JSON.stringify(currentEditingSession.drills[idx]));
  copy.name = copy.name + ' (Variation)';
  currentEditingSession.drills.splice(idx + 1, 0, copy);
  renderDrillTimeline();
}

function removeDrillDiagram(idx){
  if(currentEditingSession.drills[idx]){
    currentEditingSession.drills[idx].diagram = '';
    delete currentEditingSession.drills[idx].boardObjects;
    renderDrillTimeline();
  }
}

/* ==========================================================================
   SQUAD ATTENDANCE ROSTER
   ========================================================================== */

function renderSessionAttendance(){
  const grid = $('se-att-grid');
  if(!grid) return;

  const roster = players || [];
  if(!roster.length){
    grid.innerHTML = `<div style="grid-column:1/-1;padding:16px;text-align:center;color:var(--mt);font-size:13px;">No players registered in the team database yet.</div>`;
    return;
  }

  // Initialize attendance state map
  sessionAttendanceState = currentEditingSession.attendance || {};
  roster.forEach(p => {
    if(!sessionAttendanceState[p.id]){
      sessionAttendanceState[p.id] = 'present';
    }
  });
  currentEditingSession.attendance = sessionAttendanceState;

  updateAttendanceRateHeader();

  grid.innerHTML = roster.map(p => {
    const status = sessionAttendanceState[p.id] || 'present';
    return `
      <div class="sp-att-card" id="att-card-${p.id}">
        <div class="sp-att-pinfo">
          <div class="sp-att-av">
            ${p.photo ? `<img src="${esc(p.photo)}" alt="">` : '👤'}
          </div>
          <div style="min-width:0;">
            <div class="sp-att-name">${esc(p.name)}</div>
            <div class="sp-att-pos">${esc(posCode(p.position))} ${p.jersey ? '#' + p.jersey : ''}</div>
          </div>
        </div>
        <div class="sp-att-pills">
          <button class="sp-att-btn ${status === 'present' ? 'active present' : ''}" onclick="togglePlayerAttendance('${p.id}', 'present')" title="Present">✅</button>
          <button class="sp-att-btn ${status === 'late' ? 'active late' : ''}" onclick="togglePlayerAttendance('${p.id}', 'late')" title="Late">⏰</button>
          <button class="sp-att-btn ${status === 'injured' ? 'active injured' : ''}" onclick="togglePlayerAttendance('${p.id}', 'injured')" title="Injured">🩹</button>
          <button class="sp-att-btn ${status === 'excused' ? 'active excused' : ''}" onclick="togglePlayerAttendance('${p.id}', 'excused')" title="Excused">📝</button>
          <button class="sp-att-btn ${status === 'absent' ? 'active absent' : ''}" onclick="togglePlayerAttendance('${p.id}', 'absent')" title="Absent">❌</button>
        </div>
      </div>
    `;
  }).join('');
}

function togglePlayerAttendance(playerId, status){
  sessionAttendanceState[playerId] = status;
  currentEditingSession.attendance = sessionAttendanceState;
  
  const card = $('att-card-' + playerId);
  if(card){
    card.querySelectorAll('.sp-att-btn').forEach(btn => {
      btn.className = 'sp-att-btn';
    });
    const activeBtn = card.querySelector(`button[title="${status.charAt(0).toUpperCase() + status.slice(1)}"]`);
    if(activeBtn) activeBtn.className = `sp-att-btn active ${status}`;
  }
  updateAttendanceRateHeader();
}

function markAllAttendance(status){
  (players || []).forEach(p => {
    sessionAttendanceState[p.id] = status;
  });
  currentEditingSession.attendance = sessionAttendanceState;
  renderSessionAttendance();
}

function updateAttendanceRateHeader(){
  const vals = Object.values(sessionAttendanceState);
  if(!vals.length) return;
  const pres = vals.filter(v => v === 'present' || v === 'late').length;
  const pct = Math.round((pres / vals.length) * 100);
  if($('se-att-rate')) $('se-att-rate').textContent = `${pres}/${vals.length} (${pct}% Present)`;
}

function filterSessionAttendance(query){
  const q = (query || '').toLowerCase().trim();
  (players || []).forEach(p => {
    const card = $('att-card-' + p.id);
    if(card){
      const match = (p.name || '').toLowerCase().includes(q) || (p.position || '').toLowerCase().includes(q) || String(p.jersey || '').includes(q);
      card.style.display = match ? 'flex' : 'none';
    }
  });
}

/* ==========================================================================
   SAVE SESSION PLAN TO FIRESTORE
   ========================================================================== */

async function saveSessionPlan(){
  const title = $('se-title').value.trim();
  const date = $('se-date').value;
  if(!title){ alert('Please enter a session title or theme.'); return; }
  if(!date){ alert('Please select a date for the training session.'); return; }

  const totalMins = (currentEditingSession.drills || []).reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0) || 90;

  const selectedTeamId = ($('se-team') ? $('se-team').value : '') || currentEditingSession.teamId || (curTeam ? curTeam.id : (teams[0] ? teams[0].id : ''));

  const sessionData = {
    teamId: selectedTeamId,
    title,
    date,
    time: $('se-time').value || '17:30',
    venue: $('se-venue').value.trim(),
    category: $('se-category').value,
    intensity: $('se-intensity').value,
    coach: $('se-coach').value,
    duration: totalMins,
    objectives: $('se-objectives').value.trim(),
    equipment: currentEditingSession.equipment || [],
    drills: currentEditingSession.drills || [],
    attendance: sessionAttendanceState,
    debrief: {
      rating: $('se-rating').value,
      status: $('se-status').value,
      notes: $('se-notes').value.trim()
    },
    updatedAt: new Date().toISOString()
  };

  const saveBtn = $('se-save-btn');
  if(saveBtn){ saveBtn.textContent = 'SAVING…'; saveBtn.disabled = true; }

  try {
    if(currentEditingSession.id){
      await updateDoc(doc(db, 'sessions', currentEditingSession.id), sessionData);
      const idx = sessions.findIndex(s => s.id === currentEditingSession.id);
      if(idx > -1) sessions[idx] = { id: currentEditingSession.id, ...sessionData };
    } else {
      sessionData.createdAt = new Date().toISOString();
      const newRef = await addDoc(collection(db, 'sessions'), sessionData);
      sessionData.id = newRef.id;
      if(!sessions.some(s => s.id === sessionData.id)){
        sessions.unshift(sessionData);
      }
    }
    const cacheKey = selectedTeamId ? ('fhq_sessions_' + selectedTeamId) : 'fhq_sessions_all';
    try { localStorage.setItem(cacheKey, JSON.stringify(sessions)); } catch(e){}
    initialSessionStateSnapshot = null;
    currentEditingSession = null;
    closeM('m-session-editor');
    renderSessions();
    alert('✅ Training session saved successfully!');
  } catch(e){
    alert('❌ Could not save session plan: ' + (e.message || e));
  } finally {
    if(saveBtn){ saveBtn.textContent = '💾 SAVE SESSION'; saveBtn.disabled = false; }
  }
}

/* ==========================================================================
   INTERACTIVE CANVAS PITCH TACTICAL SKETCHER
   ========================================================================== */

let currentCursorCoords = null;
let currentGoalRotation = 0;
let isRulerEnabled = true;
let isDistancingActive = true;
let currentEquipmentSequenceId = 1;
let isDraggingObject = false;
let draggedObjectIndex = -1;
let dragOffset = { x: 0, y: 0 };
let hasMovedWhileDragging = false;

const ALL_BOARD_TOOLS = [
  'select',
  'red', 'black', 'blue', 'yellow', 'green', 'gk', 'ball',
  'cone_yellow', 'cone_red', 'marker_yellow', 'marker_red',
  'mannequin', 'hurdle', 'ladder', 'pole', 'goal',
  'pass', 'lob', 'run', 'dribble', 'zone', 'ruler', 'eraser'
];

function toggleRulerMeasurement(){
  isRulerEnabled = !isRulerEnabled;
  const btn = $('btn-toggle-ruler');
  const txt = $('ruler-toggle-status');
  if(btn && txt){
    if(isRulerEnabled){
      btn.classList.add('active');
      btn.style.background = '#1b5e20';
      btn.style.color = '#ffffff';
      btn.style.borderColor = '#43a047';
      txt.textContent = 'ON';
    } else {
      btn.classList.remove('active');
      btn.style.background = '#fff';
      btn.style.color = 'var(--tx)';
      btn.style.borderColor = 'var(--bd)';
      txt.textContent = 'OFF';
    }
  }
  redrawCanvas();
}

function getPixelsPerYard(pitchType){
  const t = pitchType || boardPitchType || 'half';
  switch(t){
    case 'half': return 8.0;              // 440px / 55 yds
    case 'half_horizontal': return 10.0;  // 550px / 55 yds
    case 'full': return 6.38;             // 670px / 105 yds
    case 'box': return 12.0;              // 420px / 35 yds
    case 'grid': return 12.0;             // 540px / 45 yds
    case 'plain': return 12.4;            // 620px / 50 yds
    default: return 8.0;
  }
}

function pxToYds(px, pitchType){
  const scale = getPixelsPerYard(pitchType);
  return Math.max(1, Math.round(px / scale));
}

function openDrillBoard(drillIdx){
  currentEditingDrillIndex = drillIdx;
  const drill = currentEditingSession.drills[drillIdx];
  boardObjects = drill && drill.boardObjects ? JSON.parse(JSON.stringify(drill.boardObjects)) : [];
  initialDrillBoardSnapshot = JSON.stringify(boardObjects);
  boardHistory = [];
  currentBoardTool = 'red';
  currentEquipmentSequenceId = 1;
  isDistancingActive = true;
  isDraggingObject = false;
  draggedObjectIndex = -1;
  boardPitchType = (drill && drill.pitchType) || 'half';
  if($('board-pitch-type')) $('board-pitch-type').value = boardPitchType;
  setBoardTool('red');

  openM('m-drill-board');
  setTimeout(() => {
    initCanvasPitch();
    redrawCanvas();
  }, 100);
}

function setBoardTool(tool){
  if(tool !== currentBoardTool){
    currentEquipmentSequenceId++;
  }
  currentBoardTool = tool;
  isDistancingActive = true;
  ALL_BOARD_TOOLS.forEach(t => {
    const btn = $('tool-' + t);
    if(btn) btn.classList.toggle('active', t === tool);
  });
  // Handle legacy cone button alias if present
  const legacyCone = $('tool-cone');
  if(legacyCone) legacyCone.classList.toggle('active', tool === 'cone_red' || tool === 'cone');

  const canvas = $('sp-canvas');
  if(canvas){
    if(tool === 'select') canvas.style.cursor = 'grab';
    else if(tool === 'eraser' || tool === 'ruler') canvas.style.cursor = 'crosshair';
    else canvas.style.cursor = 'default';
  }
  redrawCanvas();
}

function changePitchBackground(type){
  boardPitchType = type;
  redrawCanvas();
}

function getGoalControlLayout(goalObj){
  const scale = goalObj.scale || 1.0;
  const gd = 24 * scale;
  const pillDist = Math.max(gd + 16, 28);
  const cx = goalObj.x;
  // If too close to top of canvas, flip controls pill below the goal
  const cy = (goalObj.y - pillDist < 26) ? (goalObj.y + pillDist) : (goalObj.y - pillDist);
  return {
    cx,
    cy,
    minus: { x: cx - 26, y: cy, r: 10 },
    rotate: { x: cx, y: cy, r: 10 },
    plus: { x: cx + 26, y: cy, r: 10 }
  };
}

function findGoalControlButtonAtCoords(x, y){
  if(currentBoardTool !== 'goal') return null;
  for(let i = boardObjects.length - 1; i >= 0; i--){
    const o = boardObjects[i];
    if(o.type === 'token' && o.tool === 'goal'){
      const ctrl = getGoalControlLayout(o);
      if(Math.hypot(x - ctrl.minus.x, y - ctrl.minus.y) <= 12) return { goalIndex: i, action: 'minus' };
      if(Math.hypot(x - ctrl.rotate.x, y - ctrl.rotate.y) <= 12) return { goalIndex: i, action: 'rotate' };
      if(Math.hypot(x - ctrl.plus.x, y - ctrl.plus.y) <= 12) return { goalIndex: i, action: 'plus' };
    }
  }
  return null;
}

function findObjectAtCoords(x, y, filterTool = null){
  for(let i = boardObjects.length - 1; i >= 0; i--){
    const o = boardObjects[i];
    if(o.type === 'token'){
      // If a specific filterTool is provided (not 'select' and not 'eraser'), only match objects of that exact tool
      if(filterTool && filterTool !== 'select' && filterTool !== 'eraser'){
        const isMatchingTool = (o.tool === filterTool) || (filterTool === 'cone_red' && o.tool === 'cone') || (filterTool === 'cone' && o.tool === 'cone_red');
        if(!isMatchingTool) continue;
      }

      let r = 18;
      if(o.tool === 'goal') r = Math.max(34, 38 * (o.scale || 1.0));
      else if(o.tool === 'ladder') r = 32;
      else if(o.tool === 'mannequin' || o.tool === 'hurdle') r = 22;
      else if(o.tool === 'cone_yellow' || o.tool === 'cone_red' || o.tool === 'cone') r = 16;
      else if(o.tool === 'marker_yellow' || o.tool === 'marker_red') r = 14;
      else if(o.tool === 'pole') r = 16;
      else if(o.tool === 'ball') r = 14;
      if(Math.hypot(x - o.x, y - o.y) <= r) return i;
    } else if(o.type === 'line'){
      // When a token tool is active, lines and zones must NEVER intercept or block token placement!
      if(filterTool && filterTool !== 'select' && filterTool !== 'eraser' && filterTool !== o.tool){
        continue;
      }

      if(o.tool === 'zone'){
        // For zones, check if clicking directly on the perimeter border line (within 12px)
        const rx = Math.min(o.x1, o.x2);
        const ry = Math.min(o.y1, o.y2);
        const rw = Math.abs(o.x2 - o.x1);
        const rh = Math.abs(o.y2 - o.y1);
        const topDist = Math.abs(y - ry);
        const bottomDist = Math.abs(y - (ry + rh));
        const leftDist = Math.abs(x - rx);
        const rightDist = Math.abs(x - (rx + rw));
        const inXBounds = (x >= rx - 8) && (x <= rx + rw + 8);
        const inYBounds = (y >= ry - 8) && (y <= ry + rh + 8);
        const onEdge = (inXBounds && (topDist <= 12 || bottomDist <= 12)) || (inYBounds && (leftDist <= 12 || rightDist <= 12));
        if(onEdge) return i;
      } else {
        const dist = distToSegment({x, y}, {x: o.x1, y: o.y1}, {x: o.x2, y: o.y2});
        if(dist <= 15) return i;
      }
    }
  }
  return -1;
}

function distToSegment(p, v, w) {
  const l2 = (v.x - w.x)*(v.x - w.x) + (v.y - w.y)*(v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function drawYardBadge(ctx, x, y, text, textColor = '#ffffff', bgColor = 'rgba(10, 30, 20, 0.92)'){
  ctx.save();
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textWidth = ctx.measureText(text).width;
  const paddingX = 7;
  const bw = textWidth + paddingX * 2;
  const bh = 18;
  const bx = x - bw / 2;
  const by = y - bh / 2;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawAlignedSegmentYardBadge(ctx, x1, y1, x2, y2, text, offsetDistance = 16, textColor = '#ffffff', bgColor = 'rgba(10, 30, 20, 0.94)'){
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if(dist < 5) return;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Calculate segment angle
  const angle = Math.atan2(dy, dx);

  // Normalize angle so text is never upside down (always readable between -90 and +90 degrees)
  let textAngle = angle;
  if(textAngle > Math.PI / 2){
    textAngle -= Math.PI;
  } else if(textAngle < -Math.PI / 2){
    textAngle += Math.PI;
  }

  // Perpendicular normal to place the badge OUTSIDE the line
  const nx = -Math.sin(textAngle);
  const ny = Math.cos(textAngle);

  // Offset distance outside the line (placed above or to the side)
  let effectiveOffset = -Math.abs(offsetDistance);
  const targetY = midY + ny * effectiveOffset;
  if(targetY < 18){
    effectiveOffset = Math.abs(offsetDistance);
  }

  const badgeX = midX + nx * effectiveOffset;
  const badgeY = midY + ny * effectiveOffset;

  ctx.save();
  ctx.translate(badgeX, badgeY);
  ctx.rotate(textAngle);

  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textWidth = ctx.measureText(text).width;
  const paddingX = 7;
  const bw = textWidth + paddingX * 2;
  const bh = 18;
  const bx = -bw / 2;
  const by = -bh / 2;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

function drawPitchScaleBar(ctx, w, h, pitchType){
  if(!isRulerEnabled) return;
  ctx.save();
  const scaleBarYards = (pitchType === 'full' || pitchType === 'half' || pitchType === 'half_horizontal') ? 20 : 10;
  const barLengthPx = scaleBarYards * getPixelsPerYard(pitchType);
  const startX = 32;
  const startY = h - 14;
  const endX = startX + barLengthPx;

  // Scale line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, startY);
  // Start tick
  ctx.moveTo(startX, startY - 4);
  ctx.lineTo(startX, startY + 4);
  // Mid tick
  const midX = startX + barLengthPx / 2;
  ctx.moveTo(midX, startY - 3);
  ctx.lineTo(midX, startY + 3);
  // End tick
  ctx.moveTo(endX, startY - 4);
  ctx.lineTo(endX, startY + 4);
  ctx.stroke();

  // Scale Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`📏 SCALE: 0`, startX - 2, startY - 6);
  ctx.textAlign = 'right';
  ctx.fillText(`${scaleBarYards} yds`, endX + 4, startY - 6);

  ctx.restore();
}

function initCanvasPitch(){
  const canvas = $('sp-canvas');
  if(!canvas) return;

  const getCanvasCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Double Click: Completes and seals the current cone/equipment formation
  canvas.ondblclick = (e) => {
    isDistancingActive = false;
    currentEquipmentSequenceId++;
    redrawCanvas();
  };

  canvas.onpointerdown = (e) => {
    const coords = getCanvasCoords(e);

    // 1. Check if clicking on on-object goal control buttons [-] [⟳] [+]
    const goalCtrl = findGoalControlButtonAtCoords(coords.x, coords.y);
    if(goalCtrl){
      boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
      const goalObj = boardObjects[goalCtrl.goalIndex];
      if(goalCtrl.action === 'minus'){
        goalObj.scale = Math.max(0.5, Math.round(((goalObj.scale || 1.0) - 0.2) * 100) / 100);
      } else if(goalCtrl.action === 'plus'){
        goalObj.scale = Math.min(2.5, Math.round(((goalObj.scale || 1.0) + 0.2) * 100) / 100);
      } else if(goalCtrl.action === 'rotate'){
        goalObj.rotation = ((goalObj.rotation || 0) + 90) % 360;
      }
      redrawCanvas();
      return;
    }

    // 2. Eraser tool
    if(currentBoardTool === 'eraser'){
      const hitIdx = findObjectAtCoords(coords.x, coords.y, 'eraser');
      if(hitIdx > -1){
        boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
        boardObjects.splice(hitIdx, 1);
        redrawCanvas();
      }
      return;
    }

    // 3. Move Tool ('select'): Allows dragging ANY object on the pitch
    if(currentBoardTool === 'select'){
      const hitIdx = findObjectAtCoords(coords.x, coords.y, 'select');
      if(hitIdx > -1){
        isDraggingObject = true;
        draggedObjectIndex = hitIdx;
        hasMovedWhileDragging = false;
        const targetObj = boardObjects[hitIdx];
        dragOffset = {
          x: coords.x - (targetObj.x || targetObj.x1 || 0),
          y: coords.y - (targetObj.y || targetObj.y1 || 0)
        };
        if(canvas) canvas.style.cursor = 'grabbing';
        return;
      }
    }

    // 4. If a specific token tool is selected (e.g. cone_yellow, ball, red player), check if clicking on an existing object of THAT SAME TOOL to move it
    const sameToolHitIdx = findObjectAtCoords(coords.x, coords.y, currentBoardTool);
    if(sameToolHitIdx > -1){
      isDraggingObject = true;
      draggedObjectIndex = sameToolHitIdx;
      hasMovedWhileDragging = false;
      const targetObj = boardObjects[sameToolHitIdx];
      dragOffset = {
        x: coords.x - (targetObj.x || targetObj.x1 || 0),
        y: coords.y - (targetObj.y || targetObj.y1 || 0)
      };
      if(canvas) canvas.style.cursor = 'grabbing';
      return;
    }

    // 5. Line & Drawing Tools
    const isLineTool = ['pass', 'lob', 'run', 'dribble', 'zone', 'ruler'].includes(currentBoardTool);

    if(isLineTool){
      isDrawingLine = true;
      lineStart = coords;
    } else if(currentBoardTool !== 'select'){
      // Place Token or Equipment (Freely inside or outside zones!)
      if(!isDistancingActive){
        isDistancingActive = true;
        currentEquipmentSequenceId++;
      }

      // Place Token or Equipment
      boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
      const newObj = {
        type: 'token',
        tool: currentBoardTool,
        x: coords.x,
        y: coords.y,
        rotation: currentBoardTool === 'goal' ? currentGoalRotation : 0,
        scale: 1.0,
        label: getTokenDefaultLabel(currentBoardTool),
        showMeasurement: Boolean(isRulerEnabled),
        sequenceId: currentEquipmentSequenceId
      };
      boardObjects.push(newObj);

      redrawCanvas();
    }
  };

  canvas.onpointermove = (e) => {
    const coords = getCanvasCoords(e);
    currentCursorCoords = coords;

    // Handle Active Object Dragging
    if(isDraggingObject && draggedObjectIndex > -1 && boardObjects[draggedObjectIndex]){
      hasMovedWhileDragging = true;
      const obj = boardObjects[draggedObjectIndex];
      if(obj.type === 'token'){
        obj.x = Math.max(15, Math.min(canvas.width - 15, coords.x - dragOffset.x));
        obj.y = Math.max(15, Math.min(canvas.height - 15, coords.y - dragOffset.y));
      }
      redrawCanvas();
      return;
    }

    if(isDrawingLine && lineStart){
      redrawCanvas();
      // Preview line being drawn
      drawSingleObject({
        type: 'line',
        tool: currentBoardTool,
        x1: lineStart.x,
        y1: lineStart.y,
        x2: coords.x,
        y2: coords.y,
        showMeasurement: (currentBoardTool === 'ruler') ? true : Boolean(isRulerEnabled)
      }, true);
    } else {
      redrawCanvas();
    }
  };

  canvas.onpointerleave = () => {
    currentCursorCoords = null;
    if(isDraggingObject){
      isDraggingObject = false;
      draggedObjectIndex = -1;
    }
    redrawCanvas();
  };

  canvas.onpointerup = (e) => {
    if(isDraggingObject){
      // If user merely clicked on a 3D goal without dragging, rotate it by 90 degrees
      if(!hasMovedWhileDragging && draggedObjectIndex > -1 && boardObjects[draggedObjectIndex]){
        const obj = boardObjects[draggedObjectIndex];
        if(obj.tool === 'goal'){
          boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
          obj.rotation = ((obj.rotation || 0) + 90) % 360;
        }
      }
      isDraggingObject = false;
      draggedObjectIndex = -1;
      if(canvas) canvas.style.cursor = currentBoardTool === 'select' ? 'grab' : 'default';
      redrawCanvas();
      return;
    }

    if(!isDrawingLine || !lineStart) return;
    const coords = getCanvasCoords(e);
    const dist = Math.hypot(coords.x - lineStart.x, coords.y - lineStart.y);
    if(dist > 8){
      boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
      boardObjects.push({
        type: 'line',
        tool: currentBoardTool,
        x1: lineStart.x,
        y1: lineStart.y,
        x2: coords.x,
        y2: coords.y,
        showMeasurement: (currentBoardTool === 'ruler') ? true : Boolean(isRulerEnabled)
      });
    }
    isDrawingLine = false;
    lineStart = null;
    redrawCanvas();
  };
}

function getTokenDefaultLabel(tool){
  if(tool === 'gk') return 'GK';
  if(tool === 'red' || tool === 'black' || tool === 'blue' || tool === 'yellow' || tool === 'green'){
    const count = boardObjects.filter(o => o.tool === tool).length + 1;
    return String(count);
  }
  return '';
}

function undoBoard(){
  if(boardHistory.length){
    boardObjects = boardHistory.pop();
    redrawCanvas();
  } else if(boardObjects.length){
    boardObjects.pop();
    redrawCanvas();
  }
}

function clearBoardCanvas(){
  if(!confirm('Clear all tactical markings from this pitch sketch?')) return;
  boardHistory.push(JSON.parse(JSON.stringify(boardObjects)));
  boardObjects = [];
  redrawCanvas();
}

function redrawCanvas(){
  const canvas = $('sp-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // 1. Draw Pitch Background
  drawFootballPitchBackground(ctx, w, h, boardPitchType);

  // 2. Draw Distance Lines between placed Cones/Equipment of the same sequence and same color/type
  drawSameEquipmentDistances(ctx);

  // 3. Draw all tactical objects
  boardObjects.forEach(obj => drawSingleObject(obj, false));

  // 4. Draw Pitch Scale Bar
  drawPitchScaleBar(ctx, w, h, boardPitchType);

  // 5. Live Distance Guide when placing equipment (Specific 1-to-1 distance from the last placed pointer in active sequence)
  const eqTools = ['ball', 'cone_yellow', 'cone_red', 'cone', 'marker_yellow', 'marker_red', 'mannequin', 'hurdle', 'ladder', 'pole'];
  if(currentCursorCoords && eqTools.includes(currentBoardTool) && !isDraggingObject){
    drawLiveEquipmentPlacementGuide(ctx, currentCursorCoords, currentBoardTool);
  }
}

// Automatically connects and displays distances between placed equipment of the SAME sequence and SAME color/type
function drawSameEquipmentDistances(ctx){
  const eqKeys = ['cone_yellow', 'cone_red', 'cone', 'marker_yellow', 'marker_red', 'hurdle', 'ladder', 'pole', 'mannequin'];

  eqKeys.forEach(k => {
    const allOfTool = boardObjects.filter(o => o.type === 'token' && (o.tool === k || (k === 'cone_red' && o.tool === 'cone')));
    // Group by sequenceId
    const groups = {};
    allOfTool.forEach(o => {
      const sId = o.sequenceId || 1;
      if(!groups[sId]) groups[sId] = [];
      groups[sId].push(o);
    });

    Object.values(groups).forEach(list => {
      if(list.length >= 2){
        ctx.save();
        for(let i = 0; i < list.length - 1; i++){
          const p1 = list[i];
          const p2 = list[i + 1];
          // Only display measurement line if p2 was placed with ruler ON
          if(p2.showMeasurement === true){
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            if(dist >= 8){
              // Clean white dashed line between laid cones of the SAME sequence
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.8;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              ctx.setLineDash([]);

              // White anchor dots
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
              ctx.arc(p2.x, p2.y, 3, 0, Math.PI * 2);
              ctx.fill();

              // Whole-number yard badge placed on the side outside the line
              const yds = pxToYds(dist, boardPitchType);
              drawAlignedSegmentYardBadge(ctx, p1.x, p1.y, p2.x, p2.y, `${yds} yds`, 16, '#ffffff', 'rgba(10, 30, 20, 0.94)');
            }
          }
        }
        ctx.restore();
      }
    });
  });
}

// Live placement guide: Specifically measures distance 1-to-1 from the LAST placed pointer in the ACTIVE sequence
function drawLiveEquipmentPlacementGuide(ctx, cursor, tool){
  if(isRulerEnabled && isDistancingActive){
    // Filter placed items of the exact same tool/color in the CURRENT ACTIVE SEQUENCE
    const currentSeqItems = boardObjects.filter(o => 
      o.type === 'token' && 
      (o.tool === tool || (tool === 'cone_red' && o.tool === 'cone')) && 
      (o.sequenceId === currentEquipmentSequenceId)
    );

    if(currentSeqItems.length > 0){
      // Specifically measure 1-to-1 from the LAST placed pointer of this current formation
      const lastPoint = currentSeqItems[currentSeqItems.length - 1];
      const dist = Math.hypot(cursor.x - lastPoint.x, cursor.y - lastPoint.y);

      if(dist >= 8 && dist <= 650){
        ctx.save();
        const yds = pxToYds(dist, boardPitchType);

        // Clean pure white dashed connection line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small white end anchor dots
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 3.5, 0, Math.PI * 2);
        ctx.arc(cursor.x, cursor.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Measurement Badge positioned outside along the side of the line
        drawAlignedSegmentYardBadge(ctx, lastPoint.x, lastPoint.y, cursor.x, cursor.y, `${yds} yds`, 16, '#ffffff', 'rgba(10, 30, 20, 0.94)');

        ctx.restore();
      }
    }
  }

  // Draw placement ghost
  ctx.save();
  ctx.globalAlpha = 0.55;
  drawSingleObject({
    type: 'token',
    tool: tool,
    x: cursor.x,
    y: cursor.y,
    rotation: tool === 'goal' ? currentGoalRotation : 0,
    scale: 1.0,
    label: '',
    showMeasurement: false
  }, true);
  ctx.restore();
}

function drawFootballPitchBackground(ctx, w, h, type){
  // 1. Grass Base with textured lush look
  ctx.fillStyle = '#164327';
  ctx.fillRect(0, 0, w, h);

  // Alternating lawn grass stripes
  ctx.fillStyle = '#1a4e2e';
  const stripeCount = 10;
  const stripeWidth = w / stripeCount;
  for(let i = 0; i < stripeCount; i += 2){
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, h);
  }

  // Pitch Lines Default Style
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.setLineDash([]);

  // Helper for drawing 3D goal posts with net
  const drawGoal = (x, y, gw, gh, direction) => {
    ctx.save();
    // Net depth backing
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(x, y, gw, gh);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1;
    // Net grid lines
    if(gw > gh){
      for(let gx = x + 10; gx < x + gw; gx += 10){
        ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + gh); ctx.stroke();
      }
      for(let gy = y + 8; gy < y + gh; gy += 8){
        ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + gw, gy); ctx.stroke();
      }
    } else {
      for(let gx = x + 8; gx < x + gw; gx += 8){
        ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + gh); ctx.stroke();
      }
      for(let gy = y + 10; gy < y + gh; gy += 10){
        ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + gw, gy); ctx.stroke();
      }
    }
    // Solid goal frame
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(x, y, gw, gh);

    // Goal Post White Cylinders
    ctx.fillStyle = '#ffffff';
    if(direction === 'top' || direction === 'bottom'){
      const lineY = direction === 'top' ? (y + gh) : y;
      ctx.beginPath(); ctx.arc(x, lineY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + gw, lineY, 4, 0, Math.PI * 2); ctx.fill();
    } else {
      const lineX = direction === 'left' ? (x + gw) : x;
      ctx.beginPath(); ctx.arc(lineX, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(lineX, y + gh, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  // Helper for corner arcs
  const drawCornerArc = (cx, cy, startAngle, endAngle, radius = 18) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();
  };

  // 1. PLAIN PITCH
  if(type === 'plain'){
    const pw = 640, ph = 440;
    const px = (w - pw) / 2, py = (h - ph) / 2;
    ctx.strokeRect(px, py, pw, ph);
    drawGoal(px - 26, h / 2 - 45, 26, 90, 'left');
    drawGoal(px + pw, h / 2 - 45, 26, 90, 'right');
    return;
  }

  // 2. TRAINING GRID (3x3)
  if(type === 'grid'){
    const pw = 540, ph = 440;
    const px = (w - pw) / 2, py = (h - ph) / 2;
    ctx.strokeRect(px, py, pw, ph);

    drawGoal(w / 2 - 45, py - 22, 90, 22, 'top');
    drawGoal(w / 2 - 45, py + ph, 90, 22, 'bottom');

    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2;
    for(let i = 1; i <= 2; i++){
      ctx.beginPath();
      ctx.moveTo(px + (pw / 3) * i, py);
      ctx.lineTo(px + (pw / 3) * i, py + ph);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px, py + (ph / 3) * i);
      ctx.lineTo(px + pw, py + (ph / 3) * i);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw corner markers
    ctx.fillStyle = '#ff7043';
    [
      [px, py], [px + pw / 3, py], [px + (pw / 3) * 2, py], [px + pw, py],
      [px, py + ph / 3], [px + pw, py + ph / 3],
      [px, py + (ph / 3) * 2], [px + pw, py + (ph / 3) * 2],
      [px, py + ph], [px + pw / 3, py + ph], [px + (pw / 3) * 2, py + ph], [px + pw, py + ph]
    ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    return;
  }

  // 3. FULL PITCH (Horizontal 11v11)
  if(type === 'full'){
    const pw = 670, ph = 435;
    const px = (w - pw) / 2, py = (h - ph) / 2;
    ctx.strokeRect(px, py, pw, ph);

    // Halfway Line & Center Circle
    ctx.beginPath();
    ctx.moveTo(w / 2, py);
    ctx.lineTo(w / 2, py + ph);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 64, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Corner Arcs
    drawCornerArc(px, py, 0, Math.PI / 2, 16);
    drawCornerArc(px + pw, py, Math.PI / 2, Math.PI, 16);
    drawCornerArc(px + pw, py + ph, Math.PI, Math.PI * 1.5, 16);
    drawCornerArc(px, py + ph, Math.PI * 1.5, Math.PI * 2, 16);

    // Left Goal & Boxes
    const boxW = 115, boxH = 280;
    ctx.strokeRect(px, h / 2 - boxH / 2, boxW, boxH);

    const sBoxW = 38, sBoxH = 128;
    ctx.strokeRect(px, h / 2 - sBoxH / 2, sBoxW, sBoxH);

    const pSpotX_L = px + 76;
    ctx.beginPath();
    ctx.arc(pSpotX_L, h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const distL = (px + boxW) - pSpotX_L;
    const arcRL = 55;
    const thetaL = Math.acos(Math.min(0.99, distL / arcRL));
    ctx.beginPath();
    ctx.arc(pSpotX_L, h / 2, arcRL, -thetaL, thetaL);
    ctx.stroke();

    drawGoal(px - 28, h / 2 - 45, 28, 90, 'left');

    // Right Goal & Boxes
    ctx.strokeRect(px + pw - boxW, h / 2 - boxH / 2, boxW, boxH);
    ctx.strokeRect(px + pw - sBoxW, h / 2 - sBoxH / 2, sBoxW, sBoxH);

    const pSpotX_R = px + pw - 76;
    ctx.beginPath();
    ctx.arc(pSpotX_R, h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const distR = pSpotX_R - (px + pw - boxW);
    const arcRR = 55;
    const thetaR = Math.acos(Math.min(0.99, distR / arcRR));
    ctx.beginPath();
    ctx.arc(pSpotX_R, h / 2, arcRR, Math.PI - thetaR, Math.PI + thetaR);
    ctx.stroke();

    drawGoal(px + pw, h / 2 - 45, 28, 90, 'right');
    return;
  }

  // 4. HALF PITCH (Horizontal)
  if(type === 'half_horizontal'){
    const pw = 550, ph = 440;
    const px = (w - pw) / 2, py = (h - ph) / 2;
    ctx.strokeRect(px, py, pw, ph);

    drawCornerArc(px, py, 0, Math.PI / 2, 20);
    drawCornerArc(px, py + ph, Math.PI * 1.5, Math.PI * 2, 20);

    // Goal on Left Goal Line (Fully visible inside canvas)
    drawGoal(px - 30, h / 2 - 65, 30, 130, 'left');

    // 18-yard box & 6-yard box
    const hBoxW = 180, hBoxH = 284;
    ctx.strokeRect(px, h / 2 - hBoxH / 2, hBoxW, hBoxH);

    const hsBoxW = 60, hsBoxH = 130;
    ctx.strokeRect(px, h / 2 - hsBoxH / 2, hsBoxW, hsBoxH);

    // Penalty Spot & D-Arc
    const hSpotX = px + 120;
    ctx.beginPath();
    ctx.arc(hSpotX, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    const distH = (px + hBoxW) - hSpotX;
    const arcRH = 80;
    const thetaH = Math.acos(Math.min(0.99, distH / arcRH));
    ctx.beginPath();
    ctx.arc(hSpotX, h / 2, arcRH, -thetaH, thetaH);
    ctx.stroke();

    // Halfway Line & Center Circle Arc on Right
    ctx.beginPath();
    ctx.arc(px + pw, h / 2, 80, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px + pw, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.setLineDash([5, 8]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    [py + ph * 0.18, py + ph * 0.38, py + ph * 0.62, py + ph * 0.82].forEach(gy => {
      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();
    });
    ctx.setLineDash([]);
    return;
  }

  // 5. PENALTY BOX AREA (Final Third Focus)
  if(type === 'box'){
    const pw = 620, ph = 420;
    const px = (w - pw) / 2, py = 40;
    ctx.strokeRect(px, py, pw, ph);

    // Goal at Bottom (Fully visible inside canvas)
    drawGoal(w / 2 - 75, py + ph, 150, 35, 'bottom');

    const boxW = 400, boxH = 216;
    const boxX = w / 2 - boxW / 2;
    const boxY = py + ph - boxH;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const sBoxW = 182, sBoxH = 72;
    ctx.strokeRect(w / 2 - sBoxW / 2, py + ph - sBoxH, sBoxW, sBoxH);

    const spotY = py + ph - 144;
    ctx.beginPath();
    ctx.arc(w / 2, spotY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    const distBox = spotY - boxY;
    const arcRBox = 96;
    const thetaBox = Math.acos(Math.min(0.99, distBox / arcRBox));
    ctx.beginPath();
    ctx.arc(w / 2, spotY, arcRBox, Math.PI * 1.5 - thetaBox, Math.PI * 1.5 + thetaBox);
    ctx.stroke();

    drawCornerArc(px, py + ph, Math.PI, Math.PI * 1.5, 24);
    drawCornerArc(px + pw, py + ph, Math.PI * 1.5, Math.PI * 2, 24);

    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath(); ctx.moveTo(boxX, py); ctx.lineTo(boxX, boxY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(boxX + boxW, py); ctx.lineTo(boxX + boxW, boxY); ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  // 6. HALF PITCH (Vertical - FIFA / FA PROPORTIONS DEFINITION)
  const pw = 560, ph = 405;
  const px = (w - pw) / 2, py = 54;
  ctx.strokeRect(px, py, pw, ph);

  // Goal at Top (Solid white posts and net extending upwards)
  drawGoal(w / 2 - 45, py - 32, 90, 32, 'top');

  // Corner Arcs (1 yard)
  drawCornerArc(px, py, 0, Math.PI / 2, 16);
  drawCornerArc(px + pw, py, Math.PI / 2, Math.PI, 16);

  // 18-yard Penalty Box (44 yds wide x 18 yds deep)
  const vBoxW = 360, vBoxH = 135;
  const vBoxX = w / 2 - vBoxW / 2;
  ctx.strokeRect(vBoxX, py, vBoxW, vBoxH);

  // 6-yard Goal Area (20 yds wide x 6 yds deep)
  const vsBoxW = 160, vsBoxH = 45;
  ctx.strokeRect(w / 2 - vsBoxW / 2, py, vsBoxW, vsBoxH);

  // Penalty Spot (12 yds from goal line)
  const vSpotY = py + 90;
  ctx.beginPath();
  ctx.arc(w / 2, vSpotY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Penalty D-Arc (10 yds radius)
  const distV = (py + vBoxH) - vSpotY;
  const arcRV = 75;
  const thetaV = Math.acos(Math.min(0.99, distV / arcRV));
  ctx.beginPath();
  ctx.arc(w / 2, vSpotY, arcRV, Math.PI / 2 - thetaV, Math.PI / 2 + thetaV);
  ctx.stroke();

  // Halfway Line & Center Circle Arc at Bottom
  ctx.beginPath();
  ctx.arc(w / 2, py + ph, 75, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w / 2, py + ph, 4, 0, Math.PI * 2);
  ctx.fill();

  // Mown grass vertical contrast bands
  ctx.setLineDash([5, 8]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  [px + pw * 0.18, px + pw * 0.38, px + pw * 0.62, px + pw * 0.82].forEach(gx => {
    ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();
  });
  ctx.setLineDash([]);
}

function drawZigzagArrow(ctx, x1, y1, x2, y2, color = '#ff9800'){
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if(dist < 5) return;

  const angle = Math.atan2(dy, dx);
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;

  const headLen = 12;
  const arrowBaseDist = Math.max(0, dist - headLen);
  const baseX = x1 + ux * arrowBaseDist;
  const baseY = y1 + uy * arrowBaseDist;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 3;
  ctx.lineCap = 'round';

  if(arrowBaseDist < 10){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(baseX, baseY);
    ctx.stroke();
  } else {
    const wavelength = 14;
    const numCycles = Math.max(1, Math.round(arrowBaseDist / wavelength));
    const numSteps = numCycles * 4;
    const stepLen = arrowBaseDist / numSteps;
    const amp = 5.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);

    for(let k = 1; k <= numSteps; k++){
      const t = k * stepLen;
      let offset = 0;
      const mod = k % 4;
      if(mod === 1) offset = amp;
      else if(mod === 3) offset = -amp;
      else offset = 0;

      const zx = x1 + ux * t + px * offset;
      const zy = y1 + uy * t + py * offset;
      ctx.lineTo(zx, zy);
    }
    ctx.stroke();
  }

  const wingWidth = 6.5;
  const wing1X = baseX + px * wingWidth;
  const wing1Y = baseY + py * wingWidth;
  const wing2X = baseX - px * wingWidth;
  const wing2Y = baseY - py * wingWidth;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(wing1X, wing1Y);
  ctx.lineTo(baseX, baseY);
  ctx.lineTo(wing2X, wing2Y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawLobPassArrow(ctx, x1, y1, x2, y2, color = '#ffd600'){
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if(dist < 5) return;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = Math.atan2(dy, dx);

  // Calculate perpendicular normal to arch upwards / into the air
  let normX = -Math.sin(angle);
  let normY = Math.cos(angle);

  // If normal points downward toward bottom of pitch, flip it so the arc bends into the air
  if(normY > 0 || (normY === 0 && normX < 0)){
    normX = -normX;
    normY = -normY;
  }

  const arcHeight = Math.min(75, Math.max(20, dist * 0.30));
  const cpX = midX + normX * arcHeight;
  const cpY = midY + normY * arcHeight;

  ctx.save();

  // 1. Faint Ground Flight Shadow (Dashed projection on turf)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Launch & Landing Ground Anchor Rings
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(x1, y1 + 1.5, 3.5, 0, Math.PI * 2);
  ctx.arc(x2, y2 + 1.5, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x1, y1, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // 3. Arched Aerial Trajectory (Bright Yellow Smooth Curve)
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpX, cpY, x2, y2);
  ctx.stroke();

  // 4. Tangent Arrowhead at Destination (x2, y2)
  const endAngle = Math.atan2(y2 - cpY, x2 - cpX);
  const headLen = 13;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(endAngle - Math.PI / 6), y2 - headLen * Math.sin(endAngle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * 0.45 * Math.cos(endAngle), y2 - headLen * 0.45 * Math.sin(endAngle));
  ctx.lineTo(x2 - headLen * Math.cos(endAngle + Math.PI / 6), y2 - headLen * Math.sin(endAngle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  // Highlight outline on arrowhead for crisp definition against the pitch
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

const SP_BALL_SVG_DATA = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <radialGradient id="turfShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.55)" />
      <stop offset="50%" stop-color="rgba(0,0,0,0.25)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <radialGradient id="sphereLight" cx="34%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="38%" stop-color="#f5f5f5" />
      <stop offset="68%" stop-color="#e0e0e0" />
      <stop offset="88%" stop-color="#bdbdbd" />
      <stop offset="100%" stop-color="#757575" />
    </radialGradient>
    <radialGradient id="turfBounce" cx="70%" cy="85%" r="45%">
      <stop offset="0%" stop-color="rgba(34,197,94,0.18)" />
      <stop offset="100%" stop-color="rgba(34,197,94,0)" />
    </radialGradient>
    <radialGradient id="patchGrad" cx="36%" cy="34%" r="62%">
      <stop offset="0%" stop-color="#2c2c2c" />
      <stop offset="45%" stop-color="#141414" />
      <stop offset="85%" stop-color="#050505" />
      <stop offset="100%" stop-color="#000000" />
    </radialGradient>
    <radialGradient id="glossFlare" cx="32%" cy="28%" r="48%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.85)" />
      <stop offset="35%" stop-color="rgba(255,255,255,0.32)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
    <clipPath id="ballClip">
      <circle cx="50" cy="48" r="44" />
    </clipPath>
  </defs>
  <ellipse cx="50" cy="94" rx="38" ry="6" fill="url(#turfShadow)" />
  <ellipse cx="50" cy="92" rx="22" ry="3" fill="rgba(0,0,0,0.4)" />
  <circle cx="50" cy="48" r="44" fill="url(#sphereLight)" stroke="#000000" stroke-width="1.8" />
  <g clip-path="url(#ballClip)">
    <circle cx="50" cy="48" r="44" fill="url(#turfBounce)" />
    <polygon points="41,4 59,4 63,16 50,22 37,16" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="85,21 96,34 89,47 75,37 78,23" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="91,69 81,87 66,82 68,68 83,59" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="9,69 19,87 34,82 32,68 17,59" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="15,21 4,34 11,47 25,37 22,23" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.6" stroke-linejoin="round" />
    <polygon points="50,30 68,43 61,64 39,64 32,43" fill="url(#patchGrad)" stroke="#000000" stroke-width="1.8" stroke-linejoin="round" />
    <line x1="50" y1="30" x2="50" y2="22" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="68" y1="43" x2="75" y2="37" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="61" y1="64" x2="68" y2="68" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="39" y1="64" x2="32" y2="68" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="32" y1="43" x2="25" y2="37" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="63" y1="16" x2="78" y2="23" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="89" y1="47" x2="83" y2="59" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="66" y1="82" x2="34" y2="82" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="17" y1="59" x2="11" y2="47" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="22" y1="23" x2="37" y2="16" stroke="#000000" stroke-width="2.0" stroke-linecap="round" />
    <line x1="50" y1="30" x2="50" y2="22" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />
    <line x1="32" y1="43" x2="25" y2="37" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />
    <line x1="22" y1="23" x2="37" y2="16" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />
    <circle cx="50" cy="48" r="44" fill="url(#glossFlare)" />
    <circle cx="35" cy="30" r="5" fill="rgba(255,255,255,0.9)" />
  </g>
  <circle cx="50" cy="48" r="44" fill="none" stroke="#000000" stroke-width="2.0" />
</svg>`);

const spSoccerBallImage = new Image();
spSoccerBallImage.src = SP_BALL_SVG_DATA;
spSoccerBallImage.onload = () => {
  if (typeof redrawCanvas === 'function') redrawCanvas();
};

function drawRealisticSoccerBall(ctx, bx, by, R = 12.5){
  if(spSoccerBallImage.complete && spSoccerBallImage.naturalWidth > 0){
    const D = R * (100 / 44);
    ctx.drawImage(spSoccerBallImage, bx - D * 0.50, by - D * 0.48, D, D);
  } else {
    spSoccerBallImage.onload = () => { if(typeof redrawCanvas === 'function') redrawCanvas(); };
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function drawSingleObject(obj, isPreview){
  const canvas = $('sp-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  if(obj.type === 'token'){
    if(obj.tool === 'ball'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC 3D MATCH SOCCER BALL (FIFA Telstar 32-Panel Geometry)
      // ════════════════════════════════════════════════════════════════════
      drawRealisticSoccerBall(ctx, obj.x, obj.y, 12.5);
    } else if(obj.tool === 'cone_yellow'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC 3D AGILITY YELLOW CONE (Square Base + Aperture + Collar)
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      const cx = obj.x;
      const cy = obj.y;

      // 1. Base Shadow
      ctx.beginPath();
      ctx.ellipse(cx + 1.2, cy + 9.5, 13, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      ctx.fill();

      // 2. Realistic 3D Square Base Plate in Perspective
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 6.5);
      ctx.lineTo(cx, cy + 2.5);
      ctx.lineTo(cx + 12, cy + 6.5);
      ctx.lineTo(cx, cy + 11.5);
      ctx.closePath();
      const baseGrad = ctx.createLinearGradient(cx - 12, cy + 2.5, cx + 12, cy + 11.5);
      baseGrad.addColorStop(0, '#f57f17');
      baseGrad.addColorStop(0.5, '#ffd600');
      baseGrad.addColorStop(1, '#e65100');
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.strokeStyle = '#bf360c';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Base Corner Grip Dimples
      ctx.fillStyle = '#bf360c';
      [[-7, 5.5], [7, 5.5], [0, 9.5], [0, 4.2]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Volumetric Conical Body with Highlight & Shadow
      ctx.beginPath();
      ctx.moveTo(cx - 2.5, cy - 14.5);
      ctx.lineTo(cx + 2.5, cy - 14.5);
      ctx.lineTo(cx + 9.5, cy + 7);
      ctx.lineTo(cx - 9.5, cy + 7);
      ctx.closePath();
      const bodyGrad = ctx.createLinearGradient(cx - 9.5, cy, cx + 9.5, cy);
      bodyGrad.addColorStop(0, '#f57f17');
      bodyGrad.addColorStop(0.25, '#fff176');
      bodyGrad.addColorStop(0.5, '#ffd600');
      bodyGrad.addColorStop(0.85, '#ff8f00');
      bodyGrad.addColorStop(1, '#e65100');
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = '#d84315';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 4. Realistic White Reflective Vinyl Collar Band
      ctx.beginPath();
      ctx.moveTo(cx - 4.8, cy - 3.5);
      ctx.lineTo(cx + 4.8, cy - 3.5);
      ctx.lineTo(cx + 7.2, cy + 2.5);
      ctx.lineTo(cx - 7.2, cy + 2.5);
      ctx.closePath();
      const bandGrad = ctx.createLinearGradient(cx - 7.2, cy, cx + 7.2, cy);
      bandGrad.addColorStop(0, '#e0e0e0');
      bandGrad.addColorStop(0.3, '#ffffff');
      bandGrad.addColorStop(0.8, '#f5f5f5');
      bandGrad.addColorStop(1, '#bdbdbd');
      ctx.fillStyle = bandGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // 5. Top Cone Stacking Hole / Aperture
      ctx.beginPath();
      ctx.ellipse(cx, cy - 14.5, 2.5, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#bf360c';
      ctx.fill();
      ctx.strokeStyle = '#fff176';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    } else if(obj.tool === 'cone_red' || obj.tool === 'cone'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC 3D AGILITY RED CONE (Square Base + Aperture + Collar)
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      const cx = obj.x;
      const cy = obj.y;

      // 1. Base Shadow
      ctx.beginPath();
      ctx.ellipse(cx + 1.2, cy + 9.5, 13, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      ctx.fill();

      // 2. Realistic 3D Square Base Plate in Perspective
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 6.5);
      ctx.lineTo(cx, cy + 2.5);
      ctx.lineTo(cx + 12, cy + 6.5);
      ctx.lineTo(cx, cy + 11.5);
      ctx.closePath();
      const baseGrad = ctx.createLinearGradient(cx - 12, cy + 2.5, cx + 12, cy + 11.5);
      baseGrad.addColorStop(0, '#c62828');
      baseGrad.addColorStop(0.5, '#ff3d00');
      baseGrad.addColorStop(1, '#880e4f');
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.strokeStyle = '#4a148c';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Base Corner Grip Dimples
      ctx.fillStyle = '#4a148c';
      [[-7, 5.5], [7, 5.5], [0, 9.5], [0, 4.2]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Volumetric Conical Body with Highlight & Shadow
      ctx.beginPath();
      ctx.moveTo(cx - 2.5, cy - 14.5);
      ctx.lineTo(cx + 2.5, cy - 14.5);
      ctx.lineTo(cx + 9.5, cy + 7);
      ctx.lineTo(cx - 9.5, cy + 7);
      ctx.closePath();
      const bodyGrad = ctx.createLinearGradient(cx - 9.5, cy, cx + 9.5, cy);
      bodyGrad.addColorStop(0, '#c62828');
      bodyGrad.addColorStop(0.25, '#ff8a80');
      bodyGrad.addColorStop(0.5, '#ff3d00');
      bodyGrad.addColorStop(0.85, '#d50000');
      bodyGrad.addColorStop(1, '#880e4f');
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 4. Realistic White Reflective Vinyl Collar Band
      ctx.beginPath();
      ctx.moveTo(cx - 4.8, cy - 3.5);
      ctx.lineTo(cx + 4.8, cy - 3.5);
      ctx.lineTo(cx + 7.2, cy + 2.5);
      ctx.lineTo(cx - 7.2, cy + 2.5);
      ctx.closePath();
      const bandGrad = ctx.createLinearGradient(cx - 7.2, cy, cx + 7.2, cy);
      bandGrad.addColorStop(0, '#e0e0e0');
      bandGrad.addColorStop(0.3, '#ffffff');
      bandGrad.addColorStop(0.8, '#f5f5f5');
      bandGrad.addColorStop(1, '#bdbdbd');
      ctx.fillStyle = bandGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // 5. Top Cone Stacking Hole / Aperture
      ctx.beginPath();
      ctx.ellipse(cx, cy - 14.5, 2.5, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4a148c';
      ctx.fill();
      ctx.strokeStyle = '#ff8a80';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    } else if(obj.tool === 'marker_yellow'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC 3D SAUCER DISC MARKER (Yellow)
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      const cx = obj.x;
      const cy = obj.y;

      // 1. Ground Drop Shadow
      ctx.beginPath();
      ctx.ellipse(cx + 1, cy + 2.5, 11.5, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // 2. Base Outer Flange / Rim
      ctx.beginPath();
      ctx.ellipse(cx, cy + 0.6, 10.5, 4.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f57f17';
      ctx.fill();
      ctx.strokeStyle = '#e65100';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 3. Convex Dome with Radial Plastic Sheen
      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.4, 9.8, 4.0, 0, 0, Math.PI * 2);
      const mGrad = ctx.createRadialGradient(cx - 2, cy - 1.5, 0.5, cx, cy, 9.8);
      mGrad.addColorStop(0, '#fff9c4');
      mGrad.addColorStop(0.3, '#ffeb3b');
      mGrad.addColorStop(0.7, '#ffd600');
      mGrad.addColorStop(1, '#f57f17');
      ctx.fillStyle = mGrad;
      ctx.fill();
      ctx.strokeStyle = '#ff8f00';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // 4. Stepped Concentric Grip Ridge
      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.6, 5.8, 2.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 5. Authentic Recessed Center Cutout Hole
      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.2, 2.6, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#bf360c';
      ctx.fill();
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    } else if(obj.tool === 'marker_red'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC 3D SAUCER DISC MARKER (Red / Orange)
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      const cx = obj.x;
      const cy = obj.y;

      // 1. Ground Drop Shadow
      ctx.beginPath();
      ctx.ellipse(cx + 1, cy + 2.5, 11.5, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // 2. Base Outer Flange / Rim
      ctx.beginPath();
      ctx.ellipse(cx, cy + 0.6, 10.5, 4.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#b71c1c';
      ctx.fill();
      ctx.strokeStyle = '#880e4f';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 3. Convex Dome with Radial Plastic Sheen
      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.4, 9.8, 4.0, 0, 0, Math.PI * 2);
      const mGrad = ctx.createRadialGradient(cx - 2, cy - 1.5, 0.5, cx, cy, 9.8);
      mGrad.addColorStop(0, '#ffcdd2');
      mGrad.addColorStop(0.3, '#ff5252');
      mGrad.addColorStop(0.7, '#f44336');
      mGrad.addColorStop(1, '#b71c1c');
      ctx.fillStyle = mGrad;
      ctx.fill();
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // 4. Stepped Concentric Grip Ridge
      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.6, 5.8, 2.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 5. Authentic Recessed Center Cutout Hole
      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.2, 2.6, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4a148c';
      ctx.fill();
      ctx.strokeStyle = '#ff8a80';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    } else if(obj.tool === 'mannequin'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC PRO TRAINING MANNEQUIN / FREE-KICK WALL DUMMY
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(obj.x, obj.y);

      // 1. Turf Base Shadow
      ctx.beginPath();
      ctx.ellipse(0, 18, 14, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.fill();

      // 2. Dual Ground Turf Spikes / Heavy Cast-Iron Base
      ctx.fillStyle = '#263238';
      ctx.fillRect(-9, 13, 3, 6);
      ctx.fillRect(6, 13, 3, 6);
      // Base crossplate
      ctx.beginPath();
      ctx.roundRect(-11, 11, 22, 3.5, 1.5);
      ctx.fillStyle = '#37474f';
      ctx.fill();
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 3. Central Steel Backbone Spine
      const spineGrad = ctx.createLinearGradient(-2, 0, 2, 0);
      spineGrad.addColorStop(0, '#546e7a');
      spineGrad.addColorStop(0.5, '#cfd8dc');
      spineGrad.addColorStop(1, '#37474f');
      ctx.fillStyle = spineGrad;
      ctx.fillRect(-2, -14, 4, 26);
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-2, -14, 4, 26);

      // 4. Aerodynamic Slotted Polycarbonate Ribs (5 Curved Ribs with 3D Depth)
      const ribColor = '#00e676';
      const ribBorder = '#1b5e20';
      [-9, -5, -1, 3, 7].forEach((ry, idx) => {
        const rw = (idx === 0 || idx === 4) ? 16 : 21;
        ctx.beginPath();
        ctx.roundRect(-rw / 2, ry, rw, 3, 1.5);
        const ribGrad = ctx.createLinearGradient(-rw / 2, ry, rw / 2, ry);
        ribGrad.addColorStop(0, '#00b0ff');
        ribGrad.addColorStop(0.3, '#00e676');
        ribGrad.addColorStop(0.7, '#69f0ae');
        ribGrad.addColorStop(1, '#00c853');
        ctx.fillStyle = ribGrad;
        ctx.fill();
        ctx.strokeStyle = ribBorder;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // 5. Molded High-Vis Chest Shield / Bib
      ctx.beginPath();
      ctx.moveTo(-7, -10);
      ctx.lineTo(7, -10);
      ctx.lineTo(5, -2);
      ctx.lineTo(0, 1);
      ctx.lineTo(-5, -2);
      ctx.closePath();
      const shieldGrad = ctx.createLinearGradient(-7, -10, 7, 1);
      shieldGrad.addColorStop(0, '#00e676');
      shieldGrad.addColorStop(0.5, '#b9f6ca');
      shieldGrad.addColorStop(1, '#00c853');
      ctx.fillStyle = shieldGrad;
      ctx.fill();
      ctx.strokeStyle = '#1b5e20';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 6. Molded Head & Protective Face Guard Loop
      ctx.beginPath();
      ctx.ellipse(0, -17.5, 5, 6.5, 0, 0, Math.PI * 2);
      const headGrad = ctx.createRadialGradient(-1, -19, 1, 0, -17.5, 5.5);
      headGrad.addColorStop(0, '#b9f6ca');
      headGrad.addColorStop(0.6, '#00e676');
      headGrad.addColorStop(1, '#00b248');
      ctx.fillStyle = headGrad;
      ctx.fill();
      ctx.strokeStyle = '#1b5e20';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Head center aperture slot
      ctx.beginPath();
      ctx.ellipse(0, -17.5, 2.2, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      ctx.restore();
    } else if(obj.tool === 'hurdle'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC AGILITY SPEED HURDLE (Tubular Frame + Warning Stripes)
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(obj.x, obj.y);

      // 1. Ground Drop Shadow
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // 2. Anti-Tip Stabilizer Feet & Uprights (Charcoal Rubber + Steel)
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 3.0;
      ctx.lineCap = 'round';
      // Left foot
      ctx.beginPath(); ctx.moveTo(-18, 9.5); ctx.lineTo(-10, 9.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-14, 9.5); ctx.lineTo(-14, -4); ctx.stroke();
      // Right foot
      ctx.beginPath(); ctx.moveTo(10, 9.5); ctx.lineTo(18, 9.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14, 9.5); ctx.lineTo(14, -4); ctx.stroke();

      // Foot yellow end-caps
      ctx.fillStyle = '#ffd600';
      [-18, -10, 10, 18].forEach(fx => {
        ctx.beginPath();
        ctx.arc(fx, 9.5, 2.0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Fluorescent Crossbar Arch with 3D Cylindrical Shading
      ctx.beginPath();
      ctx.roundRect(-17, -9, 34, 6.5, 2.5);
      const hGrad = ctx.createLinearGradient(0, -9, 0, -2.5);
      hGrad.addColorStop(0, '#ffab00');
      hGrad.addColorStop(0.3, '#ff6d00');
      hGrad.addColorStop(0.7, '#ff3d00');
      hGrad.addColorStop(1, '#dd2c00');
      ctx.fillStyle = hGrad;
      ctx.fill();
      ctx.strokeStyle = '#bf360c';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // 4. High-Contrast Hazard / Chevron Center Striping
      [-6, 0, 6].forEach(sx => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(sx - 1.8, -8.5, 3.6, 5.5, 1);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      ctx.restore();
    } else if(obj.tool === 'ladder'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC AGILITY SPEED FOOTWORK LADDER (Woven Straps + Rungs)
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(obj.x, obj.y);
      const ladderRot = ((obj.rotation || 0) * Math.PI) / 180;
      ctx.rotate(ladderRot);

      const lLen = 76;
      const lWid = 22;

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(-lWid / 2 + 1.5, -lLen / 2 + 2.5, lWid, lLen);

      // 2. Heavy-Duty Woven Nylon Webbing Side Rails (Black / Dark Navy)
      ctx.strokeStyle = '#1a237e';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(-lWid / 2, -lLen / 2); ctx.lineTo(-lWid / 2, lLen / 2);
      ctx.moveTo(lWid / 2, -lLen / 2); ctx.lineTo(lWid / 2, lLen / 2);
      ctx.stroke();

      // Rail inner highlight stitching
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(-lWid / 2, -lLen / 2); ctx.lineTo(-lWid / 2, lLen / 2);
      ctx.moveTo(lWid / 2, -lLen / 2); ctx.lineTo(lWid / 2, lLen / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Fluorescent Yellow Non-Slip Molded Plastic Rungs (7 Rungs)
      const rungCount = 7;
      const step = lLen / (rungCount - 1);
      for(let i = 0; i < rungCount; i++){
        const ry = -lLen / 2 + i * step;

        // Rung body
        ctx.beginPath();
        ctx.roundRect(-lWid / 2 - 1.5, ry - 1.8, lWid + 3, 3.6, 1);
        const rGrad = ctx.createLinearGradient(0, ry - 1.8, 0, ry + 1.8);
        rGrad.addColorStop(0, '#fff59d');
        rGrad.addColorStop(0.4, '#ffd600');
        rGrad.addColorStop(1, '#f57f17');
        ctx.fillStyle = rGrad;
        ctx.fill();
        ctx.strokeStyle = '#e65100';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // End rivet clips
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(-lWid / 2, ry, 0.9, 0, Math.PI * 2);
        ctx.arc(lWid / 2, ry, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else if(obj.tool === 'pole'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC SLALOM AGILITY TRAINING POLE (Base Dome + Spiral + Flag)
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(obj.x, obj.y);

      // 1. Turf Base Shadow
      ctx.beginPath();
      ctx.ellipse(0, 11, 9.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // 2. Heavy-Duty Weighted Rubber Base Dome
      ctx.beginPath();
      ctx.ellipse(0, 9.5, 7.5, 3.0, 0, 0, Math.PI * 2);
      const bDomeGrad = ctx.createRadialGradient(-1, 8.5, 1, 0, 9.5, 7.5);
      bDomeGrad.addColorStop(0, '#546e7a');
      bDomeGrad.addColorStop(0.7, '#263238');
      bDomeGrad.addColorStop(1, '#102027');
      ctx.fillStyle = bDomeGrad;
      ctx.fill();
      ctx.strokeStyle = '#000a12';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 3. Flexible PVC Pole with Fluorescent & Blazing Bands
      const poleH = 38;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';

      // Base yellow shaft
      ctx.strokeStyle = '#ffd600';
      ctx.beginPath();
      ctx.moveTo(0, 9.5);
      ctx.lineTo(0, 9.5 - poleH);
      ctx.stroke();

      // High-vis alternating crimson warning bands
      ctx.strokeStyle = '#d50000';
      ctx.lineWidth = 3.2;
      [9.5 - 8, 9.5 - 18, 9.5 - 28].forEach(sy => {
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(0, sy - 5.5);
        ctx.stroke();
      });

      // Pole 3D highlight gleam line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-0.6, 9.5);
      ctx.lineTo(-0.6, 9.5 - poleH);
      ctx.stroke();

      // 4. Sharp Nylon Triangular Coaching Flag
      ctx.beginPath();
      ctx.moveTo(0, 9.5 - poleH);
      ctx.lineTo(11, 9.5 - poleH + 4.5);
      ctx.lineTo(0, 9.5 - poleH + 9);
      ctx.closePath();
      const flagGrad = ctx.createLinearGradient(0, 9.5 - poleH, 11, 9.5 - poleH + 4.5);
      flagGrad.addColorStop(0, '#ff1744');
      flagGrad.addColorStop(0.6, '#d50000');
      flagGrad.addColorStop(1, '#b71c1c');
      ctx.fillStyle = flagGrad;
      ctx.fill();
      ctx.strokeStyle = '#880e4f';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Flag pole cap
      ctx.fillStyle = '#ffd600';
      ctx.beginPath();
      ctx.arc(0, 9.5 - poleH, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if(obj.tool === 'goal'){
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC 3D ALUMINUM FOOTBALL GOAL WITH METALLIC POSTS & NET
      // ════════════════════════════════════════════════════════════════════
      const scale = obj.scale || 1.0;
      const gw = 64 * scale;
      const gd = 26 * scale;
      const rot = ((obj.rotation || 0) * Math.PI) / 180;

      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(rot);

      // 1. Net 3D shaded backing
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(-gw / 2, -gd, gw, gd);

      // 2. Net Fine Hexagonal / Cross Grid Mesh
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      const gridStep = Math.max(4.5, 6.5 * scale);
      for(let gx = -gw / 2 + gridStep; gx < gw / 2; gx += gridStep){
        ctx.moveTo(gx, -gd);
        ctx.lineTo(gx, 0);
      }
      for(let gy = -gd + gridStep; gy < 0; gy += gridStep){
        ctx.moveTo(-gw / 2, gy);
        ctx.lineTo(gw / 2, gy);
      }
      // Net tension support corner lines
      ctx.moveTo(-gw / 2, -gd); ctx.lineTo(-gw / 2, 0);
      ctx.moveTo(gw / 2, -gd); ctx.lineTo(gw / 2, 0);
      ctx.moveTo(-gw / 2, -gd); ctx.lineTo(gw / 2, -gd);
      ctx.stroke();

      // 3. Rear Heavy Ground Stabilizer Frame
      ctx.strokeStyle = 'rgba(220, 230, 240, 0.85)';
      ctx.lineWidth = Math.max(1.6, 2.2 * scale);
      ctx.beginPath();
      ctx.moveTo(-gw / 2, -gd);
      ctx.lineTo(gw / 2, -gd);
      ctx.stroke();

      // 4. Front Goal Line White Crossbar with 3D Metallic Gloss
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(3.2, 4.2 * scale);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-gw / 2, 0);
      ctx.lineTo(gw / 2, 0);
      ctx.stroke();

      // Crossbar metallic specular line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = Math.max(1.0, 1.4 * scale);
      ctx.beginPath();
      ctx.moveTo(-gw / 2, -0.6);
      ctx.lineTo(gw / 2, -0.6);
      ctx.stroke();

      // 5. Dual Cylindrical White Goal Posts
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-gw / 2, 0, Math.max(3.5, 4.5 * scale), 0, Math.PI * 2);
      ctx.arc(gw / 2, 0, Math.max(3.5, 4.5 * scale), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cfd8dc';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();

      // Draw On-Object Controls Pill [−] [⟳] [+] ONLY when Goal tool is actively selected
      if(!isPreview && currentBoardTool === 'goal'){
        const ctrl = getGoalControlLayout(obj);
        ctx.save();
        const pillW = 78;
        const pillH = 24;
        ctx.fillStyle = 'rgba(10, 35, 20, 0.94)';
        ctx.beginPath();
        ctx.roundRect(ctrl.cx - pillW / 2, ctrl.cy - pillH / 2, pillW, pillH, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Minus button [-]
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(ctrl.minus.x, ctrl.minus.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('−', ctrl.minus.x, ctrl.minus.y);

        // Rotate button [⟳]
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(ctrl.rotate.x, ctrl.rotate.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⟳', ctrl.rotate.x, ctrl.rotate.y);

        // Plus button [+]
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(ctrl.plus.x, ctrl.plus.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', ctrl.plus.x, ctrl.plus.y);

        // Size text
        let sizeLabel = 'Standard';
        if(scale <= 0.6) sizeLabel = 'Mini';
        else if(scale <= 0.85) sizeLabel = 'Small (7v7)';
        else if(scale >= 1.5) sizeLabel = 'Large';
        else if(scale >= 1.25) sizeLabel = 'Medium';

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 9.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(sizeLabel, ctrl.cx, ctrl.cy + 14);

        ctx.restore();
      }
    } else {
      // ════════════════════════════════════════════════════════════════════
      // REALISTIC 3D EPOXY-DOMED PLAYER TOKENS (Red, Blue, Yellow, Green, GK)
      // ════════════════════════════════════════════════════════════════════
      let c1 = '#e53935', c2 = '#b71c1c', border = '#7f0000', textColor = '#ffffff';
      if(obj.tool === 'blue'){ c1 = '#1e88e5'; c2 = '#0d47a1'; border = '#002171'; textColor = '#ffffff'; }
      if(obj.tool === 'yellow'){ c1 = '#ffd600'; c2 = '#f57f17'; border = '#e65100'; textColor = '#1a1a1a'; }
      if(obj.tool === 'green'){ c1 = '#00e676'; c2 = '#1b5e20'; border = '#003300'; textColor = '#ffffff'; }
      if(obj.tool === 'gk'){ c1 = '#ffffff'; c2 = '#d9e0e8'; border = '#263238'; textColor = '#0d1117'; }

      ctx.save();
      const px = obj.x;
      const py = obj.y;
      const R = 14.5;

      // 1. Soft Turf Drop Shadow
      ctx.beginPath();
      ctx.arc(px + 1.2, py + 2.4, R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      // 2. Outer Metallic Chrome Bevel Ring
      ctx.beginPath();
      ctx.arc(px, py, R, 0, Math.PI * 2);
      const rimGrad = ctx.createLinearGradient(px - R, py - R, px + R, py + R);
      rimGrad.addColorStop(0, '#ffffff');
      rimGrad.addColorStop(0.3, '#cfd8dc');
      rimGrad.addColorStop(0.7, '#78909c');
      rimGrad.addColorStop(1, '#37474f');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // 3. Inner Resin Dome (3D Spherical gradient)
      ctx.beginPath();
      ctx.arc(px, py, R - 2.0, 0, Math.PI * 2);
      const tokenGrad = ctx.createRadialGradient(px - 3, py - 4, 1, px, py, R - 2);
      tokenGrad.addColorStop(0, c1);
      tokenGrad.addColorStop(0.8, c2);
      tokenGrad.addColorStop(1, border);
      ctx.fillStyle = tokenGrad;
      ctx.fill();
      ctx.strokeStyle = border;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 4. Glossy Specular Arc Glare (Epoxy finish)
      ctx.beginPath();
      ctx.ellipse(px - 3.5, py - 4.5, 6, 2.5, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();

      // 5. Squad Number / Label
      if(obj.label){
        ctx.fillStyle = textColor;
        ctx.font = 'bold 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.label, px, py + 0.5);
      }
      ctx.restore();
    }
  } else if(obj.type === 'line'){
    if(obj.tool === 'dribble'){
      // Dribble Zigzag + Yard Badge on side (when drawn with ruler enabled)
      drawZigzagArrow(ctx, obj.x1, obj.y1, obj.x2, obj.y2, '#ff9800');
      const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
      const showDist = isPreview ? isRulerEnabled : (obj.showMeasurement === true);
      if(showDist && dist > 15){
        const yds = pxToYds(dist, boardPitchType);
        drawAlignedSegmentYardBadge(ctx, obj.x1, obj.y1, obj.x2, obj.y2, `Dribble: ${yds} yds`, 16, '#ff9800', 'rgba(10, 30, 20, 0.94)');
      }
    } else if(obj.tool === 'zone'){
      // Highlight Zone Box + Dimension Yard Badge (when drawn with ruler enabled)
      ctx.save();
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.fillStyle = 'rgba(255, 214, 0, 0.15)';
      const rx = Math.min(obj.x1, obj.x2);
      const ry = Math.min(obj.y1, obj.y2);
      const rw = Math.abs(obj.x2 - obj.x1);
      const rh = Math.abs(obj.y2 - obj.y1);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.restore();

      const showDist = isPreview ? isRulerEnabled : (obj.showMeasurement === true);
      if(showDist && rw > 15 && rh > 15){
        const ydsW = pxToYds(rw, boardPitchType);
        const ydsH = pxToYds(rh, boardPitchType);
        drawYardBadge(ctx, rx + rw / 2, ry - 12 < 12 ? ry + rh + 12 : ry - 12, `📐 ${ydsW} × ${ydsH} yds`, '#ffffff', 'rgba(10, 30, 20, 0.94)');
      }
    } else if(obj.tool === 'ruler'){
      // Dedicated Measuring Ruler (Always white with dimension guide and aligned side badge)
      ctx.save();
      const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
      const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
      const px = -Math.sin(angle);
      const py = Math.cos(angle);

      // White Dimension Guide Line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // White Perpendicular End Ticks
      const tickLen = 8;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(obj.x1 + px * tickLen, obj.y1 + py * tickLen);
      ctx.lineTo(obj.x1 - px * tickLen, obj.y1 - py * tickLen);
      ctx.moveTo(obj.x2 + px * tickLen, obj.y2 + py * tickLen);
      ctx.lineTo(obj.x2 - px * tickLen, obj.y2 - py * tickLen);
      ctx.stroke();
      ctx.restore();

      // Measurement Badge positioned outside along the side of the line
      const yds = pxToYds(dist, boardPitchType);
      drawAlignedSegmentYardBadge(ctx, obj.x1, obj.y1, obj.x2, obj.y2, `📏 ${yds} yds`, 16, '#ffffff', 'rgba(10, 30, 20, 0.94)');
    } else if(obj.tool === 'lob'){
      // Aerial Lob Pass (Yellow High-arc trajectory with ground shadow and tangent arrowhead)
      drawLobPassArrow(ctx, obj.x1, obj.y1, obj.x2, obj.y2, '#ffd600');
      const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
      const showDist = isPreview ? isRulerEnabled : (obj.showMeasurement === true);
      if(showDist && dist > 15){
        const yds = pxToYds(dist, boardPitchType);
        drawAlignedSegmentYardBadge(ctx, obj.x1, obj.y1, obj.x2, obj.y2, `Lob: ${yds} yds`, 20, '#ffd600', 'rgba(10, 30, 20, 0.94)');
      }
    } else {
      // Pass (Yellow Dashed + Start Dot) or Run (Red Solid Straight)
      ctx.save();
      const isPass = (obj.tool === 'pass');
      const color = isPass ? '#ffd600' : '#e53935';

      // 1. Pass Start-Point Indicator: Ball Origin Dot
      if(isPass){
        ctx.beginPath();
        ctx.arc(obj.x1, obj.y1, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd600';
        ctx.fill();
        ctx.strokeStyle = '#1b261a';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      if(isPass) ctx.setLineDash([7, 5]);

      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Arrow Head
      const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
      const headLen = 12;
      ctx.beginPath();
      ctx.moveTo(obj.x2, obj.y2);
      ctx.lineTo(obj.x2 - headLen * Math.cos(angle - Math.PI / 6), obj.y2 - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(obj.x2 - headLen * Math.cos(angle + Math.PI / 6), obj.y2 - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Yard Distance Badge with Role Prefix
      const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
      const showDist = isPreview ? isRulerEnabled : (obj.showMeasurement === true);
      if(showDist && dist > 18){
        const yds = pxToYds(dist, boardPitchType);
        const labelText = isPass ? `Pass: ${yds} yds` : `Run: ${yds} yds`;
        const badgeColor = isPass ? '#ffd600' : '#ff5252';
        drawAlignedSegmentYardBadge(ctx, obj.x1, obj.y1, obj.x2, obj.y2, labelText, 16, badgeColor, 'rgba(10, 30, 20, 0.94)');
      }
    }
  }
}

function closeBoardSketcher(){
  if(initialDrillBoardSnapshot !== null && JSON.stringify(boardObjects) !== initialDrillBoardSnapshot){
    if(!confirm('⚠️ You have unsaved markings on this tactical drill sketch.\n\nAre you sure you want to discard them?')){
      return;
    }
  }
  initialDrillBoardSnapshot = null;
  closeM('m-drill-board');
}

function saveBoardDiagram(){
  const canvas = $('sp-canvas');
  if(!canvas || currentEditingDrillIndex === null) return;
  const dataUrl = canvas.toDataURL('image/png', 0.85);

  if(currentEditingSession && currentEditingSession.drills && currentEditingSession.drills[currentEditingDrillIndex]){
    currentEditingSession.drills[currentEditingDrillIndex].diagram = dataUrl;
    currentEditingSession.drills[currentEditingDrillIndex].boardObjects = JSON.parse(JSON.stringify(boardObjects));
    currentEditingSession.drills[currentEditingDrillIndex].pitchType = boardPitchType;
  }

  initialDrillBoardSnapshot = null;
  closeM('m-drill-board');
  renderDrillTimeline();
}

window.addEventListener('beforeunload', (e) => {
  if(typeof isSessionEditorDirty === 'function' && isSessionEditorDirty()){
    e.preventDefault();
    e.returnValue = 'You have unsaved changes in your session plan.';
  }
});

/* ==========================================================================
   DRILL LIBRARY & PRESETS MODALS
   ========================================================================== */

let isInsertToSessionMode = false;

function openDrillLibraryModal(insertMode = false){
  isInsertToSessionMode = insertMode;
  renderDrillLibrary();
  openM('m-drill-library');
}

function renderDrillLibrary(){
  const grid = $('lib-grid');
  if(!grid) return;
  const search = ($('lib-search')?.value || '').toLowerCase().trim();
  const phaseFilter = $('lib-filter-phase')?.value || '';

  const filtered = DRILL_LIBRARY.filter(d => {
    if(phaseFilter && d.phase !== phaseFilter) return false;
    if(search){
      const matchName = (d.name || '').toLowerCase().includes(search);
      const matchDesc = (d.description || '').toLowerCase().includes(search);
      if(!matchName && !matchDesc) return false;
    }
    return true;
  });

  grid.innerHTML = filtered.map(d => `
    <div class="sp-lib-card">
      <div class="sp-lib-head">
        <span class="sp-badge ${getPhaseClass(d.phase).replace('phase-', 'sp-badge-')}">${esc(d.phase)}</span>
        <span style="font-size:12px;font-weight:700;color:var(--g);">⏱️ ${d.duration}m</span>
      </div>
      <div class="sp-lib-title">${esc(d.name)}</div>
      <div class="sp-lib-desc">${esc(d.description)}</div>
      <div style="font-size:11.5px;color:var(--mt);margin-bottom:10px;">
        <span>📐 ${esc(d.dimensions)}</span> · <span>👥 ${esc(d.players)}</span>
      </div>
      <div style="margin-top:auto;display:flex;justify-content:flex-end;">
        <button class="mok" style="padding:6px 12px;font-size:12px;" onclick="selectDrillFromLibrary('${d.id}')">
          ${isInsertToSessionMode ? '＋ Insert into Session' : '＋ Add Drill'}
        </button>
      </div>
    </div>
  `).join('');
}

function selectDrillFromLibrary(drillId){
  const d = DRILL_LIBRARY.find(item => item.id === drillId);
  if(!d) return;
  if(isInsertToSessionMode && currentEditingSession){
    addDrillBlock(d);
    closeM('m-drill-library');
  } else {
    // Open new session with this drill
    openNewSession();
    currentEditingSession.drills = [JSON.parse(JSON.stringify(d))];
    renderDrillTimeline();
    closeM('m-drill-library');
  }
}

function openTemplatePicker(){
  const grid = $('preset-grid');
  if(!grid) return;

  grid.innerHTML = SESSION_PRESETS.map(p => `
    <div class="sp-lib-card" onclick="openSessionWithPreset('${p.id}')">
      <div class="sp-lib-head">
        <span class="sp-badge ${getCategoryBadgeClass(p.category)}">${esc(p.category)}</span>
        <span style="font-size:12px;font-weight:700;color:var(--g);">⚡ ${p.duration} mins</span>
      </div>
      <div class="sp-lib-title">${esc(p.title)}</div>
      <div class="sp-lib-desc">${esc(p.objectives)}</div>
      <div class="sp-drills-chips" style="margin-top:8px;">
        ${(p.drills || []).map(d => `<div class="sp-drill-chip"><span class="dot ${getPhaseClass(d.phase)}"></span>${esc(d.name)}</div>`).join('')}
      </div>
      <div style="margin-top:auto;padding-top:10px;display:flex;justify-content:flex-end;">
        <button class="mok" style="padding:6px 12px;font-size:12px;">⚡ Use Preset</button>
      </div>
    </div>
  `).join('');

  openM('m-template-picker');
}

/* ==========================================================================
   PRINT / PDF COACHING CLIPBOARD & WHATSAPP EXPORT
   ========================================================================== */

let currentPrintingSession = null;

function openSessionPrint(id){
  const s = sessions.find(item => item.id === id);
  if(!s) return;
  currentPrintingSession = s;
  renderPrintCoachingSheet(s);
  openM('m-session-print');
}

function previewCurrentSessionPrint(){
  currentPrintingSession = {
    title: $('se-title').value || 'Training Session',
    date: $('se-date').value,
    time: $('se-time').value,
    venue: $('se-venue').value,
    category: $('se-category').value,
    intensity: $('se-intensity').value,
    coach: $('se-coach').value,
    objectives: $('se-objectives').value,
    equipment: currentEditingSession.equipment,
    drills: currentEditingSession.drills,
    attendance: sessionAttendanceState
  };
  renderPrintCoachingSheet(currentPrintingSession);
  openM('m-session-print');
}

function renderPrintCoachingSheet(s){
  const container = $('session-print-area');
  if(!container) return;

  const teamName = (curTeam && curTeam.name) ? curTeam.name.toUpperCase() : 'COACH MANAGEMENT SYSTEM';
  const logo = (curTeam && curTeam.logo) ? curTeam.logo : '';
  const drills = s.drills || [];
  const totalMins = drills.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0) || s.duration || 90;

  // Equipment list
  const equipLabels = (s.equipment || []).map(id => {
    const found = EQUIPMENT_PRESETS.find(e => e.id === id);
    return found ? found.label : id;
  });

  // Identify drills with attached diagrams for full-page appendix sheets
  const drillsWithDiagrams = drills
    .map((d, originalIdx) => ({ ...d, originalIdx }))
    .filter(d => d.diagram);

  container.innerHTML = `
    <!-- PAGE 1: SESSION OVERVIEW & TIMELINE -->
    <div class="sp-print-page">
      <div class="sp-print-header">
        <div style="display:flex;align-items:center;gap:12px;">
          ${logo ? `<img src="${esc(logo)}" class="sp-print-logo" alt="">` : `<div class="sp-print-logo" style="display:flex;align-items:center;justify-content:center;font-size:24px;background:#f0f8f0;">⚽</div>`}
          <div>
            <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:var(--mt);text-transform:uppercase;">${esc(teamName)} · TRAINING PLAN</div>
            <h1 class="sp-print-title">${esc(s.title || 'TRAINING SESSION')}</h1>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:14px;font-weight:700;color:#1a5c1a;">${formatSessionDate(s.date)}</div>
          <div style="font-size:12px;color:var(--mt);">${s.time || ''} · ${totalMins} Mins</div>
        </div>
      </div>

      <div class="sp-print-meta-grid">
        <div><strong>Category:</strong> ${esc(s.category || 'Tactical')}</div>
        <div><strong>Intensity:</strong> ${esc(s.intensity || 'Medium')}</div>
        <div><strong>Venue / Pitch:</strong> ${esc(s.venue || 'Training Ground')}</div>
        <div><strong>Lead Coach:</strong> ${esc(s.coach || 'Head Coach')}</div>
      </div>

      ${s.objectives ? `
        <div style="background:#f9fbf9;border:1px solid #c8dcc8;border-radius:8px;padding:10px 14px;margin-bottom:16px;">
          <strong style="color:#1a5c1a;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Session Objectives &amp; Coaching Points:</strong>
          <div style="font-size:12.5px;line-height:1.4;margin-top:4px;white-space:pre-line;">${esc(s.objectives)}</div>
        </div>
      ` : ''}

      ${equipLabels.length ? `
        <div style="font-size:12px;margin-bottom:16px;color:#333;">
          <strong style="color:#1a5c1a;">Equipment Needed:</strong> ${equipLabels.join(' · ')}
        </div>
      ` : ''}

      <div style="margin-bottom:12px;">
        <h3 style="font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;color:#1a5c1a;border-bottom:1.5px solid #c8dcc8;padding-bottom:4px;margin-bottom:12px;">
          DRILL TIMELINE &amp; TACTICAL EXERCISES (${totalMins} MINS)
        </h3>
        ${drills.map((d, i) => `
          <div class="sp-print-drill-row">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
              <div style="font-size:14px;font-weight:700;color:#1a5c1a;">
                ${i + 1}. [${esc(d.phase)}] ${esc(d.name)} (${d.duration}m)
              </div>
              <div style="font-size:11.5px;color:#555;">
                ${d.dimensions ? `📐 ${esc(d.dimensions)}` : ''} ${d.players ? `· 👥 ${esc(d.players)}` : ''}
              </div>
            </div>

            <div style="display:flex;gap:14px;align-items:flex-start;">
              ${d.diagram ? `
                <div style="position:relative;flex-shrink:0;">
                  <img src="${d.diagram}" style="width:140px;height:90px;border-radius:6px;border:1px solid #1a5c1a;object-fit:contain;background:#164327;display:block;" alt="">
                  <div style="font-size:9.5px;color:#1a5c1a;font-weight:700;text-align:center;margin-top:2px;">(See Appendix Page)</div>
                </div>
              ` : ''}
              <div style="flex:1;font-size:12px;line-height:1.35;">
                ${d.description ? `<div><strong>Setup &amp; Rules:</strong> ${esc(d.description)}</div>` : ''}
                ${d.coachingPoints ? `<div style="margin-top:4px;color:#1a5c1a;"><strong>Coaching Keys:</strong><div style="white-space:pre-line;color:#222;">${esc(d.coachingPoints)}</div></div>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- SUBSEQUENT PAGES: HIGH-RESOLUTION FULL TACTICAL DIAGRAMS (1 PER PAGE FOR PRINT/PDF) -->
    ${drillsWithDiagrams.map((d, i) => `
      <div class="sp-print-page sp-print-diagram-page" style="page-break-before:always;margin-top:24px;">
        <div class="sp-print-header">
          <div style="display:flex;align-items:center;gap:12px;">
            ${logo ? `<img src="${esc(logo)}" class="sp-print-logo" alt="">` : `<div class="sp-print-logo" style="display:flex;align-items:center;justify-content:center;font-size:24px;background:#f0f8f0;">⚽</div>`}
            <div>
              <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:var(--mt);text-transform:uppercase;">${esc(teamName)} · TACTICAL DIAGRAM APPENDIX</div>
              <h1 class="sp-print-title" style="font-size:24px;">DRILL ${d.originalIdx + 1}: ${esc(d.name.toUpperCase())}</h1>
            </div>
          </div>
          <div style="text-align:right;">
            <span class="sp-badge sp-badge-tactical" style="font-size:12px;padding:4px 10px;background:#1a5c1a;color:#fff;border-radius:6px;">[${esc(d.phase)}] ${d.duration} MINS</span>
            <div style="font-size:11.5px;color:var(--mt);margin-top:4px;">${d.dimensions ? `📐 ${esc(d.dimensions)}` : ''} ${d.players ? `· 👥 ${esc(d.players)}` : ''}</div>
          </div>
        </div>

        <!-- Full-Size Crisp Tactical Pitch Diagram -->
        <div style="text-align:center;margin:18px 0;background:#164327;border-radius:12px;padding:12px;border:2px solid #1a5c1a;box-shadow:0 4px 14px rgba(0,0,0,0.15);">
          <img src="${d.diagram}" style="width:100%;max-height:520px;object-fit:contain;border-radius:8px;display:block;margin:0 auto;" alt="${esc(d.name)} Tactical Diagram">
        </div>

        <!-- Drill Coaching Notes & Setup Details -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px;">
          ${d.description ? `
            <div style="background:#f8faf8;border:1px solid #c8dcc8;border-radius:8px;padding:10px 14px;">
              <strong style="color:#1a5c1a;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Setup &amp; Execution Rules:</strong>
              <div style="font-size:12px;line-height:1.4;margin-top:4px;white-space:pre-line;color:#222;">${esc(d.description)}</div>
            </div>
          ` : ''}
          ${d.coachingPoints ? `
            <div style="background:#f0f8f0;border:1px solid #a5d6a7;border-radius:8px;padding:10px 14px;">
              <strong style="color:#1b5e20;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Key Coaching Points (Cues):</strong>
              <div style="font-size:12px;line-height:1.4;margin-top:4px;white-space:pre-line;color:#1b5e20;">${esc(d.coachingPoints)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('')}
  `;
}

function shareSessionWhatsApp(id){
  const s = sessions.find(item => item.id === id);
  if(!s) return;
  const drills = s.drills || [];
  const teamName = (curTeam && curTeam.name) ? curTeam.name.toUpperCase() : 'FOOTBALL CLUB';
  const totalMins = drills.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0) || s.duration || 90;

  const equipLabels = (s.equipment || []).map(eqId => {
    const found = EQUIPMENT_PRESETS.find(e => e.id === eqId);
    return found ? found.label : eqId;
  });

  const text = `⚽ *${teamName} — TRAINING SESSION*
📅 *Date:* ${formatSessionDate(s.date)} ${s.time ? 'at ' + s.time : ''}
📍 *Venue:* ${s.venue || 'Training Ground'}
🎯 *Focus:* ${s.title || 'Tactical Training'}
⏱️ *Duration:* ${totalMins} mins (${s.intensity || 'Medium'} Intensity)

📋 *Objectives:*
${s.objectives || 'Team development and tactical preparation.'}

${equipLabels.length ? `🎽 *Equipment:* ${equipLabels.join(', ')}\n` : ''}
⏱️ *Session Timeline:*
${drills.map((d, i) => `${i + 1}. [${d.phase}] ${d.name} (${d.duration}m)`).join('\n')}

👥 *Please arrive 15 minutes before start time!*`;

  copyToClipboard(text).then(() => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }).catch(() => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  });
}

function shareCurrentSessionWhatsApp(){
  if(currentPrintingSession && currentPrintingSession.id){
    shareSessionWhatsApp(currentPrintingSession.id);
  } else if(currentPrintingSession){
    const s = currentPrintingSession;
    const teamName = (curTeam && curTeam.name) ? curTeam.name.toUpperCase() : 'FOOTBALL CLUB';
    const text = `⚽ *${teamName} — TRAINING PLAN*
📅 *Date:* ${formatSessionDate(s.date)} ${s.time ? 'at ' + s.time : ''}
🎯 *Focus:* ${s.title}
📍 *Venue:* ${s.venue || 'Training Ground'}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   LINEUP STUDIO ISOLATED SCROLL TRAP
   Ensures that scrolling anywhere within the Starting XI slots frame
   (top header, bottom padding, or center) only scrolls the slots list
   and prevents outer page scrolling.
══════════════════════════════════════════════════════════════════════════ */
function setupStudioScrollTrap() {
  const slotsCard = document.querySelector('.lu-slots-card');
  if (slotsCard && !slotsCard._scrollTrapAttached) {
    slotsCard._scrollTrapAttached = true;
    slotsCard.addEventListener('wheel', (e) => {
      const scrollEl = document.getElementById('lu-slots-scroll-container') || slotsCard.querySelector('.lu-slots-scroll');
      if (scrollEl) {
        scrollEl.scrollTop += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
  }

  const pickerCard = document.querySelector('.lu-picker-card');
  if (pickerCard && !pickerCard._scrollTrapAttached) {
    pickerCard._scrollTrapAttached = true;
    pickerCard.addEventListener('wheel', (e) => {
      const scrollEl = document.getElementById('lu-picker-scroll-container') || pickerCard.querySelector('.lu-picker-scroll') || pickerCard.querySelector('.lu-list');
      if (scrollEl) {
        scrollEl.scrollTop += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupStudioScrollTrap();
});
setTimeout(setupStudioScrollTrap, 200);
setTimeout(setupStudioScrollTrap, 1000);


