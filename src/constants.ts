/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const IMAGES = {
  BACKGROUND_SNAKE_HILL: "https://lh3.googleusercontent.com/aida-public/AB6AXuChsT4Tvna4Z_pvRmZEqA2AXcHbnv50F5UYYBZWxDmuKmXiKfngvzOVMUcOpl6HcuxHU4p8Z5uu6Y7W2Gv7e-VM4L8ZibOB2fvKM5qfSdS8jqRCo0Dwg6Q3dx6GUUUiwo-caoayB1LsLHV1Kya8khZ9rxYW2lOQxT0OgEkoV8GnEWHRlTQ-RQJe93aGdmJ1dQxK1NiuzD7arW41N2rlc6_lF9lS9j-D1BXjXuSypu8pXEP050FvM0wgne05SYy-9CN9nXSusNyrqEnv",
  CONSTRUCTION_SITE: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4zIvjtt3brti1yJJaU5DkCxTE-Tl-EfwQzAxUlD5afCHcK4bR5moISDtc2g9_9_xPFSqNphUQrWPVPQqoyxTBf79MsuYuVDF48Bx531nZcPjEuYKIp23XPcP0zsCRQWqeMYo2fBx0XLkYJ_xjDmG_5lCDpFrlHLbmCmzC7AIbSERxjH53Dq2I9Gel2sfVmYTU8QWuyzfnIGlzqBGRsAv9lCvPb970A7nGYHTFHRt7PbCJaWq7raM5rQ5QcpPQXVWEaUj7ZDM53Fyk",
  SUNSET_ROOF: "https://lh3.googleusercontent.com/aida-public/AB6AXuArrUS2fms-72Un-edw73y0iV8M0z27kI9UbhH9lfQA7pUCm2dpm1zINJAVAFsVEAWCytO6NEu1Puh5_S8V_UO5R1uqOlxqjFUu8bRVF0YteOFNLxCqxurkdAg8zUyUo1lDXJnYgZhaRjwJcEkzJW3li_AcRFmo7SDu2R-zatyQ-P3TdrYTZ_OrPu2dw1cSoiF0X8LAToB159jbhrB-xjCBLIkKizauel2G2mN--wfa_9lFf90OxsC3eeiLy8xAcJ45W3oH2eQMfgAJ",
  COMPLETED_TOWER: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkS_wU9Nn_r_9P3vri3myctuoFCHYy5dDEzJrnE7GydqLV6smIfrUmgDACI2vxjCaZswVeGKw1wNWpxHYeqbKghFRW5N58WXh0TM3EO7vfCNMcHYrO7eyYfeI6vTwu6rB-sQOvZ-Fhb424aZKFbHpwO9dBMMV0u4NztYZgCcbaI51p4-ZbX-gGl5c5B5uQbSjcRvbq0CJGzO-2Va7my2BO70IPkoqwCg2my-HXSZly21nCwHkQu7wDFvsUMh14Y2ZmMOeN_TJ9uM3Q",
  START_SCREEN: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4zMpb-SyvBP0LX0hCmMrb3VIKpET6YaT9BVNaZpBI8GhC7f5ioIKQSgeuRhR4UzwJFXkIoIChVI2UA5Emg5fyUgppG75XAxaydXJ_W4iSexyqbDENK6H4Zxk5URN_ttB7hvnAHka_aF4ehGxZGz05sP3GxVAoA3S3wOfMivoZnbzXnyr3dll7lj9Hqszp0J-fHelixDiNlveB4sPOZ4am3isRgEwVpzumJggJ4Qi0UlCQN_DmbbUoven3hzso8VRMC9l-FOFiaKsj",
  STONE: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=200&h=200&auto=format&fit=crop",
  WOOD: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=200&h=200&auto=format&fit=crop",
  CLAY: "https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=200&h=200&auto=format&fit=crop",
  PIGMENT: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=200&h=200&auto=format&fit=crop",
};

export const SOUNDS = {
  CLICK: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  CORRECT: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  INCORRECT: "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3",
  SUCCESS: "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
  TRANSITION: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  SYNTH: "https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3",
};

export type MaterialType = "BASE" | "INTERMEDIATE" | "RARE" | "FINAL";

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  image: string;
  color: string;
  description: string;
  knowledge?: string;
}

export const MATERIALS: Record<string, Material> = {
  // Base Materials
  stone: { id: "stone", name: "石材", type: "BASE", image: IMAGES.STONE, color: "#708090", description: "台基、柱础等石质构件原料" },
  wood: { id: "wood", name: "木材", type: "BASE", image: IMAGES.WOOD, color: "#8B4513", description: "梁柱、斗拱等木构原料" },
  clay: { id: "clay", name: "陶土", type: "BASE", image: IMAGES.CLAY, color: "#A0522D", description: "琉璃瓦、飞檐等屋面原料" },
  pigment: { id: "pigment", name: "颜料", type: "BASE", image: IMAGES.PIGMENT, color: "#FF4500", description: "壁画、牌匾、彩绘原料" },

  // Intermediate Materials
  column: { id: "column", name: "圆柱构件", type: "INTERMEDIATE", image: IMAGES.CONSTRUCTION_SITE, color: "#D2691E", description: "支撑楼阁的72根圆柱原料" },
  brick: { id: "brick", name: "青砖构件", type: "INTERMEDIATE", image: IMAGES.CONSTRUCTION_SITE, color: "#696969", description: "楼体砌筑用青砖" },
  stone_carving: { id: "stone_carving", name: "石刻构件", type: "INTERMEDIATE", image: IMAGES.CONSTRUCTION_SITE, color: "#A9A9A9", description: "二楼《黄鹤楼记》石刻原料" },
  wood_beam: { id: "wood_beam", name: "木梁构件", type: "INTERMEDIATE", image: IMAGES.CONSTRUCTION_SITE, color: "#CD853F", description: "楼体框架用木梁" },
  wood_carving: { id: "wood_carving", name: "木雕构件", type: "INTERMEDIATE", image: IMAGES.CONSTRUCTION_SITE, color: "#DEB887", description: "门窗、藻井雕刻原料" },
  glazed_tile: { id: "glazed_tile", name: "琉璃瓦构件", type: "INTERMEDIATE", image: IMAGES.SUNSET_ROOF, color: "#FFD700", description: "楼顶金色琉璃瓦原料" },

  // Rare Materials
  main_frame: { 
    id: "main_frame", name: "主体框架", type: "RARE", image: IMAGES.CONSTRUCTION_SITE, color: "#FF8C00", 
    description: "四边套八边形钢筋混凝土框架仿木结构",
    knowledge: "黄鹤楼采用四边套八边形的钢筋混凝土框架仿木结构，由72根大圆柱支撑，体现了现代工艺与古典美学的结合。"
  },
  foundation: { 
    id: "foundation", name: "台基柱础", type: "RARE", image: IMAGES.CONSTRUCTION_SITE, color: "#808080", 
    description: "底层30米边宽的台基、支撑圆柱的柱础",
    knowledge: "底层台基边宽30米，稳如泰山。柱础则是圆柱的根基，承载着整座名楼的重量。"
  },
  eaves: { 
    id: "eaves", name: "飞檐翘角", type: "RARE", image: IMAGES.SUNSET_ROOF, color: "#DAA520", 
    description: "五层飞檐、60个向外伸展的翘角",
    knowledge: "黄鹤楼拥有五层飞檐，共60个向外伸展的翘角，形如黄鹤展翅，凌空欲飞。"
  },
  mural: { 
    id: "mural", name: "藻井壁画", type: "RARE", image: IMAGES.START_SCREEN, color: "#FF6347", 
    description: "一楼10余米高的藻井、「白云黄鹤」陶瓷壁画",
    knowledge: "一楼大厅设有10余米高的华丽藻井，正面是巨大的「白云黄鹤」陶瓷壁画，气势恢宏。"
  },
  plaque: { 
    id: "plaque", name: "牌匾宝顶", type: "RARE", image: IMAGES.COMPLETED_TOWER, color: "#FFD700", 
    description: "楼名牌匾、楼顶金色宝顶",
    knowledge: "楼名牌匾由名家题写，楼顶的金色宝顶在阳光下熠熠生辉，是黄鹤楼的最高点。"
  },

  // Final Product
  yellow_crane_tower: { 
    id: "yellow_crane_tower", name: "完整黄鹤楼", type: "FINAL", image: IMAGES.COMPLETED_TOWER, color: "#FFD700", 
    description: "外观五层、内部九层，九五至尊之意",
    knowledge: "黄鹤楼还原了「外观五层、内部九层」的形制，寓意“九五至尊”。每一层都蕴含着深厚的文化底蕴。"
  },
};

export const RECIPES = [
  // Intermediate
  { ingredients: ["stone", "wood"], result: "column" },
  { ingredients: ["stone", "clay"], result: "brick" },
  { ingredients: ["wood", "clay"], result: "wood_beam" },
  { ingredients: ["clay", "pigment"], result: "glazed_tile" },

  // Rare
  { ingredients: ["column", "wood_beam"], result: "main_frame" },
  { ingredients: ["brick", "stone"], result: "foundation" },
  { ingredients: ["glazed_tile", "wood"], result: "eaves" },
  { ingredients: ["pigment", "stone"], result: "mural" }, // Changed from clay+pigment to avoid conflict with glazed_tile
  { ingredients: ["wood", "pigment"], result: "plaque" },
];

export const FINAL_RECIPE = ["main_frame", "foundation", "eaves", "mural", "plaque"];

export type QuizCategory = "HISTORY" | "ARCHITECTURE" | "POETRY" | "LEGEND";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  hint: string;
}

export const QUIZZES: QuizQuestion[] = [
  {
    id: "h1",
    category: "HISTORY",
    question: "黄鹤楼始建于三国时期的哪个政权？",
    options: [
      { id: "A", text: "魏国" },
      { id: "B", text: "蜀国" },
      { id: "C", text: "吴国" },
      { id: "D", text: "西晋" },
    ],
    correctAnswer: "C",
    hint: "公元223年，孙权为了军事防御在蛇山修筑夏口城，并在此建楼。",
  },
  {
    id: "h2",
    category: "HISTORY",
    question: "黄鹤楼在历史上曾多次被毁，最后一次毁于清朝哪一年？",
    options: [
      { id: "A", text: "1884年" },
      { id: "B", text: "1900年" },
      { id: "C", text: "1911年" },
    ],
    correctAnswer: "A",
    hint: "光绪十年（1884年），黄鹤楼毁于火灾，此后近百年未曾重建。",
  },
  {
    id: "a1",
    category: "ARCHITECTURE",
    question: "现存黄鹤楼的建筑形制是？",
    options: [
      { id: "A", text: "外观三层，内部五层" },
      { id: "B", text: "外观五层，内部九层" },
      { id: "C", text: "外观七层，内部十一层" },
    ],
    correctAnswer: "B",
    hint: "这种设计寓意“九五至尊”，体现了名楼的高贵地位。",
  },
  {
    id: "a2",
    category: "ARCHITECTURE",
    question: "黄鹤楼屋顶的瓦片主要是什么颜色？",
    options: [
      { id: "A", text: "青灰色" },
      { id: "B", text: "翠绿色" },
      { id: "C", text: "金黄色" },
    ],
    correctAnswer: "C",
    hint: "黄鹤楼采用金色琉璃瓦，在阳光下熠熠生辉。",
  },
  {
    id: "p1",
    category: "POETRY",
    question: "“昔人已乘黄鹤去，此地空余黄鹤楼”是谁的名句？",
    options: [
      { id: "A", text: "李白" },
      { id: "B", text: "杜甫" },
      { id: "C", text: "崔颢" },
      { id: "D", text: "白居易" },
    ],
    correctAnswer: "C",
    hint: "李白曾感叹“眼前有景道不得，崔颢题诗在上头”。",
  },
  {
    id: "p2",
    category: "POETRY",
    question: "李白在黄鹤楼送别哪位好友时写下了“孤帆远影碧空尽”？",
    options: [
      { id: "A", text: "汪伦" },
      { id: "B", text: "孟浩然" },
      { id: "C", text: "杜甫" },
    ],
    correctAnswer: "B",
    hint: "这首诗名为《黄鹤楼送孟浩然之广陵》。",
  },
  {
    id: "l1",
    category: "LEGEND",
    question: "传说中，辛氏酒楼墙上的黄鹤是用什么画成的？",
    options: [
      { id: "A", text: "毛笔" },
      { id: "B", text: "橘皮" },
      { id: "C", text: "手指" },
    ],
    correctAnswer: "B",
    hint: "一位仙人用橘皮在墙上画了一只鹤，以此报答辛氏的赠酒之恩。",
  },
  {
    id: "l2",
    category: "LEGEND",
    question: "传说中，黄鹤楼是因为哪位仙人在此乘鹤而去而得名？",
    options: [
      { id: "A", text: "吕洞宾" },
      { id: "B", text: "费祎" },
      { id: "C", text: "张果老" },
    ],
    correctAnswer: "B",
    hint: "《图经》记载：“费祎登仙，尝驾黄鹤憩此，遂以名楼。”",
  },
  {
    id: "h3",
    category: "HISTORY",
    question: "黄鹤楼始建于哪个朝代？",
    options: [
      { id: "A", text: "汉代" },
      { id: "B", text: "三国" },
      { id: "C", text: "唐代" },
    ],
    correctAnswer: "B",
    hint: "始建于三国时代吴黄武二年（223年）。",
  },
  {
    id: "h4",
    category: "HISTORY",
    question: "黄鹤楼最初建造的目的是什么？",
    options: [
      { id: "A", text: "观赏风景" },
      { id: "B", text: "祭祀神灵" },
      { id: "C", text: "军事哨楼" },
    ],
    correctAnswer: "C",
    hint: "最初是作为夏口城的一座军事观察楼。",
  },
  {
    id: "a3",
    category: "ARCHITECTURE",
    question: "黄鹤楼的主楼共有多少根大圆柱支撑？",
    options: [
      { id: "A", text: "36根" },
      { id: "B", text: "72根" },
      { id: "C", text: "108根" },
    ],
    correctAnswer: "B",
    hint: "72根圆柱象征着七十二地煞，支撑起宏伟的楼体。",
  },
  {
    id: "a4",
    category: "ARCHITECTURE",
    question: "黄鹤楼屋顶共有多少个翘角？",
    options: [
      { id: "A", text: "24个" },
      { id: "B", text: "48个" },
      { id: "C", text: "60个" },
    ],
    correctAnswer: "C",
    hint: "60个翘角凌空欲飞，展现了极高的建筑艺术。",
  },
  {
    id: "p3",
    category: "POETRY",
    question: "“黄鹤楼中吹玉笛，江城五月落梅花”出自李白的哪首诗？",
    options: [
      { id: "A", text: "《黄鹤楼送孟浩然之广陵》" },
      { id: "B", text: "《与史郎中钦听黄鹤楼上吹笛》" },
      { id: "C", text: "《登金陵凤凰台》" },
    ],
    correctAnswer: "B",
    hint: "这首诗让武汉有了“江城”的美誉。",
  },
  {
    id: "p4",
    category: "POETRY",
    question: "毛泽东曾写下“烟雨莽苍苍，龟蛇锁大江”的词作是？",
    options: [
      { id: "A", text: "《沁园春·长沙》" },
      { id: "B", text: "《菩萨蛮·黄鹤楼》" },
      { id: "C", text: "《水调歌头·游泳》" },
    ],
    correctAnswer: "B",
    hint: "这首词写于1927年，展现了博大的胸怀。",
  },
  {
    id: "l3",
    category: "LEGEND",
    question: "传说中，墙上的黄鹤在跳舞时会配合什么声音？",
    options: [
      { id: "A", text: "笛声" },
      { id: "B", text: "拍手声" },
      { id: "C", text: "歌声" },
    ],
    correctAnswer: "B",
    hint: "只要客人拍手，墙上的黄鹤就会飞下来翩翩起舞。",
  },
  {
    id: "l4",
    category: "LEGEND",
    question: "传说中，仙人最后是如何离开辛氏酒楼的？",
    options: [
      { id: "A", text: "步行离去" },
      { id: "B", text: "乘船远行" },
      { id: "C", text: "跨鹤飞去" },
    ],
    correctAnswer: "C",
    hint: "仙人取出铁笛吹奏，随后跨上黄鹤，飞上云端而去。",
  },
];

export const FLOOR_INFO = [
  {
    floor: "一楼",
    title: "大厅气象",
    content: "一楼大厅气势宏伟，正面是巨大的「白云黄鹤」陶瓷壁画。大厅上方有10余米高的华丽藻井，四周悬挂着长达7米的楹联，介绍黄鹤楼的历史渊源。",
    hidden: "壁画由756块彩绘陶瓷组成，重达数吨，是目前国内最大的室内陶瓷壁画之一。"
  },
  {
    floor: "二楼",
    title: "记事石刻",
    content: "二楼正中立有唐代阎伯理撰写的《黄鹤楼记》石刻。两侧壁画分别描绘了「孙权筑城」和「周瑜设宴」的历史场景，展现了三国时期的风云变幻。",
    hidden: "《黄鹤楼记》全文仅300余字，却精辟地概括了黄鹤楼的地理位置、命名由来及建筑初衷。"
  },
  {
    floor: "三楼",
    title: "名人荟萃",
    content: "三楼陈列着唐宋名人的绣像画，如李白、崔颢、陆游等。墙上刻有历代咏黄鹤楼的名句，让游客感受到浓厚的文学气息。",
    hidden: "李白曾在此写下《黄鹤楼送孟浩然之广陵》，使“孤帆远影碧空尽”成为千古绝唱。"
  },
  {
    floor: "四楼",
    title: "当代风采",
    content: "四楼作为当代名人字画展厅，展示了许多现代书画家的作品。这里也是游客休息和欣赏现代艺术的好去处。",
    hidden: "展厅内收藏有齐白石、张大千等大师的真迹，展现了黄鹤楼在现代文化中的延续。"
  },
  {
    floor: "五楼",
    title: "极目楚天",
    content: "五楼是黄鹤楼的最高层，大厅内有巨幅《长江万里图》长卷。走出外廊，可以极目远眺，武汉三镇的壮丽景色尽收眼底。",
    hidden: "《长江万里图》长卷全长数十米，生动描绘了长江从源头到入海口的壮丽景观。"
  },
];

export const CATEGORY_DROPS: Record<QuizCategory, string[]> = {
  HISTORY: ["stone", "wood", "clay", "pigment"],
  ARCHITECTURE: ["stone", "wood", "clay", "pigment"],
  POETRY: ["stone", "wood", "clay", "pigment"],
  LEGEND: ["stone", "wood", "clay", "pigment"],
};

export type GamePhase = "START" | "PLAYING" | "SYNTHESIS" | "SUCCESS";
