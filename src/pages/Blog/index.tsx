import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wpService } from '../../services/wpService';

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            try {
                const data = await wpService.getPosts();
                setPosts(data);
            } catch (error) {
                console.error("Error loading posts:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadPosts();
    }, []);

    if (isLoading) {
        return (
            <div className="p-32 text-center opacity-20 italic font-serif">
                Ascending the mountain of data...
            </div>
        );
    }

    return (
        <div className="px-6 md:px-12 lg:px-20 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-end md:py-24">
                <div className="max-w-2xl">
                    <h2 className="font-serif text-5xl font-normal leading-tight text-ink dark:text-white md:text-7xl lg:text-8xl">
                        The Oracle<br /><span className="italic text-ink/40 dark:text-white/40">Journal</span>
                    </h2>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-12 pb-24">
                {posts.map((post, index) => {
                    const isLarge = index === 0;
                    return (
                        <article
                            key={post.id}
                            className={`group flex flex-col gap-4 ${isLarge ? 'lg:col-span-8' : 'lg:col-span-4'}`}
                        >
                            <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-3xl bg-paper aspect-[16/9] lg:aspect-auto h-full min-h-[300px] border border-ink/5">
                                {post.featuredImage?.node?.sourceUrl ? (
                                    <img
                                        src={post.featuredImage.node.sourceUrl}
                                        alt={post.title}
                                        className="h-full w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-ink/5 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl opacity-10">image</span>
                                    </div>
                                )}
                            </Link>
                            <div className="flex flex-col gap-2 pt-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-white/40">
                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                </div>
                                <h3 className={`font-serif text-ink dark:text-white group-hover:italic transition-all ${isLarge ? 'text-3xl md:text-5xl' : 'text-2xl'}`}>
                                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                                </h3>
                                <div
                                    className="max-w-xl text-sm leading-relaxed text-ink/60 dark:text-white/60 font-sans line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                                />
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default Blog;
