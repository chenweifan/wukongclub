import type {
  GuideArticle,
  GuideDifficulty,
  GuideKind,
  GuideStep,
  GuideTag,
} from '@/data/contracts/guide';
import type { SpoilerLevel } from '@/data/contracts/common';
import { createWikiSeed } from '@/data/seeds/encyclopedia.seed';
import { buildSealCoverUrl } from '@/utils/sealCover';

/**
 * 攻略库种子（协议阶段 2「攻略」模块）。
 *
 * ⚠️ 内容口径：全部是**本站编辑与社区作者的原创攻略文案**，不是官方资料转述。
 * 章节与妖王名取自游戏内公开内容；具体打法为演示用示例（数值与时机未做校验），
 * 页面上会常驻一句说明。`relatedEntryIds` 指向影神图词条 id，测试会校验它们真实存在。
 */
interface StepSeedInput {
  title: string;
  detail: string;
  tip?: string;
  minutes?: number;
  /** 缺省沿用攻略整体的剧透级别。 */
  spoilerLevel?: SpoilerLevel;
}

interface GuideSeedInput {
  id: string;
  title: string;
  summary: string;
  kind: GuideKind;
  difficulty: GuideDifficulty;
  chapter: number;
  version: string;
  author: string;
  updatedDaysAgo: number;
  durationMinutes: number;
  spoilerLevel: SpoilerLevel;
  tags: readonly GuideTag[];
  steps: readonly StepSeedInput[];
  relatedEntryIds?: readonly string[];
  views: number;
  likes: number;
}

export const GUIDE_SEED_INPUTS: readonly GuideSeedInput[] = [
  /* ── BOSS 攻略 ───────────────────────────────────────────────── */
  {
    id: 'guide-heixiongjing',
    title: '黑熊精：三段棍势拆解',
    summary: '把它拆成三个可预测的阶段，每个阶段只解决一个问题：起手、换气、收招。',
    kind: 'boss',
    difficulty: 'hard',
    chapter: 1,
    version: '演示版本 1.0',
    author: '本站编辑组',
    updatedDaysAgo: 2,
    durationMinutes: 12,
    spoilerLevel: 1,
    tags: ['beginner', 'story'],
    steps: [
      {
        title: '开场：先站住左边的柱子后',
        detail:
          '它的第一轮扑击几乎必定从正面来。开场绕到石柱左侧，等它扑空的硬直再打两下轻棍，不要贪第三下。',
        tip: '第一次交手只做一件事：看清它扑击的前摇。',
        minutes: 2,
      },
      {
        title: '第一阶段：只打棍势，不追身',
        detail:
          '它的横扫会把你推远。保持一棍半的距离，等它收招后向前一步接重击，打完立刻退回原位。',
        minutes: 3,
      },
      {
        title: '换气点：血量过半后的抱摔',
        detail: '血量过半时它会突然抱摔。看到它双掌下压就要侧移，这一招无法用定身术打断。',
        tip: '抱摔之后是全场最长的输出窗口，把定身术留在这里。',
        minutes: 3,
      },
      {
        title: '第三阶段：连扑与假动作',
        detail: '它会连续扑两次，第二次是假动作。数它落地次数：落地两次的才是真空档。',
        minutes: 2,
      },
      {
        title: '收招：留一次闪避的余力',
        detail: '残血时它的攻速会略微提升。宁可少打一套，也不要把体力条打空。',
        tip: '这一战真正的敌人是自己的体力条。',
        minutes: 2,
      },
    ],
    relatedEntryIds: ['wiki-heixiongjing', 'wiki-heifengshan'],
    views: 4820,
    likes: 312,
  },
  {
    id: 'guide-lingxuzi',
    title: '灵虚子：窄道上的进退',
    summary: '场地很窄，它比你快。解法不是更快的反应，而是更早的选位。',
    kind: 'boss',
    difficulty: 'normal',
    chapter: 1,
    version: '演示版本 1.0',
    author: '持棍的樵夫',
    updatedDaysAgo: 5,
    durationMinutes: 8,
    spoilerLevel: 1,
    tags: ['beginner'],
    steps: [
      {
        title: '选位：永远站在道路的宽侧',
        detail: '窄侧会被它逼到死角。进场先往右后方走两步，把战场拉到宽处。',
        minutes: 2,
      },
      {
        title: '应对突进：斜向闪避而不是后退',
        detail: '它的突进是直线的。斜向 45° 闪避能直接绕到它侧后，后退只会被顶到墙边。',
        tip: '后退是最差的选项。',
        minutes: 3,
      },
      {
        title: '输出窗口：扑空后的两次轻棍',
        detail: '扑空后有短暂的硬直，够两下轻棍。别接重击，它恢复得比你想象中快。',
        minutes: 2,
      },
      {
        title: '收尾：别追残血',
        detail: '残血时它会后跳到路尾并立刻回扑。站在原地等它回来即可。',
        minutes: 1,
      },
    ],
    relatedEntryIds: ['wiki-lingxuzi'],
    views: 3610,
    likes: 208,
  },
  {
    id: 'guide-huangfengdasheng',
    title: '黄风大圣：先定风，再谈输出',
    summary: '场地机制优先于一切：风没定住之前，任何输出都是赌博。',
    kind: 'boss',
    difficulty: 'hard',
    chapter: 2,
    version: '演示版本 1.0',
    author: '本站编辑组',
    updatedDaysAgo: 4,
    durationMinutes: 15,
    spoilerLevel: 1,
    tags: ['story'],
    steps: [
      {
        title: '开风：黄沙起来之后不要站在原地',
        detail: '黄沙会持续造成硬直。沿场地边缘移动，等沙势减弱再回中。',
        tip: '被沙困住的代价远大于少打两下。',
        minutes: 3,
      },
      {
        title: '定风珠的使用时机',
        detail: '它抬手起风的瞬间使用定风珠，可以把整轮风压直接掐掉，并获得一次长时间硬直。',
        minutes: 3,
      },
      {
        title: '风停之后：优先破防',
        detail: '风停的窗口里用重击叠破防，比连续轻击的收益高得多。',
        minutes: 3,
      },
      {
        title: '二阶段：风与近战交替',
        detail: '它会用短风掩护突进。看到脚下起沙就先侧移，再看它本体是否跟上来。',
        minutes: 3,
      },
      {
        title: '收尾：把定身术留给最后一次起风',
        detail: '最后一次起风若被打断，它就没有翻盘手段了。',
        minutes: 3,
      },
    ],
    relatedEntryIds: ['wiki-huangfengdasheng', 'wiki-huangfengling'],
    views: 5120,
    likes: 366,
  },
  {
    id: 'guide-hufengxianfeng',
    title: '虎先锋：刀路的三种破法',
    summary: '它的刀只有三种走向。认清之后，这一战就从对拼变成了出题与答题。',
    kind: 'boss',
    difficulty: 'normal',
    chapter: 2,
    version: '演示版本 1.0',
    author: '黄风岭过客',
    updatedDaysAgo: 8,
    durationMinutes: 10,
    spoilerLevel: 1,
    tags: ['beginner', 'story'],
    steps: [
      {
        title: '横斩：正面接下最省事',
        detail: '横斩伤害低，格挡后可以直接反击。三种刀路里它是唯一适合硬接的。',
        minutes: 2,
      },
      {
        title: '直刺：向左右闪，不要后退',
        detail: '直刺的距离很长，后退依然会被命中。左右闪避后能稳定打出一套。',
        minutes: 3,
      },
      {
        title: '跳斩：别急着反击',
        detail: '跳斩落地后还有一次追击。等第二段结束再动手，否则会被反打。',
        tip: '贪这一刀的人，都会再挨一次。',
        minutes: 3,
      },
      {
        title: '节奏：把战斗拆成三段',
        detail: '每次挡下横斩就推进一小段输出，不要试图一口气打死它。',
        minutes: 2,
      },
    ],
    relatedEntryIds: ['wiki-hufengxianfeng', 'wiki-wohusi'],
    views: 2980,
    likes: 174,
  },
  {
    id: 'guide-huangmei',
    title: '黄眉：把人心当下酒菜的一战',
    summary: '数值上它并不算最强，难的是它每一招都在引诱你做出错误选择。',
    kind: 'boss',
    difficulty: 'challenge',
    chapter: 3,
    version: '演示版本 1.0',
    author: '本站编辑组',
    updatedDaysAgo: 6,
    durationMinutes: 20,
    spoilerLevel: 2,
    tags: ['story', 'secret'],
    steps: [
      {
        title: '第一阶段：只守不攻',
        detail: '它的前两轮攻势都是试探，硬拼会吃亏。前 60 秒只做闪避与格挡，记录它的出招顺序。',
        minutes: 4,
      },
      {
        title: '第二阶段：识破幻象',
        detail: '场上出现第二个它时，真身的手上有光。打错目标的代价是被反打一整套。',
        tip: '看手，不看身上的光。',
        minutes: 4,
      },
      {
        title: '第三阶段：被迫的选择',
        detail: '它会给你一个看似能快速结束战斗的选项。选了它，后面的节奏会直接崩掉。',
        minutes: 4,
        spoilerLevel: 2,
      },
      {
        title: '第四阶段：把药留在最后',
        detail: '最后一段是对拼，谁的资源多谁赢。前三个阶段尽量不吃药。',
        minutes: 4,
      },
      {
        title: '收尾：不要追它的后跳',
        detail: '它的后跳之后必定接一次反击，追上去就是送。站在中间等它回来。',
        minutes: 4,
      },
    ],
    relatedEntryIds: ['wiki-huangmei', 'wiki-xiaoxitian', 'wiki-jilegu'],
    views: 6240,
    likes: 512,
  },
  {
    id: 'guide-kangjinlong',
    title: '亢金龙：浮屠界上的长枪',
    summary: '它的枪比你的棍长。解决办法只有两个：贴身，或者让它自己撞上来。',
    kind: 'boss',
    difficulty: 'challenge',
    chapter: 3,
    version: '演示版本 1.0',
    author: '小西天沙弥',
    updatedDaysAgo: 10,
    durationMinutes: 18,
    spoilerLevel: 1,
    tags: ['story'],
    steps: [
      {
        title: '距离：中距离是它最舒服的位置',
        detail: '既不要远到被突刺，也不要远到被扫。贴到枪杆范围内反而最安全。',
        minutes: 4,
      },
      {
        title: '突刺：侧闪后立刻贴身',
        detail: '侧闪之后不要回中，直接往它怀里走，它的扫击在贴身时会打空。',
        minutes: 4,
      },
      {
        title: '雷属性：别在积水处停留',
        detail: '场上有积水时它的雷击范围会扩大。把战场拉到干燥的地面。',
        tip: '浮屠界的每一层都有干燥区，只是不明显。',
        minutes: 4,
      },
      {
        title: '二阶段：龙形冲撞',
        detail: '冲撞有第二段回旋。等第二段结束再输出，那才是真正的窗口。',
        minutes: 3,
      },
      {
        title: '收尾：留一次定身',
        detail: '残血时它会连续突刺三次，定身术用来打断第一段最划算。',
        minutes: 3,
      },
    ],
    relatedEntryIds: ['wiki-kangjinlong', 'wiki-futujie'],
    views: 4180,
    likes: 288,
  },
  {
    id: 'guide-baiyanmojun',
    title: '百眼魔君：别让它看见你的后背',
    summary: '它的视野是判定机制的一部分：站在它看不见的角度，战斗难度会降一档。',
    kind: 'boss',
    difficulty: 'hard',
    chapter: 4,
    version: '演示版本 1.0',
    author: '盘丝岭织者',
    updatedDaysAgo: 9,
    durationMinutes: 16,
    spoilerLevel: 1,
    tags: ['story'],
    steps: [
      {
        title: '开场：绕到侧后方',
        detail: '正面的眼睛会先手放光。开场沿场地边缘绕到它侧后，可以白打半套。',
        minutes: 3,
      },
      {
        title: '光柱：靠移动而不是闪避',
        detail: '光柱是追踪型的，闪避的位移不够。横向持续跑动比闪避更有效。',
        tip: '闪避会把你钉在原地，跑动不会。',
        minutes: 4,
      },
      {
        title: '分身：只打有影子的',
        detail: '分身没有影子。地面上的影子是这一战最可靠的提示。',
        minutes: 4,
      },
      {
        title: '魔君之眼：集火单个眼位',
        detail: '把伤害集中在一个眼位上，破掉之后它的整体攻势会明显变慢。',
        minutes: 5,
      },
    ],
    relatedEntryIds: ['wiki-baiyanmojun', 'wiki-pansiling', 'wiki-pansidong'],
    views: 3960,
    likes: 254,
  },
  {
    id: 'guide-honghaier',
    title: '红孩儿：三昧真火的走位课',
    summary: '这一战考的其实是「什么时候不输出」。火在地上，答案在天上。',
    kind: 'boss',
    difficulty: 'hard',
    chapter: 5,
    version: '演示版本 1.0',
    author: '火焰山挑夫',
    updatedDaysAgo: 12,
    durationMinutes: 14,
    spoilerLevel: 1,
    tags: ['story'],
    steps: [
      {
        title: '开局：把火引到场边',
        detail: '它的第一轮喷火会留下持续燃烧的地面。主动往场边引，给中间留出干净区。',
        minutes: 3,
      },
      {
        title: '喷火：站在它侧面偏后',
        detail: '喷火有固定的扇形范围，侧面偏后是死角。这里能安全输出两套。',
        minutes: 3,
      },
      {
        title: '火尖枪：格挡优于闪避',
        detail: '枪的突刺判定快，闪避容易被打断。稳住格挡，反打第一段即可。',
        minutes: 3,
      },
      {
        title: '二阶段：火雨期间只跑不打',
        detail: '火雨期间全场地表伤害，任何输出都是亏的。等它落地再出手。',
        tip: '火雨是免费的读条时间，用来回体力。',
        minutes: 3,
      },
      {
        title: '收尾：留一段爆发',
        detail: '它残血会连续起跳喷火，落地后有两秒硬直，把爆发留在这里。',
        minutes: 2,
      },
    ],
    relatedEntryIds: ['wiki-honghaier', 'wiki-huoyanshan'],
    views: 4470,
    likes: 301,
  },
  {
    id: 'guide-niumowang',
    title: '牛魔王：体力分配与破防窗口',
    summary: '一场耐力战。赢的关键不在操作，而在前五分钟有没有把体力浪费掉。',
    kind: 'boss',
    difficulty: 'challenge',
    chapter: 5,
    version: '演示版本 1.0',
    author: '本站编辑组',
    updatedDaysAgo: 7,
    durationMinutes: 22,
    spoilerLevel: 2,
    tags: ['story', 'challenge'],
    steps: [
      {
        title: '前半场：只用轻击',
        detail: '它的架势值很高，重击在前半场是亏的。用轻击慢慢磨，保留体力。',
        minutes: 5,
      },
      {
        title: '突进与横扫的组合',
        detail: '这两招几乎总是连着来。挡下突进后立刻侧移，横扫会打在空处。',
        minutes: 4,
      },
      {
        title: '破防窗口：撞墙之后',
        detail: '它撞上场地边缘会短暂失神，这是全程最长的破防窗口，把重击全砸在这里。',
        tip: '主动把它往墙边引，这一战就成了引导题。',
        minutes: 5,
      },
      {
        title: '二阶段：别在它转身时贴身',
        detail: '转身带判定。保持一个身位，等它正对你再上前。',
        minutes: 4,
      },
      {
        title: '收尾：药留到第三次破防',
        detail: '将有三到四次破防窗口，最后一次通常就是击杀窗口。',
        minutes: 4,
      },
    ],
    relatedEntryIds: ['wiki-niumowang', 'wiki-huoyanshan', 'wiki-tieshangongzhu'],
    views: 5320,
    likes: 388,
  },
  {
    id: 'guide-erlangshen',
    title: '二郎神：终局之战的节奏',
    summary: '它几乎会你这边的所有招式。破解方式不是学新招，而是用得更克制。',
    kind: 'boss',
    difficulty: 'challenge',
    chapter: 6,
    version: '演示版本 1.0',
    author: '花果山旧友',
    updatedDaysAgo: 3,
    durationMinutes: 25,
    spoilerLevel: 2,
    tags: ['story', 'secret'],
    steps: [
      {
        title: '第一阶段：看它用你的哪一招',
        detail: '开场它会模仿你的起手。先别急着进攻，把它这一轮的选择记下来。',
        minutes: 5,
      },
      {
        title: '第三只眼：不要背对它',
        detail: '它的眼部攻击有蓄力提示。蓄力期间保持侧向移动，并确保自己不背对场地中央。',
        minutes: 5,
      },
      {
        title: '兵器变化：距离决定它的招式',
        detail: '远距离出枪，贴身出刀。想控制节奏就把距离固定在中段。',
        tip: '你站的位置，就是它的出招表。',
        minutes: 5,
      },
      {
        title: '二阶段：别在天上接战',
        detail: '它会跃起发动空中压制。留在地面等它落下，空中对拼没有任何收益。',
        minutes: 5,
      },
      {
        title: '终局：把定身术留到最后一轮',
        detail: '最后一轮它的攻势最密，定身术要留到那时才有意义。',
        minutes: 5,
        spoilerLevel: 2,
      },
    ],
    relatedEntryIds: ['wiki-erlangshen', 'wiki-huaguoshan', 'wiki-dashengcanqu'],
    views: 7890,
    likes: 640,
  },

  /* ── 配装攻略 ────────────────────────────────────────────────── */
  {
    id: 'guide-build-burst',
    title: '棍势爆发流：三招循环',
    summary: '把伤害压进一个十秒窗口。代价是窗口之外几乎不输出。',
    kind: 'build',
    difficulty: 'normal',
    chapter: 2,
    version: '演示版本 1.0',
    author: '本站编辑组',
    updatedDaysAgo: 1,
    durationMinutes: 10,
    spoilerLevel: 0,
    tags: ['build', 'beginner'],
    steps: [
      {
        title: '核心循环',
        detail: '轻棍两下起手 → 重击叠棍势 → 定身术定住 → 全套重击释放。三步一个循环。',
        minutes: 2,
      },
      {
        title: '为什么是两下轻棍',
        detail: '第三下轻棍会把距离拉远，导致重击落空。两下是这套循环的距离甜点。',
        tip: '多打一下，等于白送一次空挥。',
        minutes: 2,
      },
      {
        title: '词条优先级',
        detail: '棍势获取 > 重击伤害 > 体力恢复。前两个决定上限，第三个决定你能循环几轮。',
        minutes: 2,
      },
      {
        title: '不适用的场景',
        detail: '面对高频位移的敌人时这套循环很难成立，建议换成控制流。',
        minutes: 2,
      },
      {
        // 这一条刻意标成 1 级：整篇配装攻略不涉及剧情，但这一件珍玩的获取时机是剧情信息。
        // 步骤级剧透就是为了这种情况存在的 —— 只遮这一步，其余四步照常可读。
        title: '上限依赖的一件后期珍玩',
        detail:
          '这套循环的伤害上限依赖一件后期才能拿到的珍玩。在拿到之前，先把体力恢复堆起来撑住循环。',
        tip: '在此之前，这套配装的容错会明显偏低。',
        minutes: 2,
        spoilerLevel: 1,
      },
    ],
    relatedEntryIds: ['wiki-huangfengling'],
    views: 6180,
    likes: 470,
  },
  {
    id: 'guide-build-control',
    title: '定身术控制流：把节奏握在手里',
    summary: '不追求单次爆发，而是让对手永远差半拍。',
    kind: 'build',
    difficulty: 'normal',
    chapter: 3,
    version: '演示版本 1.0',
    author: '不肯过桥的僧',
    updatedDaysAgo: 11,
    durationMinutes: 9,
    spoilerLevel: 0,
    tags: ['build'],
    steps: [
      {
        title: '核心思路',
        detail:
          '定身术用来打断关键招式，而不是用来打输出。打断一次，就等于省下一次闪避与一次受伤。',
        minutes: 2,
      },
      {
        title: '什么时候放',
        detail: '等敌人抬手蓄力的瞬间放。早了会被霸体忽略，晚了就是白交。',
        tip: '定身术的价值不体现在伤害面板上。',
        minutes: 3,
      },
      {
        title: '词条优先级',
        detail: '法术冷却缩减 > 体力上限 > 元素抗性。冷却直接决定你能打断几次。',
        minutes: 2,
      },
      {
        title: '与爆发流的取舍',
        detail: '控制流的击杀时间更长，但容错高得多，适合不熟悉招式的第一周目。',
        minutes: 2,
      },
    ],
    relatedEntryIds: ['wiki-xiaoxitian'],
    views: 3420,
    likes: 226,
  },
  {
    id: 'guide-build-tank',
    title: '破防重击流：用防御换输出',
    summary: '把防御堆到能吃下一整套连招，再用手里的重兵器换回合。',
    kind: 'build',
    difficulty: 'hard',
    chapter: 4,
    version: '演示版本 1.0',
    author: '盘丝岭织者',
    updatedDaysAgo: 14,
    durationMinutes: 10,
    spoilerLevel: 0,
    tags: ['build', 'challenge'],
    steps: [
      {
        title: '核心思路',
        detail: '不闪避，格挡后立刻反打。整套配装围绕「格挡后的反击伤害」搭建。',
        minutes: 3,
      },
      {
        title: '体力是真正的血条',
        detail: '被打不是问题，体力打空才是。体力上限与恢复速度优先于任何伤害词条。',
        minutes: 3,
      },
      {
        title: '重兵器的代价',
        detail: '重击的前摇很长，必须在确认敌人硬直后再出手，否则会被反打。',
        minutes: 2,
      },
      {
        title: '适用与不适用',
        detail: '对单体重击型敌人极强，对多目标与高频突进型很吃亏。',
        minutes: 2,
      },
    ],
    relatedEntryIds: ['wiki-pansiling'],
    views: 2760,
    likes: 168,
  },

  /* ── 结局攻略 ────────────────────────────────────────────────── */
  {
    id: 'guide-ending-branches',
    title: '结局分支与达成条件',
    summary: '把已知的结局分歧点列清楚：哪一步选了什么，最后会走到哪里。',
    kind: 'ending',
    difficulty: 'normal',
    chapter: 6,
    version: '演示版本 1.0',
    author: '本站编辑组',
    updatedDaysAgo: 5,
    durationMinutes: 12,
    spoilerLevel: 2,
    tags: ['ending', 'story'],
    steps: [
      {
        title: '前置：先完成主线推进',
        detail: '存在两个结局分支点，都发生在第六章之前的关键节点上，错过无法回补。',
        minutes: 2,
      },
      {
        title: '分支点一：是否选择听取',
        detail: '面对关键 NPC 的请求时，「听完」与「打断」会导向不同的后续对话与结局判定。',
        minutes: 3,
        spoilerLevel: 2,
      },
      {
        title: '分支点二：六根的归还方式',
        detail: '六根集齐后的处理方式决定最终分歧。这里没有回头路，建议先存档。',
        tip: '在分歧点前手动存档，是看全结局最省时间的方式。',
        minutes: 3,
      },
      {
        title: '结局一：完整流程的收束',
        detail: '完成全部前置并选择常规路径即可到达，叙事上是最完整的一条。',
        minutes: 2,
        spoilerLevel: 2,
      },
      {
        title: '结局二：条件更苛刻的那条',
        detail: '需要额外完成隐藏前置，且中途不能触发某些事件。',
        minutes: 2,
        spoilerLevel: 2,
      },
    ],
    relatedEntryIds: ['wiki-huaguoshan', 'wiki-dashengcanqu'],
    views: 9120,
    likes: 706,
  },
  {
    id: 'guide-ending-secret',
    title: '隐藏结局：前置条件清单',
    summary: '按顺序核对这份清单，任何一条没做都会导致最终分歧不成立。',
    kind: 'ending',
    difficulty: 'challenge',
    chapter: 6,
    version: '演示版本 1.0',
    author: '花果山旧友',
    updatedDaysAgo: 4,
    durationMinutes: 18,
    spoilerLevel: 2,
    tags: ['ending', 'secret', 'collect'],
    steps: [
      {
        title: '条件一：三个隐藏地点的探索',
        detail: '三处隐藏地点都要进入过，其中一处在第六章之外，需要回头补。',
        minutes: 4,
        spoilerLevel: 2,
      },
      {
        title: '条件二：不击杀特定敌人',
        detail: '有一个敌人从头到尾都不能击杀，误杀之后当周目无法补救。',
        tip: '遇到不主动攻击的敌人，一律绕开。',
        minutes: 3,
      },
      {
        title: '条件三：听完三段对话',
        detail: '三段可跳过的对话必须全部听完，跳过会导致标记不成立。',
        minutes: 3,
      },
      {
        title: '条件四：收集进度门槛',
        detail: '影神图收集进度达到一定比例，具体阈值以当前版本为准。',
        minutes: 3,
      },
      {
        title: '核对与补救',
        detail: '第六章最终战前是最后的核对点，此时仍可回头补前三项。',
        minutes: 3,
        spoilerLevel: 2,
      },
      {
        title: '达成后的差异',
        detail: '最终分歧会多出一段内容，与前一条结局在收束方式上完全不同。',
        minutes: 2,
        spoilerLevel: 2,
      },
    ],
    relatedEntryIds: ['wiki-huaguoshan', 'wiki-shuiliandong', 'wiki-liuermihou'],
    views: 6840,
    likes: 528,
  },
  {
    id: 'guide-ending-collect',
    title: '全收集路线规划：一周目能拿到什么',
    summary: '按章节排的收集顺序，尽量不回头。拿不到的条目会明确标注「二周目」。',
    kind: 'ending',
    difficulty: 'hard',
    chapter: 6,
    version: '演示版本 1.0',
    author: '本站编辑组',
    updatedDaysAgo: 16,
    durationMinutes: 20,
    spoilerLevel: 1,
    tags: ['collect', 'ending'],
    steps: [
      {
        title: '第一章：先补影神图基础词条',
        detail: '第一章的收集压力最小，适合用来熟悉收集点标记方式。',
        minutes: 3,
      },
      {
        title: '第二章至第四章：顺手收集',
        detail: '这三章的收集点基本在主线上，绕路成本很低，不要跳过。',
        minutes: 5,
      },
      {
        title: '第五章：需要回头的一项',
        detail: '有一件珍玩在第五章主线结束后会消失，务必在推进主线前取。',
        tip: '这是全流程最容易漏的一项。',
        minutes: 4,
      },
      {
        title: '第六章：收集与结局的分叉',
        detail: '第六章的收集行为会影响某些判定，建议先完成收集再打最终战。',
        minutes: 4,
        spoilerLevel: 2,
      },
      {
        title: '一周目拿不到的部分',
        detail: '少量条目需要二周目才能补齐，路线文档里已单独标注。',
        minutes: 4,
      },
    ],
    relatedEntryIds: ['wiki-heifengshan', 'wiki-huoyanshan'],
    views: 5240,
    likes: 392,
  },
];

const KIND_GLYPH: Record<GuideKind, string> = {
  boss: '战',
  build: '装',
  ending: '终',
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** 展开成契约：补上步骤 id、封面、关联词条名与发布时间。 */
export function createGuideSeed(now: Date): GuideArticle[] {
  // 关联词条的名字在播种时一次性解析好（见 GuideRelatedEntry 的注释：刻意冗余）
  const entryNames = new Map(createWikiSeed().map((entry) => [entry.id, entry.name]));

  return GUIDE_SEED_INPUTS.map((input) => ({
    id: input.id,
    title: input.title,
    summary: input.summary,
    kind: input.kind,
    difficulty: input.difficulty,
    chapter: input.chapter as GuideArticle['chapter'],
    version: input.version,
    author: input.author,
    updatedAt: new Date(now.getTime() - input.updatedDaysAgo * DAY_MS).toISOString(),
    durationMinutes: input.durationMinutes,
    spoilerLevel: input.spoilerLevel,
    tags: input.tags,
    steps: input.steps.map<GuideStep>((step, index) => ({
      id: `${input.id}:step:${index + 1}`,
      title: step.title,
      detail: step.detail,
      ...(step.tip === undefined ? {} : { tip: step.tip }),
      ...(step.minutes === undefined ? {} : { minutes: step.minutes }),
      spoilerLevel: step.spoilerLevel ?? input.spoilerLevel,
    })),
    relatedEntries: (input.relatedEntryIds ?? []).map((id) => ({
      id,
      name: entryNames.get(id) ?? id,
    })),
    coverUrl: buildSealCoverUrl(input.title, KIND_GLYPH[input.kind]),
    views: input.views,
    likes: input.likes,
  }));
}

export const GUIDE_SEED_COUNT = GUIDE_SEED_INPUTS.length;
