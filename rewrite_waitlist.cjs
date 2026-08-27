const fs = require('fs');

let content = fs.readFileSync('/tmp/WaitlistPage.tsx.bak', 'utf8');

// Change currentStep state
content = content.replace(
    'const [currentStep, setCurrentStep] = useState(1);',
    'const [currentStep, setCurrentStep] = useState(0);'
);

content = content.replace(/#6FBE45/g, '#008D24');
content = content.replace(/#2F8D46/g, '#008D24');
content = content.replace(/var\(--color-surface-light\)/g, '#000000'); // make background black just in case

// We can just replace the `BannerAnimation` and progress sidebar.
// 1. Remove BannerAnimation and the header text
content = content.replace(/<div className="relative bg-\[#008D24\] pt-12 pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">[\s\S]*?<\/div>\s*<\/div>/, '');

// Now we need to wrap the whole thing with our backgrounds, intro step, etc.
// The easiest way is to find `return (` and inject our top-level structure.
content = content.replace('return (\n    <div className="min-h-screen bg-black font-sans">', `return (
    <div className="min-h-screen font-sans bg-black relative">
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div 
            key="step0"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" alt="Modern home exterior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </motion.div>
        )}
        {currentStep > 0 && currentStep < 5 && (
          <motion.div 
            key="form-bg"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={
              currentStep === 1 ? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" :
              currentStep === 2 ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80" :
              currentStep === 3 ? (data.role ? [
                  { id: 'property_seeker', img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80" },
                  { id: 'long_term_landlord', img: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80" },
                  { id: 'shortlet_landlord', img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80" },
                  { id: 'property_management_company', img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" },
                  { id: 'property_lawyer', img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80" },
                  { id: 'licensed_surveyor', img: "https://images.unsplash.com/photo-1541888086925-ebcf3819e933?auto=format&fit=crop&q=80" },
                  { id: 'structural_engineer', img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80" }
              ].find(r => r.id === data.role)?.img : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80") :
              "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80"
            } alt="Background" className="w-full h-full object-cover transition-all duration-700" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 w-full min-h-screen">
        {currentStep === 0 && (
          <div className="min-h-screen flex flex-col justify-end pb-24 px-6 md:px-12 lg:px-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl"
            >
              <h1 className="text-white text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight text-balance">
                Real Estate Should Be Easier.
              </h1>
              <p className="text-white/90 text-xl md:text-2xl font-normal mb-10 max-w-2xl text-balance">
                Join the Unity Homes waitlist and tell us how you'd like to be part of the platform.
              </p>
              <button 
                onClick={() => setCurrentStep(1)}
                className="bg-[#008D24] text-white px-10 py-5 rounded-full font-semibold text-xl shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:bg-[#007a1f] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1"
              >
                Join the Waitlist
              </button>
            </motion.div>
          </div>
        )}
        {currentStep > 0 && (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto w-full">
              {/* Added back button for intro */}
              {currentStep === 1 && !isSubmitting && (
                <button 
                  onClick={() => setCurrentStep(0)}
                  className="mb-6 self-start flex items-center text-white/90 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              )}
`);

// The issue now is modifying the form layout inside.
// WaitlistPage.tsx has `<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-24 relative z-20">`
content = content.replace(/<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-24 relative z-20">/, '<div>');
// Removing the split view (sidebar + form container)
content = content.replace(/<div className="bg-white rounded-\[24px\] shadow-sm border border-\[var\(--color-border\)\] flex flex-col md:flex-row overflow-hidden min-h-\[600px\]">/, '<div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-transparent overflow-hidden">');

// Removing the left panel:
// <div className="md:w-80 bg-stone-50 border-b md:border-b-0 md:border-r border-[var(--color-border)] p-6 md:p-10 flex-shrink-0">
// We need to just regex delete the whole left panel up to `<div className="flex-1 p-6 md:p-10 md:pl-12 flex flex-col">`
content = content.replace(/<div className="md:w-80 bg-stone-50[\s\S]*?<div className="flex-1 p-6 md:p-10 md:pl-12 flex flex-col">/, '<div className="flex-1 p-6 md:p-10 md:pl-12 flex flex-col">');

// Replace the image icons for the roles
content = content.replace(
    /const ROLES_DISPLAY = \[([\s\S]*?)\];/,
    `const ROLES_DISPLAY = [
  { id: 'property_seeker', title: 'Property Seeker', desc: "I'm looking for property or property-related help.", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80" },
  { id: 'long_term_landlord', title: 'Long-Term Landlord', desc: 'I want to list and/or manage long-term property.', img: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80" },
  { id: 'shortlet_landlord', title: 'Shortlet Landlord', desc: 'I want to list and/or manage shortlet property.', img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80" },
  { id: 'property_management_company', title: 'Property Management Company', desc: 'I manage properties on behalf of clients.', img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" },
  { id: 'property_lawyer', title: 'Property Lawyer', desc: 'I provide legal services for property transactions.', img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80" },
  { id: 'licensed_surveyor', title: 'Licensed Surveyor', desc: 'I provide professional surveying services.', img: "https://images.unsplash.com/photo-1541888086925-ebcf3819e933?auto=format&fit=crop&q=80" },
  { id: 'structural_engineer', title: 'Structural Engineer', desc: 'I provide structural engineering services.', img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80" }
];`
);

// We need to inject the role images into the actual role cards rendering!
// Find the map loop: {ROLES_DISPLAY.map((role) => {
content = content.replace(
    /\{ROLES_DISPLAY\.map\(\(role\) => \{[\s\S]*?return \([\s\S]*?<div[\s\S]*?className=\{`w-full text-left p-5 rounded-\[18px\] border \$\{selected \? 'border-\[#008D24\] bg-\[#EAF5E3\]' : 'border-\[var\(--color-border\)\] hover:border-gray-300 hover:bg-stone-50'\} transition-all duration-200`\}>[\s\S]*?<div className="flex justify-between items-start mb-2">[\s\S]*?<h3 className="font-semibold text-\[#132A1D\]">\{role\.title\}<\/h3>[\s\S]*?<div className=\{`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 \$\{selected \? 'border-\[#008D24\] bg-\[#008D24\]' : 'border-gray-300'\} transition-colors`\}>[\s\S]*?\{selected && <div className="w-2 h-2 rounded-full bg-white" \/>\}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<p className="text-sm text-gray-500 pr-8">\{role\.desc\}<\/p>[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}\)\}/,
    `{ROLES_DISPLAY.map((role) => {
                      const selected = data.role === role.id;
                      return (
                        <div 
                          key={role.id}
                          onClick={() => { updateData('role', role.id); setDirection(1); }}
                          className={\`cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 \${selected ? 'ring-4 ring-[#008D24]' : 'hover:shadow-xl border border-gray-100'}\`}
                        >
                          <div className="h-40 w-full relative">
                            <img src={role.img} alt={role.title} className="w-full h-full object-cover" />
                            {selected && (
                              <div className="absolute top-3 right-3 bg-[#008D24] text-white p-1 rounded-full shadow-md">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-[#132A1D] text-lg mb-1">{role.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{role.desc}</p>
                          </div>
                        </div>
                      );
                    })}`
);

// We need to change the grid for the cards to allow them to sit nicely.
content = content.replace(/<div className="space-y-4">/, '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">');

// Also, we must close the tags for our new layout wrapper correctly at the very bottom.
// We added `{currentStep > 0 && (<div className="py-12...` before `<div className="max-w-4xl...`
// And we replaced the big `div` which had 2 closing divs. We need to add one more `</div>` at the end of the return statement before `);`
content = content.replace(/<\/div>\s*<\/div>\s*\);\s*\}\s*$/m, '</div></div></div></div>\n  );\n}\n');

fs.writeFileSync('src/pages/WaitlistPage.tsx', content);
