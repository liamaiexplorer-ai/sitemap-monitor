import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BarChart2, Check, Globe, LayoutDashboard, Shield, Zap, Sparkles, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '@/utils/cn';
import { GlassCard } from '@/components/UI/GlassCard';
import { AnimatedBackground } from '@/components/Layout/AnimatedBackground';

export default function Landing() {
    const { t, i18n } = useTranslation();
    const { scrollY } = useScroll();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div className="min-h-screen font-sans overflow-x-hidden text-gray-900 selection:bg-fuchsia-300 selection:text-fuchsia-900">
            <AnimatedBackground />

            {/* Navigation */}
            <nav className="fixed top-6 left-0 right-0 z-50 px-4 md:px-6">
                <div className="max-w-7xl mx-auto glass-panel rounded-full h-16 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30">
                            S
                        </div>
                        <span className="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-900 to-indigo-900">
                            SitemapMonitor
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        {/* Language Switcher */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center p-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50/50">
                                <Languages className="w-5 h-5" />
                            </Menu.Button>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-xl bg-white/90 backdrop-blur-xl py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-white/20">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => changeLanguage('zh')}
                                                className={cn(
                                                    active ? 'bg-slate-50' : '',
                                                    'block px-4 py-2 text-sm text-slate-700 w-full text-left',
                                                    i18n.language === 'zh' ? 'font-bold text-indigo-600' : ''
                                                )}
                                            >
                                                中文
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => changeLanguage('en')}
                                                className={cn(
                                                    active ? 'bg-slate-50' : '',
                                                    'block px-4 py-2 text-sm text-slate-700 w-full text-left',
                                                    i18n.language === 'en' ? 'font-bold text-indigo-600' : ''
                                                )}
                                            >
                                                English
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Transition>
                        </Menu>

                        <a href="#features" className="hover:text-violet-600 transition-colors">{t('landing.features_title')}</a>
                        <Link to="/login" className="px-5 py-2 hover:text-violet-600 transition-all">
                            {t('common.login')}
                        </Link>
                        <Link to="/register" className="px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 duration-300">
                            {t('landing.get_started')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-md text-violet-700 text-sm font-medium shadow-sm cursor-default"
                        >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="font-display">Now Open Source</span>
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight text-slate-900 leading-[1.1]">
                            {t('landing.hero_title')} <br />
                            <span className="relative">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 animate-gradient-x">
                                    {t('landing.hero_title_highlight')}
                                </span>
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-violet-400 opacity-50" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.00021 7.29297C52.5002 2.29297 150.003 -3.20703 198.003 3.79297" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 font-light leading-relaxed">
                            {t('landing.hero_desc')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                            <Link to="/register" className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg overflow-hidden shadow-2xl shadow-violet-500/20 transition-all hover:scale-105">
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {t('landing.get_started')}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Floating Elements */}
                    <motion.div style={{ y: y1 }} className="absolute -left-20 top-40 hidden lg:block opacity-60">
                        <GlassCard className="w-64 rotate-[-6deg]">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Check className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Sitemap Valid</div>
                                    <div className="text-xs text-slate-500">Just now</div>
                                </div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                                <div className="h-full bg-green-500 w-full" />
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div style={{ y: y2 }} className="absolute -right-20 top-60 hidden lg:block opacity-60">
                        <GlassCard className="w-64 rotate-[6deg]">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Zap className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">New URL Found</div>
                                    <div className="text-xs text-slate-500">2 mins ago</div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <div className="h-2 bg-slate-100 rounded-full w-2/3" />
                                <div className="h-2 bg-slate-100 rounded-full w-1/3" />
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">{t('landing.features_title')}</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">{t('landing.features_desc')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Globe, color: "text-blue-600", bg: "bg-blue-100", title: "实时监控", desc: "自动扫描您的 Sitemap，实时检测更改、添加和删除。" },
                            { icon: BarChart2, color: "text-purple-600", bg: "bg-purple-100", title: "变更分析", desc: "通过详细的历史数据可视化增长趋势并识别 SEO 机会。" },
                            { icon: Zap, color: "text-amber-600", bg: "bg-amber-100", title: "即时警报", desc: "当发生关键更改时，立即通过电子邮件、Slack 或 Webhook 获得通知。" },
                            { icon: Shield, color: "text-emerald-600", bg: "bg-emerald-100", title: "健康检查", desc: "自动验证 URL 的 404、重定向和其他状态代码。" },
                            { icon: LayoutDashboard, color: "text-pink-600", bg: "bg-pink-100", title: "现代仪表板", desc: "设计美观、直观的界面，旨在提高效率和清晰度。" },
                            { icon: Check, color: "text-cyan-600", bg: "bg-cyan-100", title: "SEO 验证", desc: "确保您的 Sitemap 遵循最佳实践并针对搜索引擎进行了优化。支持 Google, Bing 等主流搜索引擎标准。" }
                        ].map((feature, i) => (
                            <GlassCard key={i} className="hover:-translate-y-2 transition-transform duration-300">
                                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center ${feature.color} mb-6`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[3rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                    <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden text-center py-24 px-6 shadow-2xl">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8">Ready to take control?</h2>
                            <p className="text-indigo-200 text-xl mb-12 max-w-xl mx-auto font-light">Join thousands of developers and SEO pros who trust Sitemap Monitor.</p>
                            <Link to="/register" className="inline-flex items-center px-10 py-5 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95">
                                {t('landing.get_started')}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/40 bg-white/30 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
                    <p className="mb-2">© {new Date().getFullYear()} SitemapMonitor. Open Source under MIT License.</p>
                    <p>
                        Support: <a href="mailto:liamaiexplorer@gmail.com" className="hover:text-violet-600 transition-colors">liamaiexplorer@gmail.com</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
