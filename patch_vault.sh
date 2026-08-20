#!/bin/bash
awk '
/              <h3 className="font-display font-black text-\[#1B4332\] uppercase text-sm">Tenant Document Vault<\/h3>/ {
    print
    print "            </div>"
    print ""
    print "            <div className=\"flex justify-between items-center bg-stone-50 p-2 rounded-xl\">"
    print "              <div className=\"flex gap-2\">"
    print "                {savedFilters.map((f, i) => ("
    print "                  <span key={i} className=\"px-2 py-1 bg-white border border-stone-200 text-stone-600 rounded-lg text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-100\">{f.name}</span>"
    print "                ))}"
    print "              </div>"
    print "              <button onClick={() => setShowFilterNamePrompt({tab: \"Vault\", filterData: {}})} className=\"px-2 py-1 bg-stone-200 text-stone-700 rounded-lg text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-300\">+ Save Filter</button>"
    print "            </div>"
    print "            "
    next
}
/            <\/div>/ {
    if (seen == 0 && /            <\/div>/) {
        # This might catch the wrong closing div, so lets use a different approach
    }
}
{ print }
' src/components/dashboards/TenantDashboard.tsx > temp.tsx && mv temp.tsx src/components/dashboards/TenantDashboard.tsx
