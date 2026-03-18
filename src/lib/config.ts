const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const socialLinks = {
  github: 'https://github.com/yestar2023-alt',
  twitter: 'https://x.com/Yestar2023Liu',
  youtube: 'https://www.youtube.com/@AI-Innovate-Hub',
};

const wechatAccount = process.env.NEXT_PUBLIC_WECHAT_OFFICIAL_ACCOUNT || 'AI学习之路';
const wechatQrImage = process.env.NEXT_PUBLIC_WECHAT_QR_IMAGE || '';
const wechatDescription =
  process.env.NEXT_PUBLIC_WECHAT_DESCRIPTION ||
  '分享 AI 工具实践、学习心得与开发经验，与你一起探索 AI 学习之路。';

// Site configuration
export const siteConfig = {
  // Basic site info
  title: 'AI学习之路',
  description: '记录 AI 工具、Vibe Coding 和非科班学习者的实践经验与学习心得。',
  language: 'zh-CN',
  url: siteUrl,

  author: {
    name: 'Yi Learning',
    title: 'AI 学习记录者',
    description: '专注于 AI 工具应用与开发实践，分享学习过程中的经验与思考。',
    image: '/logo.png',
    sameAs: [socialLinks.github, socialLinks.twitter, socialLinks.youtube],
  },

  // Social media links
  social: {
    ...socialLinks,
    twitterHandle: '@Yestar2023Liu',
    wechat: wechatAccount,
  },

  wechat: {
    enabled: true,
    title: '微信公众号',
    accountName: wechatAccount,
    description: wechatDescription,
    qrImage: wechatQrImage || undefined,
  },

  // Navigation links
  navigation: [
    { name: '首页', href: '/' },
    { name: 'Vibe Coding', href: '/vibe-coding' },
    { name: '关于', href: '/about' },
    // { name: '学习路线', href: '/roadmap' }, // 暂时隐藏，待完善后恢复
    // { name: '资源', href: '/resources' }, // 暂时隐藏，待完善后恢复
    { name: '博客', href: '/posts' },
  ],

  // Logo configuration
  logo: {
    type: 'image' as 'text' | 'image', // Can be 'text' or 'image'
    text: 'AI学习', // Used if type is 'text'
    url: '/logo.png', // Used if type is 'image', path relative to /public
    alt: 'AI学习之路 Logo', // Alt text for image logo
  },

  seo: {
    googleVerification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
  },

  features: {
    debugPanels: process.env.NEXT_PUBLIC_ENABLE_DEBUG_UI === 'true',
  },

  // Copyright text
  copyright: `© ${new Date().getFullYear()} Yi Learning Blog. All rights reserved.`,
};
