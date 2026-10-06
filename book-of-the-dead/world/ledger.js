/* Book of the Dead World: the evidence ledger.
   Every feature the model shows is listed here with the statement that justifies it.
   Kinds of statement, kept apart on purpose:
     source     Budge's 1895 translation of the Papyrus of Ani says it (cite b: study block id, opens ../#b=ID)
     scene      Budge's 1895 description of a vignette in the papyrus says it (cite bp: Budge plate entry and paragraph)
     editorial  our reading of the text (arrangement, sequence, identification)
     invention  ours, so that the model can be built at all (spacing, scale, material, colour); always labelled
     gap        the world needs it and the Papyrus of Ani does not supply it; candidates go to the sourcing workstream
   Unit of the model: the royal cubit (about 0.523 m), because the text's own dimensions are in cubits.
   Dimensions not in the text are marked invention with the basis stated. */
window.BOD_LEDGER = {
  version: '0.1.0', date: '2026-10-06',
  corpus: 'E. A. Wallis Budge, The Book of the Dead: The Papyrus of Ani (London, 1895), as transcribed in the study (budge.js, text.js).',
  unit: { name: 'royal cubit', metres: 0.523, basis: 'the text measures in cubits: in Spell 110 the river is one thousand cubits long, the wheat three cubits, the seat of the shining ones seven cubits' },
  kinds: {
    source: 'Budge 1895, translation of the Papyrus of Ani',
    scene: 'Budge 1895, description of a vignette in the papyrus',
    editorial: 'our reading of the text',
    invention: 'ours, so the model can be built; labelled',
    gap: 'not in the Papyrus of Ani; sourcing workstream'
  },
  places: [
  { id:'thebes', name:'Thebes, the land of the living', route:1,
    summary:'The roll was written for a living man. The only part of the land of the living the papyrus shows is the day of burial: the procession from the house to the tomb in the western cliffs.',
    features:[
      { id:'procession', what:'The funeral procession: the mummy in a shrine on a boat with runners, drawn by oxen', kind:'scene', cite:[{bp:'5-6:2'},{b:'5-2'},{b:'5-3'}], model:'A boat-shrine on a sledge drawn by two oxen, moving west along the causeway.' },
      { id:'mourners', what:'Eight mourners follow; the Sem priest in a panther skin burns incense and pours a libation before the boat; Tutu kneels lamenting', kind:'scene', cite:[{bp:'5-6:2'},{b:'5-1'},{b:'6-2'}], model:'Silhouette figures in file behind the sledge; one kneeling at the boat.' },
      { id:'ark', what:'A sepulchral ark surmounted by Anubis follows, drawn by men', kind:'scene', cite:[{bp:'5-6:2'},{b:'5-1'}], model:'A second, smaller sledge with a jackal on its roof.' },
      { id:'goods', what:'Attendants carry boxes of flowers and vases on yokes; a cow with her calf; chairs of painted wood; a haunch for the funeral feast', kind:'scene', cite:[{bp:'5-6:3'},{b:'6-1'},{b:'6-3'}], model:'Bearers with yokes, a cow and calf, chairs, at the tail of the procession.' },
      { id:'tomb-door', what:'Before the door of the tomb the mummy stands upright, embraced by Anubis; two priests perform the last rites', kind:'scene', cite:[{bp:'5-6:3'},{b:'6-4'}], model:'The procession ends at a doorway cut into the cliff.' },
      { id:'offices', what:'Ani was royal scribe, accountant of the divine offerings of all the gods, overseer of the granaries of the lords of Abydos; Tutu a chantress of Amun', kind:'source', cite:[{b:'1-3'},{b:'19-4'}], model:'Caption only; no house or granary is drawn, because none is described.' },
      { id:'town', what:'The town itself: houses, the temple of Amun, the granaries', kind:'gap', model:'Not drawn. The papyrus describes no building of the living. This stays empty ground east of the causeway, labelled.' }
    ]},
  { id:'west', name:'The Western horizon (Manu)', route:2,
    summary:'Where the sun sets and the dead go in. The text names the mountain Manu and shows Hathor as a cow stepping out of the funeral mountain, with a tomb at its foot.',
    features:[
      { id:'manu', what:'Ra sets in the horizon of Manu; the land of Manu receives him', kind:'source', cite:[{b:'1-3'},{b:'19-4'}], model:'A long cliff line on the west with a notch where the sun goes down.' },
      { id:'hathor-cow', what:'The cow Meh-urit, Hathor, looks out from the funeral mountain, wearing the menat; at the foot of the mountain is the tomb; flowering plants in the foreground', kind:'scene', cite:[{bp:'37:2'},{b:'37-4'}], model:'A cow emerging from the cliff face above the tomb door, with a menat; reeds and flowers below.' },
      { id:'hathor-hippo', what:'Hathor as a hippopotamus with disk and horns, holding the emblem of life, before tables of offerings', kind:'scene', cite:[{bp:'37:2'},{b:'37-4'}], model:'A standing hippopotamus figure beside offering tables at the cliff foot.' },
      { id:'seker-shrine', what:'A shrine wherein stands Seker-Osiris, lord of the hidden place, with white crown and feathers, sceptre, flail and crook', kind:'scene', cite:[{bp:'37:1'},{b:'37-1'}], model:'A small shrine at the mountain foot with a standing mummiform figure.' },
      { id:'ta-sert', what:'Hathor is lady of Amentet, dweller in the land of Urt, lady of Ta-sert', kind:'source', cite:[{b:'37-2'}], model:'Caption.' },
      { id:'passing-west', what:'Spell 8: passing through the West by day', kind:'source', cite:[{b:'18-5'}], model:'The route enters the mountain here.' },
      { id:'mountain-form', what:'The height and form of the western mountain', kind:'invention', model:'Cliff 60 cubits high (basis: a Theban cliff scaled to the model; no text figure).' }
    ]},
  { id:'tomb', name:'The tomb in the Western cliffs', route:3,
    summary:'The burial chamber is the one room the papyrus draws as a plan: fifteen compartments with the bier at the centre and every guardian in place.',
    features:[
      { id:'chamber-plan', what:'The mummy-chamber arranged as a plan, floor and walls laid flat, in fifteen compartments', kind:'scene', cite:[{bp:'33-34:1'},{b:'33-7'},{b:'34-1'}], model:'A rectangular chamber; the fifteen compartments become the floor and four walls (editorial unfolding).' },
      { id:'bier', what:'In the centre, under a canopy, the bier bearing the mummy; Anubis stands beside it with hands over the body', kind:'scene', cite:[{bp:'33-34:1'},{b:'34-1'}], model:'Canopy on four posts over a lion-footed bier; a jackal-headed figure standing.' },
      { id:'isis-nephthys', what:'Isis kneels at the foot of the bier, Nephthys at the head, each with a flame of fire in the compartment behind her', kind:'scene', cite:[{bp:'33-34:1'},{b:'33-7'}], model:'Two kneeling figures; two braziers behind them.' },
      { id:'tet-jackal', what:'The Tet above the bier; the jackal couchant on the tomb, with a sceptre and menats, below', kind:'scene', cite:[{bp:'33-34:1'}], model:'A djed pillar on the wall at the head end; a couchant jackal on a shrine at the foot end.' },
      { id:'four-sons', what:'The four children of Horus stand in the corners of the four adjoining compartments', kind:'scene', cite:[{bp:'33-34:1'},{b:'33-7'}], model:'Four standing figures at the four corners.' },
      { id:'two-birds', what:'In the two upper outer compartments the human-headed bird stands on a pylon, one facing the setting sun, the other the rising sun', kind:'scene', cite:[{bp:'33-34:1'},{b:'34-1'}], model:'Two ba-birds on pylon pedestals at the west and east ends.' },
      { id:'soul-shabti', what:'The Perfected Soul in the right lower compartment; a Ushabti figure in the left', kind:'scene', cite:[{bp:'33-34:1'},{b:'34-1'}], model:'A standing figure and a small mummiform figure in the two remaining corners.' },
      { id:'speeches', what:'Isis, Nephthys, the two flames, the Tet, the four sons, the two birds, the Soul and the shabti each speak', kind:'source', cite:[{b:'33-7'},{b:'34-1'}], model:'Each figure carries its speech as its evidence card.' },
      { id:'opening-mouth', what:'The Opening of the Mouth on the statue of Ani: the sem priest with the Ur-heka, the chest, the instruments Seb-ur, Tun-tet, Temanu and Pesh-en-kef', kind:'scene', cite:[{bp:'15:1'},{b:'15-1'},{b:'15-2'}], model:'At the tomb door outside: a seated statue, a priest, a chest of instruments.' },
      { id:'door-soul', what:'A doorway with the soul of Ani as a human-headed hawk by one post and the bird by the other; Ani at the doorway of the tomb with his shadow and soul', kind:'scene', cite:[{bp:'16:18'},{bp:'17:12'},{b:'17-11'},{b:'17-9'}], model:'The tomb door is where the soul goes out and returns by day.' },
      { id:'amulets', what:'The Tet of gold, the buckle of carnelian, the heart, the head-rest', kind:'source', cite:[{b:'33-3'},{b:'33-4'},{b:'33-5'},{b:'33-6'}], model:'Four small objects on the bier.' },
      { id:'chamber-size', what:'The chamber dimensions', kind:'invention', model:'12 by 8 cubits, 6 high (basis: fits the fifteen compartments as a 5 by 3 grid; no text figure).' },
      { id:'tomb-passage', what:'The passage from the cliff door down to the chamber', kind:'gap', model:'Not described in Ani. Candidates: Spells 151 and 152 in other papyri (Nu). Theban tomb plans are archaeology, not text, and would be labelled so.' }
    ]},
  { id:'rosetau', name:'Rosetau, the passages', route:4,
    summary:'The mouth of the passages of the necropolis: the text calls it the northern door of the tomb and the underworld south of Naarut-f.',
    features:[
      { id:'north-door', what:'Re-stau is the underworld on the south of Naarut-f, and it is the northern door of the tomb', kind:'source', cite:[{b:'8-7'}], model:'A doorway in the north wall of the chamber leading down.' },
      { id:'opened-way', what:'I have opened the way in Re-stau; I have made a path for him in the great valley', kind:'source', cite:[{b:'11-1'},{b:'11-5'}], model:'A descending stair that opens into a great valley (see the Arits).' },
      { id:'hidden-things', what:'The door of concealed things in Re-stau; the things which are concealed in Re-stau', kind:'source', cite:[{b:'5-4'}], model:'The passage is unlit; the evidence card carries the line.' },
      { id:'gate-vignette', what:'Re-stau, the gate of the funeral passages (Spell 17 vignette)', kind:'scene', cite:[{b:'8-3'}], model:'A gate at the foot of the stair.' },
      { id:'council', what:'The council of Rosetau (Spell 18)', kind:'source', cite:[{b:'14-4'},{b:'24-2'}], model:'See the councils.' },
      { id:'passage-form', what:'Length, slope and lining of the passages', kind:'invention', model:'A straight stair 120 cubits long falling 130 cubits (basis: none; chosen so the descent reads on screen).' }
    ]},
  { id:'sycamore', name:'The sycamore of Nut', route:5,
    summary:'A pool with a tree, where the goddess in the sycamore gives water and air.',
    features:[
      { id:'tree-pool', what:'Ani kneeling beside a pool of water where grows a sycamore tree; in the tree the goddess Nut pours water into his hands', kind:'scene', cite:[{bp:'16:11'},{b:'16-10'}], model:'A square pool, a sycamore on its bank, a goddess figure in the canopy with a vessel.' },
      { id:'speech', what:'Hail, sycamore tree of the goddess Nut! Grant thou to me of the water and the air which are in thee', kind:'source', cite:[{b:'16-11'}], model:'Evidence card.' },
      { id:'palms', what:'Ani and Tutu drink from a pool on whose borders are palm trees laden with fruit (Spell 58)', kind:'scene', cite:[{bp:'16:8'},{b:'16-8'}], model:'Date palms along the pool edge.' },
      { id:'placement', what:'Where the pool lies on the route', kind:'editorial', model:'Placed just inside the Duat, before the gates: the first relief after the descent. The text gives no position.' }
    ]},
  { id:'duat', name:'The Duat as a whole', route:6,
    summary:'The hidden land. Spell 175 describes it in Ani\'s own words to Atum: no water, no air, deep and unfathomable, black as the blackest night.',
    features:[
      { id:'no-water', what:'What manner of land is this into which I have come? It hath not water, it hath not air; it is deep unfathomable, it is black as the blackest night', kind:'source', cite:[{b:'29-3'},{b:'29-4'}], model:'The whole underworld is unlit except where the text puts light: flames, the boat of Ra, the Field.' },
      { id:'barren', what:'The place where the acacia tree groweth not, where the tree thick with leaves existeth not, and where the ground yieldeth neither herb nor grass', kind:'source', cite:[{b:'29-5'},{b:'30-1'}], model:'Bare ground on the approach to the Hall.' },
      { id:'pools', what:'The Pool of Natron and the Pool of Nitre or Salt under the hands of the god Great Green Water; the Green Lake', kind:'source', cite:[{b:'8-2'},{b:'8-7'}], model:'Two square pools near the foot of the stair; one green lake.' },
      { id:'two-lions', what:'Yesterday and Tomorrow, the two lions of the horizon', kind:'scene', cite:[{b:'7-4'}], model:'Two couchant lions flanking the route where it turns east.' },
      { id:'seh-hall', what:'Ani and Tutu play draughts in the seh hall', kind:'scene', cite:[{b:'7-1'}], model:'A small pavilion near the sycamore.' },
      { id:'amenta', what:'The beautiful Amenta, Neter-khert, Ta-sert: the names of the land', kind:'source', cite:[{b:'5-4'},{b:'2-4'}], model:'Captions.' },
      { id:'overall-plan', what:'How the places lie relative to one another', kind:'editorial', model:'Arranged along the sun\'s path: in at the West, down through the gates to the Hall, out through the Field to the East. The text gives a sequence of spells, not a map.' },
      { id:'section', what:'The land of the living is drawn as a translucent slab so the underworld shows beneath it', kind:'invention', model:'A section drawing, not a claim that the Duat is visible from above.' },
      { id:'extent', what:'The size of the Duat', kind:'invention', model:'About 5,000 cubits west to east (basis: none in Ani; chosen for the model).' },
      { id:'regions', what:'Named regions of the Duat with dimensions', kind:'gap', model:'Spells 149 (the fourteen Aats) and 150 are not in Ani. Candidates: Papyrus of Nu, Budge 1898; the Amduat\'s twelve hours with lengths in atru, Budge 1905 (a cognate text, labelled so if admitted).' }
    ]},
  { id:'arits', name:'The Seven Arits', route:7,
    summary:'Seven gateways, each held by a doorkeeper, a watcher and a herald. The papyrus names all twenty-one and describes the three seated guardians at each gate.',
    features:[
      { id:'count', what:'Seven Arits, in sequence', kind:'source', cite:[{b:'11-1'},{b:'11-3'},{b:'11-5'},{b:'11-7'},{b:'12-1'},{b:'12-3'},{b:'12-5'}], model:'Seven gates in a line along the great valley.' },
      { id:'names', what:'The name of the doorkeeper, the watcher and the herald at each Arit', kind:'source', cite:[{b:'11-1'},{b:'11-3'},{b:'11-5'},{b:'11-7'},{b:'12-1'},{b:'12-3'},{b:'12-5'}], model:'Each guardian carries its name as its label.' },
      { id:'cornice', what:'The first Arit\'s cornice is ornamented with emblems of power, life and stability', kind:'scene', cite:[{bp:'11-12:1'},{b:'11-2'}], model:'A cornice of signs on gate one; the others plain, because they are not described.' },
      { id:'guardians-1', what:'Gate 1: hare, serpent, crocodile heads; the first holds an ear of corn, the others knives', kind:'scene', cite:[{bp:'11-12:1'},{b:'11-2'}], model:'Three seated silhouettes keyed to head and implement.' },
      { id:'guardians-2', what:'Gate 2: lion, man, dog heads; each a knife', kind:'scene', cite:[{bp:'11-12:5'},{b:'11-4'}], model:'As above.' },
      { id:'guardians-3', what:'Gate 3: jackal, dog, serpent heads; corn, knife, knife', kind:'scene', cite:[{bp:'11-12:9'},{b:'11-6'}], model:'As above.' },
      { id:'guardians-4', what:'Gate 4: man, hawk, lion heads; corn, knife, knife', kind:'scene', cite:[{bp:'11-12:13'},{b:'11-8'}], model:'As above.' },
      { id:'guardians-5', what:'Gate 5: hawk, man, snake heads; each a knife', kind:'scene', cite:[{bp:'11-12:17'},{b:'12-2'}], model:'As above.' },
      { id:'guardians-6', what:'Gate 6: jackal, dog, dog heads; corn, knife, knife', kind:'scene', cite:[{bp:'11-12:21'},{b:'12-4'}], model:'As above.' },
      { id:'guardians-7', what:'Gate 7: hare, lion, man heads; knife, knife, corn', kind:'scene', cite:[{bp:'11-12:25'},{b:'12-6'}], model:'As above.' },
      { id:'coals', what:'Let me not be driven hence nor from the wall of burning coals', kind:'source', cite:[{b:'11-1'}], model:'A low wall of embers along the valley side at gate one.' },
      { id:'valley', what:'I have made a path for him in the great valley', kind:'source', cite:[{b:'11-1'}], model:'The gates stand in a valley between walls of rock.' },
      { id:'gate-form', what:'The form, size and material of the gates', kind:'invention', model:'Doorways 14 cubits high, 10 wide, 60 cubits apart (basis: none in Ani). Candidates for the sourcing workstream: Spell 144 and the fuller 147 in Nu, Budge 1898; the Book of Gates for gate architecture, Budge 1905 (cognate).' },
      { id:'between', what:'What lies between the gates', kind:'gap', model:'Not described. Bare valley floor, labelled.' }
    ]},
  { id:'pylons', name:'The Ten Pylons of the House of Osiris', route:8,
    summary:'Ten towered gates, each a goddess with a terrible name, each with a doorkeeper, each shown as a seated guardian in a shrine with its own cornice.',
    features:[
      { id:'count', what:'Ten Pylons of the House of Osiris', kind:'source', cite:[{b:'11-10'},{b:'11-12'},{b:'11-14'},{b:'11-16'},{b:'11-18'},{b:'11-20'},{b:'12-11'},{b:'12-13'},{b:'12-15'},{b:'12-17'}], model:'Ten pylons in sequence after the seventh Arit, leading to the Hall.' },
      { id:'first', what:'The lady of terrors, with lofty walls, the sovereign lady, the mistress of destruction; doorkeeper Neruit', kind:'source', cite:[{b:'11-10'}], model:'Pylon 1 is the tallest; its label carries the text.' },
      { id:'shrine-1', what:'A bird-headed deity with a disk, seated in a shrine whose cornice has khakeru ornaments', kind:'scene', cite:[{bp:'11-12:29'},{b:'11-11'}], model:'Seated silhouette in a shrine with a khakeru frieze.' },
      { id:'shrine-2', what:'Lion-headed deity in a shrine with a serpent on top', kind:'scene', cite:[{bp:'11-12:32'},{b:'11-13'}], model:'As described.' },
      { id:'shrine-3', what:'Man-headed deity; shrine ornamented with two utchats and the emblems of the orbit of the sun and of water', kind:'scene', cite:[{bp:'11-12:35'},{b:'11-15'}], model:'As described.' },
      { id:'shrine-4', what:'Cow-headed deity; cornice of uraei wearing disks', kind:'scene', cite:[{bp:'11-12:38'},{b:'11-17'}], model:'As described.' },
      { id:'shrine-5', what:'The hippopotamus deity, fore-feet on the buckle; cornice of flames', kind:'scene', cite:[{bp:'11-12:41'},{b:'11-19'}], model:'As described.' },
      { id:'shrine-6', what:'A man holding a knife and a besom; a serpent above the shrine', kind:'scene', cite:[{bp:'11-12:44'},{b:'11-21'}], model:'As described.' },
      { id:'sixth-size', what:'Man knoweth neither her breadth nor her height; there is a serpent thereover whose size is not known', kind:'source', cite:[{b:'11-20'}], model:'Pylon 6 is drawn without a measurable top: its towers run up into the dark.' },
      { id:'shrine-7', what:'Ram-headed deity with a besom; khakeru cornice', kind:'scene', cite:[{bp:'11-12:47'},{b:'12-12'}], model:'As described.' },
      { id:'shrine-8', what:'A hawk with the crowns of North and South on a sepulchral chest with closed doors; a besom before, the utchat behind; two human-headed hawks and two ankhs above', kind:'scene', cite:[{bp:'11-12:50'},{b:'12-14'}], model:'As described.' },
      { id:'eighth-fire', what:'The blazing fire, the flame whereof cannot be quenched, with tongues of flame which reach afar', kind:'source', cite:[{b:'12-13'}], model:'Pylon 8 is lit by fire on both towers.' },
      { id:'shrine-9', what:'Lion-headed deity with disk and besom; cornice of uraei with disks', kind:'scene', cite:[{bp:'11-12:53'},{b:'12-16'}], model:'As described.' },
      { id:'ninth-girth', what:'Her girth is three hundred and fifty measures; she is clothed with mother-of-emerald of the south', kind:'source', cite:[{b:'12-15'}], dim:{value:350, unit:'measures', note:'the unit is not given; the model reads it as cubits of circumference and labels the reading'}, model:'Pylon 9 is round in plan, 350 cubits in girth (about 111 across), green.' },
      { id:'shrine-10', what:'Ram-headed deity in the atef crown with a besom; two serpents on the shrine', kind:'scene', cite:[{bp:'11-12:56'},{b:'12-18'}], model:'As described.' },
      { id:'shining', what:'The holy rulers of the pylons are in the form of shining ones', kind:'source', cite:[{b:'29-5'}], model:'The guardians are self-lit.' },
      { id:'pylon-form', what:'The form and spacing of the pylons', kind:'invention', model:'Twin-towered pylons 24 cubits high, 80 cubits apart (basis: none in Ani). Candidates: Spell 146 in Nu has twenty-one pylons with longer descriptions, Budge 1898.' }
    ]},
  { id:'cities', name:'The holy cities: the councils', route:9,
    summary:'Spell 18 asks Thoth to vindicate Ani before the councils of Heliopolis, Busiris, Letopolis, Pe and Dep, the two banks, Abydos, the judges of the dead, Naref, Rosetau and the great gods. They are tribunals in named cities, not stations on the road; the model seats them along the approach to the Hall and says so.',
    features:[
      { id:'councils', what:'The ten councils of Spell 18, twice in the roll', kind:'source', cite:[{b:'13-3'},{b:'13-4'},{b:'13-5'},{b:'13-6'},{b:'13-7'},{b:'14-1'},{b:'14-2'},{b:'14-3'},{b:'14-4'},{b:'14-5'}], model:'Ten benches of seated gods along the last approach.' },
      { id:'gods-seated', what:'The gods of the councils, seated, with a pylon surmounted by the feathers of Maat and uraei above, and a pylon surmounted by Anubis and an utchat below', kind:'scene', cite:[{bp:'13:1'},{b:'13-1'},{b:'13-2'},{b:'23-1'}], model:'Two pylon markers at the head of the benches.' },
      { id:'priests', what:'The priests An-maut-f and Se-mer-f, with the side-lock and leopard skin, introduce Ani and Tutu to the gods', kind:'scene', cite:[{bp:'11-12:59'},{bp:'11-12:63'},{b:'12-9'},{b:'12-21'}], model:'Two priest silhouettes leading two figures.' },
      { id:'placement', what:'Where the councils sit', kind:'editorial', model:'Between the tenth pylon and the Hall. The text places them in named cities, not on the road; the model says so.' },
      { id:'the-cities', what:'The cities themselves: Heliopolis, Busiris, Abydos and the rest', kind:'gap', model:'Not drawn as cities. They were real Egyptian towns; nothing in the Book of the Dead describes their appearance.' }
    ]},
  { id:'hall', name:'The Hall of Two Truths', route:10,
    summary:'The judgment hall. The papyrus draws it: forty-two gods in a row, a door at each end with its name, a roof crowned with uraei and feathers, and at the entrance the weighing of the heart.',
    features:[
      { id:'forty-two', what:'The Hall of Double Right and Truth, wherein Ani addresses the forty-two gods, who are seated in a row in the middle of the hall', kind:'scene', cite:[{bp:'31-32:1'},{b:'31-4'},{b:'32-3'}], model:'A long hall with forty-two seated figures in one row down the middle.' },
      { id:'doors', what:'At each end is a door; the right is called Neb-Maat-heri-tep-retui-f and the left Neb-pehti-thesu-menment', kind:'scene', cite:[{bp:'31-32:1'},{b:'31-2'},{b:'32-8'}], model:'Two doors, labelled with their names.' },
      { id:'door-dialogue', what:'Anubis asks the name of the door, of its upper leaf and its lower leaf; Ani answers: Driven away of Shu; Lord of right and truth standing upon his two feet; Lord of might and power, dispenser of cattle', kind:'source', cite:[{b:'30-1'}], model:'The entrance door carries the three names on its leaves.' },
      { id:'roof', what:'The roof is crowned with a series of uraei and feathers of Maat; on its centre a seated deity with hands extended, the right over the eye of Horus and the left over a pool', kind:'scene', cite:[{bp:'31-32:1'},{b:'31-1'},{b:'32-1'}], model:'A roofline of alternating cobras and feathers; a seated figure at the centre over an eye and a pool.' },
      { id:'weighing', what:'The weighing of the heart: the balance, Anubis testing the tongue, Thoth recording, Ammit waiting, the ape of Thoth on the beam, Ani and Tutu entering', kind:'scene', cite:[{bp:'3:1'},{b:'3-5'},{b:'3-8'},{b:'3-10'},{b:'3-3'}], model:'The balance stands at the hall\'s entrance end with the figures as described.' },
      { id:'twelve', what:'Above, twelve gods each holding a sceptre sit on thrones before a table of offerings', kind:'scene', cite:[{bp:'3:1'},{b:'3-1'}], model:'A raised bench of twelve enthroned figures above the balance.' },
      { id:'shai', what:'Shai, the meskhen (a cubit with human head), Meskhenet and Renenet, and the soul of Ani on a pylon, stand by the balance', kind:'scene', cite:[{bp:'3:1'},{b:'3-4'}], model:'Small figures at the balance.' },
      { id:'confession', what:'The Negative Confession before the forty-two assessors', kind:'source', cite:[{b:'31-3'},{b:'32-2'}], model:'The assessors\' bench links to the confession.' },
      { id:'end-scenes', what:'At the right end: two seated Maats; Osiris enthroned with Ani adoring; the balance with Ammit; Thoth on a pylon pedestal painting a feather', kind:'scene', cite:[{bp:'31-32:1'},{b:'32-4'},{b:'32-5'},{b:'32-6'},{b:'32-7'}], model:'Four small groups at the far end of the hall.' },
      { id:'hall-size', what:'Length, width and height of the hall', kind:'invention', model:'Forty-two seats at 3 cubits give a row of 126 cubits; hall 150 by 30 cubits, 20 high (basis: the seat count; no text figure).' },
      { id:'door-parts', what:'The fuller inventory of the door (bolts, posts, floor, threshold, keeper) that asks its names', kind:'gap', model:'Ani gives the door and its two leaves only. Candidates: the conclusion of Spell 125 in Nu, Budge 1898.' }
    ]},
  { id:'throne', name:'The throne of Osiris', route:11,
    summary:'Osiris enthroned in his shrine, Isis and Nephthys behind him, the four sons of Horus on a lotus before him. Horus leads the justified Ani here.',
    features:[
      { id:'shrine', what:'Osiris, bearded, in the white crown, stands in a shrine whose roof is surmounted by a hawk\'s head and uraei; Isis behind him with her hand on his shoulder; before him on a lotus the four children of Horus', kind:'scene', cite:[{bp:'29-30:4'},{b:'30-2'}], model:'A shrine with a hawk-head finial and cobra frieze; the figures as described.' },
      { id:'enthroned', what:'Osiris enthroned in his shrine (sheet 4); Isis and Nephthys; the four sons on the lotus; the roof of the shrine', kind:'scene', cite:[{b:'4-7'},{b:'4-8'},{b:'4-6'},{b:'4-5'}], model:'The seated form is used for the throne room.' },
      { id:'horus-leads', what:'Horus leads Ani in; Ani kneels with his offerings and speaks before Osiris', kind:'scene', cite:[{b:'4-2'},{b:'4-4'},{b:'4-3'}], model:'Two figures approaching the dais; a kneeling figure with offerings.' },
      { id:'council', what:'Spell 124: Ani enters the council of Osiris', kind:'source', cite:[{b:'24-5'}], model:'Evidence card.' },
      { id:'hymns', what:'Hymns to Osiris, lord of eternity; litany of his names; Spell 185', kind:'source', cite:[{b:'19-5'},{b:'19-6'},{b:'36-3'},{b:'36-5'}], model:'Evidence cards at the dais.' },
      { id:'room-size', what:'The throne room', kind:'invention', model:'A square room 40 cubits across opening off the far end of the Hall (basis: none).' }
    ]},
  { id:'lake', name:'The Lake of Fire', route:12,
    summary:'A square lake of fire with a dog-headed ape seated at each corner. The papyrus draws it without its own text.',
    features:[
      { id:'lake', what:'A lake of fire, at each corner of which is seated a dog-headed ape', kind:'scene', cite:[{bp:'33:1'},{b:'33-1'}], model:'A square pool of flame with four seated baboons at the corners.' },
      { id:'horus-heir', what:'Horus is heir of the throne of the dweller in the Lake of Fire; the double Lake of Fire', kind:'source', cite:[{b:'29-3'},{b:'29-4'}], model:'Evidence card; the model shows one lake and says the text also speaks of a double one.' },
      { id:'not-scalded', what:'Spells 63A and 63B: drinking water and not being burned, not scalded by water', kind:'source', cite:[{b:'15-10'},{b:'15-12'}], model:'Evidence cards at the lake edge.' },
      { id:'size', what:'The lake\'s size', kind:'invention', model:'40 cubits square (basis: none).' },
      { id:'text', what:'The text of Spell 126 (the address to the four apes)', kind:'gap', model:'Not in Ani. Candidates: Spell 126 in Nu, Budge 1898.' }
    ]},
  { id:'fields', name:'Sekhet-hetepet, the Field of Reeds', route:13,
    summary:'Paradise as an ideal Egypt. The papyrus gives the fullest picture of any place in the roll, with its own dimensions: a river a thousand cubits long, wheat three cubits, the seat of the shining ones seven cubits.',
    features:[
      { id:'streams', what:'The Fields of Peace, surrounded and intersected with streams', kind:'scene', cite:[{bp:'33-34:18'},{b:'35-1'}], model:'Four long islands separated by water, bounded by water.' },
      { id:'river', what:'The river is one thousand [cubits] in its length. Not can be told its width. Not exist fishes any in it, not serpents any in it', kind:'source', cite:[{b:'35-3'}], dim:{value:1000, unit:'cubits', note:'length; width unstated and so chosen: 40 cubits, labelled'}, model:'The main channel is 1,000 cubits long.' },
      { id:'wheat', what:'The wheat three cubits', kind:'source', cite:[{b:'35-4'}], dim:{value:3, unit:'cubits'}, model:'Standing grain 3 cubits tall.' },
      { id:'shining-seat', what:'The seat of the shining ones. Their length is seven cubits', kind:'source', cite:[{b:'35-4'}], dim:{value:7, unit:'cubits', note:'Budge\'s "their" is read as the shining ones; the reading is labelled'}, model:'The blessed figures in the Field are 7 cubits tall.' },
      { id:'boats', what:'A boat of eight oars, each end shaped like a serpent\'s head, bearing a flight of steps; at the bows "the god therein is Un-nefer"; a second boat with steps', kind:'scene', cite:[{bp:'33-34:22'},{b:'35-4'}], model:'Two boats with serpent-head ends and a stair amidships on the fourth channel.' },
      { id:'steps', what:'On the other island is placed a flight of steps', kind:'scene', cite:[{bp:'33-34:22'},{b:'35-4'}], model:'A stair on the island.' },
      { id:'reaping', what:'Ani reaping wheat; guiding the oxen treading out the corn; kneeling before two vessels of red barley and wheat', kind:'scene', cite:[{bp:'33-34:20'},{b:'35-2'}], model:'Figures reaping and threshing with oxen on the second island.' },
      { id:'ploughing', what:'Ani ploughing with oxen in Sekhet-aanre', kind:'scene', cite:[{bp:'33-34:21'},{b:'35-3'}], model:'A plough and oxen on the third island.' },
      { id:'thoth', what:'Thoth introduces Ani and his ka to three gods with hare, serpent and bull heads; Ani in a boat with offerings; Ani before a hawk on a pylon pedestal; three ovals', kind:'scene', cite:[{bp:'33-34:19'},{b:'35-1'}], model:'The first island: the presentation, a boat, a hawk on a pedestal, three oval mounds.' },
      { id:'lake-peace', what:'I have sailed in the mighty boat on the Lake of Peace; I have drawn nigh unto the city Hetep; the House of Shu', kind:'source', cite:[{b:'34-4'},{b:'34-5'}], model:'The surrounding water is the Lake of Peace; a walled town, Hetep, at the far end.' },
      { id:'work', what:'Let me plough there, reap there, eat there, drink there, even as upon earth', kind:'source', cite:[{b:'34-2'}], model:'Evidence card.' },
      { id:'town-form', what:'The city Hetep and the House of Shu', kind:'gap', model:'Named, not described, in Ani. Candidates: Spell 110 in Nu names the field\'s towns and lakes, Budge 1898.' },
      { id:'barley-height', what:'The height of the barley and the stature of the blessed in other manuscripts', kind:'gap', model:'Spell 149, first Aat, in Nu is said to give barley five cubits, ears two, stalks three, and spirits nine cubits: general knowledge, to be sourced and cross-examined before use.' },
      { id:'island-size', what:'The size of the islands', kind:'invention', model:'Each island 1,000 by 120 cubits (basis: the river length; width none).' }
    ]},
  { id:'sky', name:'The sky of Nut and the stars', route:14,
    summary:'The body of the sky goddess. The blessed ride here in the boat of the sun or become stars; the seven cows and the four rudders of heaven are shown in a hall.',
    features:[
      { id:'cows', what:'A hall: Ani adores Ra, hawk-headed; seven cows couchant each before a table of offerings, each with a menat; a bull; four rudders; four triads of gods', kind:'scene', cite:[{bp:'35-36:1'},{b:'35-6'},{b:'35-7'},{b:'36-1'},{b:'36-2'}], model:'An open hall on the eastern bank of the Field with the seven cows, the bull, four rudders and four triads.' },
      { id:'rudders', what:'The beautiful rudder of the northern, western, eastern and southern heaven', kind:'source', cite:[{b:'36-1'}], model:'The four rudders point to the four quarters.' },
      { id:'ladder', what:'The ladder by which the soul passes from the underworld to the body', kind:'scene', cite:[{bp:'22:7'},{b:'22-5'}], model:'A ladder rising from the eastern bank into the sky.' },
      { id:'nut', what:'Ra rises and shines upon the back of his mother the sky; Nut gives him birth; the never-resting stars sing', kind:'source', cite:[{b:'19-4'},{b:'20-2'}], model:'The sky is an arched body of stars over the whole world.' },
      { id:'forms', what:'Transformations: swallow, golden hawk, divine hawk, serpent, crocodile, Ptah, ram, bennu, heron, lotus, light', kind:'scene', cite:[{b:'25-1'},{b:'25-2'},{b:'25-3'},{b:'27-2'},{b:'27-3'},{b:'27-4'},{b:'27-8'},{b:'27-11'},{b:'28-1'},{b:'28-2'},{b:'28-3'}], model:'Eleven small forms perched on the eastern bank, each with its spell.' },
      { id:'hawk-wings', what:'A hawk with a back seven cubits wide and wings of emeralds of the South', kind:'source', cite:[{b:'25-5'}], dim:{value:7, unit:'cubits'}, model:'The golden hawk is 7 cubits across.' },
      { id:'sky-form', what:'The form of Nut', kind:'invention', model:'An arch of stars spanning the world; no figure is drawn. The text speaks of her back and her hands, but the papyrus does not draw her.' }
    ]},
  { id:'boat', name:'The night boat of Ra', route:15,
    summary:'The sun god crosses the Duat by night. The dead ask for a seat in the boat, Thoth and Maat stand beside Horus at the rudder, and the rubric even gives a boat\'s length.',
    features:[
      { id:'two-boats', what:'The Sektet boat of evening and the Atet (Matet) boat of morning', kind:'source', cite:[{b:'1-3'},{b:'19-4'},{b:'20-2'}], model:'Two boats: one on the night river under the Duat, one on the sky arch.' },
      { id:'boat-form', what:'Ra, hawk-headed, seated in a boat on the sky; Horus the child on the bows; the side ornamented with feathers of Maat and the utchat; oar handles and rowlocks shaped as hawks\' heads', kind:'scene', cite:[{bp:'19:1'},{b:'19-1'},{b:'19-3'}], model:'A boat with a shrine amidships, a child figure at the bow, hawk-head oar handles.' },
      { id:'rubric-length', what:'These words shall be recited over a boat seven cubits in length, and painted green; a heaven of stars; an image of Ra on a table of stone in the fore-part', kind:'source', cite:[{b:'22-2'}], dim:{value:7, unit:'cubits', note:'the ritual model boat, not the god\'s boat; the model uses it as the only boat length the text gives and says so'}, model:'The boat is 7 cubits long and green.' },
      { id:'crew', what:'Horus in charge of the rudder, with Thoth and Maat beside him; the mariners of Ra; Ani grasps the bows of the Sektet boat and the stern of the Atet boat', kind:'source', cite:[{b:'1-3'},{b:'21-1'}], model:'Three figures at the stern; Ani at the bow.' },
      { id:'apep', what:'The Cat of the Sun kills the serpent Apep; Ani pierces a serpent; may I destroy Apep in his hour', kind:'scene', cite:[{b:'10-1'},{b:'1-3'}], model:'A serpent in the night river ahead of the boat; the cat on the bank.' },
      { id:'towing', what:'Shouts of joy are raised to the ropes which tow thee along', kind:'source', cite:[{b:'21-3'}], model:'A tow rope from the bow.' },
      { id:'river', what:'The night river itself', kind:'gap', model:'Ani speaks of the boat\'s passage but does not describe the river. Candidates: the Amduat (Budge 1905) gives the river of the Duat hour by hour; cognate, labelled if admitted.' },
      { id:'river-form', what:'The course of the night river', kind:'invention', model:'A trench along the south side of the Duat from the western notch to the eastern gate (basis: the sun\'s return; no text figure).' }
    ]},
  { id:'east', name:'The Eastern horizon (Bakhu)', route:16,
    summary:'Where Ra is reborn each morning and the justified dead come forth by day.',
    features:[
      { id:'rising', what:'Ra rises in the eastern part of heaven as Khepera; the sun disk lifted from the djed by arms; six apes adore; Isis and Nephthys kneel on the sign for gold', kind:'scene', cite:[{bp:'2:1'},{b:'2-1'},{b:'1-1'}], model:'The eastern gate: a djed pillar with arms lifting a disk, six baboons, two kneeling goddesses.' },
      { id:'gate-sert', what:'The Gate of Sert is the gate of the pillars of Shu, the northern gate of the underworld; or the two leaves of the door through which Tmu passes when he goes forth in the eastern horizon', kind:'source', cite:[{b:'8-7'}], model:'A two-leaved door in the eastern cliff.' },
      { id:'coming-forth', what:'Coming forth by day: Spells 2, 9, 92, 132, 74', kind:'source', cite:[{b:'18-6'},{b:'18-8'},{b:'18-1'},{b:'18-10'},{b:'18-3'}], model:'Evidence cards at the gate.' },
      { id:'khepera-boat', what:'Ani and Tutu adore Khepera in the boat of the rising sun', kind:'scene', cite:[{b:'10-3'}], model:'The morning boat emerging.' },
      { id:'cliff-form', what:'The eastern mountain', kind:'invention', model:'A cliff like Manu, 60 cubits (basis: symmetry; none in the text).' }
    ]}
  ],
  sources: [
    { id:'budge1895', status:'admitted', cite:'E. A. Wallis Budge, The Book of the Dead: The Papyrus of Ani (British Museum, London, 1895). Public domain. Transcription: Internet Sacred Text Archive, as bundled in the study.', url:'https://sacred-texts.com/egy/ebod/' },
    { id:'facsimile1894', status:'admitted', cite:'The Book of the Dead: Facsimile of the Papyrus of Ani, 2nd ed. (British Museum, 1894), digitized by Heidelberg University Library. Shown only as evidence crops, never as textures.', url:'https://digi.ub.uni-heidelberg.de/diglit/budge1894bd1' },
    { id:'budge1898', status:'candidate', cite:'E. A. Wallis Budge, The Book of the Dead: The Chapters of Coming Forth by Day, 3 vols (London, 1898): the Theban Recension from the papyri of Nu, Nebseni and others. Public domain.', need:'Spells 125 (door inventory), 126, 144, 146 (twenty-one pylons), 147, 149, 150, 110 (the field\'s towns)' },
    { id:'renouf1904', status:'candidate', cite:'P. Le Page Renouf and E. Naville, The Egyptian Book of the Dead: Translation and Commentary (London, 1904). Public domain.', need:'cross-examination of every adopted passage' },
    { id:'budge1905', status:'candidate', cite:'E. A. Wallis Budge, The Egyptian Heaven and Hell, 3 vols (London, 1905): the Book of Am-Tuat and the Book of Gates. Public domain. Cognate royal compositions, not the Book of the Dead.', need:'the night river hour by hour; gate architecture' },
    { id:'modern', status:'cross-examination only', cite:'R. O. Faulkner, The Ancient Egyptian Book of the Dead (1972, rev. 1985); T. G. Allen, The Book of the Dead or Going Forth by Day (1974). In copyright: consulted and cited, never reproduced.', need:'disagreements with Budge\'s readings of physical descriptions' }
  ],
  departures: [
    'The unit is the royal cubit because the text measures in cubits; the metre equivalent (0.523 m) is a modern convention.',
    'The places are arranged along the sun\'s path, west to east and down and up. The papyrus gives a sequence of spells, not a map.',
    'The land of the living is drawn as a translucent slab so the Duat shows beneath it: a section drawing.',
    'The ninth pylon\'s "three hundred and fifty measures" is read as cubits of circumference; the unit is not in the text.',
    'The blessed in the Field are 7 cubits tall on Budge\'s "Their length is seven cubits"; the referent of "their" is a reading.',
    'The boat of Ra is 7 cubits long on the rubric\'s ritual boat, the only boat length the text gives.',
    'Guardians and gods are silhouettes keyed to the text\'s head and implement. Faces, dress and colour are not drawn because the text does not give them.',
    'The facsimile sheets appear only as evidence crops beside the ledger, never as textures on the model.'
  ]
};
