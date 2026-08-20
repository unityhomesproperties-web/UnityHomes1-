import re

with open('src/components/ProfessionalsPage.tsx', 'r') as f:
    content = f.read()

original_prof = """              {filteredProfs.map((prof) => (
                <div
                  key={prof.id}
                  className="bg-white rounded-xl border border-[#E2E8E4] p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="relative w-16 h-16 rounded-full bg-[#0E2F1F] text-white flex items-center justify-center font-display font-black text-xl border-2 border-[#C9A84C] shadow-xs shrink-0">
                          <span>{getInitials(prof.name)}</span>
                          <div className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white rounded-full p-0.5 border-2 border-white shadow-xs">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        </div>
                        <span className="text-[9px] text-stone-400 font-mono mt-1 font-medium block text-center whitespace-nowrap">
                          Photo Coming Soon
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-0.5 rounded bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] font-mono font-bold uppercase tracking-wider">
                          {prof.category}
                        </span>
                        {prof.isFoundingMember && (
                          <span className="flex items-center text-[9px] font-mono font-bold text-[#C9A84C] mt-1.5 uppercase tracking-wide">
                            <Star className="w-3 h-3 text-[#C9A84C] fill-[#C9A84C] mr-0.5" />
                            Founding Member
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Meta information */}
                    <h3 className="font-display font-extrabold text-[#0E2F1F] text-base leading-tight">
                      {prof.name}
                    </h3>
                    <p className="text-[10px] font-mono tracking-wide text-stone-400 mt-1 uppercase">
                      Reg: {prof.regNumber} &bull; {prof.issuingBody}
                    </p>
                    <div className="mt-2.5 space-y-1">
                      <div className="text-xs text-[#6B7280]">
                        Experience: <strong className="text-[#0E2F1F]">{prof.experienceYears} Years Active</strong>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {prof.statesCovered.map((st) => (
                          <span key={st} className="px-2 py-0.5 border border-[#18452E]/20 rounded-full text-[9px] font-mono font-bold text-[#18452E]">
                            📍 {st}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-#6B7280 mt-4 leading-relaxed line-clamp-3">
                      {prof.bio}
                    </p>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenProfile(prof)}
                      className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-[#0E2F1F] text-xs font-bold rounded-xl transition text-center cursor-pointer border border-stone-200"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setChoicePromptProf(prof)}
                      className="py-2.5 px-3 bg-[#18452E] text-white hover:bg-[#0E2F1F] text-xs font-bold rounded-xl transition text-center cursor-pointer shadow-xs"
                    >
                      Get Connected
                    </button>
                  </div>
                </div>
              ))}"""

pattern = re.compile(r'\{\s*filteredProfs\.map\(\(prof\)\s*=>\s*\(\s*<div\s*key=\{prof\.id\}.*?<\/div>\s*\)\)\}', re.DOTALL)
new_content = pattern.sub(original_prof, content)

with open('src/components/ProfessionalsPage.tsx', 'w') as f:
    f.write(new_content)
