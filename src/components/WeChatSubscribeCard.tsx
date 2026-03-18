import Image from 'next/image';
import { siteConfig } from '@/lib/config';

type WeChatSubscribeCardProps = {
  compact?: boolean;
  className?: string;
};

export default function WeChatSubscribeCard({
  compact = false,
  className = '',
}: WeChatSubscribeCardProps) {
  if (!siteConfig.wechat?.enabled) {
    return null;
  }

  const cardPadding = compact ? 'p-5' : 'p-6';
  const imageSize = compact ? 112 : 144;

  return (
    <section className={`relative overflow-hidden rounded-[1.5rem] border border-subtle/80 bg-card-light/92 shadow-soft dark:border-white/10 dark:bg-card-dark/88 ${cardPadding} ${className}`}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        微信公众号
      </div>
      <div className={`grid gap-5 ${compact ? '' : 'md:grid-cols-[auto_1fr] md:items-center'}`}>
        <div className="mx-auto flex flex-col items-center">
          {siteConfig.wechat.qrImage ? (
            <div className="overflow-hidden rounded-[1.25rem] border border-subtle/70 bg-white p-2 shadow-sm dark:border-white/10">
              <Image
                src={siteConfig.wechat.qrImage}
                alt={`${siteConfig.wechat.accountName} 微信公众号二维码`}
                width={imageSize}
                height={imageSize}
                className="rounded-xl"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-[1.25rem] border border-dashed border-primary/30 bg-gradient-to-br from-primary/10 to-accent/8 text-primary dark:border-primary/25 dark:from-primary/15 dark:to-accent/12" style={{ width: imageSize + 16, height: imageSize + 16 }}>
              <div className="text-2xl font-bold tracking-[0.18em]">WX</div>
            </div>
          )}
          <div className="mt-3 text-xs text-subtle dark:text-muted">
            微信扫码即可关注
          </div>
        </div>

        <div className="space-y-3 text-center md:text-left">
          <h3 className="text-xl font-semibold text-primary">
            {siteConfig.wechat.title}
          </h3>
          <div className="text-base font-medium text-text-light dark:text-text-dark">
            {siteConfig.wechat.accountName}
          </div>
          <p className="leading-7 text-secondary dark:text-muted">
            {siteConfig.wechat.description}
          </p>
        </div>
      </div>
    </section>
  );
}
