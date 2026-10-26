// Makongi FC — seeded demo data and formation definitions.
// Everything here is sample data for the prototype. Admin edits are kept in localStorage.

export const DATA_VERSION = 1;

export const FORMATIONS = {
  "4-3-3": {
    label: "4-3-3",
    description: "High width, one holding midfielder, two advanced eights.",
    slots: [
      { key: "gk", label: "Goalkeeper", short: "GK", x: 50, y: 91 },
      { key: "rb", label: "Right back", short: "RB", x: 84, y: 73 },
      { key: "cb1", label: "Right centre back", short: "CB", x: 63, y: 77 },
      { key: "cb2", label: "Left centre back", short: "CB", x: 37, y: 77 },
      { key: "lb", label: "Left back", short: "LB", x: 16, y: 73 },
      { key: "cm1", label: "Right centre midfield", short: "CM", x: 70, y: 49 },
      { key: "cm2", label: "Holding midfield", short: "CDM", x: 50, y: 58 },
      { key: "cm3", label: "Left centre midfield", short: "CM", x: 30, y: 49 },
      { key: "rw", label: "Right wing", short: "RW", x: 82, y: 26 },
      { key: "st", label: "Centre forward", short: "ST", x: 50, y: 18 },
      { key: "lw", label: "Left wing", short: "LW", x: 18, y: 26 }
    ]
  },
  "4-2-3-1": {
    label: "4-2-3-1",
    description: "Double pivot, a free number ten and inverted wingers.",
    slots: [
      { key: "gk", label: "Goalkeeper", short: "GK", x: 50, y: 91 },
      { key: "rb", label: "Right back", short: "RB", x: 84, y: 74 },
      { key: "cb1", label: "Right centre back", short: "CB", x: 63, y: 78 },
      { key: "cb2", label: "Left centre back", short: "CB", x: 37, y: 78 },
      { key: "lb", label: "Left back", short: "LB", x: 16, y: 74 },
      { key: "cdm1", label: "Right holding midfield", short: "CDM", x: 62, y: 58 },
      { key: "cdm2", label: "Left holding midfield", short: "CDM", x: 38, y: 58 },
      { key: "rw", label: "Right attacking midfield", short: "RW", x: 82, y: 38 },
      { key: "cam", label: "Central attacking midfield", short: "CAM", x: 50, y: 34 },
      { key: "lw", label: "Left attacking midfield", short: "LW", x: 18, y: 38 },
      { key: "st", label: "Centre forward", short: "ST", x: 50, y: 17 }
    ]
  },
  "3-5-2": {
    label: "3-5-2",
    description: "Three centre backs, wing-backs and a front two.",
    slots: [
      { key: "gk", label: "Goalkeeper", short: "GK", x: 50, y: 91 },
      { key: "cb1", label: "Right centre back", short: "CB", x: 72, y: 77 },
      { key: "cb2", label: "Centre back", short: "CB", x: 50, y: 80 },
      { key: "cb3", label: "Left centre back", short: "CB", x: 28, y: 77 },
      { key: "rwb", label: "Right wing-back", short: "RWB", x: 88, y: 51 },
      { key: "cm1", label: "Right centre midfield", short: "CM", x: 67, y: 55 },
      { key: "cm2", label: "Holding midfield", short: "CDM", x: 50, y: 61 },
      { key: "cm3", label: "Left centre midfield", short: "CM", x: 33, y: 55 },
      { key: "lwb", label: "Left wing-back", short: "LWB", x: 12, y: 51 },
      { key: "st1", label: "Right forward", short: "ST", x: 61, y: 22 },
      { key: "st2", label: "Left forward", short: "ST", x: 39, y: 22 }
    ]
  }
};

export const SEED = {
  version: DATA_VERSION,
  club: {
    name: "Makongi FC",
    shortName: "MFC",
    slogan: "The Pride of Great Makongi FC",
    founded: 1998,
    stadium: "Makongi Ground",
    city: "Makongi",
    country: "Tanzania",
    capacity: 12000,
    league: "NBC Premier League",
    coach: "Elias Mwakyusa",
    captain: "Daniel Mwakalinga",
    email: "info@makongifc.com",
    phone: "+255 700 000 000",
    address: "Makongi Ground, Makongi, Tanzania",
    instagram: "@MakongiFC",
    facebook: "/MakongiFootballClub"
  },
  players: [
    {
      id: "p1", name: "Amani Mwita", number: 1, position: "GK", foot: "Right", age: 28,
      nationality: "Tanzania", height: "1.89 m", appearances: 7, goals: 0, assists: 0,
      cleanSheets: 3, yellow: 0, red: 0,
      bio: "Commanding shot-stopper and vice-captain. Leads the back line with a calm voice and quick distribution.",
      photo: ""
    },
    {
      id: "p2", name: "Baraka Ndlovu", number: 2, position: "RB", foot: "Right", age: 24,
      nationality: "Tanzania", height: "1.76 m", appearances: 8, goals: 0, assists: 1,
      cleanSheets: 0, yellow: 2, red: 0,
      bio: "An energetic overlapping full-back who never stops running and delivers early crosses into the box.",
      photo: ""
    },
    {
      id: "p3", name: "Tunde Adeyemi", number: 3, position: "CB", foot: "Left", age: 27,
      nationality: "Nigeria", height: "1.91 m", appearances: 8, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 1, red: 0,
      bio: "Composed left-sided defender, dominant in the air and comfortable stepping into midfield.",
      photo: ""
    },
    {
      id: "p4", name: "Sipho Dlamini", number: 4, position: "CB", foot: "Right", age: 29,
      nationality: "South Africa", height: "1.87 m", appearances: 7, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 3, red: 0,
      bio: "The organiser at the heart of defence. Reads danger early and wins the first ball.",
      photo: ""
    },
    {
      id: "p5", name: "Kofi Mensah", number: 5, position: "LB", foot: "Left", age: 25,
      nationality: "Ghana", height: "1.78 m", appearances: 8, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 2, red: 0,
      bio: "A modern left-back with recovery pace and a crisp left foot. Joins attacks selectively.",
      photo: ""
    },
    {
      id: "p6", name: "Jabari Okello", number: 6, position: "CDM", foot: "Right", age: 26,
      nationality: "Kenya", height: "1.83 m", appearances: 8, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 3, red: 0,
      bio: "The screen in front of the defence. Breaks up play, keeps the ball moving and protects the back four.",
      photo: ""
    },
    {
      id: "p7", name: "Neo Mokoena", number: 7, position: "CM", foot: "Right", age: 23,
      nationality: "South Africa", height: "1.74 m", appearances: 8, goals: 1, assists: 2,
      cleanSheets: 0, yellow: 1, red: 0,
      bio: "Box-to-box midfielder with a low centre of gravity. Sets the tempo and arrives late in the box.",
      photo: ""
    },
    {
      id: "p8", name: "Farai Chikore", number: 8, position: "CAM", foot: "Left", age: 25,
      nationality: "Zimbabwe", height: "1.72 m", appearances: 8, goals: 2, assists: 3,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "Makongi's creative spark. Finds pockets between the lines and unlocks low blocks with either foot.",
      photo: ""
    },
    {
      id: "p9", name: "Daniel Mwakalinga", number: 9, position: "ST", foot: "Right", age: 27,
      nationality: "Tanzania", height: "1.85 m", appearances: 8, goals: 8, assists: 1,
      cleanSheets: 0, yellow: 1, red: 0,
      bio: "Club captain and talisman. A ruthless penalty-box striker with eight goals in eight league games.",
      photo: ""
    },
    {
      id: "p10", name: "Yusuf Banda", number: 10, position: "ST", foot: "Right", age: 24,
      nationality: "Zambia", height: "1.80 m", appearances: 8, goals: 3, assists: 1,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "A mobile forward who can lead the line or drift wide. Three goals from the bench and starts combined.",
      photo: ""
    },
    {
      id: "p11", name: "Emmanuel Kipchoge", number: 11, position: "LW", foot: "Right", age: 22,
      nationality: "Kenya", height: "1.75 m", appearances: 8, goals: 2, assists: 4,
      cleanSheets: 0, yellow: 1, red: 0,
      bio: "Direct, fearless winger. The team's chief creator with four assists and a habit of beating his man.",
      photo: ""
    },
    {
      id: "p12", name: "Hassan Msuya", number: 12, position: "GK", foot: "Right", age: 22,
      nationality: "Tanzania", height: "1.86 m", appearances: 2, goals: 0, assists: 0,
      cleanSheets: 1, yellow: 0, red: 0,
      bio: "Academy graduate pushing for a starting spot. Excellent reflexes and a brave presence in one-v-ones.",
      photo: ""
    },
    {
      id: "p13", name: "Peter Mwangi", number: 13, position: "CB", foot: "Right", age: 23,
      nationality: "Tanzania", height: "1.88 m", appearances: 3, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "Physical young centre-back who has stepped up from the academy and impressed in cup minutes.",
      photo: ""
    },
    {
      id: "p14", name: "Brian Otieno", number: 14, position: "RB", foot: "Right", age: 21,
      nationality: "Kenya", height: "1.73 m", appearances: 4, goals: 0, assists: 1,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "Quick, technical full-back with a bright future. Provides energy from the bench.",
      photo: ""
    },
    {
      id: "p15", name: "Kelvin Mushi", number: 15, position: "CM", foot: "Left", age: 26,
      nationality: "Tanzania", height: "1.79 m", appearances: 5, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 1, red: 0,
      bio: "Reliable squad midfielder who keeps possession and covers multiple roles across the middle.",
      photo: ""
    },
    {
      id: "p16", name: "Ali Juma", number: 16, position: "LW", foot: "Left", age: 20,
      nationality: "Tanzania", height: "1.70 m", appearances: 6, goals: 0, assists: 2,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "Exciting teenage winger. Direct off the left, happy on either flank, and fearless in the final third.",
      photo: ""
    },
    {
      id: "p17", name: "Gift Phiri", number: 17, position: "RW", foot: "Right", age: 24,
      nationality: "Malawi", height: "1.77 m", appearances: 6, goals: 0, assists: 1,
      cleanSheets: 0, yellow: 1, red: 0,
      bio: "A tricky wide forward who stretches defences and is always looking to attack the back post.",
      photo: ""
    },
    {
      id: "p18", name: "Samuel Njoroge", number: 18, position: "ST", foot: "Right", age: 22,
      nationality: "Kenya", height: "1.82 m", appearances: 3, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "Penalty-box poacher with sharp movement. Scored his first league goal in the win over Singida.",
      photo: ""
    },
    {
      id: "p19", name: "Chris Mwakyusa", number: 19, position: "CDM", foot: "Right", age: 25,
      nationality: "Tanzania", height: "1.81 m", appearances: 6, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 2, red: 0,
      bio: "Aggressive ball-winner who gives the midfield fresh legs and protects a lead late in games.",
      photo: ""
    },
    {
      id: "p20", name: "Innocent Mbeki", number: 20, position: "CB", foot: "Right", age: 28,
      nationality: "Tanzania", height: "1.90 m", appearances: 2, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 1, red: 0,
      bio: "Experienced cover at centre-back. Strong in the air and a leader in the dressing room.",
      photo: ""
    },
    {
      id: "p21", name: "Rashid Kheri", number: 21, position: "RW", foot: "Left", age: 23,
      nationality: "Tanzania", height: "1.78 m", appearances: 8, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 1, red: 0,
      bio: "An inverted right winger who loves to cut inside and shoot. Works hard without the ball.",
      photo: ""
    },
    {
      id: "p22", name: "Joseph Mwansa", number: 22, position: "CM", foot: "Right", age: 27,
      nationality: "Zambia", height: "1.80 m", appearances: 5, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "Calm, experienced passer. A dependable option when Makongi need to control the tempo.",
      photo: ""
    },
    {
      id: "p23", name: "David Mwaipopo", number: 23, position: "LB", foot: "Left", age: 21,
      nationality: "Tanzania", height: "1.75 m", appearances: 2, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "Homegrown left-back with a tremendous engine and a growing understanding of the first-team shape.",
      photo: ""
    },
    {
      id: "p24", name: "Benard Mwita", number: 24, position: "RW", foot: "Right", age: 19,
      nationality: "Tanzania", height: "1.72 m", appearances: 2, goals: 0, assists: 0,
      cleanSheets: 0, yellow: 0, red: 0,
      bio: "Academy prospect with electric pace. The coaching staff are managing his minutes carefully.",
      photo: ""
    }
  ],
  fixtures: [
    {
      id: "f1", opponent: "Simba SC", opponentShort: "SIM", competition: "NBC Premier League",
      venue: "Makongi Ground", home: true, date: "2026-11-02T16:00:00+03:00", status: "upcoming",
      homeScore: null, awayScore: null, note: "Top-of-the-table clash"
    },
    {
      id: "f2", opponent: "Young Africans", opponentShort: "YAN", competition: "NBC Premier League",
      venue: "Benjamin Mkapa Stadium", home: false, date: "2026-11-09T19:00:00+03:00", status: "upcoming",
      homeScore: null, awayScore: null, note: "Dar es Salaam away day"
    },
    {
      id: "f3", opponent: "Azam FC", opponentShort: "AZM", competition: "NBC Premier League",
      venue: "Makongi Ground", home: true, date: "2026-11-16T16:00:00+03:00", status: "upcoming",
      homeScore: null, awayScore: null, note: "Family matchday"
    },
    {
      id: "f4", opponent: "Namungo FC", opponentShort: "NAM", competition: "NBC Premier League",
      venue: "Majaliwa Stadium", home: false, date: "2026-11-23T15:00:00+03:00", status: "upcoming",
      homeScore: null, awayScore: null, note: ""
    },
    {
      id: "f5", opponent: "Coastal Union", opponentShort: "COA", competition: "NBC Premier League",
      venue: "Makongi Ground", home: true, date: "2026-11-30T16:00:00+03:00", status: "upcoming",
      homeScore: null, awayScore: null, note: "Final home match of the month"
    },
    {
      id: "r1", opponent: "KMC FC", opponentShort: "KMC", competition: "NBC Premier League",
      venue: "Uhuru Stadium", home: false, date: "2026-10-25T16:00:00+03:00", status: "finished",
      homeScore: 1, awayScore: 3, scorers: "Mwakalinga 2, Banda", note: "Makongi go top"
    },
    {
      id: "r2", opponent: "Tanzania Prisons", opponentShort: "TPR", competition: "NBC Premier League",
      venue: "Makongi Ground", home: true, date: "2026-10-18T16:00:00+03:00", status: "finished",
      homeScore: 2, awayScore: 0, scorers: "Banda, Chikore", note: "Clean sheet at home"
    },
    {
      id: "r3", opponent: "Mbeya City", opponentShort: "MBE", competition: "NBC Premier League",
      venue: "Sokoine Stadium", home: false, date: "2026-10-11T15:00:00+03:00", status: "finished",
      homeScore: 1, awayScore: 1, scorers: "Mokoena", note: "Point on the road"
    },
    {
      id: "r4", opponent: "Singida Black Stars", opponentShort: "SBS", competition: "NBC Premier League",
      venue: "Makongi Ground", home: true, date: "2026-10-04T16:00:00+03:00", status: "finished",
      homeScore: 4, awayScore: 0, scorers: "Mwakalinga 3, Kipchoge", note: "Statement home win"
    },
    {
      id: "r5", opponent: "Simba SC", opponentShort: "SIM", competition: "NBC Premier League",
      venue: "Benjamin Mkapa Stadium", home: false, date: "2026-09-27T19:00:00+03:00", status: "finished",
      homeScore: 0, awayScore: 1, scorers: "Mwakalinga", note: "Derby-day upset"
    },
    {
      id: "r6", opponent: "Young Africans", opponentShort: "YAN", competition: "NBC Premier League",
      venue: "Makongi Ground", home: true, date: "2026-09-20T16:00:00+03:00", status: "finished",
      homeScore: 2, awayScore: 1, scorers: "Mwakalinga, Chikore", note: "Late winner in front of the Kop"
    },
    {
      id: "r7", opponent: "Azam FC", opponentShort: "AZM", competition: "NBC Premier League",
      venue: "Azam Complex", home: false, date: "2026-09-13T16:00:00+03:00", status: "finished",
      homeScore: 2, awayScore: 3, scorers: "Mwakalinga, Banda, Kipchoge", note: "Five-goal thriller"
    },
    {
      id: "r8", opponent: "Coastal Union", opponentShort: "COA", competition: "NBC Premier League",
      venue: "Mkwakwani Stadium", home: false, date: "2026-09-06T15:00:00+03:00", status: "finished",
      homeScore: 0, awayScore: 0, scorers: "", note: "Hard-earned away point"
    }
  ],
  table: [
    { team: "Makongi FC", short: "MFC", played: 8, won: 6, drawn: 2, lost: 0, gf: 16, ga: 5, points: 20, form: ["W", "W", "D", "W", "W"], isMakongi: true },
    { team: "Simba SC", short: "SIM", played: 8, won: 6, drawn: 1, lost: 1, gf: 17, ga: 8, points: 19, form: ["W", "L", "W", "W", "W"] },
    { team: "Young Africans", short: "YAN", played: 8, won: 5, drawn: 2, lost: 1, gf: 14, ga: 7, points: 17, form: ["D", "W", "W", "D", "W"] },
    { team: "Azam FC", short: "AZM", played: 8, won: 4, drawn: 2, lost: 2, gf: 12, ga: 9, points: 14, form: ["W", "W", "L", "D", "L"] },
    { team: "Namungo FC", short: "NAM", played: 8, won: 3, drawn: 2, lost: 3, gf: 9, ga: 10, points: 11, form: ["L", "W", "D", "W", "L"] },
    { team: "Coastal Union", short: "COA", played: 8, won: 2, drawn: 3, lost: 3, gf: 8, ga: 11, points: 9, form: ["D", "L", "W", "D", "L"] },
    { team: "KMC FC", short: "KMC", played: 8, won: 2, drawn: 2, lost: 4, gf: 7, ga: 12, points: 8, form: ["L", "L", "W", "D", "L"] },
    { team: "Tanzania Prisons", short: "TPR", played: 8, won: 1, drawn: 2, lost: 5, gf: 6, ga: 14, points: 5, form: ["L", "D", "L", "L", "W"] },
    { team: "Mbeya City", short: "MBE", played: 8, won: 1, drawn: 1, lost: 6, gf: 5, ga: 16, points: 4, form: ["L", "L", "D", "L", "L"] },
    { team: "Singida Black Stars", short: "SBS", played: 8, won: 0, drawn: 3, lost: 5, gf: 4, ga: 13, points: 3, form: ["D", "L", "L", "D", "L"] }
  ],
  news: [
    {
      id: "n1", category: "Match Report", date: "2026-10-25", featured: true,
      title: "Makongi go top after ruthless win at KMC",
      excerpt: "Daniel Mwakalinga struck twice as the Reds produced their most complete away performance of the season.",
      body: [
        "Makongi FC moved to the top of the NBC Premier League with a commanding 3-1 victory over KMC FC at Uhuru Stadium on Sunday.",
        "Captain Daniel Mwakalinga opened the scoring inside 14 minutes, finishing a flowing move that started with Amani Mwita and went through Farai Chikore. He added his second just after the hour, before Yusuf Banda wrapped up the points with a low drive from the edge of the box.",
        "Head coach Elias Mwakyusa praised the control of his midfield: \"We knew the first 20 minutes would decide the game. The players followed the plan, stayed patient and took their chances. Now we recover and prepare for Simba.\"",
        "Makongi return home on 2 November for a top-of-the-table meeting with Simba SC at Makongi Ground. Tickets are on sale at the club office and online."
      ]
    },
    {
      id: "n2", category: "Club News", date: "2026-10-24", featured: false,
      title: "Matchday guide: Makongi FC vs Simba SC",
      excerpt: "Everything you need for the biggest home game of the season, from gates opening to the post-match shirt signing.",
      body: [
        "Makongi Ground opens its gates at 13:30 on Sunday 2 November, two and a half hours before the 16:00 kick-off against Simba SC.",
        "The club shop will be open from 13:30 with the new 2026/27 home shirt, scarves and junior kits. Food and drink kiosks around the ground accept cash and mobile money.",
        "Supporters are encouraged to arrive early. The Makongi Brass Band will lead the pre-match atmosphere from 15:15, and the team will sign autographs beside the west stand after full time.",
        "Parking is limited around the stadium. Shuttle vans will run from Makongi Market every 15 minutes from 13:00."
      ]
    },
    {
      id: "n3", category: "Awards", date: "2026-10-20", featured: false,
      title: "Mwakalinga named Player of the Month",
      excerpt: "Six goals in four games earned the Makongi captain the league's October award.",
      body: [
        "Daniel Mwakalinga has been named NBC Premier League Player of the Month for October after scoring six goals in four matches.",
        "The Makongi captain received the award at the club's training ground on Monday, surrounded by teammates and coaching staff.",
        "\"This belongs to the whole team,\" Mwakalinga said. \"The service from Farai, Emmanuel and the wide players has been outstanding. My job is to be in the right place, and they keep putting the ball there.\"",
        "Mwakalinga now has eight league goals for the season and a clear lead at the top of the scoring charts."
      ]
    },
    {
      id: "n4", category: "Academy", date: "2026-10-16", featured: false,
      title: "Academy graduates join first-team training",
      excerpt: "Three teenagers have been promoted to train with the senior squad after impressing the coaching staff.",
      body: [
        "Makongi FC's academy continues to feed the first team. Benard Mwita, David Mwaipopo and Peter Mwangi have all joined senior training on a permanent basis.",
        "The trio have been regulars in the under-20 side and have already made league appearances from the bench this season.",
        "Academy director Salma Mhando said: \"We are not just producing players, we are producing people who understand what it means to wear this badge. The pathway is real, and the first team staff deserve credit for trusting it.\"",
        "The club plans to open a new academy pitch later this year, part of a wider investment in youth football across the Makongi district."
      ]
    },
    {
      id: "n5", category: "Club News", date: "2026-10-10", featured: false,
      title: "New home kit unveiled for 2026/27",
      excerpt: "A deeper red, a clean black collar and a subtle map of Makongi woven into the shirt.",
      body: [
        "Makongi FC has unveiled the new 2026/27 home kit, produced in partnership with the club's technical supplier.",
        "The shirt is a deeper shade of red with a black collar and cuff, white side panels and a tonal outline of the Makongi district woven into the lower front.",
        "The crest sits on the left chest, with the slogan \"The Pride of Great Makongi FC\" printed inside the neckline.",
        "The kit is available now at the Makongi Ground club shop and at selected retail partners across the region."
      ]
    },
    {
      id: "n6", category: "Community", date: "2026-10-05", featured: false,
      title: "Community coaching clinic returns this Saturday",
      excerpt: "Free sessions for boys and girls aged 8-14, led by the Makongi FC academy coaches.",
      body: [
        "The Makongi FC community coaching clinic returns to Makongi Ground this Saturday from 09:00 to 11:30.",
        "The free clinic is open to boys and girls aged 8 to 14. No experience is necessary. Participants should bring water, shin pads if they have them, and trainers or boots.",
        "Academy coaches will run sessions on first touch, passing and small-sided games. Parents and guardians are welcome to stay and watch from the main stand.",
        "Registration opens at 08:30 at the north gate. For more information, contact the club office at info@makongifc.com."
      ]
    }
  ],
  formation: "4-3-3",
  lineups: {
    "4-3-3": {
      slots: { gk: "p1", rb: "p2", cb1: "p3", cb2: "p4", lb: "p5", cm1: "p7", cm2: "p6", cm3: "p8", rw: "p21", st: "p9", lw: "p11" },
      bench: ["p12", "p13", "p14", "p19", "p16", "p17", "p10"]
    },
    "4-2-3-1": {
      slots: { gk: "p1", rb: "p2", cb1: "p3", cb2: "p4", lb: "p5", cdm1: "p6", cdm2: "p7", rw: "p21", cam: "p8", lw: "p11", st: "p9" },
      bench: ["p12", "p13", "p14", "p19", "p16", "p17", "p10"]
    },
    "3-5-2": {
      slots: { gk: "p1", cb1: "p3", cb2: "p4", cb3: "p13", rwb: "p2", cm1: "p7", cm2: "p6", cm3: "p8", lwb: "p5", st1: "p9", st2: "p10" },
      bench: ["p12", "p20", "p14", "p19", "p16", "p17", "p11"]
    }
  }
};

export const POSITIONS = ["GK", "RB", "CB", "LB", "CDM", "CM", "CAM", "LW", "RW", "ST"];
export const POSITION_GROUPS = [
  { label: "Goalkeepers", codes: ["GK"] },
  { label: "Defenders", codes: ["RB", "CB", "LB"] },
  { label: "Midfielders", codes: ["CDM", "CM", "CAM"] },
  { label: "Forwards", codes: ["LW", "RW", "ST"] }
];
