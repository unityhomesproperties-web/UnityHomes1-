import React, { useState, useEffect } from 'react';
import { MapPin, Search, Calendar, ChevronRight, X, Play, Share2, Clipboard, ShieldCheck, CheckSquare, Info, AlertTriangle, Send, Lock, Clock, Cpu, Wrench } from 'lucide-react';
import { Property } from '../types';
import { initialProperties, saveInquiry } from '../data';
import ImmutableHistory from './dashboards/ImmutableHistory';

interface PropertiesPageProps {
  initialTypeFilter?: string; // e.g. 'For Rent' or 'For Lease'
  selectedPropertyId?: string | null;
  navigate: (path: string, params?: any) => void;
}

export default function PropertiesPage({ initialTypeFilter = 'All', selectedPropertyId, navigate }: PropertiesPageProps) {
  // Filters state
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [bedroomsFilter, setBedroomsFilter] = useState<string>('');
  const [bathroomsFilter, setBathroomsFilter] = useState<string>('');
  const [priceMaxFilter, setPriceMaxFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');

  // Currently selected property for the Individual Detail View
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Gallery index for detail view
  const [galleryIndex, setGalleryIndex] = useState<number>(0);

  // Tab state for detail view tabs (Details, Lifetime Timeline, Immutable History)
  const [detailTab, setDetailTab] = useState<'details' | 'timeline' | 'history'>('details');

  // Detail View form submission state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    country: 'Nigeria',
    preferredDate: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Set selected property based on props or deep link
  useEffect(() => {
    if (selectedPropertyId) {
      const found = initialProperties.find(p => p.id === selectedPropertyId);
      if (found) {
        setSelectedProperty(found);
        setGalleryIndex(0);
        setDetailTab('details');
        setFormSubmitted(false);
      }
    } else {
      setSelectedProperty(null);
    }
  }, [selectedPropertyId]);

  // Handle active lists
  const filteredProperties = initialProperties.filter(prop => {
    // Type Filter Match
    if (typeFilter !== 'All') {
      if (typeFilter === 'For Rent') {
        if (prop.type !== 'For Rent' && prop.type !== 'New Listing') return false;
      } else if (typeFilter === 'For Lease') {
        if (prop.type !== 'For Lease') return false;
      } else if (typeFilter === 'Shortlet') {
        if (prop.type !== 'Shortlet') return false;
      } else if (typeFilter === 'Commercial Rent') {
        if (prop.type !== 'Commercial Rent') return false;
      } else if (typeFilter === 'Commercial Lease') {
        if (prop.type !== 'Commercial Lease') return false;
      } else if (typeFilter === 'New Listing') {
        if (prop.type !== 'New Listing') return false;
      }
    }

    // Location (State) match
    if (locationFilter && prop.state !== locationFilter) return false;

    // Property Type Sub-filter
    if (propertyTypeFilter) {
      if (propertyTypeFilter === 'Apartment' && !prop.title.toLowerCase().includes('apartment') && !prop.title.toLowerCase().includes('maisonette') && !prop.title.toLowerCase().includes('studio')) return false;
      if (propertyTypeFilter === 'Cottage' && !prop.title.toLowerCase().includes('cottage')) return false;
      if (propertyTypeFilter === 'Terrace' && !prop.title.toLowerCase().includes('terrace')) return false;
      if (propertyTypeFilter === 'Commercial' && !prop.type.toLowerCase().includes('commercial')) return false;
    }

    // Bedrooms
    if (bedroomsFilter) {
      if (bedroomsFilter === '4' && prop.bedrooms < 4) return false;
      if (bedroomsFilter !== '4' && prop.bedrooms !== parseInt(bedroomsFilter)) return false;
    }

    // Restrooms
    if (bathroomsFilter) {
      if (prop.bathrooms !== parseInt(bathroomsFilter)) return false;
    }

    // Price Max
    if (priceMaxFilter) {
      if (prop.price > parseInt(priceMaxFilter)) return false;
    }

    return true;
  });

  // Sorting
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // default
  });

  const handleOpenDetails = (prop: Property) => {
    setSelectedProperty(prop);
    setGalleryIndex(0);
    setDetailTab('details');
    setFormSubmitted(false);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      country: 'Nigeria',
      preferredDate: '',
      message: `Hello Unity Homes, I am interested in viewing ${prop.title} located at ${prop.location}.`
    });
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) {
      alert('Please fill out the required contact details.');
      return;
    }

    // Save inquiry back to state
    saveInquiry({
      type: 'PlatformSubscription',
      targetName: `Viewing: ${selectedProperty?.title || 'Property'}`,
      requesterName: formData.fullName,
      requesterPhone: formData.phone,
      requesterEmail: formData.email,
      planName: `Date Preferred: ${formData.preferredDate || 'Not Specified'}`
    });

    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
      
      {/* HEADER BAR */}
      <div className="mb-8 text-center md:text-left">
        <span className="text-xs font-mono font-bold tracking-widest text-[#C9A84C] uppercase bg-white border border-stone-200 px-3 py-1 rounded-full shadow-sm">
          Strict Verification Framework
        </span>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-[#18452E] mt-3">
          {typeFilter === 'For Rent' ? 'Verified Rent Ledger Options' : typeFilter === 'For Lease' ? 'Protected Leasehold Offerings' : 'Unity Homes Properties Portal'}
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-light">
          All properties listed are directly title-checked, physical address verified, and linked exclusively to verified owner accounts.
        </p>
      </div>

      {/* RENT AND LEASE SPECIFIC ADVERT DISCLAIMERS */}
      {typeFilter === 'For Lease' && (
        <div className="mb-6 bg-blue-50/40 border-l-4 border-blue-600 rounded-r-xl p-4 text-xs text-blue-900 leading-relaxed">
          <span className="font-bold flex items-center space-x-1 uppercase tracking-wider font-mono text-[10px]">
            <Info className="w-4 h-4 text-blue-600 mr-1" />
            LEASE SPECIAL CONDITIONS
          </span>
          <p className="mt-1 font-sans">
            Under Nigerian state laws, a long-term lease cannot be executed on land under government acquisition or dispute. Every lease property below has had physical land coordinates charted and title cleared by our litigation lawyers. Leases are executed with absolute transparency.
          </p>
        </div>
      )}

      {/* FILTER BAR BOX */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          
          {/* Status Dropdown conforming to STEP 8 spec */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#18452E] mb-1">
              Offer Status
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-medium text-[#18452E] focus:ring-1 focus:ring-[#18452E]"
            >
              <option value="All">All Categories</option>
              <option value="For Rent">For Rent</option>
              <option value="For Lease">For Lease</option>
              <option value="Shortlet">Shortlet</option>
              <option value="Commercial Rent">Commercial Rent</option>
              <option value="Commercial Lease">Commercial Lease</option>
              <option value="New Listing">New Listing</option>
              
              {/* Greyed out, coming soon tags, unselectable mock entries */}
              <option value="disabled-sale" disabled className="text-stone-300 italic font-mono">
                For Sale (Coming Soon ✦)
              </option>
              <option value="disabled-plan" disabled className="text-stone-300 italic font-mono">
                Payment Plan (Coming Soon ✦)
              </option>
              <option value="disabled-mort" disabled className="text-stone-300 italic font-mono">
                Mortgage (Coming Soon ✦)
              </option>
            </select>
          </div>

          {/* Location / State Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#18452E] mb-1">
              Select State
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs text-[#18452E]"
            >
              <option value="">All States (Nigeria)</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
            </select>
          </div>

          {/* Property types */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#18452E] mb-1">
              Design Structure
            </label>
            <select
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs text-[#18452E]"
            >
              <option value="">Any Layout</option>
              <option value="Apartment">Apartment / Maisonette</option>
              <option value="Cottage">Cottage</option>
              <option value="Terrace">Terrace Home</option>
              <option value="Commercial">Commercial Office</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#18452E] mb-1">
              Bedrooms count
            </label>
            <select
              value={bedroomsFilter}
              onChange={(e) => setBedroomsFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs text-[#18452E]"
            >
              <option value="">Any Bed</option>
              <option value="1">1 Bed</option>
              <option value="2">2 Beds</option>
              <option value="3">3 Beds</option>
              <option value="4">4+ Beds</option>
            </select>
          </div>

          {/* Price Max */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#18452E] mb-1">
              Max Price (Annual/Daily)
            </label>
            <select
              value={priceMaxFilter}
              onChange={(e) => setPriceMaxFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs text-[#18452E]"
            >
              <option value="">Any Budget</option>
              <option value="100000">Under ₦100,000</option>
              <option value="3000000">Under ₦3,000,000</option>
              <option value="5000000">Under ₦5,000,000</option>
              <option value="8000000">Under ₦8,000,000</option>
            </select>
          </div>

          {/* Sort selection */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#18452E] mb-1">
              Sort Price
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs text-[#18452E]"
            >
              <option value="default">Default Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* COMMERCIAL DIRECT NOTICE BAR */}
      {(typeFilter === 'Commercial Rent' || typeFilter === 'Commercial Lease') && (
        <div className="mb-6 bg-[#C9A84C]/15 border-l-4 border-[#C9A84C] p-4 rounded-r-xl text-xs text-[#18452E] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="p-1 px-1.5 bg-[#C9A84C] text-[#18452E] font-mono font-bold text-[9px] rounded">
              DIRECT PORTAL
            </span>
            <span className="font-semibold text-xs leading-none">
              Commercial properties are managed directly by the Unity Homes core team.
            </span>
          </div>
          <a 
            href="https://wa.me/2348145550012?text=Hello%20Unity%20Homes,%20I%20am%20inquiring%20about%20commercial%20listings."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#18452E] text-white hover:bg-[#18452E] text-[10px] font-bold rounded-md transition text-center inline-block"
          >
            Inquire Directly
          </a>
        </div>
      )}

      {/* RENDER GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Main List Section */}
        <div className={`${selectedProperty ? 'md:col-span-6 lg:col-span-5' : 'md:col-span-12'} transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-[#18452E]">
              Showing <strong className="text-[#18452E] font-semibold">{sortedProperties.length}</strong> matching entries found
            </span>
          </div>

          <div className={`grid gap-5 ${selectedProperty ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {sortedProperties.length === 0 ? (
              <div className="col-span-full bg-white border border-stone-200 p-10 rounded-xl text-center">
                <p className="text-stone-400 text-sm font-medium">
                  No active properties match your exact filters.
                </p>
                <button
                  onClick={() => {
                    setTypeFilter('All');
                    setLocationFilter('');
                    setPropertyTypeFilter('');
                    setBedroomsFilter('');
                    setBathroomsFilter('');
                    setPriceMaxFilter('');
                  }}
                  className="mt-3 text-xs bg-[#18452E] text-white px-4 py-2 rounded-lg font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              sortedProperties.map((prop) => {
                let statusBadgeColor = 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20';
                if (prop.type === 'Shortlet') {
                  statusBadgeColor = 'bg-amber-100 text-amber-800 border border-amber-200';
                } else if (prop.type === 'For Lease') {
                  statusBadgeColor = 'bg-blue-100 text-blue-800 border border-blue-200';
                }
                const isCurrent = selectedProperty?.id === prop.id;

                return (
                  <div
                    key={prop.id}
                    onClick={() => handleOpenDetails(prop)}
                    className={`bg-white rounded-xl border transition-all overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-md ${
                      isCurrent ? 'border-2 border-[#C9A84C] relative ring-2 ring-[#C9A84C]/10' : 'border-stone-200'
                    }`}
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-stone-50 shrink-0">
                      <img 
                        src={prop.photos[0]} 
                        alt={prop.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 flex space-x-1 font-mono text-[9px] font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-[#16A34A] text-white">
                          Verified Check
                        </span>
                        <span className={`px-1.5 py-0.5 rounded bg-white text-[#18452E] shadow-sm`}>
                          {prop.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-lg font-display font-extrabold text-[#18452E]">
                            {prop.type === 'Shortlet' ? `₦${prop.price.toLocaleString()}/night` : `₦${prop.price.toLocaleString()}/yr`}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-[#18452E] mt-1 line-clamp-1">{prop.title}</h3>
                        <div className="flex items-center text-[10px] text-stone-500 mt-1">
                          <MapPin className="w-3 h-3 text-[#C9A84C] mr-1 shrink-0" />
                          <span className="line-clamp-1">{prop.location}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-50 flex items-center justify-between text-[11px] text-stone-500">
                        <div className="flex space-x-2 font-mono">
                          <span>{prop.bedrooms} Bed</span>
                          <span>&bull;</span>
                          <span>{prop.bathrooms} Bath</span>
                        </div>
                        <span className="text-[#18452E] font-bold flex items-center space-x-0.5">
                          <span>View walk</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Property Detail Pane - STEP 9 */}
        {selectedProperty && (
          <div className="md:col-span-6 lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6 md:p-8 sticky top-24 max-h-[88vh] overflow-y-auto relative">
            {/* Elegant luxury top accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C9A84C]"></div>

            {/* Gallery Section */}
            <div className="flex justify-between items-center mb-5 pt-2">
              <span className="font-mono text-[9px] font-black text-[#C9A84C] bg-[#C9A84C]/10 px-2.5 py-1 rounded-md uppercase tracking-widest">
                Individual Verified Portfolio File
              </span>
              <button 
                onClick={() => setSelectedProperty(null)}
                className="p-1.5 text-stone-500 hover:text-[#DC2626] hover:bg-red-50 rounded-xl transition duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-display font-black text-[#18452E] leading-tight mb-2.5">
              {selectedProperty.title}
            </h2>

            <div className="flex items-center text-xs text-stone-500 mb-5 font-semibold">
              <MapPin className="w-4 h-4 text-[#C9A84C] mr-1.5 shrink-0" />
              <span>{selectedProperty.location} (State: <strong className="text-[#18452E] font-bold">{selectedProperty.state}</strong>)</span>
            </div>

            {/* Main high-res Photo Gallery */}
            <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden bg-stone-50 mb-3 shadow-md group">
              <img 
                src={selectedProperty.photos[galleryIndex]} 
                alt={`${selectedProperty.title} - ${galleryIndex}`} 
                className="w-full h-full object-cover transition-all duration-700 hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-[9px] font-mono font-black tracking-widest px-2.5 py-1 rounded-md">
                IMAGE {galleryIndex + 1} OF {selectedProperty.photos.length}
              </div>
            </div>

            {/* Thumbnails row */}
            <div className="flex space-x-2.5 mb-8 overflow-x-auto pb-1 scrollbar-thin">
              {selectedProperty.photos.map((ph, idx) => (
                <button
                  key={idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`w-16 h-12 rounded-xl overflow-hidden border transition-all duration-300 shrink-0 ${
                    galleryIndex === idx ? 'ring-2 ring-[#C9A84C] opacity-100 scale-102' : 'border-stone-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={ph} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Elegant Sub-navigation Tabs for Property Medical Record Concept */}
            <div className="flex border-b border-stone-200 mb-8 gap-6 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setDetailTab('details')}
                className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  detailTab === 'details'
                    ? 'border-[#18452E] text-[#18452E]'
                    : 'border-transparent text-stone-500 hover:text-[#18452E]'
                }`}
              >
                Aesthetic & Specifications
              </button>
              
              <button
                onClick={() => setDetailTab('timeline')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  detailTab === 'timeline'
                    ? 'border-[#18452E] text-[#18452E]'
                    : 'border-transparent text-stone-500 hover:text-[#18452E]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Lifetime Timeline</span>
              </button>

              <button
                onClick={() => setDetailTab('history')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  detailTab === 'history'
                    ? 'border-[#18452E] text-[#18452E]'
                    : 'border-transparent text-stone-500 hover:text-[#18452E]'
                }`}
                title="This history is permanent and cannot be edited or deleted."
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Audit History</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase scale-90">Permanent</span>
              </button>
            </div>

            {detailTab === 'details' && (
              <div className="space-y-8 animate-fade-in">
                {/* Embedded Walkthrough YouTube Video Container */}
                {selectedProperty.youtubeTourUrl && (
                  <div className="bg-[#F0F8F4]/40 border border-[#18452E]/10 rounded-2xl p-5 shadow-xs">
                    <span className="block text-[10px] font-mono font-black uppercase tracking-widest text-[#18452E] mb-3.5 flex items-center">
                      <Play className="w-3.5 h-3.5 text-rose-600 mr-2 fill-rose-600 animate-pulse" />
                      Property Walkthrough, Filmed by Unity Homes and Properties Ltd.
                    </span>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={selectedProperty.youtubeTourUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Clickable Embedded Google Map */}
                <div className="bg-[#F0F8F4]/40 border border-[#18452E]/10 rounded-2xl p-5">
                  <span className="block text-[10px] font-mono font-black uppercase tracking-widest text-[#18452E] mb-3 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-[#18452E] mr-2" />
                    Verified Location
                  </span>
                  <p className="text-sm font-semibold text-[#18452E] mb-4">
                    {selectedProperty.mapsPinLabel}
                  </p>
                  
                  <div className="relative h-64 rounded-xl overflow-hidden border border-stone-200/50 shadow-sm">
                    <iframe 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProperty.mapsPinLabel)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-[10px] text-stone-500 italic mt-2.5 leading-relaxed font-light">
                    Disclaimer: The coordinates shown conform precisely to official registrar listings. However, Unity Homes strongly recommends booking a physical walk-around before committing to transfers.
                  </p>
                </div>

                {/* Rental detail values / breakdown */}
                <div className="bg-[#18452E]/5 rounded-2xl border border-stone-200/60 p-6">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#18452E] mb-4">Transparent Fee Breakdown</h3>
                  
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-stone-200/80">
                          <th className="pb-2 text-xs font-bold text-[#18452E]">Fee Name</th>
                          <th className="pb-2 text-xs font-bold text-[#18452E]">Amount</th>
                          <th className="pb-2 text-xs font-bold text-[#18452E]">What This Covers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200/50">
                        {selectedProperty.feeBreakdown.map((fee, fIdx) => (
                          <tr key={fIdx} className="hover:bg-white/30 transition-colors">
                            <td className="py-3 text-xs text-stone-500 font-medium pr-4">{fee.label}</td>
                            <td className="py-3 text-xs font-mono font-bold text-[#18452E] whitespace-nowrap pr-4">₦{fee.amount.toLocaleString()}</td>
                            <td className="py-3 text-xs text-stone-500 leading-relaxed">{fee.explanation || 'Standard fee associated with this property.'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Stacked Cards View */}
                  <div className="md:hidden space-y-3">
                    {selectedProperty.feeBreakdown.map((fee, fIdx) => (
                      <div key={fIdx} className="bg-white/50 p-4 rounded-xl border border-stone-200/50 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-stone-500 font-medium block">{fee.label}</span>
                          <span className="text-xs font-mono font-bold text-[#18452E] whitespace-nowrap">₦{fee.amount.toLocaleString()}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 leading-relaxed pt-1 border-t border-stone-200/40">
                          <strong className="text-[#18452E] font-semibold">Covers:</strong> {fee.explanation || 'Standard fee associated with this property.'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total check */}
                  <div className="flex justify-between items-center text-xs font-bold pt-4 mt-4 border-t-2 border-stone-200 text-[#18452E]">
                    <span className="uppercase tracking-wider">Total Due Year 1</span>
                    <span className="text-base font-mono font-black">
                      ₦{selectedProperty.feeBreakdown.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Confirmed Amenities box */}
                <div>
                  <h3 className="font-display font-black text-xs uppercase text-[#18452E] tracking-wider mb-3.5">
                    Confirmed Checked Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Generator', 'Borehole', 'Water Supply', 'Security', 'Parking', 'Prepaid Meter', 'Fence'].map((amen) => {
                      const isPresent = selectedProperty.amenities.some(a => a.toLowerCase().includes(amen.toLowerCase()) || amen.toLowerCase().includes(a.toLowerCase()));
                      return (
                        <div key={amen} className={`flex items-center space-x-2.5 text-xs font-semibold ${isPresent ? 'text-[#18452E]' : 'text-stone-400 opacity-60'}`}>
                          {isPresent ? (
                            <span className="w-5 h-5 bg-[#F0F8F4] text-[#18452E] rounded-lg flex items-center justify-center shrink-0 text-[10px] font-extrabold shadow-xs">
                              ✓
                            </span>
                          ) : (
                            <span className="w-5 h-5 bg-stone-50 text-stone-400 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold">
                              -
                            </span>
                          )}
                          <span>{amen}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Exact Points Rules Box Conforming to STEP 9 SPEC */}
                <div className="p-5 bg-amber-50/50 border-l-[5px] border-[#18452E] rounded-r-2xl shadow-xs">
                  <span className="block font-mono font-black text-[10px] uppercase tracking-wider text-[#18452E] mb-3 flex items-center">
                    <ShieldCheck className="w-4 h-4 text-[#18452E] mr-1.5 shrink-0" />
                    UNITY TENANCY DIRECT OPERATING CHARTER
                  </span>
                  <ol className="list-decimal list-inside space-y-2.5 text-xs text-[#18452E] leading-relaxed font-light">
                    <li><strong className="font-semibold text-[#18452E]">Unity Homes manages this property directly</strong>, you will not deal with a third party agent.</li>
                    <li>The address shown has been confirmed, visit independently before paying anything.</li>
                    <li>All fees are as displayed, report any additional requested fee immediately.</li>
                    <li>Before making any rent payment after moving in, you must confirm the account name in your tenant dashboard matches your landlord&apos;s legal name.</li>
                    <li>Unity Homes does not collect rent directly, it is paid to a verified account and we confirm and track it.</li>
                    <li>Caution deposits are fully refundable subject to property condition and Unity Homes mediates any dispute.</li>
                  </ol>
                </div>

                {/* Request Viewing Form */}
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-6">
                  <h3 className="font-display font-black text-[#18452E] text-sm uppercase tracking-wider mb-4">Request Secure Site Viewing</h3>
                  
                  {formSubmitted ? (
                    <div className="bg-[#F0F8F4] text-[#18452E] border border-stone-200 p-5 rounded-2xl flex flex-col items-center text-center space-y-2.5 shadow-xs">
                      <span className="text-2xl animate-bounce">🎉</span>
                      <h4 className="font-bold text-sm">Site Request Logged Successfully!</h4>
                      <p className="text-xs text-stone-500 font-light leading-relaxed">
                        Hello, {formData.fullName}. Your request to view on <strong className="text-[#18452E] font-semibold">{formData.preferredDate}</strong> has been logged to our administrator. An intro will follow shortly.
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="text-white bg-[#18452E] hover:bg-[#18452E] text-xs font-bold px-4 py-2 rounded-xl mt-2 cursor-pointer transition-colors"
                      >
                        Send Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold text-[#18452E] uppercase tracking-widest mb-1.5">Your Full Name*</label>
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-[#18452E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all"
                            placeholder="Emeka Okafor"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold text-[#18452E] uppercase tracking-widest mb-1.5">Phone Number*</label>
                          <input
                            type="text"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-[#18452E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all"
                            placeholder="+234 812..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold text-[#18452E] uppercase tracking-widest mb-1.5">Email Address*</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-[#18452E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all"
                            placeholder="emeka@mail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold text-[#18452E] uppercase tracking-widest mb-1.5">Preferred Date*</label>
                          <input
                            type="date"
                            required
                            value={formData.preferredDate}
                            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-[#18452E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-[#18452E] uppercase tracking-widest mb-1.5">Country of Residence</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-[#18452E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all"
                          placeholder="Nigeria, UK, USA"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-[#18452E] uppercase tracking-widest mb-1.5">Add Note or Schedule Preference</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-[#18452E] font-semibold h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all"
                          placeholder="Share viewing time windows or questions..."
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#18452E] hover:bg-[#18452E] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-md hover:shadow-sm transition-all duration-300 hover:scale-[1.01]"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log Site Viewing Request</span>
                      </button>
                      <p className="text-[10px] text-center text-stone-500 font-light">
                        *Submitting this will immediately register a viewing task in our Admin Dashboard.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            )}

            {detailTab === 'timeline' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center space-x-2 pb-2 border-b border-stone-200">
                  <Clock className="w-5 h-5 text-[#18452E]" />
                  <h3 className="text-sm font-display font-black text-[#18452E] uppercase tracking-wider">
                    Property Lifetime Chronicle
                  </h3>
                </div>
                
                <p className="text-xs text-stone-500 leading-relaxed">
                  Every building in the Unity Homes network maintains an unalterable chronicle detailing physical milestones, structural safety verifications, legal clearances, and lease cycles.
                </p>

                {/* Horizontal Scrollable Timeline View */}
                <div className="relative mt-8">
                  {/* Decorative timeline backbone line */}
                  <div className="absolute top-[35px] left-8 right-8 h-0.5 bg-[#E2E8E4]" />
                  
                  <div className="flex overflow-x-auto gap-8 pb-6 pt-2 snap-x scrollbar-thin">
                    {(() => {
                      const isObioraIkeja = selectedProperty.title.toLowerCase().includes('ikeja') || selectedProperty.title.toLowerCase().includes('obiora');
                      if (isObioraIkeja) {
                        return [
                          {
                            date: "12 Nov 2024",
                            title: "Property Added",
                            description: "Chief Emeka Obiora's premium Ikeja GRA property was successfully registered and checked into the platform.",
                            icon: ShieldCheck
                          },
                          {
                            date: "01 Dec 2024",
                            title: "First Tenant Onboarded",
                            description: "Tenant successfully checked in and onboarded after passing absolute KYC verification.",
                            icon: CheckSquare
                          },
                          {
                            date: "05 Dec 2024",
                            title: "First Rent Confirmed",
                            description: "Rent payment cleared and verified with instant routing to Chief Emeka Obiora's account.",
                            icon: Lock
                          },
                          {
                            date: "12 Mar 2025",
                            title: "Maintenance Request (Plumbing)",
                            description: "First plumbing repairs requested by tenant and resolved within 24 hours.",
                            icon: Wrench
                          },
                          {
                            date: "18 Aug 2025",
                            title: "Maintenance Request (HVAC)",
                            description: "Second maintenance request: Routine AC servicing and filter replacements carried out by certified HVAC vendor.",
                            icon: Wrench
                          },
                          {
                            date: "12 Apr 2026",
                            title: "Lease Renewal",
                            description: "Lease term successfully renewed for another calendar year with adjusted terms approved.",
                            icon: Lock
                          },
                          {
                            date: "15 Jun 2026",
                            title: "Formal Notice Issued",
                            description: "Formal notice regarding structural integrity and compliance check issued.",
                            icon: AlertTriangle
                          }
                        ];
                      }
                      return [
                        {
                          date: "15 Oct 2024",
                          title: "Structural Shell Complete",
                          description: "Standard structural checklist cleared by accredited engineers. Foundational integrity confirmed.",
                          icon: ShieldCheck
                        },
                        {
                          date: "12 Nov 2024",
                          title: "Acquired & Verified",
                          description: "Land registry deed check completed. Property entered into Unity Homes verified asset roster.",
                          icon: ShieldCheck
                        },
                        {
                          date: "05 Dec 2024",
                          title: "Digital Ledger Initialized",
                          description: "IoT utility metering configured. Immutable activity tracking enabled for the lifetime record.",
                          icon: Cpu
                        },
                        {
                          date: "18 Jan 2025",
                          title: "Utility & Fire Inspection",
                          description: "Pre-occupancy health audit complete. Water treatment system checked and approved.",
                          icon: Wrench
                        },
                        {
                          date: "12 Apr 2025",
                          title: "Inaugural Tenancy Lease",
                          description: "Rental ledger created. Verified lease contract executed with initial check-in log completed.",
                          icon: CheckSquare
                        },
                        {
                          date: "15 Aug 2025",
                          title: "Preventative Systems Audit",
                          description: "Complete HVAC diagnostic, generator servicing, and wiring checks cleared.",
                          icon: Wrench
                        },
                        {
                          date: "12 Apr 2026",
                          title: "Tenancy Lease Renewed",
                          description: "Lease term successfully extended. Permanent audit ledger updated securely.",
                          icon: Lock
                        }
                      ];
                    })().map((milestone, mIdx) => {
                      const IconComp = milestone.icon;
                      return (
                        <div key={mIdx} className="shrink-0 w-64 snap-start relative group">
                          {/* Circle dot marker */}
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F0F8F4] text-[#18452E] border-2 border-[#18452E] relative z-10 mx-auto transition-transform duration-300 group-hover:scale-110 shadow-sm">
                            <IconComp className="w-4 h-4" />
                          </div>
                          
                          {/* Card Content */}
                          <div className="mt-4 bg-stone-50/60 hover:bg-white border border-stone-200 rounded-xl p-4 text-center space-y-1.5 transition-all duration-300 hover:shadow-md">
                            <span className="block font-mono text-[9px] font-black tracking-widest text-[#C9A84C] uppercase">
                              {milestone.date}
                            </span>
                            <h4 className="font-display font-extrabold text-[#18452E] text-xs">
                              {milestone.title}
                            </h4>
                            <p className="text-[10px] text-stone-500 leading-relaxed font-light line-clamp-3">
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-[#F0F8F4] border border-[#18452E]/10 rounded-xl flex items-start gap-3 mt-4 text-xs">
                  <Info className="w-4 h-4 text-[#18452E] shrink-0 mt-0.5" />
                  <p className="text-[#18452E] leading-relaxed">
                    This property timeline details physical events. To check transactional modifications or compliance status checks, select the <strong className="font-semibold">Audit History</strong> tab.
                  </p>
                </div>
              </div>
            )}

            {detailTab === 'history' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-display font-black text-[#18452E] uppercase tracking-wider">
                      Immutable Property Ledger
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-1 rounded-md uppercase">
                    Permanent Record
                  </span>
                </div>
                
                <p className="text-xs text-stone-500 leading-relaxed">
                  Under the <strong className="font-semibold text-[#18452E]">Property as Permanent Medical Record</strong> principle, every lifecycle modification, payment registration, and maintenance log is permanently logged below and cannot be modified by anyone on the platform.
                </p>

                <ImmutableHistory recordId={selectedProperty.id} recordType="Property" />
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
