import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BlogCard from './BlogCard';
import { ArrowRight } from 'lucide-react';

const BlogSection = ({ posts, isLoading, error }) => {
    const navigate = useNavigate();
    const MAX_DISPLAY_POSTS = 3;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
        },
    };

    if (isLoading) {
        return (
            <div className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-center items-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    const displayPosts = posts.slice(0, MAX_DISPLAY_POSTS);

    return (
        <section id="blog" className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold"
                    >
                        블로그
                    </motion.h2>
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        onClick={() => navigate('/blog')}
                        className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors group"
                    >
                        더 보기
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>

                {displayPosts.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">아직 작성된 블로그 포스트가 없습니다.</div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {displayPosts.map((post) => (
                            <motion.div key={post.id} variants={itemVariants} className="h-full">
                                <BlogCard post={post} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default BlogSection;
