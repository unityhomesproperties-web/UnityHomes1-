const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

code = code.replace(
  `                                )}}
          </div>
          {/* PRIVATE REPRESENTED TENANT DOSSIER MATRIX (Fix Seven) */}`,
  `                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* PRIVATE REPRESENTED TENANT DOSSIER MATRIX (Fix Seven) */}`
);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
