import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-300/30 rounded-full blur-[120px] mix-blend-multiply filter"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                    x: [0, -100, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-cyan-300/30 rounded-full blur-[100px] mix-blend-multiply filter"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                }}
                className="absolute -bottom-32 left-1/3 w-[900px] h-[900px] bg-violet-200/30 rounded-full blur-[130px] mix-blend-multiply filter"
            />
        </div>
    );
};
