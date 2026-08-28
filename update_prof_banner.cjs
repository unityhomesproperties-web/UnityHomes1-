const fs = require('fs');
let content = fs.readFileSync('src/components/ProfessionalsPage.tsx', 'utf8');

const regex = /<div className="bg-\[#18452E\] text-white rounded-2xl p-5 md:p-6 mb-8 shadow-md border border-\[#18452E\]\/50 flex flex-col sm:flex-row items-center justify-between gap-4">/g;

const newSection = `<div className="relative overflow-hidden text-white rounded-2xl p-5 md:p-6 mb-8 shadow-md border border-[#18452E]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#6FBE45]/90" />
              </div>
              <div className="relative z-10 flex items-center space-x-3.5 text-center sm:text-left w-full justify-between flex-col sm:flex-row gap-4">`;

let modified = content.replace(
  /<div className="bg-\[#18452E\] text-white rounded-2xl p-5 md:p-6 mb-8 shadow-md border border-\[#18452E\]\/50 flex flex-col sm:flex-row items-center justify-between gap-4">\s*<div className="flex items-center space-x-3\.5 text-center sm:text-left">/g,
  `<div className="relative overflow-hidden text-white rounded-2xl p-5 md:p-6 mb-8 shadow-md border border-[#18452E]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80" alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#6FBE45]/90" />
              </div>
              <div className="relative z-10 flex w-full flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5 text-center sm:text-left">`
);

// close the div wrapper correctly? Wait, replacing the opening elements is fine, we just added a `<div className="relative z-10 flex w-full ...">` wrapping the inner content, but we didn't close it!
