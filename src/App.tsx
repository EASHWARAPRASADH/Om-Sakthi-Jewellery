import { useState, useEffect } from 'react';
import { Product, CartItem, Category, MetalRate } from './types';
import { PRODUCTS, CATEGORIES } from './data/jewelryData';

// Modular Component Imports
import TopUtilityBar from './components/TopUtilityBar';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import TrustBadges from './components/TrustBadges';
import CategoryList from './components/CategoryList';
import ProductSection from './components/ProductSection';
import DigitalBusinessCard from './components/DigitalBusinessCard';
import LeadershipSection from './components/LeadershipSection';
import AuspiciousDaysSection from './components/AuspiciousDaysSection';
import SchemesSection from './components/SchemesSection';
import RateCalculatorWidget from './components/RateCalculatorWidget';
import WhatsAppChat from './components/WhatsAppChat';
import QuickViewModal from './components/QuickViewModal';
import StoreLocatorModal from './components/StoreLocatorModal';
import Footer from './components/Footer';
import MJDTARatesModal from './components/MJDTARatesModal';
import AdminDashboard from './components/AdminDashboard';
import { useLanguage } from './context/LanguageContext';

import { Sparkles, ArrowRight, Award, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  // Global client-side states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Interactive Overlays
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [isRateCalculatorOpen, setIsRateCalculatorOpen] = useState(false);
  const [isSchemesModalOpen, setIsSchemesModalOpen] = useState(false);
  const [isRatesBoardOpen, setIsRatesBoardOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const { language, t } = useLanguage();

  // Database States
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbBanners, setDbBanners] = useState<any[]>([]);
  const [dbRates, setDbRates] = useState<any[]>([]);
  const [dbSettings, setDbSettings] = useState<Record<string, string>>({});
  const [dbLoading, setDbLoading] = useState(true);

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.hash || '#/');

  // Load store data from SQLite database
  const loadStoreData = async () => {
    try {
      const res = await fetch('/api-database.php?action=load_all');
      const json = await res.json();
      if (json.success) {
        setDbCategories(json.categories || []);
        setDbProducts(json.products || []);
        setDbBanners(json.banners || []);
        setDbRates(json.rates || []);
        setDbSettings(json.settings || {});
      }
    } catch (err) {
      console.error("Failed to load store data:", err);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  // Hash listener for routing
  useEffect(() => {
    const parseRoute = () => {
      const hash = window.location.hash || '#/';
      setCurrentRoute(hash);
      
      if (hash.startsWith('#/category/')) {
        const slug = hash.replace('#/category/', '');
        setActiveCategory(slug);
        // Scroll to products grid
        setTimeout(() => {
          document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#/admin') {
        // Renders admin full-page
      } else {
        setActiveCategory('all');
      }
    };
    
    parseRoute();
    window.addEventListener('hashchange', parseRoute);
    return () => window.removeEventListener('hashchange', parseRoute);
  }, []);

  const handleSetActiveCategory = (categorySlug: string) => {
    window.location.hash = `#/category/${categorySlug}`;
  };

  // Helper to dynamically calculate dynamic price of gold items based on metal rate
  const getProductPrice = (p: any): number => {
    if (p.price_formula) {
      const num = parseFloat(p.price_formula);
      if (!isNaN(num)) return num;
    }
    
    const rateItem = dbRates.find(r => r.metal === p.metal_type);
    const rate = rateItem ? parseFloat(rateItem.rate) : 13200; // fallback Gold 22K
    
    const basePrice = rate * p.weight;
    const making = basePrice * (p.making_charges / 100);
    const waste = basePrice * (p.waste_charges / 105);
    
    return Math.round(basePrice + making + waste);
  };

  // Map products
  const products: Product[] = (dbProducts && dbProducts.length > 0)
    ? dbProducts.map((p) => {
        const title = p[`title_${language}`] || p.title_en;
        const description = p[`description_${language}`] || p.description_en;
        
        const cat = dbCategories.find(c => c.id === p.category_id);
        const categorySlug = cat ? cat.slug : 'other';
        const subcatName = cat ? cat.name_en : 'Jewelry';
        
        return {
          id: String(p.id),
          title: title,
          category: categorySlug,
          subcategory: subcatName,
          price: getProductPrice(p),
          weight: p.weight,
          image: p.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300',
          rating: 4.8,
          purity: p.purity,
          description: description,
          isFeatured: p.is_featured === 1,
          isNewArrived: p.is_new_arrival === 1,
          sku: p.sku || `OMS-P-${p.id}`,
          gender: p.gender as any,
          occasion: p.occasion as any
        };
      })
    : PRODUCTS;

  // Map categories
  const categoriesList: Category[] = (dbCategories && dbCategories.length > 0)
    ? dbCategories
        .filter(c => !c.parent_id) // top level
        .map((c) => {
          const subcatIds = dbCategories.filter(sub => sub.parent_id === c.id).map(sub => sub.id);
          const targetIds = [c.id, ...subcatIds];
          const count = dbProducts.filter(p => targetIds.includes(p.category_id)).length;
          const name = c[`name_${language}`] || c.name_en;
          
          return {
            id: String(c.id),
            name: name,
            slug: c.slug,
            image: c.image || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=300',
            itemCount: count
          };
        })
    : CATEGORIES;

  // Map slides
  const defaultSlides = [
    {
      id: 1,
      title: t('hero.slide1_title') || 'Royal Bridal Harams & Chokers',
      subtitle: 'Handcrafting Tamil Nadu’s Royal Heritage Since 1985',
      description: t('hero.slide1_desc') || 'Experience hand-crafted antique masterworks designed by heritage Chola-inspired designers for your timeless wedding day.',
      mediaType: 'video',
      video: '/assets/ai_actor_video.mp4',
      image: '/assets/ai_actor.jpeg',
      link: '#/category/gold'
    },
    {
      id: 2,
      title: t('hero.slide2_title') || 'Solitaire Diamond Necklaces',
      subtitle: 'Legacy of Trust & 100% Purity Guarantee',
      description: t('hero.slide2_desc') || 'Certified VVS Clarity, EF Color diamonds hand-set in certified 18K white gold baskets.',
      mediaType: 'video',
      video: '/assets/ai_actor_video2.mp4',
      image: '/assets/ai_actor1.jpeg',
      link: '#/category/diamond'
    },
    {
      id: 3,
      title: t('hero.slide3_title') || 'DigiGold Savings Scheme',
      subtitle: 'Lock in Today’s Gold Rate for 11 Months',
      description: t('hero.slide3_desc') || 'Lock in today gold rate for 11 months with zero registration charges. Pay monthly and get the 12th installment entirely free!',
      mediaType: 'image',
      image: '/assets/ai_actor2.jpeg',
      link: '#/schemes'
    }
  ];

  const slides = (dbBanners && dbBanners.length > 0)
    ? dbBanners.map((b) => ({
        id: b.id,
        title: b[`title_${language}`] || b.title_en,
        subtitle: b[`subtitle_${language}`] || b.subtitle_en,
        description: b[`subtitle_${language}`] || b.subtitle_en, // reuse subtitle for description
        mediaType: b.media_type,
        image: b.image_url,
        video: b.video_url,
        link: b.link_url
      }))
    : defaultSlides;

  // Filtering Logic
  const getFilteredProducts = () => {
    let filtered = products;

    if (activeCategory === 'all') {
      return filtered;
    }
    
    if (activeCategory === 'offers') {
      return filtered.filter(p => p.discountPrice !== undefined);
    }
    
    if (activeCategory === 'collections') {
      return filtered.filter(p => p.isFeatured);
    }
    
    if (['gold', 'silver', 'platinum', 'diamond', 'coins'].includes(activeCategory)) {
      if (activeCategory === 'coins') {
        return filtered.filter(p => p.category === 'coins' || p.category === 'silver-coins');
      }
      return filtered.filter(p => p.category === activeCategory);
    }

    const parts = activeCategory.split('-');
    
    let targetMetal: string | null = null;
    let targetCatSlug: string | null = null;
    let targetSubcatSlug: string | null = null;
    
    if (['gold', 'silver', 'platinum', 'diamond'].includes(parts[0])) {
      targetMetal = parts[0];
      if (parts[1]) {
        targetCatSlug = parts[1];
        if (parts[2]) {
          targetSubcatSlug = parts[2];
        }
      }
    } else {
      targetCatSlug = parts[0];
      if (parts[1]) {
        targetSubcatSlug = parts[1];
      }
    }
    
    if (targetMetal) {
      filtered = filtered.filter(p => p.category === targetMetal);
    }
    
    if (targetCatSlug) {
      const genderCat = dbCategories.find(c => c.slug === targetCatSlug && c.section_group === 'gender');
      const occasionCat = dbCategories.find(c => c.slug === targetCatSlug && c.section_group === 'occasion');
      
      if (genderCat) {
        filtered = filtered.filter(p => p.gender?.toLowerCase() === targetCatSlug);
      } else if (occasionCat) {
        filtered = filtered.filter(p => p.occasion?.toLowerCase() === targetCatSlug?.replace('-', ' '));
      } else {
        filtered = filtered.filter(p => p.category === targetCatSlug || p.subcategory.toLowerCase() === targetCatSlug);
      }
    }
    
    if (targetSubcatSlug) {
      filtered = filtered.filter(p => p.subcategory.toLowerCase() === targetSubcatSlug);
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Wishlist Handlers
  const handleAddToWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.some((item) => item.id === product.id)) return prevWishlist;
      return [...prevWishlist, product];
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== productId));
  };

  // Dynamic VIP Toast Alert on Scroll / Inactivity for e-commerce conversion triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      const shown = sessionStorage.getItem('oms_vip_toast');
      if (!shown) {
        setIsNoticeOpen(true);
        sessionStorage.setItem('oms_vip_toast', 'true');
      }
    }, 15000); // Trigger after 15 seconds of browsing

    return () => clearTimeout(timer);
  }, []);

  // Staff CMS Dashboard fullscreen routing override
  if (currentRoute === '#/admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 antialiased flex flex-col justify-between selection:bg-gold-200 selection:text-maroon-900">
      
      {/* 1. Top Utility Bar with Scrolling Rate Ticker */}
      <TopUtilityBar 
        onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
        onOpenRateCalculator={() => setIsRateCalculatorOpen(true)}
        onOpenRatesBoard={() => setIsRatesBoardOpen(true)}
      />

      {/* 2. Main Sticky Navigation Header & Mega Menu & Drawer Modals */}
      <Header
        categories={dbCategories}
        cart={cart}
        wishlist={wishlist}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={setSelectedProduct}
        activeCategory={activeCategory}
        setActiveCategory={handleSetActiveCategory}
        onOpenSchemesModal={() => setIsSchemesModalOpen(true)}
      />

      {/* Main Homepage Body sections */}
      <main className="flex-1">
        
        {/* 3. Hero Carousel section */}
        <HeroCarousel slides={slides} />

        {/* 4. Trust Badges strip */}
        <TrustBadges />

        {/* 5. Circular Category Browsing */}
        <CategoryList 
          categories={categoriesList}
          activeCategory={activeCategory}
          onSelectCategory={handleSetActiveCategory}
        />

        {/* Highlight Banner: South Indian Wedding Heritage */}
        <section id="heritage-highlight-banner" className="bg-maroon-800 py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden border-y border-gold-300">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full border-[10px] border-gold-500" />
            <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full border-[10px] border-gold-500" />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Hand-burnished Wedding Masterpieces
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl tracking-wide text-white">
              Handcrafting Tamil Nadu&rsquo;s Royal Heritage Since 1985
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
              From temple coin harams displaying traditional Chola craftsmanship to brilliant modern solitaire drop necklaces, OMS Jewels remains the trusted custodian of pure BIS 916 gold luxury.
            </p>
            <div className="pt-2 flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => handleSetActiveCategory('gold')}
                className="bg-gold-500 hover:bg-gold-600 text-maroon-950 font-bold text-xs py-3 px-6 rounded-full transition-colors cursor-pointer uppercase tracking-wider"
              >
                Browse Gold Showcase
              </button>
              <button
                onClick={() => setIsStoreLocatorOpen(true)}
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold text-xs py-3 px-6 rounded-full transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1"
              >
                Book VIP Lounge Consultation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* 6. Product Grid (Featured & Just Arrived, with integrated category tabs & Quick View) */}
        <ProductSection 
          products={filteredProducts}
          wishlist={wishlist}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onSelectProduct={setSelectedProduct}
          activeCategory={activeCategory}
          setActiveCategory={handleSetActiveCategory}
        />

        {/* Live Auspicious Days & Muhurtham Calendar */}
        <AuspiciousDaysSection />

        {/* Digital Business Card & Profile Section */}
        <DigitalBusinessCard />

        {/* Board of Directors & Leadership */}
        <LeadershipSection />

        {/* 7. Savings Schemes Section with Integrated Calculator slider */}
        <SchemesSection />

        {/* Dynamic promotional segment: DigiGold benefits */}
        <section id="digigold-promo-row" className="bg-gradient-to-r from-gold-50 via-white to-gold-50 py-12 px-4 sm:px-6 lg:px-8 border-t border-gold-200">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-left space-y-2">
              <div className="w-10 h-10 rounded-full bg-maroon-50 flex items-center justify-center text-maroon-800 font-bold border border-maroon-100">01</div>
              <h4 className="font-serif font-bold text-gray-800 text-sm">Lock-in Daily Gold Price</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Shield yourself from inflationary spikes. Under our DigiGold Accumulator, payments are instantly converted to equivalent gold grams at that spot market price.
              </p>
            </div>
            <div className="text-left space-y-2">
              <div className="w-10 h-10 rounded-full bg-maroon-50 flex items-center justify-center text-maroon-800 font-bold border border-maroon-100">02</div>
              <h4 className="font-serif font-bold text-gray-800 text-sm">Complementary 5% Gram Weight</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                We celebrate milestones with you. Upon completing your 11 monthly installments, OMS credits an extra 5% equivalent gram weight onto your final balance absolutely free.
              </p>
            </div>
            <div className="text-left space-y-2">
              <div className="w-10 h-10 rounded-full bg-maroon-50 flex items-center justify-center text-maroon-800 font-bold border border-maroon-100">03</div>
              <h4 className="font-serif font-bold text-gray-800 text-sm">Redemption Versatility</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Exchange accumulated DigiGold grams for anything in our boutiques: bridal necklaces, earrings, diamond bands, or certified Lakshmi gold coins at zero additional premium.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* 8. Corporate Footer & Stores Locator directory */}
      <Footer onOpenStoreLocator={() => setIsStoreLocatorOpen(true)} />

      {/* Floating Interactive Assistants */}
      <WhatsAppChat />

      {/* Floating Rate Calculator widget (Drawer) */}
      <RateCalculatorWidget 
        isOpen={isRateCalculatorOpen}
        onClose={() => setIsRateCalculatorOpen(false)}
      />

      {/* Modals & AnimatePresence Overlays */}
      <AnimatePresence>
        
        {/* Quick View Product Details popup */}
        {selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Store Locator directory search & appointment booking */}
        {isStoreLocatorOpen && (
          <StoreLocatorModal
            isOpen={isStoreLocatorOpen}
            onClose={() => setIsStoreLocatorOpen(false)}
          />
        )}

        {/* Schemes Details Modal */}
        {isSchemesModalOpen && (
          <SchemesSection
            isModalOpen={isSchemesModalOpen}
            onCloseModal={() => setIsSchemesModalOpen(false)}
          />
        )}

        {/* MJDTA Live Rates Board Modal */}
        {isRatesBoardOpen && (
          <MJDTARatesModal
            isOpen={isRatesBoardOpen}
            onClose={() => setIsRatesBoardOpen(false)}
          />
        )}

        {/* Custom VIP Notice Modal Overlay */}
        {isNoticeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border-2 border-gold-400 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              {/* Header banner */}
              <div className="bg-gradient-to-r from-maroon-900 to-maroon-800 p-4 border-b border-gold-400 text-center relative">
                <h3 className="font-serif text-xs font-bold text-gold-300 tracking-wide uppercase flex items-center justify-center gap-1.5">
                  ★ {t('notice.title')} ★
                </h3>
              </div>

              {/* Body */}
              <div className="p-6 text-center space-y-4">
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-semibold">
                  {t('notice.body')}
                </p>
                
                {/* Actions */}
                <button
                  onClick={() => setIsNoticeOpen(false)}
                  className="w-full bg-maroon-800 hover:bg-maroon-900 text-gold-300 font-bold py-2.5 px-6 rounded-lg transition-colors border border-gold-500/30 cursor-pointer text-xs uppercase tracking-wider shadow-md"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
