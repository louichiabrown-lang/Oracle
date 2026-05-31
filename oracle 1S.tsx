import { useState, useCallback, useRef } from "react";
import {
  ChevronDown, ChevronUp, Loader,
  X, GripVertical, Zap, Palette, Edit3, Save,
  Heart, Check, FileText, Trash2
} from "lucide-react";

/* ── PALETTE ── */
const C={
  bg:"#F8F5F0",card:"#FFFFFF",border:"#E5E7EB",
  dark:"#2D2926",gold:"#B89763",muted:"#6B7280",faint:"#9CA3AF",
  high:"#7C5CBF",highL:"#F0EBFB",
  mid:"#2E8B6E", midL:"#EDF7F3",
  low:"#B89763", lowL:"#FAF4E1",
  rest:"#8A5A3A",restL:"#FBF0E8",
  serif:"'Georgia','Times New Roman',serif",
  sans:"'Segoe UI','Arial',sans-serif",
};
const EM={
  high:{c:C.high,bg:C.highL,fr:"Haute performance",en:"High performance",cost:1},
  mid: {c:C.mid, bg:C.midL, fr:"Flux stable",      en:"Steady flow",     cost:2},
  low: {c:C.low, bg:C.lowL, fr:"Récupération",     en:"Recovery",        cost:3},
  rest:{c:C.rest,bg:C.restL,fr:"Incubation",       en:"Incubation",      cost:4},
};
const TASK_COLORS=["#F0EBFB","#EDF7F3","#FAF4E1","#FBF0E8","#FDF0F3","#EEF3FB","#FDFAED","#FFFFFF"];

/* ══ MOTEUR ══ */
const E={
  hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;},
  profile(bd){return bd?E.hash(bd)%4:0;},
  momentum(bd,dow){
    if(!bd)return 72;
    const d=new Date(bd);
    const n=(d.getFullYear()*31+d.getMonth()*7+d.getDate()*3+dow*11)%100;
    return 50+Math.abs(n-50);
  },
  guidance(bd,dow,fr){
    const m=E.momentum(bd,dow);
    if(m>=80)return fr?"Potentiel maximal — agissez sur votre levier principal.":"Peak potential — act on your main lever.";
    if(m>=60)return fr?"Flux optimal — priorisez les actions à fort impact.":"Optimal flow — prioritise high-impact actions.";
    if(m>=40)return fr?"Phase de consolidation — affinez et préparez.":"Consolidation — refine and prepare.";
    return fr?"Phase de régénération — investissez dans votre récupération.":"Regeneration — invest in your recovery.";
  },
  taskScore(text){
    const t=text.toLowerCase();
    let urgency=5,energyCost=5;
    if(/urgent|asap|aujourd|today|deadline|absolument|impératif|critique|critical|now/.test(t))urgency+=4;
    if(/lancer|publish|envoyer|send|soumettre|submit|post|publier/.test(t))urgency+=2;
    if(/préparer|rédiger|écrire|write|créer|create|planif/.test(t))urgency+=1;
    if(/idée|reflect|penser|think|explorer|recherch|research/.test(t))urgency-=2;
    if(/appel|call|réunion|meeting|présentation|présenter|négoci|pitch/.test(t))energyCost+=3;
    if(/rédiger|écrire|write|créer|create|développer|develop/.test(t))energyCost+=2;
    if(/lire|read|recherch|research|explorer/.test(t))energyCost+=1;
    if(/admin|facture|invoice|archiver|classer|trier|sort/.test(t))energyCost-=1;
    return{urgency:Math.min(10,Math.max(1,urgency)),energyCost:Math.min(10,Math.max(1,energyCost))};
  },
  dispatch(taskList,birthDate,d,fr){
    const days=Array.from({length:7},(_,i)=>{
      const energy=d.dayEnergy[i];
      const em=EM[energy];
      return{idx:i,energy,mom:E.momentum(birthDate,i),capacity:em.cost<=2?4:em.cost===3?3:2,load:0,energyCost:em.cost};
    });
    const scored=taskList.map((text,ti)=>{
      const s=E.taskScore(text);
      return{text,urgency:s.urgency,energyCost:s.energyCost,idx:ti};
    });
    scored.sort((a,b)=>b.urgency-a.urgency||(a.energyCost-b.energyCost));
    const result={};
    scored.forEach(task=>{
      let best=null,bestScore=-Infinity;
      days.forEach(day=>{
        if(day.load>=day.capacity)return;
        const em=10-Math.abs(day.energyCost-(task.energyCost/2.5));
        const mb=task.urgency>=7?(day.mom/10):0;
        const lp=day.load*2;
        const s=em+mb-lp+(day.mom*0.05);
        if(s>bestScore){bestScore=s;best=day;}
      });
      if(!best){days.sort((a,b)=>a.load-b.load);best=days[0];}
      if(!result[best.idx])result[best.idx]=[];
      result[best.idx].push({
        id:Date.now()+Math.random()+"",
        text:task.text,
        guidance:E.guidance(birthDate,best.idx,fr),
        time:d.dayWindow[best.idx],
        color:EM[best.energy].bg,
      });
      best.load++;
    });
    return result;
  },
  SOM:[
    {fr:"Manœuvre EMDR légère : suivez lentement votre doigt de G à D, 20 allers-retours. Le système nerveux se recalibre en 90 secondes.",en:"Light EMDR: follow your finger left to right, 20 sweeps. Nervous system recalibrates in 90 seconds."},
    {fr:"Tapping EFT — Point karaté : tapotez le tranchant de la main 30 fois. 'Je relâche ce qui me retient.'",en:"EFT Karate point: tap edge of hand 30 times. 'I release what holds me back.'"},
    {fr:"Gargarisme tonique : garglez de l'eau fraîche 30 secondes. Stimule directement le nerf vague.",en:"Tonic gargling: gargle cool water 30 sec. Directly stimulates the vagus nerve."},
    {fr:"Acupuncture VG26 : pressez le creux entre nez et lèvre supérieure 30 secondes. Dissout la brume mentale.",en:"GV26: press groove between nose and upper lip for 30 seconds. Dissolves mental fog."},
    {fr:"Tapping EFT — Sommet du crâne : tapotez doucement 40 fois. Intègre les deux hémisphères cérébraux.",en:"EFT Crown: tap gently 40 times. Integrates both brain hemispheres."},
    {fr:"Secouage spontané : fléchissez les genoux, laissez les jambes vibrer 60 secondes.",en:"Spontaneous shaking: bent knees, let legs vibrate 60 seconds."},
    {fr:"Acupuncture MC6 : 3 doigts du poignet face interne, pressez 45 secondes. Apaise palpitations et anxiété.",en:"PC6: 3 fingers from inner wrist, press 45 seconds. Soothes palpitations and anxiety."},
    {fr:"Respiration physiologique : deux courtes inspirations nez, longue expiration bouche. ×5.",en:"Physiological sigh: two short nose inhales, long mouth exhale. ×5."},
    {fr:"Tapping EFT — Sous les yeux : tapotez l'os sous chaque œil 30 fois. Régule peur et hypervigilance.",en:"EFT Under-eye: tap bone under each eye 30 times. Regulates fear and hypervigilance."},
    {fr:"Soupir expiratoire prolongé : inspirez, puis expirez très lentement (8-10 sec). ×4.",en:"Extended sigh: inhale, then exhale very slowly (8-10 sec). ×4."},
  ],
  OLF:[
    {fr:"Romarin — 1 goutte sur les poignets, inhalez 5 fois. Stimule la mémoire de travail en 3 minutes.",en:"Rosemary — 1 drop on wrists, inhale 5×. Stimulates working memory within 3 minutes."},
    {fr:"Bergamote — diffusez ou inhalez directement. Anxiolytique naturel via le système limbique.",en:"Bergamot — diffuse or inhale directly. Natural anxiolytic via the limbic system."},
    {fr:"Ylang-ylang — 1 goutte sur le sternum. Court-circuite le mental via le cortex olfactif.",en:"Ylang-ylang — 1 drop on sternum. Bypasses mind via olfactory cortex."},
    {fr:"Lavande vraie — inhalez 3 respirations profondes. Interrompt les boucles de pensée anxieuses.",en:"True lavender — inhale 3 deep breaths. Interrupts anxious thought loops."},
    {fr:"Encens / Oliban — diffusez. Les sesquiterpènes traversent la barrière hémato-encéphalique.",en:"Frankincense — diffuse. Sesquiterpenes cross the blood-brain barrier."},
    {fr:"Menthe poivrée — 1 goutte sous le nez. Stimulant sympathique immédiat.",en:"Peppermint — 1 drop under nose. Immediate sympathetic stimulant."},
    {fr:"Rose de Damas — sur le plexus solaire. Active les récepteurs liés à la confiance et l'intuition.",en:"Damask rose — on solar plexus. Activates receptors linked to confidence and intuition."},
    {fr:"Vétiver — sur la voûte plantaire. Ancrage au sol immédiat.",en:"Vetiver — on soles of feet. Immediate grounding."},
  ],
  NUT:[
    {fr:"Magnésium bisglycinate (200 mg) — régule la transmission GABAergique, réduit les tensions.",en:"Magnesium bisglycinate (200mg) — regulates GABAergic transmission, reduces tension."},
    {fr:"Eau + citron + sel rose — réhydrate les cellules nerveuses et restaure l'équilibre électrolytique.",en:"Water + lemon + pink salt — rehydrates nerve cells and restores electrolyte balance."},
    {fr:"Chocolat noir 85%+ (3 carrés) — augmente le flux sanguin cérébral et stimule la sérotonine.",en:"Dark chocolate 85%+ (3 squares) — increases cerebral blood flow, stimulates serotonin."},
    {fr:"Thé matcha (sans sucre) — L-théanine + caféine = état d'alerte détendue unique.",en:"Matcha tea (unsweetened) — L-theanine + caffeine = unique relaxed alertness state."},
    {fr:"Myrtilles (une poignée) — les anthocyanines protègent les neurones du stress oxydatif.",en:"Blueberries (a handful) — anthocyanins protect neurons from oxidative stress."},
    {fr:"Ashwagandha (1 capsule) — réduit le cortisol et restaure la résilience au stress chronique.",en:"Ashwagandha (1 capsule) — reduces cortisol, restores resilience to chronic stress."},
  ],
  LEV:[
    {fr:"Identifiez l'action qui, si elle est faite aujourd'hui, rend toutes les autres inutiles. Faites-la en premier.",en:"Identify the one action that, done today, makes all others unnecessary. Do it first."},
    {fr:"Bloquez 90 minutes sans interruption sur votre priorité principale. Ce bloc est sacré.",en:"Block 90 minutes without interruption on your main priority. This block is sacred."},
    {fr:"Avant de commencer : écrivez en une phrase l'impact que cette journée doit produire.",en:"Before starting: write in one sentence the impact this day must produce."},
    {fr:"Qu'est-ce qui est à 80% prêt et attend d'être lancé ? Finissez-le aujourd'hui.",en:"What is 80% ready and waiting to be launched? Finish it today."},
    {fr:"Flux optimal. Enchaînez deux blocs de 45 minutes sur votre action principale.",en:"Optimal flow. Chain two 45-minute blocks on your main action."},
  ],
  SWT:[
    {fr:"Un imprévu n'est pas un échec — c'est une information. La trajectoire compte plus que la journée.",en:"An unexpected event is not a failure — it's information. Trajectory matters more than a single day."},
    {fr:"Une action imparfaite vaut mieux qu'une perfection reportée. Vous avez quand même avancé.",en:"An imperfect action beats postponed perfection. You still moved forward."},
    {fr:"La fatigue est un signal, pas une défaillance. Accordez-vous la permission de ralentir.",en:"Fatigue is a signal, not a failure. Give yourself permission to slow down."},
    {fr:"Vous n'avez pas à tout faire aujourd'hui. Une priorité bien exécutée vaut dix tâches bâclées.",en:"You don't have to do everything today. One well-executed priority beats ten rushed tasks."},
    {fr:"Le chaos d'aujourd'hui est la compétence de demain. Restez dans votre processus.",en:"Today's chaos is tomorrow's competence. Stay in your process."},
  ],
  ritual(bd,dateObj){
    const d=dateObj instanceof Date?dateObj:new Date();
    const dk=d.getFullYear()*10000+d.getMonth()*100+d.getDate();
    const base=bd?E.hash(bd):0;
    return{
      regulation:E.SOM[(dk+base)%E.SOM.length],
      olfactif:  E.OLF[(dk*3+base+7)%E.OLF.length],
      nutritionnel:E.NUT[(dk*5+base+11)%E.NUT.length],
      levier:    E.LEV[(dk*7+base+3)%E.LEV.length],
      switch:    E.SWT[(dk*11+base+5)%E.SWT.length],
    };
  },
};

const PROFILES=[
  {fr:"Profil Structuré",  en:"Structured",  accent:C.high,    desc_fr:"Clarté · Organisation · Focus",     desc_en:"Clarity · Organisation · Focus"},
  {fr:"Profil Réceptif",   en:"Receptive",   accent:"#C0607A", desc_fr:"Écoute · Régulation · Réceptivité",  desc_en:"Listening · Regulation · Receptivity"},
  {fr:"Profil Ancré",      en:"Grounded",    accent:C.mid,     desc_fr:"Ancrage · Respiration · Croissance", desc_en:"Grounding · Breathing · Growth"},
  {fr:"Profil Visionnaire",en:"Visionary",   accent:"#3A6FA8", desc_fr:"Vision · Fluidité · Précision",      desc_en:"Vision · Fluidity · Precision"},
];

const DATA={
  fr:{
    days:["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"],
    daysShort:["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],
    dayFlux:["Élan stratégique","Exécution","Régulation","Diffusion","Clôture","Récupération","Incubation"],
    dayWindow:["09h15","10h30","11h00","09h00","14h30","10h00","—"],
    dayEnergy:["high","high","mid","high","mid","low","rest"],
  },
  en:{
    days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    daysShort:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    dayFlux:["Strategic momentum","Execution","Regulation","Distribution","Closing","Recovery","Incubation"],
    dayWindow:["09:15","10:30","11:00","09:00","14:30","10:00","—"],
    dayEnergy:["high","high","mid","high","mid","low","rest"],
  },
};

/* ── PERSISTANCE ── */
function todayKey(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
function dateStr(y,m,d){return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;}
function weekStart(){const n=new Date();const d=new Date(n);d.setDate(n.getDate()-((n.getDay()+6)%7));return d;}
function weekDayDate(i){const ws=weekStart();const d=new Date(ws);d.setDate(ws.getDate()+i);return d;}
function weekDayKey(i){const d=weekDayDate(i);return dateStr(d.getFullYear(),d.getMonth(),d.getDate());}
function lsGet(k,def){try{const v=localStorage.getItem("oracle_"+k);return v!==null?JSON.parse(v):def;}catch(_){return def;}}
function lsSet(k,v){try{localStorage.setItem("oracle_"+k,JSON.stringify(v));}catch(_){}}
function usePersist(k,def){
  const [val,setVal]=useState(()=>lsGet(k,def));
  const set=useCallback(v=>{const n=typeof v==="function"?v(lsGet(k,def)):v;setVal(n);lsSet(k,n);},[k]);
  return [val,set];
}

/* ── ATOMS ── */
const card={background:C.card,border:`1px solid ${C.border}`,borderRadius:"12px"};
const cardS={...card,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"};
const iS={background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,outline:"none",width:"100%",padding:"5px 0",fontSize:12,fontFamily:C.serif,color:C.dark};
const taS={width:"100%",boxSizing:"border-box",background:"transparent",border:`1px solid ${C.border}`,borderRadius:"8px",outline:"none",padding:"8px 10px",fontSize:12,fontFamily:C.sans,color:C.dark,lineHeight:1.75,resize:"vertical"};
const Cap=({c,gold})=><span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".13em",fontFamily:C.sans,color:gold?C.gold:C.faint,display:"block",marginBottom:4}}>{c}</span>;
const GLine=()=><div style={{height:1,background:`linear-gradient(to right,transparent,${C.gold}55,transparent)`,margin:"12px 0"}}/>;
const PBtn=({onClick,disabled,children,outline})=><button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"10px 0",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",fontFamily:C.sans,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.4:1,border:outline?`1px solid ${C.gold}`:"none",background:outline?"transparent":C.dark,color:outline?C.gold:"#F8F5F0",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{children}</button>;

/* ── RITUEL ── */
function RitualPanel({bd,dateObj,lang}){
  const fr=lang==="fr";
  const r=E.ritual(bd,dateObj);
  const dow=(dateObj.getDay()+6)%7;
  const em=EM[DATA[lang].dayEnergy[dow]];
  const [open,setOpen]=useState(true);
  const blocks=[
    {l:fr?"Régulation Somatique":"Somatic Regulation",t:fr?r.regulation.fr:r.regulation.en,c:"#7C5CBF"},
    {l:fr?"Protocole Olfactif":"Olfactory Protocol",  t:fr?r.olfactif.fr:r.olfactif.en,    c:"#C0607A"},
    {l:fr?"Ancrage Nutritionnel":"Nutritional Anchor", t:fr?r.nutritionnel.fr:r.nutritionnel.en,c:C.mid},
    {l:fr?"Levier du Jour":"Daily Leverage",           t:fr?r.levier.fr:r.levier.en,        c:C.gold},
    {l:fr?"Switch Mental":"Mental Switch",             t:fr?r.switch.fr:r.switch.en,         c:C.rest},
  ];
  return(
    <div style={{...cardS,marginBottom:14,overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",cursor:"pointer",background:"#FFFBF2",borderBottom:open?`1px solid ${C.border}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:em.c,flexShrink:0}}/>
          <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",fontFamily:C.sans,color:C.dark}}>{fr?"Rituel d'Ouverture — Immuable":"Opening Ritual — Fixed"}</span>
          <span style={{fontSize:9.5,color:C.gold,fontFamily:C.sans,fontStyle:"italic"}}>{em[fr?"fr":"en"]}</span>
        </div>
        {open?<ChevronUp size={12} color={C.faint}/>:<ChevronDown size={12} color={C.faint}/>}
      </div>
      {open&&<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)"}}>
        {blocks.map((b,i)=>(
          <div key={i} style={{padding:"12px 13px",borderRight:i<4?`1px solid ${C.border}`:"none",borderTop:`3px solid ${b.c}`}}>
            <Cap c={b.l} gold/>
            <p style={{fontSize:11,fontFamily:C.sans,color:C.dark,margin:0,lineHeight:1.65}}>{b.t}</p>
          </div>
        ))}
      </div>}
    </div>
  );
}

/* ── CAPTURE DE VICTOIRES ── */
function VictoiresCapture({lang}){
  const fr=lang==="fr";
  const key="victoires-"+todayKey();
  const [entries,setEntries]=usePersist(key,[]);
  const [input,setInput]=useState("");
  const ref=useRef();
  function add(){const v=input.trim();if(!v)return;const n=[...entries,{id:Date.now()+"",text:v}];setEntries(n);lsSet(key,n);setInput("");setTimeout(()=>ref.current?.focus(),50);}
  function remove(id){const n=entries.filter(e=>e.id!==id);setEntries(n);lsSet(key,n);}
  function clearAll(){setEntries([]);lsSet(key,[]);}
  return(
    <div style={{...cardS,padding:"12px 16px",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Heart size={11} color={C.gold}/>
          <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".11em",fontFamily:C.sans,color:C.dark}}>{fr?"Capture de Victoires":"Victory Capture"}</span>
        </div>
        {entries.length>0&&<button onClick={clearAll} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:C.faint,background:"none",border:`1px solid ${C.border}`,borderRadius:"5px",padding:"2px 7px",cursor:"pointer",fontFamily:C.sans,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}><Trash2 size={8}/>{fr?"Effacer tout":"Clear all"}</button>}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:entries.length>0?10:0}}>
        <input ref={ref} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")add();}}
          placeholder={fr?"Victoire, ancrage, prise de conscience...":"Victory, anchor, insight..."}
          style={{...iS,flex:1,fontSize:11.5}}/>
        <button onClick={add} style={{padding:"3px 10px",background:C.gold,color:C.dark,border:"none",borderRadius:"6px",fontSize:14,cursor:"pointer",fontWeight:700,flexShrink:0}}>+</button>
      </div>
      {entries.map((e,i)=>(
        <div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:7,padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.gold,flexShrink:0,marginTop:5}}/>
          <span style={{flex:1,fontSize:12,fontFamily:C.sans,color:C.dark,lineHeight:1.5}}>{e.text}</span>
          <button onClick={()=>remove(e.id)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.faint,flexShrink:0}}><Trash2 size={10}/></button>
        </div>
      ))}
    </div>
  );
}

/* ── BLOC-NOTES LIBRE ── */
function BlocNotes({lang}){
  const fr=lang==="fr";
  const [val,setVal]=usePersist("blocnotes","");
  const [saved,setSaved]=useState(false);
  const [open,setOpen]=useState(true);
  return(
    <div style={{...cardS,overflow:"hidden",marginBottom:14}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",borderBottom:open?`1px solid ${C.border}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><FileText size={11} color={C.gold}/><span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".11em",fontFamily:C.sans,color:C.dark}}>{fr?"Bloc-notes Libre":"Free Notepad"}</span></div>
        {open?<ChevronUp size={12} color={C.faint}/>:<ChevronDown size={12} color={C.faint}/>}
      </div>
      {open&&<div style={{padding:"12px 14px"}}>
        <p style={{fontSize:10,color:C.faint,fontFamily:C.sans,margin:"0 0 7px",fontStyle:"italic"}}>{fr?"Idées, ressentis, intuitions — espace libre et persistant.":"Ideas, feelings, intuitions — free and persistent."}</p>
        <textarea value={val} onChange={e=>setVal(e.target.value)} rows={8} style={taS} placeholder={fr?"Tout ce qui traverse votre esprit...":"Anything that crosses your mind..."}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7}}>
          <button onClick={()=>{setVal("");lsSet("blocnotes","");}} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",fontFamily:C.sans,color:C.faint,background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"3px 8px",cursor:"pointer"}}><Trash2 size={8}/>{fr?"Effacer":"Clear"}</button>
          <button onClick={()=>{lsSet("blocnotes",val);setSaved(true);setTimeout(()=>setSaved(false),2000);}} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",fontFamily:C.sans,color:saved?C.gold:C.muted,background:"none",border:`1px solid ${saved?C.gold:C.border}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer"}}>
            <Heart size={9}/>{saved?(fr?"Sauvegardé":"Saved"):(fr?"Sauvegarder":"Save")}
          </button>
        </div>
      </div>}
    </div>
  );
}

/* ── TASK CARD ── */
function TaskCard({task,fromDay,onDelete,onColor,onEdit}){
  const [showPalette,setShowPalette]=useState(false);
  const [editing,setEditing]=useState(false);
  const [editVal,setEditVal]=useState(task.text);
  function saveEdit(){if(editVal.trim())onEdit(task.id,editVal.trim());setEditing(false);}
  return(
    <div draggable onDragStart={e=>{e.dataTransfer.setData("taskId",task.id);e.dataTransfer.setData("fromDay",fromDay);}}
      style={{background:task.color||C.lowL,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"6px 8px",marginBottom:5,userSelect:"none"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:5}}>
        <GripVertical size={10} color={C.faint} style={{flexShrink:0,marginTop:3,cursor:"grab"}}/>
        <div style={{flex:1,minWidth:0}}>
          {editing
            ?<div style={{display:"flex",gap:4}}>
              <input value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit();}} style={{...iS,flex:1,fontSize:11}} autoFocus/>
              <button onClick={saveEdit} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.gold}}><Save size={10}/></button>
            </div>
            :<div style={{fontSize:11.5,color:C.dark,lineHeight:1.4,fontFamily:C.sans,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.text}</div>
          }
          {task.time&&task.time!=="—"&&!editing&&<div style={{fontSize:8.5,color:C.muted,marginTop:1}}>{task.time}</div>}
        </div>
        <div style={{display:"flex",gap:2,flexShrink:0}}>
          <button onClick={()=>setEditing(!editing)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.faint}}><Edit3 size={10}/></button>
          <button onClick={()=>setShowPalette(s=>!s)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.faint}}><Palette size={10}/></button>
          <button onClick={()=>onDelete(task.id)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.faint}}><Trash2 size={10}/></button>
        </div>
      </div>
      {showPalette&&<div style={{display:"flex",gap:3,marginTop:5,flexWrap:"wrap"}}>
        {TASK_COLORS.map(col=><div key={col} onClick={()=>{onColor(task.id,col);setShowPalette(false);}} style={{width:14,height:14,background:col,border:`1px solid ${C.border}`,borderRadius:"3px",cursor:"pointer"}}/>)}
      </div>}
    </div>
  );
}

/* ══ SÉQUENCEUR BATCH ══ */
function BatchSequencer({d,lang,birthDate,tasks,setTasks}){
  const fr=lang==="fr";
  const [batchText,setBatchText]=useState("");
  const [preview,setPreview]=useState(null);
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(false);
  const taRef=useRef();

  function parseTasks(t){return t.split("\n").map(l=>l.replace(/^[-•*\d.]+\s*/,"").trim()).filter(Boolean);}

  /* Auto-resize */
  function handleChange(e){
    setBatchText(e.target.value);
    if(taRef.current){
      taRef.current.style.height="auto";
      taRef.current.style.height=Math.min(taRef.current.scrollHeight,380)+"px";
    }
  }

  function analyse(){
    const list=parseTasks(batchText);
    if(!list.length)return;
    setBusy(true);
    setTimeout(()=>{setPreview(E.dispatch(list,birthDate,d,fr));setBusy(false);},700);
  }

  function apply(){
    if(!preview)return;
    setTasks(prev=>{
      const n={...prev};
      Object.entries(preview).forEach(([idx,taskList])=>{
        const dk=weekDayKey(parseInt(idx));
        n[dk]=[...(n[dk]||[]),...taskList];
      });
      lsSet("tasks",n);return n;
    });
    setBatchText("");setPreview(null);setDone(true);
    setTimeout(()=>setDone(false),3500);
  }

  const count=parseTasks(batchText).length;
  const total=preview?Object.values(preview).reduce((s,a)=>s+a.length,0):0;

  return(
    <div style={{...cardS,marginBottom:14,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",background:"linear-gradient(135deg,#2D2926,#3d3430)"}}>
        <Zap size={12} color={C.gold}/>
        <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".13em",fontFamily:C.sans,color:"#F8F5F0"}}>{fr?"Séquenceur Intelligent — Saisie en masse":"Intelligent Sequencer — Batch input"}</span>
        <span style={{fontSize:9,color:C.gold,fontFamily:C.sans,fontStyle:"italic",marginLeft:"auto"}}>{fr?"Placement automatique par énergie":"Auto-placement by energy"}</span>
      </div>
      <div style={{padding:"14px 16px"}}>

        {/* ── ÉTAPE 1 : Saisie ── */}
        {!preview&&!done&&<>
          <p style={{fontSize:11,color:C.muted,fontFamily:C.sans,margin:"0 0 12px",lineHeight:1.65}}>
            {fr?"Listez vos priorités de la semaine — une par ligne. L'Oracle analyse l'urgence et l'énergie de chaque tâche, puis les répartit automatiquement sur vos 7 jours."
               :"List your week's priorities — one per line. The Oracle analyses urgency and energy of each task, then distributes them across your 7 days."}
          </p>

          {/* Textarea multi-lignes avec retour à la ligne automatique et auto-resize */}
          <div style={{position:"relative",marginBottom:10}}>
            <textarea
              ref={taRef}
              value={batchText}
              onChange={handleChange}
              style={{
                width:"100%",
                boxSizing:"border-box",
                minHeight:180,
                maxHeight:380,
                overflowY:"auto",
                overflowX:"hidden",   /* pas de scroll horizontal */
                background:C.bg,
                border:`1.5px solid ${count>10?C.rest:count>0?C.gold:C.border}`,
                borderRadius:"10px",
                outline:"none",
                padding:"12px 14px 32px 14px",
                fontSize:13,
                fontFamily:C.sans,
                color:C.dark,
                lineHeight:2.1,
                resize:"none",
                whiteSpace:"pre-wrap",       /* retour à la ligne automatique */
                overflowWrap:"break-word",   /* coupe les mots très longs */
                wordBreak:"break-word",
                transition:"border-color .2s",
              }}
              placeholder={fr
                ?"Envoyer la newsletter de lancement\nPréparer la présentation client vendredi\nFilmer la vidéo tutoriel Oracle\nRépondre aux DM Instagram\nMettre à jour la page Ko-fi\nAppel stratégique avec l'équipe\nRédiger 3 posts LinkedIn\nArchiver les factures du mois\nPréparer le brief créatif\nMéditation et planification hebdo"
                :"Send launch newsletter\nPrepare Friday client presentation\nFilm Oracle tutorial video\nReply to Instagram DMs\nUpdate Ko-fi page\nStrategic call with team\nWrite 3 LinkedIn posts\nArchive monthly invoices\nPrepare creative brief\nWeekly meditation and planning"}
            />
            {/* Badge compteur */}
            <div style={{position:"absolute",bottom:10,right:12,display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:10,fontWeight:700,fontFamily:C.sans,color:count>10?C.rest:count>0?C.gold:C.faint,background:C.bg,padding:"1px 7px",border:`1px solid ${count>10?C.rest:count>0?C.gold:C.border}`,borderRadius:"20px"}}>
                {count}/10 {fr?"tâche"+(count!==1?"s":""):"task"+(count!==1?"s":"")}
              </span>
              {count>10&&<span style={{fontSize:9.5,color:C.rest,fontFamily:C.sans,fontWeight:700}}>max 10</span>}
            </div>
          </div>

          {/* Conseil */}
          <div style={{display:"flex",gap:8,padding:"8px 11px",background:C.lowL,border:`1px solid ${C.border}`,borderRadius:"8px",marginBottom:12}}>
            <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:C.gold,fontFamily:C.sans,flexShrink:0,marginTop:1}}>{fr?"Astuce":"Tip"}</span>
            <span style={{fontSize:10.5,color:C.muted,fontFamily:C.sans,lineHeight:1.55}}>{fr?"Une priorité par ligne. Le texte long passe automatiquement à la ligne. Tirets et numéros sont acceptés.":"One priority per line. Long text wraps automatically. Dashes and numbers are accepted."}</span>
          </div>

          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button onClick={analyse} disabled={busy||count===0||count>10}
              style={{display:"flex",alignItems:"center",gap:6,padding:"9px 22px",fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",fontFamily:C.sans,cursor:(count===0||count>10||busy)?"not-allowed":"pointer",opacity:(count===0||count>10||busy)?.5:1,border:"none",background:C.dark,color:"#F8F5F0",borderRadius:"8px"}}>
              {busy?<Loader size={11}/>:<Zap size={11}/>}
              {fr?"Analyser & Placer":"Analyse & Place"}
            </button>
          </div>
        </>}

        {/* ── ÉTAPE 2 : Prévisualisation ── */}
        {preview&&!done&&<>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <span style={{fontSize:11,fontWeight:700,fontFamily:C.sans,color:C.dark}}>{fr?"Répartition proposée":"Suggested distribution"}</span>
              <span style={{fontSize:10,color:C.gold,fontFamily:C.sans,marginLeft:8,fontStyle:"italic"}}>{total} {fr?"tâche"+(total!==1?"s":"")+" · Drag & Drop disponible":"task"+(total!==1?"s":"")+" · Drag & Drop available"}</span>
            </div>
            <button onClick={()=>setPreview(null)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.faint}}><X size={13}/></button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:14}}>
            {d.days.map((_,i)=>{
              const dt=preview[i]||[];
              const en=d.dayEnergy[i];
              const em=EM[en];
              const mom=E.momentum(birthDate,i);
              return(
                <div key={i} style={{background:em.bg,border:`1px solid ${em.c}44`,borderRadius:"8px",padding:"8px 6px",minHeight:72}}>
                  <div style={{fontSize:8.5,fontWeight:700,color:em.c,textTransform:"uppercase",letterSpacing:".07em",fontFamily:C.sans,marginBottom:3}}>{d.daysShort[i]}</div>
                  <div style={{height:2,background:`${em.c}33`,borderRadius:1,overflow:"hidden",marginBottom:5}}>
                    <div style={{height:"100%",width:mom+"%",background:em.c,borderRadius:1}}/>
                  </div>
                  {dt.length===0
                    ?<div style={{fontSize:8.5,color:C.faint,fontFamily:C.sans,fontStyle:"italic"}}>{fr?"Libre":"Free"}</div>
                    :dt.map((t,ti)=>(
                      <div key={ti} style={{fontSize:9.5,color:C.dark,fontFamily:C.sans,lineHeight:1.35,marginBottom:3,padding:"3px 6px",background:"rgba(255,255,255,.85)",borderRadius:"4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",borderLeft:`2px solid ${em.c}`}} title={t.text}>{t.text}</div>
                    ))}
                </div>
              );
            })}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <PBtn onClick={()=>setPreview(null)} outline>{fr?"Modifier la liste":"Edit list"}</PBtn>
            <PBtn onClick={apply}><Check size={11}/>{fr?"Confirmer & Placer":"Confirm & Place"}</PBtn>
          </div>
        </>}

        {/* ── ÉTAPE 3 : Confirmation ── */}
        {done&&<div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:C.midL,border:`2px solid ${C.mid}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Check size={18} color={C.mid}/></div>
          <p style={{fontSize:13,fontFamily:C.serif,color:C.dark,margin:"0 0 5px",fontWeight:700}}>{fr?"Tâches planifiées avec succès":"Tasks successfully scheduled"}</p>
          <p style={{fontSize:10.5,color:C.muted,fontFamily:C.sans,margin:"0 0 14px",fontStyle:"italic"}}>{fr?"Ajustez librement par Drag & Drop si besoin.":"Freely adjust by Drag & Drop if needed."}</p>
          <button onClick={()=>setDone(false)} style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",fontFamily:C.sans,color:C.muted,background:"none",border:`1px solid ${C.border}`,borderRadius:"7px",padding:"6px 14px",cursor:"pointer"}}>{fr?"Nouvelle saisie":"New batch"}</button>
        </div>}
      </div>
    </div>
  );
}

/* ── VUE HEBDOMADAIRE ── */
function WeekView({d,lang,birthDate,tasks,setTasks,notes,setNotes}){
  const fr=lang==="fr";
  const [activeDay,setActiveDay]=useState(null);
  const [noteEdit,setNoteEdit]=useState("");
  const today=todayKey();

  function makeTask(text){return {id:Date.now()+Math.random()+"",text,guidance:"",time:"",color:C.lowL};}
  function moveTask(tid,from,to){
    if(from===to)return;
    setTasks(prev=>{const n={...prev};const t=(n[from]||[]).find(x=>x.id===tid);if(!t)return prev;n[from]=(n[from]||[]).filter(x=>x.id!==tid);n[to]=[...(n[to]||[]),t];lsSet("tasks",n);return n;});
  }
  function deleteTask(dk,tid){setTasks(prev=>{const n={...prev};n[dk]=(n[dk]||[]).filter(t=>t.id!==tid);lsSet("tasks",n);return n;});}
  function colorTask(tid,col){setTasks(prev=>{const n={};Object.keys(prev).forEach(dk=>{n[dk]=(prev[dk]||[]).map(t=>t.id===tid?{...t,color:col}:t);});lsSet("tasks",n);return n;});}
  function editTask(tid,text){setTasks(prev=>{const n={};Object.keys(prev).forEach(dk=>{n[dk]=(prev[dk]||[]).map(t=>t.id===tid?{...t,text}:t);});lsSet("tasks",n);return n;});}
  function quickAdd(dk,val){if(!val.trim())return;setTasks(prev=>{const n={...prev};n[dk]=[...(n[dk]||[]),makeTask(val)];lsSet("tasks",n);return n;});}

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,alignItems:"start"}}>
      {/* COLONNE PRINCIPALE */}
      <div style={{minWidth:0}}>
        <RitualPanel bd={birthDate} dateObj={new Date()} lang={lang}/>
        <VictoiresCapture lang={lang}/>
        <BatchSequencer d={d} lang={lang} birthDate={birthDate} tasks={tasks} setTasks={setTasks}/>

        {/* 7 colonnes */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:5}}>
          {d.days.map((_,i)=>{
            const dk=weekDayKey(i);
            const en=d.dayEnergy[i];
            const em=EM[en];
            const isToday=dk===today;
            const mom=E.momentum(birthDate,i);
            const dt=weekDayDate(i);
            return(
              <div key={i}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();moveTask(e.dataTransfer.getData("taskId"),e.dataTransfer.getData("fromDay"),dk);}}
                style={{background:isToday?"#FFFBF2":C.card,border:isToday?`1px solid ${C.gold}`:`1px solid ${C.border}`,borderRadius:"10px",padding:"8px 7px",minHeight:160,display:"flex",flexDirection:"column"}}
              >
                <div style={{marginBottom:7,cursor:"pointer"}} onClick={()=>{setActiveDay(activeDay===i?null:i);setNoteEdit(notes[dk]||"");}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1}}>
                    <span style={{fontSize:9,fontWeight:700,color:isToday?C.gold:C.muted,textTransform:"uppercase",letterSpacing:".07em",fontFamily:C.sans}}>{d.daysShort[i]}</span>
                    <span style={{fontSize:8.5,fontWeight:700,color:em.c,fontFamily:C.sans}}>{mom}%</span>
                  </div>
                  <div style={{fontSize:8.5,color:C.faint,fontFamily:C.sans,marginBottom:3}}>{dt.getDate()+"/"+(dt.getMonth()+1).toString().padStart(2,"0")}</div>
                  <div style={{height:2,background:C.border,borderRadius:2,overflow:"hidden",marginBottom:3}}>
                    <div style={{height:"100%",width:mom+"%",background:em.c,borderRadius:2}}/>
                  </div>
                  <div style={{fontSize:8,color:em.c,fontFamily:C.sans,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.dayWindow[i]} · {d.dayFlux[i]}</div>
                </div>
                <div style={{flex:1}}>
                  {(tasks[dk]||[]).map(t=>(
                    <TaskCard key={t.id} task={t} fromDay={dk}
                      onDelete={id=>deleteTask(dk,id)}
                      onColor={(id,col)=>colorTask(id,col)}
                      onEdit={(id,txt)=>editTask(id,txt)}/>
                  ))}
                </div>
                <input placeholder={fr?"+ Ajouter":"+ Add"} style={{...iS,fontSize:10,padding:"2px 0",marginTop:4}}
                  onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){quickAdd(dk,e.target.value.trim());e.target.value="";}}}/>
              </div>
            );
          })}
        </div>

        {/* Panneau note du jour */}
        {activeDay!==null&&(()=>{
          const i=activeDay;const dk=weekDayKey(i);const dt=weekDayDate(i);
          return(
            <div style={{...cardS,padding:"14px 18px",marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <Cap c={(fr?"Journal — ":"Journal — ")+d.days[i]+" "+dt.getDate()+"/"+(dt.getMonth()+1).toString().padStart(2,"0")} gold/>
                  <div style={{fontSize:10,color:C.gold,fontFamily:C.sans,fontStyle:"italic"}}>{E.guidance(birthDate,i,fr)}</div>
                </div>
                <button onClick={()=>setActiveDay(null)} style={{padding:3,background:"none",border:"none",cursor:"pointer",color:C.faint}}><X size={13}/></button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <Cap c={fr?"Journal d'exécution":"Execution journal"}/>
                  <textarea value={noteEdit} onChange={e=>setNoteEdit(e.target.value)} rows={4} style={taS}
                    placeholder={fr?"[Priorité] — [Résultat] — [Prochaine action]...":"[Priority] — [Result] — [Next action]..."}/>
                  <button onClick={()=>{setNotes(prev=>{const n={...prev};n[dk]=noteEdit;lsSet("notes",n);return n;});}}
                    style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",fontFamily:C.sans,color:C.muted,background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer",marginTop:6}}>
                    <Heart size={9}/>{fr?"Ancrer":"Anchor"}
                  </button>
                </div>
                <div>
                  <Cap c={fr?"Ajouter une tâche":"Add a task"}/>
                  <div style={{display:"flex",gap:5,marginTop:4}}>
                    <input id={"qa-"+i} placeholder={fr?"Nouvelle priorité...":"New priority..."} style={{...iS,flex:1,fontSize:11}}
                      onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){quickAdd(dk,e.target.value.trim());e.target.value="";}}}/>
                    <button onClick={()=>{const el=document.getElementById("qa-"+i);if(el&&el.value.trim()){quickAdd(dk,el.value.trim());el.value="";}}}
                      style={{padding:"3px 9px",background:C.dark,color:"#F8F5F0",border:"none",borderRadius:"6px",fontSize:13,cursor:"pointer",flexShrink:0}}>+</button>
                  </div>
                  {notes[dk]&&<div style={{marginTop:9,padding:"8px 10px",background:C.lowL,border:`1px solid ${C.border}`,borderRadius:"7px"}}>
                    <Cap c={fr?"Note sauvegardée":"Saved note"} gold/>
                    <p style={{fontSize:11,fontFamily:C.sans,color:C.dark,margin:0,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{notes[dk]}</p>
                  </div>}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SIDEBAR */}
      <div style={{position:"sticky",top:16}}>
        <BlocNotes lang={lang}/>
      </div>
    </div>
  );
}

/* ══ APP ══ */
export default function App(){
  const [screen,setScreen]=useState("onboard");
  const [lang,setLang]=usePersist("lang","fr");
  const [loading,setLoading]=useState(false);
  const [tasks,setTasks]=usePersist("tasks",{});
  const [notes,setNotes]=usePersist("notes",{});
  const [name,setName]=usePersist("name","");
  const [birthDate,setBirthDate]=usePersist("birthDate","");
  const [birthTime,setBirthTime]=usePersist("birthTime","");
  const [birthPlace,setBirthPlace]=usePersist("birthPlace","");
  const [context,setContext]=usePersist("context","");

  const profile=birthDate?PROFILES[E.profile(birthDate)]:PROFILES[0];
  const d=DATA[lang];const fr=lang==="fr";

  /* ONBOARDING */
  if(screen==="onboard"||loading) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:C.sans}}>
      <div style={{position:"fixed",top:16,right:16,display:"flex",background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",overflow:"hidden"}}>
        {["fr","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{padding:"5px 11px",fontSize:10,fontWeight:700,cursor:"pointer",border:"none",background:lang===l?C.dark:C.card,color:lang===l?"#F8F5F0":C.muted,textTransform:"uppercase",fontFamily:C.sans}}>{l==="fr"?"FR":"EN"}</button>)}
      </div>
      {loading
        ?<div style={{textAlign:"center"}}><Loader size={20} color={C.gold} style={{display:"block",margin:"0 auto 14px"}}/><p style={{fontSize:10,color:C.faint,textTransform:"uppercase",letterSpacing:".15em",fontFamily:C.sans}}>{fr?"Analyse en cours...":"Analysing..."}</p></div>
        :<div style={{...cardS,width:"100%",maxWidth:480,padding:"36px"}}>
          <div style={{textAlign:"center",marginBottom:30}}>
            <h1 style={{fontSize:26,fontWeight:700,fontFamily:C.serif,letterSpacing:".2em",color:C.dark,margin:"0 0 5px",textTransform:"uppercase"}}>{fr?"L'Oracle":"The Oracle"}</h1>
            <p style={{fontSize:9.5,color:C.faint,textTransform:"uppercase",letterSpacing:".11em",fontFamily:C.sans,margin:"0 0 3px"}}>{fr?"Système de performance organique":"Organic performance system"}</p>
            <p style={{fontSize:10,color:C.gold,fontFamily:C.sans,margin:0,fontStyle:"italic"}}>{fr?"Méthode de séquençage d'actions par Louisette":"Action sequencing method by Louisette"}</p>
          </div>
          <Cap c={fr?"Variables de performance":"Performance variables"} gold/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:8,marginBottom:18}}>
            {[
              [fr?"Prénom":"First name",name,setName,"text"],
              [fr?"Date de naissance":"Date of birth",birthDate,setBirthDate,"date"],
              [fr?"Heure de naissance":"Time of birth",birthTime,setBirthTime,"time"],
              [fr?"Lieu de naissance":"Place of birth",birthPlace,setBirthPlace,"text"],
            ].map(r=>(<div key={r[0]}><Cap c={r[0]}/><input type={r[3]} value={r[1]} onChange={e=>r[2](e.target.value)} style={iS}/></div>))}
          </div>
          <GLine/>
          <Cap c={fr?"Contexte opérationnel":"Operational context"} gold/>
          <div style={{marginTop:8,marginBottom:22}}>
            <Cap c={fr?"Réalité de terrain (contraintes, disponibilités)":"Field reality (constraints, availability)"}/>
            <textarea value={context} onChange={e=>setContext(e.target.value)} rows={2} style={taS}/>
          </div>
          <PBtn onClick={()=>{setLoading(true);setTimeout(()=>{setLoading(false);setScreen("main");},1000);}}>
            {fr?"Lancer l'analyse":"Launch analysis"}
          </PBtn>
          <footer style={{marginTop:20,textAlign:"center",fontSize:8.5,color:C.faint,textTransform:"uppercase",fontFamily:C.sans}}>L'Oracle — par Louisette · 2026</footer>
        </div>
      }
    </div>
  );

  /* PLANEUR — vue semaine uniquement */
  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:C.sans,paddingBottom:60}}>
      <div style={{maxWidth:1360,margin:"0 auto",padding:"18px 16px 0"}}>

        {/* HEADER simplifié — sans onglets de navigation */}
        <header style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,paddingBottom:14,marginBottom:18,gap:10}}>
          <div>
            <h1 style={{fontSize:19,fontWeight:700,fontFamily:C.serif,letterSpacing:".18em",color:C.dark,margin:"0 0 2px",textTransform:"uppercase"}}>{fr?"L'Oracle":"The Oracle"}</h1>
            <p style={{fontSize:9,color:C.faint,textTransform:"uppercase",letterSpacing:".13em",fontFamily:C.sans,margin:"0 0 4px"}}>{fr?"Système de performance organique · Louisette":"Organic performance system · Louisette"}</p>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:profile.accent}}/>
              <span style={{fontSize:10,fontFamily:C.sans,color:C.gold}}>{fr?profile.fr:profile.en}</span>
              <span style={{fontSize:9,color:C.faint,fontFamily:C.sans}}>— {fr?profile.desc_fr:profile.desc_en}</span>
            </div>
          </div>

          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            {/* Indicateur de vue — statique, non cliquable */}
            <div style={{padding:"7px 16px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",fontFamily:C.sans,background:C.dark,color:"#F8F5F0",borderRadius:"9px"}}>
              {fr?"Semaine en cours":"Current week"}
            </div>

            {/* Sélecteur de langue */}
            <div style={{display:"flex",background:C.card,border:`1px solid ${C.border}`,borderRadius:"7px",overflow:"hidden"}}>
              {["fr","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{padding:"5px 10px",fontSize:9.5,fontWeight:700,cursor:"pointer",border:"none",background:lang===l?C.dark:C.card,color:lang===l?"#F8F5F0":C.muted,textTransform:"uppercase",fontFamily:C.sans}}>{l==="fr"?"FR":"EN"}</button>)}
            </div>

            {/* Profil */}
            <button onClick={()=>setScreen("onboard")} style={{fontSize:9,fontWeight:700,textTransform:"uppercase",fontFamily:C.sans,color:C.muted,background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"5px 10px",cursor:"pointer"}}>
              {fr?"Mon profil":"My profile"}
            </button>
          </div>
        </header>

        {/* VUE HEBDOMADAIRE — unique */}
        <WeekView d={d} lang={lang} birthDate={birthDate} tasks={tasks} setTasks={setTasks} notes={notes} setNotes={setNotes}/>

        <footer style={{textAlign:"center",marginTop:40,paddingTop:12,borderTop:`1px solid ${C.border}`,fontSize:8.5,color:C.faint,textTransform:"uppercase",letterSpacing:".12em",fontFamily:C.sans}}>
          {fr?"L'Oracle — Système de performance organique par Louisette — 2026 — Tous droits réservés":"The Oracle — Organic performance system by Louisette — 2026 — All rights reserved"}
        </footer>
      </div>
    </div>
  );
}
