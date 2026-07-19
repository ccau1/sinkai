import type { Locale } from '../locales'

export interface Installation {
  slug: string
  type: 'school' | 'bridge' | 'water-tank'
  completionDate: string
  photos: string[] // paths in packages/web/public
  translations: Record<
    Locale,
    {
      title: string
      location: string
      description: string
    }
  >
}

export const installations: Installation[] = [
  {
    slug: 'liping-mengyan-hope-school',
    type: 'school',
    completionDate: '2015-09-01',
    photos: ['/gallery/schools-new/06_osch_32.jpg', '/gallery/schools-new/06_osch_40.jpg'],
    translations: {
      en: {
        title: 'Liping Mengyan Hope Primary School',
        location: 'Mengyan Town, Liping County, Guizhou',
        description:
          'A six-classroom reinforced concrete school building replacing a dangerous mud-brick structure. Serving over 180 children from surrounding mountain villages.',
      },
      'zh-CN': {
        title: '黎平孟彦希望小学',
        location: '贵州省黎平县孟彦镇',
        description:
          '一栋六课室钢筋混凝土校舍，取代了危险的泥砖结构。为周边山区超过180名儿童提供安全的学习环境。',
      },
      'zh-TW': {
        title: '黎平孟彥希望小學',
        location: '貴州省黎平縣孟彥鎮',
        description:
          '一棟六課室鋼筋混凝土校舍，取代了危險的泥磚結構。為周邊山區超過180名兒童提供安全的學習環境。',
      },
    },
  },
  {
    slug: 'congjiang-guping-central-school',
    type: 'school',
    completionDate: '2016-09-01',
    photos: ['/gallery/schools-new/06_osch_47.jpg', '/gallery/schools-new/06_osch_48.jpg'],
    translations: {
      en: {
        title: 'Congjiang Guping Central Primary School',
        location: 'Guping Township, Congjiang County, Guizhou',
        description:
          'Central primary school with eight classrooms, a library, and sanitation facilities. Built in partnership with the local government and village families.',
      },
      'zh-CN': {
        title: '从江谷坪中心小学',
        location: '贵州省从江县谷坪乡',
        description:
          '设有八间课室、图书馆及卫生设施的中心小学。由地方政府与村民家庭共同协作建成。',
      },
      'zh-TW': {
        title: '從江谷坪中心小學',
        location: '貴州省從江縣谷坪鄉',
        description:
          '設有八間課室、圖書館及衛生設施的中心小學。由地方政府與村民家庭共同協作建成。',
      },
    },
  },
  {
    slug: 'rongjiang-jihua-ethnic-school',
    type: 'school',
    completionDate: '2017-03-15',
    photos: ['/gallery/schools-new/06_osch_52.jpg', '/gallery/schools-new/06_osch_53.jpg'],
    translations: {
      en: {
        title: 'Rongjiang Jihua Ethnic Primary School',
        location: 'Jihua Township, Rongjiang County, Guizhou',
        description:
          'Ethnic primary school preserving Dong and Miao cultural heritage while providing modern classrooms and clean drinking water.',
      },
      'zh-CN': {
        title: '榕江计划乡民族小学',
        location: '贵州省榕江县计划乡',
        description:
          '一所保留侗族和苗族文化特色的民族小学，同时配备现代化课室和清洁饮用水设施。',
      },
      'zh-TW': {
        title: '榕江計劃鄉民族小學',
        location: '貴州省榕江縣計劃鄉',
        description:
          '一所保留侗族和苗族文化特色的民族小學，同時配備現代化課室和清潔飲用水設施。',
      },
    },
  },
  {
    slug: 'jianhe-nanshao-hope-school',
    type: 'school',
    completionDate: '2016-12-01',
    photos: ['/gallery/schools-new/06_osch_54.jpg', '/gallery/schools-new/06_osch_55.jpg'],
    translations: {
      en: {
        title: 'Jianhe Nanshao Hope Primary School',
        location: 'Nanshao Township, Jianhe County, Guizhou',
        description:
          'Hope primary school featuring six classrooms, a teacher dormitory, and a playground built on a steep mountain slope.',
      },
      'zh-CN': {
        title: '剑河南哨希望小学',
        location: '贵州省剑河县南哨乡',
        description:
          '一所设有六间课室、教师宿舍及操场的希望小学，建在陡峭的山坡上。',
      },
      'zh-TW': {
        title: '劍河南哨希望小學',
        location: '貴州省劍河縣南哨鄉',
        description:
          '一間設有六間課室、教師宿舍及操場的希望小學，建在陡峭的山坡上。',
      },
    },
  },
  {
    slug: 'taijiang-paiyang-boarding-school',
    type: 'school',
    completionDate: '2018-09-01',
    photos: ['/gallery/schools-new/06_osch_56.jpg', '/gallery/schools-new/06_osch_59.jpg'],
    translations: {
      en: {
        title: 'Taijiang Paiyang Boarding Primary School',
        location: 'Paiyang Township, Taijiang County, Guizhou',
        description:
          'Boarding primary school with dormitories for students who walk long distances from remote mountain homes.',
      },
      'zh-CN': {
        title: '台江排羊寄宿制小学',
        location: '贵州省台江县排羊乡',
        description:
          '设有学生宿舍的寄宿制小学，方便从偏远山区长途跋涉上学的学生住宿。',
      },
      'zh-TW': {
        title: '台江排羊寄宿制小學',
        location: '貴州省台江縣排羊鄉',
        description:
          '設有學生宿舍的寄宿制小學，方便從偏遠山區長途跋涉上學的學生住宿。',
      },
    },
  },
  {
    slug: 'leishan-xijiang-primary-school',
    type: 'school',
    completionDate: '2017-09-10',
    photos: ['/gallery/schools-new/06_osch_60.jpg', '/gallery/schools-new/06_osch_61.jpg'],
    translations: {
      en: {
        title: 'Leishan Xijiang Primary School',
        location: 'Xijiang Town, Leishan County, Guizhou',
        description:
          'Primary school serving the Miao community near Xijiang Village, with bright classrooms and a dedicated arts room.',
      },
      'zh-CN': {
        title: '雷山西江镇小学',
        location: '贵州省雷山县西江镇',
        description:
          '为西江苗寨周边苗族社区服务的小学，拥有明亮的课室和专用美术室。',
      },
      'zh-TW': {
        title: '雷山西江鎮小學',
        location: '貴州省雷山縣西江鎮',
        description:
          '為西江苗寨周邊苗族社區服務的小學，擁有明亮的課室和專用美術室。',
      },
    },
  },
  {
    slug: 'danzhai-yangwu-hope-school',
    type: 'school',
    completionDate: '2015-12-20',
    photos: ['/gallery/schools-new/06_osch_63.jpg', '/gallery/schools-new/06_osch_64.jpg'],
    translations: {
      en: {
        title: 'Danzhai Yangwu Hope Primary School',
        location: 'Yangwu Township, Danzhai County, Guizhou',
        description:
          'Hope primary school replacing a leaking mud-brick building, with new classrooms, windows, and a safe drinking water system.',
      },
      'zh-CN': {
        title: '丹寨扬武希望小学',
        location: '贵州省丹寨县扬武乡',
        description:
          '取代漏雨泥砖校舍的希望小学，设有新课室、玻璃窗及安全饮用水系统。',
      },
      'zh-TW': {
        title: '丹寨揚武希望小學',
        location: '貴州省丹寨縣揚武鄉',
        description:
          '取代漏雨泥磚校舍的希望小學，設有新課室、玻璃窗及安全飲用水系統。',
      },
    },
  },
  {
    slug: 'majiang-longshan-central-school',
    type: 'school',
    completionDate: '2016-06-15',
    photos: ['/gallery/schools-new/06_osch_66.jpg', '/gallery/schools-old/06_osch_01.jpg'],
    translations: {
      en: {
        title: 'Majiang Longshan Central Primary School',
        location: 'Longshan Township, Majiang County, Guizhou',
        description:
          'Central primary school with expanded classroom capacity and new sanitation blocks for boys and girls.',
      },
      'zh-CN': {
        title: '麻江龙山中心小学',
        location: '贵州省麻江县龙山乡',
        description:
          '扩大了课室容量并新建男女分开卫生设施的中心小学。',
      },
      'zh-TW': {
        title: '麻江龍山中心小學',
        location: '貴州省麻江縣龍山鄉',
        description:
          '擴大了課室容量並新建男女分開衛生設施的中心小學。',
      },
    },
  },
  {
    slug: 'huangping-chongan-hope-school',
    type: 'school',
    completionDate: '2018-03-01',
    photos: ['/gallery/schools-old/06_osch_02.jpg', '/gallery/schools-old/06_osch_04.jpg'],
    translations: {
      en: {
        title: 'Huangping Chong\'an Hope Primary School',
        location: 'Chong\'an Town, Huangping County, Guizhou',
        description:
          'Hope primary school built after the original structure was deemed unsafe, now serving students from three neighbouring villages.',
      },
      'zh-CN': {
        title: '黄平重安希望小学',
        location: '贵州省黄平县重安镇',
        description:
          '在原校舍被评定为不安全后新建的希望小学，现服务邻近三个村庄的学生。',
      },
      'zh-TW': {
        title: '黃平重安希望小學',
        location: '貴州省黃平縣重安鎮',
        description:
          '在原校舍被評定為不安全後新建的希望小學，現服務鄰近三個村莊的學生。',
      },
    },
  },
  {
    slug: 'shibing-niudachang-primary-school',
    type: 'school',
    completionDate: '2017-12-10',
    photos: ['/gallery/schools-old/06_osch_05.jpg', '/gallery/schools-old/06_osch_06.jpg'],
    translations: {
      en: {
        title: 'Shibing Niudachang Central Primary School',
        location: 'Niudachang Town, Shibing County, Guizhou',
        description:
          'Central primary school with a new library and multi-purpose classroom for science activities.',
      },
      'zh-CN': {
        title: '施秉牛大场中心小学',
        location: '贵州省施秉县牛大场镇',
        description:
          '设有新建图书馆及多功能科学活动课室中心小学。',
      },
      'zh-TW': {
        title: '施秉牛大場中心小學',
        location: '貴州省施秉縣牛大場鎮',
        description:
          '設有新建圖書館及多功能科學活動課室中心小學。',
      },
    },
  },
  {
    slug: 'zhenyuan-jinbao-ethnic-school',
    type: 'school',
    completionDate: '2019-09-01',
    photos: ['/gallery/schools-old/06_osch_07.jpg', '/gallery/schools-old/06_osch_08.jpg'],
    translations: {
      en: {
        title: 'Zhenyuan Jinbao Ethnic Primary School',
        location: 'Jinbao Township, Zhenyuan County, Guizhou',
        description:
          'Ethnic primary school blending traditional architecture with modern facilities, including a computer room.',
      },
      'zh-CN': {
        title: '镇远金堡民族小学',
        location: '贵州省镇远县金堡乡',
        description:
          '融合传统建筑风格与现代化设施的民族小学，内设电脑室。',
      },
      'zh-TW': {
        title: '鎮遠金堡民族小學',
        location: '貴州省鎮遠縣金堡鄉',
        description:
          '融合傳統建築風格與現代化設施的民族小學，內設電腦室。',
      },
    },
  },
  {
    slug: 'cengong-tianma-hope-school',
    type: 'school',
    completionDate: '2018-06-01',
    photos: ['/gallery/schools-old/06_osch_09.jpg', '/gallery/schools-old/06_osch_10.jpg'],
    translations: {
      en: {
        title: 'Cengong Tianma Hope Primary School',
        location: 'Tianma Town, Cengong County, Guizhou',
        description:
          'Hope primary school with a reinforced concrete frame, built to withstand the rainy mountain climate.',
      },
      'zh-CN': {
        title: '岑巩天马希望小学',
        location: '贵州省岑巩县天马镇',
        description:
          '采用钢筋混凝土框架结构的希望小学，可抵御多雨的山地气候。',
      },
      'zh-TW': {
        title: '岑鞏天馬希望小學',
        location: '貴州省岑鞏縣天馬鎮',
        description:
          '採用鋼筋混凝土框架結構的希望小學，可抵禦多雨的山地氣候。',
      },
    },
  },
  {
    slug: 'sansui-tailie-central-school',
    type: 'school',
    completionDate: '2019-03-15',
    photos: ['/gallery/schools-old/06_osch_12.jpg', '/gallery/schools-old/06_osch_13.jpg'],
    translations: {
      en: {
        title: 'Sansui Tailie Central Primary School',
        location: 'Tailie Town, Sansui County, Guizhou',
        description:
          'Central primary school serving the town and nearby mountain hamlets with expanded classroom blocks.',
      },
      'zh-CN': {
        title: '三穗台烈中心小学',
        location: '贵州省三穗县台烈镇',
        description:
          '为台烈镇及周边山间小村服务的中心小学，扩建了课室楼。',
      },
      'zh-TW': {
        title: '三穗台烈中心小學',
        location: '貴州省三穗縣台烈鎮',
        description:
          '為台烈鎮及周邊山間小村服務的中心小學，擴建了課室樓。',
      },
    },
  },
  {
    slug: 'tianzhu-shidong-hope-school',
    type: 'school',
    completionDate: '2018-09-20',
    photos: ['/gallery/schools-old/06_osch_14.jpg', '/gallery/schools-old/06_osch_15.jpg'],
    translations: {
      en: {
        title: 'Tianzhu Shidong Hope Primary School',
        location: 'Shidong Town, Tianzhu County, Guizhou',
        description:
          'Hope primary school with separate classrooms for each grade and a covered playground for rainy days.',
      },
      'zh-CN': {
        title: '天柱石洞希望小学',
        location: '贵州省天柱县石洞镇',
        description:
          '设有各年级独立课室及雨天遮盖操场的希望小学。',
      },
      'zh-TW': {
        title: '天柱石洞希望小學',
        location: '貴州省天柱縣石洞鎮',
        description:
          '設有各年級獨立課室及雨天遮蓋操場的希望小學。',
      },
    },
  },
  {
    slug: 'jinping-qimeng-ethnic-school',
    type: 'school',
    completionDate: '2019-12-01',
    photos: ['/gallery/schools-old/06_osch_16.jpg', '/gallery/schools-old/06_osch_17.jpg'],
    translations: {
      en: {
        title: 'Jinping Qimeng Ethnic Primary School',
        location: 'Qimeng Town, Jinping County, Guizhou',
        description:
          'Ethnic primary school celebrating local Dong culture while offering modern classrooms and a school library.',
      },
      'zh-CN': {
        title: '锦屏启蒙民族小学',
        location: '贵州省锦屏县启蒙镇',
        description:
          '弘扬当地侗族文化并提供现代化课室与学校图书馆的民族小学。',
      },
      'zh-TW': {
        title: '錦屏啟蒙民族小學',
        location: '貴州省錦屏縣啟蒙鎮',
        description:
          '弘揚當地侗族文化並提供現代化課室與學校圖書館的民族小學。',
      },
    },
  },
  {
    slug: 'jiangkou-minxiao-central-school',
    type: 'school',
    completionDate: '2020-09-01',
    photos: ['/gallery/activities/13_01.jpg', '/gallery/activities/13_02.jpg'],
    translations: {
      en: {
        title: 'Jiangkou Minxiao Central Primary School',
        location: 'Minxiao Town, Jiangkou County, Guizhou',
        description:
          'Central primary school near Fanjing Mountain with science lab and improved sanitation facilities.',
      },
      'zh-CN': {
        title: '江口闵孝中心小学',
        location: '贵州省江口县闵孝镇',
        description:
          '位于梵净山附近的中心小学，设有科学实验室和改善后的卫生设施。',
      },
      'zh-TW': {
        title: '江口閔孝中心小學',
        location: '貴州省江口縣閔孝鎮',
        description:
          '位於梵淨山附近中心小學，設有科學實驗室和改善後的衛生設施。',
      },
    },
  },
  {
    slug: 'shiqian-benzhuang-hope-school',
    type: 'school',
    completionDate: '2020-03-10',
    photos: ['/gallery/activities/13_03.jpg', '/gallery/activities/13_04.jpg'],
    translations: {
      en: {
        title: 'Shiqian Benzhuang Hope Primary School',
        location: 'Benzhuang Town, Shiqian County, Guizhou',
        description:
          'Hope primary school with a new kitchen and dining area, ensuring students receive warm meals at school.',
      },
      'zh-CN': {
        title: '石阡本庄希望小学',
        location: '贵州省石阡县本庄镇',
        description:
          '设有新建厨房和就餐区的希望小学，确保学生在校能吃上热饭。',
      },
      'zh-TW': {
        title: '石阡本莊希望小學',
        location: '貴州省石阡縣本莊鎮',
        description:
          '設有新建廚房和就餐區的希望小學，確保學生在校能吃上熱飯。',
      },
    },
  },
  {
    slug: 'sinan-zhangjiazhai-central-school',
    type: 'school',
    completionDate: '2020-12-15',
    photos: ['/gallery/activities/13_05.jpg', '/gallery/activities/13_06.jpg'],
    translations: {
      en: {
        title: 'Sinan Zhangjiazhai Central Primary School',
        location: 'Zhangjiazhai Town, Sinan County, Guizhou',
        description:
          'Central primary school rebuilt with durable materials, serving students from multiple mountain villages.',
      },
      'zh-CN': {
        title: '思南张家寨中心小学',
        location: '贵州省思南县张家寨镇',
        description:
          '以耐用材料重建的中心小学，服务多个山村的学童。',
      },
      'zh-TW': {
        title: '思南張家寨中心小學',
        location: '貴州省思南縣張家寨鎮',
        description:
          '以耐用材料重建的中心小學，服務多個山村的學童。',
      },
    },
  },
  {
    slug: 'dejiang-jiancha-ethnic-school',
    type: 'school',
    completionDate: '2021-09-01',
    photos: ['/gallery/activities/13_07.jpg', '/gallery/activities/13_11.jpg'],
    translations: {
      en: {
        title: 'Dejiang Jiancha Ethnic Primary School',
        location: 'Jiancha Town, Dejiang County, Guizhou',
        description:
          'Ethnic primary school with bilingual support and a new sports ground for outdoor activities.',
      },
      'zh-CN': {
        title: '德江煎茶民族小学',
        location: '贵州省德江县煎茶镇',
        description:
          '提供双语支持并新建户外运动场的民族小学。',
      },
      'zh-TW': {
        title: '德江煎茶民族小學',
        location: '貴州省德江縣煎茶鎮',
        description:
          '提供雙語支持並新建戶外運動場的民族小學。',
      },
    },
  },
  {
    slug: 'yanhe-tudi\'ao-hope-school',
    type: 'school',
    completionDate: '2021-06-20',
    photos: ['/gallery/activities/13_12.jpg', '/gallery/activities/13_13.jpg'],
    translations: {
      en: {
        title: 'Yanhe Tudi\'ao Hope Primary School',
        location: 'Tudi\'ao Town, Yanhe County, Guizhou',
        description:
          'Hope primary school perched on a hillside with terraced landscaping and a safe drinking water supply.',
      },
      'zh-CN': {
        title: '沿河土地坳希望小学',
        location: '贵州省沿河县土地坳镇',
        description:
          '坐落于山坡上的希望小学，设有梯田式景观和安全饮用水供应。',
      },
      'zh-TW': {
        title: '沿河土地坳希望小學',
        location: '貴州省沿河縣土地坳鎮',
        description:
          '坐落於山坡上的希望小學，設有梯田式景觀和安全飲用水供應。',
      },
    },
  },
  {
    slug: 'longtang-village-bridge',
    type: 'bridge',
    completionDate: '2017-11-15',
    photos: ['/gallery/schools-old/06_osch_12.jpg', '/gallery/mountain/01_00.jpg'],
    translations: {
      en: {
        title: 'Longtang Village Convenience Bridge',
        location: 'Longtang Village, Congjiang County, Guizhou',
        description:
          'A reinforced concrete footbridge connecting the village to the main road, replacing a dangerous rope crossing.',
      },
      'zh-CN': {
        title: '龙塘村便民桥',
        location: '贵州省从江县龙塘村',
        description:
          '一座连接村庄与主干道的钢筋混凝土人行桥，取代了危险的绳索渡口。',
      },
      'zh-TW': {
        title: '龍塘村便民橋',
        location: '貴州省從江縣龍塘村',
        description:
          '一座連接村莊與主幹道的鋼筋混凝土人行橋，取代了危險的繩索渡口。',
      },
    },
  },
  {
    slug: 'shiban-zhai-bridge',
    type: 'bridge',
    completionDate: '2018-08-01',
    photos: ['/gallery/schools-old/06_osch_14.jpg', '/gallery/mountain/01_00.jpg'],
    translations: {
      en: {
        title: 'Shibanzhai Heart-to-Heart Bridge',
        location: 'Shibanzhai, Liping County, Guizhou',
        description:
          'A covered bridge providing all-weather access between two hillside hamlets and the village school.',
      },
      'zh-CN': {
        title: '石板寨连心桥',
        location: '贵州省黎平县石板寨',
        description:
          '一座风雨桥，为两个山坡小寨与村小学提供全天候通行。',
      },
      'zh-TW': {
        title: '石板寨連心橋',
        location: '貴州省黎平縣石板寨',
        description:
          '一座風雨橋，為兩個山坡小寨與村小學提供全天候通行。',
      },
    },
  },
  {
    slug: 'gaopo-village-wind-rain-bridge',
    type: 'bridge',
    completionDate: '2019-05-20',
    photos: ['/gallery/schools-old/06_osch_16.jpg', '/gallery/activities/13_14.jpg'],
    translations: {
      en: {
        title: 'Gaopo Village Wind-Rain Bridge',
        location: 'Gaopo Village, Rongjiang County, Guizhou',
        description:
          'A traditional Dong-style wind-rain bridge restored with modern reinforcement, serving as both crossing and community gathering place.',
      },
      'zh-CN': {
        title: '高坡村风雨桥',
        location: '贵州省榕江县高坡村',
        description:
          '一座以现代结构加固修复的传统侗族风雨桥，兼具通行与村民聚会功能。',
      },
      'zh-TW': {
        title: '高坡村風雨橋',
        location: '貴州省榕江縣高坡村',
        description:
          '一座以現代結構加固修復的傳統侗族風雨橋，兼具通行與村民聚會功能。',
      },
    },
  },
  {
    slug: 'dawan-village-reservoir',
    type: 'water-tank',
    completionDate: '2016-04-10',
    photos: ['/gallery/activities/13_15.jpg', '/gallery/activities/13_16.jpg'],
    translations: {
      en: {
        title: 'Dawan Village Water Reservoir',
        location: 'Dawan Village, Shibing County, Guizhou',
        description:
          'A reinforced concrete reservoir collecting mountain spring water for year-round village supply.',
      },
      'zh-CN': {
        title: '大湾村蓄水池',
        location: '贵州省施秉县大湾村',
        description:
          '一座汇集山泉水源的钢筋混凝土蓄水池，为村庄提供全年供水。',
      },
      'zh-TW': {
        title: '大灣村蓄水池',
        location: '貴州省施秉縣大灣村',
        description:
          '一座匯集山泉水源的鋼筋混凝土蓄水池，為村莊提供全年供水。',
      },
    },
  },
  {
    slug: 'yunfeng-village-water-project',
    type: 'water-tank',
    completionDate: '2017-07-22',
    photos: ['/gallery/schools-new/06_osch_32.jpg', '/gallery/activities/13_01.jpg'],
    translations: {
      en: {
        title: 'Yunfeng Village Drinking Water Project',
        location: 'Yunfeng Village, Taijiang County, Guizhou',
        description:
          'A gravity-fed drinking water system with filtration and distribution points throughout the village.',
      },
      'zh-CN': {
        title: '云峰村饮水工程',
        location: '贵州省台江县云峰村',
        description:
          '一套自流式饮水系统，配有过滤装置和村内多个供水点。',
      },
      'zh-TW': {
        title: '雲峰村飲水工程',
        location: '貴州省台江縣雲峰村',
        description:
          '一套自流式飲水系統，配有過濾裝置和村內多個供水點。',
      },
    },
  },
  {
    slug: 'pingzhai-village-elevated-tank',
    type: 'water-tank',
    completionDate: '2018-10-05',
    photos: ['/gallery/schools-new/06_osch_47.jpg', '/gallery/activities/13_03.jpg'],
    translations: {
      en: {
        title: 'Pingzhai Village Elevated Water Tank',
        location: 'Pingzhai Village, Jianhe County, Guizhou',
        description:
          'An elevated water tank supplying consistent pressure to households and the village primary school.',
      },
      'zh-CN': {
        title: '平寨村高位水池',
        location: '贵州省剑河县平寨村',
        description:
          '一座高位水池，为村民家庭和村小学提供稳定水压的供水。',
      },
      'zh-TW': {
        title: '平寨村高位水池',
        location: '貴州省劍河縣平寨村',
        description:
          '一座高位水池，為村民家庭和村小學提供穩定水壓的供水。',
      },
    },
  },
  {
    slug: 'qingshan-village-fire-cistern',
    type: 'water-tank',
    completionDate: '2019-02-28',
    photos: ['/gallery/schools-new/06_osch_52.jpg', '/gallery/activities/13_05.jpg'],
    translations: {
      en: {
        title: 'Qingshan Village Fire Cistern',
        location: 'Qingshan Village, Leishan County, Guizhou',
        description:
          'A dual-purpose fire-fighting and domestic water cistern protecting traditional wooden village houses.',
      },
      'zh-CN': {
        title: '青山村消防蓄水池',
        location: '贵州省雷山县青山村',
        description:
          '一座兼具消防与民用的蓄水池，保护传统木质村屋。',
      },
      'zh-TW': {
        title: '青山村消防蓄水池',
        location: '貴州省雷山縣青山村',
        description:
          '一座兼具消防與民用的蓄水池，保護傳統木質村屋。',
      },
    },
  },
  {
    slug: 'baiguo-village-livestock-water',
    type: 'water-tank',
    completionDate: '2020-05-15',
    photos: ['/gallery/schools-new/06_osch_54.jpg', '/gallery/activities/13_07.jpg'],
    translations: {
      en: {
        title: 'Baiguo Village Livestock Water Supply',
        location: 'Baiguo Village, Danzhai County, Guizhou',
        description:
          'A livestock and domestic water supply project with troughs and household taps serving the entire village.',
      },
      'zh-CN': {
        title: '白果村人畜饮水工程',
        location: '贵州省丹寨县白果村',
        description:
          '一项兼供牲畜与民用的供水工程，设有饮水槽和入户水龙头，服务全村。',
      },
      'zh-TW': {
        title: '白果村人畜飲水工程',
        location: '貴州省丹寨縣白果村',
        description:
          '一項兼供牲畜與民用的供水工程，設有飲水槽和入戶水龍頭，服務全村。',
      },
    },
  },
  {
    slug: 'hongxing-village-central-water-tank',
    type: 'water-tank',
    completionDate: '2021-03-08',
    photos: ['/gallery/schools-new/06_osch_56.jpg', '/gallery/activities/13_11.jpg'],
    translations: {
      en: {
        title: 'Hongxing Village Central Water Tank',
        location: 'Hongxing Village, Huangping County, Guizhou',
        description:
          'A central water storage tank with solar-powered pumping from a mountain stream to village distribution.',
      },
      'zh-CN': {
        title: '红星村集中供水池',
        location: '贵州省黄平县红星村',
        description:
          '一座集中供水池，利用太阳能水泵从山涧引水至村庄配水。',
      },
      'zh-TW': {
        title: '紅星村集中供水池',
        location: '貴州省黃平縣紅星村',
        description:
          '一座集中供水池，利用太陽能水泵從山澗引水至村莊配水。',
      },
    },
  },
  {
    slug: 'xinglong-village-drought-tank',
    type: 'water-tank',
    completionDate: '2021-09-18',
    photos: ['/gallery/schools-new/06_osch_60.jpg', '/gallery/activities/13_13.jpg'],
    translations: {
      en: {
        title: 'Xinglong Village Drought-Resistant Water Tower',
        location: 'Xinglong Village, Majiang County, Guizhou',
        description:
          'A raised water tower designed to store water through the dry season, serving both households and farmland irrigation.',
      },
      'zh-CN': {
        title: '兴隆村抗旱水塔',
        location: '贵州省麻江县兴隆村',
        description:
          '一座高架水塔，设计用于旱季储水，同时服务家庭用水与农田灌溉。',
      },
      'zh-TW': {
        title: '興隆村抗旱水塔',
        location: '貴州省麻江縣興隆村',
        description:
          '一座高架水塔，設計用於旱季儲水，同時服務家庭用水與農田灌溉。',
      },
    },
  },
]
