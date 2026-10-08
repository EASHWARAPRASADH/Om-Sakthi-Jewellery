import { useState, useRef, useEffect, FormEvent } from 'react';
import { Product, CartItem } from '../types';
import { PRODUCTS } from '../data/jewelryData';
import { 
  Search, Phone, User, Heart, ShoppingBag, Menu, X, 
  Trash2, ArrowRight, Check, Award, ChevronDown, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  categories: any[];
  cart: CartItem[];
  wishlist: Product[];
  onRemoveFromCart: (productId: string) => void;
  onUpdateCartQuantity: (productId: string, quantity: number) => void;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  onOpenSchemesModal: () => void;
}

interface GoldIconProps {
  type: string;
}

function GoldIcon({ type }: GoldIconProps) {
  switch (type) {
    case 'studs':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
          <circle cx="7" cy="12" r="1" fill="currentColor" />
          <circle cx="17" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
          <circle cx="17" cy="12" r="1" fill="currentColor" />
          <path d="M5 10L7 8L9 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 10L17 8L19 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'hangings':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="6" r="1.5" fill="currentColor" />
          <line x1="7" y1="7.5" x2="7" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="16.5" r="2.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
          
          <circle cx="17" cy="6" r="1.5" fill="currentColor" />
          <line x1="17" y1="7.5" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="17" cy="16.5" r="2.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
        </svg>
      );
    case 'drops':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="6" r="1.5" fill="currentColor" />
          <path d="M7 7.5C7 7.5 5 12.5 5 15.5C5 16.7 6 17.5 7 17.5C8 17.5 9 16.7 9 15.5C9 12.5 7 7.5 7 7.5Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
          
          <circle cx="17" cy="6" r="1.5" fill="currentColor" />
          <path d="M17 7.5C17 7.5 15 12.5 15 15.5C15 16.7 16 17.5 17 17.5C18 17.5 19 16.7 19 15.5C19 12.5 17 7.5 17 7.5Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
    case 'jhumkas':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="5" r="1.5" fill="currentColor" />
          <line x1="7" y1="6.5" x2="7" y2="11.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.5 12C3.5 10 10.5 10 10.5 12C10.5 15 3.5 15 3.5 12Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 16V18M7 16V19M9 16V18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          
          <circle cx="17" cy="5" r="1.5" fill="currentColor" />
          <line x1="17" y1="6.5" x2="17" y2="11.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13.5 12C13.5 10 20.5 10 20.5 12C20.5 15 13.5 15 13.5 12Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M15 16V18M17 16V19M19 16V18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case 'hoops':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="8" cy="12" r="2.8" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M7.5 7L8 5" stroke="currentColor" strokeWidth="1.2" />
          
          <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="16" cy="12" r="2.8" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M15.5 7L16 5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 'engagement_ring':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="13.5" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M12 7.5L10 5H14L12 7.5Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
          <path d="M12 5V2.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case 'casual_ring':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="12" rx="7" ry="3.2" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(-15 12 12)" />
          <ellipse cx="12" cy="12" rx="5" ry="1.8" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(-15 12 12)" />
          <circle cx="9" cy="9.5" r="1" fill="currentColor" />
          <circle cx="15" cy="14.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'bangles':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="9" rx="8" ry="2.8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="12" cy="12" rx="8" ry="2.8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="12" cy="15" rx="8" ry="2.8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'cuff':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 9.5C5 9.5 6.5 5.5 12 5.5C17.5 5.5 19 9.5 19 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M5 14.5C5 14.5 6.5 10.5 12 10.5C17.5 10.5 19 14.5 19 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="5" cy="9.5" r="1.8" fill="currentColor" />
          <circle cx="19" cy="9.5" r="1.8" fill="currentColor" />
          <circle cx="5" cy="14.5" r="1.8" fill="currentColor" />
          <circle cx="19" cy="14.5" r="1.8" fill="currentColor" />
        </svg>
      );
    case 'chain_bracelet':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12C4.5 10 7.5 10 9 12C10.5 14 13.5 14 15 12C16.5 10 19.5 10 21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="4.5" cy="11.5" r="1" fill="currentColor" />
          <circle cx="10.5" cy="13" r="1" fill="currentColor" />
          <circle cx="16.5" cy="11.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'bangle_bracelet':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="10.5" y="2.5" width="3" height="3" rx="0.5" fill="currentColor" />
          <circle cx="12" cy="4" r="0.8" fill="white" />
        </svg>
      );
    case 'short_necklace':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6.5C4 6.5 7 15.5 12 15.5C17 15.5 20 6.5 20 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="17.5" r="1.5" fill="currentColor" />
          <circle cx="9" cy="14.8" r="0.9" fill="currentColor" />
          <circle cx="15" cy="14.8" r="0.9" fill="currentColor" />
        </svg>
      );
    case 'long_necklace':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 5C3.5 5 5.5 18.5 12 18.5C18.5 18.5 20.5 5 20.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M6.5 6.5C6.5 6.5 8.5 15.5 12 15.5C15.5 15.5 17.5 6.5 17.5 6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M12 18.5V21.5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="22.5" r="2.2" fill="currentColor" stroke="currentColor" strokeWidth="0.4" />
        </svg>
      );
    case 'female':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8.5" r="3.8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="12.3" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'male':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9.5" cy="14.5" r="3.8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="12" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13.2" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="10.8" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'unisex':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12C8 9.5 9.8 7.5 12 7.5C14.2 7.5 16 9.5 16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M8 12C8 14.5 9.8 16.5 12 16.5C14.2 16.5 16 14.5 16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <line x1="12" y1="16.5" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
          <line x1="9.5" y1="18.8" x2="14.5" y2="18.8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'kids':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 7.5C7.3 7.5 6 8.8 6 10.5C6 14 9.5 16.5 12 17.5C14.5 16.5 18 14 18 10.5C18 8.8 16.7 7.5 15 7.5C13.1 7.5 12.3 9.4 12 9.4C11.7 9.4 10.9 7.5 9 7.5Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="10.5" r="0.8" fill="currentColor" />
          <circle cx="15" cy="10.5" r="0.8" fill="currentColor" />
        </svg>
      );
    case 'casual':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    case 'party':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="13.5" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M12 7.5L10.5 5.2L12 3L13.5 5.2L12 7.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
          <circle cx="7.5" cy="7.5" r="0.8" fill="currentColor" />
          <circle cx="16.5" cy="7.5" r="0.8" fill="currentColor" />
          <circle cx="12" cy="10.5" r="0.8" fill="currentColor" />
        </svg>
      );
    case 'traditional':
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L9 6H15L12 3Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
          <path d="M12 6V18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
          <circle cx="12" cy="18" r="0.8" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M12 8.5V15.5M8.5 12H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function Header({
  categories = [],
  cart,
  wishlist,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
  activeCategory,
  setActiveCategory,
  onOpenSchemesModal
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  // Build dynamic menu sections from DB categories
  const dynamicMegaMenuSections = [
    {
      title: language === 'ta' ? 'அனைத்து நகைகள்' : language === 'hi' ? 'सभी आभूषण' : language === 'te' ? 'అన్ని ఆభరణాలు' : 'All Jewellery',
      items: categories
        .filter(c => c.section_group === 'jewellery' && !c.parent_id && (c.navbar_tab || 'all') === 'all')
        .map(c => ({
          name: c[`name_${language}`] || c.name_en,
          id: c.slug,
          image: c.image || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=64'
        }))
    },
    {
      title: language === 'ta' ? 'பாலினம்' : language === 'hi' ? 'लिंग' : language === 'te' ? 'లింగము' : 'Gender',
      items: categories
        .filter(c => c.section_group === 'gender' && (c.navbar_tab || 'all') === 'all')
        .map(c => ({
          name: c[`name_${language}`] || c.name_en,
          id: c.slug,
          image: c.image || 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=64'
        }))
    },
    {
      title: language === 'ta' ? 'நிகழ்வுகள்' : language === 'hi' ? 'अवसर' : language === 'te' ? 'సందర్భాలు' : 'Occasion',
      items: categories
        .filter(c => c.section_group === 'occasion' && (c.navbar_tab || 'all') === 'all')
        .map(c => ({
          name: c[`name_${language}`] || c.name_en,
          id: c.slug,
          image: c.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=64'
        }))
    }
  ];

  const getMetalMegaMenu = (metalSlug: string) => {
    // Get all parent categories (no parent_id) that are linked to this navbar tab, sorted by order
    const parentCats = categories
      .filter(c => !c.parent_id && (c.navbar_tab || 'all') === metalSlug)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
    return parentCats.map(c => ({
      title: c[`name_${language}`] || c.name_en,
      id: `${metalSlug}-${c.slug}`,
      items: categories
        .filter(sub => sub.parent_id === c.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(sub => ({
          name: sub[`name_${language}`] || sub.name_en,
          id: `${metalSlug}-${sub.slug}`,
          icon: sub.icon || 'studs'
        }))
    }));
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<'all' | 'gold' | 'diamond' | 'silver' | 'platinum' | 'coins' | 'gift' | null>(null);
  
  // Login form states
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter products based on search query
  const filteredSuggestions = PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.purity.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartPrice = cart.reduce((total, item) => {
    const price = item.product.discountPrice || item.product.price;
    return total + price * item.quantity;
  }, 0);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email && !phoneNum) {
      setLoginError('Please enter email or phone number');
      return;
    }
    setIsLoggedIn(true);
    setIsLoginOpen(false);
    setLoginError('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPhoneNum('');
  };

  const menuItems = [
    { name: 'All Jewellery', id: 'all', action: () => { setActiveCategory('all'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Gold', id: 'gold', action: () => { setActiveCategory('gold'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Diamond', id: 'diamond', action: () => { setActiveCategory('diamond'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Silver', id: 'silver', action: () => { setActiveCategory('silver'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Platinum', id: 'platinum', action: () => { setActiveCategory('platinum'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Coins & Bars', id: 'coins', action: () => { setActiveCategory('coins'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Gift Store', id: 'gift', action: () => { setActiveCategory('gift'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Collections', id: 'collections', action: () => { setActiveCategory('collections'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Offers', id: 'offers', action: () => { setActiveCategory('offers'); document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' }); } },
    { name: 'Video', id: 'video', action: () => {
      setActiveCategory('video');
      const elem = document.getElementById('video-showcase-section');
      if (elem) {
        const headerOffset = 110;
        const elementPosition = elem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      } else {
        document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
      }
    } },
  ];

  return (
    <>
      <header id="main-navigation-header" className="sticky top-0 z-40 bg-white shadow-md border-b border-gold-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Mobile Menu Icon */}
            <button
              id="btn-mobile-menu"
              className="md:hidden text-maroon-700 hover:text-gold-600 transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo - Styled Elegantly with Serif and gold trim */}
            <div className="flex-shrink-0 cursor-pointer flex items-center gap-3" onClick={() => setActiveCategory('all')}>
              <img
                src="/assets/Logo_with_bg.jpeg"
                alt="Om Sakthi Jewellery Logo"
                className="w-16 h-16 object-contain bg-white p-0.5 border-2 border-gold-400 shadow-lg shrink-0 rounded-lg"
              />
              <div className="flex flex-col justify-center">
                <span className="font-cinzel font-black text-base sm:text-lg md:text-xl lg:text-2xl leading-tight text-maroon-900 tracking-wider drop-shadow-xs">
                  OM SAKTHI JEWELLERY
                </span>
                <span className="font-cinzel text-[9px] sm:text-[10px] md:text-[11px] text-gold-600 font-extrabold tracking-widest uppercase mt-0.5">
                  ESTD. 1985 • ARIYALUR
                </span>
              </div>
            </div>

            {/* Wide Search Bar with Auto Suggestions */}
            <div className="hidden md:block flex-1 max-w-lg relative" ref={suggestionsRef}>
              <div className="relative">
                <input
                  id="header-search-input"
                  type="text"
                  placeholder={t('header.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-full border border-maroon-100 focus:border-gold-500 focus:outline-none text-sm transition-all shadow-inner focus:ring-1 focus:ring-gold-400"
                />
                <div className="absolute right-3.5 top-3 text-maroon-500">
                  <Search className="w-4 h-4" />
                </div>
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-2 bg-white border border-gold-200 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="bg-maroon-50 px-4 py-2 text-[11px] font-semibold text-maroon-800 uppercase tracking-wider border-b border-gold-100 flex justify-between items-center">
                      <span>Matching Jewelry</span>
                      <span className="text-gold-600 font-normal">Found {filteredSuggestions.length} products</span>
                    </div>
                    {filteredSuggestions.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {filteredSuggestions.map((product) => (
                          <div
                            key={product.id}
                            className="p-3 hover:bg-gold-50 flex items-center gap-3 cursor-pointer transition-colors"
                            onClick={() => {
                              onSelectProduct(product);
                              setShowSuggestions(false);
                              setSearchQuery('');
                            }}
                          >
                            <img
                              src={product.image}
                              alt={product.title}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded border border-gold-100"
                            />
                            <div className="flex-1 text-left">
                              <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{product.title}</h4>
                              <p className="text-[10px] text-gray-500 font-mono">{product.purity} • {product.weight}g</p>
                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500">
                        No products found matching &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Header Navigation Icons */}
            <div className="flex items-center gap-x-4 lg:gap-x-6 text-maroon-700">
              
              {/* Contact Call Line */}
              <a href="tel:+919443362126" className="hidden lg:flex items-center gap-2 text-left hover:text-gold-600 transition-colors">
                <div className="w-9 h-9 rounded-full bg-maroon-50 border border-maroon-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-maroon-700" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-semibold leading-none">{t('top.help')}</p>
                  <p className="text-xs font-bold font-mono mt-0.5 text-maroon-800">+91-9443362126</p>
                </div>
              </a>

              {/* Login Action */}
              <div className="relative">
                {isLoggedIn ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-maroon-800 bg-gold-100/60 px-2.5 py-1.5 rounded-full border border-gold-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="max-w-[70px] truncate">Eash</span>
                    <button onClick={handleLogout} className="text-[10px] text-maroon-700 hover:text-rose-600 underline ml-1 cursor-pointer font-bold">
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    id="btn-login"
                    onClick={() => setIsLoginOpen(true)}
                    className="flex items-center gap-1 hover:text-gold-600 transition-colors text-sm font-semibold cursor-pointer"
                  >
                    <User className="w-5 h-5 text-maroon-700" />
                    <span className="hidden sm:inline">{t('header.my_account')}</span>
                  </button>
                )}
              </div>

              {/* Wishlist Button with badge */}
              <button
                id="btn-wishlist-toggle"
                onClick={() => setIsWishlistOpen(true)}
                className="relative hover:text-gold-600 transition-colors cursor-pointer"
              >
                <Heart className="w-5 h-5 text-maroon-700" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold-500 text-maroon-950 text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white">
                    {wishlist.length}
                  </span>
                )}
              </button>


            </div>
          </div>
        </div>

        {/* Mega Menu / Horizontal Navigation List */}
        <nav
          className="hidden md:block bg-[#FAF1F1] border-t border-b border-rose-100 shadow-xs relative"
          onMouseLeave={() => setHoveredMenu(null)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-1 lg:space-x-8 h-11 text-[11px] relative">
              {menuItems.map((item, index) => {
                const isSelected = activeCategory === item.id || 
                  (item.id === 'all' && (activeCategory.startsWith('sub_') || activeCategory.startsWith('gender_') || activeCategory.startsWith('occasion_'))) ||
                  (item.id === 'gold' && activeCategory.startsWith('gold_')) ||
                  (item.id === 'diamond' && activeCategory.startsWith('diamond_')) ||
                  (item.id === 'silver' && activeCategory.startsWith('silver_')) ||
                  (item.id === 'platinum' && activeCategory.startsWith('platinum_')) ||
                  (item.id === 'coins' && activeCategory.startsWith('coins_')) ||
                  (item.id === 'gift' && activeCategory.startsWith('gift_'));
                
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    onMouseEnter={() => {
                      if (item.id === 'all' || item.id === 'gold' || item.id === 'diamond' || item.id === 'silver' || item.id === 'platinum' || item.id === 'coins' || item.id === 'gift') {
                        setHoveredMenu(item.id as any);
                      } else {
                        setHoveredMenu(null);
                      }
                    }}
                    className={`h-full px-4 font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center relative text-[11px] ${
                      isSelected
                        ? 'text-maroon-800'
                        : 'text-maroon-700/80 hover:text-gold-600'
                    }`}
                  >
                    {item.name}
                    {isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.75 bg-maroon-700 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mega Menu Dropdowns */}
          <AnimatePresence>
            {hoveredMenu === 'all' && (
              <motion.div
                id="header-mega-menu-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredMenu('all')}
                onMouseLeave={() => setHoveredMenu(null)}
                className="absolute left-0 right-0 bg-white border-b border-rose-100/80 shadow-2xl z-50 overflow-hidden top-full"
              >
                <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                  {dynamicMegaMenuSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-6">
                      <h3 className="font-serif text-sm font-bold text-maroon-800 tracking-wider border-b border-rose-100 pb-2 uppercase">
                        {section.title}
                      </h3>
                      <div className="grid grid-cols-1 gap-y-3.5">
                        {section.items.map((item, itemIdx) => (
                          <button
                            key={itemIdx}
                            onClick={() => {
                              setActiveCategory(item.id);
                              setHoveredMenu(null);
                              document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex items-center gap-3.5 group text-left cursor-pointer transition-all duration-200 hover:translate-x-1.5"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-100/50 shadow-xs shrink-0 transition-transform group-hover:scale-105 group-hover:border-gold-400">
                              <img
                                src={item.image}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 transition-colors group-hover:text-maroon-700">
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {hoveredMenu === 'gold' && (
              <motion.div
                id="header-gold-mega-menu-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredMenu('gold')}
                onMouseLeave={() => setHoveredMenu(null)}
                className="absolute left-0 right-0 bg-white border-b border-rose-100/80 shadow-2xl z-50 overflow-hidden top-full"
              >
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-left">
                  {getMetalMegaMenu('gold').map((section, secIdx) => {
                    const hasItems = section.items && section.items.length > 0;
                    return (
                      <div key={secIdx} className="space-y-4">
                        {/* Heading */}
                        {hasItems ? (
                          <h3 className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 border-b border-rose-100 uppercase">
                            {section.title}
                          </h3>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveCategory(section.id);
                              setHoveredMenu(null);
                              document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 hover:text-gold-600 transition-colors uppercase border-b border-rose-100 w-full text-left cursor-pointer"
                          >
                            {section.title}
                          </button>
                        )}

                        {/* Sub-items */}
                        {hasItems && (
                          <div className="grid grid-cols-1 gap-y-3">
                            {section.items.map((item, itemIdx) => (
                              <button
                                key={itemIdx}
                                onClick={() => {
                                  setActiveCategory(item.id);
                                  setHoveredMenu(null);
                                  document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex items-center gap-3 group text-left cursor-pointer transition-all duration-200 hover:translate-x-1.5"
                              >
                                <div className="w-8 h-8 rounded-full bg-rose-50/50 flex items-center justify-center border border-rose-100/50 shadow-xs shrink-0 transition-transform group-hover:scale-105 group-hover:border-gold-400 group-hover:bg-gold-50/40">
                                  <GoldIcon type={item.icon} />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 transition-colors group-hover:text-maroon-700">
                                  {item.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {hoveredMenu === 'diamond' && (
              <motion.div
                id="header-diamond-mega-menu-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredMenu('diamond')}
                onMouseLeave={() => setHoveredMenu(null)}
                className="absolute left-0 right-0 bg-white border-b border-rose-100/80 shadow-2xl z-50 overflow-hidden top-full"
              >
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-left">
                  {getMetalMegaMenu('diamond').map((section, secIdx) => {
                    const hasItems = section.items && section.items.length > 0;
                    return (
                      <div key={secIdx} className="space-y-4">
                        {/* Heading */}
                        {hasItems ? (
                          <h3 className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 border-b border-rose-100 uppercase">
                            {section.title}
                          </h3>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveCategory(section.id);
                              setHoveredMenu(null);
                              document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 hover:text-gold-600 transition-colors uppercase border-b border-rose-100 w-full text-left cursor-pointer"
                          >
                            {section.title}
                          </button>
                        )}

                        {/* Sub-items */}
                        {hasItems && (
                          <div className="grid grid-cols-1 gap-y-3">
                            {section.items.map((item, itemIdx) => (
                              <button
                                key={itemIdx}
                                onClick={() => {
                                  setActiveCategory(item.id);
                                  setHoveredMenu(null);
                                  document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex items-center gap-3 group text-left cursor-pointer transition-all duration-200 hover:translate-x-1.5"
                              >
                                {item.icon && item.icon !== 'text_only' && (
                                  <div className="w-8 h-8 rounded-full bg-rose-50/50 flex items-center justify-center border border-rose-100/50 shadow-xs shrink-0 transition-transform group-hover:scale-105 group-hover:border-gold-400 group-hover:bg-gold-50/40">
                                    <GoldIcon type={item.icon} />
                                  </div>
                                )}
                                <span className={`text-xs font-semibold text-gray-700 transition-colors group-hover:text-maroon-700 ${item.icon && item.icon !== 'text_only' ? '' : 'pl-1'}`}>
                                  {item.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {hoveredMenu === 'silver' && (
              <motion.div
                id="header-silver-mega-menu-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredMenu('silver')}
                onMouseLeave={() => setHoveredMenu(null)}
                className="absolute left-0 right-0 bg-white border-b border-rose-100/80 shadow-2xl z-50 overflow-hidden top-full"
              >
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-5 gap-10 text-left">
                  <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {getMetalMegaMenu('silver').map((section, secIdx) => {
                      const hasItems = section.items && section.items.length > 0;
                      return (
                        <div key={secIdx} className="space-y-4">
                          {/* Heading */}
                          {hasItems ? (
                            <h3 className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 border-b border-rose-100 uppercase">
                              {section.title}
                            </h3>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveCategory(section.id);
                                setHoveredMenu(null);
                                document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 hover:text-gold-600 transition-colors uppercase border-b border-rose-100 w-full text-left cursor-pointer"
                            >
                              {section.title}
                            </button>
                          )}

                          {/* Sub-items */}
                          {hasItems && (
                            <div className="grid grid-cols-1 gap-y-3">
                              {section.items.map((item, itemIdx) => (
                                <button
                                  key={itemIdx}
                                  onClick={() => {
                                    setActiveCategory(item.id);
                                    setHoveredMenu(null);
                                    document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="flex items-center gap-3 group text-left cursor-pointer transition-all duration-200 hover:translate-x-1.5"
                                >
                                  {item.icon && item.icon !== 'text_only' && (
                                    <div className="w-8 h-8 rounded-full bg-rose-50/50 flex items-center justify-center border border-rose-100/50 shadow-xs shrink-0 transition-transform group-hover:scale-105 group-hover:border-gold-400 group-hover:bg-gold-50/40">
                                      <GoldIcon type={item.icon} />
                                    </div>
                                  )}
                                  <span className={`text-xs font-semibold text-gray-700 transition-colors group-hover:text-maroon-700 ${item.icon && item.icon !== 'text_only' ? '' : 'pl-1'}`}>
                                    {item.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Silver Banners on Right */}
                  <div className="md:col-span-1 flex flex-col gap-4 self-center justify-center h-full">
                    {/* Banner 1: New Arrivals */}
                    <div 
                      onClick={() => {
                        setActiveCategory('silver');
                        setHoveredMenu(null);
                        document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group relative h-32 rounded-xl overflow-hidden border border-rose-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=300" 
                        alt="Silver New Arrivals" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/80 via-maroon-950/40 to-transparent flex flex-col justify-end p-3.5 text-left">
                        <p className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-gold-400 leading-none">New Arrivals</p>
                        <h4 className="font-serif text-sm font-bold text-white mt-1 leading-tight">Grace in every detail</h4>
                      </div>
                    </div>

                    {/* Banner 2: Divine Articles */}
                    <div 
                      onClick={() => {
                        setActiveCategory('silver_articles');
                        setHoveredMenu(null);
                        document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group relative h-32 rounded-xl overflow-hidden border border-rose-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=300" 
                        alt="Divine Articles" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3.5 text-left">
                        <p className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-gold-400 leading-none">Divine Articles</p>
                        <h4 className="font-serif text-sm font-bold text-white mt-1 leading-tight">For You</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {hoveredMenu === 'platinum' && (
              <motion.div
                id="header-platinum-mega-menu-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredMenu('platinum')}
                onMouseLeave={() => setHoveredMenu(null)}
                className="absolute left-0 right-0 bg-white border-b border-rose-100/80 shadow-2xl z-50 overflow-hidden top-full"
              >
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-left">
                  {getMetalMegaMenu('platinum').map((section, secIdx) => {
                    const hasItems = section.items && section.items.length > 0;
                    return (
                      <div key={secIdx} className="space-y-4">
                        {/* Heading */}
                        {hasItems ? (
                          <h3 className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 border-b border-rose-100 uppercase">
                            {section.title}
                          </h3>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveCategory(section.id);
                              setHoveredMenu(null);
                              document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 hover:text-gold-600 transition-colors uppercase border-b border-rose-100 w-full text-left cursor-pointer"
                          >
                            {section.title}
                          </button>
                        )}

                        {/* Sub-items */}
                        {hasItems && (
                          <div className="grid grid-cols-1 gap-y-3">
                            {section.items.map((item, itemIdx) => (
                              <button
                                key={itemIdx}
                                onClick={() => {
                                  setActiveCategory(item.id);
                                  setHoveredMenu(null);
                                  document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex items-center gap-3 group text-left cursor-pointer transition-all duration-200 hover:translate-x-1.5"
                              >
                                {item.icon && item.icon !== 'text_only' && (
                                  <div className="w-8 h-8 rounded-full bg-rose-50/50 flex items-center justify-center border border-rose-100/50 shadow-xs shrink-0 transition-transform group-hover:scale-105 group-hover:border-gold-400 group-hover:bg-gold-50/40">
                                    <GoldIcon type={item.icon} />
                                  </div>
                                )}
                                <span className={`text-xs font-semibold text-gray-700 transition-colors group-hover:text-maroon-700 ${item.icon && item.icon !== 'text_only' ? '' : 'pl-1'}`}>
                                  {item.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {hoveredMenu === 'coins' && (
              <motion.div
                id="header-coins-mega-menu-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredMenu('coins')}
                onMouseLeave={() => setHoveredMenu(null)}
                className="absolute left-0 right-0 bg-white border-b border-rose-100/80 shadow-2xl z-50 overflow-hidden top-full"
              >
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
                  <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
                    {getMetalMegaMenu('coins').map((section, secIdx) => {
                      const hasItems = section.items && section.items.length > 0;
                      return (
                        <div key={secIdx} className="space-y-4">
                          {/* Heading */}
                          {hasItems ? (
                            <h3 className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 border-b border-rose-100 uppercase">
                              {section.title}
                            </h3>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveCategory(section.id);
                                setHoveredMenu(null);
                                document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 hover:text-gold-600 transition-colors uppercase border-b border-rose-100 w-full text-left cursor-pointer"
                            >
                              {section.title}
                            </button>
                          )}

                          {/* Sub-items */}
                          {hasItems && (
                            <div className="grid grid-cols-1 gap-y-3">
                              {section.items.map((item, itemIdx) => (
                                <button
                                  key={itemIdx}
                                  onClick={() => {
                                    setActiveCategory(item.id);
                                    setHoveredMenu(null);
                                    document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="flex items-center gap-3 group text-left cursor-pointer transition-all duration-200 hover:translate-x-1.5"
                                >
                                  <span className="text-xs font-semibold text-gray-700 transition-colors group-hover:text-maroon-700 pl-1">
                                    {item.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Coins Investment Banner */}
                  <div className="md:col-span-1 flex flex-col gap-4 self-center justify-center h-full">
                    <div 
                      onClick={() => {
                        setActiveCategory('coins');
                        setHoveredMenu(null);
                        document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group relative h-40 rounded-xl overflow-hidden border border-rose-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=300" 
                        alt="Pure Gold Coins" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/90 via-maroon-950/40 to-transparent flex flex-col justify-end p-4 text-left">
                        <p className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-gold-400 leading-none">Assured Purity</p>
                        <h4 className="font-serif text-sm font-bold text-white mt-1 leading-tight">999 Pure Gold & Silver</h4>
                        <p className="text-[9px] text-gray-300 mt-1">Zero Deductions & Lifetime Buyback</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {hoveredMenu === 'gift' && (
              <motion.div
                id="header-gift-mega-menu-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredMenu('gift')}
                onMouseLeave={() => setHoveredMenu(null)}
                className="absolute left-0 right-0 bg-white border-b border-rose-100/80 shadow-2xl z-50 overflow-hidden top-full"
              >
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-left">
                  {getMetalMegaMenu('gift').map((section, secIdx) => {
                    const hasItems = section.items && section.items.length > 0;
                    return (
                      <div key={secIdx} className="space-y-4">
                        {/* Heading */}
                        {hasItems ? (
                          <h3 className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 border-b border-rose-100 uppercase">
                            {section.title}
                          </h3>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveCategory(section.id);
                              setHoveredMenu(null);
                              document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="font-serif text-sm font-extrabold text-maroon-800 tracking-wider pb-1 hover:text-gold-600 transition-colors uppercase border-b border-rose-100 w-full text-left cursor-pointer"
                          >
                            {section.title}
                          </button>
                        )}

                        {/* Sub-items */}
                        {hasItems && (
                          <div className="grid grid-cols-1 gap-y-3">
                            {section.items.map((item, itemIdx) => (
                              <button
                                key={itemIdx}
                                onClick={() => {
                                  setActiveCategory(item.id);
                                  setHoveredMenu(null);
                                  document.getElementById('product-sections-container')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex items-center gap-3 group text-left cursor-pointer transition-all duration-200 hover:translate-x-1.5"
                              >
                                <span className="text-xs font-semibold text-gray-700 transition-colors group-hover:text-maroon-700 pl-1">
                                  {item.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Cart Drawer Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 bg-maroon-700 text-white border-b border-gold-500 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold-400" />
                  <span className="font-serif text-lg font-bold">Your Jewelry Box ({cartItemsCount})</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-maroon-800 rounded cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length > 0 ? (
                  cart.map((item) => {
                    const price = item.product.discountPrice || item.product.price;
                    return (
                      <div key={item.product.id} className="flex gap-4 p-3 bg-gold-50/50 rounded-lg border border-gold-100">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 object-cover rounded border border-gold-200"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-gray-800">{item.product.title}</h4>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {item.product.purity} • {item.product.weight}g
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                              <button
                                onClick={() => onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-3 py-0.5 text-xs font-mono font-bold text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-xs font-bold text-maroon-700 font-mono">
                                ₹{(price * item.quantity).toLocaleString('en-IN')}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-[10px] text-gray-400 font-mono">
                                  (₹{price.toLocaleString('en-IN')} each)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveFromCart(item.product.id)}
                          className="p-1 hover:text-rose-600 text-gray-400 self-start transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center text-gold-500 border border-gold-100">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-gray-800">Jewelry Box is Empty</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto">
                        Explore our wedding bands, elegant necklaces, and premium gold coins to fill your box.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-2 bg-maroon-700 hover:bg-maroon-800 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors cursor-pointer shadow-md"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer Price Summary */}
              {cart.length > 0 && (
                <div className="p-4 bg-gold-50 border-t border-gold-200">
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Subtotal Weight:</span>
                      <span className="font-mono font-medium">
                        {cart.reduce((total, item) => total + item.product.weight * item.quantity, 0).toFixed(2)} grams
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Making Charges & GST:</span>
                      <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px]">Included / Free Promotional</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-800 pt-1.5 border-t border-gold-200/50">
                      <span className="font-serif">Total Est. Price:</span>
                      <span className="font-mono text-maroon-700 text-base">₹{totalCartPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Thank you for choosing OMS Jewels! Connecting to our secure checkout gateway for an estimated amount of ₹${totalCartPrice.toLocaleString('en-IN')}. Since this is a high-end showcase, we have initiated our VIP Sales Officer booking for order ID: OMS-TX-2026-${Math.floor(Math.random() * 90000 + 10000)}.`);
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg border border-gold-600/30 text-xs tracking-wider uppercase"
                  >
                    Proceed to Secure Checkout <ArrowRight className="w-4 h-4 text-gold-400" />
                  </button>
                  <p className="text-[10px] text-gray-500 text-center mt-2.5 flex items-center justify-center gap-1">
                    <Award className="w-3.5 h-3.5 text-gold-500" /> 100% Insured Shipping & Bureau of Indian Standards (BIS) Hallmarked Gold.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wishlist Drawer Panel */}
      <AnimatePresence>
        {isWishlistOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 bg-maroon-700 text-white border-b border-gold-500 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                  <span className="font-serif text-lg font-bold">Your Wishlist ({wishlist.length})</span>
                </div>
                <button onClick={() => setIsWishlistOpen(false)} className="p-1 hover:bg-maroon-800 rounded cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wishlist Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {wishlist.length > 0 ? (
                  wishlist.map((product) => {
                    const price = product.discountPrice || product.price;
                    return (
                      <div key={product.id} className="flex gap-4 p-3 bg-rose-50/25 rounded-lg border border-rose-100">
                        <img
                          src={product.image}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-gray-800">{product.title}</h4>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {product.purity} • {product.weight}g
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 justify-between items-end">
                          <button
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              onAddToCart(product);
                              onRemoveFromWishlist(product.id);
                            }}
                            className="text-[10px] bg-maroon-700 hover:bg-maroon-800 text-white px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            Move to Box
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 border border-rose-100">
                      <Heart className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-gray-800">Wishlist is Empty</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto">
                        Save jewelry products you love here. Check back anytime to review or add them to your box.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login / Register Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl border border-gold-300 z-50 relative p-6 sm:p-8"
            >
              <button
                onClick={() => setIsLoginOpen(false)}
                className="absolute right-4 top-4 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-maroon-700 flex items-center justify-center border border-gold-400 shadow-inner mx-auto mb-2.5">
                  <span className="font-serif font-bold text-lg text-gold-400">OMS</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-maroon-800">Welcome to Om Sakthi Jewellery</h3>
                <p className="text-xs text-gray-500 mt-1">Sign in to track your savings schemes, purchase histories, and exclusive club points.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 font-medium text-center">
                    {loginError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. customer@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-gold-500 focus:outline-none text-sm font-mono"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-400 font-medium">OR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Phone Number (OTP login)
                  </label>
                  <div className="flex gap-2">
                    <span className="bg-gray-100 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg flex items-center font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      pattern="[0-9]{10}"
                      placeholder="Enter 10-digit number"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-gold-500 focus:outline-none text-sm font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-bold py-3 px-4 rounded-lg transition-colors cursor-pointer text-xs tracking-wider uppercase shadow-md border border-gold-600/20"
                >
                  Request OTP / Log In
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <p className="text-[11px] text-gray-500">
                  New to Om Sakthi Jewellery?{' '}
                  <button onClick={() => alert('New membership registration process loaded. Please enter details for quick sign-up!')} className="text-maroon-700 font-bold hover:underline cursor-pointer">
                    Create luxury account
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Mobile Menu Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-xs bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 bg-maroon-800 text-white border-b border-gold-500 flex justify-between items-center">
                <span className="font-serif text-lg font-bold text-gold-400">Om Sakthi Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-maroon-700 rounded cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Jewelry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-lg border border-gray-300 text-xs"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto p-2">
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.action();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:text-maroon-700 hover:bg-gold-50/50 rounded-lg transition-colors border-b border-gray-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>{item.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                ))}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center space-y-2">
                <p className="text-[10px] text-gray-500">Support Line: +91-9443362126</p>
                <p className="text-[9px] text-gold-600 font-bold uppercase tracking-wider">★ Hallmarked BIS 916 Pure Trust ★</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
