import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import React from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, className, hoverEffect = true, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    'glass-panel rounded-2xl p-6 relative overflow-hidden group',
                    hoverEffect && 'hover:shadow-2xl hover:bg-white/50 transition-all duration-500 hover:-translate-y-1',
                    className
                )}
                {...props}
            >
                {hoverEffect && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = 'GlassCard';
