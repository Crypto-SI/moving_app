import {
  BudgetItem,
  FamilyMember,
  HealthcareEntry,
  HousingOption,
  InventoryItem,
  InventoryRoom,
  MiscNote,
  Relocation,
  RelocationDocument,
  SchoolEntry,
  ShippingContainerWithLegs,
  ShippingQuote,
} from "@/lib/types";

export const moveDate = "2026-08-18";

export const relocation: Relocation = {
  id: "reloc-1",
  move_date: "2026-08-18",
  destination: "Accra, Ghana",
  notes: "",
};

export const familyMembers: FamilyMember[] = [
  { id: "fm-1", full_name: "Ama Mensah", relationship: "Parent", date_of_birth: "1987-03-12", notes: "Primary applicant. Leads housing and shipping decisions.", profile_photo_url: null },
  { id: "fm-2", full_name: "Daniel Mensah", relationship: "Parent", date_of_birth: "1985-11-04", notes: "Tracks budget, visa submissions, and flights.", profile_photo_url: null },
  { id: "fm-3", full_name: "Sena Mensah", relationship: "Child", date_of_birth: "2013-06-22", notes: "Prefers schools with strong arts and science clubs.", profile_photo_url: null },
  { id: "fm-4", full_name: "Kojo Mensah", relationship: "Child", date_of_birth: "2017-09-03", notes: "Needs paediatric healthcare setup within first week after arrival.", profile_photo_url: null },
];

export const documents: RelocationDocument[] = [
  { id: "doc-1", family_member_id: "fm-1", document_type: "passport", status: "approved", issue_date: "2024-06-14", expiry_date: "2034-06-13", reference_number: "UKP-842190", original_available: true, copy_available: true, notes: "Digital scan stored in secure folder." },
  { id: "doc-2", family_member_id: "fm-2", document_type: "visa", status: "in progress", issue_date: "2026-03-02", expiry_date: "2027-03-02", reference_number: "VIS-447102", original_available: false, copy_available: true, notes: "Awaiting embassy appointment confirmation." },
  { id: "doc-3", family_member_id: "fm-3", document_type: "birth certificate", status: "received", issue_date: "2013-06-30", expiry_date: "2035-06-30", reference_number: "BRC-2013-992", original_available: true, copy_available: true, notes: "Certified copy ordered for school admissions." },
  { id: "doc-4", family_member_id: "fm-4", document_type: "DBS certificate", status: "not started", issue_date: "2026-04-20", expiry_date: "2027-04-20", reference_number: "DBS-TBD", original_available: false, copy_available: false, notes: "Required for volunteer school support role." },
  { id: "doc-5", family_member_id: "fm-2", document_type: "passport", status: "expired", issue_date: "2015-01-08", expiry_date: "2025-01-07", reference_number: "UKP-104281", original_available: true, copy_available: true, notes: "Renewal booked for next week." },
  { id: "doc-6", family_member_id: "fm-3", document_type: "visa", status: "approved", issue_date: "2026-02-18", expiry_date: "2027-02-18", reference_number: "VIS-771240", original_available: true, copy_available: true, notes: "Approval letter emailed and archived." },
];

export const shippingQuotes: ShippingQuote[] = [
  {
    id: "ship-1",
    company_name: "Gold Coast Movers",
    contact_name: "Naana Botchway",
    phone: "+233 20 555 0114",
    email: "naana@goldcoastmovers.com",
    currency: "GBP",
    collection_date: "2026-06-12",
    estimated_delivery_date: "2026-07-10",
    shipment_type: "Door-to-door",
    leg_quotes: [
      { leg: "first-leg", amount: 980, route: "Home to UK port", notes: "Packing crew and inland collection." },
      { leg: "boat-leg", amount: 1850, route: "UK port to Tema port", notes: "Shared container, port handling, customs support." },
      { leg: "final-leg", amount: 720, route: "Tema port to Accra residence", notes: "Residence delivery and unpacking room placement." },
    ],
    containers: [
      {
        id: "cont-1",
        shipping_quote_id: "ship-1",
        container_label: "Container 1",
        tracking_number: "GC-2026-4821",
        container_type: "20ft Container",
        leg_quotes: [
          { leg: "first-leg", amount: 980, route: "Home to UK port", notes: "Packing crew and inland collection." },
          { leg: "boat-leg", amount: 1850, route: "UK port to Tema port", notes: "Shared container, port handling, customs support." },
          { leg: "final-leg", amount: 720, route: "Tema port to Accra residence", notes: "Residence delivery and unpacking room placement." },
        ],
      } satisfies ShippingContainerWithLegs,
    ],
    included_services: ["Packing materials", "Customs support", "Delivery to residence"],
    insurance_included: true,
    notes: "Strong combined quote. Best fit when one shipper owns every handoff.",
  },
  {
    id: "ship-2",
    company_name: "Atlantic Port Logistics",
    contact_name: "Chris Appiah",
    phone: "+233 24 111 9021",
    email: "chris@atlanticportlogistics.com",
    currency: "GBP",
    collection_date: "2026-06-14",
    estimated_delivery_date: "2026-07-16",
    shipment_type: "Port-only",
    leg_quotes: [
      { leg: "boat-leg", amount: 1620, route: "UK port to Tema port", notes: "Container loading, sailing, and port coordination." },
      { leg: "final-leg", amount: 690, route: "Tema port to Accra residence", notes: "Local customs runner and truck delivery." },
    ],
    containers: [
      {
        id: "cont-2",
        shipping_quote_id: "ship-2",
        container_label: "Container 1",
        tracking_number: "APL-2026-1190",
        container_type: "40ft Container",
        leg_quotes: [
          { leg: "boat-leg", amount: 1620, route: "UK port to Tema port", notes: "Container loading, sailing, and port coordination." },
          { leg: "final-leg", amount: 690, route: "Tema port to Accra residence", notes: "Local customs runner and truck delivery." },
        ],
      } satisfies ShippingContainerWithLegs,
    ],
    included_services: ["Container loading", "Port coordination"],
    insurance_included: false,
    notes: "Lowest boat leg. Needs separate collection support before port handoff.",
  },
  {
    id: "ship-3",
    company_name: "Heritage Family Relocations",
    contact_name: "Esi Owusu",
    phone: "+233 55 908 2210",
    email: "esi@heritagerelocations.com",
    currency: "GBP",
    collection_date: "2026-06-10",
    estimated_delivery_date: "2026-07-08",
    shipment_type: "Origin plus sea freight",
    leg_quotes: [
      { leg: "first-leg", amount: 860, route: "Home to UK port", notes: "Survey visit, packing crew, and inventory labels." },
      { leg: "boat-leg", amount: 1760, route: "UK port to Tema port", notes: "Dedicated crate space with customs paperwork." },
    ],
    containers: [
      {
        id: "cont-3",
        shipping_quote_id: "ship-3",
        container_label: "Container 1",
        tracking_number: "HFR-2026-7745",
        container_type: "20ft Container",
        leg_quotes: [
          { leg: "first-leg", amount: 860, route: "Home to UK port", notes: "Survey visit, packing crew, and inventory labels." },
          { leg: "boat-leg", amount: 1760, route: "UK port to Tema port", notes: "Dedicated crate space with customs paperwork." },
        ],
      } satisfies ShippingContainerWithLegs,
      {
        id: "cont-4",
        shipping_quote_id: "ship-3",
        container_label: "Container 2",
        tracking_number: "HFR-2026-7746",
        container_type: "Box",
        leg_quotes: [
          { leg: "first-leg", amount: 200, route: "Home to UK port", notes: "Small box collection." },
          { leg: "boat-leg", amount: 350, route: "UK port to Tema port", notes: "Shared crate space." },
        ],
      } satisfies ShippingContainerWithLegs,
    ],
    included_services: ["Survey visit", "Packing crew", "Storage for 14 days"],
    insurance_included: true,
    notes: "Preferred for the first leg. Useful if final delivery is handled locally.",
  },
];

export const housingOptions: HousingOption[] = [
  { id: "home-1", property_title: "Palm Court Townhouse", rent: 2800, currency: "USD", location: "East Legon, Accra", postcode: "GL-110-2213", number_of_rooms: 4, advert_link: "https://example.com/palm-court", landlord_or_agent_name: "Ava Realty Ghana", contact_details: "hello@avarealty.gh | +233 30 000 2211", deposit_amount: 5600, furnished_status: "Furnished", distance_to_school: "12 mins", distance_to_hospital: "10 mins", viewed: true, shortlisted: true, decision_status: "accepted", notes: "Bright family layout, generator backup, and secure compound.", image_url: "", has_boys_quarters: true },
  { id: "home-2", property_title: "Cantonments Garden Flat", rent: 3200, currency: "USD", location: "Cantonments, Accra", postcode: "CT-401-8844", number_of_rooms: 3, advert_link: "https://example.com/cantonments-garden", landlord_or_agent_name: "North Axis Properties", contact_details: "leasing@northaxis.com | +233 24 004 1200", deposit_amount: 6400, furnished_status: "Unfurnished", distance_to_school: "8 mins", distance_to_hospital: "7 mins", viewed: true, shortlisted: true, decision_status: "shortlisted", notes: "Premium location and close to clinics, but higher furnishing setup cost.", image_url: "", has_boys_quarters: false },
  { id: "home-3", property_title: "Airport Residential Duplex", rent: 2500, currency: "USD", location: "Airport Residential Area, Accra", postcode: "AR-819-2011", number_of_rooms: 4, advert_link: "https://example.com/airport-duplex", landlord_or_agent_name: "Kojo Dwumfour", contact_details: "kojo@dwumfourhomes.gh | +233 26 881 1004", deposit_amount: 5000, furnished_status: "Semi-furnished", distance_to_school: "15 mins", distance_to_hospital: "12 mins", viewed: false, shortlisted: false, decision_status: "under review", notes: "Largest layout. Need video tour and neighbourhood traffic check.", image_url: "", has_boys_quarters: true },
];

export const inventoryRooms: InventoryRoom[] = [
  { id: "room-1", room_name: "Main bedroom", sort_order: 1 },
  { id: "room-2", room_name: "Children’s bedroom", sort_order: 2 },
  { id: "room-3", room_name: "Kitchen", sort_order: 3 },
  { id: "room-4", room_name: "Living room", sort_order: 4 },
  { id: "room-5", room_name: "Bathroom", sort_order: 5 },
  { id: "room-6", room_name: "Office", sort_order: 6 },
  { id: "room-7", room_name: "Storage", sort_order: 7 },
  { id: "room-8", room_name: "Travel essentials", sort_order: 8 },
];

export const inventoryItems: InventoryItem[] = [
  { id: "item-1", room_id: "room-1", item_name: "King duvet set", quantity: 2, status: "present", notes: "Pack in vacuum storage bags." },
  { id: "item-2", room_id: "room-2", item_name: "Desk lamps", quantity: 2, status: "required", notes: "Buy after confirming voltage compatibility." },
  { id: "item-3", room_id: "room-3", item_name: "Air fryer", quantity: 1, status: "will purchase in country", notes: "Better to buy locally with warranty." },
  { id: "item-4", room_id: "room-4", item_name: "Modular sofa", quantity: 1, status: "present", notes: "Shipping company needs dimensions." },
  { id: "item-5", room_id: "room-5", item_name: "First-week toiletries kit", quantity: 4, status: "required", notes: "Keep in checked luggage, not shipment." },
  { id: "item-6", room_id: "room-6", item_name: "Standing desk", quantity: 1, status: "present", notes: "Disassemble before collection day." },
  { id: "item-7", room_id: "room-7", item_name: "Storage bins", quantity: 6, status: "required", notes: "Needed for documents and arrival supplies." },
  { id: "item-8", room_id: "room-8", item_name: "Arrival folder", quantity: 1, status: "present", notes: "Include passports, approvals, contacts, and school letters." },
];

export const schoolEntries: SchoolEntry[] = [
  { id: "school-1", family_member_id: "fm-3", school_name: "Lincoln Community School", address: "126 Jungle Rd, East Legon, Accra", contact_name: "Admissions Office", contact_details: "admissions@lincoln.edu.gh | +233 30 221 1700", fee_per_year: 13450, application_status: "interview scheduled", year_group: "Year 8", distance_from_home: "14 mins", notes: "Strong arts programme and supportive transition team." },
  { id: "school-2", family_member_id: "fm-4", school_name: "Roman Ridge School", address: "Roman Ridge, Accra", contact_name: "Early Years Coordinator", contact_details: "hello@romanridge.org | +233 30 278 3110", fee_per_year: 8900, application_status: "documents requested", year_group: "Year 1", distance_from_home: "18 mins", notes: "Good pastoral support and easy airport-area commute." },
];

export const healthcareEntries: HealthcareEntry[] = [
  { id: "health-1", family_member_id: "fm-1", doctor_name: "Dr. Akosua Hammond", address: "Nyaho Medical Centre, Airport Residential, Accra", fee: 90, contact_details: "+233 30 708 6490 | nyaho.com", notes: "Recommended for adult primary care and fast onboarding." },
  { id: "health-2", family_member_id: "fm-2", doctor_name: "Dr. Sena Ofori", address: "Lister Hospital, Airport Residential, Accra", fee: 75, contact_details: "+233 30 274 0970 | listerhospital.com.gh", notes: "Good fit for routine family health and specialist referrals." },
  { id: "health-3", family_member_id: "fm-4", doctor_name: "Dr. Miriam Quaye", address: "The Trust Hospital, Osu, Accra", fee: 110, contact_details: "+233 30 277 0741 | thetrusthospital.com", notes: "Paediatric option with weekend clinic availability." },
];

export const budgetItems: BudgetItem[] = [
  { id: "budget-1", category: "documents", item_name: "Passport renewals", planned_cost: 450, actual_cost: 320, currency: "GBP", status: "in progress", due_date: "2026-04-22", notes: "One family passport still pending." },
  { id: "budget-2", category: "visas", item_name: "Family visa applications", planned_cost: 1350, actual_cost: 1350, currency: "GBP", status: "submitted", due_date: "2026-04-30", notes: "Main payment complete." },
  { id: "budget-3", category: "flights", item_name: "One-way relocation flights", planned_cost: 2800, actual_cost: 0, currency: "GBP", status: "not booked", due_date: "2026-05-18", notes: "Price tracking active." },
  { id: "budget-4", category: "shipping", item_name: "Door-to-door container shipment", planned_cost: 4200, actual_cost: 0, currency: "GBP", status: "quote selected", due_date: "2026-06-12", notes: "Awaiting final approval." },
  { id: "budget-5", category: "housing", item_name: "Deposit and first month rent", planned_cost: 8400, actual_cost: 2800, currency: "USD", status: "deposit paid", due_date: "2026-05-30", notes: "Remaining due on handover." },
  { id: "budget-6", category: "schooling", item_name: "First-term fees", planned_cost: 22350, actual_cost: 0, currency: "USD", status: "awaiting invoices", due_date: "2026-07-05", notes: "Two children enrolled." },
  { id: "budget-7", category: "healthcare", item_name: "Initial family consultations", planned_cost: 400, actual_cost: 0, currency: "USD", status: "planned", due_date: "2026-08-25", notes: "Set after arrival." },
  { id: "budget-8", category: "furnishings", item_name: "Local home setup essentials", planned_cost: 2500, actual_cost: 650, currency: "USD", status: "in progress", due_date: "2026-08-28", notes: "Prioritise kids' beds and kitchen basics." },
  { id: "budget-9", category: "miscellaneous", item_name: "Buffer fund", planned_cost: 1500, actual_cost: 0, currency: "GBP", status: "held", due_date: "2026-08-18", notes: "Contingency for customs and utilities." },
];

export const miscNotes: MiscNote[] = [
  { id: "note-1", title: "Arrival week essentials", category: "settling in", note_body: "Book airport pickup, SIM cards, grocery starter shop, and school uniform fitting within first 72 hours.", priority: "high", linked_family_member_id: null, linked_section: "Moving Timeline", date_added: "2026-04-10" },
  { id: "note-2", title: "Neighbourhood shortlist", category: "housing", note_body: "East Legon feels strongest for school commute. Cantonments still best for healthcare access and shorter airport trips.", priority: "medium", linked_family_member_id: "fm-1", linked_section: "Housing", date_added: "2026-04-09" },
  { id: "note-3", title: "School document pack", category: "schooling", note_body: "Need transfer letters, two passport photos each, immunisation records, and proof of current year attainment.", priority: "urgent", linked_family_member_id: "fm-3", linked_section: "Schooling", date_added: "2026-04-12" },
];

export const recentActivity = [
  { id: "activity-1", title: "Housing offer moved to accepted", detail: "Palm Court Townhouse now leads the shortlist with contract review underway.", timestamp: "2 hours ago" },
  { id: "activity-2", title: "Visa status updated", detail: "Sena's visa approval letter was uploaded and marked complete.", timestamp: "Yesterday" },
  { id: "activity-3", title: "Shipping quote added", detail: "Heritage Family Relocations sent a premium door-to-door quote.", timestamp: "2 days ago" },
];

export const quickLinks = [
  { href: "/documents", label: "Finish document pack" },
  { href: "/shipping", label: "Compare shipping quotes" },
  { href: "/housing", label: "Check housing shortlist" },
];
