import { Category } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface CategoryListProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categorySlug: string) => void;
}

export default function CategoryList({ categories, activeCategory, onSelectCategory }: CategoryListProps) {
  const { t } = useLanguage();
  
  const handleCategoryClick = (slug: string) => {
    // Map categories appropriately to match product catalog categories: 'gold' | 'diamond' | 'silver' | 'coins'
    let filterCategory = 'all';
    if (slug.includes('gold')) {
      filterCategory = 'gold';
    } else if (slug.includes('diamond')) {
      filterCategory = 'diamond';
    } else if (slug.includes('silver')) {
      filterCategory = 'silver';
    } else if (slug.includes('coin')) {
      filterCategory = 'coins';
    } else if (slug.includes('platinum')) {
      filterCategory = 'silver'; // Map Pt to silver catalog for demonstration
    }

    onSelectCategory(filterCategory);

    // Scroll to products
    const section = document.getElementById('product-sections-container');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getTranslatedCategoryName = (name: string) => {
    if (name.toLowerCase().includes('gold')) return t('cat.gold');
    if (name.toLowerCase().includes('diamond')) return t('cat.diamond');
    if (name.toLowerCase().includes('silver')) return t('cat.silver');
    if (name.toLowerCase().includes('coin')) return t('cat.coins');
    return name;
  };

  return (
    <section id="category-browsing-section" className="py-12 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block">{t('heritage.badge')}</span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-800 tracking-wide relative inline-block">
            {t('cat.title')}
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gold-400"></span>
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {t('cat.desc')}
          </p>
        </div>

        {/* Categories Flex/Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10">
          {categories.map((cat, idx) => {
            const isCatActive = activeCategory === (cat.slug.includes('gold') ? 'gold' : cat.slug.includes('diamond') ? 'diamond' : cat.slug.includes('silver') ? 'silver' : cat.slug.includes('coin') ? 'coins' : '');
            
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className="group flex flex-col items-center text-center focus:outline-none cursor-pointer"
              >
                {/* Circular image holder */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gold-500 scale-95 opacity-0 group-hover:scale-105 group-hover:opacity-15 transition-all duration-300" />
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 p-1 transition-all duration-300 ${
                    isCatActive 
                      ? 'border-gold-500 bg-gold-50 scale-105' 
                      : 'border-maroon-100 bg-white group-hover:border-gold-500 group-hover:scale-102 group-hover:shadow-md'
                  }`}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=300';
                      }}
                      className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Tiny Item Count Badge */}
                  <span className="absolute -top-1 -right-1 bg-maroon-700 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full border border-gold-300 font-bold scale-90 sm:scale-100">
                    {cat.itemCount}
                  </span>
                </div>

                {/* Text Label */}
                <span className="mt-3 text-xs sm:text-sm font-bold text-maroon-800 group-hover:text-gold-600 transition-colors tracking-wide">
                  {getTranslatedCategoryName(cat.name)}
                </span>
                
                <span className="text-[10px] text-gray-400 font-sans mt-0.5">
                  {t('hero.explore_btn')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
