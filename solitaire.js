import {iconMarkup} from './interface-icons.mjs';
import {SUITS,red,clone,name,newGame,validState,cardsAt,canMove,move,draw,hint,canFinish,finish} from './rules.js';
const KEY='casey.top-secret.solitaire.v1';
const symbols={clubs:iconMarkup('game-club'),diamonds:iconMarkup('game-diamond'),hearts:iconMarkup('game-heart'),spades:iconMarkup('game-spade')};
const $=id=>document.getElementById(id);
let state=newGame(),history=[],selected=null,hinted=null,elapsed=0,clockBase=Date.now(),saveOK=true,resumed=false;
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&validState(saved.state)){state=saved.state;history=Array.isArray(saved.history)?saved.history.filter(x=>validState(x.state)).slice(-120):[];elapsed=Math.max(0,Number(saved.elapsed)||0);resumed=true;}}catch{}
const seconds=()=>elapsed+(state.won?0:Math.floor((Date.now()-clockBase)/1000));
const clock=()=>{const t=seconds();return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;};
const status=text=>{$('status').textContent=text;};
function save(){try{localStorage.setItem(KEY,JSON.stringify({state,history:history.slice(-120),elapsed:seconds()}));}catch{saveOK=false;$('save-note').textContent='Browser saving is unavailable. Keep this page open to continue this deal.';}}
function origin(card,pile,index,start){return pile==='waste'?{pile}:pile==='foundation'?{pile,index}:{pile,index,start};}
function positionData(from){return `data-pile="${from.pile}"${from.index!==undefined?` data-index="${from.index}"`:''}${from.start!==undefined?` data-start="${from.start}"`:''}`;}
function cardHTML(card,from,top=0,offset=0){
 const active=selected&&selected.pile===from.pile&&selected.index===from.index&&(from.pile!=='tableau'||from.start>=selected.start);
 const rank=({1:'A',11:'J',12:'Q',13:'K'})[card.rank]||card.rank;
 const key=`${from.pile}-${from.index??0}-${from.start??0}`;
 if(!card.up)return `<button class="card back" style="top:${top}px" disabled aria-label="Face-down card"></button>`;
 return `<button class="card ${red(card)?'red':''} ${active?'is-selected':''}" style="top:${top}px;left:${offset}px" ${positionData(from)} data-key="${key}" draggable="true" aria-label="${name(card)}${from.pile==='tableau'?`, column ${from.index+1}`:''}" aria-pressed="${!!active}"><span class="rank">${rank}</span><span class="small-suit">${symbols[card.suit]}</span><span class="center-suit" aria-hidden="true">${symbols[card.suit]}</span><span class="corner-bottom" aria-hidden="true"><span class="rank">${rank}</span><span class="small-suit">${symbols[card.suit]}</span></span></button>`;
}
function render(){
 const focused=document.activeElement?.dataset?.key;
 const stockLabel=state.stock.length?`Draw ${state.drawCount} card${state.drawCount===3?'s':''}; ${state.stock.length} remain`:state.waste.length?'Recycle the waste into the stock':'Stock empty';
 let top=`<div class="pile"><button id="stock" class="slot stock ${state.stock.length?'back':''}" data-key="stock" aria-label="${stockLabel}" ${state.won||!state.stock.length&&!state.waste.length?'disabled':''}><span aria-hidden="true">${iconMarkup(state.stock.length?'cards':'refresh')}</span><span class="stock-count">${state.stock.length||'Recycle'}</span></button><span class="pile-label">STOCK</span></div><div class="pile"><div class="slot" aria-hidden="true"></div>`;
 if(state.waste.length)top+=cardHTML(state.waste.at(-1),{pile:'waste'});
 top+=`<span class="pile-label">WASTE · ${state.waste.length}</span></div><div aria-hidden="true"></div>`;
 top+=state.foundations.map((pile,index)=>`<div class="pile ${hinted?.pile==='foundation'&&hinted.index===index?'is-target':''}" data-dest="foundation" data-index="${index}"><button class="slot" data-dest="foundation" data-index="${index}" data-key="foundation-slot-${index}" aria-label="${SUITS[index]} foundation${selected?', move selected card here':''}"><span aria-hidden="true">${symbols[SUITS[index]]}</span></button>${pile.length?cardHTML(pile.at(-1),{pile:'foundation',index}):''}</div>`).join('');
 $('top-row').innerHTML=top;
 const style=getComputedStyle(document.documentElement),step=parseInt(style.getPropertyValue('--step')),down=parseInt(style.getPropertyValue('--down-step'));
 $('tableau').innerHTML=state.tableau.map((pile,index)=>{let y=0;const cards=pile.map((card,start)=>{const html=cardHTML(card,{pile:'tableau',index,start},y);if(start<pile.length-1)y+=card.up?step:down;return html;}).join('');return `<div class="pile column ${hinted?.pile==='tableau'&&hinted.index===index?'is-target':''}" data-dest="tableau" data-index="${index}" style="height:calc(var(--card-h) + ${y}px)" role="group" aria-label="Column ${index+1}"><button class="slot" data-dest="tableau" data-index="${index}" data-key="tableau-slot-${index}" aria-label="Empty column ${index+1}, King required" ${pile.length?'tabindex="-1" aria-hidden="true"':''}><span aria-hidden="true">K</span></button>${cards}</div>`;}).join('');
 $('mode').textContent=`Draw ${state.drawCount}`;$('moves').textContent=`${state.moves} move${state.moves===1?'':'s'}`;$('timer').textContent=clock();$('undo').disabled=history.length===0;$('hint').disabled=state.won;$('finish').hidden=!canFinish(state);
 if(focused)document.querySelector(`[data-key="${CSS.escape(focused)}"]`)?.focus({preventScroll:true});
}
function commit(next,message){
 if(!next)return false;const time=seconds();history.push({state:clone(state),elapsed:time});if(history.length>120)history.shift();state=next;elapsed=time;clockBase=Date.now();selected=hinted=null;save();render();status(message);
 if(state.won){$('win-detail').textContent=`All 52 cards home in ${state.moves} moves and ${clock()}.`;$('win-dialog').showModal();}
 return true;
}
function decode(el){return {pile:el.dataset.pile,index:el.dataset.index===undefined?undefined:Number(el.dataset.index),start:el.dataset.start===undefined?undefined:Number(el.dataset.start)};}
function target(el){const dest=el.closest('[data-dest]');return dest?{pile:dest.dataset.dest,index:Number(dest.dataset.index)}:null;}
function destinationText(to){return to.pile==='foundation'?`${SUITS[to.index]} foundation`:`column ${to.index+1}`;}
function tryMove(from,to){const cards=cardsAt(state,from);return commit(move(state,from,to),`Moved ${cards.length>1?cards.length+' cards starting with ':''}${cards[0]?name(cards[0]):''} to ${to?destinationText(to):'destination'}.`);}
document.querySelector('.table').addEventListener('click',event=>{
 const stock=event.target.closest('#stock');if(stock){const recycling=!state.stock.length;commit(draw(state),recycling?'Waste recycled.':`Drew ${Math.min(state.stock.length,state.drawCount)} card${Math.min(state.stock.length,state.drawCount)===1?'':'s'}.`);return;}
 const card=event.target.closest('.card[data-pile]'),to=target(event.target);
 if(selected&&to&&canMove(state,selected,to)){tryMove(selected,to);return;}
 if(card){const from=decode(card);if(selected&&JSON.stringify(selected)===JSON.stringify(from)){selected=hinted=null;status('Selection cleared.');}else{selected=from;hinted=null;const cards=cardsAt(state,from);status(`${cards.length>1?cards.length+' cards selected, starting with ':''}${name(cards[0])}. Choose a destination.`);}render();}
 else if(to&&selected)status(to.pile==='foundation'?'Foundations build Ace to King in the same suit.':'Columns build downward in alternating colors. Only a King can fill an empty column.');
});
document.querySelector('.table').addEventListener('dblclick',event=>{const el=event.target.closest('.card[data-pile]');if(!el)return;const from=decode(el),cards=cardsAt(state,from);if(cards.length===1)tryMove(from,{pile:'foundation',index:SUITS.indexOf(cards[0].suit)});});
document.querySelector('.table').addEventListener('dragstart',event=>{const card=event.target.closest('.card[data-pile]');if(!card)return;selected=decode(card);event.dataTransfer.setData('application/x-solitaire',JSON.stringify(selected));event.dataTransfer.effectAllowed='move';});
document.querySelector('.table').addEventListener('dragover',event=>{const to=target(event.target);if(to&&canMove(state,selected,to)){event.preventDefault();event.dataTransfer.dropEffect='move';}});
document.querySelector('.table').addEventListener('drop',event=>{event.preventDefault();const to=target(event.target);if(!to)return;try{const from=JSON.parse(event.dataTransfer.getData('application/x-solitaire'));if(!tryMove(from,to))status('That move is not allowed.');}catch{status('Choose a card on this table first.');}});
document.querySelector('.table').addEventListener('dragend',()=>{selected=hinted=null;render();});
function undo(){const old=history.pop();if(!old)return;state=old.state;elapsed=old.elapsed;clockBase=Date.now();selected=hinted=null;if($('win-dialog').open)$('win-dialog').close();save();render();status('Move undone.');}
$('undo').addEventListener('click',undo);
$('hint').addEventListener('click',()=>{const suggestion=hint(state);if(suggestion){selected=suggestion.from;hinted=suggestion.to;status(`Try ${name(cardsAt(state,selected)[0])} to ${destinationText(hinted)}.`);render();}else if(state.stock.length)status('Draw from the stock for more options.');else if(state.waste.length)status('Recycle the waste to look through the stock again. If a full pass reveals no move, try Undo or a new deal.');else status('No legal move remains. Try Undo or deal a new game.');});
$('finish').addEventListener('click',()=>commit(finish(state),'All cards are home. You win!'));
function askNew(){$('draw-count').value=String(state.drawCount);$('new-dialog').showModal();}
$('new-game').addEventListener('click',askNew);
$('new-dialog').addEventListener('close',()=>{if($('new-dialog').returnValue!=='deal')return;state=newGame(Number($('draw-count').value));history=[];elapsed=0;clockBase=Date.now();selected=hinted=null;save();render();status('A new deal. Good luck!');});
$('help').addEventListener('click',()=>$('help-dialog').showModal());
$('win-dialog').addEventListener('close',()=>{if($('win-dialog').returnValue==='again')askNew();});
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]'))return;if(event.key==='Escape'){selected=hinted=null;render();status('Selection cleared.');}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();undo();}});
window.addEventListener('resize',render);window.addEventListener('pagehide',save);let ticks=0;setInterval(()=>{$('timer').textContent=clock();if(++ticks%15===0&&saveOK)save();},1000);
render();if(resumed)status(state.won?'Your completed game is saved. Deal a new game whenever you like.':'Welcome back. Your saved deal is ready.');
