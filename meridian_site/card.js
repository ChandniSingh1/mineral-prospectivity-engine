/* MERIDIAN card renderer. A line-for-line port of board/cardnew.py (card4) so the app and the boards say the same thing. */
(function(root){
var F="font-family:Outfit,sans-serif;";
var MONO="font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;";
var GL="background:rgba(14,16,20,0.62); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(18px) saturate(1.4); -webkit-backdrop-filter:blur(18px) saturate(1.4); box-shadow:0 14px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);";
var eyebrow=MONO+"font-size:9px; letter-spacing:0.22em; color:#8d8f94; text-transform:uppercase;";
var G='#8fdca4',TEAL='#3fc7d9',BLUE='#5aaeff',RED='#ff6a5a',ORANGE='#ff8a3d';
var hair='border-top:1px solid rgba(255,255,255,0.07)';
var VERDICT={A:'#32a467',B:'#2fa3a0',C:'#4c90f0',D:'#d9822b',E:'#cd4246',F:'#a82a2a'};
var HEAD_WORD={A:'Closely matches',B:'Strongly matches',C:'Partly matches',D:'Weakly matches',E:'Poorly matches',F:'Almost no match with'};
var LABEL={A:'High prospectivity',B:'Good prospectivity',C:'Moderate prospectivity',D:'Limited prospectivity',E:'Weak prospectivity',F:'Minimal prospectivity'};
var TOPLINE={A:'Top 5%',B:'Top 5 to 10%',C:'Top 10 to 20%',D:'Top 20 to 40%',E:'Top 40 to 70%',F:'Bottom 30%'};
var STATUS_FULL={CR:'Critically Endangered',EN:'Endangered',VU:'Vulnerable'};
var LETTERS='ABCDEF';
var WORD={clear:'No conflict',caution:'Caution',restricted:'Restricted'};
var COL={clear:G,caution:ORANGE,restricted:RED};
var MINED_ALERT_PCT=70;
function svgp(p,size,sw,col){return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 14 14" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round" style="flex:none">'+p+'</svg>';}
function ic(kind,size){size=size||14;var p={ok:['#8fdca4','<path d="M3 7.4 5.8 10 11 4.4"/>'],block:['#ff6a5a','<line x1="4" y1="4" x2="10" y2="10"/><line x1="10" y1="4" x2="4" y2="10"/>']}[kind];return svgp(p[1],size,1.6,p[0]);}
function TRI(c,s){c=c||ORANGE;s=s||14;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 14 14" fill="none" stroke="'+c+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M7 2 12.4 11.4H1.6Z"/><path d="M7 6v2.6"/><path d="M7 10.3v.1"/></svg>';}
function SHIELD(c){c=c||TEAL;return '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M7 1.4 11.6 3.2V7c0 2.7-2 4.5-4.6 5.6C4.4 11.5 2.4 9.7 2.4 7V3.2Z"/></svg>';}
function DROP(c){c=c||BLUE;return '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M7 1.8C7 1.8 3.4 6 3.4 8.4a3.6 3.6 0 0 0 7.2 0C10.6 6 7 1.8 7 1.8Z"/></svg>';}
function primary(t){return '<div style="'+F+'font-weight:500; font-size:13px; height:42px; border-radius:10px; background:#f2c14e; color:#17130a; display:flex; align-items:center; justify-content:center">'+t+'</div>';}
function ghost(t){return '<div style="'+F+'font-weight:400; font-size:13px; min-height:42px; padding:8px 12px; text-align:center; border-radius:10px; border:1px solid rgba(255,255,255,0.14); color:#ece8dc; display:flex; align-items:center; justify-content:center; gap:8px">'+t+'</div>';}
function rgbs(h){h=h.replace(/^#/,'');return [0,2,4].map(function(i){return parseInt(h.substr(i,2),16)}).join(',');}
function pyround(x){var f=Math.floor(x),d=x-f;if(d<0.5)return f;if(d>0.5)return f+1;return f%2===0?f:f+1;}
function fmtn(x){ // python: f'{x:.1f}'.rstrip('0').rstrip('.') if x<10 else f'{x:.0f}'
  if(x<10){var s=x.toFixed(1);s=s.replace(/0+$/,'');s=s.replace(/\.$/,'');return s;}
  var r=Math.round(x);if(Math.abs(x%1)===0.5)r=2*Math.round(x/2);return String(r);}
function fmtd(d){ // d is the stored display value (tenths below 10 km, whole km x10 above)
  if(d>=100)return String(d/10);var s=(d/10).toFixed(1);s=s.replace(/0+$/,'');return s.replace(/\.$/,'');}
function dnum(d){return d/10;}
function cap(n){return n==='unnamed river'?'An unnamed river':n;}
function art(n){return n==='unnamed river'?'an unnamed river':n;}
function hav(la1,lo1,la2,lo2){var p=Math.PI/180;var a=Math.pow(Math.sin((la2-la1)*p/2),2)+Math.cos(la1*p)*Math.cos(la2*p)*Math.pow(Math.sin((lo2-lo1)*p/2),2);return 2*6371*Math.asin(Math.sqrt(a));}
function f4(x){var a=Math.abs(x),t=a*32;if(Number.isInteger(t)&&t%2===1&&(a*1e4)%1===0.5){var f=Math.floor(a*1e4);return ((f%2===0?f:f+1)/1e4).toFixed(4);}return a.toFixed(4);} // python rounds exact halves to even, toFixed does not
function coord(la,lo){return f4(la)+'\u00b0 '+(la>=0?'N':'S')+', '+f4(lo)+'\u00b0 '+(lo<0?'W':'E');}
function nfmt(v){return pyround(v).toLocaleString('en-US');}
function esc(s){return s.replace(/"/g,'&quot;');}

function Data(meta,cols){this.m=meta;this.c=cols;this.n=meta.n;
  var N=meta.NX,NY=meta.NY;this.idx=new Int32Array(N*NY).fill(-1);
  for(var i=0;i<meta.n;i++)this.idx[cols.rr[i]*N+cols.cc[i]]=i;}
Data.prototype.cell=function(r,c){if(r<0||c<0||r>=this.m.NY||c>=this.m.NX)return -1;return this.idx[r*this.m.NX+c];};
Data.prototype.lat=function(i){return Math.fround(this.m.N0-(this.c.rr[i]+0.5)*this.m.res);};
Data.prototype.lon=function(i){return Math.fround(this.m.W0+(this.c.cc[i]+0.5)*this.m.res);};
Data.prototype.nm=function(kind,k){return this.m.names[kind][k];};
Data.prototype.treeNear=function(la,lo,maxkm){maxkm=maxkm||3.0;var best=null,T=this.m.TREES,TN={CR:'Critically Endangered',EN:'Endangered',VU:'Vulnerable'};
  for(var k=0;k<T.length;k++){var t=T[k],d=hav(la,lo,t.lat,t.lon);if(d<=maxkm&&(best===null||d<best[2]))best=[t.sp,TN[t.cat]||t.cat,d];}return best;};
Data.prototype.facts=function(i,m){
  var c=this.c,M=this.m,fl=c.fl[i];var la=this.lat(i),lo=this.lon(i);
  var f={i:i,lat:la,lon:lo,mineral:m};
  var graded=m!=='diamonds';
  f.grade=graded?LETTERS[c['g_'+m][i]]:null;
  var tname=this.nm('titled',c.tit_nm[i]),pname=this.nm('prot',c.prot_nm[i]);
  var rn=this.nm('river',c.riv_nm[i]),vn=this.nm('village',c.vil_nm[i]);
  f.titled={inside:!!(fl&1),caut:!!(fl&2),d:c.d_tit_km[i],name:tname};
  f.prot={inside:!!(fl&4),caut:!!(fl&8),d:c.d_prot_km[i],name:pname};
  var rk=c.d_riv_km[i],vk=c.d_vil_km[i],isVil=!!(fl&32),wn,wd,kind;
  if(isVil){wn=vn;wd=vk;kind='village';}else{wn=(rn&&['creek','active log'].indexOf(rn.toLowerCase())<0)?rn:'unnamed river';wd=rk;kind='river';}
  f.water={name:wn,d:wd,kind:kind,flag:!!(fl&16),rk:rk,vk:vk,rname:rn,vname:vn};
  f.mined={pct:c.mp[i],since:c.ms[i]||null};
  var wi=c.wi[i]-1;
  f.wild={species:(wi>=0?M.species[wi][0]:null),status:(wi>=0?STATUS_FULL[M.species[wi][1]]:null),count:c.wc[i]};
  f.nearest=null;
  if(m==='bauxite'){var best=null;M.MINES.forEach(function(x){var d=hav(la,lo,x.lat,x.lon);if(best===null||d<best.km||(d===best.km&&x.name<best.name))best={km:d,name:x.name};});f.nearest=best;}
  f.r=c.rr[i];f.cc=c.cc[i];
  return f;};
function sinceTxt(s){return s===null?'None':String(s);}
function alerts5(D,f){
  var out=[],wl=f.wild,w=f.water,m=f.mined;
  if(wl.species)out.push({key:'species',eb:'SMALL-RANGE SPECIES',col:ORANGE,ic:TRI(),title:wl.species,txt:wl.status+'. Found only in Guyana. This cell sits inside its mapped range.'});
  else{var tn=D.treeNear(f.lat,f.lon);if(tn)out.push({key:'tree',eb:'RARE TREE NEARBY',col:ORANGE,ic:TRI(),title:tn[0],txt:tn[1]+'. Found only in Guyana. A record sits '+fmtn(tn[2])+' km from this cell.'});}
  if(w.flag){
    if(w.kind==='village')out.push({key:'water',eb:'WATER WARNING',col:BLUE,ic:DROP(),title:'Water runs to '+w.name,txt:'Work here could carry mercury and silt down to the village water.'});
    else out.push({key:'water',eb:'WATER WARNING',col:BLUE,ic:DROP(),title:(w.name==='unnamed river'?'River '+fmtd(w.d)+' km away':w.name+' '+fmtd(w.d)+' km away'),txt:'Work here could carry mercury and silt into the river.'});}
  if(m.pct>=MINED_ALERT_PCT)out.push({key:'mined',eb:'HEAVILY MINED',col:ORANGE,ic:TRI(),title:'About '+m.pct+'% already mined',txt:'Mining scars cover about '+m.pct+'% of the ground within 2 km, first seen in '+sinceTxt(m.since)+'.'});
  return out;}
var CH='<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#8d8f94" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="flex:none; margin-left:auto">%s</svg>';
function alertsHtml(al,open,inter){open=(open===undefined?0:open);
  var n=al.length;if(n===0)return '';var h='';
  al.forEach(function(a,k){var col=a.col,r=rgbs(col);
    if(n===1){h+='<div style="margin-top:12px; padding:10px 12px 11px; border-radius:9px; background:rgba('+r+',0.10); border:1px solid rgba('+r+',0.45)"><div style="display:flex; align-items:center; gap:8px">'+a.ic+'<span style="'+MONO+'font-size:8.5px; letter-spacing:0.15em; color:'+col+'; flex:none">'+a.eb+'</span><span style="'+F+'font-weight:300; font-size:13px; color:#f6f1e2">'+a.title+'</span></div><div style="'+F+'font-weight:300; font-size:12px; line-height:1.4; color:#d4d0c2; margin-top:6px">'+a.txt+'</div></div>';}
    else{var op=(k===open);var chev=CH.replace('%s',op?'<path d="M2 6.5 5 3.5l3 3"/>':'<path d="M2 3.5 5 6.5l3-3"/>');
      var body=op?'<div style="'+F+'font-weight:300; font-size:12px; line-height:1.4; color:#d4d0c2; margin-top:5px">'+a.txt+'</div>':'';
      h+='<div'+(inter?' data-alert="'+k+'"':'')+' style="margin-top:'+(k===0?12:6)+'px; padding:8px 11px; border-radius:9px; background:rgba('+r+',0.10); border:1px solid rgba('+r+',0.45)"><div style="display:flex; align-items:center; gap:8px">'+a.ic+'<span style="'+MONO+'font-size:8.5px; letter-spacing:0.15em; color:'+col+'; flex:none">'+a.eb+'</span><span style="'+F+'font-weight:300; font-size:12.5px; color:#f6f1e2; '+(op?'':'white-space:nowrap; overflow:hidden; text-overflow:ellipsis')+'">'+a.title+'</span>'+chev+'</div>'+body+'</div>';}});
  return h;}
function rowIcon(name,status){
  if(status==='clear')return ic('ok',14);if(status==='restricted')return ic('block',14);
  return {'Titled land':SHIELD(ORANGE),'Protected area':SHIELD(ORANGE),'Water':DROP(),'Mined ground':TRI(),'Wildlife':TRI()}[name];}
function okline(name,detail){return '<div style="display:flex; align-items:baseline; justify-content:space-between; gap:14px; padding:4px 0 4px 25px"><span style="'+F+'font-size:12px; color:#ece8dc; flex:none">'+name+'</span><span style="'+F+'font-size:10.5px; line-height:1.3; color:#8d8f94; text-align:right">'+detail+'</span></div>';}
function checkRows4(D,f){
  var t=f.titled,p=f.prot,w=f.water,m=f.mined,wl=f.wild,rows=[];
  if(t.inside)rows.push(['Titled land','restricted','Inside titled land held by '+(t.name||'a titled holder')]);
  else if(t.caut)rows.push(['Titled land','caution','Nearest titled land '+fmtd(t.d)+' km. Confirm the boundary with the land registry']);
  else rows.push(['Titled land','clear','Nearest titled land '+fmtd(t.d)+' km']);
  if(p.inside)rows.push(['Protected area','restricted','Inside '+p.name+'. Mining is not permitted']);
  else if(p.caut)rows.push(['Protected area','caution','Nearest protected area, '+p.name+', '+fmtd(p.d)+' km']);
  else rows.push(['Protected area','clear','Nearest protected area '+fmtd(p.d)+' km']);
  rows.push(['Water',w.flag?'caution':'clear',w.vname+' '+fmtd(w.vk)+' km. River '+fmtd(w.rk)+' km']);
  if(m.pct>=25)rows.push(['Mined ground','caution','Mining scars cover '+m.pct+'% of land within 2 km, since '+sinceTxt(m.since)]);
  else rows.push(['Mined ground','clear','Mining scars cover '+m.pct+'% of land within 2 km']);
  var tn=D.treeNear(f.lat,f.lon);
  if(wl.species)rows.push(['Wildlife','caution',wl.species+' is listed '+wl.status]);
  else if(tn)rows.push(['Wildlife','caution',tn[0]+' is listed '+tn[1]+'. A record sits '+fmtn(tn[2])+' km away']);
  else rows.push(['Wildlife','clear','No small-range mammal range here']);
  return rows;}
function checks5(D,f,al){
  var rows=checkRows4(D,f),keys={species:'Wildlife',tree:'Wildlife',water:'Water',mined:'Mined ground'},cover={};
  al.forEach(function(a){cover[keys[a.key]]=1;});
  rows=rows.map(function(r){return [r[0],r[1],(cover[r[0]]&&r[1]!=='clear')?'':r[2]];});
  var warn=rows.filter(function(r){return r[1]!=='clear'}).sort(function(a,b){return (a[1]!=='restricted')-(b[1]!=='restricted');});
  var clear=rows.filter(function(r){return r[1]==='clear'});
  function one(n,s,d){return '<div style="padding:6px 0; '+hair+'"><div style="display:flex; align-items:center; gap:11px">'+rowIcon(n,s)+'<span style="'+F+'font-size:12px; color:#ece8dc; flex:1">'+n+'</span><span style="'+F+'font-size:12px; color:'+COL[s]+'">'+WORD[s]+'</span></div>'+(d?'<div style="'+F+'font-size:10.5px; line-height:1.35; color:#8d8f94; margin:1px 0 0 25px">'+d+'</div>':'')+'</div>';}
  var out=warn.map(function(r){return one(r[0],r[1],r[2])}).join('');
  if(clear.length)out+='<div style="'+hair+'; padding-top:10px"><div style="display:flex; align-items:center; gap:11px; margin-bottom:2px">'+ic('ok',14)+'<span style="'+F+'font-size:12.5px; color:'+G+'; flex:1">No conflict</span><span style="'+F+'font-size:12.5px; color:#6f7176">'+clear.length+'</span></div>'+clear.map(function(r){return okline(r[0],r[2])}).join('')+'</div>';
  return out;}
function evidence3(D,f){
  var M=D.m,m=f.mineral,g=f.grade,i=f.i,E=M.EV[m],mn=(m==='diamonds'?'diamond':m),cand=[];
  var code=D.c.geo[i],nm=M.ROCK[code];
  if(nm&&E.share[String(code)]!==undefined){var pq=E.share[String(code)],p=pq[0],q=pq[1],lift=(p+0.05)/(q+0.05);
    if(lift>=1.3)cand.push([Math.abs(Math.log(lift)),true,'This square sits on '+nm+', which holds '+fmtn(p)+'% of known '+mn+' deposits but covers only '+fmtn(q)+'% of Guyana.']);
    else if(lift<=0.77)cand.push([Math.abs(Math.log(lift)),false,'This square sits on '+nm+', which holds only '+fmtn(p)+'% of known '+mn+' deposits but covers '+fmtn(q)+'% of Guyana.']);}
  var el=D.c.el[i],rl=D.c.rl[i],e0=E.elev_rng[0],e1=E.elev_rng[1],r0=E.relief_rng[0],r1=E.relief_rng[1];
  function rng(v,lo,hi){if(lo<=v&&v<=hi)return 0.0;return Math.min(3.0,((v<lo?lo-v:v-hi))/Math.max(hi-lo,1));}
  var de=rng(el,e0,e1),dr=rng(rl,r0,r1),N=nfmt;
  cand.push(de===0?[0.5,true,'At '+N(el)+' meters above sea level, this square falls well within the typical elevation range for '+mn+', as 80% of known deposits are found between '+N(e0)+' and '+N(e1)+' meters.']:[0.5+de,false,'At '+N(el)+' meters above sea level, this square falls outside the typical elevation range for '+mn+', as 80% of known deposits are found between '+N(e0)+' and '+N(e1)+' meters.']);
  cand.push(dr===0?[0.45,true,'With '+N(rl)+' meters of local relief, this square falls well within the typical relief range for '+mn+', as 80% of known deposits are found between '+N(r0)+' and '+N(r1)+' meters.']:[0.45+dr,false,'With '+N(rl)+' meters of local relief, this square falls outside the typical relief range for '+mn+', as 80% of known deposits are found between '+N(r0)+' and '+N(r1)+' meters.']);
  var ns=f.nearest;
  if(ns&&ns.km<=25)cand.push([ns.km<=5?1.0:0.6,true,'The nearest known '+mn+' site, '+ns.name+', is '+fmtn(ns.km)+' km away.']);
  if(m==='gold'&&0<f.mined.pct&&f.mined.pct<70)cand.push([Math.min(f.mined.pct/40,1.2),true,'Mining scars cover '+f.mined.pct+'% of the land within 2 km.']);
  var want=(g===null||'ABC'.indexOf(g)>=0);
  function sortDesc(a){return a.map(function(x,k){return [x,k]}).sort(function(a,b){return (b[0][0]-a[0][0])||(a[1]-b[1]);}).map(function(z){return z[0]});}
  var pri=sortDesc(cand.filter(function(x){return x[1]===want})),oth=sortDesc(cand.filter(function(x){return x[1]!==want}));
  var L=pri.concat(oth).slice(0,2).map(function(x){return x[2]});
  if(g){var tr=M.tested[m],rt=tr.grades[g],base=tr.base,ratio=rt/base,cmp='('+fmtn(rt)+' in 100 against '+fmtn(base)+' in 100)';
    var band=(g!=='F')?TOPLINE[g].toLowerCase().replace('top','the top'):'the bottom 30%',sub='Squares ranked in '+band+' of Guyana';
    if(rt===0)L.push(sub+' held no known '+mn+' (0 in 100 against '+fmtn(base)+' in 100).');
    else if(ratio>=1.5){var rs=ratio>=3?String(pyround(ratio)):ratio.toFixed(1);L.push(sub+' are about '+rs+' times more likely to sit on known '+mn+' than a typical square '+cmp+'.');}
    else if(ratio>=0.67)L.push(sub+' are about as likely to sit on known '+mn+' as a typical square '+cmp+'.');
    else L.push(sub+' are about '+pyround(1/ratio)+' times less likely to sit on known '+mn+' than a typical square '+cmp+'.');}
  else L.push('This square is not graded, because only '+E.n+' known diamond sites exist, too few for a grade.');
  return L;}
function evidence4(D,f){
  var base=evidence3(D,f);
  function kind(t){return t.indexOf('This square sits on')===0?'rock':t.indexOf('above sea level')>=0?'elev':t.indexOf('relief')>=0?'relief':t.indexOf('The nearest')===0?'site':t.indexOf('Mining scars')===0?'scars':t.indexOf('This square is not graded')===0?'nograde':'pred';}
  var LEAD={rock:'Rock.',elev:'Elevation.',relief:'Relief.',site:'Nearest site.',scars:'Satellite scan.',pred:'Test result.',nograde:'Not graded.'};
  var facts=base.slice(0,-1).map(function(t){return [kind(t),t]}),keep=facts.slice(0,1);
  if(facts.length>1&&(['rock','site','scars'].indexOf(facts[1][0])>=0||facts[1][1].indexOf('outside')>=0))keep.push(facts[1]);
  var last=base[base.length-1],k=kind(last);
  if(k==='nograde')last=last.replace('This square is not graded, because only','Only');
  keep.push([k,last]);
  return keep.map(function(z){return '<b style="font-weight:500; color:#f6f1e2">'+LEAD[z[0]]+'</b> '+z[1]});}
function evList(items,gc){return '<div style="'+eyebrow+'; margin:12px 0 2px">Evidence</div>'+items.map(function(t){return '<div style="display:flex; gap:11px; padding:2.5px 0; '+F+'font-weight:300; font-size:11.5px; line-height:1.38; color:#d4d2ca"><span style="width:6px; height:6px; border-radius:50%; background:'+gc+'; flex:none; margin-top:6px"></span><span>'+t+'</span></div>'}).join('');}
function g42(t){return '<div style="'+F+'font-weight:400; font-size:13px; height:42px; box-sizing:border-box; border-radius:10px; border:1px solid rgba(255,255,255,0.14); color:#ece8dc; display:flex; align-items:center; justify-content:center">'+t+'</div>';}
function nextStep(D,f,rows,al,dlevel){var g=f.grade,mn=(f.mineral==='diamonds'?'diamond':f.mineral),bad=rows.filter(function(r){return r[1]==='restricted'})[0],warn=rows.filter(function(r){return r[1]==='caution'}),v,why;
  var PH={'Titled land':'titled land is close by','Protected area':'a protected area is close by','Water':'water is close by','Mined ground':'mining scars are nearby','Wildlife':'a listed species may be here'};
  var list=warn.length>2?(warn.length+' things need a look'):warn.map(function(r){return PH[r[0]]||r[0].toLowerCase()}).join(' and ');
  if(bad){v='Skip';why=bad[0]+' is restricted here. '+bad[2]+'.';}
  else if(!g){if(dlevel==='high'){v='Check first';why='Looks like known diamond ground, but diamond is not graded. Treat it as a lead and confirm it on the ground.';}else{v='Skip';why='Does not stand out for diamond.';}}
  else if('AB'.indexOf(g)>=0){if(warn.length){v='Check first';why='Strong grade, but '+list+'.';}else{v='Go';why=TOPLINE[g]+' for '+mn+' with nothing blocking it. Worth a closer look.';}}
  else if(g==='C'){v='Check first';why=warn.length?('Middle grade, and '+list+'.'):'Middle grade. Nothing blocks it, but the evidence is moderate.';}
  else{v='Skip';why='Grade '+g+' ranks low for '+mn+'. Look at squares nearby with a higher grade.';}
  return [v,why];}
function nextHtml(ns){var k=ns[0],W='#f6f1e2';
  var dot={'Go':'<circle cx="6" cy="6" r="5" fill="'+W+'" stroke="'+W+'" stroke-width="1.2"/>','Check first':'<circle cx="6" cy="6" r="5" fill="none" stroke="'+W+'" stroke-width="1.2"/><path d="M6 1a5 5 0 0 1 0 10z" fill="'+W+'"/>','Skip':'<circle cx="6" cy="6" r="5" fill="none" stroke="'+W+'" stroke-width="1.2" opacity=".6"/>'}[k];
  var tag={'Go':'PROCEED','Check first':'REVIEW','Skip':'PASS'}[k];
  return '<div style="margin-top:12px; padding:14px 16px 15px; border-radius:9px; background:rgba(255,255,255,0.07)"><div style="display:flex; justify-content:space-between; align-items:center"><span style="'+MONO+'font-size:9px; letter-spacing:0.2em; color:#8d8f94">NEXT STEP</span><span style="'+MONO+'display:inline-flex; align-items:center; gap:7px; font-size:9.5px; letter-spacing:0.16em; color:'+W+'; border:1px solid rgba(246,241,226,0.35); border-radius:20px; padding:3px 9px 3px 7px"><svg width="11" height="11" viewBox="0 0 12 12">'+dot+'</svg>'+tag+'</span></div><div style="'+F+'font-weight:600; font-size:22px; line-height:1.1; letter-spacing:-0.01em; color:'+W+'; margin-top:8px">'+k+'</div><div style="'+F+'font-weight:300; font-size:12.5px; line-height:1.4; color:#d4d0c2; margin-top:7px">'+ns[1]+'</div></div>';}
function checksCompact(D,f){var rows=checkRows4(D,f);
  return '<div style="display:grid; grid-template-columns:1fr 1fr; gap:2px 14px">'+rows.map(function(r){return '<div title="'+esc(r[2])+'" style="display:flex; align-items:center; gap:8px; padding:3px 0; cursor:help">'+rowIcon(r[0],r[1])+'<span style="'+F+'font-size:12px; color:#ece8dc; flex:1; white-space:nowrap">'+r[0]+'</span><span style="'+F+'font-size:10.5px; color:'+COL[r[1]]+'; white-space:nowrap">'+(r[1]==='clear'?'Clear':WORD[r[1]])+'</span></div>'}).join('')+'</div>';}
function card4raw(D,f,o){o=o||{};var OPEN=(o.open===undefined?0:o.open);var pill=o.pill||'PREDICTED',pc=o.pc||'#f2c14e',pos=(o.pos===undefined?'right:48px; top:70px':o.pos),w=o.w||350;
  var M=D.m,m=f.mineral,g=f.grade,al=alerts5(D,f),rows=checkRows4(D,f);
  var restricted=rows.some(function(r){return r[1]==='restricted'});
  var btn=restricted?ghost(M.wording.button_restricted):primary(M.wording.button);
  var head,evh,gc,mn=(m==='diamonds'?'diamond':m);
  if(g){gc=VERDICT[g];
    var tip=esc((g==='A'?'Closely matches':HEAD_WORD[g])+' ground where '+mn+' is already mined or listed. A program learned from '+M.EV[m].n.toLocaleString('en-US')+' known '+mn+' squares which rock and ground shape they share, then scored all of Guyana.');
    if(o.compact)head='<div title="'+tip+'" style="display:flex; align-items:center; gap:16px; margin-top:12px; padding:12px 0; border-top:1px solid #2a2e36; border-bottom:1px solid #2a2e36; cursor:help"><div style="width:58px; height:58px; flex:none; box-sizing:border-box; border-radius:11px; border:2.5px solid '+gc+'; display:flex; align-items:center; justify-content:center; '+F+'font-weight:500; -webkit-text-stroke:1.4px currentColor; font-size:38px; line-height:38px; color:'+gc+'">'+g+'</div><div><div style="'+MONO+'font-size:11px; letter-spacing:0.18em; color:#f6f1e2">'+LABEL[g].split(' ')[0].toUpperCase()+' PROSPECTIVITY</div><div style="'+F+'font-weight:300; font-size:12px; color:#8d8f94; margin-top:5px">'+TOPLINE[g]+' of Guyana for '+mn+'</div></div></div>';
    else head='<div title="'+tip+'" style="text-align:center; margin-top:18px; padding:14px 0 8px; border-top:1px solid #2a2e36; border-bottom:1px solid #2a2e36; cursor:help">'
      +'<div style="width:76px; height:76px; margin:0 auto; box-sizing:border-box; border-radius:13px; border:3px solid '+gc+'; display:flex; align-items:center; justify-content:center; '+F+'font-weight:500; -webkit-text-stroke:1.8px currentColor; font-size:50px; line-height:50px; color:'+gc+'">'+g+'</div>'
      +'<div style="'+MONO+'font-size:11px; letter-spacing:0.18em; color:#f6f1e2; margin-top:16px">'+LABEL[g].split(' ')[0].toUpperCase()+' PROSPECTIVITY</div>'
      +'<div style="'+F+'font-weight:300; font-size:12px; color:#8d8f94; margin-top:6px">'+TOPLINE[g]+' of Guyana for '+mn+'</div></div>';
    evh=evList(evidence4(D,f),gc);}
  else if(o.dlevel){var hi=o.dlevel==='high',dc='#9fc4e6',n=M.EV[m].n;gc='#aac8e2';
    var tip=esc('Only '+n+' known diamond sites exist, too few for an A to F grade. The model separates squares into two levels only. Higher means the ground looks like those sites.');
    if(o.compact)head='<div title="'+tip+'" style="display:flex; align-items:center; gap:16px; margin-top:12px; padding:12px 0; border-top:1px solid #2a2e36; border-bottom:1px solid #2a2e36; cursor:help"><div style="width:58px; height:58px; flex:none; box-sizing:border-box; border-radius:11px; border:2.5px '+(hi?'solid ':'dashed ')+(hi?dc:'#4a505c')+'; display:flex; align-items:center; justify-content:center"><svg width="30" height="30" viewBox="0 0 38 38" aria-hidden="true"><path d="M19 4 L33 16 L19 34 L5 16 Z M5 16 H33 M12 16 L19 4 L26 16 M12 16 L19 34 L26 16" fill="'+(hi?'rgba(159,196,230,.28)':'none')+'" stroke="'+(hi?dc:'#4a505c')+'" stroke-width="2" stroke-linejoin="round"/></svg></div><div><div style="'+MONO+'font-size:11px; letter-spacing:0.18em; color:#f6f1e2">'+(hi?'HIGHER':'LOWER')+' LIKELIHOOD</div><div style="'+F+'font-weight:300; font-size:12px; color:#8d8f94; margin-top:5px">'+(hi?'Looks like known diamond ground':'Does not stand out for diamond')+'</div><div style="'+MONO+'font-size:9px; letter-spacing:0.1em; color:#6f727a; margin-top:5px; text-transform:uppercase">Not graded. Only '+n+' known sites</div></div></div>';
    else head='<div title="'+tip+'" style="text-align:center; margin-top:18px; padding:14px 0 8px; border-top:1px solid #2a2e36; border-bottom:1px solid #2a2e36; cursor:help">'
      +'<div style="width:76px; height:76px; margin:0 auto; box-sizing:border-box; border-radius:13px; border:3px '+(hi?'solid ':'dashed ')+(hi?dc:'#4a505c')+'; display:flex; align-items:center; justify-content:center"><svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><path d="M19 4 L33 16 L19 34 L5 16 Z M5 16 H33 M12 16 L19 4 L26 16 M12 16 L19 34 L26 16" fill="'+(hi?'rgba(159,196,230,.28)':'none')+'" stroke="'+(hi?dc:'#4a505c')+'" stroke-width="2" stroke-linejoin="round"/></svg></div>'
      +'<div style="'+MONO+'font-size:11px; letter-spacing:0.18em; color:#f6f1e2; margin-top:16px">'+(hi?'HIGHER':'LOWER')+' LIKELIHOOD</div>'
      +'<div style="'+F+'font-weight:300; font-size:12px; color:#8d8f94; margin-top:6px">'+(hi?'Looks like known diamond ground':'Does not stand out for diamond')+'</div>'
      +'<div style="'+MONO+'font-size:9.5px; letter-spacing:0.12em; color:#6f727a; margin-top:10px; text-transform:uppercase">Not graded. Only '+n+' known sites</div></div>';
    evh=evList(evidence4(D,f),gc);}
  else{head='<div style="'+F+'font-weight:200; font-size:28px; line-height:34px; color:#f6f1e2; margin-top:12px">Not enough data to grade.</div>';gc='#aac8e2';evh=evList(evidence4(D,f),gc);}
  return '<div style="'+(pos?'position:absolute; '+pos+'; ':'')+'width:'+w+'px; box-sizing:border-box; padding:16px 22px; border-radius:16px; '+GL.replace('0.62','0.78')+'">'
    +'<div style="display:flex; justify-content:space-between; align-items:center"><span style="'+eyebrow+'">Selected cell</span><span style="display:flex; align-items:center; height:22px; padding:0 10px; border-radius:11px; border:1px solid '+pc+'; '+MONO+'font-size:9px; letter-spacing:0.16em; color:'+pc+'">'+pill+'</span></div>'
    +'<div style="'+F+'font-weight:300; font-size:11.5px; color:#8d8f94; margin:8px 0 0">'+coord(f.lat,f.lon)+' \u00b7 one 500 m cell</div>'
    +head+(o.compact?nextHtml(nextStep(D,f,rows,al,o.dlevel)):'')+alertsHtml(al,OPEN,o.interactive)+evh+(o.ovl||'')
    +'<div style="'+eyebrow+'; margin:12px 0 '+(o.compact?'2px':'0')+'">Checks</div><div>'+(o.compact?checksCompact(D,f):checks5(D,f,al))+'</div>'+(o.compact?'<div style="display:flex; gap:8px; margin-top:10px"><div data-act="add" style="flex:1; cursor:pointer">'+(o.saved?g42('Saved. Edit note'):primary('Save to My sites'))+'</div><div data-act="cmp" style="width:112px; cursor:pointer">'+g42(o.inCmp?'In compare':'Compare')+'</div></div>':'<div'+(o.interactive?' data-act="add" style="margin-top:10px; cursor:pointer"':' style="margin-top:10px"')+'>'+btn+'</div>')+'</div>';}
function card4(D,f,o){var h=card4raw(D,f,o);if(o&&o.compact){h=h.replace(/font-size:(8\.5|9|9\.5)px/g,'font-size:10px').replace(/#8d8f94/g,'#a4a6ab')}return h}
var API={fmtd:fmtd,nextStep:nextStep,Data:Data,card4:card4,fmtn:fmtn,coord:coord,VERDICT:VERDICT,TOPLINE:TOPLINE,LABEL:LABEL,checkRows4:checkRows4,alerts5:alerts5,hav:hav};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.MC=API;
})(typeof window!=='undefined'?window:this);
