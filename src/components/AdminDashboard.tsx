import React, { useState, useEffect } from 'react';
import { 
  KeyRound, Package, FolderTree, Settings, RefreshCw, Plus, 
  Trash2, Edit, Upload, Eye, Check, X, ShieldAlert, Sparkles 
} from 'lucide-react';

interface Category {
  id: number;
  parent_id: number | null;
  slug: string;
  name_en: string;
  name_ta: string;
  name_hi: string;
  name_te: string;
  icon: string;
  section_group: string;
  sort_order: number;
  navbar_tab?: string;
}

interface Product {
  id: number;
  category_id: number;
  title_en: string;
  title_ta: string;
  title_hi: string;
  title_te: string;
  description_en: string;
  description_ta: string;
  description_hi: string;
  description_te: string;
  weight: number;
  making_charges: number;
  waste_charges: number;
  image_url: string;
  is_featured: number;
  is_new_arrival: number;
  metal_type: string;
  purity: string;
  sku: string;
  gender: string;
  occasion: string;
  price_formula: string | null;
}

interface Banner {
  id: number;
  title_en: string;
  title_ta: string;
  title_hi: string;
  title_te: string;
  subtitle_en: string;
  subtitle_ta: string;
  subtitle_hi: string;
  subtitle_te: string;
  media_type: string;
  image_url: string;
  video_url: string;
  link_url: string;
  sort_order: number;
}

interface Rate {
  metal: string;
  name: string;
  rate: number;
  change_val: string;
  is_up: number;
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('oms_admin_token'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'rates' | 'banners' | 'settings'>('products');
  
  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  // loading
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Forms editing states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Fetch all current database records
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api-database.php?action=load_all');
      const json = await res.json();
      if (json.success) {
        setCategories(json.categories || []);
        setProducts(json.products || []);
        setBanners(json.banners || []);
        setRates(json.rates || []);
        setSettings(json.settings || {});
      }
    } catch (err) {
      console.error("Load API failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api-database.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('oms_admin_token', data.token);
        setToken(data.token);
        loadData();
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Server connection error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('oms_admin_token');
    setToken(null);
  };

  const authenticatedFetch = async (action: string, body: any) => {
    if (!token) return { success: false, message: 'Unauthenticated' };
    const res = await fetch(`/api-database.php?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  };

  // Image Upload handler
  const handleImageUpload = async (file: File, type: 'product' | 'category' | 'banner') => {
    if (!file || !token) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api-database.php?action=upload_file', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        if (type === 'product' && editingProduct) {
          setEditingProduct({ ...editingProduct, image_url: json.url });
        } else if (type === 'category' && editingCategory) {
          // not used yet
        } else if (type === 'banner' && editingBanner) {
          if (file.type.startsWith('video/')) {
            setEditingBanner({ ...editingBanner, video_url: json.url, media_type: 'video' });
          } else {
            setEditingBanner({ ...editingBanner, image_url: json.url, media_type: 'image' });
          }
        }
        showSuccessMessage('File uploaded successfully!');
      } else {
        alert(json.message || 'File upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    }
  };

  const showSuccessMessage = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Products CRUD
  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await authenticatedFetch('save_product', editingProduct);
    if (res.success) {
      setEditingProduct(null);
      loadData();
      showSuccessMessage('Product saved successfully');
    } else {
      alert(res.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await authenticatedFetch('delete_product', { id });
    if (res.success) {
      loadData();
      showSuccessMessage('Product deleted successfully');
    }
  };

  // Categories CRUD
  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const res = await authenticatedFetch('save_category', editingCategory);
    if (res.success) {
      setEditingCategory(null);
      loadData();
      showSuccessMessage('Category saved successfully');
    } else {
      alert(res.message || 'Failed to save category');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Warning: Deleting this category will unbind all associated subcategories. Continue?')) return;
    const res = await authenticatedFetch('delete_category', { id });
    if (res.success) {
      loadData();
      showSuccessMessage('Category deleted successfully');
    }
  };

  // Banners CRUD
  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    const res = await authenticatedFetch('save_banner', editingBanner);
    if (res.success) {
      setEditingBanner(null);
      loadData();
      showSuccessMessage('Banner saved successfully');
    } else {
      alert(res.message || 'Failed to save banner');
    }
  };

  const deleteBanner = async (id: number) => {
    if (!confirm('Delete this banner?')) return;
    const res = await authenticatedFetch('delete_banner', { id });
    if (res.success) {
      loadData();
      showSuccessMessage('Banner deleted');
    }
  };

  // Metal Rates Update
  const saveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authenticatedFetch('save_rates', { rates });
    if (res.success) {
      loadData();
      showSuccessMessage('Metal rates updated successfully');
    } else {
      alert(res.message || 'Failed to update rates');
    }
  };

  // Global settings changes
  const saveSettingValue = async (key: string, value: string) => {
    const res = await authenticatedFetch('save_setting', { key, value });
    if (res.success) {
      loadData();
      showSuccessMessage('Settings updated');
    } else {
      alert(res.message || 'Failed to update setting');
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    const res = await authenticatedFetch('save_setting', { key: 'admin_password', value: newPassword });
    if (res.success) {
      setNewPassword('');
      showSuccessMessage('Password changed successfully. Please log in again.');
      handleLogout();
    } else {
      alert(res.message || 'Failed to update password');
    }
  };

  // Login view
  if (!token) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 px-6 lg:px-8 relative text-stone-900 cms-light-theme-login">
        <div className="absolute top-0 right-0 w-96 h-96 bg-maroon-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-950/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400 items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-gold-400" />
          </div>
          <h2 className="font-serif text-3xl font-black text-gold-300 tracking-tight">
            OMS Studio Admin
          </h2>
          <p className="mt-2 text-xs text-stone-400 uppercase tracking-widest">
            Showroom CMS Console Login
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-stone-900 py-8 px-6 shadow-2xl rounded-2xl border border-gold-400/20">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-1.5 w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:border-gold-500 focus:outline-none"
                />
              </div>

              {loginError && (
                <div className="bg-red-950/40 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-xs uppercase tracking-wider shadow-md"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans cms-light-theme">
      
      {/* Top Banner Notice */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-[200] bg-emerald-900 border border-emerald-500 text-emerald-100 text-xs font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-2xl">
          <Check className="w-4 h-4" /> {saveSuccess}
        </div>
      )}

      {/* Header bar */}
      <header className="border-b border-stone-800 bg-stone-900/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gold-400/10 border border-gold-400/40 flex items-center justify-center text-gold-400 font-serif font-black text-sm">
            OMS
          </div>
          <div>
            <h1 className="font-serif text-lg font-black text-gold-300">OM SAKTHI JEWELLERY</h1>
            <span className="text-[9px] uppercase tracking-widest text-stone-400 font-mono block leading-none">CMS Dashboard v1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-gold-400 transition-colors disabled:opacity-50 cursor-pointer"
            title="Reload Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="bg-transparent hover:bg-white/5 border border-stone-800 text-stone-300 text-[10px] font-bold tracking-wider uppercase py-2 px-4 rounded-full transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-stone-800 bg-stone-900/10 p-4 space-y-1">
          <button
            onClick={() => { setActiveTab('products'); setEditingProduct(null); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${activeTab === 'products' ? 'bg-gold-500 text-stone-950' : 'text-stone-400 hover:bg-stone-900/60 hover:text-stone-200'}`}
          >
            <Package className="w-4 h-4" /> Products Catalog
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setEditingCategory(null); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${activeTab === 'categories' ? 'bg-gold-500 text-stone-950' : 'text-stone-400 hover:bg-stone-900/60 hover:text-stone-200'}`}
          >
            <FolderTree className="w-4 h-4" /> Categories (Navbar)
          </button>
          <button
            onClick={() => { setActiveTab('rates'); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${activeTab === 'rates' ? 'bg-gold-500 text-stone-950' : 'text-stone-400 hover:bg-stone-900/60 hover:text-stone-200'}`}
          >
            <Sparkles className="w-4 h-4" /> Metal Rates Board
          </button>
          <button
            onClick={() => { setActiveTab('banners'); setEditingBanner(null); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${activeTab === 'banners' ? 'bg-gold-500 text-stone-950' : 'text-stone-400 hover:bg-stone-900/60 hover:text-stone-200'}`}
          >
            <Eye className="w-4 h-4" /> Hero Video Banners
          </button>
          <button
            onClick={() => { setActiveTab('settings'); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${activeTab === 'settings' ? 'bg-gold-500 text-stone-950' : 'text-stone-400 hover:bg-stone-900/60 hover:text-stone-200'}`}
          >
            <Settings className="w-4 h-4" /> Global Settings
          </button>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: PRODUCTS MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-stone-850 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-black text-gold-300">Products Catalog</h2>
                  <p className="text-xs text-stone-400 mt-1">Manage and edit details of all showcased jewelry products.</p>
                </div>
                <button
                  onClick={() => setEditingProduct({
                    id: 0, category_id: categories[0]?.id || 1,
                    title_en: '', title_ta: '', title_hi: '', title_te: '',
                    description_en: '', description_ta: '', description_hi: '', description_te: '',
                    weight: 0.0, making_charges: 0.0, waste_charges: 0.0,
                    image_url: '', is_featured: 0, is_new_arrival: 0,
                    metal_type: 'gold', purity: '22K Gold', sku: '', gender: 'Unisex', occasion: 'Casual Wear'
                  })}
                  className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {editingProduct ? (
                /* Add / Edit Form */
                <form onSubmit={saveProduct} className="bg-stone-900 border border-gold-400/20 rounded-2xl p-6 space-y-6 max-w-4xl text-left">
                  <h3 className="font-serif text-lg font-bold text-gold-300 flex items-center gap-1.5 border-b border-stone-800 pb-3">
                    {editingProduct.id === 0 ? 'Add New Product' : `Edit Product (ID: ${editingProduct.id})`}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Metal Specs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Metal Type</label>
                        <select
                          value={editingProduct.metal_type}
                          onChange={(e) => setEditingProduct({ ...editingProduct, metal_type: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        >
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                          <option value="platinum">Platinum</option>
                          <option value="diamond">Diamond</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Purity Scale (e.g. 22K Gold, Pt950, 92.5 Silver)</label>
                        <input
                          type="text"
                          value={editingProduct.purity}
                          onChange={(e) => setEditingProduct({ ...editingProduct, purity: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Weight (Gm)</label>
                          <input
                            type="number" step="0.001"
                            value={editingProduct.weight}
                            onChange={(e) => setEditingProduct({ ...editingProduct, weight: parseFloat(e.target.value) })}
                            className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Making (%)</label>
                          <input
                            type="number" step="0.1"
                            value={editingProduct.making_charges}
                            onChange={(e) => setEditingProduct({ ...editingProduct, making_charges: parseFloat(e.target.value) })}
                            className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Wastage (%)</label>
                          <input
                            type="number" step="0.1"
                            value={editingProduct.waste_charges}
                            onChange={(e) => setEditingProduct({ ...editingProduct, waste_charges: parseFloat(e.target.value) })}
                            className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Assigned Category (Navbar)</label>
                        <select
                          value={editingProduct.category_id}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category_id: parseInt(e.target.value) })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name_en} ({c.section_group})</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Gender</label>
                          <select
                            value={editingProduct.gender}
                            onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value })}
                            className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Unisex">Unisex</option>
                            <option value="Kids & Teens">Kids & Teens</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Occasion</label>
                          <select
                            value={editingProduct.occasion}
                            onChange={(e) => setEditingProduct({ ...editingProduct, occasion: e.target.value })}
                            className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                          >
                            <option value="Casual Wear">Casual Wear</option>
                            <option value="Party Wear">Party Wear</option>
                            <option value="Traditional Wear">Traditional Wear</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">SKU Code</label>
                          <input
                            type="text"
                            value={editingProduct.sku}
                            onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                            className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-4 pt-5 items-center">
                          <label className="flex items-center gap-1.5 text-xs text-stone-300 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.is_featured === 1}
                              onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked ? 1 : 0 })}
                              className="accent-gold-500"
                            /> Featured
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-stone-300 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.is_new_arrival === 1}
                              onChange={(e) => setEditingProduct({ ...editingProduct, is_new_arrival: e.target.checked ? 1 : 0 })}
                              className="accent-gold-500"
                            /> New Arrival
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-language Title Translations */}
                  <div className="border-t border-stone-800 pt-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Language Titles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">English Title</label>
                        <input
                          type="text" required
                          value={editingProduct.title_en}
                          onChange={(e) => setEditingProduct({ ...editingProduct, title_en: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Tamil Title (தமிழ்)</label>
                        <input
                          type="text"
                          value={editingProduct.title_ta}
                          onChange={(e) => setEditingProduct({ ...editingProduct, title_ta: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Hindi Title (हिंदी)</label>
                        <input
                          type="text"
                          value={editingProduct.title_hi}
                          onChange={(e) => setEditingProduct({ ...editingProduct, title_hi: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Telugu Title (తెలుగు)</label>
                        <input
                          type="text"
                          value={editingProduct.title_te}
                          onChange={(e) => setEditingProduct({ ...editingProduct, title_te: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Multi-language Descriptions */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Language Descriptions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">English Description</label>
                        <textarea
                          rows={2}
                          value={editingProduct.description_en}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Tamil Description (தமிழ்)</label>
                        <textarea
                          rows={2}
                          value={editingProduct.description_ta}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description_ta: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Hindi Description (हिंदी)</label>
                        <textarea
                          rows={2}
                          value={editingProduct.description_hi}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description_hi: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Telugu Description (తెలుగు)</label>
                        <textarea
                          rows={2}
                          value={editingProduct.description_te}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description_te: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Selector & Upload */}
                  <div className="border-t border-stone-800 pt-5 space-y-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Product Image</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      {editingProduct.image_url && (
                        <div className="w-20 h-20 bg-stone-950 border border-stone-800 rounded-lg overflow-hidden shrink-0">
                          <img src={editingProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2 w-full">
                        <input
                          type="text"
                          value={editingProduct.image_url}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                          placeholder="Or paste an image URL directly"
                          className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'product');
                            }}
                            className="hidden"
                            id="product-image-uploader"
                          />
                          <label
                            htmlFor="product-image-uploader"
                            className="bg-stone-800 hover:bg-stone-850 text-stone-300 font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer max-w-xs transition-colors border border-stone-700"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload File From PC
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="border-t border-stone-800 pt-5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="bg-transparent hover:bg-white/5 border border-stone-800 text-stone-300 font-bold text-xs uppercase tracking-wider py-2 px-5 rounded-full transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-2 px-5 rounded-full transition-colors cursor-pointer shadow-md animate-pulse"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              ) : (
                /* Products Table */
                <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-xl text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-850 text-gold-400 font-bold border-b border-stone-800 uppercase tracking-wider">
                          <th className="px-5 py-4">Image</th>
                          <th className="px-5 py-4">Name (English)</th>
                          <th className="px-5 py-4">Category</th>
                          <th className="px-5 py-4">Details</th>
                          <th className="px-5 py-4">Weight</th>
                          <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-850">
                        {products.map((p) => {
                          const catName = categories.find((c) => c.id === p.category_id)?.name_en || 'Unknown';
                          return (
                            <tr key={p.id} className="hover:bg-stone-900/60 transition-colors">
                              <td className="px-5 py-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-950 border border-stone-800">
                                  <img src={p.image_url} alt={p.title_en} className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="px-5 py-3 font-semibold text-stone-100">
                                {p.title_en}
                                <span className="text-[10px] text-stone-500 block font-mono">{p.sku || `OMS-P-${p.id}`}</span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="bg-stone-800/80 text-stone-300 px-2 py-0.5 rounded border border-stone-750 font-medium">
                                  {catName}
                                </span>
                              </td>
                              <td className="px-5 py-3 space-y-0.5">
                                <span className="block text-stone-400">Metal: <span className="text-gold-400 font-bold uppercase">{p.metal_type}</span> ({p.purity})</span>
                                <span className="block text-stone-500 text-[10px]">Gender: {p.gender} | Occasion: {p.occasion}</span>
                              </td>
                              <td className="px-5 py-3 font-mono font-bold text-stone-200">{p.weight} gm</td>
                              <td className="px-5 py-3 text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => setEditingProduct(p)}
                                    className="p-1.5 bg-stone-800 hover:bg-stone-750 rounded text-stone-300 hover:text-gold-400 transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(p.id)}
                                    className="p-1.5 bg-stone-800 hover:bg-red-900/80 rounded text-stone-400 hover:text-white transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-stone-500 font-medium">
                              No products found in database. Create one to get started!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CATEGORIES (NAVBAR) MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-stone-850 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-black text-gold-300">Categories (Navbar Groups)</h2>
                  <p className="text-xs text-stone-400 mt-1">Configure your navbar navigation list, subcategories, groupings, and layout links.</p>
                </div>
                <button
                  onClick={() => setEditingCategory({
                    id: 0, parent_id: null, slug: '',
                    name_en: '', name_ta: '', name_hi: '', name_te: '',
                    icon: 'Sparkles', section_group: 'jewellery', sort_order: 1,
                    navbar_tab: 'all'
                  })}
                  className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              {editingCategory ? (
                /* Category form */
                <form onSubmit={saveCategory} className="bg-stone-900 border border-gold-400/20 rounded-2xl p-6 space-y-6 max-w-2xl text-left">
                  <h3 className="font-serif text-lg font-bold text-gold-300 border-b border-stone-800 pb-3">
                    {editingCategory.id === 0 ? 'Add New Category' : 'Edit Category'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Navigation Slug (e.g. jhumkas)</label>
                      <input
                        type="text" required
                        value={editingCategory.slug}
                        onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Group Menu Heading</label>
                      <select
                        value={editingCategory.section_group}
                        onChange={(e) => setEditingCategory({ ...editingCategory, section_group: e.target.value })}
                        className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                      >
                        <option value="jewellery">All Jewellery Catalog</option>
                        <option value="gender">Gender Category</option>
                        <option value="occasion">Occasion Category</option>
                        <option value="gold_articles">Gold Articles (Special)</option>
                        <option value="silver_articles">Silver Articles (Special)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Navbar Tab Link</label>
                      <select
                        value={editingCategory.navbar_tab || 'all'}
                        onChange={(e) => setEditingCategory({ ...editingCategory, navbar_tab: e.target.value })}
                        className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                      >
                        <option value="all">All Jewellery</option>
                        <option value="gold">Gold</option>
                        <option value="diamond">Diamond</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                        <option value="coins">Coins & Bars</option>
                        <option value="gift">Gift Store</option>
                        <option value="none">None (Offers/Collections/Other)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Parent Category (optional subcategory link)</label>
                      <select
                        value={editingCategory.parent_id || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                      >
                        <option value="">-- None (Top Level) --</option>
                        {categories.filter(c => !c.parent_id && c.id !== editingCategory.id).map(c => (
                          <option key={c.id} value={c.id}>{c.name_en} ({c.section_group})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Lucide Icon name</label>
                        <input
                          type="text"
                          value={editingCategory.icon}
                          onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Sort Order</label>
                        <input
                          type="number"
                          value={editingCategory.sort_order}
                          onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Translations */}
                  <div className="border-t border-stone-800 pt-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Category Translations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">English Category Name</label>
                        <input
                          type="text" required
                          value={editingCategory.name_en}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Tamil Category Name (தமிழ்)</label>
                        <input
                          type="text"
                          value={editingCategory.name_ta}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name_ta: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Hindi Category Name (हिंदी)</label>
                        <input
                          type="text"
                          value={editingCategory.name_hi}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name_hi: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Telugu Category Name (తెలుగు)</label>
                        <input
                          type="text"
                          value={editingCategory.name_te}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name_te: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-800 pt-5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="bg-transparent hover:bg-white/5 border border-stone-800 text-stone-300 font-bold text-xs uppercase tracking-wider py-2 px-5 rounded-full transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-2 px-5 rounded-full transition-colors cursor-pointer shadow-md"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              ) : (
                /* Category List Table */
                <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-xl text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-850 text-gold-400 font-bold border-b border-stone-800 uppercase tracking-wider">
                          <th className="px-5 py-4">ID</th>
                          <th className="px-5 py-4">Navbar Category Name (English)</th>
                          <th className="px-5 py-4">Slug</th>
                          <th className="px-5 py-4">Group</th>
                          <th className="px-5 py-4">Tab link</th>
                          <th className="px-5 py-4">Parent</th>
                          <th className="px-5 py-4">Order</th>
                          <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-850">
                        {categories.map((c) => {
                          const parentName = categories.find((parent) => parent.id === c.parent_id)?.name_en || '-';
                          return (
                            <tr key={c.id} className="hover:bg-stone-900/60 transition-colors">
                              <td className="px-5 py-3 font-mono text-stone-400">#{c.id}</td>
                              <td className="px-5 py-3 font-semibold text-stone-100 flex items-center gap-2">
                                <span className="bg-stone-850 p-1.5 rounded border border-stone-800 font-mono text-gold-400">
                                  {c.icon}
                                </span>
                                {c.name_en}
                              </td>
                              <td className="px-5 py-3 font-mono text-stone-400">{c.slug}</td>
                              <td className="px-5 py-3 text-stone-300 font-semibold">{c.section_group}</td>
                              <td className="px-5 py-3 text-stone-300 font-semibold uppercase">{c.navbar_tab || 'all'}</td>
                              <td className="px-5 py-3 text-stone-400">{parentName}</td>
                              <td className="px-5 py-3 font-mono">{c.sort_order}</td>
                              <td className="px-5 py-3 text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => setEditingCategory(c)}
                                    className="p-1.5 bg-stone-800 hover:bg-stone-750 rounded text-stone-300 hover:text-gold-400 transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteCategory(c.id)}
                                    className="p-1.5 bg-stone-800 hover:bg-red-900/80 rounded text-stone-400 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: METAL RATES BOARD */}
          {activeTab === 'rates' && (
            <div className="space-y-6 max-w-xl text-left">
              <div>
                <h2 className="font-serif text-2xl font-black text-gold-300">Metal Rates Board</h2>
                <p className="text-xs text-stone-400 mt-1">Override the scrap prices and standard rates of Gold, Silver, and Platinum.</p>
              </div>

              <form onSubmit={saveRates} className="bg-stone-900 border border-gold-400/20 rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                  {rates.map((r, idx) => (
                    <div key={r.metal} className="bg-stone-950 border border-stone-850 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="shrink-0">
                        <p className="text-xs font-bold text-stone-300 uppercase leading-none">{r.name}</p>
                        <span className="text-[10px] font-mono text-stone-500 uppercase">{r.metal}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <label className="text-[9px] uppercase text-stone-500 font-bold">Rate (₹)</label>
                          <input
                            type="number" step="0.01"
                            value={r.rate}
                            onChange={(e) => {
                              const newRates = [...rates];
                              newRates[idx].rate = parseFloat(e.target.value);
                              setRates(newRates);
                            }}
                            className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1 text-xs text-stone-100 focus:outline-none"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[9px] uppercase text-stone-500 font-bold">Change</label>
                          <input
                            type="text"
                            value={r.change_val || ''}
                            onChange={(e) => {
                              const newRates = [...rates];
                              newRates[idx].change_val = e.target.value;
                              setRates(newRates);
                            }}
                            className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1 text-xs text-stone-100 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase text-stone-500 font-bold block mb-1">Trend</label>
                          <select
                            value={r.is_up}
                            onChange={(e) => {
                              const newRates = [...rates];
                              newRates[idx].is_up = parseInt(e.target.value);
                              setRates(newRates);
                            }}
                            className="bg-stone-900 border border-stone-800 text-[11px] rounded px-1.5 py-1 text-stone-300"
                          >
                            <option value={1}>Up (+)</option>
                            <option value={0}>Down (-)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-md"
                  >
                    Save Metal Rates
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: HERO CAROUSEL BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-stone-850 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-black text-gold-300">Hero Carousel Banners</h2>
                  <p className="text-xs text-stone-400 mt-1">Manage the sliding video and image banners shown on the store home page.</p>
                </div>
                <button
                  onClick={() => setEditingBanner({
                    id: 0, title_en: '', title_ta: '', title_hi: '', title_te: '',
                    subtitle_en: '', subtitle_ta: '', subtitle_hi: '', subtitle_te: '',
                    media_type: 'image', image_url: '', video_url: '', link_url: '', sort_order: 1
                  })}
                  className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Banner
                </button>
              </div>

              {editingBanner ? (
                /* Banner Form */
                <form onSubmit={saveBanner} className="bg-stone-900 border border-gold-400/20 rounded-2xl p-6 space-y-6 max-w-3xl text-left">
                  <h3 className="font-serif text-lg font-bold text-gold-300 border-b border-stone-800 pb-3">
                    {editingBanner.id === 0 ? 'Create New Slide Banner' : 'Edit Slide Banner'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Media Type</label>
                      <select
                        value={editingBanner.media_type}
                        onChange={(e) => setEditingBanner({ ...editingBanner, media_type: e.target.value })}
                        className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                      >
                        <option value="image">Static Image</option>
                        <option value="video">Autoplay Video</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Sort Order</label>
                      <input
                        type="number"
                        value={editingBanner.sort_order}
                        onChange={(e) => setEditingBanner({ ...editingBanner, sort_order: parseInt(e.target.value) })}
                        className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Link URL (When clicked, e.g., #/category/necklace)</label>
                      <input
                        type="text"
                        value={editingBanner.link_url}
                        onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                        className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Banner Asset files */}
                  <div className="border-t border-stone-800 pt-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Banner Resources</h4>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400">Image Asset URL (Fallback for video)</label>
                      <input
                        type="text"
                        value={editingBanner.image_url}
                        onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                        className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none placeholder-stone-600"
                        placeholder="/assets/image_slide.jpg"
                      />
                    </div>
                    {editingBanner.media_type === 'video' && (
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Video Asset URL (MP4 Format)</label>
                        <input
                          type="text"
                          value={editingBanner.video_url}
                          onChange={(e) => setEditingBanner({ ...editingBanner, video_url: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none placeholder-stone-600"
                          placeholder="/assets/video_slide.mp4"
                        />
                      </div>
                    )}

                    <div className="relative pt-2">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'banner');
                        }}
                        className="hidden"
                        id="banner-file-uploader"
                      />
                      <label
                        htmlFor="banner-file-uploader"
                        className="bg-stone-800 hover:bg-stone-850 text-stone-300 font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer max-w-xs transition-colors border border-stone-700"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload File From PC
                      </label>
                    </div>
                  </div>

                  {/* Multi-language Title Translations */}
                  <div className="border-t border-stone-800 pt-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Title Translations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">English Title</label>
                        <input
                          type="text"
                          value={editingBanner.title_en}
                          onChange={(e) => setEditingBanner({ ...editingBanner, title_en: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Tamil Title (தமிழ்)</label>
                        <input
                          type="text"
                          value={editingBanner.title_ta}
                          onChange={(e) => setEditingBanner({ ...editingBanner, title_ta: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Hindi Title (हिंदी)</label>
                        <input
                          type="text"
                          value={editingBanner.title_hi}
                          onChange={(e) => setEditingBanner({ ...editingBanner, title_hi: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Telugu Title (తెలుగు)</label>
                        <input
                          type="text"
                          value={editingBanner.title_te}
                          onChange={(e) => setEditingBanner({ ...editingBanner, title_te: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subtitle Translations */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Subtitle Translations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">English Subtitle</label>
                        <input
                          type="text"
                          value={editingBanner.subtitle_en}
                          onChange={(e) => setEditingBanner({ ...editingBanner, subtitle_en: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Tamil Subtitle (தமிழ்)</label>
                        <input
                          type="text"
                          value={editingBanner.subtitle_ta}
                          onChange={(e) => setEditingBanner({ ...editingBanner, subtitle_ta: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Hindi Subtitle (हिंदी)</label>
                        <input
                          type="text"
                          value={editingBanner.subtitle_hi}
                          onChange={(e) => setEditingBanner({ ...editingBanner, subtitle_hi: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400">Telugu Subtitle (తెలుగు)</label>
                        <input
                          type="text"
                          value={editingBanner.subtitle_te}
                          onChange={(e) => setEditingBanner({ ...editingBanner, subtitle_te: e.target.value })}
                          className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-800 pt-5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingBanner(null)}
                      className="bg-transparent hover:bg-white/5 border border-stone-800 text-stone-300 font-bold text-xs uppercase tracking-wider py-2 px-5 rounded-full transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-2 px-5 rounded-full transition-colors cursor-pointer shadow-md"
                    >
                      Save Banner
                    </button>
                  </div>
                </form>
              ) : (
                /* Banners List */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {banners.map((b) => (
                    <div key={b.id} className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                      <div className="aspect-[16/9] bg-stone-950 relative border-b border-stone-850">
                        {b.media_type === 'video' && b.video_url ? (
                          <video src={b.video_url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                        ) : (
                          <img src={b.image_url} alt={b.title_en} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute top-3 left-3 bg-stone-900/90 text-gold-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-stone-850 font-bold">
                          {b.media_type} (Order: {b.sort_order})
                        </span>
                      </div>
                      
                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-sm text-stone-100">{b.title_en}</h3>
                          <p className="text-[11px] text-stone-400 mt-1 leading-tight">{b.subtitle_en}</p>
                          <span className="text-[9px] text-stone-500 font-mono block mt-2">Target Link: {b.link_url}</span>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-stone-850">
                          <button
                            onClick={() => setEditingBanner(b)}
                            className="bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => deleteBanner(b.id)}
                            className="bg-stone-800 hover:bg-red-950/80 text-stone-400 hover:text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GLOBAL SETTINGS & PASSWORD */}
          {activeTab === 'settings' && (
            <div className="space-y-8 text-left max-w-2xl">
              
              {/* Notice Board text */}
              <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-gold-300">Notice Board Announcements</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Edit the scrolling text banner message displayed at the very top of the website.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400">English Notice Text</label>
                    <textarea
                      rows={3}
                      value={settings.notice_text_en || ''}
                      onChange={(e) => setSettings({ ...settings, notice_text_en: e.target.value })}
                      onBlur={() => saveSettingValue('notice_text_en', settings.notice_text_en)}
                      className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400">Tamil Notice Text (தமிழ்)</label>
                    <textarea
                      rows={3}
                      value={settings.notice_text_ta || ''}
                      onChange={(e) => setSettings({ ...settings, notice_text_ta: e.target.value })}
                      onBlur={() => saveSettingValue('notice_text_ta', settings.notice_text_ta)}
                      className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400">Hindi Notice Text (हिंदी)</label>
                    <textarea
                      rows={3}
                      value={settings.notice_text_hi || ''}
                      onChange={(e) => setSettings({ ...settings, notice_text_hi: e.target.value })}
                      onBlur={() => saveSettingValue('notice_text_hi', settings.notice_text_hi)}
                      className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400">Telugu Notice Text (తెలుగు)</label>
                    <textarea
                      rows={3}
                      value={settings.notice_text_te || ''}
                      onChange={(e) => setSettings({ ...settings, notice_text_te: e.target.value })}
                      onBlur={() => saveSettingValue('notice_text_te', settings.notice_text_te)}
                      className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2 text-xs text-stone-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password update form */}
              <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-gold-300">Security Credentials</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Change the showroom admin console entrance passcode.</p>
                </div>

                <form onSubmit={updatePassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400">New Password</label>
                    <input
                      type="password" required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="mt-1 w-full bg-stone-950 border border-stone-850 rounded-lg px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none placeholder-stone-700"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-md"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
