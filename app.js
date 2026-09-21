let pantheon = null;
let selected = [];
const $ = id => document.getElementById(id);
const bonusLabel = ([id,value]) => {const stat = STATS.find(s => s.id === id);return `+${value}${stat.unit} ${stat.label}`;};

function cardMarkup(item,index,summary=false){
  const theme = pantheon || item;
  const card = `<${summary?'article':'button type="button"'} class="card${summary?' summary':''}" style="--accent:${theme.accent};--tone:${theme.tone}" ${summary?'':`data-choice="${index}" aria-label="Choose ${item.name}"`}>
    <div class="card-visual">${item.image?`<img src="${item.image}" alt="" width="800" height="1600">`:`<span class="card-index">0${index+1}</span><span class="ornament"></span><span class="card-art">${svg(item.icon)}</span><span class="visual-star">✦</span>`}</div>
    <div class="card-body"><p class="card-kicker">${item.realm || item.title}</p><h3>${item.name}</h3>${item.role?`<p class="god-role">${item.role}</p>`:''}
    ${item.active?'':item.stats?`<div class="bonuses">${Object.entries(item.stats).map(entry=>`<span class="bonus">${bonusLabel(entry)}</span>`).join('')}</div>`:`<p class="card-description">${item.description}</p>`}
    ${item.stats?`<div class="card-action"><span>${summary?'Selected':'Choose god'}</span><span aria-hidden="true">${summary?'✓':'↗'}</span></div>`:''}</div>
  </${summary?'article':'button'}>`;
  return item.active ? `<div class="card-option">${card}<button type="button" class="ability-info" data-info="${index}" aria-label="View ${item.name}'s abilities and 24 hour cooldown">Abilities · 24h CD</button></div>` : card;
}

function showAbilities(choice) {
  $('ability-title').textContent = choice.name;
  $('ability-role').textContent = choice.role;
  $('ability-active-name').textContent = choice.active.name;
  $('ability-cooldown').textContent = `${choice.active.cooldownHours}h cooldown`;
  $('ability-active-description').textContent = choice.active.description;
  $('ability-passive-name').textContent = choice.passive.name;
  $('ability-passive-description').textContent = choice.passive.description;
  $('ability-dialog').showModal();
}

function render(focus=false){
  const count = selected.length;
  const complete = count === 3;
  const hasBlessings = Boolean(pantheon?.rounds?.some(round => round.some(choice => choice.active)));
  $('slots').innerHTML = [0,1,2].map(index => {
    const choice = selected[index];
    const slotArt = choice?.image ? `<img class="slot-portrait" src="${choice.image}" alt="">` : choice ? svg(choice.icon) : ['I','II','III'][index];
    return `<div class="slot${choice?' filled':''}"><button type="button" class="slot-circle ${choice?'filled portrait':pantheon && index === count?'active':''}" ${choice?`data-edit="${index}" aria-label="Change ${choice.name}, selection ${index+1}"`:'disabled'} style="${pantheon?`--accent:${pantheon.accent};--tone:${pantheon.tone}`:''}">${slotArt}${choice?`<span class="slot-number">${index+1}</span>`:''}</button><span class="slot-label">${choice?choice.name:['First blessing','Second blessing','Third blessing'][index]}</span></div>`;
  }).join('');
  $('step-label').textContent = complete?'YOUR ASSEMBLY IS COMPLETE':pantheon?`${pantheon.name.toUpperCase()} PANTHEON · BLESSING ${count+1}`:'THE FIRST STEP';
  $('choice-title').textContent = complete?'Your divine assembly':pantheon?['Choose your first god','Choose your second god','Choose your final god'][count]:'Choose your pantheon';
  $('choice-description').textContent = complete?'Three blessings, united. Your build is ready.':pantheon?'Choose a blessing to add to your build.':'Three ancient worlds. One divine allegiance.';
  $('step-counter').innerHTML = `${String(complete?3:pantheon?count+1:0).padStart(2,'0')} <span>/ 03</span>`;
  const choices = complete?selected:pantheon?pantheon.rounds[count]:PANTHEONS;
  $('cards').classList.toggle('two-cards',choices.length === 2);
  $('cards').innerHTML = choices.map((item,index)=>cardMarkup(item,index,complete)).join('');
  $('back').hidden = !pantheon;
  $('selection-hint').textContent = complete?'Click a filled circle to revise your choices.':hasBlessings?'Tap a banner to choose. View abilities for details.':pantheon?'Each blessing adds to your total stats.':'Your pantheon determines the gods you can choose.';
  $('pantheon-name').textContent = pantheon?`${pantheon.name} pantheon`:'Not yet chosen';
  $('pantheon-symbol').innerHTML = pantheon?svg(pantheon.icon):'◇';
  const totals = Object.fromEntries(STATS.map(stat=>[stat.id,0]));
  selected.forEach(choice=>Object.entries(choice.stats).forEach(([id,value])=>totals[id]+=value));
  $('stats-list').classList.toggle('blessing-list', hasBlessings);
  $('stats-list').classList.toggle('is-empty', selected.length === 0);
  document.querySelector('.stats-panel').classList.toggle('has-abilities', hasBlessings);
  const statsDescription = document.querySelector('.stats-description');
  statsDescription.hidden = !selected.length;
  statsDescription.textContent = selected.length ? 'Passive effects gained. Active city abilities have a 24h cooldown.' : '';
  document.querySelector('.page-footer > span').textContent = hasBlessings ? 'Active abilities · 24h cooldown' : 'Divine ability testing';
  $('stats-list').innerHTML = !pantheon || !selected.length ? '' : hasBlessings
    ? selected.map((choice,index)=>`<button type="button" class="selected-blessing" data-selected-info="${index}" aria-label="View ${choice.name}'s abilities"><strong>${choice.name}</strong><span class="god-role">${choice.role}</span><span>${choice.passive.summary}</span><small>${choice.active.name} · 24h CD ↗</small></button>`).join('')
    : STATS.map(stat=>`<div class="stat-row"><span class="stat-name"><span class="stat-icon" aria-hidden="true">${stat.icon}</span>${stat.label}</span><strong class="stat-value${totals[stat.id]?' gained':''}">+${totals[stat.id]}${stat.unit}</strong></div>`).join('');
  $('god-count').innerHTML = `${count} <span>/ 3</span>`;
  $('progress-fill').style.width = `${count/3*100}%`;
  $('status-note').innerHTML = `<span aria-hidden="true">${complete?'✓':'✧'}</span><p>${complete?'Your assembly is complete.<br>Every blessing is now active.':pantheon?`${3-count} blessing${count===2?'':'s'} still await${count===2?'s':''} you.<br>Choose a god to gain their power.`:'Your story is unwritten.<br>Choose a pantheon to begin.'}</p>`;
  if(focus) $('choice-title').focus({preventScroll:true});
}

$('cards').addEventListener('click',event=>{
  const info = event.target.closest('[data-info]');
  if(info) {
    const choices = selected.length === 3 ? selected : pantheon.rounds[selected.length];
    showAbilities(choices[Number(info.dataset.info)]);
    return;
  }
  const button = event.target.closest('[data-choice]');
  if(!button) return;
  const index = Number(button.dataset.choice);
  if(!pantheon){pantheon=PANTHEONS[index];$('announcement').textContent=`${pantheon.name} pantheon selected. Choose your first god.`;}
  else{const choice=pantheon.rounds[selected.length][index];selected.push(choice);$('announcement').textContent=`${choice.name} selected. ${selected.length} of 3 gods chosen.`;}
  render(true);
});
$('slots').addEventListener('click',event=>{
  const button=event.target.closest('[data-edit]');
  if(!button) return;
  selected=selected.slice(0,Number(button.dataset.edit));
  $('announcement').textContent='This blessing and later blessings have been cleared. Choose again.';
  render(true);
});
$('back').addEventListener('click',()=>{if(selected.length)selected.pop();else pantheon=null;render(true);});
$('reset').addEventListener('click',()=>{pantheon=null;selected=[];$('announcement').textContent='Build reset. Choose your pantheon.';render(true);});
$('stats-list').addEventListener('click',event=>{
  const button = event.target.closest('[data-selected-info]');
  if(button) showAbilities(selected[Number(button.dataset.selectedInfo)]);
});
$('ability-close').addEventListener('click',()=>$('ability-dialog').close());
render();
