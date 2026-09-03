const fs = require('fs');

let content = fs.readFileSync('src/components/WaitlistModal.tsx', 'utf8');

// 1. Add to type WaitlistRole
content = content.replace(
  "| 'structural_engineer';",
  "| 'structural_engineer'\n  | 'agent';"
);

// 2. Add to ROLES_DISPLAY
const rolesDisplayOld = "  { id: 'structural_engineer', title: 'Structural Engineer', desc: 'I provide structural engineering services.', img: \"/images/structural_engineer.jpg\" }";
const rolesDisplayNew = "  { id: 'structural_engineer', title: 'Structural Engineer', desc: 'I provide structural engineering services.', img: \"/images/structural_engineer.jpg\" },\n  { id: 'agent', title: 'Real Estate Agent', desc: 'I actively find, show, and let properties for landlords and want to bring my listings to a verified, transparent platform.', img: \"/images/agent.jpg\" }";
content = content.replace(rolesDisplayOld, rolesDisplayNew);

// 3. Validation logic
const validationOld = "} else if (['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role)) {";
const validationNew = `} else if (data.role === 'agent') {
      if (!rsd.business_name) errors.business_name = 'Please enter your business or practice name.';
      
      const trimmedRegistration = (rsd.registration_number || '').trim();
      if (!trimmedRegistration) {
        if (data.state === 'Lagos') {
          errors.registration_number = 'Please enter your LASRERA registration number.';
        } else {
          errors.registration_number = 'Please enter your registration number.';
        }
      }
      if (!rsd.years_active) errors.years_active = 'Please enter your years active.';
      else if (parseInt(rsd.years_active) < 0) errors.years_active = 'Please enter a valid number of years.';
      
      if (!rsd.consent) errors.consent = 'You must consent to the verification process to continue.';
    } else if (['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role)) {`;
content = content.replace(validationOld, validationNew);

// 4. Form rendering for Step 3
const step3Old = "{/* Professionals */}\n                        {['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role) && (";

const step3New = `{/* Agent */}
                        {data.role === 'agent' && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Business or Practice Name</label>
                              <input 
                                type="text" 
                                value={data.role_specific_data.business_name || ''}
                                onChange={(e) => updateData('role_specific_data.business_name', e.target.value)}
                                onBlur={() => handleBlur('business_name')}
                                className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] font-medium"
                              />
                              {renderError('business_name', currentErrors)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">
                                  {data.state === 'Lagos' ? 'LASRERA Registration Number' : 'Registration Number, if applicable in your state'}
                                </label>
                                <input 
                                  type="text" 
                                  value={data.role_specific_data.registration_number || ''}
                                  onChange={(e) => updateData('role_specific_data.registration_number', e.target.value.trimStart())}
                                  onBlur={() => handleBlur('registration_number')}
                                  className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] font-medium"
                                />
                                {renderError('registration_number', currentErrors)}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Years Active as an Agent</label>
                                <input 
                                  type="number" min="0"
                                  value={data.role_specific_data.years_active || ''}
                                  onChange={(e) => updateData('role_specific_data.years_active', e.target.value)}
                                  onBlur={() => handleBlur('years_active')}
                                  className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] font-medium"
                                />
                                {renderError('years_active', currentErrors)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Number of properties currently managing or listing elsewhere (Optional)</label>
                              <input 
                                type="number" min="0"
                                value={data.role_specific_data.properties_managed_elsewhere || ''}
                                onChange={(e) => updateData('role_specific_data.properties_managed_elsewhere', e.target.value)}
                                className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] font-medium"
                              />
                            </div>
                            
                            <div className="pt-4">
                              <label className="flex items-start cursor-pointer group">
                                <div className="mt-1 relative flex items-center justify-center min-w-[48px] min-h-[48px] shrink-0">
                                  <input 
                                    type="checkbox"
                                    className="sr-only"
                                    checked={data.role_specific_data.consent || false}
                                    onChange={(e) => updateData('role_specific_data.consent', e.target.checked)}
                                    onBlur={() => handleBlur('consent')}
                                  />
                                  <div className={\`w-6 h-6 rounded border flex items-center justify-center transition-colors \${
                                    data.role_specific_data.consent 
                                      ? 'border-[#6FBE45] bg-[#6FBE45]' 
                                      : 'border-gray-300 bg-white group-hover:border-[#6FBE45]'
                                  }\`}>
                                    {data.role_specific_data.consent && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                </div>
                                <div className="ml-2 mt-3">
                                  <span className="block text-[var(--color-text-primary)] font-semibold mb-1 leading-relaxed">
                                    I consent to Unity Homes verifying my registration and eligibility with the appropriate state real estate regulatory authority before being approved to list properties on Unity Homes.
                                  </span>
                                  <span className="block text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    Verification does not guarantee approval. Final approval will only happen after review.
                                  </span>
                                </div>
                              </label>
                              {renderError('consent', currentErrors)}
                            </div>
                          </div>
                        )}

                        {/* Professionals */}
                        {['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role) && (`;
content = content.replace(step3Old, step3New);

// 5. Review formatting
const reviewOld1 = "<span className=\"block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider\">{key.replace(/_/g, ' ')}</span>";
const reviewNew1 = "<span className=\"block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider\">{key === 'properties_managed_elsewhere' ? 'Properties Currently Managing or Listing Elsewhere' : key === 'business_name' ? 'Business or Practice Name' : key === 'years_active' ? 'Years Active' : key.replace(/_/g, ' ')}</span>";
content = content.replace(reviewOld1, reviewNew1);

// Save
fs.writeFileSync('src/components/WaitlistModal.tsx', content);
console.log('Patched WaitlistModal.tsx successfully');
