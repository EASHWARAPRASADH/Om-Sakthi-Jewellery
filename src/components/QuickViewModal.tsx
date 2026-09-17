import { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingCart, Star, MessageSquare, Shield, Award, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function QuickViewModal({ product, onClose, onAddToCart }: QuickViewModalProps) {
  const { t } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<string>('Standard');
  const [animateSuccess, setAnimateSuccess] = useState(false);

  if (!product) return null;

  const finalPrice = product.discountPrice || product.price;
  const savingAmount = product.discountPrice ? product.price - product.discountPrice : 0;

  const handleAddToCart = () => {
    onAddToCart(product);
    setAnimateSuccess(true);
    setTimeout(() => {
      setAnimateSuccess(false);
      onClose();
    }, 1200);
  };

  const sizes = product.subcategory === 'Rings' 
    ? ['9 (15.6mm)', '11 (16.2mm)', '13 (16.8mm)', '15 (17.5mm)']
    : product.subcategory === 'Bangles'
    ? ['2.4 (57.1mm)', '2.6 (60.3mm)', '2.8 (63.5mm)']
    : ['Standard Fit'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black cursor-pointer"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-gold-300 z-50 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-gray-500 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image Display */}
          <div className="relative bg-gray-50 aspect-square md:aspect-auto md:h-full min-h-[300px] flex items-center justify-center border-r border-gray-100">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500';
              }}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute bottom-4 left-4">
              <span className="bg-maroon-800 text-gold-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md border border-gold-500/20">
                ★ Hallmarked BIS 916
              </span>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 text-left flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category Breadcrumbs & Rating */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
                  {product.category} &rsaquo; {product.subcategory}
                </span>
                
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                  <span className="text-xs font-mono font-bold text-gray-700">{product.rating}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-serif font-bold text-lg sm:text-xl text-maroon-800 tracking-wide">
                {product.title}
              </h2>



              {/* Product Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-gold-50/50 p-3 rounded-lg border border-gold-200/40">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">{t('product.weight') || 'Net Weight'}</p>
                  <p className="font-mono font-extrabold text-gray-800 mt-0.5">{product.weight} grams</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Metal Purity</p>
                  <p className="font-bold text-maroon-700 mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-500" /> {product.purity}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Product Code</p>
                  <p className="font-mono font-semibold text-gray-800 mt-0.5">{product.sku}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Purity Certificate</p>
                  <p className="font-bold text-emerald-600 mt-0.5">HUID Compliant</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`text-xs px-3 py-1.5 rounded-md border font-semibold transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'border-maroon-700 bg-maroon-50 text-maroon-800'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gold-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="mt-6 space-y-3">


              <a
                href={`https://wa.me/919443362126?text=Hi%20OMS%20Jewels,%20I%20am%20interested%20in%20product%20sku%20${product.sku}%20(${product.title}).%20Please%20provide%20delivery%20timelines.`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-transparent hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" /> {t('wa.offline_btn') || 'Consult via WhatsApp'}
              </a>

              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1 text-gold-600"><Award className="w-3.5 h-3.5" /> 100% Insured</span>
                <span className="flex items-center gap-1 text-gold-600"><Shield className="w-3.5 h-3.5" /> Secure Checkout</span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

