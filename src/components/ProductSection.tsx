import { useState } from 'react';
import { Product } from '../types';
import { Heart, ShoppingCart, Star, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface ProductSectionProps {
  products: Product[];
  wishlist: Product[];
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function ProductSection({
  products,
  wishlist,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  onSelectProduct,
  activeCategory,
  setActiveCategory,
}: ProductSectionProps) {
  const { t } = useLanguage();
  const [activeSectionTab, setActiveSectionTab] = useState<'featured' | 'new'>('featured');

  const filterTabs = [
    { id: 'all', name: 'All Jewellery' },
    { id: 'gold', name: 'Gold' },
    { id: 'diamond', name: 'Diamond' },
    { id: 'silver', name: 'Silver' },
    { id: 'platinum', name: 'Platinum' },
    { id: 'coins', name: 'Coins & Bars' },
    { id: 'gift', name: 'Gift Store' },
    { id: 'collections', name: 'Collections' },
    { id: 'offers', name: 'Offers' },
  ];

  // Filter products by selected catalog category AND isFeatured/isNewArrived
  const filteredProducts = products.filter((p) => {
    // 1. Category Filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'offers') {
        if (!p.discountPrice) return false;
      } else if (activeCategory === 'collections') {
        if (!p.isFeatured) return false;
      } else if (activeCategory.startsWith('gold_')) {
        // Gold specific filters
        if (p.category !== 'gold' && !activeCategory.includes('gold_coins_art') && !activeCategory.includes('gold_bars_art')) return false;

        if (activeCategory.startsWith('gold_earrings_')) {
          if (p.subcategory.toLowerCase() !== 'earrings') return false;
        } else if (activeCategory.startsWith('gold_rings_')) {
          if (p.subcategory.toLowerCase() !== 'rings') return false;
        } else if (activeCategory === 'gold_mangalsutra') {
          if (p.subcategory.toLowerCase() !== 'necklaces' && p.subcategory.toLowerCase() !== 'chains' && !p.title.toLowerCase().includes('mangalsutra')) return false;
        } else if (activeCategory.startsWith('gold_bracelets_') || activeCategory === 'gold_bangles') {
          if (p.subcategory.toLowerCase() !== 'bangles' && p.subcategory.toLowerCase() !== 'bracelets') return false;
        } else if (activeCategory.startsWith('gold_necklace_')) {
          if (p.subcategory.toLowerCase() !== 'necklaces') return false;
        } else if (activeCategory === 'gold_nosepin') {
          if (p.subcategory.toLowerCase() !== 'nosepin' && p.subcategory.toLowerCase() !== 'nosepins' && !p.title.toLowerCase().includes('nosepin')) return false;
        } else if (activeCategory === 'gold_pendant') {
          if (p.subcategory.toLowerCase() !== 'pendants' && p.subcategory.toLowerCase() !== 'pendant' && p.subcategory.toLowerCase() !== 'necklaces') return false;
        } else if (activeCategory === 'gold_coins_art' || activeCategory === 'gold_bars_art') {
          if (p.category !== 'coins' && p.subcategory.toLowerCase() !== 'coins') return false;
        } else if (activeCategory === 'gold_chains') {
          if (p.subcategory.toLowerCase() !== 'chains' && p.subcategory.toLowerCase() !== 'chain') return false;
        } else if (activeCategory === 'gold_special_ornaments') {
          if (!p.isFeatured) return false;
        } else if (activeCategory.startsWith('gold_gender_')) {
          const genderKey = activeCategory.substring(12);
          if (genderKey === 'female' && p.gender !== 'Female') return false;
          if (genderKey === 'male' && p.gender !== 'Male' && p.gender !== 'Unisex') return false;
          if (genderKey === 'unisex' && p.gender !== 'Unisex') return false;
          if (genderKey === 'kids_teens' && p.gender !== 'Kids & Teens' && p.gender !== 'Unisex') return false;
        } else if (activeCategory.startsWith('gold_occasion_')) {
          const occKey = activeCategory.substring(14);
          if (occKey === 'casual' && p.occasion !== 'Casual Wear') return false;
          if (occKey === 'party' && p.occasion !== 'Party Wear') return false;
          if (occKey === 'traditional' && p.occasion !== 'Traditional Wear') return false;
        }
      } else if (activeCategory.startsWith('diamond_')) {
        // Diamond specific filters
        if (p.category !== 'diamond') return false;

        if (activeCategory.startsWith('diamond_earrings_')) {
          if (p.subcategory.toLowerCase() !== 'earrings') return false;
        } else if (activeCategory.startsWith('diamond_rings_')) {
          if (p.subcategory.toLowerCase() !== 'rings') return false;
        } else if (activeCategory.startsWith('diamond_bracelets_')) {
          if (p.subcategory.toLowerCase() !== 'bracelets' && p.subcategory.toLowerCase() !== 'bangles') return false;
        } else if (activeCategory.startsWith('diamond_necklace_')) {
          if (p.subcategory.toLowerCase() !== 'necklaces') return false;
        } else if (activeCategory === 'diamond_pendant') {
          if (p.subcategory.toLowerCase() !== 'pendants' && p.subcategory.toLowerCase() !== 'pendant') return false;
        } else if (activeCategory === 'diamond_nosepin') {
          if (p.subcategory.toLowerCase() !== 'nosepin' && p.subcategory.toLowerCase() !== 'nosepins' && !p.title.toLowerCase().includes('nosepin')) return false;
        } else if (activeCategory.startsWith('diamond_gender_')) {
          const genderKey = activeCategory.substring(15);
          if (genderKey === 'female' && p.gender !== 'Female') return false;
          if (genderKey === 'male' && p.gender !== 'Male' && p.gender !== 'Unisex') return false;
          if (genderKey === 'unisex' && p.gender !== 'Unisex') return false;
          if (genderKey === 'kids_teens' && p.gender !== 'Kids & Teens' && p.gender !== 'Unisex') return false;
        } else if (activeCategory.startsWith('diamond_occasion_')) {
          const occKey = activeCategory.substring(17);
          if (occKey === 'casual' && p.occasion !== 'Casual Wear') return false;
          if (occKey === 'party' && p.occasion !== 'Party Wear') return false;
          if (occKey === 'traditional' && p.occasion !== 'Traditional Wear') return false;
        }
      } else if (activeCategory.startsWith('silver_')) {
        // Silver specific filters
        if (p.category !== 'silver' && p.category !== 'coins') return false;

        if (activeCategory.startsWith('silver_earrings_')) {
          if (p.subcategory.toLowerCase() !== 'earrings') return false;
        } else if (activeCategory.startsWith('silver_rings_')) {
          if (p.subcategory.toLowerCase() !== 'rings') return false;
        } else if (activeCategory === 'silver_anklets') {
          if (p.subcategory.toLowerCase() !== 'anklets' && !p.title.toLowerCase().includes('anklet')) return false;
        } else if (activeCategory === 'silver_coins') {
          if (p.category !== 'coins' && p.subcategory.toLowerCase() !== 'coins') return false;
        } else if (activeCategory.startsWith('silver_bracelets_') || activeCategory === 'silver_bangles') {
          if (p.subcategory.toLowerCase() !== 'bracelets' && p.subcategory.toLowerCase() !== 'bangles') return false;
        } else if (activeCategory.startsWith('silver_necklace_')) {
          if (p.subcategory.toLowerCase() !== 'necklaces') return false;
        } else if (activeCategory === 'silver_toe_rings') {
          if (p.subcategory.toLowerCase() !== 'toe rings' && p.subcategory.toLowerCase() !== 'toering' && !p.title.toLowerCase().includes('toe ring')) return false;
        } else if (activeCategory === 'silver_watch_charm') {
          if (p.subcategory.toLowerCase() !== 'charms' && !p.title.toLowerCase().includes('watch')) return false;
        } else if (activeCategory === 'silver_pendant') {
          if (p.subcategory.toLowerCase() !== 'pendants' && p.subcategory.toLowerCase() !== 'pendant') return false;
        } else if (activeCategory === 'silver_mangalsutra') {
          if (!p.title.toLowerCase().includes('mangalsutra')) return false;
        } else if (activeCategory === 'silver_chains') {
          if (p.subcategory.toLowerCase() !== 'chains' && p.subcategory.toLowerCase() !== 'chain') return false;
        } else if (activeCategory === 'silver_articles') {
          if (p.category !== 'silver' || p.subcategory.toLowerCase() === 'earrings' || p.subcategory.toLowerCase() === 'rings' || p.subcategory.toLowerCase() === 'necklaces' || p.subcategory.toLowerCase() === 'bangles' || p.subcategory.toLowerCase() === 'bracelets') return false;
        } else if (activeCategory.startsWith('silver_gender_')) {
          const genderKey = activeCategory.substring(14);
          if (genderKey === 'female' && p.gender !== 'Female') return false;
          if (genderKey === 'male' && p.gender !== 'Male' && p.gender !== 'Unisex') return false;
          if (genderKey === 'unisex' && p.gender !== 'Unisex') return false;
          if (genderKey === 'kids_teens' && p.gender !== 'Kids & Teens' && p.gender !== 'Unisex') return false;
        } else if (activeCategory.startsWith('silver_occasion_')) {
          const occKey = activeCategory.substring(16);
          if (occKey === 'casual' && p.occasion !== 'Casual Wear') return false;
          if (occKey === 'party' && p.occasion !== 'Party Wear') return false;
          if (occKey === 'traditional' && p.occasion !== 'Traditional Wear') return false;
        }
      } else if (activeCategory.startsWith('platinum_')) {
        // Platinum specific filters
        if (p.category !== 'platinum') return false;

        if (activeCategory.startsWith('platinum_earrings_')) {
          if (p.subcategory.toLowerCase() !== 'earrings') return false;
        } else if (activeCategory.startsWith('platinum_rings_')) {
          if (p.subcategory.toLowerCase() !== 'rings') return false;
        } else if (activeCategory.startsWith('platinum_bracelets_') || activeCategory === 'platinum_bangles') {
          if (p.subcategory.toLowerCase() !== 'bracelets' && p.subcategory.toLowerCase() !== 'bangles') return false;
        } else if (activeCategory === 'platinum_pendant') {
          if (p.subcategory.toLowerCase() !== 'pendants' && p.subcategory.toLowerCase() !== 'pendant') return false;
        } else if (activeCategory === 'platinum_chains') {
          if (p.subcategory.toLowerCase() !== 'chains' && p.subcategory.toLowerCase() !== 'chain') return false;
        } else if (activeCategory.startsWith('platinum_gender_')) {
          const genderKey = activeCategory.substring(16);
          if (genderKey === 'female' && p.gender !== 'Female') return false;
          if (genderKey === 'male' && p.gender !== 'Male' && p.gender !== 'Unisex') return false;
          if (genderKey === 'unisex' && p.gender !== 'Unisex') return false;
        } else if (activeCategory.startsWith('platinum_occasion_')) {
          const occKey = activeCategory.substring(18);
          if (occKey === 'casual' && p.occasion !== 'Casual Wear') return false;
          if (occKey === 'party' && p.occasion !== 'Party Wear') return false;
          if (occKey === 'traditional' && p.occasion !== 'Traditional Wear') return false;
        }
      } else if (activeCategory.startsWith('coins')) {
        // Coins specific filters
        if (activeCategory === 'coins') {
          if (p.category !== 'coins') return false;
        } else if (activeCategory.startsWith('coins_gold')) {
          if (p.category !== 'coins') return false;
          if (!p.title.toLowerCase().includes('gold') && !p.purity.toLowerCase().includes('gold')) return false;
          
          if (activeCategory === 'coins_gold_24kt' && !p.purity.includes('24K')) return false;
          if (activeCategory === 'coins_gold_22kt' && !p.purity.includes('22K')) return false;
          if (activeCategory === 'coins_gold_lakshmi' && !p.title.toLowerCase().includes('lakshmi')) return false;
          if (activeCategory === 'coins_gold_ganesha' && !p.title.toLowerCase().includes('ganesha')) return false;
          if (activeCategory === 'coins_gold_bars' && !p.title.toLowerCase().includes('bar')) return false;
        } else if (activeCategory.startsWith('coins_silver')) {
          if (p.category !== 'coins' && p.category !== 'silver') return false;
          if (!p.title.toLowerCase().includes('silver') && !p.purity.toLowerCase().includes('silver')) return false;

          if (activeCategory === 'coins_silver_999' && !p.purity.includes('999')) return false;
          if (activeCategory === 'coins_silver_lakshmi' && !p.title.toLowerCase().includes('lakshmi')) return false;
          if (activeCategory === 'coins_silver_ganesha' && !p.title.toLowerCase().includes('ganesha')) return false;
          if (activeCategory === 'coins_silver_bars' && !p.title.toLowerCase().includes('bar')) return false;
        } else if (activeCategory.startsWith('coins_weight_')) {
          if (activeCategory === 'coins_weight_0_5g_2g') {
            if (p.weight > 2) return false;
          } else if (activeCategory === 'coins_weight_4g_8g') {
            if (p.weight <= 2 || p.weight > 8) return false;
          } else if (activeCategory === 'coins_weight_10g_50g') {
            if (p.weight < 10 || p.weight > 50) return false;
          } else if (activeCategory === 'coins_weight_100g_above') {
            if (p.weight < 100) return false;
          }
        }
      } else if (activeCategory.startsWith('gift')) {
        // Gift specific filters
        if (activeCategory === 'gift') {
          // Default gift store landing: show gift voucher and selected high-rating products under 90k, or featured items
          if (p.id !== 'coin-9' && p.price > 90000 && !p.isFeatured) return false;
        } else {
          if (activeCategory === 'gift_gold_coins') {
            if (p.category !== 'coins') return false;
            if (!p.title.toLowerCase().includes('gold')) return false;
          } else if (activeCategory === 'gift_silver_coins') {
            if (p.category !== 'coins') return false;
            if (!p.title.toLowerCase().includes('silver')) return false;
          } else if (activeCategory === 'gift_silver_articles') {
            if (p.category !== 'silver' || p.subcategory !== 'Home Decor') return false;
          } else if (activeCategory === 'gift_voucher') {
            if (p.id !== 'coin-9') return false;
          } else if (activeCategory.startsWith('gift_occasion_')) {
            const occ = activeCategory.substring(14);
            if (occ === 'anniversary' && p.subcategory !== 'Rings' && p.subcategory !== 'Necklaces') return false;
            if (occ === 'birthday' && p.subcategory !== 'Earrings' && p.subcategory !== 'Bracelets' && p.id !== 'coin-3') return false;
            if (occ === 'wedding' && p.price < 100000) return false;
            if (occ === 'auspicious' && p.category !== 'coins' && p.category !== 'silver') return false;
            if (occ === 'personalized' && p.subcategory !== 'Rings' && p.subcategory !== 'Pendants') return false;
          } else if (activeCategory.startsWith('gift_price_')) {
            const priceKey = activeCategory.substring(11);
            if (priceKey === 'under_10k' && p.price >= 10000) return false;
            if (priceKey === '10k_20k' && (p.price < 10000 || p.price >= 20000)) return false;
            if (priceKey === '20k_30k' && (p.price < 20000 || p.price >= 30000)) return false;
            if (priceKey === '30k_50k' && (p.price < 30000 || p.price >= 50000)) return false;
            if (priceKey === '50k_1l' && (p.price < 50000 || p.price >= 100000)) return false;
            if (priceKey === 'above_1l' && p.price < 100000) return false;
          } else if (activeCategory.startsWith('gift_recipient_')) {
            const rec = activeCategory.substring(15);
            if (rec === 'his' && p.gender !== 'Male' && p.gender !== 'Unisex') return false;
            if (rec === 'her' && p.gender !== 'Female' && p.gender !== 'Unisex') return false;
            if (rec === 'unisex' && p.gender !== 'Unisex') return false;
          }
        }
      } else if (activeCategory.startsWith('sub_')) {
        const sub = activeCategory.substring(4).toLowerCase();
        // Match subcategories like 'Rings', 'Earrings', 'Necklaces', 'Bangles' or combinations
        if (sub === 'bangles_bracelets') {
          if (p.subcategory.toLowerCase() !== 'bangles' && p.subcategory.toLowerCase() !== 'bracelets') return false;
        } else if (sub === 'mangalsutra') {
          if (p.subcategory.toLowerCase() !== 'necklaces' && p.subcategory.toLowerCase() !== 'chains') return false;
        } else if (sub === 'chain') {
          if (p.subcategory.toLowerCase() !== 'chains' && p.subcategory.toLowerCase() !== 'necklaces') return false;
        } else if (sub === 'necklace') {
          if (p.subcategory.toLowerCase() !== 'necklaces') return false;
        } else if (sub === 'earrings') {
          if (p.subcategory.toLowerCase() !== 'earrings') return false;
        } else if (sub === 'pendant') {
          if (p.subcategory.toLowerCase() !== 'necklaces') return false;
        } else if (sub === 'rings') {
          if (p.subcategory.toLowerCase() !== 'rings') return false;
        } else {
          if (p.subcategory.toLowerCase() !== sub) return false;
        }
      } else if (activeCategory.startsWith('gender_')) {
        const genderKey = activeCategory.substring(7); // 'female', 'male', 'unisex', 'kids_teens'
        if (genderKey === 'female' && p.gender !== 'Female') return false;
        if (genderKey === 'male' && p.gender !== 'Male' && p.gender !== 'Unisex') return false;
        if (genderKey === 'unisex' && p.gender !== 'Unisex') return false;
        if (genderKey === 'kids_teens' && p.gender !== 'Kids & Teens' && p.gender !== 'Unisex') return false;
      } else if (activeCategory.startsWith('occasion_')) {
        const occKey = activeCategory.substring(9); // 'casual', 'party', 'traditional'
        if (occKey === 'casual' && p.occasion !== 'Casual Wear') return false;
        if (occKey === 'party' && p.occasion !== 'Party Wear') return false;
        if (occKey === 'traditional' && p.occasion !== 'Traditional Wear') return false;
      } else if (p.category !== activeCategory) {
        return false;
      }
    }

    // 2. Tab Filter (Featured vs Just Arrived)
    if (activeSectionTab === 'featured') {
      return p.isFeatured;
    } else {
      return p.isNewArrived;
    }
  });

  const isProductInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const handleWishlistClick = (product: Product) => {
    if (isProductInWishlist(product.id)) {
      onRemoveFromWishlist(product.id);
    } else {
      onAddToWishlist(product);
    }
  };

  return (
    <section id="product-sections-container" className="py-14 bg-gray-50 border-t border-gold-200/40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Tab Controls: Featured Products vs Just Arrived */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 pb-5 mb-8 gap-4">
          <div className="flex gap-4">
            <button
              id="tab-featured-products"
              onClick={() => setActiveSectionTab('featured')}
              className={`font-serif text-xl sm:text-2xl font-bold pb-2 relative transition-all cursor-pointer ${
                activeSectionTab === 'featured'
                  ? 'text-maroon-800'
                  : 'text-gray-400 hover:text-maroon-700'
              }`}
            >
              {t('product.tab_featured')}
              {activeSectionTab === 'featured' && (
                <motion.span 
                  layoutId="activeSectionLine" 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-maroon-700"
                />
              )}
            </button>

            <button
              id="tab-new-arrivals"
              onClick={() => setActiveSectionTab('new')}
              className={`font-serif text-xl sm:text-2xl font-bold pb-2 relative transition-all cursor-pointer ${
                activeSectionTab === 'new'
                  ? 'text-maroon-800'
                  : 'text-gray-400 hover:text-maroon-700'
              }`}
            >
              {t('product.tab_new')}
              {activeSectionTab === 'new' && (
                <motion.span 
                  layoutId="activeSectionLine" 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-maroon-700"
                />
              )}
            </button>
          </div>

          {/* Sub-Filters: Gold, Diamond, etc */}
          <div className="flex flex-wrap gap-2 justify-center">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-maroon-700 text-gold-400 border-maroon-700 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gold-400 hover:text-maroon-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {filteredProducts.map((product) => {
                const inWishlist = isProductInWishlist(product.id);
                const originalPrice = product.price;
                const hasDiscount = !!product.discountPrice;
                const finalPrice = product.discountPrice || product.price;
                
                return (
                  <motion.div
                    layout
                    key={product.id}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200/70 hover:border-gold-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col relative"
                  >
                    
                    {/* Upper Tag / Purity Info */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                      <span className="bg-maroon-700/90 text-gold-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm tracking-wider backdrop-blur-xs flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> {product.purity}
                      </span>
                      {hasDiscount && (
                        <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm tracking-widest text-center">
                          SALE
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => handleWishlistClick(product)}
                      className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-400 hover:text-rose-600 flex items-center justify-center transition-all shadow-md backdrop-blur-xs cursor-pointer"
                      title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'text-rose-600 fill-rose-600' : ''}`} />
                    </button>

                    {/* Image Area with Quick view reveal */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden shrink-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500';
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                      />
                      
                      {/* Hover Overlay featuring Quick View and Quick Add */}
                      <div className="absolute inset-0 bg-maroon-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="w-10 h-10 rounded-full bg-white text-maroon-700 hover:bg-gold-500 hover:text-maroon-950 flex items-center justify-center shadow-lg transition-all scale-90 group-hover:scale-100 duration-300 cursor-pointer"
                          title={t('product.quick_view')}
                        >
                          <Eye className="w-4 h-4 font-bold" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content details */}
                    <div className="p-4 flex-1 flex flex-col text-left">
                      
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating) ? 'text-gold-500 fill-gold-500' : 'text-gray-200'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-gray-400 font-mono font-semibold ml-1">{product.rating}</span>
                      </div>

                      {/* Product Title */}
                      <h3 className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[32px] group-hover:text-maroon-700 transition-colors">
                        {product.title}
                      </h3>

                      {/* Weight and SKU metadata */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-1 border-b border-gray-100 pb-2">
                        <span>{t('product.weight')} <b>{product.weight} gm</b></span>
                        <span className="text-gray-400">SKU: {product.sku.split('-')[2]}</span>
                      </div>



                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-lg mx-auto">
              <p className="text-gray-500 text-sm">No items currently matching your filter selection.</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="mt-4 text-xs font-bold text-maroon-700 underline hover:text-gold-600"
              >
                Clear all filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
