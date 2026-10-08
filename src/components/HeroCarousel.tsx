import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface HeroCarouselProps {
  slides?: any[];
}

export default function HeroCarousel({ slides = [] }: HeroCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prevIdx) => (prevIdx + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [currentIdx, slides.length]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIdx];

  const handlePrev = () => {
    setCurrentIdx((prevIdx) => (prevIdx - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIdx((prevIdx) => (prevIdx + 1) % slides.length);
  };

  const slide = {
    badge: t('heritage.badge') || currentSlide.badge || 'Showroom Exclusive',
    ctaText: t('hero.explore_btn') || currentSlide.ctaText || 'Explore Collection',
    tagline: currentSlide.subtitle || currentSlide.tagline || 'OM SAKTHI JEWELLERY',
    ...currentSlide
  };

  return (
    <div
      id="hero-carousel"
      className="relative min-h-[460px] sm:min-h-[500px] lg:h-[560px] bg-[#220308] overflow-hidden border-b-2 border-gold-400 select-none"
    >
      {/* Slides with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full flex flex-col justify-center"
        >
          {/* Ambient Blurred Background (warm reflection of slide image without cut-offs) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <img
              src={slide.image}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-20 scale-125 filter saturate-150"
            />
            {/* Dark luxury radial gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1c0206] via-[#240409]/95 to-[#190205]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent" />
          </div>

          {/* Main 2-Column Content Showcase */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full relative z-10 flex flex-col md:flex-row items-center justify-between">
            
            {/* Left Column: Royal Typography & Actions */}
            <div className="w-full md:w-7/12 py-8 md:py-0 text-left space-y-4 z-20">
              
              {/* Premium Heritage Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-1.5 bg-gold-500/20 border border-gold-400 text-gold-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full backdrop-blur-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" /> {slide.badge}
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-wide drop-shadow-lg"
              >
                {slide.title}
              </motion.h1>

              {/* Sub-tagline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-gold-300 text-sm sm:text-base font-semibold font-serif italic"
              >
                {slide.tagline}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="text-gray-200 text-xs sm:text-sm leading-relaxed font-sans max-w-lg drop-shadow-sm"
              >
                {slide.description}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="pt-2 flex flex-wrap gap-3"
              >
                <button
                  onClick={() => {
                    document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gold-500 hover:bg-gold-600 text-maroon-950 font-bold text-xs px-6 py-3 rounded-full transition-all flex items-center gap-1.5 shadow-lg shadow-gold-500/20 border border-gold-300 cursor-pointer uppercase tracking-wider hover:scale-105"
                >
                  {slide.ctaText}
                </button>
                
                <button
                  onClick={() => {
                    document.getElementById('savings-schemes-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-transparent hover:bg-white/10 text-white font-semibold text-xs px-6 py-3 rounded-full transition-all border border-white/40 cursor-pointer uppercase tracking-wider flex items-center gap-1.5 hover:border-gold-300"
                >
                  <Award className="w-4 h-4 text-gold-400" /> {t('header.schemes')}
                </button>
              </motion.div>

            </div>

            {/* Right Column: Ambassador / Model in Full View (Uncropped Head, Face & Attire) */}
            <div className="w-full md:w-5/12 h-[280px] sm:h-[380px] md:h-full flex items-end justify-center md:justify-end relative z-10 pt-4 md:pt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full max-h-full flex items-end justify-center relative"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-auto max-h-[320px] sm:max-h-[420px] md:max-h-[520px] object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter brightness-105 contrast-105 pointer-events-none"
                />

                {/* Subtle soft fade at the very base of the image */}
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#220308] to-transparent pointer-events-none" />

                {/* Floating Trust Pill */}
                <div className="hidden lg:flex absolute top-6 right-0 items-center gap-1.5 px-3 py-1 rounded-full bg-maroon-950/85 border border-gold-400/40 text-gold-300 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg">
                  ★ Hallmarked 916 Pure Trust ★
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Left/Right Arrows */}
      <button
        id="btn-carousel-prev"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-maroon-700 text-white flex items-center justify-center border border-white/20 hover:border-gold-400 transition-all cursor-pointer backdrop-blur-xs hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        id="btn-carousel-next"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-maroon-700 text-white flex items-center justify-center border border-white/20 hover:border-gold-400 transition-all cursor-pointer backdrop-blur-xs hover:scale-110"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom Indicators / Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIdx(idx)}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              currentIdx === idx ? 'w-8 bg-gold-500' : 'w-2.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
