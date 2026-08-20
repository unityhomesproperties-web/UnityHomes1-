#!/bin/bash
awk '
/Properties Portfolio/ {
    if (!inserted) {
        print "          {/* PLATFORM ANNOUNCEMENTS */}"
        print "          {announcements.length > 0 && ("
        print "            <div className=\"bg-[#1B4332] border border-[#1B4332]/80 rounded-3xl p-6 shadow-xl relative overflow-hidden\">"
        print "              <div className=\"absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/10 rounded-bl-full\"></div>"
        print "              <h3 className=\"font-display font-black text-sm text-[#C9A84C] uppercase mb-4 tracking-widest flex items-center\">"
        print "                <Bell className=\"w-4 h-4 mr-2\" /> Platform Announcements"
        print "              </h3>"
        print "              <div className=\"space-y-4\">"
        print "                {announcements.map((ann, idx) => ("
        print "                  <div key={idx} className=\"bg-white/10 p-4 rounded-2xl border border-white/10 relative\">"
        print "                    <button "
        print "                      onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))}"
        print "                      className=\"absolute top-4 right-4 text-stone-300 hover:text-white transition cursor-pointer p-1 bg-black/20 rounded-full\""
        print "                    >"
        print "                      <X className=\"w-3 h-3\" />"
        print "                    </button>"
        print "                    <h4 className=\"text-white font-bold text-sm mb-1\">{ann.title}</h4>"
        print "                    <p className=\"text-stone-300 text-xs font-light leading-relaxed pr-8\">{ann.body}</p>"
        print "                    <span className=\"text-[10px] text-[#C9A84C] font-mono mt-3 block\">{ann.date}</span>"
        print "                  </div>"
        print "                ))}"
        print "              </div>"
        print "            </div>"
        print "          )}"
        print "        </div>"
        print "      )}"
        inserted=1
    }
}
{
    if (inserted && /^[[:space:]]*<\/div>[[:space:]]*$/ && !done_div) {
        done_div=1;
        next;
    }
    if (inserted && /^[[:space:]]*\)}[[:space:]]*$/ && !done_brace) {
        done_brace=1;
        next;
    }
    print $0
}
' src/components/dashboards/LandlordDashboard.tsx > temp.tsx && mv temp.tsx src/components/dashboards/LandlordDashboard.tsx
