/* Inherited v2.3 data. Links/descriptions await independent source audit. Positions below are legacy, not geographic coordinates. */
(function(){
  const NODES=[
    {id:'thebes',  floor:0, name:'Thebes, the land of the living', short:'Thebes', p:[5.2,0,1.2],
      what:'Ani\'s house, the temple of Amun where Tutu sang, the granaries he kept accounts for. The roll was written here, for a man who was still alive.'},
    {id:'cities',  floor:0, name:'The holy cities: Heliopolis, Busiris, Abydos', short:'Holy cities', p:[8.6,0,-1.6],
      what:'The cult centres whose councils of gods judged Osiris\'s own case. Spell 18 asks Thoth to win Ani\'s case before each of them in turn.'},
    {id:'west',    floor:0, name:'The Western horizon (Manu)', short:'West horizon', p:[-11,0.6,0],
      what:'Where the sun sets and the dead go in. Hathor as a cow steps out of the Theban cliff to receive them; the evening boat of Ra passes through the mountain into the Duat.'},
    {id:'east',    floor:0, name:'The Eastern horizon (Bakhu)', short:'East horizon', p:[11.6,0.6,0],
      what:'Where Ra is reborn each morning and where the justified dead "come forth by day", free to leave the tomb and return to the world of light.'},
    {id:'sky',     floor:0, name:'The sky of Nut and the stars', short:'The sky', p:[0,8.2,0],
      what:'The body of the sky goddess. The blessed may ride here in the boat of the sun, become imperishable stars, or fly as a falcon, a swallow or a phoenix.'},
    {id:'tomb',    floor:1, name:'The tomb in the Western cliffs', short:'The tomb', p:[-7.2,-3,0],
      what:'The burial chamber: the mummy, the four sons of Horus at the corners, the amulets at the throat and heart. The spells for keeping the heart, breathing, and letting the soul out all start here.'},
    {id:'sycamore',floor:1, name:'The sycamore of Nut', short:'Sycamore', p:[-1,-3,2.2],
      what:'A pool of cool water under a tree, where the goddess in the sycamore gives the dead water to drink and air to breathe (Spell 59).'},
    {id:'rosetau', floor:1, name:'Rosetau, the passages', short:'Rosetau', p:[-3.6,-3.6,-1.2],
      what:'"The mouth of the passages": the tunnels of the necropolis of Sokar through which the dead descend. Spell 17 and the gate spells both name it.'},
    {id:'arits',   floor:2, name:'The Seven Arits (gates)', short:'Seven gates', p:[-1.6,-6,0],
      what:'Seven gateways, each held by a doorkeeper, a watcher and a herald with names like "He who lives on snakes". The password is their names (Spell 147).'},
    {id:'pylons',  floor:2, name:'The Ten Pylons of the House of Osiris', short:'Ten pylons', p:[3.2,-6,0],
      what:'Ten towered gates, each a goddess with a terrible name and a knife-bearing guardian, between the gates and the hall of judgment (Spell 146).'},
    {id:'hall',    floor:3, name:'The Hall of Two Truths', short:'Hall of Two Truths', p:[7.4,-9,0],
      what:'The judgment hall. Anubis weighs the heart against the feather of Maat, Thoth records, Ammit the Devourer waits, and forty-two assessors hear the Negative Confession (Spells 30B, 125, 42).'},
    {id:'throne',  floor:3, name:'The throne of Osiris', short:'Throne of Osiris', p:[10.6,-9,0],
      what:'Osiris enthroned in his shrine with Isis and Nephthys behind him and the four sons of Horus on a lotus. Horus leads the justified Ani here; the hymns to Osiris are sung to this seat.'},
    {id:'lake',    floor:3, name:'The Lake of Fire', short:'Lake of Fire', p:[4,-9,2.6],
      what:'A square lake of flame guarded by four baboons. Refreshment for the justified, destruction for the condemned; the water spells promise the dead will not be scalded (Spells 63, 126).'},
    {id:'fields',  floor:3, name:'Sekhet-hetepet, the Field of Reeds', short:'Field of Reeds', p:[7.4,-8,-6],
      what:'Paradise as an ideal Egypt: islands and canals, barley seven cubits high, boats, the gods of the field. Ani ploughs, reaps and rests here (Spell 110).'},
    {id:'boat',    floor:4, name:'The night boat of Ra', short:'Boat of Ra', p:[0,-12,0],
      what:'The sun god crosses the Duat by night on an underground river. The dead ask for a seat in the boat, steer with its rudders and help spear the serpent Apep (Spell 15, 133, 134).'},
    {id:'duat',    floor:2, name:'The Duat as a whole', short:'The Duat', p:[0,-7.6,-2.4], region:true,
      what:'The hidden land under the earth, through which Ra travels by night and the dead must pass. Spell 17 and the transformation spells roam through all of it.'}
  ];
  const FLOORS=[
    {n:0, name:'The land of the living', y:0},
    {n:1, name:'The threshold', y:-3},
    {n:2, name:'The gauntlet', y:-6},
    {n:3, name:'The court and the reward', y:-9},
    {n:4, name:'The night river', y:-12}
  ];
  // Editorial navigation route, not a canonical sequence or measured ancient floor plan.
  const PATH=['thebes','tomb','rosetau','arits','pylons','hall','throne','fields','boat','east'];

window.ANI_MAP_DATA={nodes:NODES,floors:FLOORS,path:PATH,reviewStatus:"Inherited mappings — source audit pending",placement:"Editorial spatial arrangement"};
})();
