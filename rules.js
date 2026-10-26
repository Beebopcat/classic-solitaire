export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
export const red = card => card.suit === 'diamonds' || card.suit === 'hearts';
export const clone = value => JSON.parse(JSON.stringify(value));
export const name = card => `${({1:'Ace',11:'Jack',12:'Queen',13:'King'})[card.rank] || card.rank} of ${card.suit}`;
export function deck() {
  return SUITS.flatMap(suit => Array.from({length:13}, (_,i) => ({id:`${suit}-${i+1}`,suit,rank:i+1,up:false})));
}
export function newGame(drawCount=1, random=Math.random) {
  const stock=deck();
  for(let i=stock.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[stock[i],stock[j]]=[stock[j],stock[i]];}
  const tableau=Array.from({length:7},()=>[]);
  for(let c=0;c<7;c++)for(let i=0;i<=c;i++){const card=stock.pop();card.up=i===c;tableau[c].push(card);}
  return {version:1,drawCount:drawCount===3?3:1,stock,waste:[],foundations:SUITS.map(()=>[]),tableau,moves:0,won:false};
}
export function validState(s) {
  if(!s||s.version!==1||![1,3].includes(s.drawCount)||!Array.isArray(s.stock)||!Array.isArray(s.waste)||!Array.isArray(s.tableau)||s.tableau.length!==7||!Array.isArray(s.foundations)||s.foundations.length!==4||!Number.isSafeInteger(s.moves)||s.moves<0)return false;
  const piles=[s.stock,s.waste,...s.tableau,...s.foundations];if(piles.some(p=>!Array.isArray(p)))return false;
  const cards=piles.flat();if(cards.length!==52||new Set(cards.map(c=>c?.id)).size!==52)return false;
  if(cards.some(c=>!SUITS.includes(c.suit)||!Number.isInteger(c.rank)||c.rank<1||c.rank>13||c.id!==`${c.suit}-${c.rank}`||typeof c.up!=='boolean'))return false;
  if(s.stock.some(c=>c.up)||s.waste.some(c=>!c.up))return false;
  if(s.foundations.some((p,i)=>p.some((c,j)=>c.suit!==SUITS[i]||c.rank!==j+1||!c.up)))return false;
  for(const p of s.tableau){let seen=false;for(let i=0;i<p.length;i++){if(p[i].up){if(seen&&(p[i-1].rank!==p[i].rank+1||red(p[i-1])===red(p[i])))return false;seen=true;}else if(seen)return false;}if(p.length&&!p.at(-1).up)return false;}
  return s.won===s.foundations.every(p=>p.length===13);
}
export function cardsAt(s,from) {
  if(!from)return [];
  if(from.pile==='waste')return s.waste.length?[s.waste.at(-1)]:[];
  if(from.pile==='foundation')return s.foundations[from.index]?.length?[s.foundations[from.index].at(-1)]:[];
  if(from.pile==='tableau'){
    const pile=s.tableau[from.index];if(!pile||!Number.isInteger(from.start)||from.start<0||from.start>=pile.length)return [];
    const cards=pile.slice(from.start);if(cards.some(c=>!c.up))return [];
    return cards.every((c,i)=>i===0||(cards[i-1].rank===c.rank+1&&red(cards[i-1])!==red(c)))?cards:[];
  }
  return [];
}
export function canMove(s,from,to) {
  if(s.won||!to||!Number.isInteger(to.index)||from?.pile===to.pile&&from.index===to.index)return false;
  const cards=cardsAt(s,from);if(!cards.length)return false;const first=cards[0];
  if(to.pile==='foundation')return cards.length===1&&SUITS[to.index]===first.suit&&s.foundations[to.index].length+1===first.rank;
  if(to.pile==='tableau'){
    const dest=s.tableau[to.index];if(!dest)return false;
    return dest.length?dest.at(-1).up&&dest.at(-1).rank===first.rank+1&&red(dest.at(-1))!==red(first):first.rank===13;
  }
  return false;
}
export function move(s,from,to) {
  if(!canMove(s,from,to))return null;
  const next=clone(s);let cards;
  if(from.pile==='tableau'){cards=next.tableau[from.index].splice(from.start);const top=next.tableau[from.index].at(-1);if(top)top.up=true;}
  else if(from.pile==='waste')cards=[next.waste.pop()];
  else cards=[next.foundations[from.index].pop()];
  (to.pile==='tableau'?next.tableau:next.foundations)[to.index].push(...cards);
  next.moves++;next.won=next.foundations.every(p=>p.length===13);return next;
}
export function draw(s) {
  if(s.won||(!s.stock.length&&!s.waste.length))return null;const next=clone(s);
  if(next.stock.length){for(let n=0;n<next.drawCount&&next.stock.length;n++){const card=next.stock.pop();card.up=true;next.waste.push(card);}}
  else next.stock=next.waste.splice(0).reverse().map(c=>({...c,up:false}));
  next.moves++;return next;
}
export function legalMoves(s) {
  const sources=[];if(s.waste.length)sources.push({pile:'waste'});
  s.tableau.forEach((p,index)=>p.forEach((c,start)=>{if(c.up)sources.push({pile:'tableau',index,start});}));
  s.foundations.forEach((p,index)=>{if(p.length)sources.push({pile:'foundation',index});});
  const targets=[...SUITS.map((_,index)=>({pile:'foundation',index})),...s.tableau.map((_,index)=>({pile:'tableau',index}))];
  return sources.flatMap(from=>targets.filter(to=>canMove(s,from,to)).map(to=>({from,to})));
}
export function hint(s) {
  const moves=legalMoves(s);return moves.find(m=>m.to.pile==='foundation')||moves.find(m=>m.from.pile==='tableau'&&m.from.start>0&&!s.tableau[m.from.index][m.from.start-1].up)||moves.find(m=>m.from.pile==='waste')||moves.find(m=>m.from.pile==='tableau'&&!(m.from.start===0&&s.tableau[m.to.index]?.length===0))||null;
}
export const canFinish = s => !s.won&&s.stock.length===0&&s.waste.length<=1&&s.tableau.every(p=>p.every(c=>c.up));
export function finish(s) {
  if(!canFinish(s))return null;let result=clone(s);
  for(let i=0;i<52&&!result.won;i++){const m=legalMoves(result).find(m=>m.to.pile==='foundation');if(!m)return null;result=move(result,m.from,m.to);}
  return result.won?result:null;
}
