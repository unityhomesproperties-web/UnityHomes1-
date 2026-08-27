const fs = require('fs');

let content = fs.readFileSync('src/pages/WaitlistPage.tsx', 'utf8');

// Change accent color to #008D24 (previously mostly #6FBE45 and #2F8D46)
// We'll replace them everywhere in the file except when they are strictly unrelated.
content = content.replace(/#6FBE45/g, '#008D24');
content = content.replace(/#2F8D46/g, '#008D24');

// Make currentStep start at 0
content = content.replace(
    'const [currentStep, setCurrentStep] = useState(1);',
    'const [currentStep, setCurrentStep] = useState(0);'
);

// Add images to ROLES_DISPLAY
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

// We need to replace the entire return block to implement the new UI.
// So let's isolate the return block.
const returnIndex = content.indexOf('return (\n    <div className="min-h-screen bg-[var(--color-surface-light)] font-sans">');
if (returnIndex === -1) {
    console.log("Could not find the return block start");
} else {
    // Keep everything before the return block
    const beforeReturn = content.substring(0, returnIndex);
    
    const newRender = `return (
    <div className="min-h-screen font-sans bg-black relative">
      
      {/* Background Images based on Step */}
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
        {currentStep === 1 && (
          <motion.div 
            key="step1"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" alt="Modern home exterior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div 
            key="step2"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80" alt="Laptop" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div 
            key="step3"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={data.role ? ROLES_DISPLAY.find(r => r.id === data.role)?.img : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"} alt="Role specific" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          </motion.div>
        )}
        {currentStep === 4 && (
          <motion.div 
            key="step4"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80" alt="Property exterior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          </motion.div>
        )}
        {currentStep === 5 && (
          <motion.div 
            key="step5"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80" alt="Review" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {currentStep === 0 && (
          <div className="min-h-screen flex flex-col justify-end pb-24 px-6 md:px-12 lg:px-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl"
            >
              <h1 className="text-white text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                Real Estate Should Be Easier.
              </h1>
              <p className="text-white/90 text-xl md:text-2xl font-normal mb-10 max-w-2xl">
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
          <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              
              {/* Back Button (if not submitting and step > 1) */}
              {currentStep > 1 && !isSubmitting && (
                <button 
                  onClick={handleBack}
                  className="mb-6 flex items-center text-white/90 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              )}
              {currentStep === 1 && !isSubmitting && (
                <button 
                  onClick={() => setCurrentStep(0)}
                  className="mb-6 flex items-center text-white/90 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              )}

              {currentStep === 1 ? (
                /* Step 1: Role Selection (Grid of Cards) */
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 shadow-sm">Who are you?</h2>
                  <p className="text-white/90 mb-10 text-lg">Select the role that best describes you to continue.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ROLES_DISPLAY.map((role) => {
                      const selected = data.role === role.id;
                      return (
                        <div 
                          key={role.id}
                          onClick={() => updateData('role', role.id as WaitlistRole)}
                          className={\`cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 \${selected ? 'ring-4 ring-[#008D24]' : 'hover:shadow-xl'}\`}
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
                    })}
                  </div>
                  
                  {errors.role && (
                    <p className="text-red-400 mt-4 font-medium">{errors.role}</p>
                  )}

                  <div className="mt-10 flex justify-end">
                    <button
                      onClick={handleNext}
                      className="bg-[#008D24] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-[#007a1f] transition-all flex items-center"
                    >
                      Continue <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Steps 2-5: Forms in a floating white card */
                <motion.div
                  key="form-steps"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-12 max-w-4xl mx-auto"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-[#132A1D] mb-8">{steps[currentStep - 1].title}</h2>
                  
                  {/* Reuse existing form logic rendering */}
                  <div className="form-content">
                    {/* Inject original form step content here */}
                    {/* To do this dynamically via string replacement, I'll insert a placeholder and replace it next */}
                    FORM_CONTENT_PLACEHOLDER
                  </div>
                  
                  <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={currentStep === 5 ? handleSubmit : handleNext}
                      disabled={isSubmitting}
                      className="bg-[#008D24] text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:bg-[#007a1f] transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          {currentStep === 5 ? 'Submit Application' : 'Continue'} 
                          {currentStep !== 5 && <ChevronRight className="w-5 h-5 ml-2" />}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;

    // Extract the original form rendering logic for step 2, 3, 4, 5
    // The original logic switches on currentStep inside AnimatePresence in Application Workspace
    let originalForms = '';
    const step2Match = content.match(/\{\/\* Step 2: Basic Info \*\/\}([\s\S]*?)\]\}\s+<\/div>\s+<\/motion\.div>/);
    const step3Match = content.match(/\{\/\* Step 3: Role Specific Info \*\/\}([\s\S]*?)\]\}\s+<\/div>\s+<\/motion\.div>/);
    const step4Match = content.match(/\{\/\* Step 4: Service Preference \*\/\}([\s\S]*?)(?:<div className="pt-2">|\]\}\s+<\/div>\s+<\/motion\.div>)/);
    const step5Match = content.match(/\{\/\* Step 5: Review \*\/\}([\s\S]*?)<\/div>\s+<\/div>\s+<\/motion\.div>/);
    
    // Instead of regex matching, it's safer to extract exactly what we need, which is the switch(currentStep) part or just re-using the logic.
    // WaitlistPage.tsx has a switch or if/else block inside <AnimatePresence mode="wait"> for steps.
    // Let's grab the content inside the "Form Area" from WaitlistPage.tsx.
    
    let formAreaContent = "";
    
    // Step 2
    const s2Start = content.indexOf('{currentStep === 2 && (');
    const s2End = content.indexOf('{currentStep === 3 && (');
    
    // Step 3
    const s3End = content.indexOf('{currentStep === 4 && (');
    
    // Step 4
    const s4End = content.indexOf('{currentStep === 5 && (');
    
    // Step 5
    const s5End = content.indexOf('</AnimatePresence>', s4End);
    
    if (s2Start !== -1 && s2End !== -1 && s3End !== -1 && s4End !== -1 && s5End !== -1) {
        let form2 = content.substring(content.indexOf('<div className="space-y-6">', s2Start), s2End);
        // Trim trailing tags to just get the fields
        form2 = form2.replace(/<\/motion\.div>\s*\}\)\s*$/m, '');
        
        let form3 = content.substring(content.indexOf('<div className="space-y-8">', s2End), s3End);
        form3 = form3.replace(/<\/motion\.div>\s*\}\)\s*$/m, '');
        
        let form4 = content.substring(content.indexOf('<div className="space-y-8">', s3End), s4End);
        form4 = form4.replace(/<\/motion\.div>\s*\}\)\s*$/m, '');
        
        let form5 = content.substring(content.indexOf('<div className="space-y-10">', s4End), s5End);
        form5 = form5.replace(/<\/motion\.div>\s*\}\)\s*$/m, '');
        
        formAreaContent = `
          {currentStep === 2 && (
            <div className="animate-fade-in">
              ${form2.split('</motion.div>')[0]}
            </div>
          )}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              ${form3.split('</motion.div>')[0]}
            </div>
          )}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              ${form4.split('</motion.div>')[0]}
            </div>
          )}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              ${form5.split('</motion.div>')[0]}
              
              {submitError && (
                <div className="p-5 bg-[#FDEDED] border border-[#F5C2C7] rounded-[18px] text-[#842029] font-medium text-sm mt-6">
                  {submitError}
                </div>
              )}
            </div>
          )}
        `;
        
        // Clean up unmatched tags
        formAreaContent = formAreaContent.replace(/<AnimatePresence mode="wait">/g, '');
        formAreaContent = formAreaContent.replace(/<\/AnimatePresence>/g, '');
        
        const completeNewRender = newRender.replace('FORM_CONTENT_PLACEHOLDER', formAreaContent);
        
        // Remove BannerAnimation if it exists
        const cleanedBeforeReturn = beforeReturn.replace(/const BannerAnimation = \(\) => \{[\s\S]*?return \([\s\S]*?\}\);/m, '');
        
        fs.writeFileSync('src/pages/WaitlistPage.tsx', cleanedBeforeReturn + completeNewRender);
        console.log("WaitlistPage.tsx successfully updated.");
    } else {
        console.log("Failed to find step boundaries.");
    }
}
