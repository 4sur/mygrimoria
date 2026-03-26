import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wpService } from '../../services/wpService';

const PostDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPost() {
            if (!slug) return;
            try {
                const data = await wpService.getPostBySlug(slug);
                setPost(data);
            } catch (error) {
                console.error("Error loading post:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadPost();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="p-32 text-center opacity-20 italic font-serif">
                Unraveling the scroll...
            </div>
        );
    }

    if (!post) {
        return (
            <div className="p-32 text-center">
                <h2 className="text-2xl font-serif">Post not found</h2>
                <Link to="/blog" className="text-ink/60 underline mt-4 inline-block">Return to Journal</Link>
            </div>
        )
    }

    return (
        <article className="flex flex-col min-h-screen">
            {/* Hero Header */}
            <section className="relative h-[60vh] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-ink">
                {post.featuredImage?.node?.sourceUrl && (
                    <div
                        className="absolute inset-0 bg-cover bg-center grayscale contrast-110 opacity-40"
                        style={{ backgroundImage: `url("${post.featuredImage.node.sourceUrl}")` }}
                    />
                )}
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    <Link to="/blog" className="mb-6 inline-block rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                        Back to Journal
                    </Link>
                    <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.1] mb-6">
                        {post.title}
                    </h1>
                    <div className="mt-8 flex items-center gap-4 text-white/40 text-[10px] font-bold tracking-widest uppercase">
                        <span>By {post.author?.node?.name || 'The Oracle'}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-[800px] mx-auto px-6 py-20 md:py-32">
                <div
                    className="prose prose-lg dark:prose-invert max-w-none font-serif text-lg md:text-xl leading-relaxed text-ink/80 dark:text-white/80"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>
        </article>
    );
};

export default PostDetail;
