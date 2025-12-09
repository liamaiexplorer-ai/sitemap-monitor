import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Check, Globe, LayoutDashboard, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function Landing() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            SitemapMonitor
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
                        <Link to="/login" className="px-4 py-2 border border-slate-200 rounded-full hover:border-indigo-600 hover:text-indigo-600 transition-all">
                            {t('common.login')}
                        </Link>
                        <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                            {t('landing.get_started')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={stagger}
                        className="space-y-6"
                    >
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium border border-indigo-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Now Open Source
                        </motion.div>

                        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
                            {t('landing.hero_title')} <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
                                {t('landing.hero_title_highlight')}
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeIn} className="max-w-2xl mx-auto text-xl text-slate-600">
                            {t('landing.hero_desc')}
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                                {t('landing.get_started')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <LayoutDashboard className="w-5 h-5" />
                                {t('landing.view_demo')}
                            </a>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
            </section>

            {/* Stats/Social Proof (Optional placeholder) */}
            <section className="py-10 border-y border-slate-100 bg-white/50">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: 'Sitemaps Monitored', value: '10k+' },
                        { label: 'Changes Detected', value: '1M+' },
                        { label: 'Uptime', value: '99.9%' },
                        { label: 'Open Source', value: '100%' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('landing.features_title')}</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.features_desc')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe,
                                title: "Real-time Monitoring",
                                desc: "Automatically scan your sitemaps for changes, additions, and removals as they happen."
                            },
                            {
                                icon: BarChart2,
                                title: "Change Analytics",
                                desc: "Visualize growth trends and identify SEO opportunities with detailed historical data."
                            },
                            {
                                icon: Zap,
                                title: "Instant Alerts",
                                desc: "Get notified via Email, Slack, or Webhook immediately when critical changes occur."
                            },
                            {
                                icon: Shield,
                                title: "Health Checks",
                                desc: "Automatically validate URLs for 404s, redirects, and other status codes."
                            },
                            {
                                icon: LayoutDashboard,
                                title: "Modern Dashboard",
                                desc: "A beautiful, intuitive interface designed for efficiency and clarity."
                            },
                            {
                                icon: Check,
                                title: "SEO Validation",
                                desc: "Ensure your sitemap follows best practices and is optimized for search engines."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto bg-indigo-900 rounded-3xl overflow-hidden relative text-center py-20 px-6">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to take control?</h2>
                        <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">Join thousands of developers and SEO pros who trust Sitemap Monitor.</p>
                        <Link to="/register" className="inline-flex items-center px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors">
                            {t('landing.get_started')}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4 text-white">
                            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-xs">S</div>
                            <span className="font-bold text-lg">SitemapMonitor</span>
                        </div>
                        <p className="max-w-xs text-sm">
                            {t('landing.footer_desc')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Features</a></li>
                            <li><a href="#" className="hover:text-white">Pricing</a></li>
                            <li><a href="#" className="hover:text-white">API</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Community</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">GitHub</a></li>
                            <li><a href="#" className="hover:text-white">Discord</a></li>
                            <li><a href="#" className="hover:text-white">Twitter</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center md:text-left text-xs">
                    © {new Date().getFullYear()} SitemapMonitor. Open Source under MIT License.
                </div>
            </footer>
        </div>
    );
}
