import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { siteConfig } from '@/lib/config';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // 生成结构化数据
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteConfig.url}${item.href}`
    }))
  };

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
      
      {/* 面包屑导航 */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-secondary" aria-label="Breadcrumb">
        <Link 
          href="/" 
          className="flex items-center rounded-full border border-subtle/80 px-2.5 py-1.5 hover:text-primary hover:border-primary/20 transition-colors"
          title="首页"
        >
          <HomeIcon className="h-4 w-4" />
          <span className="sr-only">首页</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={item.href} className="flex items-center space-x-2">
            <ChevronRightIcon className="h-4 w-4 text-primary/60" />
            {item.current ? (
              <span className="font-medium text-primary" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link 
                href={item.href} 
                className="hover:text-primary transition-colors"
                title={item.name}
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
} 
