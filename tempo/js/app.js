
const TAG = {estudio:['Estudio','#0d3b41'], trabajo:['Trabajo','#1f7d85'], personal:['Personal','#56a3a8']};
const ST = {none:['Sin estado','#f3f4f6','#6b7280'], pendiente:['Pendiente','#fdf6d6','#7a5a00'], en_curso:['En curso','#eceff2','#374151'], hecha:['Hecha','#e3f5e8','#1e6b3a']};
const PR  = {alta:['Alta','#fbe9e7','#c0392b'], media:['Media','#fdf3dc','#b7791f'], baja:['Baja','#e6f4ec','#1e8449']};
const DOW = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const SVG = (d, extra='') => `<svg viewBox="0 0 24 24" ${extra}>${d}</svg>`;
const ICON = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'
};
const I = (n, cls='') => `<svg viewBox="0 0 24 24" class="${cls}">${ICON[n]}</svg>`;

const iso = d => { const z=new Date(d); z.setMinutes(z.getMinutes()-z.getTimezoneOffset()); return z.toISOString().slice(0,10); };
const addDays = (d,n) => { const z=new Date(d); z.setDate(z.getDate()+n); return z; };
const pd = s => new Date(s+'T12:00');
const t0 = iso(new Date());
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap = s => s.charAt(0).toUpperCase()+s.slice(1);
const weekStart = d => { const x=new Date(d); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; };
const daysBetween = s => Math.round((pd(s)-pd(t0))/86400000);
const relDay = s => { const n=daysBetween(s); return n===0?'Hoy':n===1?'Mañana':n===-1?'Ayer':pd(s).toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'}).replace('.',''); };
const cmpDate = (a,b) => (a.due_date+(a.due_time||'99:99')).localeCompare(b.due_date+(b.due_time||'99:99'));
const cmpPrio = (a,b) => ({alta:0,media:1,baja:2,none:3}[a.priority]-{alta:0,media:1,baja:2,none:3}[b.priority]) || cmpDate(a,b);

const state = {
  tasks: [], notes: [],
  view:'home', anchor:new Date(), mode:'mes',
  filter:{q:'',status:'todas',tag:'todas',sort:'fecha'},
  editing:null, form:null, noteEditorOpen:false, noteEditingId:null
};
let nextId = 100;
const $ = s => document.querySelector(s);

// Supabase: la publishable key está diseñada para uso en navegador; RLS protege los datos.
const SUPABASE_URL = 'https://irpphxcbrwatfyztwgle.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CU1estT9eb4gjEZWfGIlbA_cGnB83ZA';
let supabase = null;
// Cliente REST propio: evita depender de cargar una biblioteca externa (CDN).
function createRestClient(url, key){
  const storageKey='tempo-supabase-session';
  let session=null, authListener=null;
  try{ session=JSON.parse(localStorage.getItem(storageKey)||'null'); }catch{}
  const saveSession=s=>{ session=s; if(s) localStorage.setItem(storageKey,JSON.stringify(s)); else localStorage.removeItem(storageKey); };
  const emit=(event,s)=>{ if(authListener) authListener(event,s); };
  async function request(path, options={}){
    const headers={apikey:key,'Content-Type':'application/json',...(options.headers||{})};
    if(session?.access_token) headers.Authorization='Bearer '+session.access_token;
    const response=await fetch(url+path,{...options,headers});
    const raw=await response.text(); let data=null; try{data=raw?JSON.parse(raw):null;}catch{data=raw;}
    if(!response.ok) throw new Error(data?.msg||data?.message||data?.error_description||data?.error||('Error HTTP '+response.status));
    return data;
  }
  async function ensureFresh(){
    if(!session?.refresh_token) return;
    if(session.expires_at && Date.now()/1000 < session.expires_at-60) return;
    const response=await fetch(url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){saveSession(null);emit('SIGNED_OUT',null);return;}
    saveSession({...data,expires_at:Math.floor(Date.now()/1000)+(data.expires_in||3600)});
    emit('TOKEN_REFRESHED',session);
  }
  const auth={
    async signUp({email,password}){
      try{
        const data=await request('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password})});
        if(data.access_token){saveSession({...data,expires_at:Math.floor(Date.now()/1000)+(data.expires_in||3600)});emit('SIGNED_IN',session);}
        return {data:{user:data.user||null,session:data.access_token?session:null},error:null};
      }catch(error){return {data:{user:null,session:null},error};}
    },
    async resetPasswordForEmail(email){ try{ await request('/auth/v1/recover',{method:'POST',body:JSON.stringify({email})}); return {error:null}; }catch(error){ return {error}; } },
    async signInWithPassword({email,password}){
      try{
        const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
        saveSession({...data,expires_at:Math.floor(Date.now()/1000)+(data.expires_in||3600)}); emit('SIGNED_IN',session);
        return {data:{user:data.user,session},error:null};
      }catch(error){return {data:{user:null,session:null},error};}
    },
    async getSession(){try{await ensureFresh();return {data:{session},error:null};}catch(error){return {data:{session:null},error};}},
    onAuthStateChange(_event,callback){authListener=callback;return {data:{subscription:{unsubscribe(){authListener=null;}}}};},
    async signOut(){saveSession(null);emit('SIGNED_OUT',null);return {error:null};}
  };
  function from(table){
    let method='GET', body=null, filters=[], ordering=null, selected='*', prefer='';
    const builder={
      select(columns='*'){selected=columns; if(method==='GET') method='GET'; else prefer=prefer?prefer+',return=representation':'return=representation'; return builder;},
      order(column,{ascending=true}={}){ordering=column+'.'+(ascending?'asc':'desc');return builder;},
      upsert(value){method='POST';body=value;prefer='resolution=merge-duplicates,return=minimal';return builder;},
      insert(value){method='POST';body=value;prefer='return=minimal';return builder;},
      delete(){method='DELETE';return builder;},
      eq(column,value){filters.push(column+'=eq.'+encodeURIComponent(value));return builder;},
      then(resolve,reject){(async()=>{try{await ensureFresh();const params=[];if(method==='GET')params.push('select='+encodeURIComponent(selected));if(ordering)params.push('order='+encodeURIComponent(ordering));params.push(...filters);const qs=params.length?'?'+params.join('&'):'';const headers={};if(prefer)headers.Prefer=prefer;const data=await request('/rest/v1/'+table+qs,{method,headers,body:body?JSON.stringify(body):undefined});return {data,error:null};}catch(error){return {data:null,error};}})().then(resolve,reject);}
    }; return builder;
  }
  return {auth,from};
}
let currentUser = null;
let focusRows = [];
let authBusy = false;

/* ---- Cifrado de extremo a extremo: Web Crypto API ----
   La clave solo vive en memoria mientras la cuenta está desbloqueada.
   La contraseña no se almacena ni se envía a las tablas de datos.
*/
let tempoCryptoKey = null;
let tempoCryptoSalt = null;
const TEMPO_KDF_ITERATIONS = 600000;
const TEMPO_CRYPTO_VERSION = 1;
const bytesToB64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const b64ToBytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));

async function deriveTempoKey(password, saltB64){
  const material = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {name:'PBKDF2', salt:b64ToBytes(saltB64), iterations:TEMPO_KDF_ITERATIONS, hash:'SHA-256'},
    material, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']
  );
}
async function encryptTempoPayload(payload){
  if(!tempoCryptoKey) throw new Error('La cuenta está bloqueada.');
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const plain=new TextEncoder().encode(JSON.stringify(payload));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},tempoCryptoKey,plain);
  return {ciphertext:bytesToB64(cipher),iv:bytesToB64(iv)};
}
async function decryptTempoPayload(row){
  if(!tempoCryptoKey) throw new Error('La cuenta está bloqueada.');
  const plain=await crypto.subtle.decrypt(
    {name:'AES-GCM',iv:b64ToBytes(row.iv)},tempoCryptoKey,b64ToBytes(row.ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(plain));
}
async function putEncryptedRecord(type, id, payload){
  const encrypted=await encryptTempoPayload(payload);
  const row={id,user_id:currentUser.id,record_type:type,ciphertext:encrypted.ciphertext,iv:encrypted.iv,crypto_version:TEMPO_CRYPTO_VERSION};
  const {error}=await supabase.from('encrypted_records').upsert(row);
  if(error) throw error;
  return true;
}
async function deleteEncryptedRecord(type,id){
  const {error}=await supabase.from('encrypted_records').delete().eq('id',id).eq('record_type',type);
  if(error) throw error;
  return true;
}
function lockTempo(){
  tempoCryptoKey=null; tempoCryptoSalt=null;
  state.tasks=[];state.notes=[];state.focus=[];focusRows=[];categoryRows=[];
  Object.keys(TAG).forEach(k=>delete TAG[k]);
}
async function initialiseOrUnlockCrypto(password){
  if(!window.isSecureContext || !window.crypto?.subtle) throw new Error('El cifrado requiere HTTPS o localhost y un navegador compatible.');
  const metaResult=await supabase.from('crypto_meta').select('*').eq('user_id',currentUser.id);
  if(metaResult.error) throw new Error('No se pudo consultar crypto_meta. Ejecuta primero el SQL de configuración.');
  let meta=(metaResult.data||[])[0];
  if(!meta){
    const salt=crypto.getRandomValues(new Uint8Array(16));
    meta={user_id:currentUser.id,salt:bytesToB64(salt),kdf_iterations:TEMPO_KDF_ITERATIONS,crypto_version:TEMPO_CRYPTO_VERSION};
    const saved=await supabase.from('crypto_meta').upsert(meta);
    if(saved.error) throw new Error('No se pudo inicializar el cifrado: '+saved.error.message);
  }
  tempoCryptoSalt=meta.salt;
  tempoCryptoKey=await deriveTempoKey(password,meta.salt);
  // Verifica la contraseña/clave antes de continuar. Si ya hay registros cifrados,
  // el primero debe poder descifrarse; si no, se usará la migración inicial.
  const encrypted=await supabase.from('encrypted_records').select('*').eq('user_id',currentUser.id);
  if(encrypted.error) throw new Error('No se pudo acceder a encrypted_records. Ejecuta primero el SQL de configuración.');
  if((encrypted.data||[]).length){
    try{ await decryptTempoPayload(encrypted.data[0]); }
    catch{ lockTempo(); throw new Error('La contraseña no permite descifrar los datos de esta cuenta. Si has restablecido la contraseña, los datos antiguos no se pueden recuperar.'); }
  }
  // Las tablas antiguas ya se eliminaron tras completar la migración.
  // A partir de aquí se trabaja exclusivamente con encrypted_records.
}
/* Migración histórica desactivada: las tablas legacy ya no existen.
async function migrateLegacyRecords(existingEncrypted){
  const existing=new Set(existingEncrypted.map(r=>r.record_type+':'+r.id));
  const [tr,fr,nr,cr]=await Promise.all([
    supabase.from('tasks').select('*'),
    supabase.from('focus_sessions').select('*'),
    supabase.from('general_notes').select('*'),
    supabase.from('categories').select('*')
  ]);
  const errors=[tr.error,fr.error,nr.error,cr.error].filter(Boolean);
  if(errors.length) throw new Error('No se pudieron leer todos los datos antiguos para migrarlos: '+errors[0].message);
  const jobs=[];
  for(const row of tr.data||[]) if(!existing.has('task:'+row.id)) jobs.push(()=>putEncryptedRecord('task',row.id,appTask(row)));
  for(const row of fr.data||[]) if(!existing.has('focus:'+row.id)) {
    const {user_id,...payload}=row; jobs.push(()=>putEncryptedRecord('focus',row.id,payload));
  }
  for(const row of nr.data||[]) if(!existing.has('note:'+row.id)) {
    const {user_id,...payload}=row; jobs.push(()=>putEncryptedRecord('note',row.id,payload));
  }
  for(const row of cr.data||[]) if(!existing.has('category:'+row.id)) {
    const {user_id,...payload}=row; jobs.push(()=>putEncryptedRecord('category',row.id,payload));
  }
  // Migración reanudable y secuenciada en lotes pequeños para evitar saturar Supabase.
  for(let i=0;i<jobs.length;i+=10) await Promise.all(jobs.slice(i,i+10).map(job=>job()));
}
*/
async function fetchEncryptedRecords(){
  const {data,error}=await supabase.from('encrypted_records').select('*').eq('user_id',currentUser.id);
  if(error) throw error;
  const decoded={task:[],focus:[],note:[],category:[]};
  for(const row of data||[]){
    if(!decoded[row.record_type]) continue;
    decoded[row.record_type].push({id:row.id,payload:await decryptTempoPayload(row)});
  }
  return decoded;
}
function authMessage(msg, error=false){ const el=$('#auth-msg'); if(el){el.textContent=msg;el.style.color=error?'#b42318':'#1e5f66';} }
function showAuth(){ $('#auth-screen').style.display='grid'; $('.app').style.display='none'; }
function showApp(){ $('#auth-screen').style.display='none'; $('.app').style.display='grid'; updateAccountBadge(); }
function dbTask(t){ return {id:t.id,series_id:t.series_id||null,user_id:currentUser.id,title:t.title,description:t.description||null,due_date:t.due_date,due_time:t.due_time||null,end_time:t.end_time||null,repeat:t.repeat||'none',reminder:t.reminder||'none',status:t.status,tag:t.tag,priority:t.priority||'none',subtasks:t.subtasks||[],history:t.history||[],done_at:t.doneAt||null}; }
function appTask(r){ return {id:r.id,series_id:r.series_id||null,title:r.title,description:r.description||'',due_date:r.due_date,due_time:r.due_time,end_time:r.end_time,repeat:r.repeat||'none',reminder:r.reminder||'none',status:r.status,tag:r.tag,priority:r.priority||'none',subtasks:r.subtasks||[],history:r.history||[],doneAt:r.done_at||null}; }
function userCacheKey(){ return null; }
function saveLocalCache(){
  // No se persiste contenido descifrado en localStorage.
}
function loadLocalCache(){ return false; }
async function persistTask(t){
  if(!currentUser||!t||!tempoCryptoKey) return false;
  try{ await putEncryptedRecord('task',t.id,{...t}); return true; }
  catch(error){console.error('Error guardando tarea cifrada:',error);toast('No se pudo sincronizar la tarea: '+error.message);return false;}
}
async function removeTaskFromDB(id){
  if(!currentUser||!tempoCryptoKey) return false;
  try{await deleteEncryptedRecord('task',id);return true;}
  catch(error){console.error('Error eliminando tarea cifrada:',error);toast('No se pudo sincronizar la eliminación: '+error.message);return false;}
}
function noteStatusLabel(status){return status==='en_curso'?'En curso':status==='hecha'?'Hecha':'Sin empezar';}
function renderGeneralBoard(){
  const rows=state.notes||[];
  const editing=state.noteEditorOpen;
  const current=state.noteEditingId?rows.find(n=>n.id===state.noteEditingId):null;
  const editor=editing?`<tr class="note-editor-row">
    <td><input id="note-area" type="text" maxlength="80" placeholder="Ej. Estudios, Trabajo, Personal" value="${esc(current?.area||'')}" aria-label="Tema o área"></td>
    <td><input id="note-title" type="text" maxlength="180" placeholder="Nombre de la tarea" value="${esc(current?.title||'')}" aria-label="Nombre de la tarea"></td>
    <td><select id="note-status" aria-label="Estado">
      <option value="pendiente" ${(!current||current.status==='pendiente')?'selected':''}>Sin empezar</option>
      <option value="en_curso" ${current?.status==='en_curso'?'selected':''}>En curso</option>
      <option value="hecha" ${current?.status==='hecha'?'selected':''}>Hecha</option>
    </select></td>
    <td><div class="note-editor-actions"><button class="note-save" data-act="note-save">Guardar</button><button class="note-cancel" data-act="note-cancel">Cancelar</button></div>${current?`<button class="board-icon-btn note-del-btn" data-act="note-delete" data-id="${esc(current.id)}" title="Eliminar">${I('trash')} Eliminar</button>`:''}</td>
  </tr>`:'';
  const body=rows.length?rows.map(n=>`<tr data-note-row="${esc(n.id)}" title="Haz doble clic para editar">
    <td>${esc(n.area||'General')}</td><td>${esc(n.title)}</td>
    <td><button class="board-status" data-status="${esc(n.status)}" data-act="note-cycle" data-id="${esc(n.id)}" title="Cambiar estado">${noteStatusLabel(n.status)}</button></td>
    <td class="board-actions"><button class="board-icon-btn" data-act="note-edit" data-id="${esc(n.id)}" title="Editar" aria-label="Editar">${I('edit')}</button></td>
  </tr>`).join(''):'<tr><td colspan="4"><div class="board-empty">Todavía no tienes pendientes generales. Añade aquí ideas o cosas que quieras hacer sin asignarles una fecha.</div></td></tr>';
  return `<section class="general-board">
    <div class="sec-h"><div><h2>Por hacer <span>${rows.length}</span></h2><div class="board-sub">Pendientes generales · Sin fecha</div></div></div>
    <div class="general-table-wrap"><table class="general-table"><thead><tr><th>TEMA / ÁREA</th><th>NOMBRE DE LA TAREA</th><th>ESTADO</th><th></th></tr></thead><tbody>${body}${editor}</tbody></table></div>
    ${!editing?`<button class="board-add" data-act="note-add">${I('plus')} Añadir</button>`:''}
  </section>`;
}
async function saveGeneralNote(note){
  if(!currentUser)return;
  const row={id:note.id||crypto.randomUUID(),user_id:currentUser.id,area:note.area||'General',title:note.title,status:note.status||'pendiente',created_at:note.created_at||new Date().toISOString()};
  try{await putEncryptedRecord('note',row.id,{area:row.area,title:row.title,status:row.status,created_at:row.created_at});}
  catch(error){console.error('Error guardando pendiente cifrado:',error);toast('No se pudo guardar el pendiente: '+error.message);return false;}
  const i=state.notes.findIndex(x=>x.id===row.id);if(i>=0)state.notes[i]=row;else state.notes.unshift(row);
  render();return true;
}
function addGeneralNote(){state.noteEditingId=null;state.noteEditorOpen=true;render();setTimeout(()=>$('#note-area')?.focus(),0);}
function editGeneralNote(id){state.noteEditingId=id;state.noteEditorOpen=true;render();setTimeout(()=>$('#note-area')?.focus(),0);}
async function saveNoteFromEditor(){
  const area=($('#note-area')?.value||'').trim()||'General';
  const title=($('#note-title')?.value||'').trim();
  const status=$('#note-status')?.value||'pendiente';
  if(!title){$('#note-title')?.focus();toast('Escribe el nombre de la tarea');return;}
  const existing=state.notes.find(n=>n.id===state.noteEditingId);
  if(status==='hecha' && existing){
    const removed=await deleteGeneralNote(existing.id, false);
    if(removed){state.noteEditorOpen=false;state.noteEditingId=null;render();toast('Pendiente completado y eliminado');}
    return;
  }
  const note={...(existing||{}),area,title,status};
  if(await saveGeneralNote(note)){state.noteEditorOpen=false;state.noteEditingId=null;render();toast(existing?'Pendiente actualizado':'Pendiente guardado');}
}
async function cycleGeneralNote(id){
  const n=state.notes.find(x=>x.id===id);if(!n)return;
  if(n.status==='en_curso'){await deleteGeneralNote(id,false);return;}
  n.status=n.status==='pendiente'?'en_curso':'pendiente';
  if(await saveGeneralNote(n))toast('Estado actualizado');
}
function askConfirm(msg){
  return new Promise(resolve=>{
    const w=document.createElement('div'); w.className='ov open'; w.id='confirm-ask';
    w.innerHTML=`<div class="modal sa-box"><h2>Eliminar pendiente</h2><div class="sub">${esc(msg)}</div><div class="sa-actions"><button class="btn secondary" data-ca="no">Cancelar</button><button class="btn danger-solid" data-ca="yes">Eliminar</button></div></div>`;
    document.body.appendChild(w);
    w.addEventListener('click', ev=>{
      if(ev.target===w){ w.remove(); resolve(false); return; }
      const b=ev.target.closest('[data-ca]'); if(!b) return;
      w.remove(); resolve(b.dataset.ca==='yes');
    });
  });
}
async function deleteGeneralNote(id, ask=true){
  const n=state.notes.find(x=>x.id===id);if(!n)return false;
  if(ask && !(await askConfirm('¿Seguro que quieres eliminar este pendiente?')))return false;
  try{await deleteEncryptedRecord('note',id);}
  catch(error){toast('No se pudo eliminar: '+error.message);return false;}
  state.notes=state.notes.filter(x=>x.id!==id);render();
  if(ask)toast('Pendiente eliminado');
  return true;
}
async function persistFocusSession(t, minutes){
  if(!currentUser||!minutes||minutes<1) return false;
  const row={id:crypto.randomUUID(),task_id:t?.id||null,tag:t?.tag||'personal',minutes,session_date:iso(new Date())};
  try{await putEncryptedRecord('focus',row.id,row);focusRows.push(row);return true;}
  catch(error){console.error('Error guardando sesión cifrada:',error);toast('No se pudo sincronizar la sesión: '+error.message);return false;}
}
async function loadUserData(password){
  if(!currentUser) return;
  if(!password){
    showAuth();
    authMessage('Por seguridad, vuelve a introducir tu contraseña para desbloquear tus datos cifrados.');
    return;
  }
  showApp();
  toast('Desbloqueando y sincronizando…');
  try{
    await initialiseOrUnlockCrypto(password);
    const records=await fetchEncryptedRecords();
    state.tasks=records.task.map(x=>({...x.payload,id:x.id}));
    focusRows=records.focus.map(x=>({...x.payload,id:x.id}));
    state.notes=records.note.map(x=>({...x.payload,id:x.id}));
    categoryRows=records.category.map(x=>({...x.payload,id:x.id,user_id:currentUser.id}));
    if(!categoryRows.length){
      categoryRows=CAT_DEFAULTS.map(([key,name,color])=>({id:crypto.randomUUID(),key,name,color,user_id:currentUser.id}));
      for(const row of categoryRows) await putEncryptedRecord('category',row.id,{key:row.key,name:row.name,color:row.color});
    }
    setCategories(categoryRows);
    state.focus=focusRows.map(x=>({tag:x.tag,min:x.minutes}));
    // Elimina cualquier caché antigua que pudiera contener texto sin cifrar.
    try{Object.keys(localStorage).filter(k=>k.startsWith('tempo-cache-')).forEach(k=>localStorage.removeItem(k));}catch{}
    render();
    toast('Datos descifrados y sincronizados');
  }catch(error){
    console.error('Error desbloqueando Tempo:',error);
    lockTempo();showAuth();
    authMessage(error.message||'No se pudieron desbloquear los datos.',true);
  }
}
function updateAccountBadge(){
  const email=currentUser?.email||'Cuenta';
  const name=email.split('@')[0]||'T';
  const avatar=$('#user-avatar'), label=$('#user-email');
  if(avatar) avatar.textContent=name.trim().charAt(0).toUpperCase()||'T';
  if(label) label.textContent=name;
}
async function signOutTempo(){
  const button=document.querySelector('[data-act="logout"]');
  if(button) button.disabled=true;
  try{
    const {error}=await supabase.auth.signOut();
    if(error) throw error;
    currentUser=null; lockTempo();
    showAuth(); authMessage('Has cerrado sesión correctamente.');
    $('#auth-password').value='';
  }catch(error){toast('No se pudo cerrar sesión: '+(error.message||'Error desconocido'));}
  finally{if(button) button.disabled=false;}
}

async function signInOrSignUp(mode){
  if(!supabase){authMessage('La conexión todavía no está lista. Espera unos segundos y vuelve a intentarlo.',true);return;}
  if(authBusy) return;
  const btn=$('#auth-submit'), email=$('#auth-email').value.trim(), password=$('#auth-password').value;
  // El botón Crear cuenta está fuera del formulario; validar aquí expresamente.
  if(!email){authMessage('Introduce tu correo electrónico.',true);$('#auth-email').focus();return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){authMessage('Introduce un correo electrónico válido.',true);$('#auth-email').focus();return;}
  if(!password){authMessage('Introduce una contraseña.',true);$('#auth-password').focus();return;}
  if(password.length<6){authMessage('La contraseña debe tener al menos 6 caracteres.',true);$('#auth-password').focus();return;}
  authBusy=true;
  btn.disabled=true; btn.textContent='Conectando…';
  try{
    const result=mode==='signup'
      ? await supabase.auth.signUp({email,password})
      : await supabase.auth.signInWithPassword({email,password});
    if(result.error) throw result.error;
    if(mode==='signup'&&!result.data.session){authMessage('Cuenta creada. Revisa tu correo para confirmar el registro.');}
    else if(result.data.user){currentUser=result.data.user;await loadUserData(password);}
  }catch(err){authMessage(err.message||'No se pudo iniciar sesión.',true);}
  finally{authBusy=false;btn.disabled=false;btn.textContent='Iniciar sesión';}
}
$('#auth-form').addEventListener('submit',e=>{e.preventDefault();signInOrSignUp('signin');});
$('#auth-signup').addEventListener('click',()=>signInOrSignUp('signup'));
(async()=>{
  showAuth();
  const submit=$('#auth-submit'), signup=$('#auth-signup');
  submit.disabled=true; signup.disabled=true; authMessage('Conectando con Supabase…');
  try{
    await handleOAuthHash(); supabase=createRestClient(SUPABASE_URL,SUPABASE_KEY);
    supabase.auth.onAuthStateChange((event,session)=>{
      if(session?.user){currentUser=session.user;}
      else if(event==='SIGNED_OUT'){currentUser=null;lockTempo();showAuth();}
    });
    const {data,error}=await supabase.auth.getSession();
    if(error) throw error;
    if(data.session?.user){currentUser=data.session.user;authMessage('Sesión encontrada. Introduce tu contraseña para desbloquear tus datos.');}
    else authMessage('Introduce tu correo y contraseña o crea una cuenta.');
  }catch(err){authMessage(err.message||'No se pudo conectar con Supabase.',true);}
  finally{submit.disabled=false;signup.disabled=false;}
})();
const tasksOn = key => state.tasks.filter(t=>t.due_date===key).sort(cmpDate);
const isLate = t => t.status!=='hecha' && t.due_date<t0;

function toast(msg){
  const el=$('#toast'); el.textContent=msg; el.classList.add('show');
  clearTimeout(window._tt); window._tt=setTimeout(()=>el.classList.remove('show'),2000);
}
const tagBadge = k => `<span class="tagc"><i class="dot" style="--c:${TAG[k][1]}"></i>${TAG[k][0]}</span>`;
const dotTag = k => `<span class="dot" style="--c:${TAG[k][1]}"></span>${TAG[k][0]}`;

function item(t){
  const done=t.status==='hecha', late=isLate(t);
  return `<div class="item ${done?'done':''}">
    <button class="chk ${done?'on':''}" data-act="toggle" data-id="${t.id}" aria-label="Completar">${done?I('check'):''}</button>
    <div class="item-main" data-act="edit" data-id="${t.id}">
      <div class="item-t">${esc(t.title)}</div>
      <div class="item-m">
        <span><i class="dot" style="--c:${TAG[t.tag][1]}"></i>${TAG[t.tag][0]}</span>
        <span>${t.due_time?t.due_time.slice(0,5):'Todo el día'}</span>
        <span>${relDay(t.due_date)}</span>
        ${late?'<span class="badge red">Atrasada</span>':''}
        ${t.status==='en_curso'?'<span class="badge blue">En curso</span>':''}
      </div>
    </div>
    <div class="acts">
      ${late?`<button class="ibtn" data-act="postpone" data-id="${t.id}" title="Pasar a mañana">${I('arrow')}</button>`:''}
      <button class="ibtn" data-act="edit" data-id="${t.id}" title="Editar">${I('edit')}</button>
      <button class="ibtn del" data-act="delete" data-id="${t.id}" title="Eliminar">${I('trash')}</button>
    </div>
  </div>`;
}

function listOrEmpty(arr, msg){
  return arr.length?`<div class="list">${arr.map(item).join('')}</div>`:`<div class="empty">${msg}</div>`;
}

function itemHome(t){
  const done=t.status==='hecha';
  return `<div class="item ${done?'done':''}">
    <button class="chk ${done?'on':''}" data-act="toggle" data-id="${t.id}" aria-label="Completar">${done?I('check'):''}</button>
    <div class="item-main" data-act="edit" data-id="${t.id}">
      <div class="item-t">${esc(t.title)}</div>
      <div class="item-m">
        <span><i class="dot" style="--c:${TAG[t.tag][1]}"></i>${TAG[t.tag][0]}</span>
        <span>${t.due_time?t.due_time.slice(0,5):'Todo el día'}</span>
        <span>${relDay(t.due_date)}</span>
      </div>
    </div>
    <div class="acts">
      ${isLate(t)?`<button class="ibtn" data-act="postpone" data-id="${t.id}" title="Pasar a mañana">${I('arrow')}</button>`:''}
      <button class="ibtn" data-act="edit" data-id="${t.id}" title="Editar">${I('edit')}</button>
      <button class="ibtn del" data-act="delete" data-id="${t.id}" title="Eliminar">${I('trash')}</button>
    </div>
  </div>`;
}
function renderHomeV5(){
  const item=itemHome;
  const T=state.tasks, open=T.filter(t=>t.status!=='hecha');
  const hoy=open.filter(t=>t.due_date===t0).sort(cmpDate);
  const late=open.filter(t=>t.due_date<t0).sort(cmpDate);
  const done=T.filter(t=>t.status==='hecha').length;
  const pct=T.length?Math.round(done/T.length*100):0;
  const next=[1,2,3,4,5,6,7].map(n=>{ const k=iso(addDays(new Date(),n)); return {n,k,list:open.filter(t=>t.due_date===k).sort(cmpDate)}; });
  const total7=next.reduce((s,d)=>s+d.list.length,0);
  const dateTxt=cap(new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}));
  const dayHead=d=>{ const x=pd(d.k); return `<div class="day-h"><b>${d.n===1?'Mañana':cap(x.toLocaleDateString('es-ES',{weekday:'long'}))} ${x.getDate()}</b></div>`; };
  const upcomingHTML=next.filter(d=>d.list.length).map(d=>`${dayHead(d)}<div class="list">${d.list.map(item).join('')}</div>`).join('')||'<div class="empty">No hay entregas en los próximos 7 días.</div>';
  return `
  <div class="page-h">
    <div><h1>${dateTxt}</h1><div class="sub">${hoy.length} para hoy${late.length?` · ${late.length} atrasadas`:''} · ${done} de ${T.length} hechas</div></div>
    <button class="btn primary" data-act="new">${I('plus')} Nueva tarea</button>
  </div>
  <div class="stats">
    <div class="stat"><div class="sh"><span class="sico">${SVG(ICON.cal)}</span><span class="l">Para hoy</span></div><div class="v">${hoy.length}</div><div class="cap">Tareas con fecha de hoy</div></div>
    <div class="stat"><div class="sh"><span class="sico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><span class="l">Atrasadas</span></div><div class="v">${late.length}</div><div class="cap">Pendientes de días anteriores</div></div>
    <div class="stat"><div class="sh"><span class="sico"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="l">Próximos 7 días</span></div><div class="v">${total7}</div><div class="cap">Entregas en la próxima semana</div></div>
    <div class="stat"><div class="sh"><span class="sico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span><span class="l">Completado</span></div><div class="v">${pct}%</div><div class="pbar"><div style="width:${pct}%"></div></div></div>
  </div>
  <div class="home-cols">
    <section>
      ${late.length?`<div class="sec-h"><h2>Atrasadas <span>${late.length}</span></h2></div><div class="list">${late.map(item).join('')}</div><div style="height:28px"></div>`:''}
      <div class="sec-h"><h2>Hoy <span>${hoy.length}</span></h2></div>
      ${hoy.length?`<div class="list">${hoy.map(item).join('')}</div>`:'<div class="empty">No tienes tareas para hoy.</div>'}
      ${renderGeneralBoard()}
    </section>
    <aside>
      <div class="sec-h"><h2>Próximos 7 días</h2><button class="link" data-act="go" data-view="calendar">Calendario</button></div>
      ${upcomingHTML}
    </aside>
  </div>`;
}
function renderHome(){ return renderHomeV5(); }
function pill(t){
  const hora=t.due_time?`${t.due_time.slice(0,5)}${t.end_time?'–'+t.end_time.slice(0,5):''}`:'';
  return `<div class="ev ${t.status==='hecha'?'done':''} ${isLate(t)?'late':''}" style="--c:${TAG[t.tag][1]}" data-act="edit" data-id="${t.id}" draggable="true" data-drag="${t.id}" title="${esc(t.title)}">
    <div class="ev-top">${hora?`<em>${hora}</em>`:''}<span class="ev-t">${esc(t.title)}</span></div>
    ${t.description?`<div class="ev-d">${esc(t.description)}</div>`:''}
  </div>`;
}

function monthGrid(){
  const a=state.anchor, first=new Date(a.getFullYear(),a.getMonth(),1);
  const offset=(first.getDay()+6)%7;
  const dim=new Date(a.getFullYear(),a.getMonth()+1,0).getDate();
  const rows=Math.ceil((offset+dim)/7);
  let cells='';
  for(let i=0;i<rows*7;i++){
    const dayNum=i-offset+1;
    if(dayNum<1||dayNum>dim){ cells+='<div class="cell empty"></div>'; continue; }
    const d=new Date(a.getFullYear(),a.getMonth(),dayNum), key=iso(d), list=tasksOn(key);
    cells+=`<div class="cell ${key===t0?'today':''}" data-day="${key}">
      <div class="n"><b>${dayNum}</b><button class="add" data-act="new-day" data-day="${key}" title="Añadir tarea">+</button></div>
      ${list.slice(0,3).map(pill).join('')}${list.length>3?`<button class="more-btn" data-act="more-day" data-day="${key}">+${list.length-3} más</button>`:''}
    </div>`;
  }
  const heads=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=>`<div class="dh">${d}</div>`).join('');
  return `<div class="scroll"><div class="cal"><div class="cal-grid">${heads}${cells}</div></div></div>`;
}

function weekView(){
  const ws=weekStart(state.anchor);
  let cols='';
  for(let i=0;i<7;i++){
    const d=addDays(ws,i), key=iso(d), list=tasksOn(key);
    cols+=`<div class="wc ${key===t0?'today':''}" data-day="${key}">
      <div class="wh"><span>${DOW[i].slice(0,3)}</span><b>${d.getDate()}</b></div>
      <div class="wgrid">${timeGrid(key,list,{scale:0.8,maxCols:2,labels:false})}</div>
      <button class="add" data-act="new-day" data-day="${key}">+ Añadir</button>
    </div>`;
  }
  return `<div class="scroll"><div class="week">${cols}</div></div>`;
}

function renderCal(){
  const a=state.anchor, ws=weekStart(a);
  const title = state.mode==='dia' ? cap(a.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})) : state.mode==='mes'
    ? a.toLocaleDateString('es-ES',{month:'long',year:'numeric'})
    : `${ws.getDate()} – ${addDays(ws,6).getDate()} de ${addDays(ws,6).toLocaleDateString('es-ES',{month:'long',year:'numeric'})}`;
  return `
  <div class="page-h">
    <div><h1>Calendario</h1><div class="sub">Todas tus tareas por fecha</div></div>
    <button class="btn primary" data-act="new">${I('plus')} Nueva tarea</button>
  </div>
  <div class="toolbar">
    <div class="tb-l">
      <button class="iconbox" data-act="prev" aria-label="Anterior">${I('left')}</button>
      <button class="btn secondary" data-act="today" style="height:32px">Hoy</button>
      <button class="iconbox" data-act="next" aria-label="Siguiente">${I('right')}</button>
      <h2>${title}</h2>
    </div>
    <div class="seg">
      <button class="${state.mode==='mes'?'on':''}" data-act="mode" data-v="mes">Mes</button>
      <button class="${state.mode==='dia'?'on':''}" data-act="mode" data-v="dia">Día</button>
      <button class="${state.mode==='semana'?'on':''}" data-act="mode" data-v="semana">Semana</button>
    </div>
  </div>
  ${state.mode==='mes'?monthGrid():state.mode==='dia'?dayView():weekView()}`;
}

function filtered(){
  const f=state.filter;
  const list=state.tasks.filter(t=>
    (!f.q || t.title.toLowerCase().includes(f.q.toLowerCase())) &&
    (f.status==='todas' || t.status===f.status || (f.status==='atrasadas' && isLate(t))) &&
    (f.tag==='todas' || t.tag===f.tag));
  const base=f.sort==='prioridad'?cmpPrio:cmpDate; return list.sort((a,b)=>((a.status==='hecha')-(b.status==='hecha'))||base(a,b));
}

function tableHTML(){ if(state.layout==='tablero') return boardHTML();
  const list=filtered();
  if(!list.length) return '<div class="empty">No hay tareas con estos filtros.</div>';
  return `<div class="table"><table>
    <thead><tr><th style="width:44px"></th><th>Tarea</th><th>Etiqueta</th><th>Prioridad</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
    <tbody>${list.map(t=>{
      const done=t.status==='hecha';
      return `<tr class="${done?'done':''}">
        <td><button class="chk ${done?'on':''}" data-act="toggle" data-id="${t.id}" aria-label="Completar">${done?I('check'):''}</button></td>
        <td class="t-main" data-act="edit" data-id="${t.id}"><div class="t" style="font-weight:500">${esc(t.title)}</div>${t.description?`<div class="muted" style="font-size:13px">${esc(t.description)}</div>`:''}</td>
        <td>${tagBadge(t.tag)}</td>
        <td>${t.priority&&t.priority!=='none'?`<span class="prio">${prioArrow(t.priority)} ${PR[t.priority][0]}</span>`:'<span class="muted">—</span>'}</td>
        <td><div>${relDay(t.due_date)}</div><div class="muted" style="font-size:13px">${pd(t.due_date).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}${t.due_time?' · '+t.due_time.slice(0,5):''}</div></td>
        <td><button class="pill" data-act="cycle" data-id="${t.id}" title="Cambiar estado" style="background:${ST[t.status][1]};color:${ST[t.status][2]}">${ST[t.status][0]}</button></td>
        <td class="right"><span class="acts" style="opacity:1"><button class="ibtn" data-act="edit" data-id="${t.id}" title="Editar">${I('edit')}</button><button class="ibtn del" data-act="delete" data-id="${t.id}" title="Eliminar">${I('trash')}</button></span></td>
      </tr>`;}).join('')}
    </tbody></table></div>`;
}

function renderTasks(){
  const f=state.filter;
  const count=k=>state.tasks.filter(t=>k==='todas'?true:k==='atrasadas'?isLate(t):t.status===k).length;
  const tabs=[['todas','Todas'],['pendiente','Pendientes'],['en_curso','En curso'],['atrasadas','Atrasadas'],['hecha','Hechas']];
  return `
  <div class="page-h">
    <div><h1>Tareas</h1></div>
    <button class="btn primary" data-act="new">${I('plus')} Nueva tarea</button>
  </div>
  <div class="tabs">${tabs.map(([v,l])=>`<button class="${f.status===v?'on':''}" data-act="fstatus" data-v="${v}">${l}</button>`).join('')}</div>
  <div class="tools">
    <div class="search">${I('search')}<input type="search" id="q" placeholder="Buscar tareas" value="${esc(f.q)}"></div>
    <div class="chips">
      <button class="${f.tag==='todas'?'on':''}" data-act="ftag" data-v="todas">Todas</button>
      ${Object.keys(TAG).map(k=>`<button class="${f.tag===k?'on':''}" data-act="ftag" data-v="${k}">${TAG[k][0]}</button>`).join('')}
    </div>
    <div class="view-grp" style="margin-left:auto;display:flex;align-items:center;gap:10px"><div class="seg"><button class="${state.layout!=='tablero'?'on':''}" data-act="layout" data-v="lista">Lista</button><button class="${state.layout==='tablero'?'on':''}" data-act="layout" data-v="tablero">Tablero</button></div>
    <select id="sort">
      <option value="fecha" ${f.sort==='fecha'?'selected':''}>Ordenar por fecha</option>
      <option value="prioridad" ${f.sort==='prioridad'?'selected':''}>Ordenar por prioridad</option>
    </select></div>
  </div>
  <div id="tbl">${tableHTML()}</div>`;
}

function renderSide(){
  const open=state.tasks.filter(t=>t.status!=='hecha').length;
  const today=state.tasks.filter(t=>t.due_date===t0&&t.status!=='hecha').length;
  $('#n-home').innerHTML=`${SVG(ICON.home)}Inicio`;
  $('#n-cal').innerHTML=`${SVG(ICON.cal)}Calendario`;
  $('#n-stats').innerHTML=`${SVG(ICON.home)}Productividad`;
  $('#n-focus').innerHTML=`<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M10 2h4M12 2v3"/></svg>Modo enfoque`;
  $('#n-tasks').innerHTML=`${SVG(ICON.list)}Tareas`;
  const tagnav=$('#tagnav'); if(tagnav) tagnav.innerHTML=Object.keys(TAG).map(k=>{
    const n=state.tasks.filter(t=>t.tag===k&&t.status!=='hecha').length;
    return `<button class="tg" data-act="ftag-nav" data-v="${k}"><i class="dot" style="--c:${TAG[k][1]};background:${TAG[k][1]}"></i>${TAG[k][0]}</button>`;
  }).join('');
  document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('on', b.dataset.view===state.view));
}

function render(){ const mn=$('#main'); const sc=mn?mn.scrollTop:0; renderCore(); const mn2=$('#main'); if(mn2) mn2.scrollTop=sc; }
function renderCore(){
  renderSide();
  $('#main').innerHTML = state.view==='home'?renderHome():state.view==='calendar'?renderCal():state.view==='stats'?renderStats():renderTasks();
}

/* Modal */
const OPTS = {
  get tag(){ return TAG; },
  priority:{alta:['Alta','#4b5563'],media:['Media','#4b5563'],baja:['Baja','#4b5563']},
  status:{pendiente:['Pendiente','#4b5563'],en_curso:['En curso','#2d4a6e'],hecha:['Hecha','#2f6f4f']}
};
function opts(k){
  const pills=Object.entries(OPTS[k]).map(([v,[l,c]])=>`<button type="button" class="${state.form[k]===v?'on':''}" style="--c:${c}" data-act="pick" data-k="${k}" data-v="${v}">${l}</button>`).join('');
  if(k!=='tag') return `<div class="opts nodot">${pills}</div>`;
  return `<div class="opts">${pills}</div><div class="cat-row"><button type="button" class="btn primary sm" data-act="cat-add">+ Nueva etiqueta</button>${state.form.tag&&TAG[state.form.tag]?'<button type="button" class="btn primary sm" data-act="cat-edit">Editar etiqueta</button>':''}</div>${catDraftHTML()}`;
}
function readFormV4(){
  const f=state.form, g=id=>{const el=$('#'+id); return el?el.value:undefined;};
  if(!$('#f-title')) return;
  const cn=$('#cat-name'); if(cn&&state.catDraft) state.catDraft.name=cn.value;
  f.title=g('f-title'); f.description=g('f-desc'); f.due_date=g('f-date')||t0; f.due_time=g('f-time'); f.end_time=g('f-end'); f.repeat=g('f-repeat');
}
function readForm(){ return readFormV4(); }
function readFormOld(){
  const f=state.form;
  f.title=$('#f-title').value; f.description=$('#f-desc').value;
  f.due_date=$('#f-date').value||t0; f.due_time=$('#f-time').value;
}
function optSel(cur,map){return Object.entries(map).map(([v,l])=>`<option value="${v}" ${cur===v?'selected':''}>${l}</option>`).join('');}
function renderModalV4(){
  const f=state.form, isEdit=!!state.editing;
  f.subtasks=f.subtasks||[];
  const subDone=f.subtasks.filter(s=>s.done).length;
  const subs=f.subtasks.map((s,i)=>`<div class="sub-row ${s.done?'done':''}"><button type="button" class="chk ${s.done?'on':''}" data-act="sub-toggle" data-i="${i}">${s.done?I('check'):''}</button><span>${esc(s.text)}</span><button type="button" class="ibtn del" data-act="sub-del" data-i="${i}" title="Quitar">${I('trash')}</button></div>`).join('');
  $('#modal').innerHTML = `
  <div class="m-head">
    <div><h2>${isEdit?'Editar tarea':'Nueva tarea'}</h2><div class="sub">${isEdit?'Modifica los detalles de la tarea':'Añade una tarea a tu planificación'}</div></div>
    <button class="ibtn" data-act="cancel" title="Cerrar">${I('plus').replace('<svg','<svg style="transform:rotate(45deg)"')}</button>
  </div>
  <div class="m-body">
    <section class="m-sec">
      <div class="m-label">Detalles</div>
      <input id="f-title" class="input-lg" type="text" value="${esc(f.title)}" placeholder="¿Qué hay que hacer?">
      <textarea id="f-desc" rows="2" placeholder="Notas o contexto (opcional)">${esc(f.description)}</textarea>
    </section>
    <section class="m-sec">
      <div class="m-label">Fecha y hora</div>
      <div class="g3">
        <div><label for="f-date">Fecha</label><input id="f-date" type="date" value="${f.due_date}"></div>
        <div><label for="f-time">Inicio</label><input id="f-time" type="time" value="${f.due_time?f.due_time.slice(0,5):''}"></div>
        <div><label for="f-end">Fin</label><input id="f-end" type="time" value="${f.end_time?f.end_time.slice(0,5):''}"></div>
      </div>
      <div class="g2" style="margin-top:14px">
        <div><label for="f-repeat">Repetir</label><select id="f-repeat" class="sel">${optSel(f.repeat||'none',{none:'No se repite',weekly:'Cada semana',monthly:'Cada mes'})}</select></div>
      </div>
    </section>
    <section class="m-sec">
      <div class="m-label">Clasificación</div>
      <div class="field-row"><span>Etiqueta</span>${opts('tag')}</div>
      <div class="field-row"><span>Prioridad</span>${opts('priority')}</div>
      <div class="field-row"><span>Estado</span>${opts('status')}</div>
    </section>
    <section class="m-sec">
      <div class="m-label">Subtareas <span class="m-count">${subDone}/${f.subtasks.length}</span></div>
      <div class="sub-list">${subs||'<div class="muted small">Divide la tarea en pasos pequeños para seguir el avance.</div>'}</div>
      <div class="sub-add"><input id="sub-in" type="text" placeholder="Añadir un paso y pulsar Enter"><button type="button" class="btn secondary" data-act="sub-add">Añadir</button></div>
    </section>
  <section class="m-sec"><div class="m-label">Historial</div>${(f.history||[]).slice(0,8).map(h=>`<div class="hist-row"><span>${h.d}</span>${esc(h.text)}</div>`).join('')||'<div class="muted small">Sin cambios todavía.</div>'}</section>
  </div>
  <div class="m-foot">
    <div>${isEdit?`<button class="btn secondary" data-act="dup" data-id="${state.editing}" style="margin-right:auto">Duplicar</button><button class="btn danger" data-act="delete" data-id="${state.editing}">${I('trash')} Eliminar</button>`:''}</div>
    <div class="l"><button class="btn secondary" data-act="cancel">Cancelar</button><button class="btn primary" data-act="save">${isEdit?'Guardar cambios':'Crear tarea'}</button></div>
  </div>`;
  const body=$('#modal .m-body'); if(body&&body.children.length>=4) body.insertBefore(body.children[3], body.children[1]);
  setTimeout(()=>{ const c=$('#cat-name'); if(c){ c.focus(); c.setSelectionRange(c.value.length,c.value.length); return; } const el=$('#f-title'); if(el&&!el.value) el.focus(); },30);
}
function renderModal(){ const m=$('#modal'); const sc=m?m.scrollTop:0; renderModalV4(); const m2=$('#modal'); if(m2) m2.scrollTop=sc; }
function openModal(task, day){
  state.editing = task ? task.id : null;
  state.form = task
    ? {...task, due_time: task.due_time?task.due_time.slice(0,5):''}
    : {title:'', description:'', due_date:day||t0, due_time:'', tag:'estudio', priority:'none', status:'none'};
  renderModal();
  $('#ov').classList.add('open');
}
function closeModal(){ $('#ov').classList.remove('open'); }
function saveTask(){
  readForm();
  const f=state.form;
  if(!f.title.trim()){ $('#f-title').style.borderColor='var(--red)'; $('#f-title').focus(); return; }
  const data={title:f.title.trim(), description:f.description.trim(), due_date:f.due_date, due_time:f.due_time||null, end_time:f.end_time||null, repeat:f.repeat||'none', reminder:f.reminder||'none', subtasks:f.subtasks||[], tag:f.tag, priority:f.priority, status:f.status};
  if(state.editing){ const old=state.tasks.find(t=>t.id===state.editing); if(old.due_date!==data.due_date) logChange(old,'Fecha: '+data.due_date); if(old.status!==data.status) logChange(old,'Estado: '+ST[data.status][0]); old.doneAt=data.status==='hecha'?(old.doneAt||t0):null; Object.assign(old, data); toast('Cambios guardados'); }
  else { const n={id:crypto.randomUUID(), ...data, history:[]}; logChange(n,'Creada'); if(n.status==='hecha') n.doneAt=t0; state.tasks.push(n); persistTask(n); toast('Tarea añadida'); }
  if(state.editing){ const saved=state.tasks.find(t=>t.id===state.editing); persistTask(saved); }
  closeModal(); render();
}

/* Events */
document.addEventListener('dblclick', e=>{
  const row=e.target.closest('tr[data-note-row]');
  if(!row || e.target.closest('button,input,select,a')) return;
  editGeneralNote(row.dataset.noteRow);
});
document.addEventListener('click', e=>{
  const el=e.target.closest('[data-act]');
  if(!el) return;
  const act=el.dataset.act, id=el.dataset.id;
  const task=()=>state.tasks.find(t=>t.id===id);
  switch(act){
    case 'logout': signOutTempo(); break;
    case 'note-add': addGeneralNote(); break;
    case 'note-edit': editGeneralNote(id); break;
    case 'note-save': saveNoteFromEditor(); break;
    case 'note-cancel': state.noteEditorOpen=false; state.noteEditingId=null; render(); break;
    case 'note-cycle': cycleGeneralNote(id); break;
    case 'note-delete': deleteGeneralNote(id); break;
    case 'go':
      state.view=el.dataset.view;
      if(el.dataset.view==='calendar') state.anchor=new Date();
      if(el.dataset.view==='tasks'){ state.filter.status='todas'; state.filter.tag='todas'; }
      render(); break;
    case 'new': openModal(null,null); break;
    case 'new-day': openModal(null, el.dataset.day); break;
    case 'edit': openModal(task()); break;
    case 'cancel': closeModal(); break;
    case 'save': saveTask(); break;
    case 'pick': { readForm(); const k=el.dataset.k, v=el.dataset.v; state.form[k]=(k==='priority'&&state.form[k]===v)?'none':v; renderModal(); break; }
    case 'toggle': { const t=task(); const prev=t.status; t.status=t.status==='hecha'?'pendiente':'hecha'; logChange(t,'Estado: '+ST[t.status][0]); t.doneAt=t.status==='hecha'?t0:null; persistTask(t); render(); showUndo(t.status==='hecha'?'Tarea completada':'Tarea reabierta', ()=>{t.status=prev; persistTask(t);}); break; }
    case 'cycle': { const t=task(); const o=['pendiente','en_curso','hecha']; t.status=o[(o.indexOf(t.status)+1)%3]; logChange(t,'Estado: '+ST[t.status][0]); if(t.status==='hecha') t.doneAt=t0; persistTask(t); render(); break; }
    case 'postpone': { const t=task(); t.due_date=iso(addDays(pd(t.due_date),1)); logChange(t,'Fecha: '+t.due_date); persistTask(t); toast('Movida a mañana'); render(); break; }
    case 'delete': { const idx=state.tasks.findIndex(t=>t.id===id); const removed=state.tasks[idx]; state.tasks.splice(idx,1); removeTaskFromDB(id); closeModal(); render(); showUndo('Tarea eliminada', ()=>{state.tasks.splice(idx,0,removed); persistTask(removed);}); break; }
    case 'prev': state.anchor = state.mode==='mes' ? new Date(state.anchor.getFullYear(),state.anchor.getMonth()-1,1) : addDays(state.anchor, state.mode==='dia'?-1:-7); render(); break;
    case 'next': state.anchor = state.mode==='mes' ? new Date(state.anchor.getFullYear(),state.anchor.getMonth()+1,1) : addDays(state.anchor, state.mode==='dia'?1:7); render(); break;
    case 'today': state.anchor=new Date(); render(); break;
    case 'mode': state.mode=el.dataset.v; render(); break;
    case 'fstatus': state.filter.status=el.dataset.v; render(); break;
    case 'layout': state.layout=el.dataset.v; render(); break;
    case 'ftag': state.filter.tag=el.dataset.v; render(); break;
    case 'ftag-nav': state.view='tasks'; state.filter.tag=el.dataset.v; state.filter.status='todas'; render(); break;
  }
});
document.addEventListener('input', e=>{
  if(e.target.id==='q'){ state.filter.q=e.target.value; const tb=$('#tbl'); if(tb) tb.innerHTML=tableHTML(); }
});
document.addEventListener('change', e=>{
  if(e.target.id==='sort'){ state.filter.sort=e.target.value; const tb=$('#tbl'); if(tb) tb.innerHTML=tableHTML(); }
});
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){ closeModal(); return; }
  if(e.target.matches('input,textarea,select')) return;
  if(e.key==='n'||e.key==='N') openModal(null,null);
});
$('#ov').addEventListener('click', e=>{ if(e.target.id==='ov') closeModal(); });

document.addEventListener('click', e=>{
  const el=e.target.closest('[data-act]'); if(!el) return;
  const a=el.dataset.act;
  if(a==='sub-add'){ readForm(); const v=($('#sub-in').value||'').trim(); if(!v) return; state.form.subtasks.push({text:v,done:false}); renderModal(); setTimeout(()=>{const i=$('#sub-in'); if(i) i.focus();},40); }
  else if(a==='sub-toggle'){ readForm(); const s=state.form.subtasks[+el.dataset.i]; s.done=!s.done; renderModal(); }
  else if(a==='sub-del'){ readForm(); state.form.subtasks.splice(+el.dataset.i,1); renderModal(); }
});
document.addEventListener('keydown', e=>{
  if(e.target.id==='sub-in' && e.key==='Enter'){ e.preventDefault(); const b=document.querySelector('[data-act="sub-add"]'); if(b) b.click(); }
});
function showUndo(msg, undo){
  const el=$('#toast');
  el.innerHTML=`<span>${msg}</span><button id="undo-btn" style="margin-left:14px;color:#5eead4;font-weight:600;background:none;border:0;cursor:pointer;font:inherit">Deshacer</button>`;
  el.style.pointerEvents='auto'; el.classList.add('show');
  clearTimeout(window._tt);
  window._tt=setTimeout(()=>{el.classList.remove('show'); el.style.pointerEvents='none';},5000);
  $('#undo-btn').onclick=()=>{ undo(); el.classList.remove('show'); el.style.pointerEvents='none'; render(); };
}
function timeGrid(key,list,opt){
  const scale=opt.scale||1, maxCols=opt.maxCols||99, labels=opt.labels!==false;
  const hm=x=>parseInt(x.slice(0,2),10)*60+parseInt(x.slice(3,5),10);
  const START=7*60, END=23*60, H=(END-START)*scale;
  const items=list.filter(t=>t.due_time).map(t=>{
    let s0=hm(t.due_time); let e0=t.end_time?hm(t.end_time):s0+60;
    s0=Math.max(START,Math.min(END-15,s0)); if(e0<=s0) e0=s0+30; e0=Math.min(END,e0);
    return {t,s:s0,e:e0,col:0};
  }).sort((x,y)=>x.s-y.s||y.e-x.e);
  const colEnds=[];
  items.forEach(it=>{ let c=colEnds.findIndex(x=>x<=it.s); if(c<0){ c=colEnds.length; colEnds.push(it.e); } else colEnds[c]=it.e; it.col=c; });
  const n=Math.min(maxCols,Math.max(1,colEnds.length));
  let hours=''; for(let h=7;h<=22;h++){ hours+=`<div class="hl" style="top:${(h*60-START)*scale}px">${labels?`<span>${String(h).padStart(2,'0')}:00</span>`:''}</div>`; }
  let evs='', chips='';
  items.forEach(it=>{
    const top=(it.s-START)*scale, hgt=Math.max(labels?30:22,(it.e-it.s)*scale-3);
    if(it.col>=maxCols){ chips+=`<button type="button" class="more-chip" data-act="more-day" data-day="${key}" style="top:${top+2}px">+1</button>`; return; }
    evs+=pill(it.t).replace('style="--c:',`style="position:absolute;top:${top}px;height:${hgt}px;left:calc(${it.col*100/n}% + 3px);width:calc(${100/n}% - 6px);--c:`);
  });
  const nowM=new Date().getHours()*60+new Date().getMinutes();
  const nowLine=(key===t0&&nowM>=START&&nowM<=END)?`<div class="now-line" style="top:${(nowM-START)*scale}px"></div>`:'';
  return `<div class="day-grid${labels?'':' nolabel'}" data-day="${key}" data-grid="1" data-scale="${scale}" style="height:${H}px">${hours}<div class="day-events">${evs}</div>${chips}${nowLine}</div>`;
}
function dayView(){
  const key=iso(state.anchor), list=tasksOn(key);
  const untimed=list.filter(t=>!t.due_time);
  return `<div class="day-view"><div class="day-untimed"><span class="muted small">Sin hora</span>${untimed.length?untimed.map(pill).join(''):'<span class="muted small">Ninguna</span>'}</div>${timeGrid(key,list,{scale:1,labels:true})}</div>`;
}

function boardHTML(){
  const cols=[['pendiente','Pendiente'],['en_curso','En curso'],['hecha','Hecha']];
  const list=filtered();
  return `<div class="board">${cols.map(([s,l])=>{
    const items=list.filter(t=>t.status===s);
    return `<div class="bcol" data-col="${s}"><div class="bh"><span>${l}</span><b>${items.length}</b></div>${items.map(t=>`<div class="bcard" draggable="true" data-drag="${t.id}" data-act="edit" data-id="${t.id}"><div class="bt">${esc(t.title)}</div><div class="item-m">${TAG[t.tag][0]} · ${relDay(t.due_date)}</div></div>`).join('')||'<div class="muted small" style="padding:8px 4px">Arrastra tareas aquí</div>'}</div>`;
  }).join('')}</div>`;
}
let dragId=null;
document.addEventListener('dragstart', e=>{
  const el=e.target.closest('[data-drag]'); if(!el) return;
  dragId=el.dataset.drag; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', String(dragId));
});
document.addEventListener('dragover', e=>{ if(e.target.closest('[data-day],[data-col]')) e.preventDefault(); });
document.addEventListener('drop', e=>{
  if(dragId==null) return;
  const day=e.target.closest('[data-day]'), col=e.target.closest('[data-col]');
  const t=state.tasks.find(x=>x.id===dragId);
  e.preventDefault(); dragId=null;
  if(!t) return;
  if(day){
    const old={d:t.due_date,t:t.due_time,e:t.end_time};
    if(day.dataset.grid){ const r=day.getBoundingClientRect(); const ini=Math.round((7*60+(e.clientY-r.top)/Number(day.dataset.scale||1))/15)*15; const hm2=x=>parseInt(x.slice(0,2),10)*60+parseInt(x.slice(3,5),10); const pad2=n=>String(n).padStart(2,'0'); const dur2=(t.due_time&&t.end_time)?hm2(t.end_time)-hm2(t.due_time):null; const m0=Math.max(0,Math.min(23*60-15,ini)); t.due_time=pad2(Math.floor(m0/60))+':'+pad2(m0%60)+':00'; t.end_time=(dur2!=null&&dur2>0)?pad2(Math.floor((m0+dur2)/60))+':'+pad2((m0+dur2)%60)+':00':null; }
    else if(day.dataset.hour){
      const hm=x=>parseInt(x.slice(0,2),10)*60+parseInt(x.slice(3,5),10);
      const pad=n=>String(n).padStart(2,'0');
      const dur=(t.due_time&&t.end_time)?hm(t.end_time)-hm(t.due_time):null;
      t.due_time=day.dataset.hour+':00';
      t.end_time=dur!=null&&dur>0?pad(Math.floor((hm(t.due_time)+dur)/60))+':'+pad((hm(t.due_time)+dur)%60)+':00':null;
    }
    t.due_date=day.dataset.day;
    logChange(t,'Fecha: '+t.due_date+(day.dataset.hour?' · '+t.due_time.slice(0,5):''));
    persistTask(t); render();
    showUndo('Tarea movida', ()=>{ t.due_date=old.d; t.due_time=old.t; t.end_time=old.e; persistTask(t); });
  }
  else if(col){ const old=t.status; t.status=col.dataset.col; logChange(t,'Estado: '+ST[t.status][0]); if(t.status==='hecha') t.doneAt=t0; persistTask(t); render(); showUndo('Estado actualizado', ()=>{t.status=old; persistTask(t);}); }
});
function openSearch(){
  if($('#srch')) return;
  const w=document.createElement('div');
  w.id='srch'; w.className='ov open';
  w.innerHTML='<div class="modal srch-box"><input id="srch-in" type="text" placeholder="Buscar tareas o ir a una pantalla..." autocomplete="off"><div id="srch-res"></div><div class="srch-tip">Esc para cerrar</div></div>';
  document.body.appendChild(w);
  w.addEventListener('click', e=>{ if(e.target===w) closeSearch(); });
  const inp=$('#srch-in'); inp.focus();
  inp.addEventListener('input', ()=>renderSearch(inp.value));
  renderSearch('');
}
function closeSearch(){ const w=$('#srch'); if(w) w.remove(); }
function renderSearch(q){
  q=q.trim().toLowerCase();
  const views=[['home','Inicio'],['calendar','Calendario'],['tasks','Tareas']].filter(([v,l])=>!q||l.toLowerCase().includes(q));
  const tasks=state.tasks.filter(t=>!q||t.title.toLowerCase().includes(q)).slice(0,8);
  const res=$('#srch-res');
  res.innerHTML=views.map(([v,l])=>`<button class="srch-item" data-sv="${v}">${I('arrow')} Ir a ${l}</button>`).join('')+
    tasks.map(t=>`<button class="srch-item" data-st="${t.id}"><i class="dot" style="--c:${TAG[t.tag][1]}"></i>${esc(t.title)}<small>${relDay(t.due_date)}</small></button>`).join('');
  res.querySelectorAll('[data-sv]').forEach(b=>b.onclick=()=>{ closeSearch(); state.view=b.dataset.sv; render(); });
  res.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ closeSearch(); openModal(state.tasks.find(t=>t.id==b.dataset.st)); });
}
document.addEventListener('keydown', e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); openSearch(); return; }
  if(e.key==='/' && !e.target.matches('input,textarea,select')){ e.preventDefault(); openSearch(); return; }
  if(e.key==='Escape') closeSearch();
});
function prioArrow(p){
  const paths={alta:'<path d="M12 19V5M5 12l7-7 7 7"/>', media:'<path d="M5 12h14M13 6l6 6-6 6"/>', baja:'<path d="M12 5v14M19 12l-7 7-7-7"/>'};
  return `<svg viewBox="0 0 24 24">${paths[p]||''}</svg>`;
}
function logChange(t, text){ t.history=t.history||[]; const d=iso(new Date()); const top=t.history[0]; if(top&&top.d===d&&top.text===text) return; t.history.unshift({d, text}); }
state.focus=[];
let pomo=null;
function openFocus(){
  if($('#focus')) return;
  pomo={taskId:null, total:25*60, left:25*60, running:false, timer:null};
  const w=document.createElement('div'); w.id='focus'; w.className='ov open';
  w.innerHTML='<div class="modal focus-box"></div>';
  document.body.appendChild(w);
  w.addEventListener('click', e=>{ if(e.target===w) closeFocus(); });
  renderFocus();
}
function closeFocus(){ if(pomo&&pomo.timer) clearInterval(pomo.timer); pomo=null; const w=$('#focus'); if(w) w.remove(); }
function fmtMin(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
function renderFocusV6(){
  const box=$('#focus .modal'); if(!box||!pomo) return;
  if(pomo.done){ renderFocusDone(box); return; }
  const open=state.tasks.filter(t=>t.status!=='hecha');
  const t=state.tasks.find(x=>x.id===pomo.taskId);
  const C=2*Math.PI*88, prog=pomo.total?pomo.left/pomo.total:1;
  const status=pomo.running?'en curso':(pomo.left<pomo.total?'en pausa':'listo para empezar');
  box.innerHTML=`
    <div class="fc-head">
      <div><div class="fc-k">Modo enfoque</div><div class="fc-t">${t?esc(t.title):'Elige una tarea para empezar'}</div></div>
      <button class="fc-x" data-fa="close" title="Cerrar">${I('plus').replace('<svg','<svg style="transform:rotate(45deg)"')}</button>
    </div>
    <div class="fc-body">
      <div class="ring">
        <svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" class="ring-bg"/><circle id="fc-ring" cx="100" cy="100" r="88" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-prog)}" transform="rotate(-90 100 100)"/></svg>
        <div class="ring-txt"><b id="fc-time">${fmtMin(pomo.left)}</b><span>${status}</span></div>
      </div>
      ${pomo.running?'':`<div class="dur-row">${[15,25,45,60].map(m=>`<button class="pillbtn ${pomo.total===m*60?'on':''}" data-fa="dur" data-m="${m}">${m} min</button>`).join('')}</div>
      <div class="dur-custom"><input id="focus-custom" type="number" min="1" max="240" placeholder="Otro tiempo (min)"><button class="btn secondary sm" data-fa="custom">Usar</button></div>`}
      <div class="f" style="text-align:left"><label for="focus-sel">Tarea</label><select class="sel" id="focus-sel" style="width:100%"><option value="">Elige una tarea</option>${open.map(x=>`<option value="${x.id}" ${x.id===pomo.taskId?'selected':''}>${esc(x.title)}</option>`).join('')}</select></div>
      <div class="focus-actions">
        <button class="btn primary" data-fa="${pomo.running?'pause':'start'}">${pomo.running?'Pausar':'Empezar'}</button>
        <button class="btn secondary" data-fa="reset">Reiniciar</button>
        <button class="btn ghost" data-fa="finish">Terminar</button>
      </div>
    </div>`;
}
function renderFocus(){ return renderFocusV6(); }
function tickFocus(){
  if(!pomo) return;
  pomo.left--;
  if(pomo.left<=0){ finishSession(); return; }
  const r=$('#fc-ring'); if(r) r.setAttribute('stroke-dashoffset', String(2*Math.PI*88*(1-pomo.left/pomo.total))); const d=$('#fc-time'); if(d) d.textContent=fmtMin(pomo.left);
}
function endSession(){
  if(!pomo) return;
  const mins=Math.round((pomo.total-pomo.left)/60);
  const t=state.tasks.find(x=>x.id===pomo.taskId);
  if(mins>0 && t){ logChange(t,`Enfoque: ${mins} min`); state.focus.push({tag:t.tag, min:mins}); persistTask(t); persistFocusSession(t,mins); }
  closeFocus(); render();
  toast(mins>0?`Sesión guardada · ${mins} min`:'Sesión cancelada');
}
document.addEventListener('click', e=>{
  const open=e.target.closest('[data-act="focus"]'); if(open){ openFocus(); return; }
  const el=e.target.closest('[data-fa]'); if(!el||!pomo) return;
  const a=el.dataset.fa;
  if(a==='close'){ closeFocus(); return; }
  if(a==='dur'){ if(!pomo.running){ pomo.total=Number(el.dataset.m)*60; pomo.left=pomo.total; pomo.done=false; } renderFocus(); return; }
  if(a==='custom'){ const raw=Math.round(Number($('#focus-custom').value)); if(!raw||raw<1){ toast('Escribe unos minutos'); return; } const m=Math.min(240,raw); if(!pomo.running){ pomo.total=m*60; pomo.left=m*60; pomo.done=false; } renderFocus(); return; }
  if(a==='again'){ pomo.done=false; pomo.left=pomo.total; pomo.running=true; clearInterval(pomo.timer); pomo.timer=setInterval(tickFocus,1000); renderFocus(); return; }
  if(a==='complete'){ const t=state.tasks.find(x=>x.id===pomo.taskId); closeFocus(); if(t){ t.status='hecha'; t.doneAt=t0; logChange(t,'Estado: Hecha'); persistTask(t); } render(); toast('Tarea completada'); return; }
  if(a==='finish'){ endSession(); return; }
  if(a==='start'){ if(!pomo.taskId){ toast('Elige una tarea primero'); return; } pomo.running=true; clearInterval(pomo.timer); pomo.timer=setInterval(tickFocus,1000); }
  if(a==='pause'){ pomo.running=false; clearInterval(pomo.timer); }
  if(a==='reset'){ pomo.running=false; clearInterval(pomo.timer); pomo.left=pomo.total; }
  renderFocus();
});
document.addEventListener('change', e=>{
  if(e.target.id==='focus-sel'&&pomo){ pomo.taskId=e.target.value||null; renderFocus(); }
});
function renderStats(){
  const done=[...new Map(state.tasks.filter(t=>t.doneAt&&t.status==='hecha').map(t=>[t.id,t])).values()];
  const now=new Date(), wsNow=weekStart(now);
  const weeks=[...Array(8)].map((_,i)=>{
    const ws=addDays(wsNow,-7*(7-i)), a=iso(ws), b=iso(addDays(ws,6));
    return {n:done.filter(t=>t.doneAt>=a&&t.doneAt<=b).length, label:ws.toLocaleDateString('es-ES',{day:'numeric',month:'short'}).replace('.','')};
  });
  const max=Math.max(1,...weeks.map(w=>w.n));
  const dset=new Set(done.map(t=>t.doneAt));
  let cur=now, streak=0;
  if(!dset.has(iso(cur))) cur=addDays(cur,-1);
  while(dset.has(iso(cur))){ streak++; cur=addDays(cur,-1); }
  const mins=state.focus.reduce((s,f)=>s+f.min,0);
  const rows=Object.keys(TAG).map(k=>{
    const d=done.filter(t=>t.tag===k).length, m=state.focus.filter(f=>f.tag===k).reduce((s,f)=>s+f.min,0);
    return `<div class="trow"><span><i class="dot" style="--c:${TAG[k][1]}"></i>${TAG[k][0]}</span><span>${d} hechas</span><span>${m} min de enfoque</span></div>`;
  }).join('');
  return `
  <div class="page-h"><div><h1>Productividad</h1><div class="sub">Tu progreso en las últimas semanas</div></div></div>
  <div class="stats">
    <div class="stat"><div class="l">Esta semana</div><div class="v">${weeks[7].n}</div><div class="cap">tareas completadas</div></div>
    <div class="stat"><div class="l">Racha</div><div class="v">${streak}</div><div class="cap">días seguidos con tareas hechas</div></div>
    <div class="stat"><div class="l">Total</div><div class="v">${done.length}</div><div class="cap">tareas completadas</div></div>
    <div class="stat"><div class="l">Enfoque</div><div class="v">${mins}</div><div class="cap">minutos con Pomodoro</div></div>
  </div>
  <div class="sec"><div class="sec-h"><h2>Completadas por semana</h2><span class="muted small">Últimas 8 semanas</span></div>
    <div class="wchart">${weeks.map(w=>`<div class="wcol2"><b>${w.n}</b><div class="wtrack"><div class="wfill" style="height:${Math.round(w.n/max*100)}%"></div></div><span>${w.label}</span></div>`).join('')}</div>
  </div>
  <div class="sec"><div class="sec-h"><h2>Por etiqueta</h2></div><div class="list trows">${rows}</div></div>`;
}
function beep(){
  try{
    const C=window.AudioContext||window.webkitAudioContext; const c=new C();
    [0,0.3,0.6].forEach(s=>{ const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.value=880; g.gain.setValueAtTime(0.0001,c.currentTime+s); g.gain.exponentialRampToValueAtTime(0.25,c.currentTime+s+0.02); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+s+0.22); o.connect(g); g.connect(c.destination); o.start(c.currentTime+s); o.stop(c.currentTime+s+0.25); });
  }catch(e){}
}
function finishSession(){
  if(!pomo) return;
  clearInterval(pomo.timer); pomo.running=false; pomo.done=true;
  const t=state.tasks.find(x=>x.id===pomo.taskId);
  const mins=Math.round(pomo.total/60);
  if(t){ logChange(t,`Enfoque: ${mins} min`); state.focus.push({tag:t.tag, min:mins}); persistTask(t); persistFocusSession(t,mins); }
  beep();
  try{ if('Notification' in window && Notification.permission==='granted') new Notification('Tempo', {body:'Sesión de 25 minutos completada'}); }catch(e){}
  render(); renderFocus();
}
function renderFocusDone(box){
  const t=state.tasks.find(x=>x.id===pomo.taskId);
  const canComplete=t && t.status!=='hecha';
  const mins=Math.round(pomo.total/60);
  box.innerHTML=`<div class="fd-wrap">
    <div class="fd-ic">${I('check')}</div>
    <h2>Sesión completada</h2>
    <p class="fd-sub">${mins} ${mins===1?'minuto':'minutos'} de enfoque${t?` en <b>${esc(t.title)}</b>`:''}</p>
    <div class="fd-actions">
      ${canComplete?'<button type="button" class="btn primary fd-btn" data-fa="complete">Marcar tarea como hecha</button>':''}
      <button type="button" class="btn secondary fd-btn" data-fa="again">Otra sesión</button>
      <button type="button" class="btn ghost fd-btn" data-fa="close">Cerrar</button>
    </div>
  </div>`;
}
/* ---- Etiquetas personalizadas ---- */
const CAT_PALETTE=['#0d3b41','#1f7d85','#56a3a8','#2f6f4f','#5a6b3a','#b08d57','#8c6a2f','#8a4b3c','#4b5a6b','#3b5b8c','#6b5b95','#7a4f6b'];
const CAT_DEFAULTS=[['estudio','Estudio','#0d3b41'],['trabajo','Trabajo','#1f7d85'],['personal','Personal','#56a3a8']];
let categoryRows=[];
function setCategories(rows){ Object.keys(TAG).forEach(k=>delete TAG[k]); rows.forEach(r=>{ TAG[r.key]=[r.name,r.color]; }); }
function slugKey(name){
  const base=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,20)||'etiqueta';
  return base+'-'+Math.random().toString(36).slice(2,6);
}
async function loadCategories(){
  // Las etiquetas se cargan junto al resto de los registros cifrados.
  if(categoryRows.length) setCategories(categoryRows);
}
function catDraftHTML(){
  const d=state.catDraft; if(!d) return '';
  return `<div class="cat-draft">
    <label for="cat-name" style="display:block;font-size:12.5px;font-weight:600;color:var(--ink2);margin-bottom:7px">${d.id?'Editar etiqueta':'Nueva etiqueta'}</label>
    <input id="cat-name" type="text" maxlength="24" placeholder="Por ejemplo: Gym, Exámenes, Presentaciones" value="${esc(d.name)}">
    <div class="cat-colors">${CAT_PALETTE.map(c=>`<button type="button" class="cat-sw ${d.color===c?'on':''}" style="--c:${c}" data-act="cat-color" data-c="${c}" aria-label="Elegir color"></button>`).join('')}</div>
    <div class="cat-actions">
      ${d.id?'<button type="button" class="txt del" data-act="cat-del">Eliminar</button>':''}
      <button type="button" class="btn secondary sm" data-act="cat-cancel">Cancelar</button>
      <button type="button" class="btn primary sm" data-act="cat-save">Guardar etiqueta</button>
    </div>
  </div>`;
}
async function persistCategories(rows){
  try{
    for(const row of rows) await putEncryptedRecord('category',row.id,{key:row.key,name:row.name,color:row.color});
    return true;
  }catch(error){console.error(error);toast('No se pudo guardar la etiqueta: '+error.message);return false;}
}
document.addEventListener('click', async e=>{
  const el=e.target.closest('[data-act]'); if(!el) return;
  const a=el.dataset.act;
  if(a==='cat-add'){ state.catDraft={id:null,key:null,name:'',color:CAT_PALETTE[0]}; renderModal(); return; }
  if(a==='cat-edit'){ const r=categoryRows.find(x=>x.key===state.form.tag); if(r){ state.catDraft={id:r.id,key:r.key,name:r.name,color:r.color}; renderModal(); } return; }
  if(a==='cat-color'){ const cn=$('#cat-name'); if(cn) state.catDraft.name=cn.value; state.catDraft.color=el.dataset.c; renderModal(); return; }
  if(a==='cat-cancel'){ state.catDraft=null; renderModal(); return; }
  if(a==='cat-save'){
    const d=state.catDraft; const name=($('#cat-name')?.value||'').trim();
    if(!name){ $('#cat-name')?.focus(); toast('Escribe un nombre para la etiqueta'); return; }
    if(d.id){
      const r=categoryRows.find(x=>x.id===d.id);
      if(!r) return;
      r.name=name; r.color=d.color;
      if(!await persistCategories([{id:r.id,user_id:currentUser.id,key:r.key,name,color:d.color}])) return;
      setCategories(categoryRows); state.catDraft=null; render(); renderModal(); toast('Etiqueta actualizada');
    } else {
      const row={id:crypto.randomUUID(),user_id:currentUser.id,key:slugKey(name),name,color:d.color};
      if(!await persistCategories([row])) return;
      categoryRows.push(row); setCategories(categoryRows);
      state.form.tag=row.key; state.catDraft=null; render(); renderModal(); toast('Etiqueta creada');
    }
    return;
  }
  if(a==='cat-del'){
    const d=state.catDraft; if(!d||!d.id) return;
    const uses=state.tasks.filter(t=>t.tag===d.key).length;
    if(uses){ toast(`Esta etiqueta tiene ${uses} tarea${uses===1?'':'s'}. Cámbialas antes de borrarla.`); return; }
    if(categoryRows.length<=1){ toast('Debe quedar al menos una etiqueta'); return; }
    try{await deleteEncryptedRecord('category',d.id);}
    catch(error){toast('No se pudo borrar: '+error.message);return;}
    categoryRows=categoryRows.filter(x=>x.id!==d.id); setCategories(categoryRows);
    if(state.form.tag===d.key) state.form.tag=categoryRows[0].key;
    state.catDraft=null; render(); renderModal(); toast('Etiqueta eliminada');
  }
});
/* ---- Plantillas, recordatorios y "more" ---- */
document.addEventListener('click', e=>{ if(e.target.closest('[data-rem-close]')){ const b=$('#rem-banner'); if(b) b.remove(); } });
setInterval(()=>{ if(state.view==='calendar'&&state.mode==='dia') render(); },60000);
document.addEventListener('click', e=>{
  const more=e.target.closest('[data-act="more-day"]');
  if(more){ state.mode='dia'; state.anchor=pd(more.dataset.day); render(); return; }
});

/* ---- Repeticiones: crear las siguientes ocurrencias ---- */
let _preLen=0, _preNew=false;
document.addEventListener('click', e=>{
  if(e.target.closest('[data-act="save"]')){ _preLen=state.tasks.length; _preNew=!state.editing; }
}, true);
document.addEventListener('click', e=>{
  if(!e.target.closest('[data-act="save"]')) return;
  if(!_preNew || state.tasks.length<=_preLen) return;
  const base=state.tasks[state.tasks.length-1];
  if(!base.repeat || base.repeat==='none') return;
  const total=12;
  const sid=crypto.randomUUID(); base.series_id=sid; persistTask(base);
  for(let i=1;i<total;i++){
    const d=pd(base.due_date);
    const nd = base.repeat==='weekly' ? addDays(d,7*i) : new Date(d.getFullYear(), d.getMonth()+i, d.getDate(), 12);
    const t={...base, id:crypto.randomUUID(), due_date:iso(nd), subtasks:(base.subtasks||[]).map(x=>({...x})), history:[], doneAt:null};
    logChange(t,'Creada como repetición');
    state.tasks.push(t); persistTask(t);
  }
  render();
  toast(`Serie creada: ${total} tareas`);
});

/* ---- Borrar una tarea repetida: solo esta o toda la serie ---- */
function deleteOne(id){
  const idx=state.tasks.findIndex(x=>x.id===id); if(idx<0) return;
  const removed=state.tasks[idx];
  state.tasks.splice(idx,1); removeTaskFromDB(id);
  closeModal(); render();
  showUndo('Tarea eliminada', ()=>{ state.tasks.splice(idx,0,removed); persistTask(removed); });
}
async function deleteSeries(sid,n){
  const removed=state.tasks.filter(x=>x.series_id===sid);
  const ids=removed.map(x=>x.id);
  state.tasks=state.tasks.filter(x=>x.series_id!==sid);
  try{for(const id of ids) await deleteEncryptedRecord('task',id);}
  catch(error){toast('No se pudo borrar toda la serie: '+error.message);return;}
  closeModal(); render();
  showUndo(`Serie eliminada (${n} tareas)`, ()=>{ removed.forEach(x=>{ state.tasks.push(x); persistTask(x); }); });
}
function askSeriesDelete(t,n){
  const w=document.createElement('div'); w.className='ov open'; w.id='series-ask';
  w.innerHTML=`<div class="modal sa-box">
    <h2>Eliminar tarea repetida</h2>
    <div class="sub">«${esc(t.title)}» se repite ${n} veces. ¿Qué quieres borrar?</div>
    <div class="sa-actions">
      <button class="btn secondary" data-sa="cancel">Cancelar</button>
      <button class="btn secondary" data-sa="one">Solo esta</button>
      <button class="btn danger-solid" data-sa="all">Toda la serie</button>
    </div></div>`;
  document.body.appendChild(w);
  w.addEventListener('click', ev=>{
    if(ev.target===w){ w.remove(); return; }
    const b=ev.target.closest('[data-sa]'); if(!b) return;
    const a=b.dataset.sa; w.remove();
    if(a==='one') deleteOne(t.id);
    if(a==='all') deleteSeries(t.series_id,n);
  });
}
document.addEventListener('click', e=>{
  const del=e.target.closest('[data-act="delete"]'); if(!del) return;
  const t=state.tasks.find(x=>x.id===del.dataset.id);
  if(!t||!t.series_id) return;
  const n=state.tasks.filter(x=>x.series_id===t.series_id).length;
  if(n<2) return;
  e.stopImmediatePropagation(); e.preventDefault();
  askSeriesDelete(t,n);
}, true);

/* ---- Editar toda la serie ---- */
function askSeriesEdit(n, onOne, onAll){
  const w=document.createElement('div'); w.className='ov open'; w.id='series-ask';
  w.innerHTML=`<div class="modal sa-box">
    <h2>Editar tarea repetida</h2>
    <div class="sub">Esta tarea se repite ${n} veces. ¿Quieres cambiar solo esta o toda la serie?</div>
    <div class="sa-actions">
      <button class="btn secondary" data-sa="cancel">Cancelar</button>
      <button class="btn secondary" data-sa="one">Solo esta</button>
      <button class="btn primary" data-sa="all">Toda la serie</button>
    </div></div>`;
  document.body.appendChild(w);
  w.addEventListener('click', ev=>{
    if(ev.target===w){ w.remove(); return; }
    const b=ev.target.closest('[data-sa]'); if(!b) return;
    const a=b.dataset.sa; w.remove();
    if(a==='one') onOne();
    if(a==='all') onAll();
  });
}
function applySeriesEdit(t,n){
  readForm(); const f=state.form;
  if(!f.title.trim()){ toast('Escribe un título'); return; }
  const fields={title:f.title.trim(), description:(f.description||'').trim(), due_time:f.due_time||null, end_time:f.end_time||null, tag:f.tag, priority:f.priority};
  const sid=t.series_id;
  state.tasks.filter(x=>x.series_id===sid).forEach(x=>{ Object.assign(x,fields); logChange(x,'Serie editada'); persistTask(x); });
  closeModal(); render(); toast(`Serie actualizada (${n} tareas)`);
}
document.addEventListener('click', e=>{
  const sv=e.target.closest('[data-act="save"]'); if(!sv) return;
  if(!state.editing) return;
  const t=state.tasks.find(x=>x.id===state.editing);
  if(!t||!t.series_id) return;
  const n=state.tasks.filter(x=>x.series_id===t.series_id).length;
  if(n<2) return;
  e.stopImmediatePropagation(); e.preventDefault();
  askSeriesEdit(n, ()=>saveTask(), ()=>applySeriesEdit(t,n));
}, true);

/* ---- Duplicar tarea ---- */
function duplicateTask(id){
  const src=state.tasks.find(x=>x.id===id); if(!src) return;
  const copy={...src, id:crypto.randomUUID(), series_id:null, due_date:iso(addDays(pd(src.due_date),1)), subtasks:(src.subtasks||[]).map(x=>({...x})), history:[], doneAt:null};
  logChange(copy,'Duplicada desde «'+src.title+'»');
  state.tasks.push(copy); persistTask(copy);
  render(); openModal(copy);
  toast('Duplicada para mañana. Cambia la fecha si quieres');
}
document.addEventListener('click', e=>{
  const d=e.target.closest('[data-act="dup"]'); if(!d) return;
  duplicateTask(d.dataset.id);
});

render();
/* ---- Mostrar / ocultar la barra lateral ---- */
(function(){
  const app=document.querySelector('.app'), aside=document.querySelector('.app > aside');
  if(!app||!aside) return;
  const btn=document.createElement('button');
  btn.type='button'; btn.className='sb-btn';
  btn.innerHTML='<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/></svg>';
  function place(closed){
    if(closed){ btn.className='sb-btn floating'; btn.title='Mostrar barra lateral'; btn.setAttribute('aria-label','Mostrar barra lateral'); document.body.appendChild(btn); }
    else { btn.className='sb-btn in-aside'; btn.title='Ocultar barra lateral'; btn.setAttribute('aria-label','Ocultar barra lateral'); aside.appendChild(btn); }
  }
  function setClosed(c){
    app.classList.toggle('sb-closed',c);
    place(c);
    try{ localStorage.setItem('tempo-sidebar', c?'closed':'open'); }catch(e){}
  }
  btn.addEventListener('click',()=>setClosed(!app.classList.contains('sb-closed')));
  let closed=false; try{ closed=localStorage.getItem('tempo-sidebar')==='closed'; }catch(e){}
  setClosed(closed);
})();
/* ---- Mostrar / ocultar contraseña ---- */
(function(){
  const b=document.getElementById('lg-eye'); if(!b) return;
  b.addEventListener('click',()=>{
    const i=document.getElementById('auth-password');
    const show=i.type==='password';
    i.type=show?'text':'password';
    b.textContent=show?'Ocultar':'Mostrar';
    b.setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña');
  });
})();
/* ---- Inicio de sesión con Google ---- */
async function handleOAuthHash(){
  const h=location.hash; if(!h||h.indexOf('access_token=')<0) return;
  const p=new URLSearchParams(h.slice(1)); const at=p.get('access_token'); if(!at) return;
  try{
    const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+at}});
    const user=await r.json();
    const ttl=Number(p.get('expires_in')||3600);
    localStorage.setItem('tempo-supabase-session',JSON.stringify({access_token:at,refresh_token:p.get('refresh_token'),token_type:'bearer',expires_in:ttl,expires_at:Math.floor(Date.now()/1000)+ttl,user}));
  }catch(e){}
  history.replaceState(null,'',location.pathname+location.search);
}
(function(){
  const g=document.getElementById('auth-google'); if(!g) return;
  g.addEventListener('click',()=>{
    const back=location.origin+location.pathname;
    location.href=SUPABASE_URL+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(back);
  });
})();
/* ---- Recuperar contraseña ---- */
(function(){
  const b=document.getElementById('auth-forgot'); if(!b) return;
  b.addEventListener('click', async ()=>{
    const emailEl=document.getElementById('auth-email');
    const email=(emailEl.value||'').trim();
    if(!email){ authMessage('Escribe tu correo para enviarte el enlace.',true); emailEl.focus(); return; }
    if(!supabase){ authMessage('Conectando con Supabase…',true); return; }
    b.disabled=true;
    const {error}=await supabase.auth.resetPasswordForEmail(email);
    b.disabled=false;
    if(error) authMessage(error.message||'No se pudo enviar el correo.',true);
    else authMessage('Te hemos enviado un correo con el enlace para restablecer la contraseña.');
  });
})();

/* ---- Diálogo de confirmación dentro de la app ---- */
function askDialog(title,msg,okLabel){
  return new Promise(resolve=>{
    const w=document.createElement('div'); w.className='ov open'; w.id='dlg-ask';
    w.innerHTML=`<div class="modal sa-box"><h2>${esc(title)}</h2><div class="sub">${esc(msg)}</div><div class="sa-actions"><button class="btn secondary" data-dl="no">Cancelar</button><button class="btn primary" data-dl="yes">${esc(okLabel)}</button></div></div>`;
    document.body.appendChild(w);
    w.addEventListener('click', ev=>{
      if(ev.target===w){ w.remove(); resolve(false); return; }
      const b=ev.target.closest('[data-dl]'); if(!b) return;
      w.remove(); resolve(b.dataset.dl==='yes');
    });
  });
}
document.addEventListener('click', async e=>{
  const b=e.target.closest('[data-act="logout"]'); if(!b) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const ok=await askDialog('Cerrar sesión','¿Seguro que quieres cerrar sesión? Tus datos seguirán guardados en tu cuenta.','Cerrar sesión');
  if(ok) signOutTempo();
}, true);
