const fs = require('fs');

let content = fs.readFileSync('/tmp/WaitlistPage.tsx.bak', 'utf8');

content = content.replace(/#6FBE45/g, '#008D24');
content = content.replace(/#2F8D46/g, '#008D24');
content = content.replace(/var\(--color-surface-light\)/g, '#000000');

content = content.replace(
    'const [currentStep, setCurrentStep] = useState(1);',
    'const [currentStep, setCurrentStep] = useState(0);'
);

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

const returnStart = content.indexOf('return (\n    <div className="min-h-screen bg-[var(--color-surface-light)] font-sans">');
const beforeReturn = content.substring(0, returnStart);

const formSwitchStart = content.indexOf('<div className="mt-8 relative min-h-[400px]">');
let open = 0;
let formSwitchEnd = -1;
for (let i = formSwitchStart; i < content.length; i++) {
    if (content.substr(i, 4) === '<div') open++;
    if (content.substr(i, 5) === '</div') {
        open--;
        if (open === 0) {
            formSwitchEnd = i + 6;
            break;
        }
    }
}
const formSwitchBlock = content.substring(formSwitchStart, formSwitchEnd);

// Instead of string regex for currentStep===1 that might fail due to formatting or spaces, 
// let's do a reliable string replace since we know the exact string block.
const step1Start = formSwitchBlock.indexOf('{currentStep === 1 && (');
const step2Start = formSwitchBlock.indexOf('{currentStep === 2 && (');
const step1Block = formSwitchBlock.substring(step1Start, step2Start);

const newStep1 = `{currentStep === 1 && (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex-grow"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-[#132A1D] mb-2 shadow-sm">Who are you?</h2>
                  <p className="text-gray-600 mb-10 text-lg">Select the role that best describes you to continue.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ROLES_DISPLAY.map((role) => {
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
                    })}
                  </div>
                </motion.div>
              )}
              `;

let formSwitchModified = formSwitchBlock.split(step1Block).join(newStep1);

const newRender = `return (
    <div className="min-h-screen font-sans bg-black relative flex flex-col">
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
              currentStep === 3 ? (data.role ? ROLES_DISPLAY.find(r => r.id === data.role)?.img : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80") :
              "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80"
            } alt="Background" className="w-full h-full object-cover transition-all duration-700" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full flex-grow flex flex-col">
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
          <div className="py-12 px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
              
              {currentStep > 1 && !isSubmitting && (
                <button 
                  onClick={handleBack}
                  className="mb-6 self-start flex items-center text-white/90 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              )}
              {currentStep === 1 && !isSubmitting && (
                <button 
                  onClick={() => setCurrentStep(0)}
                  className="mb-6 self-start flex items-center text-white/90 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-12 w-full flex-grow"
              >
                
                FORM_CONTENT_PLACEHOLDER

                <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0 text-sm font-semibold text-gray-400">
                    Step {currentStep} of {steps.length}
                  </div>
                  <button
                    onClick={currentStep === 4 ? handleSubmit : handleNext}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#008D24] text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:bg-[#007a1f] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        {currentStep === 4 ? 'Submit Application' : 'Continue'} 
                        {currentStep !== 4 && <ChevronRight className="w-5 h-5 ml-2" />}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`;

// USE SPLIT JOIN FOR SAFETY!
const finalRender = newRender.split('FORM_CONTENT_PLACEHOLDER').join(formSwitchModified);

// Remove BannerAnimation safely
const bannerStart = beforeReturn.indexOf('const BannerAnimation');
let cleanedBeforeReturn = beforeReturn;
if (bannerStart !== -1) {
    const bannerEnd = beforeReturn.indexOf(');', bannerStart);
    if (bannerEnd !== -1) {
        cleanedBeforeReturn = beforeReturn.substring(0, bannerStart) + beforeReturn.substring(bannerEnd + 2);
    }
}

fs.writeFileSync('src/pages/WaitlistPage.tsx', cleanedBeforeReturn + finalRender);
console.log("Written successfully");
