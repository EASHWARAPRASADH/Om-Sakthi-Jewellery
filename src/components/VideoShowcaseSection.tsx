import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Film, ArrowRight, Eye, LayoutGrid, MonitorPlay, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface VideoShowcaseProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onExploreCategory: (category: string) => void;
}

interface VideoItem {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  src: string;
  poster: string;
  badge: string;
  description: string;
  tags: string[];
}

const VIDEOS: VideoItem[] = [
  {
    id: 'bridal-gold',
    title: 'Royal Bridal Harams & Chokers',
    category: '22K Gold Heritage',
    categorySlug: 'gold',
    src: '/assets/ai_actor_video.mp4',
    poster: '/assets/ai_actor.jpeg',
    badge: 'Heritage Masterwork',
    description: 'Experience hand-crafted antique masterworks designed by heritage Chola-inspired designers. Every necklace tells a royal tale of pure BIS 916 hallmarked luxury.',
    tags: ['22K BIS 916', 'Chola Antique Finish', 'Bridal Masterpiece', 'Pure Temple Gold']
  },
  {
    id: 'solitaire-diamond',
    title: 'Solitaire Diamond Symphony',
    category: 'VVS-EF Natural Diamonds',
    categorySlug: 'diamond',
    src: '/assets/ai_actor_video2.mp4',
    poster: '/assets/ai_actor1.jpeg',
    badge: 'Starlit Brilliance',
    description: 'Certified VVS Clarity, EF Color diamonds hand-set in certified 18K white gold baskets. Watch the breathtaking fire and starlit sparkle in motion.',
    tags: ['Certified VVS-EF', '18K White Gold', 'Natural Diamonds', 'IGI Certified']
  }
];

export default function VideoShowcaseSection({
  products,
  onSelectProduct,
  onExploreCategory
}: VideoShowcaseProps) {
  const [activeVideoId, setActiveVideoId] = useState<string>(VIDEOS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullWidthCinema, setIsFullWidthCinema] = useState<boolean>(false);
  const [viewFitMode, setViewFitMode] = useState<'contain' | 'cover'>('contain'); // default full view (contain)
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = VIDEOS.find((v) => v.id === activeVideoId) || VIDEOS[0];

  // Pick matching featured products to showcase alongside this video
  const featuredInVideo = products
    .filter((p) => {
      if (currentVideo.categorySlug === 'gold') {
        return p.category === 'gold' && (p.isFeatured || p.isNewArrived);
      }
      return p.category === 'diamond' || p.category === 'silver';
    })
    .slice(0, 3);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section
      id="video-showcase-section"
      className="py-14 bg-[#140306] text-white relative overflow-hidden border-y-2 border-gold-400 scroll-mt-28"
    >
      {/* Background radial gold glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-400/30 text-gold-400 text-xs font-bold tracking-widest uppercase">
            <Film className="w-3.5 h-3.5 text-gold-400" />
            <span>Jewellery in Motion • Video Showcase</span>
          </div>
          
          <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-wide">
            Witness Royal Craftsmanship in Motion
          </h2>
          
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Experience our timeless 916 hallmarked bridal harams, antique chokers, and scintillating diamond solitaires captured in full motion.
          </p>

          {/* Video Selector & View Mode Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {VIDEOS.map((item) => {
              const isActive = item.id === activeVideoId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveVideoId(item.id);
                    setIsPlaying(true);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gold-500 text-maroon-950 shadow-lg shadow-gold-500/20 scale-105'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>{item.title}</span>
                </button>
              );
            })}

            {/* Toggle Full Width Cinema View */}
            <button
              onClick={() => setIsFullWidthCinema(!isFullWidthCinema)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer border ${
                isFullWidthCinema
                  ? 'bg-gold-600 text-maroon-950 border-gold-400 font-bold'
                  : 'bg-white/5 text-gray-300 border-white/15 hover:bg-white/15 hover:text-white'
              }`}
              title={isFullWidthCinema ? 'Switch to Split Layout' : 'Expand to Cinema Full Box View'}
            >
              {isFullWidthCinema ? <Minimize2 className="w-3.5 h-3.5" /> : <MonitorPlay className="w-3.5 h-3.5 text-gold-400" />}
              <span>{isFullWidthCinema ? 'Split View' : 'Cinema Box'}</span>
            </button>
          </div>
        </div>

        {/* Video Player Box and Details */}
        <div className={`grid gap-8 items-start ${isFullWidthCinema ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
          
          {/* Main Video Box: Full View Display */}
          <div className={isFullWidthCinema ? 'w-full max-w-5xl mx-auto' : 'lg:col-span-7'}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-500/40 bg-black/95 h-[480px] sm:h-[560px] md:h-[620px] w-full flex items-center justify-center group">
              
              {/* 1. Ambient Blurred Motion Backdrop (fills the box seamlessly) */}
              <video
                key={`ambient-${currentVideo.id}`}
                src={currentVideo.src}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-110 pointer-events-none"
              />

              {/* 2. Main Foreground Video in Full View */}
              <AnimatePresence mode="wait">
                <motion.video
                  key={`${currentVideo.id}-${viewFitMode}`}
                  ref={videoRef}
                  src={currentVideo.src}
                  poster={currentVideo.poster}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`relative z-10 max-h-full max-w-full drop-shadow-2xl mx-auto ${
                    viewFitMode === 'contain'
                      ? 'h-full object-contain'
                      : 'w-full h-full object-cover'
                  }`}
                />
              </AnimatePresence>

              {/* Top Video Badges & Full View Mode Indicator */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <span className="bg-maroon-950/85 backdrop-blur-md text-gold-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gold-500/30 shadow-md flex items-center gap-1.5 pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {currentVideo.badge}
                </span>

                {/* View Mode Fit/Cover Toggle */}
                <button
                  onClick={() => setViewFitMode(viewFitMode === 'contain' ? 'cover' : 'contain')}
                  className="bg-black/70 hover:bg-black/90 text-gold-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-gold-400/40 backdrop-blur-md transition-all cursor-pointer pointer-events-auto flex items-center gap-1 shadow-md"
                  title="Toggle Full View (Contain) or Fill Box (Cover)"
                >
                  <LayoutGrid className="w-3 h-3 text-gold-400" />
                  <span>{viewFitMode === 'contain' ? 'Full View: Fit' : 'Full View: Fill'}</span>
                </button>
              </div>

              {/* Bottom Video Controls Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-gold-500 hover:bg-gold-400 text-maroon-950 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs hover:scale-105"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="text-[11px] text-gray-300 font-medium hidden sm:inline">
                    {isMuted ? 'Muted' : 'Audio On'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewFitMode(viewFitMode === 'contain' ? 'cover' : 'contain')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium transition-all cursor-pointer backdrop-blur-xs flex items-center gap-1"
                    title="Switch Aspect Ratio"
                  >
                    {viewFitMode === 'contain' ? 'Entire Frame' : 'Cover Box'}
                  </button>

                  <button
                    onClick={handleFullscreen}
                    className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-xs hover:scale-105"
                    title="Fullscreen Mode"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Story & Featured Products */}
          <div className={`${isFullWidthCinema ? 'w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8' : 'lg:col-span-5'} space-y-6 text-left`}>
            
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400 block">
                {currentVideo.category}
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                {currentVideo.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {currentVideo.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentVideo.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded bg-maroon-900/60 border border-gold-500/20 text-gold-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Featured Jewellery Pieces Shown in the Video */}
            <div className="border-t border-gold-500/20 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  Featured in this Video
                </h4>
                <button
                  onClick={() => onExploreCategory(currentVideo.categorySlug)}
                  className="text-[11px] text-gold-400 hover:text-gold-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {featuredInVideo.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-gold-400/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover border border-gold-500/30 shrink-0"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-gold-300 transition-colors">
                          {product.title}
                        </h5>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {product.purity} • {product.weight} gm
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-maroon-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
