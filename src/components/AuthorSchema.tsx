import Image from 'next/image';

interface AuthorInfo {
  name: string;
  description: string;
  url?: string;
  image?: string;
  sameAs?: string[]; // 社交媒体链接
  jobTitle?: string;
  worksFor?: {
    name: string;
    url?: string;
  };
}

interface AuthorSchemaProps {
  author: AuthorInfo;
}

export default function AuthorSchema({ author }: AuthorSchemaProps) {
  const authorStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "description": author.description,
    "url": author.url,
    "image": author.image,
    "sameAs": author.sameAs,
    "jobTitle": author.jobTitle,
    "worksFor": author.worksFor ? {
      "@type": "Organization",
      "name": author.worksFor.name,
      "url": author.worksFor.url
    } : undefined
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(authorStructuredData)
      }}
    />
  );
}

// 作者信息显示组件
interface AuthorCardProps {
  author: AuthorInfo;
  showDescription?: boolean;
}

export function AuthorCard({ author, showDescription = true }: AuthorCardProps) {
  return (
    <div className="flex items-start space-x-4 p-6 bg-muted/30 rounded-lg border border-subtle">
      <AuthorSchema author={author} />
      
      {author.image && (
        <Image
          src={author.image} 
          alt={author.name}
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover"
        />
      )}
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-primary">{author.name}</h3>
        
        {author.jobTitle && (
          <p className="text-secondary text-sm">{author.jobTitle}</p>
        )}
        
        {showDescription && (
          <p className="text-secondary mt-2 text-sm leading-relaxed">
            {author.description}
          </p>
        )}
        
        {author.sameAs && author.sameAs.length > 0 && (
          <div className="flex space-x-3 mt-3">
            {author.sameAs.map((link, index) => (
              <a 
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm underline"
              >
                关注我
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
