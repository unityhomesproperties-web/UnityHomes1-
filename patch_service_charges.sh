#!/bin/bash
awk '
/const \[collectionTenant/ {
    print "  const [serviceCharges, setServiceCharges] = useState<any[]>(() => {"
    print "    try { return JSON.parse(localStorage.getItem(\"uh_service_charges_v1\") || \"[]\"); } catch { return []; }"
    print "  });"
}
{ print }
' src/components/dashboards/TenantDashboard.tsx > temp.tsx && mv temp.tsx src/components/dashboards/TenantDashboard.tsx
