import { Property, Professional, ProfessionalConnection, PMCApplication, TenantRegistration, LandlordUnit, BookingLog, VerificationInquiry, UserSession, Building, ShortletManagerAgreement, DamageReport, ServiceChargeBill, SubscriptionTier, SubscriptionInquiry } from './types';

// ==========================================
// SAMPLE DATA: FIVE LANDLORDS & 30+ PROPERTIES
// ==========================================
export const initialProperties: Property[] = [
  // Mrs Funmi Adebayo (UH-LANDLORD-FUNMI): 8 self-managed properties, 2 vacant, 6 occupied
  {
    id: 'prop-funmi-1',
    title: 'Adebayo Lekki Heights Suite A',
    price: 7454128,
    type: 'For Rent',
    location: 'Admiralty Way, Lekki Phase 1, Lagos',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    description: 'Beautifully finished Lekki luxury apartment with a gorgeous rooftop terrace. Features 24/7 power and designated parking. Managed directly by Mrs. Funmi Adebayo under strict zero-trust ledger tracking.',
    photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
    youtubeTourUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    mapsPinLabel: 'Block 2, Plot 14 Admiralty Way, Lekki, Lagos',
    amenities: ['24/7 Power', 'Secured Gates', 'Elevator', 'Armed Security'],
    landlordCode: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    verifiedAccountName: 'Funmi Adebayo Verified Account',
    verifiedAccountNumber: '1022938485',
    verifiedBankName: 'Guaranty Trust Bank (GTB)',
    feeBreakdown: [
      { label: 'Annual Rent', amount: 700000 },
      { label: 'Caution Deposit (Refundable)', amount: 80000 }
    ]
  },
  {
    id: 'prop-funmi-2',
    title: 'Adebayo Lekki Heights Suite B',
    price: 7981306,
    type: 'For Rent',
    location: 'Admiralty Way, Lekki Phase 1, Lagos',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    description: 'Mirror unit of Suite A. Pristine sanitary wares, automated water treatment plant, and a highly responsive landlord.',
    photos: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Block 2, Plot 14 Admiralty Way, Lekki, Lagos',
    amenities: ['24/7 Power', 'Secured Gates', 'Armed Security'],
    landlordCode: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    verifiedAccountName: 'Funmi Adebayo Verified Account',
    verifiedAccountNumber: '1022938485',
    verifiedBankName: 'Guaranty Trust Bank (GTB)',
    feeBreakdown: [
      { label: 'Annual Rent', amount: 700000 },
      { label: 'Caution Deposit (Refundable)', amount: 80000 }
    ]
  },
  {
    id: 'prop-funmi-3',
    title: 'Adebayo Lekki Heights Suite C',
    price: 7900677,
    type: 'For Rent',
    location: 'Admiralty Way, Lekki Phase 1, Lagos',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    description: 'Luxury flat with central air-conditioning, custom modular wardrobes, and immediate structural certification checks complete.',
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Block 2, Plot 14 Admiralty Way, Lekki, Lagos',
    amenities: ['24/7 Power', 'Secured Gates', 'Swimming Pool', 'Armed Security'],
    landlordCode: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    verifiedAccountName: 'Funmi Adebayo Verified Account',
    verifiedAccountNumber: '1022938485',
    verifiedBankName: 'Guaranty Trust Bank (GTB)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 700000 }, { label: 'Caution Deposit', amount: 80000 }]
  },
  {
    id: 'prop-funmi-4',
    title: 'Funmi Executive Maisonette 1A',
    price: 2122361,
    type: 'For Lease',
    location: 'Lekki Phase 1, Lagos',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 3,
    description: 'En-suite duplex maisonette with dynamic space planning, spacious boys quarters, and highly polished concrete floors. Certifications verified.',
    photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Plot 22, Fola Osibo Road, Lekki',
    amenities: ['24/7 Electricity', 'Prepaid Meter', 'Borehole Water'],
    landlordCode: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    verifiedAccountName: 'Funmi Adebayo Verified Account',
    verifiedAccountNumber: '1022938485',
    verifiedBankName: 'Guaranty Trust Bank (GTB)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 960000 }]
  },
  {
    id: 'prop-funmi-5',
    title: 'Funmi Executive Maisonette 1B',
    price: 1719691,
    type: 'For Lease',
    location: 'Lekki Phase 1, Lagos',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 3,
    description: 'Exquisite maisonette block. Currently vacant. Ready for immediate move-in after client vetting is cleared.',
    photos: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Plot 22, Fola Osibo Road, Lekki',
    amenities: ['24/7 Electricity', 'Armed Guard', 'Borehole Water'],
    landlordCode: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    verifiedAccountName: 'Funmi Adebayo Verified Account',
    verifiedAccountNumber: '1022938485',
    verifiedBankName: 'Guaranty Trust Bank (GTB)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 960000 }, { label: 'Caution Deposit', amount: 100000 }]
  },
  {
    id: 'prop-funmi-6',
    title: 'Lekki Phase 1 Smart Villa',
    price: 5304100,
    type: 'For Rent',
    location: 'Block 15, Lekki Phase 1, Lagos',
    state: 'Lagos',
    bedrooms: 4,
    bathrooms: 5,
    description: 'Fully smart, dynamic triplex villa. Currently vacant. Outstanding building audit certifications complete by COREN standard structural engineers.',
    photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '15 Admiralty Way, Lekki',
    amenities: ['Smart Home Automation', 'Solar Array Inverter', 'Prepaid Meter'],
    landlordCode: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    verifiedAccountName: 'Funmi Adebayo Verified Account',
    verifiedAccountNumber: '1022938485',
    verifiedBankName: 'Guaranty Trust Bank (GTB)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 1700000 }, { label: 'Caution Deposit', amount: 200000 }]
  },
  {
    id: 'prop-funmi-7',
    title: 'Victoria Island Business Office Suite',
    price: 6125271,
    type: 'For Rent',
    location: 'Adeola Odeku, Victoria Island, Lagos',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 2,
    description: 'Fully partitions, open office configuration with direct road frontage and high fiber internet nodes.',
    photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Adeola Odeku Plaza, VI, Lagos',
    amenities: ['Dedicated Transformer', 'Fiber Connection', 'Car Docking Space'],
    landlordCode: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    verifiedAccountName: 'Funmi Adebayo Verified Account',
    verifiedAccountNumber: '1022938485',
    verifiedBankName: 'Guaranty Trust Bank (GTB)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 1200000 }]
  },
  {
    id: 'prop-funmi-8',
    title: 'Epe Lagoon View Terrace',
    price: 4537204,
    type: 'For Rent',
    location: 'Lagoon Border Layout, Epe, Lagos',
    state: 'Lagos',
    bedrooms: 1,
    bathrooms: 1,
    description: 'Serene cottage with incredible sunrise views over the Lagoon waterfront. Verified survey plotting.',
    photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '1 Epe Boulevard near Marina Jetty',
    amenities: ['Lagoon View', 'Prepaid Electricity', 'Paved Road Access'],
    landlordCode: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    verifiedAccountName: 'Funmi Adebayo Verified Account',
    verifiedAccountNumber: '1022938485',
    verifiedBankName: 'Guaranty Trust Bank (GTB)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 360000 }]
  },

  // Mr Babatunde Osei (UH-LANDLORD-OSEI): 7 properties combined, 4 self, 3 managed by Prime Property Solutions. 85% occupancy.
  {
    id: 'prop-osei-1',
    title: 'Osei Gbagada Estate Flat A',
    price: 1749346,
    type: 'For Rent',
    location: 'Millennium Estate, Gbagada, Lagos',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    description: 'Lovely ground floor family residence inside gated Gbagada layout. Highly secure with armed guards.',
    photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Plot 4, Millennium Estate, Gbagada',
    amenities: ['Gated Estate Control', 'Armed Guards', 'Paved Walks'],
    landlordCode: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    verifiedAccountName: 'Babatunde Osei Registry Account',
    verifiedAccountNumber: '2022839485',
    verifiedBankName: 'Zenith Bank',
    feeBreakdown: [{ label: 'Annual Rent', amount: 500000 }]
  },
  {
    id: 'prop-osei-2',
    title: 'Osei Gbagada Estate Flat B',
    price: 2385495,
    type: 'For Rent',
    location: 'Millennium Estate, Gbagada, Lagos',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    description: 'First floor apartment looking over the clean central garden of Millennium Estate Gbagada.',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Plot 4, Millennium Estate, Gbagada',
    amenities: ['Armed Security', 'Constant Water Flow', 'Central Backups'],
    landlordCode: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    verifiedAccountName: 'Babatunde Osei Registry Account',
    verifiedAccountNumber: '2022839485',
    verifiedBankName: 'Zenith Bank',
    feeBreakdown: [{ label: 'Annual Rent', amount: 500000 }]
  },
  {
    id: 'prop-osei-3',
    title: 'Surulere Family Residence',
    price: 2155563,
    type: 'For Rent',
    location: 'Adeniran Ogunsanya, Surulere, Lagos',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 3,
    description: 'Traditional solid concrete townhouse structure. Features gated private access, prepaid electric hubs, and parking cards.',
    photos: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Adeniran Crescent, Surulere',
    amenities: ['Dedicated Parking', 'Constant Water Flow', 'Smart Guards'],
    landlordCode: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    verifiedAccountName: 'Babatunde Osei Registry Account',
    verifiedAccountNumber: '2022839485',
    verifiedBankName: 'Zenith Bank',
    feeBreakdown: [{ label: 'Annual Rent', amount: 600000 }]
  },
  {
    id: 'prop-osei-4',
    title: 'Yaba Tech Hub Co-workspace',
    price: 463291,
    type: 'For Lease',
    location: 'Herbert Macaulay Way, Yaba, Lagos',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 3,
    description: 'Fully fitted technology workspace with fiber-optic network feeds and high-density air vents. Highly recommended for startups.',
    photos: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '142 Herbert Macaulay Way, Yaba',
    amenities: ['Dual Fiber Feeds', 'Generator Substation', 'Access Controllers'],
    landlordCode: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    verifiedAccountName: 'Babatunde Osei Registry Account',
    verifiedAccountNumber: '2022839485',
    verifiedBankName: 'Zenith Bank',
    feeBreakdown: [{ label: 'Annual Lease Value', amount: 900000 }]
  },
  {
    id: 'prop-osei-5',
    title: 'Lekki Rosewood Duplex 1',
    price: 7066749,
    type: 'For Lease',
    location: 'Chevron Drive, Lekki, Lagos',
    state: 'Lagos',
    bedrooms: 4,
    bathrooms: 4,
    description: 'Luxury residential duplex managed on Osei&apos;s behalf by Prime Property Solutions. Fully verified.',
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Rosewood Court, Chevron Drive, Lekki',
    amenities: ['Managed Power', 'Uniformed Guards', 'Cleaning Services'],
    landlordCode: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    verifiedAccountName: 'Prime Property Solutions Client Account',
    verifiedAccountNumber: '4400293881',
    verifiedBankName: 'Access Bank',
    feeBreakdown: [{ label: 'Annual Lease', amount: 1100000 }]
  },
  {
    id: 'prop-osei-6',
    title: 'Lekki Rosewood Duplex 2',
    price: 3425088,
    type: 'For Rent',
    location: 'Chevron Drive, Lekki, Lagos',
    state: 'Lagos',
    bedrooms: 4,
    bathrooms: 4,
    description: 'Managed with pride by Prime Property Solutions. Includes fully treated running water logs.',
    photos: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Rosewood Court, Chevron Drive, Lekki',
    amenities: ['Managed Power', 'Treated Water', 'Uniformed Guards'],
    landlordCode: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    verifiedAccountName: 'Prime Property Solutions Client Account',
    verifiedAccountNumber: '4400293881',
    verifiedBankName: 'Access Bank',
    feeBreakdown: [{ label: 'Annual Rent', amount: 1100000 }]
  },
  {
    id: 'prop-osei-7',
    title: 'Lekki Rosewood Duplex 3',
    price: 5075201,
    type: 'For Rent',
    location: 'Chevron Drive, Lekki, Lagos',
    state: 'Lagos',
    bedrooms: 4,
    bathrooms: 4,
    description: 'Modern terraced duplex with secure layout configurations, backed by SURCON certified mapping blueprints.',
    photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Rosewood Court, Chevron Drive, Lekki',
    amenities: ['Uniformed Guards', 'Prepaid electric checks', 'Treated Water'],
    landlordCode: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    verifiedAccountName: 'Prime Property Solutions Client Account',
    verifiedAccountNumber: '4400293881',
    verifiedBankName: 'Access Bank',
    feeBreakdown: [{ label: 'Annual Rent', amount: 1100000 }]
  },

  // Alhaji Musa Ibrahim (UH-LANDLORD-MUSA): 6 properties managed entirely by Lagos Realty Partners
  {
    id: 'prop-musa-1',
    title: 'Ibrahim Wuse Executive Court',
    price: 2070759,
    type: 'For Rent',
    location: 'Wuse 2, Abuja',
    state: 'Abuja',
    bedrooms: 3,
    bathrooms: 3,
    description: 'Fully serviced upscale apartment block managed on Alhaji Musa&apos;s behalf by Lagos Realty Partners.',
    photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Plot 118 Aminu Kano Crescent, Wuse, Abuja',
    amenities: ['Central Generator', '24/7 Security Patrol', 'High Pressured Treated Water'],
    landlordCode: 'UH-LANDLORD-MUSA',
    landlordName: 'Alhaji Musa Ibrahim',
    verifiedAccountName: 'Lagos Realty Partners Client Account',
    verifiedAccountNumber: '3044958372',
    verifiedBankName: 'Sterling Bank',
    feeBreakdown: [{ label: 'Annual Rent', amount: 1300000 }]
  },
  {
    id: 'prop-musa-2',
    title: 'Maitama Heights Plaza',
    price: 2437046,
    type: 'For Lease',
    location: 'Maitama, Abuja',
    state: 'Abuja',
    bedrooms: 0,
    bathrooms: 4,
    description: 'Exclusive business development center inside the extreme high-traffic heart of Maitama. Verified land charts.',
    photos: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '12 Gana Street, Maitama, Abuja',
    amenities: ['Underground Parking', 'Smart Elevator Systems', 'Armed Escorts Station'],
    landlordCode: 'UH-LANDLORD-MUSA',
    landlordName: 'Alhaji Musa Ibrahim',
    verifiedAccountName: 'Lagos Realty Partners Client Verified',
    verifiedAccountNumber: '3044958372',
    verifiedBankName: 'Sterling Bank',
    feeBreakdown: [{ label: 'Annual Lease Value', amount: 2400000 }]
  },
  {
    id: 'prop-musa-3',
    title: 'Ikeja GRA Smart Duplex',
    price: 2412869,
    type: 'For Rent',
    location: 'Joel Ogunnaike, Ikeja GRA, Lagos',
    state: 'Lagos',
    bedrooms: 4,
    bathrooms: 5,
    description: 'Contemporary smart duplex with automated entrance gates, soil tests cleared, COREN structural reports fully ready.',
    photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Joel Ogunnaike Road, Ikeja GRA, Lagos',
    amenities: ['Soil Tested Piles', 'Automated Gates', 'Premium Gym Room'],
    landlordCode: 'UH-LANDLORD-MUSA',
    landlordName: 'Alhaji Musa Ibrahim',
    verifiedAccountName: 'Lagos Realty Partners Client Verified',
    verifiedAccountNumber: '3044958372',
    verifiedBankName: 'Sterling Bank',
    feeBreakdown: [{ label: 'Annual Rent', amount: 1500000 }]
  },
  {
    id: 'prop-musa-4',
    title: 'Abuja Gwarinpa Townhouse',
    price: 1051651,
    type: 'For Rent',
    location: 'Gwarinpa Phase 2, Abuja',
    state: 'Abuja',
    bedrooms: 3,
    bathrooms: 3,
    description: 'Lovely mid-terrace townhouse structured inside a secure estate. Fully managed by certified professionals under Lagos Realty.',
    photos: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'House 19, 4th Avenue, Gwarinpa',
    amenities: ['Children Playground', 'Municipal Grid Feed', '24/7 Gate Patrol'],
    landlordCode: 'UH-LANDLORD-MUSA',
    landlordName: 'Alhaji Musa Ibrahim',
    verifiedAccountName: 'Lagos Realty Partners Client Verified',
    verifiedAccountNumber: '3044958372',
    verifiedBankName: 'Sterling Bank',
    feeBreakdown: [{ label: 'Annual Rent', amount: 800000 }]
  },
  {
    id: 'prop-musa-5',
    title: 'Lagos Marina Office Suite',
    price: 2303520,
    type: 'For Lease',
    location: 'Marina Waterfront, Lagos Island, Lagos',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 2,
    description: 'Corporate view office space facing Lagos Harbor. Secured title checking fully performed.',
    photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Marina View Plaza Block 8',
    amenities: ['Lagoons views', 'Substation power backups', 'Fitted elevators'],
    landlordCode: 'UH-LANDLORD-MUSA',
    landlordName: 'Alhaji Musa Ibrahim',
    verifiedAccountName: 'Lagos Realty Partners Client Verified',
    verifiedAccountNumber: '3044958372',
    verifiedBankName: 'Sterling Bank',
    feeBreakdown: [{ label: 'Annual Lease Value', amount: 1000000 }]
  },
  {
    id: 'prop-musa-6',
    title: 'Alhaji Musa Epe Gateway Plot',
    price: 1874128,
    type: 'For Lease',
    location: 'Epe Toll Gate Expressway, Lagos',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 0,
    description: 'Zoned commercial parcel suitable for shipping logs, truck terminals, or layover development. Genuinely registered.',
    photos: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Epe Express Corridor Highway Plot 19',
    amenities: ['Direct Highway Access', 'Topographical Log Handover', 'Fencing'],
    landlordCode: 'UH-LANDLORD-MUSA',
    landlordName: 'Alhaji Musa Ibrahim',
    verifiedAccountName: 'Lagos Realty Partners Client Verified',
    verifiedAccountNumber: '3044958372',
    verifiedBankName: 'Sterling Bank',
    feeBreakdown: [{ label: 'Annual Lease Value', amount: 640000 }]
  },

  // Dr Chioma Okafor (UH-LANDLORD-CHIOMA): 5 self-managed properties, 1 overdue, 1 lease expiring within 30 days
  {
    id: 'prop-chioma-1',
    title: 'Okafor Gbagada Penthouse Block',
    price: 3792018,
    type: 'For Rent',
    location: 'Gbagada Phase 2, Lagos',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 4,
    description: 'Spectacular penthouse property featuring high ceiling clearances and private water filtration structures. Self-managed.',
    photos: ['https://images.unsplash.com/photo-1622771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Plot 15 Phase 2, Gbagada, Lagos',
    amenities: ['Independent Backups', 'Water Treatment Station', 'CCTV System'],
    landlordCode: 'UH-LANDLORD-CHIOMA',
    landlordName: 'Dr Chioma Okafor',
    verifiedAccountName: 'Dr Chioma Okafor Collection ESC',
    verifiedAccountNumber: '5024859381',
    verifiedBankName: 'United Bank for Africa (UBA)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 900000 }]
  },
  {
    id: 'prop-chioma-2',
    title: 'Ikeja Studio Apartment Flat 4',
    price: 612744,
    type: 'For Rent',
    location: 'Allen Avenue, Ikeja, Lagos',
    state: 'Lagos',
    bedrooms: 1,
    bathrooms: 1,
    description: 'Compact styled studio flat inside the active commercial baseline of Allen Avenue. (Has active overdue rent dispute status).',
    photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '22 Allen Ave (Opposite Shoprite Bus Stop)',
    amenities: ['Street Parking Card', 'Fitted Wardrobes', 'Electric meter'],
    landlordCode: 'UH-LANDLORD-CHIOMA',
    landlordName: 'Dr Chioma Okafor',
    verifiedAccountName: 'Dr Chioma Okafor Collection ESC',
    verifiedAccountNumber: '5024859381',
    verifiedBankName: 'United Bank for Africa (UBA)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 440000 }]
  },
  {
    id: 'prop-chioma-3',
    title: 'Maryland Cozy Townhouse Suite B',
    price: 2350324,
    type: 'For Rent',
    location: 'Maryland Gated Close, Lagos',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 3,
    description: 'Charming duplex townhouse with quiet side gardens. (Lease is expiring within 30 days).',
    photos: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '8 Maryland Gated Close, Lagos',
    amenities: ['Fitted AC Units', 'Private Backyard Garden', 'Constant Electric System'],
    landlordCode: 'UH-LANDLORD-CHIOMA',
    landlordName: 'Dr Chioma Okafor',
    verifiedAccountName: 'Dr Chioma Okafor Collection ESC',
    verifiedAccountNumber: '5024859381',
    verifiedBankName: 'United Bank for Africa (UBA)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 560000 }]
  },
  {
    id: 'prop-chioma-4',
    title: 'Lekki Phase 2 Terraced Duplex Block D',
    price: 3278226,
    type: 'For Rent',
    location: 'Lekki Phase 2, Lagos',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 4,
    description: 'Magnificent terrace residence with supreme layout security. Verified coordinate surveys logged with SURCON Registry panels.',
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Terraces complex plot 118, Lekki 2',
    amenities: ['SURCON Verified coordinates', '24/7 Security Cabin', 'Constant water Treatment'],
    landlordCode: 'UH-LANDLORD-CHIOMA',
    landlordName: 'Dr Chioma Okafor',
    verifiedAccountName: 'Dr Chioma Okafor Collection ESC',
    verifiedAccountNumber: '5024859381',
    verifiedBankName: 'United Bank for Africa (UBA)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 840000 }]
  },
  {
    id: 'prop-chioma-5',
    title: 'Dr Chioma Gbagada Clinic Annex Block',
    price: 850637,
    type: 'For Lease',
    location: 'Gbagada Expressway Frontage, Lagos',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 4,
    description: 'Fully equipped medical or institutional administration complex layout with spacious patient docking bays.',
    photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Plot 4, Express Frontage Service road, Gbagada',
    amenities: ['Express Frontage access', 'Transformer access', 'COREN signed structural designs'],
    landlordCode: 'UH-LANDLORD-CHIOMA',
    landlordName: 'Dr Chioma Okafor',
    verifiedAccountName: 'Dr Chioma Okafor Collection ESC',
    verifiedAccountNumber: '5024859381',
    verifiedBankName: 'United Bank for Africa (UBA)',
    feeBreakdown: [{ label: 'Annual Lease Value', amount: 1800000 }]
  },

  // Chief Emmanuel Adeyinka (UH-LANDLORD-EMMANUEL): 4 self-managed properties, all fully paid and occupied
  {
    id: 'prop-yinka-1',
    title: 'Adeyinka Surulere Palace Court',
    price: 1647495,
    type: 'For Rent',
    location: 'Bode Thomas, Surulere, Lagos',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 3,
    description: 'Prestigious classic residence built from massive concrete slabs. Centrally located with 24/7 gated security and treated water vaults.',
    photos: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '14 Bode Thomas Street, Surulere',
    amenities: ['Massive Concrete framework', 'Water treatments', 'Prepaid electricity meters'],
    landlordCode: 'UH-LANDLORD-EMMANUEL',
    landlordName: 'Chief Emmanuel Adeyinka',
    verifiedAccountName: 'Chief Emmanuel Adeyinka Trust Account',
    verifiedAccountNumber: '1004928374',
    verifiedBankName: 'First Bank of Nigeria (FBN)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 720000 }]
  },
  {
    id: 'prop-yinka-2',
    title: 'Lekki Conserv Security Flat',
    price: 2667499,
    type: 'For Rent',
    location: 'Conservation road, Lekki, Lagos',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    description: 'Peaceful flat borders the Lekki conservation forestry network. Absolute fresh air, zero noise pollution, premium structural logs.',
    photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: 'Conservation boulevard suite 4, Lekki',
    amenities: ['Forester border paths', 'Silent solar cells backup', 'Treated water'],
    landlordCode: 'UH-LANDLORD-EMMANUEL',
    landlordName: 'Chief Emmanuel Adeyinka',
    verifiedAccountName: 'Chief Emmanuel Adeyinka Trust Account',
    verifiedAccountNumber: '1004928374',
    verifiedBankName: 'First Bank of Nigeria (FBN)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 800000 }]
  },
  {
    id: 'prop-yinka-3',
    title: 'Ikeja Corporate Office Block A',
    price: 2231082,
    type: 'For Lease',
    location: 'Toyin Street, Ikeja, Lagos',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 3,
    description: 'Commercial facility with secure central partition assets. Title deed checks signed off by certified panel surveyors.',
    photos: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '50 Toyin Street, Ikeja, Lagos',
    amenities: ['Dedicated transformer grid', 'Elevators', 'Dedicated parking guards'],
    landlordCode: 'UH-LANDLORD-EMMANUEL',
    landlordName: 'Chief Emmanuel Adeyinka',
    verifiedAccountName: 'Chief Emmanuel Adeyinka Trust Account',
    verifiedAccountNumber: '1004928374',
    verifiedBankName: 'First Bank of Nigeria (FBN)',
    feeBreakdown: [{ label: 'Annual Lease Value', amount: 1600000 }]
  },
  {
    id: 'prop-yinka-4',
    title: 'Victoria Island Executive Studio V1',
    price: 629662,
    type: 'For Rent',
    location: 'Sanusi Fafunwa, Victoria Island, Lagos',
    state: 'Lagos',
    bedrooms: 1,
    bathrooms: 1,
    description: 'Dynamic luxury studio located in Lagos financial beating heart. Ideal for visiting diaspora professionals.',
    photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    mapsPinLabel: '8 Sanusi Fafunwa Way, VI, Lagos',
    amenities: ['Dual Fiber Connections', 'Underground power vault access', 'Gym and lap Pool'],
    landlordCode: 'UH-LANDLORD-EMMANUEL',
    landlordName: 'Chief Emmanuel Adeyinka',
    verifiedAccountName: 'Chief Emmanuel Adeyinka Trust Account',
    verifiedAccountNumber: '1004928374',
    verifiedBankName: 'First Bank of Nigeria (FBN)',
    feeBreakdown: [{ label: 'Annual Rent', amount: 1040000 }]
  }
];


// ==========================================
// SAMPLE DATA: SIX ACCREDITED PROFESSIONALS
// ==========================================
export const initialProfessionals: Professional[] = [
  {
    id: 'prof-adeaze',
    name: 'Adaeze Okonkwo',
    category: 'Lawyer',
    regNumber: 'NBA-SCN-09841',
    issuingBody: 'Supreme Court of Nigeria',
    experienceYears: 12,
    statesCovered: ['Lagos', 'Anambra'],
    isFoundingMember: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: 'Founding Member panel advocate. Specializes in Lagos land deeds registry transactions, charting audits, Governors Consent acquisition, and litigation avoidance.'
  },
  {
    id: 'prof-folake',
    name: 'Folake Adeyemi',
    category: 'Lawyer',
    regNumber: 'NBA-SCN-10482',
    issuingBody: 'Supreme Court of Nigeria',
    experienceYears: 15,
    statesCovered: ['Lagos', 'Ogun', 'Oyo'],
    isFoundingMember: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: 'Distinguished real estate counsel specializing in joint venture land drafting, trust account covenants, and corporate landlord negotiations.'
  },
  {
    id: 'prof-emeka',
    name: 'Emeka Nwosu',
    category: 'Surveyor',
    regNumber: 'SURV-M-11293',
    issuingBody: 'Surveyors Registration Council of Nigeria (SURCON)',
    experienceYears: 14,
    statesCovered: ['Lagos', 'Abuja'],
    isFoundingMember: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: 'Geospatial boundary verification lead. Specializes in Epe Red Line boundary charting, swamp layout allocations, and SURCON coordinates checks.'
  },
  {
    id: 'prof-chiamaka',
    name: 'Chiamaka Osei',
    category: 'Surveyor',
    regNumber: 'SURV-M-02845',
    issuingBody: 'Surveyors Registration Council of Nigeria (SURCON)',
    experienceYears: 10,
    statesCovered: ['Enugu', 'Lagos', 'Rivers'],
    isFoundingMember: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: 'Accredited land charting specialist with intensive experience checking topographical soil logs and coastal boundary claims.'
  },
  {
    id: 'prof-biodun',
    name: 'Biodun Ajayi',
    category: 'Structural Engineer',
    regNumber: 'COREN-R-35492',
    issuingBody: 'Council for the Regulation of Engineering in Nigeria (COREN)',
    experienceYears: 18,
    statesCovered: ['Lagos', 'Rivers'],
    isFoundingMember: false,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: 'Soil stress analyst and concrete strength auditor. Conducts rigorous pile load reviews on swamp soil layers to avoid structural collapse.',
    tags: ['Foundation Stress', 'Reinforced Concrete', 'COREN Signoff', 'Piling Logs Audit']
  },
  {
    id: 'prof-tunde',
    name: 'Tunde Balogun',
    category: 'Structural Engineer',
    regNumber: 'COREN-R-08493',
    issuingBody: 'Council for the Regulation of Engineering in Nigeria (COREN)',
    experienceYears: 20,
    statesCovered: ['Lagos', 'Abuja'],
    isFoundingMember: false,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: 'Expert building inspector with specific focus on multi-story residential towers, foundation layout balances and material load testing.',
    tags: ['Pre-Purchase Inspection', 'Multi-Story Concrete', 'COREN signed structural designs']
  }
];


// ==========================================
// SAMPLE DATA: 10 TENANT ACTIVE LEDGERS (MATRICES)
// ==========================================
// Exactly 4 tenants in 'Needs Attention' alerts
// - Overdue: Aisha Bello (Dr Chioma Okafor property)
// - Due Soon: Damola Olatunji (Mr Babatunde Osei property)
// - Due Soon: Fatima Yusuf (Mr Babatunde Osei property)
// - Lease Expiring Soon: Kola Abiodun (Dr Chioma Okafor property)
export const initialBuildings: Building[] = [
  // Mrs Funmi Adebayo: 3 buildings at the same address ("Admiralty Way, Lekki Phase 1, Lagos")
  {
    id: 'bld-funmi-1',
    name: 'Adebayo Lekki Heights Tower A',
    blockLabel: 'Block A',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-FUNMI'
  },
  {
    id: 'bld-funmi-2',
    name: 'Adebayo Lekki Heights Tower B',
    blockLabel: 'Block B',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    coverPhoto: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-FUNMI'
  },
  {
    id: 'bld-funmi-3',
    name: 'Adebayo Lekki Heights Tower C',
    blockLabel: 'Block C',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    coverPhoto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-FUNMI'
  },
  // Mr Babatunde Osei (UH-LANDLORD-OSEI):
  {
    id: 'bld-osei-1',
    name: 'Osei Gbagada Estate Block A',
    blockLabel: 'Block A',
    address: 'Millennium Estate, Gbagada, Lagos',
    coverPhoto: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-OSEI'
  },
  {
    id: 'bld-osei-2',
    name: 'Osei Gbagada Estate Block B',
    blockLabel: 'Block B',
    address: 'Millennium Estate, Gbagada, Lagos',
    coverPhoto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-OSEI'
  },
  // Alhaji Musa Ibrahim:
  {
    id: 'bld-musa-1',
    name: 'Ibrahim Wuse Executive Block',
    blockLabel: 'Block A',
    address: 'Wuse 2, Abuja',
    coverPhoto: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-MUSA'
  },
  // Dr Chioma Okafor:
  {
    id: 'bld-chioma-1',
    name: 'Okafor Gbagada Penthouse Block',
    blockLabel: 'Block A',
    address: 'Gbagada Phase 2, Lagos',
    coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-CHIOMA'
  },
  {
    id: 'bld-chioma-2',
    name: 'Maryland Cozy Block',
    blockLabel: 'Block B',
    address: 'Maryland, Lagos',
    coverPhoto: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-CHIOMA'
  },
  // Chief Emmanuel Adeyinka:
  {
    id: 'bld-emmanuel-1',
    name: 'Adeyinka Surulere Palace Court',
    blockLabel: 'Block A',
    address: 'Surulere, Lagos',
    coverPhoto: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    landlordCode: 'UH-LANDLORD-EMMANUEL'
  }
];

export const initialShortletAgreements: ShortletManagerAgreement[] = [
  {
    propertyId: 'prop-funmi-8',
    propertyName: 'Adebayo Epe Lagoon View Terrace',
    managerName: 'Olayinka Ayodele',
    managerPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 12,
    landlordId: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    landlordBankName: 'Guaranty Trust Bank (GTB)',
    landlordBankAccountName: 'Funmi Adebayo Verified Account',
    landlordBankAccountNumber: '1022938485'
  },
  {
    propertyId: 'prop-osei-2',
    propertyName: 'Osei Gbagada Estate Flat B',
    managerName: 'Dele Ogunrinde',
    managerPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    landlordId: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    landlordBankName: 'Zenith Bank',
    landlordBankAccountName: 'Babatunde Osei Registry Account',
    landlordBankAccountNumber: '2022839485'
  },
  {
    propertyId: 'prop-osei-eko',
    propertyName: 'Eko Atlantic Suite',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    landlordBankName: 'Zenith Bank',
    landlordBankAccountName: 'Babatunde Osei Registry Account',
    landlordBankAccountNumber: '2022839485'
  },
  {
    propertyId: 'prop-osei-ikoyi',
    propertyName: 'Ikoyi Terrace',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    landlordBankName: 'Zenith Bank',
    landlordBankAccountName: 'Babatunde Osei Registry Account',
    landlordBankAccountNumber: '2022839485'
  },
  {
    propertyId: 'prop-funmi-lekki',
    propertyName: 'Lekki Flat',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 12,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-FUNMI',
    landlordName: 'Mrs Funmi Adebayo',
    landlordBankName: 'Guaranty Trust Bank (GTB)',
    landlordBankAccountName: 'Funmi Adebayo Verified Account',
    landlordBankAccountNumber: '1022938485'
  },
  {
    propertyId: 'prop-adeyemi-1',
    propertyName: 'Lekki Phase 1 apartment A',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-ADEYEMI',
    landlordName: 'Dr Bimbo Adeyemi',
    landlordBankName: 'Guaranty Trust Bank (GTB)',
    landlordBankAccountName: 'Bimbo Adeyemi Verified Account',
    landlordBankAccountNumber: '1122334455'
  },
  {
    propertyId: 'prop-adeyemi-2',
    propertyName: 'Lekki Phase 1 apartment B',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-ADEYEMI',
    landlordName: 'Dr Bimbo Adeyemi',
    landlordBankName: 'Guaranty Trust Bank (GTB)',
    landlordBankAccountName: 'Bimbo Adeyemi Verified Account',
    landlordBankAccountNumber: '1122334455'
  },
  {
    propertyId: 'prop-adeyemi-3',
    propertyName: 'Lekki Phase 1 apartment C',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-ADEYEMI',
    landlordName: 'Dr Bimbo Adeyemi',
    landlordBankName: 'Guaranty Trust Bank (GTB)',
    landlordBankAccountName: 'Bimbo Adeyemi Verified Account',
    landlordBankAccountNumber: '1122334455'
  },
  {
    propertyId: 'prop-adeyemi-4',
    propertyName: 'Victoria Island Suite A',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-ADEYEMI',
    landlordName: 'Dr Bimbo Adeyemi',
    landlordBankName: 'Guaranty Trust Bank (GTB)',
    landlordBankAccountName: 'Bimbo Adeyemi Verified Account',
    landlordBankAccountNumber: '1122334455'
  },
  {
    propertyId: 'prop-adeyemi-5',
    propertyName: 'Victoria Island Suite B',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-ADEYEMI',
    landlordName: 'Dr Bimbo Adeyemi',
    landlordBankName: 'Guaranty Trust Bank (GTB)',
    landlordBankAccountName: 'Bimbo Adeyemi Verified Account',
    landlordBankAccountNumber: '1122334455'
  },
  {
    propertyId: 'prop-adeyemi-6',
    propertyName: 'Victoria Island Suite C',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 15,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-ADEYEMI',
    landlordName: 'Dr Bimbo Adeyemi',
    landlordBankName: 'Guaranty Trust Bank (GTB)',
    landlordBankAccountName: 'Bimbo Adeyemi Verified Account',
    landlordBankAccountNumber: '1122334455'
  },
  {
    propertyId: 'prop-nwosu-1',
    propertyName: 'Nwosu Ikoyi Villa A',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 20,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-NWOSU',
    landlordName: 'Mrs Grace Nwosu',
    landlordBankName: 'Access Bank',
    landlordBankAccountName: 'Grace Nwosu Registry Account',
    landlordBankAccountNumber: '2233445566'
  },
  {
    propertyId: 'prop-nwosu-2',
    propertyName: 'Nwosu Ikoyi Villa B',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 20,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-NWOSU',
    landlordName: 'Mrs Grace Nwosu',
    landlordBankName: 'Access Bank',
    landlordBankAccountName: 'Grace Nwosu Registry Account',
    landlordBankAccountNumber: '2233445566'
  },
  {
    propertyId: 'prop-nwosu-3',
    propertyName: 'Nwosu Ikoyi Penthouse C',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 20,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-NWOSU',
    landlordName: 'Mrs Grace Nwosu',
    landlordBankName: 'Access Bank',
    landlordBankAccountName: 'Grace Nwosu Registry Account',
    landlordBankAccountNumber: '2233445566'
  },
  {
    propertyId: 'prop-nwosu-4',
    propertyName: 'Nwosu Ikoyi Penthouse D',
    managerName: 'James Okonkwo',
    managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    managementFeePercent: 20,
    managementCompany: 'Okonkwo Shortlet Management',
    landlordId: 'UH-LANDLORD-NWOSU',
    landlordName: 'Mrs Grace Nwosu',
    landlordBankName: 'Access Bank',
    landlordBankAccountName: 'Grace Nwosu Registry Account',
    landlordBankAccountNumber: '2233445566'
  },
  {
    propertyId: 'prop-osei-1',
    propertyName: 'Osei Gbagada Estate Flat A',
    managerName: '',
    managerPhoto: '',
    managementFeePercent: 0,
    landlordId: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    isManagedByMe: true
  },
  {
    propertyId: 'prop-osei-short-awaiting',
    propertyName: 'Osei Gbagada Estate Flat C',
    managerName: '',
    managerPhoto: '',
    managementFeePercent: 0,
    landlordId: 'UH-LANDLORD-OSEI',
    landlordName: 'Mr Babatunde Osei',
    isAwaitingAssignment: true
  }
];

export const initialLandlordUnits: LandlordUnit[] = [
  // 1 Overdue
  {
    id: 'unit-aisha',
    buildingId: 'bld-chioma-1',
    propertyName: 'Ikeja Studio Apartment Flat 4',
    unitNumber: 'Flat 4',
    tenantName: 'Aisha Bello',
    tenantCode: 'UH-TENANT-A093',
    rentAmount: 6228439,
    paymentStatus: 'Overdue',
    dueDate: '2026-06-01'
  },
  // 2 Due Soon
  {
    id: 'unit-damola',
    buildingId: 'bld-osei-1',
    propertyName: 'Osei Gbagada Estate Flat A',
    unitNumber: 'Flat A',
    tenantName: 'Damola Olatunji',
    tenantCode: 'UH-TENANT-D849',
    rentAmount: 2247936,
    rentPaid: 0,
    paymentStatus: 'Due Soon',
    dueDate: '2026-07-20',
    leaseExpiryDate: '2026-07-20',
    renewalIntention: null
  },
  {
    id: 'unit-fatima',
    buildingId: 'bld-chioma-1',
    propertyName: 'Yaba Tech Hub Co-workspace',
    unitNumber: 'Suite 2B',
    tenantName: 'Fatima Yusuf',
    tenantCode: 'UH-TENANT-F118',
    rentAmount: 456468,
    paymentStatus: 'Due Soon',
    dueDate: '2026-07-28'
  },
  // 1 Lease Expiring Soon
  {
    id: 'unit-kola',
    buildingId: 'bld-chioma-2',
    propertyName: 'Maryland Cozy Townhouse Suite B',
    unitNumber: 'Suite B',
    tenantName: 'Kola Abiodun',
    tenantCode: 'UH-TENANT-K049',
    rentAmount: 2385600,
    paymentStatus: 'Lease Expiring Soon',
    dueDate: '2026-07-15'
  },
  // 6 Fully Paid
  {
    id: 'unit-chidi',
    buildingId: 'bld-funmi-1',
    propertyName: 'Adebayo Lekki Heights Suite A',
    unitNumber: 'Suite A',
    tenantName: 'Chidi Mokeme',
    tenantCode: 'UH-TENANT-2412',
    rentAmount: 3917843,
    paymentStatus: 'Paid',
    dueDate: '2027-04-12'
  },
  {
    id: 'unit-funke',
    buildingId: 'bld-emmanuel-1',
    propertyName: 'Adeyinka Surulere Palace Court',
    unitNumber: 'Main Villa',
    tenantName: 'Funke Akindele',
    tenantCode: 'UH-TENANT-9842',
    rentAmount: 2109199,
    paymentStatus: 'Paid',
    dueDate: '2027-05-18'
  },
  {
    id: 'unit-tochukwu',
    buildingId: 'bld-osei-2',
    propertyName: 'Osei Gbagada Estate Flat B',
    unitNumber: 'Flat B',
    tenantName: 'Tochukwu Oke',
    tenantCode: 'UH-TENANT-5561',
    rentAmount: 1222348,
    rentPaid: 500000,
    paymentStatus: 'Paid',
    dueDate: '2026-09-10',
    leaseExpiryDate: '2026-09-10',
    renewalIntention: 'renewing'
  },
  {
    id: 'unit-pmc-renewing-2',
    buildingId: 'bld-osei-1',
    propertyName: 'Osei Gbagada Estate Flat A',
    unitNumber: 'Flat C',
    tenantName: 'Babatunde Raji',
    tenantCode: 'UH-TENANT-B839',
    rentAmount: 807057,
    rentPaid: 640000,
    paymentStatus: 'Paid',
    dueDate: '2026-08-20',
    leaseExpiryDate: '2026-08-20',
    renewalIntention: 'renewing'
  },
  {
    id: 'unit-pmc-vacating',
    buildingId: 'bld-osei-1',
    propertyName: 'Osei Gbagada Estate Flat A',
    unitNumber: 'Flat D',
    tenantName: 'Kunle Ajayi',
    tenantCode: 'UH-TENANT-K839',
    rentAmount: 2035450,
    rentPaid: 600000,
    paymentStatus: 'Paid',
    dueDate: '2026-07-31',
    leaseExpiryDate: '2026-07-31',
    renewalIntention: 'vacating',
    quitNoticeGenerated: true,
    quitNoticeStatus: 'Pending Admin Review',
    quitNoticeInitiationDate: '2026-06-30',
    quitNoticeLegalPeriod: '6 Months',
    quitNoticeEndDate: '2026-12-30'
  },
  {
    id: 'unit-pmc-awaiting-2',
    buildingId: 'bld-osei-1',
    propertyName: 'Lekki Rosewood Duplex 1',
    unitNumber: 'Unit 2',
    tenantName: 'Chioma Nze',
    tenantCode: 'UH-TENANT-C841',
    rentAmount: 6873579,
    rentPaid: 0,
    paymentStatus: 'Due Soon',
    dueDate: '2026-08-15',
    leaseExpiryDate: '2026-08-15',
    renewalIntention: null
  },
  {
    id: 'unit-pmc-installment-overdue',
    buildingId: 'bld-osei-1',
    propertyName: 'Osei Gbagada Estate Flat A',
    unitNumber: 'Flat E',
    tenantName: 'Yusuf Ali',
    tenantCode: 'UH-TENANT-Y839',
    rentAmount: 1617051,
    rentPaid: 200000,
    paymentStatus: 'Overdue',
    dueDate: '2026-06-21',
    leaseExpiryDate: '2027-01-01',
    hasInstallmentSchedule: true,
    installments: [
      { id: 'inst-1', dueDate: '2026-01-01', amount: 200000, status: 'Paid' },
      { id: 'inst-2', dueDate: '2026-06-21', amount: 200000, status: 'Overdue' },
      { id: 'inst-3', dueDate: '2026-12-21', amount: 200000, status: 'Unpaid' }
    ]
  },
  {
    id: 'unit-pmc-installment-on-schedule',
    buildingId: 'bld-osei-1',
    propertyName: 'Lekki Rosewood Duplex 2',
    unitNumber: 'Unit B',
    tenantName: 'Grace Egbo',
    tenantCode: 'UH-TENANT-G839',
    rentAmount: 4663166,
    rentPaid: 600000,
    paymentStatus: 'Paid',
    dueDate: '2026-10-01',
    leaseExpiryDate: '2027-02-01',
    hasInstallmentSchedule: true,
    installments: [
      { id: 'inst-4', dueDate: '2026-02-01', amount: 300000, status: 'Paid' },
      { id: 'inst-5', dueDate: '2026-06-01', amount: 300000, status: 'Paid' },
      { id: 'inst-6', dueDate: '2026-10-01', amount: 300000, status: 'Unpaid' }
    ]
  },
  {
    id: 'unit-kelechi',
    buildingId: 'bld-funmi-2',
    propertyName: 'Adebayo Lekki Heights Suite B',
    unitNumber: 'Suite B',
    tenantName: 'Kelechi Iheanacho',
    tenantCode: 'UH-TENANT-1234',
    rentAmount: 6994182,
    paymentStatus: 'Paid',
    dueDate: '2027-06-01'
  },
  {
    id: 'unit-aminu',
    buildingId: 'bld-musa-1',
    propertyName: 'Ibrahim Wuse Executive Court',
    unitNumber: 'Apt 118',
    tenantName: 'Aminu Tambuwal',
    tenantCode: 'UH-TENANT-7751',
    rentAmount: 1154420,
    paymentStatus: 'Paid',
    dueDate: '2027-01-22'
  },
  {
    id: 'unit-gboyega',
    buildingId: 'bld-musa-1',
    propertyName: 'Ikeja GRA Smart Duplex',
    unitNumber: 'Main Duplex',
    tenantName: 'Gboyega Sanwo',
    tenantCode: 'UH-TENANT-8812',
    rentAmount: 1749750,
    paymentStatus: 'Paid',
    dueDate: '2027-03-30'
  }
];


// ==========================================
// SHORTLET BOOKINGS PRE-POPULATED
// ==========================================
export const initialBookingLogs: BookingLog[] = [
  {
    id: 'book-osei-short',
    propertyName: 'Osei Gbagada Estate Flat B',
    unitNumber: 'Flat B',
    guestName: 'Chief Raymond Temowo',
    checkInDate: '2026-06-15',
    checkOutDate: '2026-06-25',
    totalPaid: 170000,
    remittanceFormSent: true,
    managementFeeAmount: 25500, // 15% manager fee
    remittanceAmount: 144500,
    remittanceDateSent: '2026-06-25',
    status: 'Acknowledged',
    bookingSource: 'Airbnb'
  },
  {
    id: 'book-funmi-short',
    propertyName: 'Adebayo Epe Lagoon View Terrace',
    unitNumber: 'Suite Suite View',
    guestName: 'Tomiwa Alabi',
    checkInDate: '2026-06-18',
    checkOutDate: '2026-06-22',
    totalPaid: 64000,
    remittanceFormSent: false,
    managementFeeAmount: 38400, // 12% manager fee
    remittanceAmount: 56320,
    status: 'Pending',
    bookingSource: 'WhatsApp'
  }
];

// ==========================================
// SHORTLET DAMAGE REPORTS PRE-POPULATED
// ==========================================
export const initialDamageReports: DamageReport[] = [
  {
    id: 'dmg-rep-001',
    propertyId: 'prop-funmi-8',
    propertyName: 'Adebayo Epe Lagoon View Terrace',
    unitNumber: 'Suite Suite View',
    bookingReference: 'book-funmi-short',
    guestStay: 'Tomiwa Alabi (18 Jun - 22 Jun)',
    dateDiscovered: '2026-06-23',
    damageCategory: 'Furniture',
    description: 'Broken dining chair leg during checkout inspection.',
    estimatedCost: 15000,
    urgencyLevel: 'Medium',
    status: 'Pending Approval',
    photos: [],
    videos: [],
    receipts: [],
    quotations: [],
    dateReported: '2026-06-23',
    managerId: 'sandbox-user-9999',
    landlordId: 'UH-LANDLORD-FUNMI',
    managerName: 'Demo Shortlet Manager'
  }
];

// ==========================================
// SERVICE CHARGES PRE-POPULATED
// ==========================================
export const initialServiceCharges: ServiceChargeBill[] = [
  {
    id: 'sc-001',
    categoryId: 'cat-security',
    unitId: 'unit-funmi-1',
    tenantName: 'Kola Abiodun',
    amount: 15000,
    dueDate: '2026-06-01',
    status: 'Paid',
    receiptUrl: 'https://example.com/receipt1.pdf',
    verifiedBy: 'UH-LANDLORD-FUNMI',
    dateVerified: '2026-06-02'
  },
  {
    id: 'sc-002',
    categoryId: 'cat-waste',
    unitId: 'unit-funmi-2',
    tenantName: 'Emeka Uzo',
    amount: 5000,
    dueDate: '2026-06-01',
    status: 'Overdue'
  },
  {
    id: 'sc-003',
    categoryId: 'cat-water',
    unitId: 'unit-chuks-1',
    tenantName: 'Aisha Bello',
    amount: 10000,
    dueDate: '2026-06-15',
    status: 'Pending Verification',
    receiptUrl: 'https://example.com/receipt3.pdf'
  },
  {
    id: 'sc-004',
    categoryId: 'cat-diesel',
    unitId: 'unit-chuks-2',
    tenantName: 'Babatunde Osei',
    amount: 35000,
    dueDate: '2026-06-25',
    status: 'Unpaid'
  }
];

// ==========================================
// PERSISTENT DATA ENGINES (LOCALSTORAGE SIMULATORS)
// ==========================================
export const loadPMCApplications = (): PMCApplication[] => {
  const data = localStorage.getItem('uh_pmc_applications');
  if (data) return JSON.parse(data);
  const initial: PMCApplication[] = [
    {
      id: 'pmc-app-prime',
      companyName: 'Prime Property Solutions',
      contactName: 'Dele Ogunrinde',
      phone: '+234 802 384 5591',
      whatsapp: '+234 802 384 5591',
      email: 'primeprop@gmail.com',
      cacNumber: 'RC-9988120',
      address: '25 Oba Akran Avenue, Ikeja, Lagos',
      yearsOperating: 8,
      propertiesManaged: 22,
      references: 'Charter verified references under statutory ESVARBON audits are certified.',
      status: 'Approved',
      dateApplied: '2026-06-10',
      receivingAuthority: 'Landlord Receives Directly',
      tenantRelationshipManager: 'Yusuf Dele',
      maintenanceHandler: 'Engr. Benson',
      expenseApprover: 'Alhaji Dele'
    },
    {
      id: 'pmc-app-lrealty',
      companyName: 'Lagos Realty Partners',
      contactName: 'Hon. Alhaji Suleiman',
      phone: '+234 815 222 3344',
      whatsapp: '+234 815 222 3344',
      email: 'lagosrealty@outlook.com',
      cacNumber: 'RC-1200833',
      address: 'Plot 4 Waterfront Close, Ikoyi, Lagos',
      yearsOperating: 12,
      propertiesManaged: 8,
      references: 'Proven records of trust ledger tracking.',
      status: 'Approved',
      dateApplied: '2026-06-12',
      receivingAuthority: "This Company Receives on Landlord's Behalf",
      tenantRelationshipManager: 'Kunle Suleiman',
      maintenanceHandler: 'Baba Tunde',
      expenseApprover: 'Hon. Alhaji Suleiman'
    }
  ];
  localStorage.setItem('uh_pmc_applications', JSON.stringify(initial));
  return initial;
};

export const savePMCApplication = (app: Omit<PMCApplication, 'id' | 'status' | 'dateApplied'>) => {
  const current = loadPMCApplications();
  const created: PMCApplication = {
    ...app,
    id: 'pmc-app-' + Math.random().toString(36).substr(2, 9),
    status: 'Pending',
    dateApplied: new Date().toISOString().split('T')[0]
  };
  current.push(created);
  localStorage.setItem('uh_pmc_applications', JSON.stringify(current));
};

export const loadTenantRegistrations = (): TenantRegistration[] => {
  const data = localStorage.getItem('uh_tenant_registrations');
  if (data) return JSON.parse(data);
  const initial: TenantRegistration[] = [
    {
      id: 'ten-app-1',
      landlordCode: 'UH-LANDLORD-FUNMI',
      fullName: 'Chidi Mokeme',
      phone: '+234 812 345 6789',
      whatsapp: '+234 812 345 6789',
      email: 'chidi@gmail.com',
      country: 'Nigeria',
      occupation: 'Tech Support Lead',
      employer: 'Decagon Tech',
      dob: '1994-08-15',
      passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      guarantorName: 'Dr. Arthur Mokeme',
      guarantorPhone: '+234 805 111 2222',
      guarantorOccupation: 'Medical Consultant',
      guarantorAddress: 'A Close, Gbagada Phase 2, Lagos',
      status: 'Approved',
      dateApplied: '2026-06-10'
    },
    {
      id: 'ten-app-2',
      landlordCode: 'UH-LANDLORD-OSEI',
      fullName: 'Damola Olatunji',
      phone: '+234 803 222 3841',
      whatsapp: '+234 803 222 3841',
      email: 'damola@gmail.com',
      country: 'Nigeria',
      occupation: 'Financial Analyst',
      employer: 'KPMG Nigeria',
      dob: '1992-11-20',
      passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      guarantorName: 'Chief Bode Olatunji',
      guarantorPhone: '+234 803 111 0049',
      guarantorOccupation: 'Retired Director',
      guarantorAddress: 'Penthouse close, Victoria Island, Lagos',
      status: 'Approved',
      dateApplied: '2026-06-15'
    }
  ];
  localStorage.setItem('uh_tenant_registrations', JSON.stringify(initial));
  return initial;
};

export const saveTenantRegistration = (tenant: Omit<TenantRegistration, 'id' | 'status' | 'dateApplied'>) => {
  const current = loadTenantRegistrations();
  const created: TenantRegistration = {
    ...tenant,
    id: 'ten-app-' + Math.random().toString(36).substr(2, 9),
    status: 'Pending',
    dateApplied: new Date().toISOString().split('T')[0]
  };
  current.push(created);
  localStorage.setItem('uh_tenant_registrations', JSON.stringify(current));
};

export const loadInquiries = (): VerificationInquiry[] => {
  const data = localStorage.getItem('uh_inquiries');
  if (data) return JSON.parse(data);
  const initial: VerificationInquiry[] = [
    {
      id: 'inq-1',
      type: 'Professional',
      targetName: 'Adaeze Okonkwo',
      requesterName: 'Alhaji Gidado',
      requesterPhone: '+234 803 222 1100',
      requesterEmail: 'gidado@wuseindustries.ng',
      dateCreated: '2026-06-18',
      status: 'Pending'
    },
    {
      id: 'inq-whatsapp-1',
      type: 'PlatformSubscription',
      targetName: 'Mrs Funmi Adebayo',
      planName: 'Landlord Growth Profile Pack',
      requesterName: 'Mrs Funmi Adebayo',
      requesterPhone: '+234 805 120 4492',
      requesterEmail: 'funmi@adebayo.ng',
      dateCreated: '2026-06-20',
      status: 'Contacted'
    }
  ];
  localStorage.setItem('uh_inquiries', JSON.stringify(initial));
  return initial;
};

export const saveInquiry = (inq: Omit<VerificationInquiry, 'id' | 'dateCreated' | 'status'>) => {
  const current = loadInquiries();
  const created: VerificationInquiry = {
    ...inq,
    id: 'inq-' + Math.random().toString(36).substr(2, 9),
    status: 'Pending',
    dateCreated: new Date().toISOString().split('T')[0]
  };
  current.push(created);
  localStorage.setItem('uh_inquiries', JSON.stringify(current));
};

// Simple active session storage to simulate login states
export const loadSession = (): UserSession | null => {
  const data = sessionStorage.getItem('uh_user_session');
  if (data) return JSON.parse(data);
  return null;
};

export const saveSession = (session: UserSession) => {
  sessionStorage.setItem('uh_user_session', JSON.stringify(session));
};

export const clearSession = () => {
  sessionStorage.removeItem('uh_user_session');
};

// Helper constant for custom template emails
export const initialProfessionalConnections: ProfessionalConnection[] = [
  {
    id: 'conn-demo-1',
    clientName: 'Nkem Obi',
    clientPhone: '+234 803 111 2222',
    clientEmail: 'nkem.obi@gmail.com',
    packageType: 'lawyer',
    amount: 55000,
    paymentStatus: 'confirmed',
    connectionStatus: 'group_created',
    professional1Id: 'prof-adeaze',
    professional1Name: 'Adaeze Okonkwo',
    dateCreated: '2026-07-15',
    notes: 'Single lawyer connection for title deed verification',
    isDemoData: true
  },
  {
    id: 'conn-demo-2',
    clientName: 'Taiwo Hassan',
    clientPhone: '+234 802 333 4444',
    clientEmail: 'taiwo.hassan@yahoo.com',
    packageType: 'dual_bundle_lawyer_surveyor',
    amount: 95000,
    paymentStatus: 'confirmed',
    connectionStatus: 'group_created',
    professional1Id: 'prof-adeaze',
    professional1Name: 'Adaeze Okonkwo',
    professional2Id: 'prof-emeka',
    professional2Name: 'Emeka Nwosu',
    dateCreated: '2026-07-18',
    notes: 'Dual bundle connection for title search and boundary charting in Epe',
    isDemoData: true
  },
  {
    id: 'conn-demo-3',
    clientName: 'Bola Adedayo',
    clientPhone: '+234 818 555 6666',
    clientEmail: 'bola.adedayo@hotmail.com',
    packageType: 'complete_bundle',
    amount: 120000,
    paymentStatus: 'confirmed',
    connectionStatus: 'service_delivered',
    professional1Id: 'prof-adeaze',
    professional1Name: 'Adaeze Okonkwo',
    professional2Id: 'prof-emeka',
    professional2Name: 'Emeka Nwosu',
    professional3Id: 'prof-biodun',
    professional3Name: 'Biodun Ajayi',
    dateCreated: '2026-07-20',
    notes: 'Complete bundle package covering legal title, SURCON charting, and COREN structural review',
    isDemoData: true
  }
];

export const loadProfessionalConnections = (): ProfessionalConnection[] => {
  const data = localStorage.getItem('uh_professional_connections_v1');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return initialProfessionalConnections;
};

export const saveProfessionalConnection = (conn: Omit<ProfessionalConnection, 'id' | 'dateCreated'> & { id?: string; dateCreated?: string }) => {
  const current = loadProfessionalConnections();
  const created: ProfessionalConnection = {
    ...conn,
    id: conn.id || 'conn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    dateCreated: conn.dateCreated || new Date().toISOString().split('T')[0]
  };
  const updated = [created, ...current];
  localStorage.setItem('uh_professional_connections_v1', JSON.stringify(updated));
  return created;
};

export const EMAIL_TEMPLATE_FOOTER = "\n\nWarm regards,\nUnity Homes Administration\nDon't Buy Wahala\nLagos Office";

// ==========================================
// SUBSCRIPTION TIERS DATA (PROMPT TWO REGROUP)
// ==========================================
export const initialSubscriptionTiers: SubscriptionTier[] = [
  // LONG-TERM LANDLORDS
  {
    id: 'tier-lt-starter',
    name: 'Starter Landlord',
    appliesTo: 'Long-Term Landlord',
    unitLimit: 10,
    monthlyPrice: 12000,
    badge: 'UP TO 10 UNITS',
    features: [
      'Smart Rent Reminder Engine with automated reminders sent at 90, 60, 30, 14, and 7 days before each rent due date.',
      'Automatic Transparency Certificate generated and emailed to tenant and landlord on every confirmed payment.',
      'Tenant self-registration using your unique landlord code with admin verification.',
      'Full tenant profiles storing name, photo, phone, occupation, and guarantor details.',
      'Property and unit management with building level hierarchy.',
      'Document vault for tenancy agreements, receipts, and certificates.',
      'Maintenance request logging and tracking.',
      'Basic lease renewal tracking with expiry alerts.',
      'Promise to Pay system for tenants to formally commit to a payment date.',
      'Tenant complaint center with proper routing to the right authority.',
      'Formal notice templates with legally required disclaimer.',
      'Monthly Portfolio Briefing delivered by email on the first of every month.',
      'Payment receipt emailed automatically to tenant within 60 seconds of confirmation.',
      'Unity Homes admin support access.',
      'Landlord Letters and Announcements module.'
    ]
  },
  {
    id: 'tier-lt-growth',
    name: 'Growth Landlord',
    appliesTo: 'Long-Term Landlord',
    unitLimit: 25,
    monthlyPrice: 25000,
    popular: true,
    badge: 'UP TO 25 UNITS',
    features: [
      'Everything in Starter, plus:',
      'Cash Flow Forecast showing this month and next 30 days.',
      'Lease Expiry Center with staged alerts at 90, 60, and 30 days with recommended actions.',
      'Vacant Unit Loss Tracker showing days vacant and potential lost income.',
      'Rent Adjustment workflow with statutory notice period enforcement.',
      'Installment payment schedule tracking with per-installment receipts.',
      'Property Performance Ranking from highest to lowest with one-tap drill down.',
      'Maintenance Cost Analytics showing annual rent versus maintenance spend per property.',
      'Profitability Card showing annual rent minus maintenance minus service charges equals net income.',
      'Portfolio Growth year on year comparison.',
      'Service Charge Management module covering Security Levy, Generator Diesel, Water Bill, Estate Due, Waste Disposal, and custom charges.',
      'Owing Tenants table sortable by debt and property.',
      'Export Centre for all tables to PDF, Excel, and CSV.',
      'Bulk Actions for sending notices and downloading receipts across multiple tenants simultaneously.',
      'Saved Filters for one-tap access to frequent list combinations.'
    ]
  },
  {
    id: 'tier-lt-premium',
    name: 'Premium Landlord',
    appliesTo: 'Long-Term Landlord',
    unitLimit: 50,
    monthlyPrice: 42000,
    badge: 'UP TO 50 UNITS',
    features: [
      'Everything in Growth, plus:',
      'Staff Accountability with caretaker inspection photo logs and last-inspection tracking.',
      'Four contextual Dispute Center triggers for payment, maintenance cost, vacancy, and remittance disputes.',
      'Document Health Tracker showing expired, expiring, and complete documents across the portfolio.',
      'Audit History on every property, tenancy, and bank account record.',
      'Full Activity Timeline showing every event in the portfolio’s history permanently.',
      'Priority support with 4-hour response time for urgent issues.'
    ]
  },

  // SHORTLET LANDLORDS
  {
    id: 'tier-sl-starter',
    name: 'Shortlet Starter',
    appliesTo: 'Shortlet Landlord',
    unitLimit: 10,
    monthlyPrice: 12000,
    badge: 'UP TO 10 UNITS',
    features: [
      'Real-time booking visibility, every booking logged by your manager appears on your dashboard immediately.',
      'Paired Booking and Remittance view showing money collected versus money received side by side for every period.',
      'Manager Oversight showing agreed commission percentage, dispute rate, and remittance speed per manager.',
      'Outstanding Remittances card in red when money has been collected but not yet sent to you.',
      'Revenue Analytics by week, month, quarter, and year.',
      'Expense Centre tracking management fees, maintenance costs, and platform subscription.',
      'Rate Management with manager proposal and landlord approval workflow for nightly rate changes.',
      'Caution Deposit and Damage Mediation logs for every checkout.',
      'Rate History showing every nightly rate ever set on each apartment.',
      'Property folder structure showing all apartments under each assigned manager.',
      'Document vault for management agreements, inspection reports, and receipts.',
      'Morning Briefing with revenue and remittance summary each day.'
    ]
  },
  {
    id: 'tier-sl-growth',
    name: 'Shortlet Growth',
    appliesTo: 'Shortlet Landlord',
    unitLimit: 25,
    monthlyPrice: 25000,
    popular: true,
    badge: 'UP TO 25 UNITS',
    features: [
      'Everything in Starter, plus:',
      'Property Performance Ranking by revenue, occupancy, average nightly rate, and bookings.',
      'Booking Intelligence showing average stay duration, most common booking source, and longest vacancy.',
      'Export Centre for booking logs, remittance history, and expense records.',
      'Audit History on apartment records and rate changes.',
      'Six month commission history chart per apartment.'
    ]
  },

  // PROPERTY MANAGEMENT COMPANIES (PMC)
  {
    id: 'tier-pmc-starter',
    name: 'PMC Starter',
    appliesTo: 'PMC',
    unitLimit: 50,
    monthlyPrice: 65000,
    badge: 'UP TO 50 UNITS',
    features: [
      'Multi-landlord portfolio management with full Landlord-Property-Unit-Tenant hierarchy expandable in three taps.',
      'Landlord Transparency Center showing Expected, Collected, Remitted, Management Fee, and Fully Accounted status calculated live for every property.',
      'Money Awaiting Remittance card in red whenever collected rent has not yet been sent to a landlord.',
      'Per-landlord management fee percentage stored and used in all calculations automatically.',
      'Service Charge Management module with Security Levy, Generator Diesel, Water Bill, Estate Due, Waste Disposal, Cleaning Fee, Internet, and custom categories each with independent frequency settings.',
      'Owing Tenants table with Bulk Defaulter Report exportable as PDF and Excel.',
      'Branded PDF report generation per landlord client with delivery tracking.',
      'Collection Manager staff sub-role with restricted access to payment tracking only.',
      'Lease Renewal Center showing all upcoming lease decisions across the portfolio.',
      'Tenant complaint handling with correct routing based on property management type.',
      'Broadcast Centre for sending notices to all managed tenants or specific properties.',
      'Service Charge Health card per landlord client.',
      'Caution deposit mediation logs for shortlet properties in the managed portfolio.',
      'Morning Briefing with portfolio-wide operational summary each day.',
      'Unity Homes admin support access.'
    ]
  },
  {
    id: 'tier-pmc-growth',
    name: 'PMC Growth',
    appliesTo: 'PMC',
    unitLimit: 150,
    monthlyPrice: 150000,
    popular: true,
    badge: 'UP TO 150 UNITS',
    features: [
      'Everything in Starter, plus:',
      'PMC Financial Analytics showing management fees earned separately from rent collected with a 6-month fee income chart.',
      'Risk and Compliance Center showing expired documents, unresolved disputes, pending verifications, and leases with no renewal decision.',
      'Maintenance Performance Tracker showing average resolution time, most frequent issue type, and total spend per property.',
      'Full Export Centre across all lists and tables.',
      'Bulk Actions for tenant notices, receipt downloads, and reminder sends.',
      'Saved Filters across all lists.',
      'Most Profitable Landlord Client ranking by management fee generated.'
    ]
  },
  {
    id: 'tier-pmc-enterprise',
    name: 'PMC Enterprise',
    appliesTo: 'PMC',
    unitLimit: 'unlimited',
    monthlyPrice: 280000,
    badge: 'UNLIMITED UNITS',
    features: [
      'Everything in Growth, plus:',
      'Admin override capacity access for temporary unit limit increases.',
      'Priority dispute mediation with direct admin escalation.',
      'Dedicated account relationship with Unity Homes.',
      'Custom reporting periods and bespoke report formats.'
    ]
  }
];

export const loadSubscriptionTiers = (): SubscriptionTier[] => {
  const data = localStorage.getItem('uh_subscription_tiers_v3');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('uh_subscription_tiers_v3', JSON.stringify(initialSubscriptionTiers));
  return initialSubscriptionTiers;
};

export const saveSubscriptionTiers = (tiers: SubscriptionTier[]) => {
  localStorage.setItem('uh_subscription_tiers_v3', JSON.stringify(tiers));
};

export const loadSubscriptionInquiries = (): SubscriptionInquiry[] => {
  const data = localStorage.getItem('uh_subscription_inquiries_v1');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

export const saveSubscriptionInquiry = (inquiry: Omit<SubscriptionInquiry, 'id' | 'timestamp' | 'status'> & { id?: string; timestamp?: string }) => {
  const current = loadSubscriptionInquiries();
  const created: SubscriptionInquiry = {
    ...inquiry,
    id: inquiry.id || 'sub-inq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    timestamp: inquiry.timestamp || new Date().toISOString(),
    status: 'Pending'
  };
  const updated = [created, ...current];
  localStorage.setItem('uh_subscription_inquiries_v1', JSON.stringify(updated));

  // Also log into general VerificationInquiry collection for admin view compatibility
  saveInquiry({
    type: 'PlatformSubscription',
    targetName: inquiry.planName,
    requesterName: inquiry.visitorName,
    requesterPhone: inquiry.visitorPhone,
    requesterEmail: inquiry.visitorEmail || 'visitor@unityhomes.ng',
    planName: `${inquiry.planName} (${inquiry.billingCycle})`
  });

  return created;
};
