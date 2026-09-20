// Greek abilities use the supplied game rules. Other pantheons remain samples.
// Each pantheon has three rounds with three choices per round.
const icons = {
  temple: '<path d="M12 33 50 12l38 21M18 37h64M22 74h56M15 83h70M29 41v28m14-28v28m14-28v28m14-28v28"/>',
  nordic: '<path d="M50 12v76M27 27l46 46M73 27 27 73M27 27v23m46-23v23M50 12 36 27m14-15 14 15M50 88 36 73m14 15 14-15"/>',
  egypt: '<ellipse cx="50" cy="28" rx="14" ry="18"/><path d="M50 46v43M25 57h50M39 89h22"/>',
  bolt: '<path d="m57 9-33 46h25l-7 36 35-49H52z"/>',
  trident: '<path d="M50 14v76M27 29v15a23 23 0 0 0 46 0V29M18 39l9-13 9 13M64 39l9-13 9 13M41 26l9-14 9 14"/>',
  owl: '<path d="M25 24 19 13l24 10h14l24-10-6 11v37L50 87 25 61z"/><circle cx="37" cy="42" r="12"/><circle cx="63" cy="42" r="12"/><path d="m44 60 6 9 6-9M37 41v2m26-2v2"/>',
  sun: '<circle cx="50" cy="50" r="20"/><path d="M50 8v12m0 60v12M8 50h12m60 0h12M20 20l9 9m42 42 9 9M20 80l9-9m42-42 9-9"/>',
  moon: '<path d="M68 16a36 36 0 1 0 16 54A34 34 0 0 1 68 16Z"/><path d="m73 34 3 7 8 3-8 3-3 8-3-8-8-3 8-3z"/>',
  sword: '<path d="m66 12 21 1-1 21-42 42-20-20zM17 49l34 34M30 70 14 86m-5-5 10 10"/>',
  wing: '<path d="M18 76c42 2 62-24 65-61-17 3-39 13-52 29L18 76Zm0 0 42-40M36 58l28-1M47 46l25-3"/>',
  hammer: '<path d="m24 17 53 13-8 28-53-13zM41 51 29 85l13 4 12-35M21 28l52 13"/>',
  flame: '<path d="M53 10c8 25 24 28 24 49a27 27 0 0 1-54 0c0-15 11-26 19-34-2 18 5 22 5 22s13-9 6-37Z"/><path d="M50 57c-16 17-9 29 2 29s15-15-2-29Z"/>',
  leaf: '<path d="M80 16C37 12 14 37 24 68c29 20 58-11 56-52ZM19 85l46-49M38 64V43m0 21h20"/>',
  eye: '<path d="M10 45s18-22 40-22 40 22 40 22-18 22-40 22S10 45 10 45Z"/><circle cx="50" cy="45" r="13"/><path d="M50 67v20M33 63 21 78m45-15 13 15"/>',
  scales: '<path d="M50 16v68M34 86h32M20 32h60M25 32 12 59h26L25 32Zm50 0L62 59h26L75 32ZM12 59a13 13 0 0 0 26 0m24 0a13 13 0 0 0 26 0"/>',
};
const svg = name => `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.sun}</svg>`;
const ACTIVE_COOLDOWN_HOURS = 24;
const blessing = (role, activeName, activeDescription, passiveName, passiveDescription, passiveSummary) => ({
  role,
  active: { name: activeName, description: activeDescription, cooldownHours: ACTIVE_COOLDOWN_HOURS },
  passive: { name: passiveName, description: passiveDescription, summary: passiveSummary }
});
const GREEK_BLESSINGS = {
  Zeus: blessing('Offensive power', 'Lightning Bolt', 'Strikes an enemy city, disabling one random military building for 3 hours and reducing wall defense by 10%.', 'Supreme Authority', 'Your attacking armies gain +5% attack.', '+5% attacking army attack'),
  Hades: blessing('Defense and attrition', 'Walls of Erebus', 'Surrounds a friendly city for 6 hours. Enemy attacks suffer −15% attack and cannot see the defending army.', 'Lord of the Dead', '5% of units lost while defending return after battle.', '5% of defensive losses return'),
  Poseidon: blessing('Economy and disruption', 'Plenty', 'Increases all resource production in a friendly city by 25% for 8 hours.', 'Master of the Depths', 'Warehouses have +10% capacity.', '+10% warehouse capacity'),
  Dionysus: blessing('Chaos and sabotage', 'Festival of Madness', 'Enemy construction, recruitment and research queues operate 25% slower for 6 hours.', 'Endless Celebration', '25% effectivity and duration for festivals.', '25% festival effectivity & duration'),
  Hera: blessing('City protection', 'Divine Sanctuary', 'Protects a friendly city from hostile divine abilities and conquest for 4 hours. Normal attacks can still occur.', 'Queen’s Protection', 'Defensive units train 10% faster.', '10% faster defensive unit training'),
  Hermes: blessing('Speed and trade', 'Divine Passage', 'One friendly army travels 40% faster and cannot be detected until it reaches half of its journey.', 'Patron of Merchants', 'Traders carry 20% more resources and move 15% faster.', '+20% trader capacity · +15% trader speed'),
  Aphrodite: blessing('Manipulation', 'Irresistible Charm', 'Reduces the attack and defense of all enemy reinforcements in the targeted city by 15% for 6 hours.', 'Divine Devotion', 'Supporting units stationed in your cities consume 20% less food.', '−20% food for supporting units'),
  Athena: blessing('Strategy and preparation', 'Battle Foresight', 'Reveals every incoming army targeting a friendly city, including exact units and arrival times, for 8 hours.', 'Strategic Wisdom', 'Research is 10% faster and defensive units gain +5% defense.', '10% faster research · +5% defensive unit defense'),
  Ares: blessing('Pure warfare', 'Bloodlust', 'One outgoing army gains +20% attack, but survivors suffer 10% additional casualties after battle.', 'God of War', 'Offensive units train 10% faster.', '10% faster offensive unit training')
};
const god = (name, title, icon, stats, image) => ({ name, title, icon, stats: GREEK_BLESSINGS[name] ? {} : stats, image, ...GREEK_BLESSINGS[name] });
const PANTHEONS = [
  { id:'greek', name:'Greek', realm:'THE OLYMPIANS', description:'Ascend Olympus. Command the power of the immortals.', image:'assets/greek-banner.png', icon:'temple', accent:'#d5b97b', tone:'#2a281c', rounds:[
    [god('Zeus','Lord of the skies','bolt',{},'assets/zeus.png'),god('Hades','Lord of the underworld','flame',{},'assets/hades.png'),god('Poseidon','Ruler of the seas','trident',{},'assets/poseidon.png')],
    [god('Athena','Keeper of wisdom','owl',{},'assets/athena.png'),god('Aphrodite','Goddess of love','leaf',{},'assets/aphrodite.png'),god('Ares','The heart of war','sword',{},'assets/ares.png')],
    [god('Dionysus','Lord of revelry','leaf',{},'assets/dionysus.png'),god('Hermes','Messenger of the gods','wing',{},'assets/hermes.png'),god('Hera','Queen of Olympus','temple',{},'assets/hera.png')]
  ]},
  { id:'nordic', name:'Nordic', realm:'THE AESIR', description:'Answer Asgard. Forge your fate beneath the world tree.', image:'assets/nordic-banner.png', icon:'nordic', accent:'#aabdd3', tone:'#202832', rounds:[
    [god('Odin','The all-father','eye',{attack:10,critical:5}),god('Thor','Bringer of thunder','hammer',{attack:15,defense:5}),god('Freyja','Lady of the chosen','wing',{health:60,speed:3})],
    [god('Loki','The shapeshifter','flame',{speed:7,critical:5}),god('Tyr','The fearless hand','sword',{attack:8,defense:10}),god('Freyr','Lord of prosperity','leaf',{health:50,defense:6})],
    [god('Heimdall','Guardian of the bridge','eye',{defense:15,health:30}),god('Baldr','The shining god','sun',{health:70,speed:4}),god('Skadi','Huntress of winter','moon',{speed:6,critical:6})]
  ]},
  { id:'egyptian', name:'Egyptian', realm:'THE ETERNAL ONES', description:'Follow the Nile. Awaken the ancient power of eternity.', image:'assets/egyptian-banner.png', icon:'egypt', accent:'#92b9ac', tone:'#1b2e29', rounds:[
    [god('Ra','The sun sovereign','sun',{attack:12,critical:3}),god('Isis','Mistress of magic','egypt',{health:80,defense:5}),god('Anubis','Guide of souls','scales',{defense:10,speed:4})],
    [god('Horus','The watchful sky','eye',{attack:10,speed:5}),god('Bastet','The graceful guardian','moon',{speed:8,critical:4}),god('Thoth','Keeper of knowledge','owl',{defense:8,critical:5})],
    [god('Osiris','Lord of renewal','leaf',{health:90,defense:5}),god('Sekhmet','The fierce protector','flame',{attack:16,critical:4}),god('Set','Lord of storms','bolt',{attack:12,speed:6})]
  ]}
];
const STATS = [
  {id:'attack',label:'Attack',icon:'⚔',unit:''},
  {id:'defense',label:'Defense',icon:'◇',unit:''},
  {id:'health',label:'Health',icon:'♡',unit:''},
  {id:'speed',label:'Speed',icon:'↗',unit:'%'},
  {id:'critical',label:'Critical chance',icon:'✧',unit:'%'}
];
