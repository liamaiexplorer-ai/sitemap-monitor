import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-soft-bg">
            <div
                className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-[80px]"
            />
            <div
                className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-300/20 rounded-full blur-[80px]"
            />
            <div
                className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-violet-200/20 rounded-full blur-[90px]"
            />
        </div>
    );
};
