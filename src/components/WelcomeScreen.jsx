import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

export default function WelcomeScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      {/* Decorative center burst */}
      <motion.div
        className="absolute w-96 h-96 bg-primary-500 rounded-full blur-[150px] opacity-30"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.2 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <div className="relative flex flex-col items-center justify-center z-10">
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2,
          }}
          className="mb-6 p-4 rounded-3xl bg-gradient-to-tr from-primary-600/30 to-accent-500/30 backdrop-blur-md border border-white/10 shadow-2xl"
        >
          <UtensilsCrossed className="w-16 h-16 text-white drop-shadow-md" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.4,
          }}
          className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight"
        >
          LinkRas
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-4 text-primary-200/80 text-lg md:text-xl font-light tracking-wide uppercase"
        >
          Smart Digital Menu
        </motion.p>
      </div>
    </motion.div>
  );
}
