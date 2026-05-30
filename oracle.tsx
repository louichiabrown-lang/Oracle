import { useState, useCallback } from "react";
import {
  ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Loader,
  X, GripVertical, Zap, Palette, Edit3, Save,
  Heart, RefreshCw, Copy, Check, FileText, Sparkles
} from "lucide-react";

/* ── PALETTE ── */
const C = {
  bg:"#F8F5F0", card:"#FFFFFF", border:"#E5E7EB",
  dark:"#2D2926", gold:"#B89763", muted:"#6B7280", faint:"#9CA3AF",
  high:"#7C5CBF", highL:"#F0EBFB",
  mid:"#2E8B6E",  midL:"#EDF7F3",
  low:"#B89763",  lowL:"#FAF4E1",
  rest:"#8A5A3A", restL:"#FBF0E8",
  serif:"'Georgia','Times New Roman',serif",
  sans:"'Segoe UI','Arial',sans-serif",
};
const EM = {
  high:{ c:C.high, bg:C.highL, fr:"Haute performance", en:"High performance" },
  mid: { c:C.mid,  bg:C.midL,  fr:"Flux stable",       en:"Steady flow" },
  low: { c:C.low,  bg:C.lowL,  fr:"Récupération",      en:"Recovery" },
  rest:{ c:C.rest, bg:C.restL, fr:"Incubation",        en:"Incubation" },
};
const TASK_COLORS=["#F0EBFB","#EDF7F3","#FAF4E1","#FBF0E8","#FDF0F3","#EEF3FB","#FDFAED","#FFFFFF"];

/* ══ MOTEUR ══ */
const E={
  hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;},
  profile(bd){return bd?E.hash(bd)%4:0;},
  momentum(bd,dow){if(!bd)return 72;const d=new Date(bd);const n=(d.getFullYear()*31+d.getMonth()*7+d.getDate()*3+dow*11)%100;return 50+Math.abs(n-50);},
  bestDay(bd,txt){return E.hash(txt+(bd||""))%7;},
  guidance(bd,dow,fr){
    const m=E.momentum(bd,dow);
    if(m>=80)return fr?"Potentiel maximal — agissez sur votre levier principal.":"Peak potential — act on your main lever.";
    if(m>=60)return fr?"Flux optimal — priorisez les actions à fort impact.":"Optimal flow — prioritise high-impact actions.";
    if(m>=40)return fr?"Phase de consolidation — affinez et préparez le prochain élan.":"Consolidation — refine and prepare the next surge.";
    return fr?"Phase de régénération — investissez dans votre récupération.":"Regeneration — invest in your recovery.";
  },
  SOM:[
    {fr:"Manœuvre EMDR légère : suivez lentement votre doigt de G à D, 20 allers-retours. Le système nerveux se recalibre en 90 secondes.",en:"Light EMDR: follow your finger left to right, 20 sweeps. Nervous system recalibrates in 90 seconds."},
    {fr:"Tapping EFT — Point karaté : tapotez le tranchant de la main 30 fois. 'Je relâche ce qui me retient. Je suis prête à avancer.'",en:"EFT Karate point: tap edge of hand 30 times. 'I release what holds me back. I am ready to move forward.'"},
    {fr:"Gargarisme tonique : garglez de l'eau fraîche 30 secondes. Stimule directement le nerf vague — état de sécurité immédiat.",en:"Tonic gargling: gargle cool water 30 sec. Directly stimulates the vagus nerve — immediate safety state."},
    {fr:"Acupuncture VG26 : pressez fermement le creux entre nez et lèvre supérieure 30 secondes. Dissout la brume mentale.",en:"GV26: press the groove between nose and upper lip for 30 seconds. Dissolves mental fog."},
    {fr:"Tapping EFT — Sommet du crâne : tapotez doucement 40 fois. Intègre les deux hémisphères et restaure la clarté décisionnelle.",en:"EFT Crown: tap gently 40 times. Integrates both hemispheres, restores decisional clarity."},
    {fr:"Secouage spontané : fléchissez les genoux, laissez les jambes vibrer 60 secondes. Le corps libère la tension stockée.",en:"Spontaneous shaking: bent knees, let legs vibrate 60 seconds. Body releases stored tension."},
    {fr:"Acupuncture MC6 (Nei Guan) : 3 doigts du poignet face interne, pressez 45 secondes. Apaise palpitations et anxiété.",en:"PC6 Nei Guan: 3 fingers from inner wrist, press 45 seconds. Soothes palpitations and anxiety."},
    {fr:"Respiration physiologique : deux courtes inspirations nez, longue expiration bouche. ×5. Réinitialise le tronc cérébral.",en:"Physiological sigh: two short nose inhales, long mouth exhale. ×5. Resets the brainstem."},
    {fr:"Tapping EFT — Sous les yeux : tapotez l'os sous chaque œil 30 fois. Régule la peur, le doute et l'hypervigilance.",en:"EFT Under-eye: tap bone under each eye 30 times. Regulates fear, doubt and hypervigilance."},
    {fr:"Soupir expiratoire prolongé : inspirez, puis expirez très lentement (8-10 sec). ×4. Réduit le cortisol circulant.",en:"Extended sigh: inhale normally, exhale very slowly (8-10 sec). ×4. Reduces circulating cortisol."},
  ],
  OLF:[
    {fr:"Romarin — 1 goutte sur les poignets, inhalez 5 fois. Le 1,8-cinéole stimule la mémoire de travail en 3 minutes.",en:"Rosemary — 1 drop on wrists, inhale 5×. 1,8-cineole stimulates working memory within 3 minutes."},
    {fr:"Bergamote — diffusez ou inhalez directement. Anxiolytique naturel via le système limbique, sans sédation.",en:"Bergamot — diffuse or inhale directly. Natural anxiolytic via the limbic system, without sedation."},
    {fr:"Ylang-ylang — 1 goutte sur le sternum. Court-circuite le mental via le cortex olfactif — présence immédiate.",en:"Ylang-ylang — 1 drop on sternum. Bypasses mind via olfactory cortex — immediate presence."},
    {fr:"Lavande vraie — inhalez 3 respirations profondes. Le linalol interrompt les boucles de pensée anxieuses.",en:"True lavender — inhale 3 deep breaths. Linalool interrupts anxious thought loops."},
    {fr:"Encens / Oliban — diffusez. Les sesquiterpènes traversent la barrière hémato-encéphalique.",en:"Frankincense — diffuse. Sesquiterpenes cross the blood-brain barrier."},
    {fr:"Menthe poivrée — 1 goutte sous le nez. Stimulant sympathique immédiat — idéal avant une action à fort enjeu.",en:"Peppermint — 1 drop under nose. Immediate sympathetic stimulant — ideal before high-stakes action."},
    {fr:"Rose de Damas — sur le plexus solaire. Active les récepteurs liés à la confiance et à l'intuition féminine.",en:"Damask rose — on solar plexus. Activates receptors linked to confidence and feminine intuition."},
    {fr:"Vétiver — sur la voûte plantaire. Ancrage au sol immédiat — parfait si vous vous sentez dispersée.",en:"Vetiver — on soles of feet. Immediate grounding — perfect if you feel scattered."},
  ],
  NUT:[
    {fr:"Magnésium bisglycinate (200 mg) — régule la transmission GABAergique et réduit les tensions liées au stress.",en:"Magnesium bisglycinate (200mg) — regulates GABAergic transmission, reduces stress-related tension."},
    {fr:"Eau + citron + sel rose — buvez maintenant. Réhydrate les cellules nerveuses, restaure l'équilibre électrolytique.",en:"Water + lemon + pink salt — drink now. Rehydrates nerve cells, restores electrolyte balance."},
    {fr:"Chocolat noir 85%+ (3 carrés) — augmente le flux sanguin cérébral et stimule la sérotonine en 20 minutes.",en:"Dark chocolate 85%+ (3 squares) — increases cerebral blood flow, stimulates serotonin in 20 minutes."},
    {fr:"Thé matcha (sans sucre) — L-théanine + caféine = alerte détendue. Préparez-le comme un rituel.",en:"Matcha tea (unsweetened) — L-theanine + caffeine = relaxed alertness. Prepare it as a ritual."},
    {fr:"Myrtilles (une poignée) — les anthocyanines protègent les neurones du stress oxydatif.",en:"Blueberries (a handful) — anthocyanins protect neurons from oxidative stress."},
    {fr:"Ashwagandha (1 capsule) — réduit le cortisol et restaure la résilience au stress chronique.",en:"Ashwagandha (1 capsule) — reduces cortisol and restores resilience to chronic stress."},
  ],
  LEV:[
    {fr:"Identifiez l'action qui, si elle est faite aujourd'hui, rend toutes les autres inutiles. Faites-la en premier.",en:"Identify the one action that, done today, makes all others unnecessary. Do it first."},
    {fr:"Bloquez 90 minutes sans interruption. Fermez tout. Ce bloc est sacré et non négociable.",en:"Block 90 minutes without interruption. Close everything. This block is sacred and non-negotiable."},
    {fr:"Avant de commencer : écrivez en une phrase l'impact que cette journée doit produire.",en:"Before starting: write in one sentence the impact this day must produce."},
    {fr:"Qu'est-ce qui est à 80% prêt et attend d'être lancé ? Finissez-le aujourd'hui.",en:"What is 80% ready and waiting to be launched? Finish it today."},
    {fr:"Flux optimal détecté. Enchaînez deux blocs de 45 minutes sans interruption entre les deux.",en:"Optimal flow detected. Chain two 45-minute blocks with no interruption between them."},
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
    return {
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
    months:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    monthsShort:["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"],
    seasons:[
      {name:"Lancement",   desc:"Initiation · Exécution",      months:[2,3,4],  color:C.high,bg:C.highL},
      {name:"Croissance",  desc:"Visibilité · Revenus",         months:[5,6,7],  color:C.mid, bg:C.midL},
      {name:"Récolte",     desc:"Bilan · Consolidation",        months:[8,9,10], color:C.low, bg:C.lowL},
      {name:"Régénération",desc:"Repos · Préparation du cycle", months:[11,0,1], color:C.rest,bg:C.restL},
    ],
    platforms:["TikTok / Reels","YouTube Shorts","Ko-fi","Gumroad","LinkedIn","Instagram","Newsletter"],
  },
  en:{
    days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    daysShort:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    dayFlux:["Strategic momentum","Execution","Regulation","Distribution","Closing","Recovery","Incubation"],
    dayWindow:["09:15","10:30","11:00","09:00","14:30","10:00","—"],
    dayEnergy:["high","high","mid","high","mid","low","rest"],
    months:["January","February","March","April","May","June","July","August","September","October","November","December"],
    monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    seasons:[
      {name:"Launch",       desc:"Initiation · Execution",       months:[2,3,4],  color:C.high,bg:C.highL},
      {name:"Growth",       desc:"Visibility · Revenue",         months:[5,6,7],  color:C.mid, bg:C.midL},
      {name:"Harvest",      desc:"Review · Consolidation",       months:[8,9,10], color:C.low, bg:C.lowL},
      {name:"Regeneration", desc:"Rest · Cycle preparation",     months:[11,0,1], color:C.rest,bg:C.restL},
    ],
    platforms:["TikTok / Reels","YouTube Shorts","Ko-fi","Gumroad","LinkedIn","Instagram","Newsletter"],
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
const PBtn=({onClick,disabled,children})=><button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"10px 0",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",fontFamily:C.sans,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.4:1,border:"none",background:C.dark,color:"#F8F5F0",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{children}</button>;

function CpyBtn({getValue,lang}){
  const [ok,setOk]=useState(false);
  return <button onClick={()=>{try{navigator.clipboard.writeText(getValue());}catch(_){}setOk(true);setTimeout(()=>setOk(false),1800);}} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,fontWeight:700,textTransform:"uppercase",fontFamily:C.sans,color:ok?C.gold:C.faint,background:"none",border:`1px solid ${ok?C.gold:C.border}`,borderRadius:"4px",padding:"2px 6px",cursor:"pointer",flexShrink:0}}>{ok?<Check size={8}/>:<Copy size={8}/>}{ok?(lang==="fr"?"Copié":"Copied"):(lang==="fr"?"Copier":"Copy")}</button>;
}

/* ── RITUEL PANEL ── */
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

/* ── JOURNAL MERVEILLES ── */
function JournalMerveilles({lang}){
  const fr=lang==="fr";
  const key="merveilles-"+todayKey();
  const [val,setVal]=usePersist(key,"");
  const [saved,setSaved]=useState(false);
  return(
    <div style={{...cardS,padding:"12px 16px",marginBottom:14}}>
      <Cap c={fr?"Journal des Merveilles — Victoires & Ancrages":"Journal of Wonders — Victories & Anchors"} gold/>
      <textarea value={val} onChange={e=>setVal(e.target.value)} rows={3} style={taS}
        placeholder={fr?"Notez vos victoires, ancrages, prises de conscience du jour...":"Note your victories, anchors, insights of the day..."}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}>
        <button onClick={()=>{lsSet(key,val);setSaved(true);setTimeout(()=>setSaved(false),2000);}} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",fontFamily:C.sans,color:saved?C.gold:C.muted,background:"none",border:`1px solid ${saved?C.gold:C.border}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer"}}>
          <Heart size={9}/>{saved?(fr?"Ancré":"Anchored"):(fr?"Ancrer":"Anchor")}
        </button>
      </div>
    </div>
  );
}

/* ── NOTES LIBRES ── */
function FreeNotes({lang}){
  const fr=lang==="fr";
  const [val,setVal]=usePersist("freenotes","");
  const [saved,setSaved]=useState(false);
  const [open,setOpen]=useState(true);
  return(
    <div style={{...cardS,overflow:"hidden",marginBottom:14}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",borderBottom:open?`1px solid ${C.border}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><FileText size={11} color={C.gold}/><span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".11em",fontFamily:C.sans,color:C.dark}}>{fr?"Notes Libres":"Free Notes"}</span></div>
        {open?<ChevronUp size={12} color={C.faint}/>:<ChevronDown size={12} color={C.faint}/>}
      </div>
      {open&&<div style={{padding:"12px 14px"}}>
        <p style={{fontSize:10,color:C.faint,fontFamily:C.sans,margin:"0 0 7px",fontStyle:"italic"}}>{fr?"Idées, ressentis, intuitions — espace libre et persistant.":"Ideas, feelings, intuitions — free and persistent."}</p>
        <textarea value={val} onChange={e=>setVal(e.target.value)} rows={8} style={taS} placeholder={fr?"Tout ce qui traverse votre esprit...":"Anything that crosses your mind..."}/>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}>
          <button onClick={()=>{lsSet("freenotes",val);setSaved(true);setTimeout(()=>setSaved(false),2000);}} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",fontFamily:C.sans,color:saved?C.gold:C.muted,background:"none",border:`1px solid ${saved?C.gold:C.border}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer"}}>
            <Heart size={9}/>{saved?(fr?"Sauvegardé":"Saved"):(fr?"Sauvegarder":"Save")}
          </button>
        </div>
      </div>}
    </div>
  );
}

/* ── GÉNÉRATEUR SEO (panneau dédié, affiché dans la sidebar) ── */
function ContentPanel({task,lang,keywords,platform,dayFocus,dayName,onClose}){
  const fr=lang==="fr";
  const kitKey=`seo-task-${task.id}`;
  const empty={title:"",h1:"",h2:"",h3:"",body:"",cta:"",tags:"",ready:false};
  const [kit,setKit]=useState(()=>lsGet(kitKey,empty));
  const [busy,setBusy]=useState(false);
  function upd(f,v){setKit(k=>{const n={...k,[f]:v};lsSet(kitKey,n);return n;});}

  async function gen(){
    setBusy(true);
    const kw=keywords||(fr?"performance, productivité":"performance, productivity");
    const plt=platform||"Instagram";
    const prompt=fr
      ?`Expert copywriter SEO. JSON valide uniquement, sans markdown.\n{"title":"Titre SEO max 70 caractères","h1":"Accroche 1 max 16 mots","h2":"Accroche 2 question max 16 mots","h3":"Accroche 3 solution max 16 mots","body":"Description SEO 200-240 mots, ton professionnel pragmatique","cta":"2 phrases de conversion","tags":"#tag1 #tag2 #tag3 #tag4 #tag5"}\nTâche: "${task.text}" | Jour: ${dayName} | Focus: ${dayFocus} | Plateforme: ${plt} | Mots-clés: ${kw}`
      :`Expert SEO copywriter. Valid JSON only, no markdown.\n{"title":"SEO title max 70 chars","h1":"Hook 1 max 16 words","h2":"Hook 2 question max 16 words","h3":"Hook 3 solution max 16 words","body":"SEO description 200-240 words professional tone","cta":"2 conversion sentences","tags":"#tag1 #tag2 #tag3 #tag4 #tag5"}\nTask: "${task.text}" | Day: ${dayName} | Focus: ${dayFocus} | Platform: ${plt} | Keywords: ${kw}`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const json=await res.json();
      const raw=(json.content||[]).map(b=>b.text||"").join("");
      const m=raw.match(/\{[\s\S]*\}/);
      if(m){const p=JSON.parse(m[0]);const n={...p,ready:true};setKit(n);lsSet(kitKey,n);}
    }catch(_){}
    setBusy(false);
  }

  return(
    <div style={{...cardS,overflow:"hidden"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#FFFBF2",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Sparkles size={11} color={C.gold}/>
          <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".11em",fontFamily:C.sans,color:C.dark}}>{fr?"Contenu SEO":"SEO Content"}</span>
        </div>
        <button onClick={onClose} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.faint}}><X size={12}/></button>
      </div>
      <div style={{padding:"12px 14px"}}>
        {/* Tâche source */}
        <div style={{padding:"7px 10px",background:C.lowL,border:`1px solid ${C.border}`,borderRadius:"7px",marginBottom:12}}>
          <Cap c={fr?"Tâche source":"Source task"} gold/>
          <div style={{fontSize:12,fontFamily:C.sans,color:C.dark,fontWeight:500}}>{task.text}</div>
        </div>
        {!kit.ready&&!busy&&<PBtn onClick={gen}><Sparkles size={10}/>{fr?"Générer le contenu":"Generate content"}</PBtn>}
        {busy&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"16px 0"}}><Loader size={14} color={C.gold}/><span style={{fontSize:10,color:C.faint,fontFamily:C.sans}}>{fr?"Génération en cours...":"Generating..."}</span></div>}
        {kit.ready&&<div>
          {/* Titre */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><Cap c={fr?"Titre SEO":"SEO Title"} gold/><CpyBtn getValue={()=>kit.title} lang={lang}/></div>
            <input value={kit.title} onChange={e=>upd("title",e.target.value)} style={iS}/>
          </div>
          {/* Accroches */}
          <div style={{marginBottom:10}}>
            <Cap c={fr?"Accroches":"Hooks"} gold/>
            {[["h1","1."],["h2","2."],["h3","3."]].map(it=>(
              <div key={it[0]} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                <span style={{fontSize:9.5,fontWeight:700,color:C.gold,fontFamily:C.sans,width:14,flexShrink:0}}>{it[1]}</span>
                <input value={kit[it[0]]} onChange={e=>upd(it[0],e.target.value)} style={{...iS,flex:1,fontSize:11}}/>
                <CpyBtn getValue={()=>kit[it[0]]} lang={lang}/>
              </div>
            ))}
          </div>
          {/* Body */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><Cap c={fr?"Description SEO":"SEO Description"} gold/><CpyBtn getValue={()=>kit.body} lang={lang}/></div>
            <textarea value={kit.body} onChange={e=>upd("body",e.target.value)} rows={5} style={taS}/>
          </div>
          {/* CTA */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><Cap c={fr?"Appel à l'Action":"Call to Action"} gold/><CpyBtn getValue={()=>kit.cta} lang={lang}/></div>
            <textarea value={kit.cta} onChange={e=>upd("cta",e.target.value)} rows={2} style={taS}/>
          </div>
          {/* Hashtags */}
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><Cap c="Hashtags" gold/><CpyBtn getValue={()=>kit.tags} lang={lang}/></div>
            <input value={kit.tags} onChange={e=>upd("tags",e.target.value)} style={iS}/>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button onClick={gen} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",fontFamily:C.sans,color:C.muted,background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer"}}><RefreshCw size={8}/>{fr?"Régénérer":"Regenerate"}</button>
          </div>
        </div>}
      </div>
    </div>
  );
}

/* ── TASK CARD — épurée, sans contenu injecté ── */
function TaskCard({task,fromDay,onDelete,onColor,onEdit,onSelectForContent,isSelected,lang}){
  const [showPalette,setShowPalette]=useState(false);
  const [editing,setEditing]=useState(false);
  const [editVal,setEditVal]=useState(task.text);
  function saveEdit(){if(editVal.trim())onEdit(task.id,editVal.trim());setEditing(false);}

  return(
    <div draggable onDragStart={e=>{e.dataTransfer.setData("taskId",task.id);e.dataTransfer.setData("fromDay",fromDay);}}
      style={{background:isSelected?C.dark:(task.color||C.lowL),border:`1px solid ${isSelected?C.gold:C.border}`,borderRadius:"8px",padding:"6px 8px",marginBottom:5,userSelect:"none",transition:"background 0.15s"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:5}}>
        <GripVertical size={10} color={isSelected?"#F8F5F0":C.faint} style={{flexShrink:0,marginTop:3,cursor:"grab"}}/>
        <div style={{flex:1,minWidth:0}}>
          {editing
            ?<div style={{display:"flex",gap:4}}>
              <input value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit();}} style={{...iS,flex:1,fontSize:11,padding:"2px 0",color:C.dark}} autoFocus/>
              <button onClick={saveEdit} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.gold}}><Save size={10}/></button>
            </div>
            :<div style={{fontSize:11.5,color:isSelected?"#F8F5F0":C.dark,lineHeight:1.4,fontFamily:C.sans,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.text}</div>
          }
          {task.guidance&&!editing&&<div style={{fontSize:9,color:isSelected?"rgba(255,255,255,.6)":C.gold,fontStyle:"italic",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.guidance}</div>}
          {task.time&&task.time!=="—"&&<div style={{fontSize:9,color:isSelected?"rgba(255,255,255,.5)":C.muted,marginTop:1}}>{task.time}</div>}
        </div>
        <div style={{display:"flex",gap:2,flexShrink:0}}>
          <button title={lang==="fr"?"Générer contenu SEO":"Generate SEO content"} onClick={()=>onSelectForContent(task)}
            style={{padding:2,background:"none",border:"none",cursor:"pointer",color:isSelected?C.gold:C.faint}}>
            <Sparkles size={10}/>
          </button>
          <button onClick={()=>setEditing(!editing)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:isSelected?"rgba(255,255,255,.5)":C.faint}}><Edit3 size={10}/></button>
          <button onClick={()=>setShowPalette(s=>!s)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:isSelected?"rgba(255,255,255,.5)":C.faint}}><Palette size={10}/></button>
          <button onClick={()=>onDelete(task.id)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:isSelected?"rgba(255,255,255,.5)":C.faint}}><X size={10}/></button>
        </div>
      </div>
      {showPalette&&<div style={{display:"flex",gap:3,marginTop:5,flexWrap:"wrap"}}>
        {TASK_COLORS.map(col=><div key={col} onClick={()=>{onColor(task.id,col);setShowPalette(false);}} style={{width:14,height:14,background:col,border:`1px solid ${C.border}`,borderRadius:"3px",cursor:"pointer"}}/>)}
      </div>}
    </div>
  );
}

/* ── VUE HEBDOMADAIRE ── */
function WeekView({d,lang,birthDate,tasks,setTasks,notes,setNotes,keywords,platform}){
  const fr=lang==="fr";
  const [newTask,setNewTask]=useState("");
  const [scanBusy,setScanBusy]=useState(false);
  const [scanMsg,setScanMsg]=useState("");
  const [activeDay,setActiveDay]=useState(null);
  const [noteEdit,setNoteEdit]=useState("");
  /* Tâche sélectionnée pour génération de contenu — affichée dans la sidebar */
  const [selectedTask,setSelectedTask]=useState(null);
  const today=todayKey();

  function makeTask(text,guidance,time){return {id:Date.now()+Math.random()+"",text,guidance:guidance||"",time:time||"",color:C.lowL};}
  function scanAndPlace(){
    if(!newTask.trim())return;
    setScanBusy(true);
    const best=E.bestDay(birthDate,newTask);
    const dk=weekDayKey(best);
    const guidance=E.guidance(birthDate,best,fr);
    setTimeout(()=>{
      const t=makeTask(newTask,guidance,d.dayWindow[best]);
      setTasks(prev=>{const n={...prev};n[dk]=[...(n[dk]||[]),t];lsSet("tasks",n);return n;});
      setScanMsg((fr?"Planifié : ":"Scheduled: ")+d.days[best]+" "+d.dayWindow[best]);
      setNewTask("");setScanBusy(false);
      setTimeout(()=>setScanMsg(""),4000);
    },700);
  }
  function moveTask(tid,from,to){
    if(from===to)return;
    setTasks(prev=>{const n={...prev};const t=(n[from]||[]).find(x=>x.id===tid);if(!t)return prev;n[from]=(n[from]||[]).filter(x=>x.id!==tid);n[to]=[...(n[to]||[]),t];lsSet("tasks",n);return n;});
  }
  function deleteTask(dk,tid){
    if(selectedTask?.id===tid)setSelectedTask(null);
    setTasks(prev=>{const n={...prev};n[dk]=(n[dk]||[]).filter(t=>t.id!==tid);lsSet("tasks",n);return n;});
  }
  function colorTask(tid,col){setTasks(prev=>{const n={};Object.keys(prev).forEach(dk=>{n[dk]=(prev[dk]||[]).map(t=>t.id===tid?{...t,color:col}:t);});lsSet("tasks",n);return n;});}
  function editTask(tid,text){setTasks(prev=>{const n={};Object.keys(prev).forEach(dk=>{n[dk]=(prev[dk]||[]).map(t=>t.id===tid?{...t,text}:t);});lsSet("tasks",n);return n;});}
  function quickAdd(dk,val){if(!val.trim())return;const t=makeTask(val,"","");setTasks(prev=>{const n={...prev};n[dk]=[...(n[dk]||[]),t];lsSet("tasks",n);return n;});}

  /* Trouver le dayIdx de la tâche sélectionnée */
  function findTaskDayIdx(tid){
    for(let i=0;i<7;i++){const dk=weekDayKey(i);if((tasks[dk]||[]).find(t=>t.id===tid))return i;}
    return 0;
  }

  const selDayIdx=selectedTask?findTaskDayIdx(selectedTask.id):0;

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:16,alignItems:"start"}}>
      {/* ── COLONNE PRINCIPALE ── */}
      <div style={{minWidth:0}}>
        <RitualPanel bd={birthDate} dateObj={new Date()} lang={lang}/>
        <JournalMerveilles lang={lang}/>

        {/* Scanner */}
        <div style={{...cardS,padding:"11px 15px",marginBottom:14}}>
          <Cap c={fr?"Scanner une priorité — placement automatique":"Scan a priority — automatic placement"} gold/>
          <div style={{display:"flex",gap:7,marginTop:5}}>
            <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")scanAndPlace();}}
              placeholder={fr?"Ex : Envoyer ma newsletter...":"Ex: Send my newsletter..."} style={{...iS,flex:1}}/>
            <button onClick={scanAndPlace} disabled={scanBusy||!newTask.trim()}
              style={{display:"flex",alignItems:"center",gap:4,padding:"4px 11px",fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",fontFamily:C.sans,cursor:(!newTask.trim()||scanBusy)?"not-allowed":"pointer",opacity:(!newTask.trim()||scanBusy)?.4:1,border:"none",background:C.dark,color:"#F8F5F0",borderRadius:"6px",flexShrink:0}}>
              {scanBusy?<Loader size={10}/>:<Zap size={10}/>}{fr?"Scanner":"Scan"}
            </button>
          </div>
          {scanMsg&&<div style={{fontSize:10,color:C.gold,fontFamily:C.sans,marginTop:5,fontStyle:"italic"}}>{scanMsg}</div>}
        </div>

        {/* ── 7 COLONNES — épurées ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:5}}>
          {d.days.map((day,i)=>{
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
                style={{background:isToday?"#FFFBF2":C.card,border:isToday?`1px solid ${C.gold}`:`1px solid ${C.border}`,borderRadius:"10px",padding:"8px 7px",minHeight:170,display:"flex",flexDirection:"column"}}
              >
                {/* En-tête du jour */}
                <div style={{marginBottom:8,cursor:"pointer"}} onClick={()=>setActiveDay(activeDay===i?null:i)}>
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

                {/* Tâches — colonne épurée */}
                <div style={{flex:1}}>
                  {(tasks[dk]||[]).map(t=>(
                    <TaskCard key={t.id} task={t} fromDay={dk}
                      onDelete={id=>deleteTask(dk,id)}
                      onColor={(id,col)=>colorTask(id,col)}
                      onEdit={(id,txt)=>editTask(id,txt)}
                      onSelectForContent={task=>{setSelectedTask(s=>s?.id===task.id?null:task);}}
                      isSelected={selectedTask?.id===t.id}
                      lang={lang}/>
                  ))}
                </div>

                {/* Quick add */}
                <input placeholder={fr?"+ Ajouter":"+ Add"} style={{...iS,fontSize:10,padding:"2px 0",marginTop:4}}
                  onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){quickAdd(dk,e.target.value.trim());e.target.value="";}}}/>
              </div>
            );
          })}
        </div>

        {/* Panneau note du jour (sous les colonnes) */}
        {activeDay!==null&&(()=>{
          const i=activeDay;
          const dk=weekDayKey(i);
          const dt=weekDayDate(i);
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
                    style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",fontFamily:C.sans,color:C.muted,background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer",marginTop:6}}>
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

      {/* ── SIDEBAR DROITE — STICKY ── */}
      <div style={{position:"sticky",top:16,display:"flex",flexDirection:"column",gap:14}}>
        {/* Générateur SEO dédié — s'affiche quand une tâche est sélectionnée */}
        {selectedTask
          ?<ContentPanel
              task={selectedTask}
              lang={lang}
              keywords={keywords}
              platform={platform}
              dayFocus={d.dayFlux?.[selDayIdx]||""}
              dayName={d.days[selDayIdx]}
              onClose={()=>setSelectedTask(null)}/>
          :<div style={{...cardS,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <Sparkles size={11} color={C.gold}/>
              <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".11em",fontFamily:C.sans,color:C.dark}}>{fr?"Générateur de Contenu":"Content Generator"}</span>
            </div>
            <p style={{fontSize:11,color:C.faint,fontFamily:C.sans,margin:0,fontStyle:"italic",lineHeight:1.6}}>{fr?"Cliquez sur l'icône d'une tâche pour générer son contenu SEO dédié ici.":"Click the icon on any task to generate its dedicated SEO content here."}</p>
          </div>
        }
        <FreeNotes lang={lang}/>
      </div>
    </div>
  );
}

/* ── VUE MENSUELLE ── */
function MonthView({d,lang,birthDate,tasks,setTasks,initMonth,initYear,keywords,platform}){
  const fr=lang==="fr";
  const [year,setYear]=useState(initYear||new Date().getFullYear());
  const [month,setMonth]=useState(initMonth!==undefined?initMonth:new Date().getMonth());
  const [selDate,setSelDate]=useState(null);
  const [newTaskText,setNewTaskText]=useState("");
  const [selectedTask,setSelectedTask]=useState(null);
  const today=todayKey();

  const firstDay=(new Date(year,month,1).getDay()+6)%7;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let j=1;j<=daysInMonth;j++) cells.push(j);
  const ds=n=>dateStr(year,month,n);
  const dayIdx=n=>(new Date(year,month,n).getDay()+6)%7;

  function addTask(ds2,text){
    if(!text.trim())return;
    setTasks(prev=>{const n={...prev};n[ds2]=[...(n[ds2]||[]),{id:Date.now()+Math.random()+"",text,guidance:"",time:"",color:C.lowL}];lsSet("tasks",n);return n;});
    setNewTaskText("");
  }
  function delTask(ds2,tid){
    if(selectedTask?.id===tid)setSelectedTask(null);
    setTasks(prev=>{const n={...prev};n[ds2]=(n[ds2]||[]).filter(t=>t.id!==tid);lsSet("tasks",n);return n;});
  }
  function dropTask(tid,from,to){
    if(from===to)return;
    setTasks(prev=>{const n={...prev};const task=(n[from]||[]).find(t=>t.id===tid);if(!task)return prev;n[from]=(n[from]||[]).filter(t=>t.id!==tid);n[to]=[...(n[to]||[]),task];lsSet("tasks",n);return n;});
  }

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:16,alignItems:"start"}}>
      <div style={{minWidth:0}}>
        <div style={{...cardS,padding:"16px 18px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}} style={{padding:"3px 9px",background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",cursor:"pointer",color:C.muted,fontFamily:C.sans}}>{"<"}</button>
            <div style={{fontSize:15,fontWeight:700,fontFamily:C.serif,color:C.dark}}>{d.months[month]} {year}</div>
            <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}} style={{padding:"3px 9px",background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",cursor:"pointer",color:C.muted,fontFamily:C.sans}}>{">"}</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:3}}>
            {d.daysShort.map(dy=><div key={dy} style={{fontSize:8.5,textAlign:"center",color:C.faint,textTransform:"uppercase",fontFamily:C.sans,padding:"2px 0"}}>{dy}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {cells.map((n,i)=>{
              if(!n)return <div key={"e"+i}/>;
              const s=ds(n);const di=dayIdx(n);const em=EM[d.dayEnergy[di]];
              const hasTasks=(tasks[s]||[]).length>0;const isToday=s===today;const isSel=s===selDate;
              return(
                <div key={n} onClick={()=>setSelDate(isSel?null:s)}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();dropTask(e.dataTransfer.getData("taskId"),e.dataTransfer.getData("fromDay"),s);}}
                  style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",border:isSel?`1px solid ${C.gold}`:isToday?`1px solid ${em.c}`:"1px solid transparent",borderRadius:"6px",background:isSel?C.dark:isToday?"#FFFBF2":"transparent"}}>
                  <span style={{fontSize:11,fontFamily:C.sans,color:isSel?"#F8F5F0":C.dark,fontWeight:isToday?700:400}}>{n}</span>
                  <div style={{width:5,height:5,borderRadius:"50%",background:isSel?"rgba(255,255,255,.6)":hasTasks?em.c:C.border,marginTop:2}}/>
                </div>
              );
            })}
          </div>
        </div>

        {selDate&&<div style={{...cardS,padding:"14px 16px"}}>
          <Cap c={selDate} gold/>
          <div style={{fontSize:10,color:C.gold,fontFamily:C.sans,fontStyle:"italic",marginBottom:10}}>{E.guidance(birthDate,dayIdx(parseInt(selDate.split("-")[2])),fr)}</div>
          {(tasks[selDate]||[]).map(t=>(
            <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,fontFamily:C.sans,color:C.dark,flex:1,marginRight:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</span>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button onClick={()=>setSelectedTask(s=>s?.id===t.id?null:t)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:selectedTask?.id===t.id?C.gold:C.faint}}><Sparkles size={11}/></button>
                <button onClick={()=>delTask(selDate,t.id)} style={{padding:2,background:"none",border:"none",cursor:"pointer",color:C.faint}}><X size={11}/></button>
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:5,marginTop:10}}>
            <input value={newTaskText} onChange={e=>setNewTaskText(e.target.value)}
              placeholder={fr?"Ajouter...":"Add..."} style={{...iS,flex:1,fontSize:11}}
              onKeyDown={e=>{if(e.key==="Enter")addTask(selDate,newTaskText);}}/>
            <button onClick={()=>addTask(selDate,newTaskText)} style={{padding:"3px 9px",background:C.dark,color:"#F8F5F0",border:"none",borderRadius:"6px",fontSize:12,cursor:"pointer",flexShrink:0}}>+</button>
          </div>
        </div>}
      </div>

      <div style={{position:"sticky",top:16,display:"flex",flexDirection:"column",gap:14}}>
        {selectedTask
          ?<ContentPanel task={selectedTask} lang={lang} keywords={keywords} platform={platform}
              dayFocus={selDate?d.dayFlux?.[dayIdx(parseInt(selDate.split("-")[2]))]||"":""}
              dayName={selDate?d.days[dayIdx(parseInt(selDate.split("-")[2]))]||"":""}
              onClose={()=>setSelectedTask(null)}/>
          :<div style={{...cardS,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><Sparkles size={11} color={C.gold}/><span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".11em",fontFamily:C.sans,color:C.dark}}>{fr?"Générateur de Contenu":"Content Generator"}</span></div>
            <p style={{fontSize:11,color:C.faint,fontFamily:C.sans,margin:0,fontStyle:"italic",lineHeight:1.6}}>{fr?"Sélectionnez une tâche ci-contre pour générer son contenu SEO.":"Select a task on the left to generate its SEO content."}</p>
          </div>
        }
        <FreeNotes lang={lang}/>
      </div>
    </div>
  );
}

/* ── VUE ANNUELLE ── */
function YearView({d,lang,birthDate,onGoToMonth}){
  const fr=lang==="fr";
  const [expanded,setExpanded]=useState(null);
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:16,alignItems:"start"}}>
      <div style={{minWidth:0}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
          {d.seasons.map((s,si)=>{
            const isOpen=expanded===si;
            return(
              <div key={si} style={{...card,overflow:"hidden",borderTop:`3px solid ${s.color}`}}>
                <div onClick={()=>setExpanded(isOpen?null:si)} style={{padding:"13px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:13,fontWeight:700,fontFamily:C.serif,color:C.dark,marginBottom:2}}>{s.name}</div><div style={{fontSize:10,color:C.muted,fontFamily:C.sans}}>{s.desc}</div></div>
                  {isOpen?<ChevronUp size={12} color={C.faint}/>:<ChevronDown size={12} color={C.faint}/>}
                </div>
                {isOpen&&<div style={{padding:"0 16px 12px",borderTop:`1px solid ${C.border}`}}>
                  {s.months.map(mIdx=>{
                    const mom=E.momentum(birthDate,(mIdx*5)%7);
                    const em=EM[d.dayEnergy[(mIdx*5)%7]];
                    return(
                      <div key={mIdx} onClick={()=>onGoToMonth(mIdx)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
                        <span style={{fontSize:12,fontFamily:C.serif,color:C.dark,fontWeight:600}}>{d.months[mIdx]}</span>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:44,height:3,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:mom+"%",background:em.c,borderRadius:2}}/></div>
                          <span style={{fontSize:9.5,fontWeight:700,color:em.c,fontFamily:C.sans,width:26,textAlign:"right"}}>{mom}%</span>
                          <ArrowRight size={10} color={C.faint}/>
                        </div>
                      </div>
                    );
                  })}
                </div>}
              </div>
            );
          })}
        </div>
        <div style={{...cardS,padding:"16px 18px"}}>
          <Cap c={fr?"Navigation annuelle — cliquez pour ouvrir un mois":"Annual navigation — click to open a month"} gold/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:7,marginTop:9}}>
            {d.months.map((m,mi)=>{
              const mom=E.momentum(birthDate,(mi*5)%7);
              const em=EM[d.dayEnergy[(mi*5)%7]];
              const isNow=mi===new Date().getMonth();
              return(
                <div key={mi} onClick={()=>onGoToMonth(mi)} style={{padding:"10px 6px",border:isNow?`1px solid ${C.gold}`:`1px solid ${C.border}`,borderRadius:"8px",cursor:"pointer",textAlign:"center",background:isNow?"#FFFBF2":C.card}}>
                  <div style={{fontSize:10.5,fontWeight:700,color:isNow?C.gold:C.dark,fontFamily:C.serif,marginBottom:5}}>{d.monthsShort[mi]}</div>
                  <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:mom+"%",background:em.c,borderRadius:2}}/></div>
                  <div style={{width:7,height:7,borderRadius:"50%",background:em.c,margin:"0 auto"}}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{position:"sticky",top:16}}><FreeNotes lang={lang}/></div>
    </div>
  );
}

/* ══ APP PRINCIPALE ══ */
export default function App(){
  const [screen,setScreen]=useState("onboard");
  const [lang,setLang]=usePersist("lang","fr");
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=usePersist("tab","week");
  const [monthNav,setMonthNav]=useState(null);

  const [tasks,setTasks]=usePersist("tasks",{});
  const [notes,setNotes]=usePersist("notes",{});
  const [name,setName]=usePersist("name","");
  const [birthDate,setBirthDate]=usePersist("birthDate","");
  const [birthTime,setBirthTime]=usePersist("birthTime","");
  const [birthPlace,setBirthPlace]=usePersist("birthPlace","");
  const [context,setContext]=usePersist("context","");
  const [keywords,setKeywords]=usePersist("keywords","");
  const [platform,setPlatformS]=usePersist("platform","");

  const profile=birthDate?PROFILES[E.profile(birthDate)]:PROFILES[0];
  const d=DATA[lang];const fr=lang==="fr";

  function goToMonth(mIdx){setMonthNav({month:mIdx,year:new Date().getFullYear()});setTab("month");}

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
            {[[fr?"Prénom":"First name",name,setName,"text"],[fr?"Date de naissance":"Date of birth",birthDate,setBirthDate,"date"],[fr?"Heure de naissance":"Time of birth",birthTime,setBirthTime,"time"],[fr?"Lieu de naissance":"Place of birth",birthPlace,setBirthPlace,"text"]].map(r=>(
              <div key={r[0]}><Cap c={r[0]}/><input type={r[3]} value={r[1]} onChange={e=>r[2](e.target.value)} style={iS}/></div>
            ))}
          </div>
          <GLine/>
          <Cap c={fr?"Contexte & Contenu":"Context & Content"} gold/>
          <div style={{marginTop:8,marginBottom:10}}><Cap c={fr?"Réalité de terrain":"Field reality"}/><textarea value={context} onChange={e=>setContext(e.target.value)} rows={2} style={taS}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22}}>
            <div><Cap c={fr?"Mots-clés offre":"Offer keywords"}/><input value={keywords} onChange={e=>setKeywords(e.target.value)} style={iS}/></div>
            <div><Cap c={fr?"Plateforme":"Platform"}/>
              <select value={platform} onChange={e=>setPlatformS(e.target.value)} style={{...iS,cursor:"pointer"}}>
                <option value="">—</option>{d.platforms.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <PBtn onClick={()=>{setLoading(true);setTimeout(()=>{setLoading(false);setScreen("main");},1000);}}>{fr?"Lancer l'analyse":"Launch analysis"}</PBtn>
          <footer style={{marginTop:20,textAlign:"center",fontSize:8.5,color:C.faint,textTransform:"uppercase",letterSpacing:".11em",fontFamily:C.sans}}>L'Oracle — par Louisette · 2026</footer>
        </div>
      }
    </div>
  );

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:C.sans,paddingBottom:60}}>
      <div style={{maxWidth:1360,margin:"0 auto",padding:"18px 16px 0"}}>
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
          <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{display:"flex",background:C.card,border:`1px solid ${C.border}`,borderRadius:"9px",overflow:"hidden"}}>
              {[[fr?"Semaine":"Week","week"],[fr?"Mensuel":"Monthly","month"],[fr?"Annuel":"Yearly","year"]].map((it,i)=>(
                <button key={it[1]} onClick={()=>{setTab(it[1]);if(it[1]!=="month")setMonthNav(null);}}
                  style={{padding:"7px 15px",fontSize:10,fontWeight:700,cursor:"pointer",border:"none",background:tab===it[1]?C.dark:C.card,color:tab===it[1]?"#F8F5F0":C.muted,textTransform:"uppercase",letterSpacing:".09em",fontFamily:C.sans,borderRight:i<2?`1px solid ${C.border}`:"none"}}>
                  {it[0]}
                </button>
              ))}
            </div>
            <div style={{display:"flex",background:C.card,border:`1px solid ${C.border}`,borderRadius:"7px",overflow:"hidden"}}>
              {["fr","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{padding:"5px 10px",fontSize:9.5,fontWeight:700,cursor:"pointer",border:"none",background:lang===l?C.dark:C.card,color:lang===l?"#F8F5F0":C.muted,textTransform:"uppercase",fontFamily:C.sans}}>{l==="fr"?"FR":"EN"}</button>)}
            </div>
            <button onClick={()=>setScreen("onboard")} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",fontFamily:C.sans,color:C.muted,background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"5px 10px",cursor:"pointer"}}>{fr?"Profil":"Profile"}<ArrowRight size={9}/></button>
          </div>
        </header>

        {tab==="week"&&<WeekView d={d} lang={lang} birthDate={birthDate} tasks={tasks} setTasks={setTasks} notes={notes} setNotes={setNotes} keywords={keywords} platform={platform}/>}

        {tab==="month"&&<div>
          {monthNav&&<div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
            <button onClick={()=>{setMonthNav(null);setTab("year");}} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,textTransform:"uppercase",fontFamily:C.sans,color:C.muted,background:"none",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"4px 9px",cursor:"pointer"}}><ArrowLeft size={9}/>{fr?"Retour à l'annuel":"Back to yearly"}</button>
            <span style={{fontSize:12,fontFamily:C.serif,color:C.dark,fontWeight:700}}>{d.months[monthNav.month]} {monthNav.year}</span>
          </div>}
          <MonthView d={d} lang={lang} birthDate={birthDate} tasks={tasks} setTasks={setTasks}
            initMonth={monthNav?.month} initYear={monthNav?.year} keywords={keywords} platform={platform}/>
        </div>}

        {tab==="year"&&<YearView d={d} lang={lang} birthDate={birthDate} tasks={tasks} setTasks={setTasks} onGoToMonth={goToMonth}/>}

        <footer style={{textAlign:"center",marginTop:40,paddingTop:12,borderTop:`1px solid ${C.border}`,fontSize:8.5,color:C.faint,textTransform:"uppercase",letterSpacing:".12em",fontFamily:C.sans}}>
          {fr?"L'Oracle — Système de performance organique par Louisette — 2026 — Tous droits réservés":"The Oracle — Organic performance system by Louisette — 2026 — All rights reserved"}
        </footer>
      </div>
    </div>
  );
}
