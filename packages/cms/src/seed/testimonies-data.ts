import type { Locale } from '../locales'

export interface Testimony {
  highlighted: boolean
  photos: string[] // paths in packages/web/public
  translations: Record<
    Locale,
    {
      name: string
      role: string
      synopsis: string
      content: string
    }
  >
}

export const testimonies: Testimony[] = [
  {
    highlighted: true,
    photos: ['/gallery/hk-charity/07_2019ma2.jpg'],
    translations: {
      en: {
        name: 'Mr. Ho Hon Leung',
        role: 'Belgian Chinese · Long-time Supporter',
        synopsis:
          'Throughout the journey, I realised how much the poor communities behind our prosperous society need our care.',
        content: `
Throughout the journey, I realised how much the poor communities behind our prosperous society need our care, and witnessed how selflessly Sin Kai's volunteers fight for education opportunities for impoverished students.

What moved me most was seeing children walk for hours on dangerous mountain roads just to attend school. Their determination reminds us that education is not a privilege — it is a fundamental hope for breaking the cycle of poverty.

I sincerely urge more friends from all walks of life to join us in supporting Sin Kai's mission. Every contribution, no matter how small, becomes a brick in a new school or a textbook in a child's hands.
        `.trim(),
      },
      'zh-CN': {
        name: '何汉良先生',
        role: '比利时华侨 · 长期支持者',
        synopsis:
          '在整个旅程中，我意识到繁荣社会背后贫困社区多么需要我们的关怀。',
        content: `
在整个旅程中，我意识到繁荣社会背后的贫困社区多么需要我们的关怀，也见证了善启义工如何无私地为贫困学生争取教育机会。

最让我感动的是看到孩子们要走数小时危险的山路才能上学。他们的决心提醒我们，教育不是特权，而是打破贫困循环的基本希望。

我衷心呼吁各界朋友加入支持善启的使命。每一份贡献，无论大小，都能成为新学校的一块砖或孩子手中的一本课本。
        `.trim(),
      },
      'zh-TW': {
        name: '何漢良先生',
        role: '比利時華僑 · 長期支持者',
        synopsis:
          '在整個旅程中，我意識到繁榮社會背後貧困社區多麼需要我們的關懷。',
        content: `
在整個旅程中，我意識到繁榮社會背後的貧困社區多麼需要我們的關懷，也見證了善啟義工如何無私地為貧困學生爭取教育機會。

最讓我感動的是看到孩子們要走數小時危險的山路才能上學。他們的決心提醒我們，教育不是特權，而是打破貧困循環的基本希望。

我衷心呼籲各界朋友加入支持善啟的使命。每一份貢獻，無論大小，都能成為新學校的一塊磚或孩子手中的一本課本。
        `.trim(),
      },
    },
  },
  {
    highlighted: true,
    photos: ['/gallery/schools-new/06_osch_56.jpg'],
    translations: {
      en: {
        name: 'Ms. Chan Wai Ling',
        role: 'Hong Kong Artist · Charity Ambassador',
        synopsis:
          'I am honoured to lend my voice to Sin Kai. Their zero admin fee promise means every dollar reaches the children.',
        content: `
I am honoured to lend my voice to Sin Kai Charity Fund. In an age where administrative costs often consume a large portion of donations, their zero admin fee promise means every dollar we give truly reaches the children who need it most.

During my visit to Guizhou, I saw firsthand the transformation from dilapidated mud-brick classrooms to bright, safe Hope Schools. The smiles on the children's faces told me everything — this work changes lives.

I encourage everyone to support Sin Kai, whether through donations, buying charity mooncakes, or joining a volunteer trip. Together we can give more children the future they deserve.
        `.trim(),
      },
      'zh-CN': {
        name: '陈慧玲小姐',
        role: '香港艺人 · 慈善大使',
        synopsis:
          '我很荣幸为善启发声。他们零行政费的承诺意味着每一分钱都能送到孩子手中。',
        content: `
我很荣幸能为善启慈善基金会发声。在行政费用常常占去捐款一大部分的时代，他们零行政费的承诺意味着我们捐出的每一分钱都能真正送到最需要的孩子手中。

在我到访贵州期间，我亲眼见证了从破旧的泥砖课室到明亮安全的希望学校的转变。孩子们脸上的笑容说明了一切——这项工作改变生命。

我鼓励大家支持善启，无论是捐款、购买慈善月饼，还是参加义工探访。一起努力，我们可以给更多孩子他们应得的未来。
        `.trim(),
      },
      'zh-TW': {
        name: '陳慧玲小姐',
        role: '香港藝人 · 慈善大使',
        synopsis:
          '我很榮幸為善啟發聲。他們零行政費的承諾意味著每一分錢都能送到孩子手中。',
        content: `
我很榮幸能為善啟慈善基金會發聲。在行政費用常常佔去捐款一大部分的時代，他們零行政費的承諾意味著我們捐出的每一分錢都能真正送到最需要的孩子手中。

在我到訪貴州期間，我親眼見證了從破舊的泥磚課室到明亮安全的希望學校的轉變。孩子們臉上的笑容說明了一切——這項工作改變生命。

我鼓勵大家支持善啟，無論是捐款、購買慈善月餅，還是參加義工探訪。一起努力，我們可以給更多孩子他們應得的未來。
        `.trim(),
      },
    },
  },
  {
    highlighted: false,
    photos: ['/gallery/activities/13_01.jpg'],
    translations: {
      en: {
        name: 'Xiao Mei',
        role: 'Dream Programme Beneficiary',
        synopsis:
          'Thanks to Sin Kai, I was able to finish school and now I dream of becoming a teacher in my village.',
        content: `
My parents could not afford my school fees, and I thought I would have to leave school to help at home. Then Sin Kai's Dream Programme found me.

Thanks to their support, I was able to finish primary and secondary school. The volunteers did not just give money — they wrote to me, encouraged me, and made me believe that my life could be different.

Now I am studying to become a teacher. My dream is to return to my village and give the next generation the same hope that Sin Kai gave me.
        `.trim(),
      },
      'zh-CN': {
        name: '小湄',
        role: '圆梦计划受助学生',
        synopsis:
          '感谢善启，我得以完成学业，现在我的梦想是回到村里当老师。',
        content: `
我的父母负担不起我的学费，我以为自己不得不辍学回家帮忙。后来善启的圆梦计划找到了我。

感谢他们的支持，我得以完成小学和中学。义工们不只是给钱——他们给我写信、鼓励我，让我相信自己的生活可以不一样。

现在我正在努力学习成为一名教师。我的梦想是回到村里，给下一代带来善启曾给予我的同样希望。
        `.trim(),
      },
      'zh-TW': {
        name: '小湄',
        role: '圓夢計劃受助學生',
        synopsis:
          '感謝善啟，我得以完成學業，現在我的梦想是回到村裡當老師。',
        content: `
我的父母負擔不起我的學費，我以為自己不得不輟學回家幫忙。後來善啟的圓夢計劃找到了我。

感謝他們的支持，我得以完成小學和中學。義工們不只是給錢——他們給我寫信、鼓勵我，讓我相信自己的生活可以不一樣。

現在我正在努力學習成為一名教師。我的夢想是回到村裡，給下一代帶來善啟曾給予我的同樣希望。
        `.trim(),
      },
    },
  },
]
