const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

const regex = /<div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-\[#2D6A4F\] transition-colors">([\s\S]*?)<\/div>/g;
let matches = [...code.matchAll(regex)];

if (matches.length >= 6) {
    const tabs = ["triggerSuccess('Total Users view opened')", "setActiveTab('Landlords')", "setActiveTab('PMCs')", "setActiveTab('Properties')", "setActiveTab('Finance')", "setShowNotifications(true)"];
    
    for (let i = 0; i < 6; i++) {
        let match = matches[i];
        let replacement = `<button onClick={() => ${tabs[i]}} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#2D6A4F] transition-colors text-left">${match[1]}</button>`;
        code = code.replace(match[0], replacement);
    }
}

fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
