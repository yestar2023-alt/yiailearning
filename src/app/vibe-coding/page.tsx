import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Vibe Coding Works',
    description: 'A showcase of my vibe coding projects, websites, and GitHub repositories.',
};

export default function VibeCodingPage() {
    const websites = [
        {
            title: 'Blade of Glorp',
            description: 'A distinctive web experience showcasing unique aesthetics and interactive elements.',
            url: 'https://bladeofglorp.com',
            tags: ['Web Design', 'Interactive', 'Vibe'],
        },
        {
            title: 'Maelstrom Rod',
            description: 'A specialized sub-site featuring detailed guides and visual storytelling.',
            url: 'https://maelstromrod.bladeofglorp.com',
            tags: ['Guide', 'Visuals', 'Fantasy'],
        },
    ];

    const repos = [
        {
            name: 'auto_split_frames',
            description: 'A tool for automated frame splitting and processing, featuring base64 output handling.',
            url: 'https://github.com/yestar2023-alt/auto_split_frames',
            stars: '★',
            language: 'Python',
        },
        {
            name: 'yestar2023-alt',
            description: 'My GitHub profile hosting various vibe coding experiments and projects.',
            url: 'https://github.com/yestar2023-alt',
            stars: '∞',
            language: 'Profile',
        },
    ];

    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
            <div className="mb-16 text-center">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-6">
                    Vibe Coding Works
                </h1>
                <p className="text-xl text-secondary max-w-2xl mx-auto">
                    Exploring the intersection of code, design, and pure vibe.
                    Check out my latest websites and open source contributions.
                </p>
            </div>

            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-text flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-primary/10 text-primary">🌐</span>
                        Websites
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {websites.map((site, index) => (
                        <a
                            key={index}
                            href={site.url}
                            className="group relative block h-full bg-card border border-subtle rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="p-8 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-text group-hover:text-primary transition-colors">
                                        {site.title}
                                    </h3>
                                    <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                                        Live
                                    </span>
                                </div>
                                <p className="text-secondary mb-6 flex-grow">
                                    {site.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {site.tags.map((tag) => (
                                        <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted text-secondary border border-subtle">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-text flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-primary/10 text-primary">📦</span>
                        GitHub Repos
                    </h2>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-medium">
                        View all on GitHub →
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {repos.map((repo, index) => (
                        <a
                            key={index}
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-card border border-subtle rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors flex items-center gap-2">
                                    {repo.name}
                                </h3>
                                <div className="flex items-center gap-1 text-secondary text-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" /></svg>
                                    {repo.stars}
                                </div>
                            </div>
                            <p className="text-secondary text-sm mb-4 line-clamp-2">
                                {repo.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-secondary">
                                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                                {repo.language}
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}
