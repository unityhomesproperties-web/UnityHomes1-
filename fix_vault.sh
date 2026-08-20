#!/bin/bash
sed -i '1157,1165c\
            <div className="flex justify-between items-center bg-stone-50 p-2 rounded-xl mb-4">\
              <div className="flex gap-2">\
                {savedFilters.map((f, i) => (\
                  <span key={i} className="px-2 py-1 bg-white border border-stone-200 text-stone-600 rounded-lg text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-100">{f.name}</span>\
                ))}\
              </div>\
              <button onClick={() => setShowFilterNamePrompt({tab: "Vault", filterData: {}})} className="px-2 py-1 bg-stone-200 text-stone-700 rounded-lg text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-300">+ Save Filter</button>\
            </div>\
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">' src/components/dashboards/TenantDashboard.tsx
