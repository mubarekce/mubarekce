import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpiritualGardenProps {
  score: number; // 0 - 100
  lastActionTrigger?: number; // timestamp to trigger "water drop"
}

const SpiritualGarden: React.FC<SpiritualGardenProps> = ({ score, lastActionTrigger }) => {
  const [showDrop, setShowDrop] = useState(false);

  // İbadet tetiklendiğinde damla animasyonunu çalıştır
  useEffect(() => {
    if (lastActionTrigger) {
      setShowDrop(true);
      const timer = setTimeout(() => setShowDrop(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastActionTrigger]);

  // Durum belirleyicileri
  const isDead = score < 35;
  const isHealthy = score >= 65;
  const isGolden = score >= 85;

  // Renk Paleti (Dinamik)
  const colors = {
    pot: isDead ? '#451a03' : isHealthy ? '#134e4a' : '#1e293b',
    soil: isDead ? '#78350f' : isHealthy ? '#14532d' : '#451a03',
    leaf: isDead ? '#a16207' : isHealthy ? '#10b981' : '#4ade80',
    accent: isGolden ? '#fbbf24' : '#60a5fa'
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      {/* Arka Plan Işığı (Ambient Glow) */}
      <motion.div
        animate={{
          backgroundColor: isDead ? 'rgba(120, 53, 15, 0.1)' : isGolden ? 'rgba(16, 185, 129, 0.15)' : 'rgba(96, 165, 250, 0.1)',
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 blur-[60px] rounded-full"
      />

      {/* Partikül Efektleri (Positive/Negative) */}
      <div className="absolute inset-0 pointer-events-none">
        {isGolden && [...Array(8)].map((_, i) => (
          <motion.div
            key={`gold-${i}`}
            initial={{ y: 200, opacity: 0 }}
            animate={{ 
              y: [200, 50], 
              opacity: [0, 1, 0],
              x: Math.sin(i) * 100 + (Math.random() * 20)
            }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.5 }}
            className="absolute left-1/2 w-1 h-1 bg-yellow-400 rounded-full blur-[1px]"
          />
        ))}
        {isDead && [...Array(5)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            animate={{ 
              x: [0, 10, -10, 0],
              y: [0, -20, -40],
              opacity: [0, 0.5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
            className="absolute left-1/2 bottom-20 w-2 h-2 bg-amber-900/20 rounded-full blur-[2px]"
          />
        ))}
      </div>

      {/* ANA SAHNE (SVG) */}
      <motion.svg 
        viewBox="0 0 200 200" 
        className="w-48 h-48 drop-shadow-2xl z-10 cursor-pointer"
        whileTap={{ scale: 0.95 }}
      >
        {/* Saksı (Pot) */}
        <defs>
          <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.pot} stopOpacity="1" />
            <stop offset="100%" stopColor="#000" stopOpacity="1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Saksı Gövdesi */}
        <path 
          d="M60,150 L140,150 L130,185 Q100,195 70,185 Z" 
          fill="url(#potGrad)" 
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        <ellipse cx="100" cy="150" rx="40" ry="10" fill={colors.pot} />
        
        {/* Toprak (Soil) */}
        <motion.ellipse 
          animate={{ fill: colors.soil }}
          cx="100" cy="148" rx="35" ry="8" 
        />
        
        {/* KURAKLIK ÇATLAKLARI (Sadece Ölü Durumda) */}
        {isDead && (
          <g opacity="0.4" stroke="#451a03" strokeWidth="1">
            <path d="M80,148 L90,145 M110,148 L120,146 M95,152 L105,150" />
          </g>
        )}

        {/* BİTKİ GÖVDESİ (Stem) */}
        <motion.path
          animate={{
            d: isDead 
              ? "M100,148 Q105,120 115,100" // Eğilmiş
              : isHealthy 
                ? "M100,148 Q100,100 100,60" // Dik ve Uzun
                : "M100,148 Q100,120 100,110", // Orta
            stroke: isDead ? '#78350f' : '#115e59',
            strokeWidth: isHealthy ? 5 : 3
          }}
          fill="none"
          strokeLinecap="round"
        />

        {/* YAPRAKLAR (Leaves) */}
        <AnimatePresence>
          {!isDead && (
            <>
              {/* Sol Alt Yaprak */}
              <motion.path
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 5, 0] }}
                transition={{ rotate: { duration: 3, repeat: Infinity } }}
                d="M100,110 Q80,110 75,95 Q90,90 100,110"
                fill={colors.leaf}
              />
              {/* Sağ Alt Yaprak */}
              <motion.path
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -5, 0] }}
                transition={{ rotate: { duration: 3.5, repeat: Infinity, delay: 0.2 } }}
                d="M100,110 Q120,110 125,95 Q110,90 100,110"
                fill={colors.leaf}
              />
            </>
          )}
          {isHealthy && (
            <>
              {/* Üst Yapraklar */}
              <motion.path
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 3, 0] }}
                transition={{ rotate: { duration: 4, repeat: Infinity } }}
                d="M100,80 Q85,75 80,60 Q95,65 100,80"
                fill={colors.leaf}
              />
              <motion.path
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -3, 0] }}
                transition={{ rotate: { duration: 4.2, repeat: Infinity, delay: 0.5 } }}
                d="M100,80 Q115,75 120,60 Q105,65 100,80"
                fill={colors.leaf}
              />
            </>
          )}
          {/* ÇİÇEK (Sadece Full Skorda) */}
          {isGolden && (
            <motion.g
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="origin-center"
            >
              <circle cx="100" cy="55" r="8" fill="#fcd34d" />
              {[...Array(5)].map((_, i) => (
                <circle 
                  key={i} 
                  cx={100 + Math.cos(i * 1.25) * 12} 
                  cy={55 + Math.sin(i * 1.25) * 12} 
                  r="6" 
                  fill="#f8fafc" 
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* NUR DAMLASI (İbadet Animasyonu) */}
        <AnimatePresence>
          {showDrop && (
            <motion.path
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 140, opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeIn" }}
              d="M100,0 Q105,10 100,15 Q95,10 100,0"
              fill="#60a5fa"
              className="drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]"
            />
          )}
        </AnimatePresence>
      </motion.svg>

      {/* Ripple Effect (Damla değdiğinde) */}
      {showDrop && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute bottom-16 w-20 h-4 rounded-full border border-blue-400 z-0"
        />
      )}
    </div>
  );
};

export default SpiritualGarden;