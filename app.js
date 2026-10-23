/* Reboot — prototipo dimostrativo.
   Dati salvati SOLO nel localStorage del browser corrente.
   Non usare questa versione per raccogliere dati reali o sensibili.
*/
const ADMIN_PIN = "2468"; // PIN demo, NON sicuro: non pubblicare contenuti riservati.
const KEYS = { polls:"reboot_polls_v1", ideas:"reboot_ideas_v1", news:"reboot_news_v1", votes:"reboot_votes_v1" };
const $ = (id) => document.getElementById(id);
const safeParse = (key, fallback) => { try { const value=JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const escapeHTML = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
const today = () => new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric"});
let polls = safeParse(KEYS.polls, [
 {id:"welcome-poll",question:"Quale iniziativa ti piacerebbe vedere a scuola?",options:["Tornei sportivi","Giornate a tema","Laboratori e workshop"],votes:[0,0,0],active:true}
]);
let ideas = safeParse(KEYS.ideas, []);
let news = safeParse(KEYS.news, [
 {id:"welcome-news",type:"Benvenuto",title:"Benvenuti su Reboot",body:"Questo è lo spazio digitale della lista: qui troverai aggiornamenti e potrai condividere idee. I contenuti sono dimostrativi.",date:"",created:Date.now()}
]);
let votes = safeParse(KEYS.votes, {});
let adminLoggedIn = false;
function persist(){save(KEYS.polls,polls);save(KEYS.ideas,ideas);save(KEYS.news,news);save(KEYS.votes,votes);}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2800);}
function renderStats(){$("statPolls").textContent=polls.filter(p=>p.active).length;$("statIdeas").textContent=ideas.length;$("statEvents").textContent=news.length;}
function renderPolls(){
 const root=$("pollList");
 if(!polls.filter(p=>p.active).length){root.innerHTML='<div class="empty-state">Al momento non ci sono sondaggi attivi. Torna a trovarci!</div>';return;}
 root.innerHTML=polls.filter(p=>p.active).map(p=>{
  const total=p.votes.reduce((a,b)=>a+b,0), voted=Boolean(votes[p.id]);
  const options=p.options.map((o,i)=>{
   const percent=total?Math.round(p.votes[i]/total*100):0;
   return voted?`<div class="result-row"><div class="result-label"><span>${escapeHTML(o)}</span><strong>${percent}%</strong></div><div class="result-track"><div class="result-fill" style="width:${percent}%"></div></div></div>`:`<label class="poll-option"><input type="radio" name="poll-${escapeHTML(p.id)}" value="${i}"><span>${escapeHTML(o)}</span></label>`;
  }).join("");
  return `<article class="poll-card"><span class="pill">${voted?"Risposta registrata":"Sondaggio attivo"}</span><h3>${escapeHTML(p.question)}</h3><form class="vote-form" data-poll="${escapeHTML(p.id)}"><div class="poll-options">${options}</div>${voted?`<div class="poll-total">${total} ${total===1?"risposta":"risposte"} · risultati indicativi</div>`:`<button class="poll-submit" type="submit">Invia risposta ↗</button>`}</form></article>`;
 }).join("");
 root.querySelectorAll(".vote-form").forEach(form=>form.addEventListener("submit",e=>{
  e.preventDefault();const p=polls.find(x=>x.id===form.dataset.poll);if(!p||votes[p.id])return;
  const choice=form.querySelector("input[type=radio]:checked");if(!choice){toast("Seleziona una risposta prima di inviare.");return;}
  p.votes[Number(choice.value)]++;votes[p.id]=true;persist();renderAll();toast("Grazie per aver partecipato!");
 }));
}
function renderNews(){
 const root=$("newsList");
 if(!news.length){root.innerHTML='<div class="empty-state">Nessuna news pubblicata per ora.</div>';return;}
 root.innerHTML=[...news].sort((a,b)=>(b.created||0)-(a.created||0)).map(n=>`<article class="news-card"><div class="news-accent"></div><div class="news-content"><span class="pill">${escapeHTML(n.type)}</span><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.body)}</p><div class="news-meta">${n.date?`📅 ${escapeHTML(new Date(n.date+"T12:00:00").toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"}))} · `:""}Pubblicato ${escapeHTML(n.displayDate||today())}</div></div></article>`).join("");
}
function renderAdmin(){
 $("managePolls").innerHTML=polls.length?polls.map(p=>`<div class="admin-item"><strong>${escapeHTML(p.question)}</strong><p>${p.votes.reduce((a,b)=>a+b,0)} risposte · ${p.active?"attivo":"archiviato"}</p><button data-remove-poll="${escapeHTML(p.id)}">Elimina sondaggio</button></div>`).join(""):'<p>Nessun sondaggio.</p>';
 $("manageNews").innerHTML=news.length?news.map(n=>`<div class="admin-item"><strong>${escapeHTML(n.title)}</strong><p>${escapeHTML(n.type)} · ${escapeHTML(n.displayDate||today())}</p><button data-remove-news="${escapeHTML(n.id)}">Elimina contenuto</button></div>`).join(""):'<p>Nessuna news.</p>';
 $("manageIdeas").innerHTML=ideas.length?[...ideas].reverse().map(i=>`<div class="admin-item"><strong>${escapeHTML(i.type)}: ${escapeHTML(i.title)}</strong><p>${escapeHTML(i.body)}</p><p>Ricevuta: ${escapeHTML(i.date)}</p><button data-remove-idea="${escapeHTML(i.id)}">Elimina proposta</button></div>`).join(""):'<div class="empty-state">Non ci sono ancora proposte salvate su questo browser.</div>';
 document.querySelectorAll("[data-remove-poll]").forEach(b=>b.onclick=()=>{if(confirm("Eliminare questo sondaggio?")){polls=polls.filter(p=>p.id!==b.dataset.removePoll);delete votes[b.dataset.removePoll];persist();renderAll();renderAdmin();}});
 document.querySelectorAll("[data-remove-news]").forEach(b=>b.onclick=()=>{if(confirm("Eliminare questo contenuto?")){news=news.filter(n=>n.id!==b.dataset.removeNews);persist();renderAll();renderAdmin();}});
 document.querySelectorAll("[data-remove-idea]").forEach(b=>b.onclick=()=>{if(confirm("Eliminare questa proposta?")){ideas=ideas.filter(i=>i.id!==b.dataset.removeIdea);persist();renderAll();renderAdmin();}});
}
function renderAll(){renderPolls();renderNews();renderStats();if(adminLoggedIn)renderAdmin();}
$("ideaForm").addEventListener("submit",e=>{
 e.preventDefault();const title=$("ideaTitle").value.trim(),body=$("ideaBody").value.trim();
 if(!title||!body)return;
 ideas.push({id:uid(),type:$("ideaType").value,title,body,date:today(),created:Date.now()});persist();e.target.reset();
 $("ideaMessage").textContent="Grazie! La tua proposta è stata salvata in questo browser.";
 renderStats();if(adminLoggedIn)renderAdmin();toast("Proposta salvata in questa demo.");
});
const dialog=$("adminDialog");
$("adminOpen").addEventListener("click",()=>{dialog.showModal();$("nav").classList.remove("open");});
$("adminClose").addEventListener("click",()=>dialog.close());
$("loginBtn").addEventListener("click",()=>{
 if($("adminPin").value===ADMIN_PIN){adminLoggedIn=true;$("adminLogin").hidden=true;$("adminPanel").hidden=false;$("loginMessage").textContent="";renderAdmin();}
 else $("loginMessage").textContent="PIN non corretto. Riprova.";
});
$("adminPin").addEventListener("keydown",e=>{if(e.key==="Enter")$("loginBtn").click();});
$("logoutBtn").addEventListener("click",()=>{adminLoggedIn=false;$("adminPanel").hidden=true;$("adminLogin").hidden=false;$("adminPin").value="";dialog.close();});
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));
 document.querySelectorAll(".admin-pane").forEach(p=>p.hidden=p.id!==tab.dataset.tab);
}));
$("pollForm").addEventListener("submit",e=>{
 e.preventDefault();const question=$("pollQuestion").value.trim(),options=$("pollOptions").value.split(",").map(s=>s.trim()).filter(Boolean);
 if(options.length<2||options.length>6){toast("Inserisci da 2 a 6 opzioni separate da virgole.");return;}
 polls.unshift({id:uid(),question,options,votes:options.map(()=>0),active:true});persist();e.target.reset();renderAll();renderAdmin();toast("Sondaggio pubblicato in questa demo.");
});
$("newsForm").addEventListener("submit",e=>{
 e.preventDefault();news.unshift({id:uid(),type:$("newsType").value,title:$("newsTitle").value.trim(),body:$("newsBody").value.trim(),date:$("newsDate").value,created:Date.now(),displayDate:today()});persist();e.target.reset();renderAll();renderAdmin();toast("Contenuto pubblicato in questa demo.");
});
$("menuBtn").addEventListener("click",()=>{const nav=$("nav"),open=nav.classList.toggle("open");$("menuBtn").setAttribute("aria-expanded",String(open));});
document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>{$("nav").classList.remove("open");$("menuBtn").setAttribute("aria-expanded","false");document.querySelectorAll(".nav-link").forEach(l=>l.classList.toggle("active",l===a));}));
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderAll();
