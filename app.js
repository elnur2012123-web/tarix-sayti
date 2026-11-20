(function(){
"use strict";
var KEY="tarix8_v1", T=window.TOPICS, $app=document.getElementById("app");
var S=load(), Q=null;

function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.p)return s}catch(e){}return{cur:"",p:{}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function prof(){return S.cur&&S.p[S.cur]?S.p[S.cur]:null}
function topic(id){return T.filter(function(t){return t.id===id})[0]}
function label(t){return t.n?t.n+"-mavzu":"Vatan"}
function pct(a,b){return b?Math.round(a*100/b):0}

function stats(id){
  var p=prof(),r={best:0,n:0,last:null};
  if(!p)return r;
  p.a.forEach(function(x){if(x.t===id){r.n++;r.last=x;var v=pct(x.s,x.m);if(v>r.best)r.best=v}});
  return r;
}

/* ---------- Home ---------- */
function home(){
  Q=null;var p=prof(),h="";
  h+='<div class="card"><h2>👋 Xush kelibsiz</h2>';
  if(p){
    h+='<div class="row sp"><div><b>'+esc(S.cur)+'</b><div class="mut">Topshirilgan urinishlar: '+p.a.length+'</div></div>'+
       '<div class="row"><select id="sw" aria-label="O‘quvchi">'+Object.keys(S.p).map(function(n){return'<option'+(n===S.cur?' selected':'')+'>'+esc(n)+'</option>'}).join("")+'</select>'+
       '<button id="newp">+ Yangi o‘quvchi</button></div></div>';
  }else{
    h+='<p class="mut">Natijalaringiz saqlanishi uchun ism-familiyangizni kiriting.</p>'+
       '<div class="row"><input type="text" id="nm" maxlength="40" placeholder="Ism Familiya" autocomplete="name"><button class="pri" id="go">Boshlash</button></div>';
  }
  h+='</div>';
  if(p){
    var done=T.filter(function(t){return stats(t.id).best>=80}).length;
    h+='<div class="card"><div class="row sp"><b>Umumiy yutuq</b><span class="mut">'+done+' / '+T.length+' mavzu (80%+)</span></div><div class="bar"><i style="width:'+pct(done,T.length)+'%"></i></div>'+
       '<div class="row" style="margin-top:12px"><button class="pri" data-mix="20">🎲 Aralash test (20 savol)</button><button data-mix="40">Katta aralash (40)</button></div></div>';
  }
  var secs=[["world","Jahon tarixi — 1–10-mavzular"],["uz","Vatan tarixi bilan bog‘liqlik"]];
  secs.forEach(function(s){
    h+='<div class="sec">'+s[1]+'</div>';
    T.filter(function(t){return t.sec===s[0]}).forEach(function(t){
      var st=stats(t.id);
      h+='<div class="card topic"><div class="num'+(st.best>=80?' done':'')+'">'+(t.n||"🇺🇿")+'</div><div class="grow"><b>'+esc(t.title)+'</b>'+
         '<div class="mut">'+t.qs.length+' savol'+(st.n?' · eng yaxshi: '+st.best+'% · '+st.n+' marta':'')+'</div>'+
         (st.n?'<div class="bar"><i style="width:'+st.best+'%"></i></div>':'')+'</div>'+
         '<button class="pri" data-t="'+t.id+'"'+(p?'':' disabled')+'>Test</button></div>';
    });
  });
  $app.innerHTML=h;
  var go=document.getElementById("go");
  if(go){go.onclick=addProf;document.getElementById("nm").onkeydown=function(e){if(e.key==="Enter")addProf()}}
  var sw=document.getElementById("sw");if(sw)sw.onchange=function(){S.cur=sw.value;save();home()};
  var np=document.getElementById("newp");if(np)np.onclick=function(){S.cur="";home()};
  [].forEach.call($app.querySelectorAll("[data-t]"),function(b){b.onclick=function(){start(topic(b.dataset.t))}});
  [].forEach.call($app.querySelectorAll("[data-mix]"),function(b){b.onclick=function(){startMix(+b.dataset.mix)}});
}
function addProf(){
  var n=document.getElementById("nm").value.trim().replace(/\s+/g," ");
  if(!n){document.getElementById("nm").focus();return}
  if(!S.p[n])S.p[n]={a:[]};
  S.cur=n;save();home();
}

/* ---------- Quiz ---------- */
function build(raw){
  return raw.map(function(r){
    var o=shuffle([r[1],r[2],r[3],r[4]]);
    return{q:r[0],o:o,a:o.indexOf(r[1]),c:r[1],e:r[5]};
  });
}
function start(t,qs,practice){
  var raw=qs||shuffle(t.qs);
  Q={id:t.id,title:t.title,qs:build(raw),i:0,s:0,wrong:[],t0:Date.now(),practice:!!practice,done:false,pick:-1};
  question();
}
function startMix(n){
  var all=[];T.forEach(function(t){t.qs.forEach(function(q){all.push(q)})});
  start({id:"mix",title:"Aralash test"},shuffle(all).slice(0,n));
}
function question(){
  var x=Q.qs[Q.i],h="";
  h+='<div class="card"><div class="row sp"><span class="mut">'+esc(Q.title)+(Q.practice?' · xatolar ustida ishlash':'')+'</span><span class="mut">'+(Q.i+1)+' / '+Q.qs.length+'</span></div>'+
     '<div class="bar"><i style="width:'+pct(Q.i,Q.qs.length)+'%"></i></div>'+
     '<div class="q">'+esc(x.q)+'</div><div id="opts">'+
     x.o.map(function(o,k){return'<button class="opt" data-k="'+k+'"><b>'+"ABCD"[k]+'.</b> '+esc(o)+'</button>'}).join("")+
     '</div><div id="fb"></div><div class="row sp"><button id="quit">Chiqish</button><button class="pri" id="next" style="display:none"></button></div></div>';
  $app.innerHTML=h;
  [].forEach.call($app.querySelectorAll(".opt"),function(b){b.onclick=function(){answer(+b.dataset.k)}});
  document.getElementById("quit").onclick=function(){if(confirm("Testdan chiqasizmi? Natija saqlanmaydi."))home()};
  Q.pick=-1;window.scrollTo(0,0);
}
function answer(k){
  if(Q.pick>=0)return;
  Q.pick=k;var x=Q.qs[Q.i],ok=k===x.a;
  if(ok)Q.s++;else Q.wrong.push({q:x,my:x.o[k]});
  [].forEach.call($app.querySelectorAll(".opt"),function(b,j){
    b.disabled=true;if(j===x.a)b.classList.add("ok");else if(j===k)b.classList.add("no");
  });
  document.getElementById("fb").innerHTML='<div class="exp"><b>'+(ok?"✅ To‘g‘ri!":"❌ Noto‘g‘ri.")+'</b> '+esc(x.e)+'</div>';
  var nb=document.getElementById("next"),last=Q.i===Q.qs.length-1;
  nb.style.display="";nb.textContent=last?"Natijani ko‘rish":"Keyingisi →";nb.focus();
  nb.onclick=function(){if(last)finish();else{Q.i++;question()}};
}
function finish(){
  var m=Q.qs.length,v=pct(Q.s,m),secs=Math.round((Date.now()-Q.t0)/1000);
  if(!Q.practice&&prof()){prof().a.push({t:Q.id,n:Q.title,s:Q.s,m:m,d:Date.now(),sec:secs});save()}
  var grade=v>=90?"A’lo! 🏆":v>=80?"Juda yaxshi 👏":v>=60?"Yaxshi, yana mashq qiling 💪":"Mavzuni qayta o‘qib chiqing 📖";
  var h='<div class="card" style="text-align:center"><div class="score">'+Q.s+' / '+m+'</div><h2>'+v+'% — '+grade+'</h2><div class="mut">Vaqt: '+Math.floor(secs/60)+' daq '+secs%60+' son'+(Q.practice?' · mashq natijasi saqlanmadi':' · natija saqlandi')+'</div>'+
    '<div class="row" style="justify-content:center;margin-top:14px">'+
    (Q.wrong.length?'<button class="pri" id="retry">Xatolarni takrorlash ('+Q.wrong.length+')</button>':'')+
    (Q.id!=="mix"?'<button id="again">Qayta topshirish</button>':'<button id="again">Yana aralash test</button>')+'<button id="hm">Mavzular</button></div></div>';
  if(Q.wrong.length){
    h+='<h3>Xatolar tahlili</h3>';
    Q.wrong.forEach(function(w){
      h+='<div class="card rev"><b>'+esc(w.q.q)+'</b><div class="mut">Sizning javob: '+esc(w.my)+'</div><div>✅ '+esc(w.q.c)+'</div><div class="exp">'+esc(w.q.e)+'</div></div>';
    });
  }
  $app.innerHTML=h;window.scrollTo(0,0);
  var wr=Q.wrong,id=Q.id,title=Q.title,n=Q.qs.length;
  var r=document.getElementById("retry");
  if(r)r.onclick=function(){
    Q={id:id,title:title,qs:shuffle(wr.map(function(w){return w.q})).map(function(x){var o=shuffle(x.o);return{q:x.q,o:o,a:o.indexOf(x.c),c:x.c,e:x.e}}),i:0,s:0,wrong:[],t0:Date.now(),practice:true,pick:-1};
    question();
  };
  document.getElementById("again").onclick=function(){id==="mix"?startMix(n):start(topic(id))};
  document.getElementById("hm").onclick=home;
}

/* ---------- Stats ---------- */
function fmt(ts){var d=new Date(ts);return d.toLocaleDateString("uz-UZ")+" "+d.toLocaleTimeString("uz-UZ",{hour:"2-digit",minute:"2-digit"})}
function statsPage(){
  var p=prof();Q=null;
  if(!p){home();return}
  var h='<div class="card"><h2>📊 '+esc(S.cur)+' natijalari</h2>';
  if(!p.a.length)h+='<p class="mut">Hali test topshirilmagan.</p>';
  else{
    var avg=Math.round(p.a.reduce(function(s,x){return s+pct(x.s,x.m)},0)/p.a.length);
    h+='<p>Urinishlar: <b>'+p.a.length+'</b> · O‘rtacha: <b>'+avg+'%</b></p><h3>Mavzular bo‘yicha</h3><table><tr><th>Mavzu</th><th>Eng yaxshi</th><th>Urinish</th></tr>';
    T.forEach(function(t){var s=stats(t.id);h+='<tr><td>'+label(t)+'</td><td>'+(s.n?s.best+'%'+(s.best>=80?' <span class="badge">✓</span>':''):'—')+'</td><td>'+s.n+'</td></tr>'});
    h+='</table><h3>Tarix</h3><table><tr><th>Sana</th><th>Test</th><th>Ball</th></tr>';
    p.a.slice().reverse().slice(0,50).forEach(function(x){h+='<tr><td>'+fmt(x.d)+'</td><td>'+esc(x.n)+'</td><td>'+x.s+'/'+x.m+' ('+pct(x.s,x.m)+'%)</td></tr>'});
    h+='</table>';
  }
  h+='<div class="row" style="margin-top:14px"><button id="csv">⬇ Barcha o‘quvchilar CSV</button><button id="pr">🖨 Chop etish</button><button class="danger" id="del">Bu o‘quvchini o‘chirish</button></div></div>';
  $app.innerHTML=h;
  document.getElementById("pr").onclick=function(){window.print()};
  document.getElementById("csv").onclick=exportCsv;
  document.getElementById("del").onclick=function(){if(confirm(S.cur+" ning barcha natijalari o‘chiriladi. Davom etasizmi?")){delete S.p[S.cur];S.cur=Object.keys(S.p)[0]||"";save();home()}};
}
function exportCsv(){
  var rows=[["Oquvchi","Sana","Test","Togri","Jami","Foiz","Sekund"]];
  Object.keys(S.p).forEach(function(n){S.p[n].a.forEach(function(x){rows.push([n,new Date(x.d).toISOString(),x.n,x.s,x.m,pct(x.s,x.m),x.sec])})});
  var csv="\ufeff"+rows.map(function(r){return r.map(function(c){return'"'+String(c).replace(/"/g,'""')+'"'}).join(",")}).join("\n");
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="tarix-natijalar.csv";a.click();
}

/* ---------- Events ---------- */
document.getElementById("navHome").onclick=home;
document.getElementById("logo").onclick=function(e){e.preventDefault();home()};
document.getElementById("navStats").onclick=statsPage;
document.addEventListener("keydown",function(e){
  if(!Q||e.target.tagName==="INPUT")return;
  var k="1234".indexOf(e.key);if(k<0)k="abcd".indexOf(e.key.toLowerCase());
  if(k>=0&&k<4&&Q.pick<0&&Q.qs[Q.i])answer(k);
});
home();
})();
