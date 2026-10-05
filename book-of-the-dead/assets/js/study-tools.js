/* Book of the Dead · v2.5. Local search and stable source links. No external requests. */
(function(){
'use strict';
const $=id=>document.getElementById(id), api=window.ANI_VIEWER;
if(!api)return;
const normalized=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const records=api.blocks().map(b=>({...b,titleKey:normalized(b.title),key:normalized([b.title,b.spell,'spell '+b.spell,'sheet '+b.sheet,b.text,b.guide].join(' '))}));
function el(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!=null)e.textContent=text;return e;}
const dialog=el('dialog','studyDialog');dialog.id='studySearch';dialog.setAttribute('aria-labelledby','searchTitle');
const head=el('div','studyDialogHead');const heading=el('h2',null,'Search the study');heading.id='searchTitle';
const close=el('button',null,'Close');close.type='button';close.setAttribute('aria-label','Close search');head.append(heading,close);
const label=el('label','studySearchLabel','A name, spell number or phrase');label.htmlFor='studyQuery';
const input=el('input');input.id='studyQuery';input.type='search';input.autocomplete='off';input.spellcheck=false;input.placeholder='Try “Osiris”, “spell 125” or “heart”';
const summary=el('p','studySearchSummary');summary.id='studySearchSummary';summary.setAttribute('role','status');input.setAttribute('aria-describedby',summary.id);
const results=el('div','studySearchResults');results.id='studyResults';
const foot=el('p','studySearchFoot','Searches the bundled historical text and editorial notes. Map associations and column correspondences remain under review.');
dialog.append(head,label,input,summary,results,foot);document.body.appendChild(dialog);
let opener=null;
function openSearch(){opener=document.activeElement;dialog.showModal();render();input.focus();input.select();}
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dialog.close();}});
close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function render(){
 const query=normalized(input.value);results.replaceChildren();
 if(!query){summary.textContent='Search '+records.length+' annotated passages across 37 facsimile sheets.';return;}
 const tokens=query.split(' ');const matched=records.filter(b=>tokens.every(t=>b.key.includes(t))).sort((a,b)=>{
  const rank=x=>(x.titleKey.includes(query)?10:0)+(normalized(x.spell)===query.replace(/^spell /,'')?20:0);
  return rank(b)-rank(a)||a.sheet-b.sheet;
 });
 summary.textContent=matched.length?matched.length+' matching passage'+(matched.length===1?'':'s')+(matched.length>60?' · showing the first 60':''): 'No matching passages in the bundled text. Try a shorter phrase or a spelling used in the historical translation.';
 for(const item of matched.slice(0,60)){
  const button=el('button','studyResult');button.type='button';button.dataset.block=item.id;
  button.append(el('span','studyResultTitle',item.title),el('span','studyResultMeta','Sheet '+item.sheet+(item.spell?' · Spell '+item.spell:'')+' · Passage '+item.id));
  const text=String(item.text||item.guide||'').replace(/\s+/g,' '),key=normalized(text),found=key.indexOf(tokens.find(t=>!['spell','sheet'].includes(t))||query),start=Math.max(0,found-65);
  button.append(el('span','studyResultExcerpt',(start?'…':'')+text.slice(start,start+210)+(text.length>start+210?'…':'')));
  button.addEventListener('click',()=>{dialog.close();api.open(item.id);const reader=$('reader');reader.tabIndex=-1;reader.focus({preventScroll:true});});
  results.appendChild(button);
 }
}
input.addEventListener('input',render);
input.addEventListener('keydown',e=>{if(['Enter','ArrowDown'].includes(e.key)&&results.firstElementChild){e.preventDefault();if(e.key==='Enter')results.firstElementChild.click();else results.firstElementChild.focus();}});
results.addEventListener('keydown',e=>{const target=e.target.closest('.studyResult');if(!target)return;if(e.key==='ArrowDown'){e.preventDefault();target.nextElementSibling?.focus();}else if(e.key==='ArrowUp'){e.preventDefault();(target.previousElementSibling||input).focus();}});
$('btnSearch').addEventListener('click',openSearch);
window.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!document.querySelector('dialog[open]')&&!e.target?.isContentEditable&&!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||'')){e.preventDefault();openSearch();}});
// The fallback is an explicit, selectable URL rather than a false "copied" confirmation.
const share=el('dialog','studyDialog shareDialog');share.id='studyShare';share.setAttribute('aria-labelledby','shareTitle');
const shareHead=el('div','studyDialogHead');const shareTitle=el('h2',null,'Passage link');shareTitle.id='shareTitle';const shareClose=el('button',null,'Close');shareClose.type='button';shareHead.append(shareTitle,shareClose);
const shareNote=el('p',null,'Select and copy this address. On your live site it will reopen the same annotated passage or column.');
const shareInput=el('input');shareInput.id='shareURL';shareInput.readOnly=true;shareInput.setAttribute('aria-label','Address of selected passage');
const shareHelp=el('p','studySearchFoot');share.append(shareHead,shareNote,shareInput,shareHelp);document.body.appendChild(share);
share.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();share.close();}});
shareClose.addEventListener('click',()=>share.close());share.addEventListener('close',()=>$('rCopy')?.focus());
$('reader').addEventListener('click',async e=>{
 if(!e.target.closest('#rCopy'))return;
 const url=api.link(),status=$('rCopyStatus');
 const local=location.protocol==='file:'||location.protocol==='about:';
 try{
  if(local||!navigator.clipboard?.writeText)throw new Error('Manual copy');
  await navigator.clipboard.writeText(url);status.textContent='Link copied';
 }catch(error){
  status.textContent='Link ready to copy';shareInput.value=url;
  shareHelp.textContent=local?'This is a local preview address. After deployment, the same control supplies the public website address.':'Clipboard permission was unavailable; the link is ready for manual copying.';
  share.showModal();shareInput.focus();shareInput.select();
 }
});
})();
