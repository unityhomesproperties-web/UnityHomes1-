const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

// Replace the first generic <button... with correct tabs
code = code.replace(/<button onClick=\{\(\) => setActiveTab\('Landlords'\)\} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-\[#2D6A4F\] transition-colors text-left">/, 
`<button onClick={() => triggerSuccess('Total Users view opened')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#2D6A4F] transition-colors text-left">`);

code = code.replace(/<button onClick=\{\(\) => setActiveTab\('Landlords'\)\} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-\[#2D6A4F\] transition-colors text-left">/, 
`<button onClick={() => setActiveTab('Landlords')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#2D6A4F] transition-colors text-left">`);

code = code.replace(/<button onClick=\{\(\) => setActiveTab\('Landlords'\)\} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-\[#2D6A4F\] transition-colors text-left">/, 
`<button onClick={() => setActiveTab('PMCs')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#2D6A4F] transition-colors text-left">`);

code = code.replace(/<button onClick=\{\(\) => setActiveTab\('Landlords'\)\} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-\[#2D6A4F\] transition-colors text-left">/, 
`<button onClick={() => setActiveTab('Properties')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#2D6A4F] transition-colors text-left">`);

code = code.replace(/<button onClick=\{\(\) => setActiveTab\('Landlords'\)\} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-\[#2D6A4F\] transition-colors text-left">/, 
`<button onClick={() => setActiveTab('Finance')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#2D6A4F] transition-colors text-left">`);

code = code.replace(/<button onClick=\{\(\) => setActiveTab\('Landlords'\)\} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-\[#2D6A4F\] transition-colors text-left">/, 
`<button onClick={() => setShowNotifications(true)} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#2D6A4F] transition-colors text-left">`);

// Replace </div> closing tags for the buttons with </button>
// To be safe, I'll do this for the specific 6 occurrences after Today's Summary
let lines = code.split('\n');
let count = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Today\'s Summary')) {
        for (let j = i; j < i + 100 && j < lines.length; j++) {
            if (lines[j].includes('</div>') && lines[j-3].includes('<button onClick=')) {
                lines[j] = lines[j].replace('</div>', '</button>');
                count++;
                if (count === 6) break;
            }
        }
        break;
    }
}
fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', lines.join('\n'));
