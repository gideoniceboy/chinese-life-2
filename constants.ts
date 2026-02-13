import { Zone, NPC, Item, Job, PlayerStats } from './types';

export const INITIAL_STATS: PlayerStats = {
  health: 100,
  hunger: 100,
  thirst: 100,
  stamina: 100,
  money: 200, 
  face: 50,
  hskLevel: 1,
  isSick: false,
};

export const INITIAL_INVENTORY: { id: string; count: number }[] = [];

export const ZONES: Zone[] = [
  {
    id: 'residential',
    name: 'Residential Compound (小区)',
    description: 'Home, Clinic, and Neighbors. (HSK 1)',
    imageSeed: 'residential',
    npcs: ['grandma_li', 'guard_wang', 'doctor_zhang'], // Added Doctor
    minHsk: 1,
    ambientSound: 'birds'
  },
  {
    id: 'park',
    name: 'Morning Park (公园)',
    description: 'Exercise and Practice. (HSK 1)',
    imageSeed: 'park',
    npcs: ['auntie_dance', 'kid_zhu', 'ai_tutor'],
    minHsk: 1,
    ambientSound: 'nature'
  },
  {
    id: 'alley',
    name: 'Old Alley (胡同)',
    description: 'Police Station and Culture. (HSK 2-3)',
    imageSeed: 'alley',
    npcs: ['uncle_chen', 'teacher_liu', 'police_li'], // Added Police
    minHsk: 2,
    ambientSound: 'street'
  },
  {
    id: 'market',
    name: 'Street Market (菜市场)',
    description: 'Shops, Clothes, and Food. (HSK 3-4)',
    imageSeed: 'market',
    npcs: ['shopkeeper_zhang', 'butcher_zhao', 'sister_hong'], // Added Clothing Vendor
    minHsk: 3,
    ambientSound: 'crowd'
  },
  {
    id: 'cbd',
    name: 'Central Business District (CBD)',
    description: 'Offices and Restaurants. (HSK 5-6)',
    imageSeed: 'skyscraper',
    npcs: ['ceo_ma', 'hr_manager', 'waiter_wang'], // Added Waiter
    minHsk: 5,
    ambientSound: 'traffic'
  }
];

export const NPCS: Record<string, NPC> = {
  // HSK 1 - Residential
  'grandma_li': {
    id: 'grandma_li',
    name: 'Grandma Li (李奶奶)',
    role: 'Neighbor',
    personality: 'Kind, very patient. Loves to feed people.',
    avatarSeed: 'grandma',
    intro: '早！吃了吗？(Morning! Eaten?)',
    zoneId: 'residential',
    hskLevel: 1,
    shopInventory: ['baozi', 'water'],
    initialSuggestions: [
      { chinese: '吃了，谢谢。', pinyin: 'Chī le, xièxie.', english: 'I have eaten, thanks.' },
      { chinese: '没吃，我饿了。', pinyin: 'Méi chī, wǒ è le.', english: 'Not yet, I am hungry.' },
      { chinese: '李奶奶好！', pinyin: 'Lǐ nǎinai hǎo!', english: 'Hello Grandma Li!' }
    ]
  },
  'guard_wang': {
    id: 'guard_wang',
    name: 'Guard Wang (王保安)',
    role: 'Security',
    personality: 'Protective. Likes "Yes/No" answers.',
    avatarSeed: 'guard',
    intro: '你好。带伞了吗？(Hello. Brought umbrella?)',
    zoneId: 'residential',
    hskLevel: 1,
    initialSuggestions: [
      { chinese: '带了。', pinyin: 'Dài le.', english: 'I brought it.' },
      { chinese: '没有带。', pinyin: 'Méiyǒu dài.', english: 'I did not bring it.' },
      { chinese: '今天不下雨。', pinyin: 'Jīntiān bú xiàyǔ.', english: 'It won\'t rain today.' }
    ]
  },
  'doctor_zhang': {
    id: 'doctor_zhang',
    name: 'Dr. Zhang (张医生)',
    role: 'Doctor',
    personality: 'Professional, caring. Helps when you are sick.',
    avatarSeed: 'doctor',
    intro: '哪里不舒服？(Where does it hurt?)',
    zoneId: 'residential',
    hskLevel: 1,
    initialSuggestions: [
      { chinese: '我不舒服。', pinyin: 'Wǒ bù shūfu.', english: 'I don\'t feel well.' },
      { chinese: '我生病了。', pinyin: 'Wǒ shēngbìng le.', english: 'I am sick.' },
      { chinese: '我有药吗？', pinyin: 'Wǒ yǒu yào ma?', english: 'Do I have medicine?' }
    ]
  },
  // HSK 1 - Park
  'auntie_dance': {
    id: 'auntie_dance',
    name: 'Auntie Zhang (张阿姨)',
    role: 'Dancer',
    personality: 'Energetic. Loves music.',
    avatarSeed: 'dancer',
    intro: '来跳舞吧！(Come dance!)',
    zoneId: 'park',
    hskLevel: 1,
    isVendor: true,
    shopInventory: ['water', 'tea'],
    initialSuggestions: [
      { chinese: '好，我喜欢跳舞！', pinyin: 'Hǎo, wǒ xǐhuan tiàowǔ!', english: 'Okay, I like dancing!' },
      { chinese: '我想要水。', pinyin: 'Wǒ xiǎng yào shuǐ.', english: 'I want water.' },
      { chinese: '你是谁？', pinyin: 'Nǐ shì shéi?', english: 'Who are you?' }
    ]
  },
  'kid_zhu': {
    id: 'kid_zhu',
    name: 'Little Zhu (小猪)',
    role: 'Kid',
    personality: 'Playful.',
    avatarSeed: 'kid',
    intro: '我要玩球！(I want to play ball!)',
    zoneId: 'park',
    hskLevel: 1,
    initialSuggestions: [
      { chinese: '我也想玩。', pinyin: 'Wǒ yě xiǎng wán.', english: 'I want to play too.' },
      { chinese: '球在哪里？', pinyin: 'Qiú zài nǎlǐ?', english: 'Where is the ball?' },
      { chinese: '再见。', pinyin: 'Zàijiàn.', english: 'Goodbye.' }
    ]
  },
  'ai_tutor': {
    id: 'ai_tutor',
    name: 'AI Tutor (练习助手)',
    role: 'Practice Bot',
    personality: 'Encouraging.',
    avatarSeed: 'robot',
    intro: '欢迎练习！(Welcome practice!)',
    zoneId: 'park',
    hskLevel: 1,
    initialSuggestions: [
      { chinese: '我想练习口语。', pinyin: 'Wǒ xiǎng liànxí kǒuyǔ.', english: 'Practice speaking.' },
      { chinese: '你好！', pinyin: 'Nǐ hǎo!', english: 'Hello!' },
      { chinese: '请帮我。', pinyin: 'Qǐng bāng wǒ.', english: 'Please help me.' }
    ]
  },
  // HSK 2 - Alley
  'uncle_chen': {
    id: 'uncle_chen',
    name: 'Uncle Chen (陈叔叔)',
    role: 'Taxi Driver',
    personality: 'Chatty.',
    avatarSeed: 'driver',
    intro: '去哪里？(Where to?)',
    zoneId: 'alley',
    hskLevel: 2,
    initialSuggestions: [
      { chinese: '我去学校。', pinyin: 'Wǒ qù xuéxiào.', english: 'Going to school.' },
      { chinese: '一直走。', pinyin: 'Yìzhí zǒu.', english: 'Go straight.' },
      { chinese: '多少钱？', pinyin: 'Duōshǎo qián?', english: 'How much?' }
    ]
  },
  'teacher_liu': {
    id: 'teacher_liu',
    name: 'Teacher Liu (刘老师)',
    role: 'Tutor',
    personality: 'Strict.',
    avatarSeed: 'teacher',
    intro: '上课了。(Class starts.)',
    zoneId: 'alley',
    hskLevel: 2,
    initialSuggestions: [
      { chinese: '老师好！', pinyin: 'Lǎoshī hǎo!', english: 'Hello teacher!' },
      { chinese: '我不明白。', pinyin: 'Wǒ bù míngbai.', english: 'I don\'t understand.' },
      { chinese: '请再说一次。', pinyin: 'Qǐng zài shuō yí cì.', english: 'Please say again.' }
    ]
  },
  'police_li': {
    id: 'police_li',
    name: 'Officer Li (李警官)',
    role: 'Police',
    personality: 'Serious, helpful.',
    avatarSeed: 'police',
    intro: '发生什么事了？(What happened?)',
    zoneId: 'alley',
    hskLevel: 2,
    initialSuggestions: [
      { chinese: '我的钱包丢了。', pinyin: 'Wǒ de qiánbāo diū le.', english: 'Lost my wallet.' },
      { chinese: '我想问路。', pinyin: 'Wǒ xiǎng wèn lù.', english: 'Ask for directions.' },
      { chinese: '这里安全吗？', pinyin: 'Zhèlǐ ānquán ma?', english: 'Is it safe here?' }
    ]
  },
  // HSK 3 - Market
  'shopkeeper_zhang': {
    id: 'shopkeeper_zhang',
    name: 'Boss Zhang (张老板)',
    role: 'Vendor',
    personality: 'Loud.',
    avatarSeed: 'vendor',
    intro: '包子！(Baozi!)',
    zoneId: 'market',
    hskLevel: 3,
    isVendor: true,
    shopInventory: ['baozi', 'umbrella', 'medicine'],
    initialSuggestions: [
      { chinese: '我要一个包子。', pinyin: 'Wǒ yào yí gè bāozi.', english: 'One baozi please.' },
      { chinese: '太贵了！', pinyin: 'Tài guì le!', english: 'Too expensive!' },
      { chinese: '买雨伞。', pinyin: 'Mǎi yǔsǎn.', english: 'Buy umbrella.' }
    ]
  },
  'butcher_zhao': {
    id: 'butcher_zhao',
    name: 'Butcher Zhao (赵屠夫)',
    role: 'Butcher',
    personality: 'Direct.',
    avatarSeed: 'butcher',
    intro: '买肉吗？(Buy meat?)',
    zoneId: 'market',
    hskLevel: 3,
    initialSuggestions: [
      { chinese: '牛肉多少钱？', pinyin: 'Niúròu duōshǎo qián?', english: 'How much for beef?' },
      { chinese: '来一斤。', pinyin: 'Lái yì jīn.', english: 'Give me 500g.' },
      { chinese: '不买。', pinyin: 'Bù mǎi.', english: 'Not buying.' }
    ]
  },
  'sister_hong': {
    id: 'sister_hong',
    name: 'Sister Hong (红姐)',
    role: 'Clothing Vendor',
    personality: 'Fashionable, persuasive.',
    avatarSeed: 'fashion',
    intro: '新衣服，来看看！(New clothes, come look!)',
    zoneId: 'market',
    hskLevel: 3,
    isVendor: true,
    shopInventory: ['jacket', 'raincoat'],
    initialSuggestions: [
      { chinese: '这件衣服很好看。', pinyin: 'Zhè jiàn yīfu hěn hǎokàn.', english: 'This looks good.' },
      { chinese: '我要买外套。', pinyin: 'Wǒ yào mǎi wàitào.', english: 'I want to buy a jacket.' },
      { chinese: '可以试穿吗？', pinyin: 'Kěyǐ shìchuān ma?', english: 'Can I try it on?' }
    ]
  },
  // HSK 5 - CBD
  'ceo_ma': {
    id: 'ceo_ma',
    name: 'CEO Ma (马总)',
    role: 'Tech CEO',
    personality: 'Formal.',
    avatarSeed: 'suit',
    intro: '你好。(Hello.)',
    zoneId: 'cbd',
    hskLevel: 5,
    initialSuggestions: [
      { chinese: '马总好。', pinyin: 'Mǎ zǒng hǎo.', english: 'Hello CEO Ma.' },
      { chinese: '我想申请工作。', pinyin: 'Wǒ xiǎng shēnqǐng gōngzuò.', english: 'Apply for job.' },
      { chinese: '谢谢您的时间。', pinyin: 'Xièxie nín de shíjiān.', english: 'Thank you for your time.' }
    ]
  },
  'hr_manager': {
    id: 'hr_manager',
    name: 'HR Manager (人事经理)',
    role: 'HR',
    personality: 'Professional.',
    avatarSeed: 'hr',
    intro: '简历？(Resume?)',
    zoneId: 'cbd',
    hskLevel: 5,
    initialSuggestions: [
      { chinese: '带来了。', pinyin: 'Dài lái le.', english: 'Brought it.' },
      { chinese: '请问有面试吗？', pinyin: 'Qǐngwèn yǒu miànshì ma?', english: 'Any interview?' },
      { chinese: '我有经验。', pinyin: 'Wǒ yǒu jīngyàn.', english: 'I have experience.' }
    ]
  },
  'waiter_wang': {
    id: 'waiter_wang',
    name: 'Waiter Wang (王服务员)',
    role: 'Waiter',
    personality: 'Polite, fast.',
    avatarSeed: 'waiter',
    intro: '几位？想吃点什么？(How many? What to eat?)',
    zoneId: 'cbd',
    hskLevel: 4,
    isVendor: true,
    shopInventory: ['dumplings', 'noodles', 'tea'],
    initialSuggestions: [
      { chinese: '一位。', pinyin: 'Yí wèi.', english: 'Just one.' },
      { chinese: '我要吃面条。', pinyin: 'Wǒ yào chī miàntiáo.', english: 'I want noodles.' },
      { chinese: '买单。', pinyin: 'Mǎidān.', english: 'Bill please.' }
    ]
  }
};

export const JOBS: Job[] = [
  { id: 'factory', title: 'Factory Worker', description: 'Repeat simple words.', minHsk: 1, salary: 15, type: 'repetition' },
  { id: 'waiter', title: 'Waiter', description: 'Take orders.', minHsk: 2, salary: 30, type: 'repetition' },
  { id: 'broadcaster', title: 'News Broadcaster', description: 'Read news.', minHsk: 4, salary: 60, type: 'repetition' },
  { id: 'translator', title: 'Translator', description: 'Business translation.', minHsk: 5, salary: 120, type: 'translation' }
];

export const SHOP_ITEMS: Item[] = [
  { id: 'baozi', name: 'Baozi (包子)', price: 10, type: 'food', effectValue: 40 },
  { id: 'water', name: 'Water (水)', price: 5, type: 'drink', effectValue: 40 },
  { id: 'tea', name: 'Tea (茶)', price: 15, type: 'drink', effectValue: 20 },
  { id: 'umbrella', name: 'Umbrella (雨伞)', price: 50, type: 'tool', effectValue: 0 },
  { id: 'medicine', name: 'Medicine (药)', price: 100, type: 'medicine', effectValue: 100 },
  { id: 'jacket', name: 'Jacket (外套)', price: 150, type: 'clothing', effectValue: 5 }, // +5 Face
  { id: 'raincoat', name: 'Raincoat (雨衣)', price: 80, type: 'clothing', effectValue: 0 }, // Protects from rain
  { id: 'dumplings', name: 'Dumplings (饺子)', price: 30, type: 'food', effectValue: 60 },
  { id: 'noodles', name: 'Noodles (面条)', price: 25, type: 'food', effectValue: 50 }
];

export const FALLING_WORDS = [
  { text: '你好', pinyin: 'nǐ hǎo', hsk: 1 },
  { text: '谢谢', pinyin: 'xiè xie', hsk: 1 },
  { text: '喝水', pinyin: 'hē shuǐ', hsk: 1 },
  { text: '吃饭', pinyin: 'chī fàn', hsk: 1 },
  { text: '再见', pinyin: 'zài jiàn', hsk: 1 },
  { text: '明天', pinyin: 'míng tiān', hsk: 2 },
  { text: '高兴', pinyin: 'gāo xìng', hsk: 2 },
  { text: '因为', pinyin: 'yīn wèi', hsk: 2 },
  { text: '但是', pinyin: 'dàn shì', hsk: 3 },
  { text: '其实', pinyin: 'qí shí', hsk: 3 },
];