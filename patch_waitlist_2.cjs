const fs = require('fs');
let content = fs.readFileSync('src/components/WaitlistModal.tsx', 'utf8');

const step3Old = "{/* PROFESSIONALS */}\n                        {['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role) && (";

const step3New = `{/* AGENT */}
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

                        {/* PROFESSIONALS */}
                        {['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role) && (`;
content = content.replace(step3Old, step3New);
fs.writeFileSync('src/components/WaitlistModal.tsx', content);
console.log('Patched step 3 successfully');
