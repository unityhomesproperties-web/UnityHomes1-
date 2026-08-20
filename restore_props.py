import re

with open('src/components/PropertiesPage.tsx', 'r') as f:
    content = f.read()

original_props = """              sortedProperties.map((prop) => {
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
                      isCurrent ? 'border-2 border-[#C9A84C] relative ring-2 ring-[#C9A84C]/10' : 'border-[#E2E8E4]'
                    }`}
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-slate-50 shrink-0">
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
                        <span className={`px-1.5 py-0.5 rounded bg-white text-[#0E2F1F] shadow-sm`}>
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
                        <h3 className="text-xs font-bold text-[#0E2F1F] mt-1 line-clamp-1">{prop.title}</h3>
                        <div className="flex items-center text-[10px] text-[#6B7280] mt-1">
                          <MapPin className="w-3 h-3 text-[#C9A84C] mr-1 shrink-0" />
                          <span className="line-clamp-1">{prop.location}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-stone-50 flex items-center justify-between text-[11px] text-[#6B7280]">
                        <div className="flex space-x-2 font-mono">
                          <span>{prop.bedrooms} Bed</span>
                          <span>&bull;</span>
                          <span>{prop.bathrooms} Bath</span>
                        </div>
                        <span className="text-[#18452E] font-bold flex items-center space-x-0.5">
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })"""

pattern = re.compile(r'\{\s*sortedProperties\.map\(\(prop\)\s*=>\s*\{.*?return\s*\(\s*<div.*?</div>\s*\);\s*\}\)\s*\}', re.DOTALL)
new_content = pattern.sub(original_props, content)

with open('src/components/PropertiesPage.tsx', 'w') as f:
    f.write(new_content)
