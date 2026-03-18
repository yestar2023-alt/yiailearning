import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { FaGithub, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { siteConfig } from '../lib/config';
import { fontClasses } from '../lib/fonts';
import ThemeToggle from '../components/ThemeToggle';
import CustomCursorManager from '../components/CustomCursorManager';
import Analytics from '../components/Analytics';
import Performance from '../components/Performance';
import { PerformanceMonitor } from '../components/PerformanceMonitor';
import { Loading } from '../components/Loading';
import { ServiceWorkerStatus, OfflineBanner } from '../components/ServiceWorkerStatus';
import { WebAnalytics } from '../components/WebAnalytics';
import { MonitoringDashboard } from '../components/MonitoringDashboard';

const debugPanelsEnabled = siteConfig.features.debugPanels;

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`
  },
  description: siteConfig.description,
  keywords: ['AI学习', '人工智能', '机器学习', '深度学习', '编程教程', '数据科学', 'Python', 'TensorFlow', 'PyTorch'],
  authors: [{ name: 'Yi Learning' }],
  creator: 'Yi Learning',
  publisher: 'Yi Learning Blog',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [{
      url: siteConfig.logo.url,
      width: 1200,
      height: 630,
      alt: siteConfig.title,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.logo.url],
    creator: siteConfig.social.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: siteConfig.seo.googleVerification,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <body className={`${fontClasses} bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark transition-colors duration-300 min-h-screen flex flex-col`}>
        {/* 性能监控 */}
        <PerformanceMonitor />
        <Analytics />
        <Suspense fallback={<Loading />}>
          <Performance />
        </Suspense>
        {debugPanelsEnabled && <CustomCursorManager />}

        <nav className="glass sticky top-0 z-50 transition-colors duration-300 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 group/logo">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary-light to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20 group-hover/logo:shadow-glow group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-300 relative overflow-hidden">
                    <span className="relative z-10">YI</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-text-main-light dark:text-text-main-dark">AI学习之路</span>
                </Link>
              </div>
              <div className="hidden md:flex space-x-8 items-center">
                {siteConfig.navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-secondary hover:text-primary dark:text-muted dark:hover:text-primary transition-colors font-medium relative group/nav"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out group-hover/nav:w-full" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 space-y-16">
          {children}
        </main>

        <footer className="bg-muted/50 dark:bg-muted/30 border-t border-subtle dark:border-white/10 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">AI学习之路</h4>
                <p className="text-sm text-secondary leading-relaxed max-w-xs">
                  {siteConfig.description}
                </p>
              </div>
              <div>
                                <h4 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">快速链接</h4>
                <ul className="space-y-2 text-sm text-secondary">
                  {siteConfig.navigation.map((item) => (
                    <li key={`footer-${item.name}`}>
                      <Link href={item.href} className="hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">保持联系</h4>
                <div className="flex space-x-4">
                  {siteConfig.social.github && (
                    <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary dark:hover:text-primary-light transition-colors hover:scale-110 transform" aria-label="GitHub">
                      <FaGithub className="text-xl" />
                    </a>
                  )}
                  {siteConfig.social.twitter && (
                    <a href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors hover:scale-110 transform" aria-label="X">
                      <FaXTwitter className="text-xl" />
                    </a>
                  )}
                  {siteConfig.social.youtube && (
                    <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary-light transition-colors hover:scale-110 transform" aria-label="YouTube">
                      <FaYoutube className="text-xl" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-subtle dark:border-white/10 pt-8 text-center">
              <p className="text-xs text-secondary">
                {siteConfig.copyright}
              </p>
            </div>
          </div>
        </footer>

        {/* Service Worker 状态和离线支持 */}
        {debugPanelsEnabled && <OfflineBanner />}
        {debugPanelsEnabled && <ServiceWorkerStatus />}

        {/* Web分析 */}
        <WebAnalytics />

        {/* 监控仪表板 */}
        {debugPanelsEnabled && <MonitoringDashboard />}
      </body>
    </html>
  );
}
