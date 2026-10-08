const fs = require('fs');
const path = require('path');

const NEW_DIR = path.join(__dirname, '..', 'new');
const TARGET_DIR = path.join(__dirname, '..', 'assets', 'official');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const ASSET_MAP = {
  // Championship & League
  "831543247_1122962386790352_3819330219499494129_n.jpg": "meodl_trophy_championship.jpg",
  "831616940_1122962453457012_2714648235918701555_n.jpg": "meodl_banner_league.jpg",
  "830966838_1122962546790336_25583072229152919_n.jpg": "meodl_teams_title.jpg",

  // Sport Trophies / Covers
  "834868343_1122678596818731_7260529402273654053_n.jpg": "trophy_basketball.jpg",
  "830541597_1122678586818732_8570402733320736330_n.jpg": "trophy_volleyball.jpg",
  "830177992_1122678726818718_803983041781978799_n.jpg": "trophy_badminton.jpg",
  "834602016_1122678790152045_3265504801380959897_n.jpg": "trophy_swimming.jpg",
  "831769105_1122678776818713_3772828184676703085_n.jpg": "trophy_board_esports.jpg",
  "831533245_1122679590151965_3465372830795058704_n.jpg": "trophy_egg_hunt.jpg",
  "831533251_1122678926818698_5287654911694174157_n.jpg": "trophy_amazing_race.jpg",

  // Brackets
  "834938416_1122678550152069_562833366554945809_n.jpg": "bracket_basketball.jpg",
  "832964524_1122678593485398_501556175420304945_n.jpg": "bracket_volleyball.jpg",
  "833346522_1122678786818712_8344607856383230122_n.jpg": "bracket_badminton.jpg",
  "830985799_1122679070152017_4888403890376111342_n.jpg": "bracket_board_games.jpg",
  "830900109_1122679180152006_5523658924453918704_n.jpg": "bracket_esports.jpg",

  // Rules & Mechanics
  "831769118_1122678530152071_554707710239443979_n.jpg": "rules_basketball.jpg",
  "832131314_1122678590152065_4315393641074463434_n.jpg": "rules_volleyball.jpg",
  "833363547_1122678680152056_7529578038648457712_n.jpg": "rules_badminton_1.jpg",
  "834419187_1122678783485379_5614305584609778197_n.jpg": "rules_badminton_2.jpg",
  "830754904_1122678873485370_4861966295547385481_n.jpg": "rules_swimming_1.jpg",
  "829967649_1122678950152029_7619895667378554392_n.jpg": "rules_swimming_2.jpg",
  "833868873_1122678990152025_133121763415383489_n.jpg": "rules_board_games_1.jpg",
  "830670201_1122679033485354_6056081099447577153_n.jpg": "rules_board_games_2.jpg",
  "833914052_1122679090152015_8704055815781825526_n.jpg": "rules_esports_1.jpg",
  "833412599_1122679156818675_2492579502272773296_n.jpg": "rules_esports_2.jpg",
  "831568123_1122679600151964_5853058277420291825_n.jpg": "rules_egg_hunt_1.jpg",
  "830701733_1122679593485298_4093818827564254151_n.jpg": "rules_egg_hunt_2.jpg",
  "835450121_1122679200152004_5730208062724120901_n.jpg": "rules_amazing_race_cover.jpg",
  "830900111_1122679263485331_1126105158848978667_n.jpg": "rules_amazing_race_1.jpg",
  "830670196_1122679276818663_1007871707791283188_n.jpg": "rules_amazing_race_2.jpg",
  "831616945_1122679303485327_6586422861665923687_n.jpg": "rules_amazing_race_3.jpg",
  "830883151_1122679366818654_1313276519966073495_n.jpg": "rules_amazing_race_stations.jpg",

  // Team Banners
  "831616944_1122963420123582_1656073892630572441_n.jpg": "team_banner_diesel.jpg",
  "832403045_1122962980123626_8104779777253090839_n.jpg": "team_banner_otto.jpg",
  "835510535_1122963216790269_1055149149892692513_n.jpg": "team_banner_brayton.jpg",
  "833412613_1122962726790318_7348149844734429281_n.jpg": "team_banner_rankine.jpg",

  // Rosters
  "831616958_1122963513456906_5227497625245915218_n.jpg": "roster_diesel_1.jpg",
  "832512741_1122963630123561_3451593661592213612_n.jpg": "roster_diesel_2.jpg",
  "833604186_1122963563456901_2911556062324120745_n.jpg": "roster_diesel_3.jpg",
  "834419194_1122963090123615_6706357810429837537_n.jpg": "roster_otto_1.jpg",
  "832232151_1122963133456944_7949678647089883735_n.jpg": "roster_otto_2.jpg",
  "831616963_1122963296790261_1226054649618322992_n.jpg": "roster_brayton_1.jpg",
  "833763954_1122963380123586_5063313543379993828_n.jpg": "roster_brayton_2.jpg",
  "833604192_1122962806790310_5813220458073134184_n.jpg": "roster_rankine_1.jpg",
  "834419191_1122962903456967_6395477880917528253_n.jpg": "roster_rankine_2.jpg",
  "834962794_1122962833456974_4256798812189330782_n.jpg": "roster_rankine_3.jpg"
};

let copied = 0;
for (const [srcName, destName] of Object.entries(ASSET_MAP)) {
  const src = path.join(NEW_DIR, srcName);
  const dest = path.join(TARGET_DIR, destName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copied++;
    console.log(`Copied ${srcName} -> ${destName}`);
  } else {
    console.warn(`Source not found: ${srcName}`);
  }
}

console.log(`Finished copying ${copied} assets to ${TARGET_DIR}`);
