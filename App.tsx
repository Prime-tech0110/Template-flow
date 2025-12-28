
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Search, ShoppingBag, PlusCircle, Filter, ChevronRight, Menu, X, ArrowLeft, ExternalLink, Download, Layout, Sparkles, Code, Globe, Database, Image as ImageIcon, Wand2, Video, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MOCK_TEMPLATES } from './constants';
import { Category, Tech, Template, FilterState } from './types';
import { generateTemplateDescription, getProjectRoadmap, editImageWithAI, animateImageWithVeo } from './services/geminiService';

// --- Types ---
declare global {
  // Define AIStudio interface to align with environment types and avoid modifier conflicts
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}

// --- Shared Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'info' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    info: <Sparkles className="w-5 h-5 text-indigo-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    info: 'bg-indigo-500/10 border-indigo-500/20',
    error: 'bg-red-500/10 border-red-500/20'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all animate-in slide-in-from-right fade-in ${bgColors[type]}`}>
      {icons[type]}
      <span className="ml-3 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors">
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
};

const Navbar = ({ onSearch }: { onSearch: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            TemplateFlow
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search premium templates..." 
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/ai-studio" className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors">
            <Wand2 className="w-4 h-4 mr-1" />
            AI Studio
          </Link>
          <Link to="/roadmap" className="text-slate-400 hover:text-white transition-colors">Roadmap</Link>
          <Link to="/admin" className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors">
            <PlusCircle className="w-4 h-4 mr-1" />
            Upload
          </Link>
          <button className="bg-white text-slate-900 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-400">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-slate-800 space-y-4">
          <div className="pt-4 px-2">
             <input 
              type="text" 
              placeholder="Search..." 
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-sm"
            />
          </div>
          <div className="flex flex-col space-y-3 px-2 text-sm">
            <Link to="/ai-studio" className="text-emerald-400" onClick={() => setIsOpen(false)}>AI Studio</Link>
            <Link to="/roadmap" className="text-slate-400" onClick={() => setIsOpen(false)}>Roadmap</Link>
            <Link to="/admin" className="text-indigo-400" onClick={() => setIsOpen(false)}>Admin Panel</Link>
            <button className="bg-white text-slate-900 w-full py-2 rounded-lg">Sign In</button>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Page Components ---

const HomePage = ({ templates, filters, setFilters }: { templates: Template[], filters: FilterState, setFilters: React.Dispatch<React.SetStateAction<FilterState>> }) => {
  const filtered = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'All' || t.category === filters.category;
      const matchesStyle = filters.style === 'All' || t.style === filters.style;
      const matchesPrice = t.price >= filters.priceRange[0] && t.price <= filters.priceRange[1];
      return matchesSearch && matchesCategory && matchesStyle && matchesPrice;
    });
  }, [templates, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-16 text-center space-y-6 pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Launch your project <br /> 
          <span className="text-indigo-500">Faster than ever.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Hand-crafted templates for landing pages, blogs, and apps. Built with Next.js, React, and Tailwind CSS.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button onClick={() => setFilters(f => ({ ...f, category: Category.LANDING_PAGE }))} className="px-6 py-3 bg-slate-800 rounded-full border border-slate-700 hover:border-indigo-500 transition-colors">
            Landing Pages
          </button>
          <button onClick={() => setFilters(f => ({ ...f, category: Category.BLOGGING }))} className="px-6 py-3 bg-slate-800 rounded-full border border-slate-700 hover:border-indigo-500 transition-colors">
            Blogging
          </button>
          <button onClick={() => setFilters(f => ({ ...f, category: Category.ECOMMERCE }))} className="px-6 py-3 bg-slate-800 rounded-full border border-slate-700 hover:border-indigo-500 transition-colors">
            E-commerce
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <Filter className="w-4 h-4 mr-2" /> Categories
            </h3>
            <div className="space-y-2">
              {['All', ...Object.values(Category)].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilters(f => ({...f, category: cat as any}))}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Price Range</h3>
            <div className="space-y-4">
               <input 
                type="range" 
                min="0" 
                max="100" 
                value={filters.priceRange[1]}
                onChange={(e) => setFilters(f => ({...f, priceRange: [0, parseInt(e.target.value)]}))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Free</span>
                <span>Max: ${filters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          <div>
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Style</h3>
             <select 
               value={filters.style}
               onChange={(e) => setFilters(f => ({...f, style: e.target.value}))}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-indigo-500"
             >
               <option value="All">All Styles</option>
               <option value="Minimal">Minimal</option>
               <option value="Modern">Modern</option>
               <option value="Corporate">Corporate</option>
               <option value="Creative">Creative</option>
             </select>
          </div>
        </aside>

        {/* Grid Layout */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{filtered.length} Templates Found</h2>
            <div className="text-sm text-slate-400">Sorting by: <span className="text-white cursor-pointer hover:underline">Newest</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(template => (
              <Link 
                key={template.id} 
                to={`/template/${template.id}`}
                className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={template.thumbnail} 
                    alt={template.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-700">
                    {template.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-400 transition-colors">{template.title}</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    {template.techStack.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{t}</span>
                    ))}
                    {template.techStack.length > 2 && <span className="text-[10px] text-slate-500">+{template.techStack.length - 2}</span>}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    <span className="font-bold text-lg">{template.price === 0 ? 'FREE' : `$${template.price}`}</span>
                    <div className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-800">
              <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No templates match your filters. Try adjusting them!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const AIStudio = ({ showToast }: { showToast: (msg: string, type: 'success' | 'info' | 'error') => void }) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'animate'>('edit');
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!image || !prompt) return;

    setIsProcessing(true);
    setResult(null);

    try {
      if (activeTab === 'edit') {
        const base64Data = image.split(',')[1];
        const edited = await editImageWithAI(base64Data, prompt);
        setResult(edited);
        showToast("Image enhanced successfully!", "success");
      } else {
        // Veo Video Generation
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // After returning from key selection, we proceed.
        }

        const base64Data = image.split(',')[1];
        const videoUrl = await animateImageWithVeo(base64Data, prompt, aspectRatio);
        setResult(videoUrl);
        showToast("Cinematic animation complete!", "success");
      }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        showToast("Project not found. Please select a valid paid project key.", "error");
        await window.aistudio.openSelectKey();
      } else {
        showToast("AI processing failed. Please try again.", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-indigo-500 bg-clip-text text-transparent">AI Media Studio</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Enhance your template assets or create stunning video previews with Gemini 2.5 and Veo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex">
              <button 
                onClick={() => { setActiveTab('edit'); setResult(null); }}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center transition-colors ${activeTab === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Wand2 className="w-4 h-4 mr-2" /> Edit
              </button>
              <button 
                onClick={() => { setActiveTab('animate'); setResult(null); }}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center transition-colors ${activeTab === 'animate' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Video className="w-4 h-4 mr-2" /> Animate
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center hover:bg-slate-800/80 transition-all group"
                >
                  {image ? (
                    <img src={image} className="w-full h-full object-cover rounded-lg" alt="Upload" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-slate-400 font-medium">Upload Image (JPEG/PNG)</span>
                    </>
                  )}
                </button>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={activeTab === 'edit' ? "e.g., Add a retro filter and soften the light" : "e.g., Cinematic panning of a futuristic city"}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {activeTab === 'animate' && (
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Aspect Ratio</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setAspectRatio('16:9')}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${aspectRatio === '16:9' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 text-slate-500'}`}
                      >
                        16:9 (Landscape)
                      </button>
                      <button 
                        onClick={() => setAspectRatio('9:16')}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${aspectRatio === '9:16' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 text-slate-500'}`}
                      >
                        9:16 (Portrait)
                      </button>
                   </div>
                   <div className="mt-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                      <p className="text-[10px] text-yellow-500/70 leading-relaxed italic">
                        Veo generation takes 1-2 minutes. Please select a paid API key from <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">billing docs</a>.
                      </p>
                   </div>
                </div>
              )}

              <button 
                onClick={handleProcess}
                disabled={!image || !prompt || isProcessing}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${activeTab === 'edit' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {activeTab === 'animate' ? 'Generating Video...' : 'Enhancing Image...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {activeTab === 'edit' ? 'Apply AI Edit' : 'Animate with Veo'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Display Result */}
        <div className="lg:col-span-8">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full min-h-[500px] flex items-center justify-center overflow-hidden relative group">
              {result ? (
                activeTab === 'animate' ? (
                   <video key={result} src={result} autoPlay loop controls className="w-full h-full object-contain" />
                ) : (
                   <img src={result} className="w-full h-full object-contain" alt="Result" />
                )
              ) : isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-400 animate-pulse">
                    {activeTab === 'animate' ? "Curating cinematic frames..." : "Dreaming of pixels..."}
                  </p>
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Result Yet</h3>
                  <p className="text-slate-500 max-w-sm">Upload an image and provide a prompt to see the AI magic happen here.</p>
                </div>
              )}

              {result && (
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={result} 
                    download={`ai-${activeTab}-${Date.now()}`}
                    className="p-3 bg-white text-slate-900 rounded-full shadow-2xl hover:bg-slate-200 transition-colors block"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const TemplateDetailPage = ({ templates, showToast }: { templates: Template[], showToast: (msg: string, type: 'success' | 'info' | 'error') => void }) => {
  const { id } = useParams();
  const template = templates.find(t => t.id === id);
  const navigate = useNavigate();

  if (!template) return <div className="text-center py-20">Template not found</div>;

  const handleDownload = (e: React.MouseEvent) => {
    if (template.downloadUrl === '#') {
      e.preventDefault();
      showToast(`Preparing download for ${template.title}... Mock link activated.`, "info");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-white mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
            <img src={template.thumbnail} alt={template.title} className="w-full h-full object-cover" />
            <Link to="/ai-studio" className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold flex items-center border border-white/10 hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100">
               <Wand2 className="w-3 h-3 mr-2" />
               Enhance with AI
            </Link>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              {template.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <Layout className="w-5 h-5 text-indigo-400 mb-2" />
                  <div className="text-xs text-slate-500 uppercase">Style</div>
                  <div className="text-sm font-semibold">{template.style}</div>
               </div>
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <Sparkles className="w-5 h-5 text-indigo-400 mb-2" />
                  <div className="text-xs text-slate-500 uppercase">Category</div>
                  <div className="text-sm font-semibold">{template.category}</div>
               </div>
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <Code className="w-5 h-5 text-indigo-400 mb-2" />
                  <div className="text-xs text-slate-500 uppercase">Tech</div>
                  <div className="text-sm font-semibold">{template.techStack[0]}</div>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sticky top-24">
            <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
            <div className="text-4xl font-extrabold text-white mb-8">
              {template.price === 0 ? 'FREE' : `$${template.price}`}
            </div>
            
            <div className="space-y-3">
              <a 
                href={template.downloadUrl}
                onClick={handleDownload}
                download={template.title.replace(/\s+/g, '-').toLowerCase() + '.zip'}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center text-center text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Template
              </a>
              <a 
                href={template.livePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold border border-slate-700 transition-all flex items-center justify-center text-center text-white"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Live Preview
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Includes</span>
                <span className="text-slate-300">Commercial License</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tech Stack</span>
                <div className="flex gap-2">
                  {template.techStack.map(t => (
                    <span key={t} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ onAdd, showToast }: { onAdd: (t: Template) => void, showToast: (msg: string, type: 'success' | 'info' | 'error') => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: Category.LANDING_PAGE,
    price: '29',
    techStack: [Tech.REACT, Tech.TAILWIND],
    style: 'Modern' as any
  });
  const [loading, setLoading] = useState(false);
  const [generatedDesc, setGeneratedDesc] = useState('');
  const navigate = useNavigate();

  const handleAICompose = async () => {
    if (!formData.title) {
      showToast("Please enter a title first", "error");
      return;
    }
    setLoading(true);
    const desc = await generateTemplateDescription(formData.title, formData.category, formData.techStack);
    setGeneratedDesc(desc);
    setLoading(false);
    showToast("Description generated by Gemini", "success");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTemplate: Template = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: generatedDesc || 'No description provided.',
      price: parseInt(formData.price),
      category: formData.category,
      techStack: formData.techStack,
      thumbnail: `https://picsum.photos/seed/${Math.random()}/800/600`,
      livePreviewUrl: '#',
      downloadUrl: '#',
      style: formData.style,
      createdAt: Date.now()
    };
    onAdd(newTemplate);
    showToast("Template published to marketplace", "success");
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Upload New Template</h1>
            <p className="text-slate-400">Add metadata and images for your latest masterpiece.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Template Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Nexus SaaS"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Price ($)</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Primary Tech</label>
              <select 
                multiple
                value={formData.techStack}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions).map((option: any) => option.value as Tech);
                  setFormData({...formData, techStack: options});
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
              >
                {Object.values(Tech).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-2 flex justify-between">
              Description 
              <button 
                type="button" 
                onClick={handleAICompose}
                disabled={loading}
                className="text-indigo-400 text-xs hover:underline flex items-center"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {loading ? 'AI Thinking...' : 'AI Compose Description'}
              </button>
            </label>
            <textarea 
              rows={4}
              value={generatedDesc}
              onChange={e => setGeneratedDesc(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Tell users why they need this template..."
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all mt-8"
          >
            Publish Template
          </button>
        </form>
      </div>
    </div>
  );
};

const RoadmapPage = () => {
    const [roadmap, setRoadmap] = useState('Loading roadmap...');

    useEffect(() => {
        getProjectRoadmap().then(setRoadmap);
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 flex items-center">
                <Globe className="w-8 h-8 mr-4 text-indigo-500" />
                Development Roadmap
            </h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 prose prose-invert max-w-none">
                <div className="space-y-12">
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500 flex items-center justify-center font-bold text-indigo-400">1</div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Phase 1: Foundation & Tech Stack</h3>
                            <p className="text-slate-400">Initialize a Next.js 14 project with Tailwind CSS and TypeScript. Set up Supabase for Authentication and PostgreSQL database to store template metadata.</p>
                        </div>
                    </section>
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">2</div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Phase 2: Core Components & UI</h3>
                            <p className="text-slate-400">Design the responsive Navbar, Hero section, and Template Grid. Implement the filter sidebar with state-managed filtering logic.</p>
                        </div>
                    </section>
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">3</div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Phase 3: Admin & AI Integration</h3>
                            <p className="text-slate-400">Build the Admin Dashboard for template uploads. Integrate the Gemini API to automatically generate SEO-friendly descriptions based on template features.</p>
                        </div>
                    </section>
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">4</div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Phase 4: Payments & Storage</h3>
                            <p className="text-slate-400">Integrate Stripe for handling purchases. Set up Supabase Storage for high-res thumbnails and downloadable template ZIP files.</p>
                        </div>
                    </section>
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">5</div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Phase 5: Launch & SEO</h3>
                            <p className="text-slate-400">Optimize for performance with Next.js ISR. Deploy to Vercel and set up analytics to track template popularity and conversion rates.</p>
                        </div>
                    </section>
                </div>

                <div className="mt-16 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h4 className="text-indigo-400 font-bold mb-2 flex items-center">
                        <Database className="w-4 h-4 mr-2" /> AI Suggested DB Schema
                    </h4>
                    <pre className="text-xs bg-black/50 p-4 rounded-lg overflow-x-auto text-emerald-400">
{`CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL DEFAULT 0,
  category VARCHAR(50),
  tech_stack TEXT[],
  thumbnail_url TEXT,
  download_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                    </pre>
                </div>
            </div>
        </div>
    );
}

// --- Main App ---

const App: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    priceRange: [0, 100],
    style: 'All'
  });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
  };

  const handleAddTemplate = (newTemplate: Template) => {
    setTemplates(prev => [newTemplate, ...prev]);
  };

  const handleSearch = (search: string) => {
    setFilters(f => ({ ...f, search }));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar onSearch={handleSearch} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage templates={templates} filters={filters} setFilters={setFilters} />} />
            <Route path="/template/:id" element={<TemplateDetailPage templates={templates} showToast={showToast} />} />
            <Route path="/admin" element={<AdminPanel onAdd={handleAddTemplate} showToast={showToast} />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/ai-studio" element={<AIStudio showToast={showToast} />} />
          </Routes>
        </main>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}

        <footer className="border-t border-slate-900 bg-slate-950 px-4 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-indigo-500" />
                <span className="text-xl font-bold">TemplateFlow</span>
              </div>
              <p className="text-slate-500 text-sm">
                The world's best collection of premium templates for makers and developers.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Marketplace</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/" className="hover:text-white transition-colors">All Templates</Link></li>
                <li><button onClick={() => setFilters(f => ({...f, category: Category.LANDING_PAGE}))} className="hover:text-white transition-colors">Landing Pages</button></li>
                <li><button onClick={() => setFilters(f => ({...f, category: Category.BLOGGING}))} className="hover:text-white transition-colors">Blogging</button></li>
                <li><button onClick={() => setFilters(f => ({...f, category: Category.ECOMMERCE}))} className="hover:text-white transition-colors">E-commerce</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/ai-studio" className="hover:text-white transition-colors">AI Studio</Link></li>
                <li><Link to="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">License</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Join the Lab</h4>
              <p className="text-slate-500 text-sm mb-4">Get the latest AI-generated design assets daily.</p>
              <div className="flex space-x-2">
                <input type="email" placeholder="Email address" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <button className="bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold">Join</button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs">
            © {new Date().getFullYear()} TemplateFlow Inc. Powered by Gemini & Veo.
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
