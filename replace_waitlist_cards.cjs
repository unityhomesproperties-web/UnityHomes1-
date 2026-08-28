const fs = require('fs');

let content = fs.readFileSync('src/pages/WaitlistPage.tsx', 'utf8');

const regex = /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">.*?<\/div>\s*<\/div>\s*<\/motion\.div>/s;

const replacement = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ROLES_DISPLAY.map((role) => {
                      const selected = data.role === role.id;
                      return (
                        <div 
                          key={role.id}
                          onClick={() => { updateData('role', role.id); setDirection(1); }}
                          className={\`relative cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-h-[220px] group \${selected ? 'ring-4 ring-[#008D24] ring-offset-2' : 'hover:shadow-xl'}\`}
                        >
                          {/* Background Image & Green Overlay */}
                          <div className="absolute inset-0 z-0">
                            <img src={role.img} alt={role.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className={\`absolute inset-0 transition-colors duration-300 \${selected ? 'bg-[#6FBE45]/90' : 'bg-[#6FBE45]/75 group-hover:bg-[#6FBE45]/85'}\`} />
                          </div>
                          
                          {selected && (
                            <div className="absolute top-4 right-4 z-20 bg-white text-[#008D24] p-1.5 rounded-full shadow-md">
                              <Check className="w-5 h-5" />
                            </div>
                          )}

                          <div className="relative z-10 p-6 flex flex-col h-full justify-end text-white">
                            <h3 className="font-bold text-xl mb-2 drop-shadow-md">{role.title}</h3>
                            <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm">{role.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/WaitlistPage.tsx', content);
console.log('Successfully updated the WaitlistPage cards');
