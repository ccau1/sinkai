import { type Locale } from '@/i18n/config';

export interface BlogPost {
  slug: string;
  date: string;
  coverImage: string;
  translations: Record<Locale, {
    title: string;
    excerpt: string;
    content: string;
  }>;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'mountain-area-reality',
    date: '2024-03-15',
    coverImage: '/images/parallax-layer1.jpg',
    translations: {
      'en': {
        title: 'Mountain Area Reality: Life in Guizhou\'s Impoverished Regions',
        excerpt: 'Guizhou Province covers 67,992 square kilometres, about 1.8% of China\'s total area. 92.5% of the province is highland mountains.',
        content: `
## Geography and Landscape

Guizhou Province covers **67,992 square kilometres**, approximately 1.8% of China's total land area. Located inland in southwestern China, the province is characterized by its dramatic karst topography — 92.5% of the land is highland mountains, with rugged limestone peaks, steep valleys, underground rivers, and numerous cave systems at altitudes ranging from **1,000 to 2,900 metres** above sea level.

The mountainous terrain is relentless. Everywhere you look are unending, uneven stone mountains — a landscape that is stunningly beautiful but brutally unforgiving for those who must make their living from it.

## Climate and Livelihood

The province experiences an annual rainfall of 1,000 to 1,500 millimetres, with an average temperature of 14-16°C. However, due to barren mountain soil and steep terrain, most areas are unsuitable for farming. Only small portions of terraced fields near water sources at mountain feet are cultivable, yielding just **one harvest per year**.

Farmers cultivate crops including rice, wheat, maize, and potatoes. The waterlogged fields create a nutrient-poor environment where staple crops struggle to thrive. This single annual harvest makes food security a constant concern.

## Poverty Statistics

Guizhou remains one of China's poorest regions. Key challenges include:

- **49 ethnic minorities** inhabit the province, each with distinct cultures and languages
- **Basic supplies and healthcare** are severely lacking in remote mountain villages
- **High mortality rates** from accidents and preventable diseases
- Most young people leave for coastal cities, leaving behind elderly and children
- Infrastructure development is slow due to mountainous terrain

## Our Focus Areas

Sin Kai concentrates its efforts in the most impoverished mountain villages where:

- Schools are unsafe mud-brick structures with leaking roofs
- Children walk 2-3 hours daily on dangerous mountain paths to attend school
- Clean drinking water requires walking long distances
- Healthcare facilities are non-existent in remote areas

Through your generous donations, we have built **18 Hope Schools** and sponsored thousands of students to complete their education.
        `.trim(),
      },
      'zh-CN': {
        title: '山区知多些：贵州贫困山区的真实面貌',
        excerpt: '贵州省面积67,992平方公里，约占全中国总面积之1.8%。其中92.5%都是高原山脉。',
        content: `
## 地理与地貌

贵州省面积**67,992平方公里**，约占全中国总面积的1.8%。地处中国内陆西南部，全省以壮观的喀斯特地形为特征——92.5%的土地为高原山脉，拥有崎岖的石灰岩山峰、陡峭的山谷、地下河流和众多洞穴系统，海拔高度从**1,000至2,900公尺**不等。

山地地形连绵不绝。放眼所及尽是不平整的石山——景色壮丽，但对必须靠土地谋生的人来说却是极为严酷的环境。

## 气候与生计

全省年降雨量为1,000至1,500毫米，平均气温14-16°C。然而，由于山区土壤贫瘠、地形陡峭，大部分地方不适合耕种。只有在山脚靠近水源的小部分梯田可种植，每年**仅得一造收成**。

农民种植水稻、小麦、玉米和马铃薯等作物。水浸的田地造成养分贫乏的环境，主要作物难以茁壮成长。这每年一次的收成使粮食安全成为持续的忧虑。

## 贫困数据

贵州仍然是中国最贫困的地区之一。主要挑战包括：

- 全省居住着**49个少数民族**，各有独特的文化和语言
- 偏远山村的**基本物资和医疗服务**严重不足
- **意外和可预防疾病的死亡率**偏高
- 大部分年轻人前往沿海城市打工，留下老人和儿童
- 由于山地地形，基础设施发展缓慢

## 我们的重点关注区域

善启将精力集中在最贫困的山村，那里的情况是：

- 学校是不安全的泥砖结构，屋顶漏水
- 孩子们每天要在危险的山路上走2-3小时才能上学
- 清洁饮用水需要走很远的路去取
- 偏远地区不存在医疗设施

通过您的慷慨捐助，我们已兴建了**18所希望学校**，并资助了数千名学生完成学业。
        `.trim(),
      },
      'zh-TW': {
        title: '山區知多些：貴州貧困山區的真實面貌',
        excerpt: '貴州省面積67,992平方公里，約佔全中國總面積之1.8%。其中92.5%都是高原山脈。',
        content: `
## 地理與地貌

貴州省面積**67,992平方公里**，約佔全中國總面積的1.8%。地處中國內陸西南部，全省以壯觀的喀斯特地形為特徵——92.5%的土地為高原山脈，擁有崎嶇的石灰岩山峰、陡峭的山谷、地下河流和眾多洞穴系統，海拔高度從**1,000至2,900公尺**不等。

山地地形連綿不絕。放眼所及盡是不平整的石山——景色壯麗，但對必須靠土地謀生的人來說卻是極為嚴酷的環境。

## 氣候與生計

全省年降雨量為1,000至1,500毫米，平均氣溫14-16°C。然而，由於山區土壤貧瘠、地形陡峭，大部分地方不適合耕種。只有在山腳靠近水源的小部分梯田可種植，每年**僅得一造收成**。

農民種植水稻、小麥、玉米和馬鈴薯等作物。水浸的田地造成養分貧乏的環境，主要作物難以茁壯成長。這每年一次的收成使糧食安全成為持續的憂慮。

## 貧困數據

貴州仍然是中國最貧困的地區之一。主要挑戰包括：

- 全省居住著**49個少數民族**，各有獨特的文化和語言
- 偏遠山村的**基本物資和醫療服務**嚴重不足
- **意外和可預防疾病的死亡率**偏高
- 大部分年輕人前往沿海城市打工，留下老人和兒童
- 由於山地地形，基礎設施發展緩慢

## 我們的重點關注區域

善啟將精力集中在最貧困的山村，那裡的情況是：

- 學校是不安全的泥磚結構，屋頂漏水
- 孩子們每天要在危險的山路上走2-3小時才能上學
- 清潔飲用水需要走很遠的路去取
- 偏遠地區不存在醫療設施

通過您的慷慨捐助，我們已興建了**18所希望學校**，並資助了數千名學生完成學業。
        `.trim(),
      },
    },
  },
  {
    slug: 'snow-disaster-2008',
    date: '2024-02-10',
    coverImage: '/gallery/snow/16_01s.jpg',
    translations: {
      'en': {
        title: '2008 Snow Disaster: Emergency Relief in Guizhou',
        excerpt: 'In 2008, severe snowstorms devastated Guizhou Province. Sin Kai quickly organised relief efforts, distributing rice and quilts to over 2,300 extreme hardship households.',
        content: `
## The Disaster

In early 2008, an extremely severe snowstorm swept across Guizhou Province, the worst in 50 years. Mountain roads were blocked, power lines collapsed, and communication was cut off. Temperatures plummeted to record lows, leaving many villages isolated and without basic supplies.

## Our Response

Sin Kai Charity Fund immediately mobilised volunteers and resources to provide emergency relief. Within days of the disaster, our teams were on the ground in the hardest-hit mountain villages.

### Relief Materials Distributed:

- **Over 1,000 bags** of rice to starving families
- **More than 2,000 quilts** and blankets to those without heating
- **Emergency medical supplies** for frostbite and cold-related illnesses
- **Warm clothing** for children and elderly residents

The relief effort reached **2,300+ extreme hardship households** across the most affected regions of Guizhou.

## On the Ground

Our volunteers trekked through snow-blocked mountain paths for hours to reach isolated villages. Many areas were inaccessible by vehicle, requiring volunteers to carry supplies on foot across treacherous terrain.

The photos in our gallery show both the devastation of the snowstorm and the gratitude of the recipients. These images serve as a powerful reminder of why our work is so urgently needed.
        `.trim(),
      },
      'zh-CN': {
        title: '2008年雪灾：贵州紧急救援行动',
        excerpt: '2008年初，极严峻的雪灾风暴席卷贵州省。善启迅速组织救援，向2,300多个特困户派发大米和棉被。',
        content: `
## 灾难经过

2008年初，一场极为严重的雪灾席卷贵州省，是50年来最严重的雪灾。山区道路被封锁，电线倒塌，通讯中断。气温骤降至创纪录的低点，许多村庄与外界隔绝，缺乏基本物资。

## 我们的响应

善启慈善基金会立即动员义工和资源提供紧急救援。在灾难发生后的数天内，我们的团队已抵达受灾最严重的山村。

### 派发的救援物资：

- **超过1,000包**大米给饥饿的家庭
- **超过2,000张**棉被和毯子给没有供暖的人们
- **紧急医疗用品**用于冻伤和寒冷相关疾病
- **保暖衣物**给儿童和老年居民

救援行动覆盖了贵州受灾最严重地区的**2,300多个特困户**。

## 实地情况

我们的义工在雪封的山路上徒步数小时，才能到达与外界隔绝的村庄。许多地区车辆无法到达，需要义工在危险的地形上徒步搬运物资。
        `.trim(),
      },
      'zh-TW': {
        title: '2008年雪災：貴州緊急救援行動',
        excerpt: '2008年初，極嚴峻的雪災風暴席捲貴州省。善啟迅速組織救援，向2,300多個特困戶派發大米和棉被。',
        content: `
## 災難經過

2008年初，一場極為嚴重的雪災席捲貴州省，是50年來最嚴重的雪災。山區道路被封鎖，電線倒塌，通訊中斷。氣溫驟降至創紀錄的低點，許多村莊與外界隔絕，缺乏基本物資。

## 我們的響應

善啟慈善基金會立即動員義工和資源提供緊急救援。在災難發生後的數天內，我們的團隊已抵達受災最嚴重的山村。

### 派發的救援物資：

- **超過1,000包**大米給飢餓的家庭
- **超過2,000張**棉被和毯子給沒有供暖的人們
- **緊急醫療用品**用於凍傷和寒冷相關疾病
- **保暖衣物**給兒童和老年居民

救援行動覆蓋了貴州受災最嚴重地區的**2,300多個特困戶**。

## 實地情況

我們的義工在雪封的山路上徒步數小時，才能到達與外界隔絕的村莊。許多地區車輛無法到達，需要義工在危險的地形上徒步搬運物資。
        `.trim(),
      },
    },
  },
  {
    slug: 'school-building-programme',
    date: '2024-01-20',
    coverImage: '/gallery/schools-new/06_osch_32s.jpg',
    translations: {
      'en': {
        title: 'Hope School Building Programme: From Danger to Safety',
        excerpt: 'Sin Kai has built 18 Hope Schools in Guizhou\'s impoverished mountainous areas, transforming dangerous mud-brick structures into safe, bright learning environments.',
        content: `
## The Problem: Dangerous Old Schools

Before Sin Kai's intervention, schools in Guizhou's impoverished mountain villages were typically:

- **Mud-brick structures** with crumbling walls
- **Leaking roofs** that let rain pour into classrooms
- **No proper flooring** — children sat on cold dirt or stone
- **No windows or glass** — dark, dim learning environments
- **Shared spaces** — multiple grades in one room
- **No sanitation facilities** — no toilets or running water

These dangerous structures posed a daily risk to children who walked hours each day just to attend school.

## Our Approach

Sin Kai works with local governments and communities to build new schools through a collaborative model:

1. **Local government provides** matching funds for construction
2. **Village families contribute** labour (投工投勞)
3. **Sin Kai donors fund** the majority of construction costs
4. **Three-phase payment system** tied to construction milestones

### Quality Standards:

- Reinforced concrete construction
- Proper roofing with insulation
- Glass windows for natural light
- Separate classrooms for each grade
- Clean water and sanitation facilities
- Playground and sports areas

## Results

To date, **18 Hope Schools** have been completed, serving thousands of children who previously had no safe place to learn. Each school is a beacon of hope for the entire community.
        `.trim(),
      },
      'zh-CN': {
        title: '建校援助计划：从危房到安全校舍',
        excerpt: '善启在贵州贫困山区已兴建18所希望学校，将危险的泥砖结构转变为安全、明亮的学习环境。',
        content: `
## 问题：危险的旧校舍

在善启介入之前，贵州贫困山村学校通常是这样的：

- **泥砖结构**，墙壁 crumble
- **屋顶漏水**，雨水灌入课室
- **没有地板**——孩子们坐在冰冷的泥土或石头上
- **没有窗户或玻璃**——昏暗的学习环境
- **共用空间**——多个年级在一个房间上课
- **没有卫生设施**——没有厕所或自来水

这些危险的建筑每天危及那些要走数小时山路上学的孩子。

## 我们的方法

善启与地方政府和社区合作，通过协作模式兴建新学校：

1. **地方政府提供** 配套建设资金
2. **村民家庭贡献** 劳动力（投工投劳）
3. **善启捐助者资助** 大部分建设费用
4. **三期付款制度** 与建设里程碑挂钩

### 质量标准：

- 钢筋混凝土结构
- 有保温层的合适屋顶
- 玻璃窗提供自然采光
- 每个年级有独立课室
- 清洁饮用水和卫生设施
- 操场和运动区域

## 成果

迄今为止，已完成**18所希望学校**，为数千名先前没有安全学习场所的孩子服务。每所学校都是整个社区的希望灯塔。
        `.trim(),
      },
      'zh-TW': {
        title: '建校援助計劃：從危房到安全校舍',
        excerpt: '善啟在貴州貧困山區已興建18所希望學校，將危險的泥磚結構轉變為安全、明亮的學習環境。',
        content: `
## 問題：危險的舊校舍

在善啟介入之前，貴州貧困山村學校通常是這樣的：

- **泥磚結構**，牆壁 crumble
- **屋頂漏水**，雨水灌入課室
- **沒有地板**——孩子們坐在冰冷的泥土或石頭上
- **沒有窗戶或玻璃**——昏暗的學習環境
- **共用空間**——多個年級在一個房間上課
- **沒有衛生設施**——沒有廁所或自來水

這些危險的建築每天危及那些要走數小時山路上學的孩子。

## 我們的方法

善啟與地方政府和社區合作，通過協作模式興建新學校：

1. **地方政府提供** 配套建設資金
2. **村民家庭貢獻** 勞動力（投工投勞）
3. **善啟捐助者資助** 大部分建設費用
4. **三期付款制度** 與建設里程碑掛鉤

### 質量標準：

- 鋼筋混凝土結構
- 有保溫層的合適屋頂
- 玻璃窗提供自然採光
- 每個年級有獨立課室
- 清潔飲用水和衛生設施
- 操場和運動區域

## 成果

迄今為止，已完成**18所希望學校**，為數千名先前沒有安全學習場所的孩子服務。每所學校都是整個社區的希望燈塔。
        `.trim(),
      },
    },
  },
  {
    slug: 'student-aid-programme',
    date: '2023-12-05',
    coverImage: '/images/parallax-layer4.jpg',
    translations: {
      'en': {
        title: 'Student Dream Aid Programme: Education Changes Destiny',
        excerpt: 'Our Dream Programme sponsors impoverished students from primary school through university, prioritising orphans and children with disabilities.',
        content: `
## The Dream Programme

The Student Dream Aid Programme (助學圓夢計劃) is Sin Kai's flagship education initiative. We believe that education is the most powerful tool to break the cycle of poverty.

## Eligibility Criteria

Student data comes from:
- **Volunteer records** during school visits in Guizhou's impoverished areas
- **Recommendations** from school principals and village committees
- **Priority given to**: orphans, children with disabilities, and children from single-parent families

### Requirements:

- Must be from a registered poverty household (貧困戶)
- Must demonstrate commitment to education
- Sponsors can correspond with students to learn about their academic progress and family situation

## Sponsorship Levels

The programme covers students from **primary school through postgraduate studies**:

| Level | Duration | Support Provided |
|-------|----------|-----------------|
| Primary | 6 years | Tuition, books, supplies |
| Secondary | 3-6 years | Tuition, boarding, books |
| University | 4 years | Tuition, living expenses |

## Monitoring and Accountability

Sin Kai maintains strict oversight:
- Regular correspondence with school principals about student progress
- Local Youth League committees monitor the use of aid funds
- Each sponsored student commits to completing a 6-year programme
- Annual review of student academic performance and family situation

## Impact

Thousands of students have completed their education through this programme, many becoming the first in their families to attend university. These graduates return to their communities as teachers, doctors, and leaders — creating a virtuous cycle of positive change.
        `.trim(),
      },
      'zh-CN': {
        title: '助学圆梦计划：教育改变命运',
        excerpt: '我们的圆梦计划资助从小学到大学的贫困学生，优先考虑孤儿和残障儿童。',
        content: `
## 圆梦计划

助学圆梦计划是善启的旗舰教育项目。我们相信教育是打破贫困循环的最有力工具。

## 受助资格

学生资料来源于：
- **义工纪录**——在贵州贫困山区探访学校时所得
- **推荐**——由学校校长和村委会推荐
- **优先取录**：孤儿、残障儿童、单亲家庭儿童

### 要求：

- 必须是登记在册的贫困户
- 必须表现出对教育的承诺
- 助学者可以与学生通信，了解其学业和家庭状况

## 资助级别

该计划覆盖从**小学到研究生**的学生：

| 级别 | 时长 | 提供的支持 |
|------|------|-----------|
| 小学 | 6年 | 学费、书本、学习用品 |
| 中学 | 3-6年 | 学费、寄宿费、书本 |
| 大学 | 4年 | 学费、生活费 |

## 监察和问责

善启保持严格的监督：
- 定期与学校校长通信了解学生进度
- 委托当地团委监察助学款项的运作
- 每位受助学生承诺完成六年课程
- 年度审查学生学业表现和家庭状况

## 影响

数千名学生通过该计划完成了学业，其中许多人是家庭中第一个上大学的。这些毕业生回到社区成为教师、医生和领导者——创造了积极变革的良性循环。
        `.trim(),
      },
      'zh-TW': {
        title: '助學圓夢計劃：教育改變命運',
        excerpt: '我們的圓夢計劃資助從小學到大學的貧困學生，優先考慮孤兒和殘障兒童。',
        content: `
## 圓夢計劃

助學圓夢計劃是善啟的旗艦教育項目。我們相信教育是打破貧困循環的最有力工具。

## 受助資格

學生資料來源於：
- **義工紀錄**——在貴州貧困山區探訪學校時所得
- **推薦**——由學校校長和村委會推薦
- **優先取錄**：孤兒、殘障兒童、單親家庭兒童

### 要求：

- 必須是登記在冊的貧困戶
- 必須表現出對教育的承諾
- 助學人可以與學生通信，了解其學業和家庭狀況

## 資助級別

該計劃覆蓋從**小學到研究生**的學生：

| 級別 | 時長 | 提供的支持 |
|------|------|-----------|
| 小學 | 6年 | 學費、書本、學習用品 |
| 中學 | 3-6年 | 學費、寄宿費、書本 |
| 大學 | 4年 | 學費、生活費 |

## 監察和問責

善啟保持嚴格的監督：
- 定期與學校校長通信了解學生進度
- 委託當地團委監察助學款項的運作
- 每位受助學生承諾完成六年課程
- 年度審查學生學業表現和家庭狀況

## 影響

數千名學生通過該計劃完成了學業，其中許多人是家庭中第一個上大学的。這些畢業生回到社區成為教師、醫生和領導者——創造了積極變革的良性循環。
        `.trim(),
      },
    },
  },
  {
    slug: 'mid-autumn-elderly-care',
    date: '2023-09-20',
    coverImage: '/images/mid-autumn-event.jpg',
    translations: {
      'en': {
        title: 'Mid-Autumn Love for the Elderly: Charity in Hong Kong',
        excerpt: 'Each year before the Mid-Autumn Festival, Sin Kai organises events to distribute festival gifts to elderly residents living alone across Hong Kong.',
        content: `
## Annual Tradition

The Mid-Autumn Love for the Elderly (中秋愛心敬老活動) has been a Sin Kai tradition for over a decade. Each year before the Mid-Autumn Festival, our volunteers visit housing estates across Hong Kong to bring warmth and companionship to elderly residents living alone.

## What We Distribute

Each elderly recipient receives a care package containing:

- **Mid-Autumn festival mooncakes** — traditional pastries for the celebration
- **Fresh seasonal fruit** — apples, pears, oranges
- **Daily necessities** — rice, cooking oil, tissues
- **Handwritten greeting cards** — personal messages from volunteers

## Event Details

- **When**: Annually, 1-2 weeks before the Mid-Autumn Festival
- **Where**: Multiple public housing estates across Hong Kong
- **Who**: Elderly residents aged 65+ living alone
- **How many**: Over 1,400 elderly residents served each year

## Volunteer Involvement

Our volunteers do more than just distribute goods — they spend time chatting with the elderly, listening to their stories, and providing much-needed companionship. For many recipients, this visit is the highlight of their month.

## Funding

The event is funded entirely through proceeds from our annual **Charity Mooncake Sale**. Every mooncake purchased helps fund this meaningful outreach programme.
        `.trim(),
      },
      'zh-CN': {
        title: '中秋爱心敬老活动：在港慈善事业',
        excerpt: '每年中秋节前夕，善启组织活动向香港各地的独居长者派发节日礼物。',
        content: `
## 年度传统

中秋爱心敬老活动是善启十多年来一直坚持的传统。每年中秋节前夕，我们的义工走访香港多个屋村，为独居长者带去温暖和陪伴。

## 派发的物品

每位长者受助者收到包含以下物品的关爱包：

- **中秋月饼**——节日传统糕点
- **新鲜时令水果**——苹果、梨、橙子
- **日用品**——大米、食用油、纸巾
- **手写贺卡**——来自义工的个人祝福

## 活动详情

- **时间**：每年中秋节前1-2周
- **地点**：香港多个公共屋村
- **对象**：65岁以上的独居长者
- **人数**：每年服务超过1,400位长者

## 义工参与

我们的义工不只是派发物品——他们会与长者聊天、倾听他们的故事、提供急需的陪伴。对许多受助者来说，这次探访是他们当月最期待的时刻。

## 资金来源

活动完全由我们年度**慈善月饼义卖**的收益资助。每购买一盒月饼都在支持这项有意义的 outreach 计划。
        `.trim(),
      },
      'zh-TW': {
        title: '中秋愛心敬老活動：在港慈善事業',
        excerpt: '每年中秋節前夕，善啟組織活動向香港各地的獨居長者派發節日禮物。',
        content: `
## 年度傳統

中秋愛心敬老活動是善啟十多年來一直堅持的傳統。每年中秋節前夕，我們的義工走訪香港多個屋村，為獨居長者帶去溫暖和陪伴。

## 派發的物品

每位長者受助者收到包含以下物品的關愛包：

- **中秋月餅**——節日傳統糕點
- **新鮮時令水果**——蘋果、梨、橙子
- **日用品**——大米、食用油、紙巾
- **手寫賀卡**——來自義工的個人祝福

## 活動詳情

- **時間**：每年中秋節前1-2週
- **地點**：香港多個公共屋村
- **對象**：65歲以上的獨居長者
- **人數**：每年服務超過1,400位長者

## 義工參與

我們的義工不只是派發物品——他們會與長者聊天、傾聽他們的故事、提供急需的陪伴。對許多受助者來說，這次探訪是他們當月最期待的時刻。

## 資金來源

活動完全由我們年度**慈善月餅義賣**的收益資助。每購買一盒月餅都在支持這項有意義的 outreach 計劃。
        `.trim(),
      },
    },
  },
  {
    slug: 'charity-mooncake-sale',
    date: '2023-08-15',
    coverImage: '/images/mooncake.jpg',
    translations: {
      'en': {
        title: 'Charity Mooncake Sale: Sweet Treats for a Good Cause',
        excerpt: 'Sin Kai\'s annual charity mooncake sale has funded the construction of 18 Hope Schools in Guizhou. All proceeds go directly to school building projects.',
        content: `
## About Our Mooncakes

Each year before the Mid-Autumn Festival, Sin Kai sells premium handmade mooncakes with **100% of proceeds** going directly to school building projects in Guizhou's impoverished mountainous areas.

## Mooncake Details

- **Type**: Double Yolk White Lotus Seed Paste Mooncake (雙黃白蓮蓉月餅)
- **Packaging**: Premium gift box, 4 pieces per box
- **Net Weight**: 750 grams per box
- **Production**: 100% Hong Kong made by experienced chefs at "Light Vegetarian Restaurant" (普光齋)
- **Price**: HK$200 per box
- **Delivery**: Free for orders of 20+ boxes

## Impact

Over the years, mooncake sale proceeds have funded the construction of **18 Hope Schools** in Guizhou. Each box of mooncakes purchased represents a direct contribution to giving children in impoverished mountain villages a safe place to learn.

## How to Order

Contact us via phone (2735 1122) or email (info@sinkai.org) to place your order. Corporate bulk orders are welcome.
        `.trim(),
      },
      'zh-CN': {
        title: '慈善月饼义卖：甜蜜善举',
        excerpt: '善启年度慈善月饼义卖已资助兴建了贵州18所希望学校。所有收益直接拨作建校项目。',
        content: `
## 关于我们的月饼

每年中秋节前夕，善启售卖优质手工月饼，**100%的收益**直接拨作贵州贫困山区的建校项目。

## 月饼详情

- **饼类**：双黄白莲蓉月饼
- **包装**：精美礼盒包装，每盒4个装
- **总净重**：每盒750克
- **制造**：百分百香港制造，由香港「普光斋」经验饼师主理
- **售价**：每盒200元
- **送货**：购满20盒可免费送货

## 影响

多年来，月饼义卖收益已资助兴建了贵州**18所希望学校**。每购买一盒月饼都代表着为贫困山村的孩子们提供安全学习场所的直接贡献。

## 如何订购

通过电话（2735 1122）或电邮（info@sinkai.org）联系我们下单。欢迎企业批量订购。
        `.trim(),
      },
      'zh-TW': {
        title: '慈善月餅義賣：甜蜜善舉',
        excerpt: '善啟年度慈善月餅義賣已資助興建了貴州18所希望學校。所有收益直接撥作建校項目。',
        content: `
## 關於我們的月餅

每年中秋節前夕，善啟售賣優質手工月餅，**100%的收益**直接撥作貴州貧困山區的建校項目。

## 月餅詳情

- **餅類**：雙黃白蓮蓉月餅
- **包裝**：精美禮盒包裝，每盒4個裝
- **總淨重**：每盒750克
- **製造**：百分百香港製造，由香港「普光齋」經驗餅師主理
- **售價**：每盒200元
- **送貨**：購滿20盒可免費送貨

## 影響

多年來，月餅義賣收益已資助興建了貴州**18所希望學校**。每購買一盒月餅都代表著為貧困山村的孩子們提供安全學習場所的直接貢獻。

## 如何訂購

通過電話（2735 1122）或電郵（info@sinkai.org）聯繫我們下單。歡迎企業批量訂購。
        `.trim(),
      },
    },
  },
  {
    slug: 'emergency-aid-programme',
    date: '2023-07-10',
    coverImage: '/gallery/activities/13_06s.jpg',
    translations: {
      'en': {
        title: 'Emergency Aid Programme: Responding to Crisis',
        excerpt: 'Sin Kai\'s emergency relief programme provides rapid response to natural disasters, medical emergencies, and critical needs in Guizhou\'s mountain communities.',
        content: `
## Programme Overview

The Emergency Aid Programme provides rapid response to critical situations in Guizhou's impoverished mountain communities. When disaster strikes or families face urgent medical needs, Sin Kai is there to help.

## Areas of Support

### Natural Disaster Relief
When floods, droughts, or snowstorms hit, we provide:
- Emergency food supplies (rice, cooking oil)
- Warm blankets and clothing
- Temporary shelter materials
- Clean water and sanitation supplies

### Medical Emergency Aid
For villagers facing critical illness:
- Subsidies for hospital treatment and medication
- Transportation to medical facilities
- Support for families of patients
- Special programme for disabled students requiring medical care

### Elderly Widow Support
Regular subsidies for elderly widows living alone:
- Monthly living allowances
- Emergency repair funds for dilapidated housing
- Winter heating supplies

### Infrastructure Repair
- Building water cisterns in drought-affected areas
- Repairing riverbanks and bridges damaged by floods
- Road repair in remote mountain villages

## How Aid is Distributed

Aid is distributed through our network of local contacts, including school principals, village committee members, and the local Youth League. This ensures that help reaches those who need it most, quickly and efficiently.
        `.trim(),
      },
      'zh-CN': {
        title: '紧急援助计划：应对危机',
        excerpt: '善启的紧急救援计划为贵州山区的自然灾害、医疗紧急情况和关键需求提供快速响应。',
        content: `
## 计划概述

紧急援助计划为贵州贫困山村的危急情况提供快速响应。当灾难来袭或家庭面临紧急医疗需求时，善启就在那里提供帮助。

## 支持领域

### 自然灾害救援
当洪水、干旱或雪灾来袭时，我们提供：
- 紧急食品供应（大米、食用油）
- 保暖棉被和衣物
- 临时庇护材料
- 清洁饮用水和卫生用品

### 医疗紧急援助
为面临危重疾病的村民：
- 医院治疗和药物补贴
- 前往医疗机构的交通费
- 对患者家庭的支持
- 残障学童医疗援助专项计划

### 孤寡老人支持
为独居的老年寡妇提供定期补贴：
- 每月生活津贴
- 破旧房屋的紧急维修资金
- 冬季供暖物资

### 基础设施维修
- 在干旱地区修建水窖
- 修复被洪水冲毁的河堤和桥梁
- 偏远山村道路维修

## 援助如何分发

援助通过我们的本地联系人网络分发，包括学校校长、村委会成员和当地团委。这确保了帮助能够快速有效地到达最需要的人手中。
        `.trim(),
      },
      'zh-TW': {
        title: '緊急援助計劃：應對危機',
        excerpt: '善啟的緊急救援計劃為貴州山區的自然災害、醫療緊急情況和關鍵需求提供快速響應。',
        content: `
## 計劃概述

緊急援助計劃為貴州貧困山村的危急情況提供快速響應。當災難來襲或家庭面臨緊急醫療需求時，善啟就在那裡提供幫助。

## 支持領域

### 自然災害救援
當洪水、乾旱或雪災來襲時，我們提供：
- 緊急食品供應（大米、食用油）
- 保暖棉被和衣物
- 臨時庇護材料
- 清潔飲用水和衛生用品

### 醫療緊急援助
為面臨危重疾病的村民：
- 醫院治療和藥物補貼
- 前往醫療機構的交通費
- 對患者家庭的支持
- 殘障學童醫療援助專項計劃

### 孤寡老人支持
為獨居的老年寡婦提供定期補貼：
- 每月生活津貼
- 破舊房屋的緊急維修資金
- 冬季供暖物資

### 基礎設施維修
- 在乾旱地區修建水窖
- 修復被洪水沖毀的河堤和橋樑
- 偏遠山村道路維修

## 援助如何分發

援助通過我們的本地聯繫人網絡分發，包括學校校長、村委會成員和當地團委。這確保了幫助能夠快速有效地到達最需要的人手中。
        `.trim(),
      },
    },
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(currentSlug: string, count: number = 3): BlogPost[] {
  return blogPosts.filter((p) => p.slug !== currentSlug).slice(0, count);
}
