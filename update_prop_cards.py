import re

with open('src/components/PropertiesPage.tsx', 'r') as f:
    content = f.read()

replacement = """              sortedProperties.map((prop) => {
                const isCurrent = selectedProperty?.id === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => handleOpenDetails(prop)}
                    className={`bg-white rounded-[28px] border transition-all overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] ${
                      isCurrent ? 'border-2 border-[#C9A84C]' : 'border-[#0E2F1F]/[0.06]'
                    }`}
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-slate-50 shrink-0">
                      <img 
                        src={prop.photos[0]} 
                        alt={prop.title} 
                        className="w-full h-full object-cover rounded-t-[28px]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 flex space-x-2">
                        {/* Verified Badge */}
                        <span className="flex items-center text-[11px] font-[600] px-2 py-1 bg-[#2F8D46]/10 text-[#2F8D46] rounded-full border border-[#2F8D46]/20 backdrop-blur-md">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                        {/* Property Type Pill */}
                        <span className="px-2 py-1 bg-white/90 text-[#0E2F1F] text-[11px] font-[600] rounded-full backdrop-blur-md shadow-sm">
                          {prop.type}
                        </span>
                      </div>
                      {/* Favorite Icon */}
                      <button 
                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-[#6B7280] hover:text-[#C9A84C] hover:bg-white transition shadow-sm"
                        onClick={(e) => { e.stopPropagation(); /* Add logic */ }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-grow">
                      <div>
                        {/* Property Title */}
                        <h3 className="text-[20px] font-[700] text-[#0E2F1F] mb-1 line-clamp-1">{prop.title}</h3>
                        {/* Location */}
                        <div className="flex items-center text-[14px] text-[#6B7280] mb-3">
                          <MapPin className="w-4 h-4 text-[#2F8D46] mr-1 shrink-0" />
                          <span className="line-clamp-1">{prop.location}</span>
                        </div>
                        {/* Price */}
                        <div className="mb-4">
                          <span className="text-[24px] font-[800] text-[#132A1D]">
                            {prop.type === 'Shortlet' ? `₦${prop.price.toLocaleString()}/night` : `₦${prop.price.toLocaleString()}/yr`}
                          </span>
                        </div>
                      </div>
                      
                      {/* Bedrooms / Bathrooms */}
                      <div className="pt-4 border-t border-[#0E2F1F]/[0.06] flex items-center space-x-6 text-[14px] text-[#6B7280] mb-6">
                        <div className="flex items-center space-x-1.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#0E2F1F]">
                            <path d="M3 7v1a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V7M3 13h18M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
                          </svg>
                          <span className="font-[600]">{prop.bedrooms} <span className="font-[400]">Beds</span></span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#0E2F1F]">
                            <path d="M9 11V6a3 3 0 0 1 6 0v5M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5z" />
                          </svg>
                          <span className="font-[600]">{prop.bathrooms} <span className="font-[400]">Baths</span></span>
                        </div>
                      </div>
                      
                      {/* Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                        <button
                          className="w-full h-[52px] bg-[#0E2F1F] hover:bg-[#18452E] text-white font-[600] text-[15px] rounded-[16px] transition cursor-pointer flex items-center justify-center"
                        >
                          View Property
                        </button>
                        <button
                          className="w-full h-[52px] bg-white border border-[#0E2F1F] text-[#0E2F1F] hover:bg-[#0E2F1F] hover:text-white font-[600] text-[15px] rounded-[16px] transition cursor-pointer flex items-center justify-center space-x-2"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })"""

pattern = re.compile(r'\{\s*sortedProperties\.map\(\(prop\)\s*=>\s*\{.*?return\s*\(\s*<div.*?</div>\s*\);\s*\}\)\s*\}', re.DOTALL)
new_content = pattern.sub(replacement + '\n              }', content)

with open('src/components/PropertiesPage.tsx', 'w') as f:
    f.write(new_content)
