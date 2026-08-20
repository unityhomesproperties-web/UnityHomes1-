const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

const oldBlock = `                  ))}
            </div>
          </div>
        )}`;

const newBlock = `                  ))}
                </div>
              </section>
            </div>
          </div>
        )}`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
