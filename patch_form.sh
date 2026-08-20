#!/bin/bash
awk '
/              <form onSubmit=\{handleUploadReceipt\} className="space-y-4 pt-4 border-t border-stone-100">/ {
    print
    print "                {receiptUploadCharge && ("
    print "                  <div className=\"grid grid-cols-2 gap-4\">"
    print "                    <div className=\"p-3 bg-emerald-50 border border-emerald-100 rounded-xl\">"
    print "                      <span className=\"text-emerald-800 font-bold uppercase tracking-wider text-[10px] block\">Settling Charge:</span>"
    print "                      <strong className=\"text-emerald-900 text-sm block\">{receiptUploadCharge.name}</strong>"
    print "                    </div>"
    print "                    <div className=\"p-3 bg-emerald-50 border border-emerald-100 rounded-xl\">"
    print "                      <span className=\"text-emerald-800 font-bold uppercase tracking-wider text-[10px] block\">Amount:</span>"
    print "                      <strong className=\"text-emerald-900 text-sm block font-mono\">₦{receiptUploadCharge.amount.toLocaleString()}</strong>"
    print "                    </div>"
    print "                  </div>"
    print "                )}"
    next
}
/                  Submit Rent Payment/ {
    print "                  {receiptUploadCharge ? \"Submit Service Charge Receipt\" : \"Submit Rent Payment\"}"
    next
}
{ print }
' src/components/dashboards/TenantDashboard.tsx > temp.tsx && mv temp.tsx src/components/dashboards/TenantDashboard.tsx
