import re

with open('src/components/ProfessionalsPage.tsx', 'r') as f:
    content = f.read()

replacement = """              {filteredProfs.map((prof) => (
                <div
                  key={prof.id}
                  className="bg-white rounded-[28px] border border-[#0E2F1F]/[0.06] p-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:shadow-xl transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Avatar: Soft green square Rounded Large initials */}
                      <div className="w-[80px] h-[80px] rounded-[24px] bg-[#2F8D46]/10 text-[#2F8D46] flex items-center justify-center font-[700] text-3xl shrink-0">
                        {getInitials(prof.name)}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-[#C9A84C] fill-[#C9A84C]" />
                          <span className="text-[14px] font-[600] text-[#132A1D]">5.0</span>
                        </div>
                        {/* Verified badge */}
                        <span className="flex items-center text-[12px] font-[600] text-[#2F8D46] px-2 py-1 bg-[#2F8D46]/10 rounded-full border border-[#2F8D46]/20">
                          <Shield className="w-3.5 h-3.5 mr-1" />
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Meta information */}
                    {/* Professional Name Large Dark Green */}
                    <h3 className="font-[700] text-[#0E2F1F] text-[24px] leading-tight mb-1">
                      {prof.name}
                    </h3>
                    {/* Company Grey */}
                    <p className="text-[16px] text-[#6B7280] font-[400] mb-3">
                      {prof.companyName || 'Independent Professional'}
                    </p>

                    <div className="space-y-3">
                      {/* Location: Green location icon */}
                      <div className="flex items-center text-[14px] text-[#6B7280]">
                        <MapPin className="w-4 h-4 text-[#2F8D46] mr-2 shrink-0" />
                        <span>{prof.statesCovered.join(', ')}</span>
                      </div>
                      
                      {/* Specialization: Soft green pill */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-3 py-1 bg-[#2F8D46]/10 text-[#2F8D46] text-[13px] font-[600] rounded-full">
                          {prof.category}
                        </span>
                        {prof.tags.slice(0, 1).map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-stone-100 text-[#6B7280] text-[13px] font-[500] rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-8 flex items-center space-x-3">
                    {/* Primary CTA */}
                    <button
                      onClick={() => setChoicePromptProf(prof)}
                      className="flex-1 h-[56px] bg-[#0E2F1F] hover:bg-[#18452E] text-white font-[600] text-[16px] rounded-[18px] transition cursor-pointer"
                    >
                      View Profile
                    </button>
                    {/* Secondary action: Outlined Mail icon */}
                    <button
                      onClick={() => setChoicePromptProf(prof)}
                      className="w-[56px] h-[56px] shrink-0 border border-[#0E2F1F]/20 text-[#0E2F1F] hover:bg-[#0E2F1F] hover:text-white rounded-[18px] flex items-center justify-center transition cursor-pointer"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}"""

pattern = re.compile(r'\{\s*filteredProfs\.map\(\(prof\)\s*=>\s*\(\s*<div\s*key=\{prof\.id\}.*?\{/\*\s*INDIVIDUAL CHOICE PROMPT MODAL', re.DOTALL)
# Keep the INDIVIDUAL CHOICE PROMPT MODAL comment at the end of replacement
new_content = pattern.sub(replacement + '\n            {/* INDIVIDUAL CHOICE PROMPT MODAL', content)

with open('src/components/ProfessionalsPage.tsx', 'w') as f:
    f.write(new_content)
