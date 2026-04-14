export const databaseTableSchemas = [
  {
    table: "relocategh_family_members",
    columns: ["id uuid primary key", "full_name text", "relationship text", "date_of_birth date", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_documents",
    columns: ["id uuid primary key", "family_member_id uuid references relocategh_family_members(id)", "document_type text", "status text", "issue_date date", "expiry_date date", "reference_number text", "original_available boolean", "copy_available boolean", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_timeline_tasks",
    columns: ["id uuid primary key", "title text", "category text", "due_date date", "status text", "priority text", "assigned_family_member_id uuid references relocategh_family_members(id)", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_shipping_quotes",
    columns: ["id uuid primary key", "company_name text", "contact_name text", "phone text", "email text", "quote_amount numeric", "currency text", "collection_date date", "estimated_delivery_date date", "shipment_type text", "included_services text[]", "insurance_included boolean", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_housing_options",
    columns: ["id uuid primary key", "property_title text", "rent numeric", "currency text", "location text", "postcode text", "number_of_rooms integer", "advert_link text", "landlord_or_agent_name text", "contact_details text", "deposit_amount numeric", "furnished_status text", "distance_to_school text", "distance_to_hospital text", "viewed boolean", "shortlisted boolean", "decision_status text", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_inventory_rooms",
    columns: ["id uuid primary key", "room_name text", "sort_order integer", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_inventory_items",
    columns: ["id uuid primary key", "room_id uuid references relocategh_inventory_rooms(id)", "item_name text", "quantity integer", "status text", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_school_entries",
    columns: ["id uuid primary key", "family_member_id uuid references relocategh_family_members(id)", "school_name text", "address text", "contact_name text", "contact_details text", "fee_per_year numeric", "application_status text", "year_group text", "distance_from_home text", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_healthcare_entries",
    columns: ["id uuid primary key", "family_member_id uuid references relocategh_family_members(id)", "doctor_name text", "address text", "fee numeric", "contact_details text", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_budget_items",
    columns: ["id uuid primary key", "category text", "item_name text", "planned_cost numeric", "actual_cost numeric", "currency text", "status text", "due_date date", "notes text", "created_at timestamptz", "updated_at timestamptz"],
  },
  {
    table: "relocategh_misc_notes",
    columns: ["id uuid primary key", "title text", "category text", "note_body text", "priority text", "linked_family_member_id uuid references relocategh_family_members(id)", "linked_section text", "date_added date", "created_at timestamptz", "updated_at timestamptz"],
  },
] as const;
