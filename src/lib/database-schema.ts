export const databaseTableSchemas = [
  {
    table: "moving_relocations",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null unique references auth.users(id) on delete cascade", "move_date date", "destination text not null default 'Accra, Ghana'", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_family_members",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "full_name text not null", "relationship text not null", "date_of_birth date", "notes text not null default ''", "profile_photo_url text", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_documents",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "family_member_id uuid references moving_family_members(id) on delete cascade", "document_type text not null", "status text not null default 'not started'", "issue_date date", "expiry_date date", "reference_number text not null default ''", "original_available boolean not null default false", "copy_available boolean not null default false", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_shipping_quotes",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "company_name text not null", "contact_name text not null default ''", "phone text not null default ''", "email text not null default ''", "currency text not null default 'GBP'", "collection_date date", "estimated_delivery_date date", "shipment_type text not null default ''", "included_services text[] not null default '{}'", "insurance_included boolean not null default false", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_shipping_containers",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "shipping_quote_id uuid not null references moving_shipping_quotes(id) on delete cascade", "container_label text not null default ''", "tracking_number text not null default ''", "container_type text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_shipping_leg_quotes",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "shipping_quote_id uuid not null references moving_shipping_quotes(id) on delete cascade", "container_id uuid references moving_shipping_containers(id) on delete cascade", "leg text not null", "amount numeric not null default 0", "route text not null default ''", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_housing_options",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "property_title text not null", "rent numeric not null default 0", "currency text not null default 'USD'", "location text not null default ''", "postcode text not null default ''", "number_of_rooms integer not null default 0", "advert_link text not null default ''", "landlord_or_agent_name text not null default ''", "contact_details text not null default ''", "deposit_amount numeric not null default 0", "furnished_status text not null default ''", "distance_to_school text not null default ''", "distance_to_hospital text not null default ''", "viewed boolean not null default false", "shortlisted boolean not null default false", "decision_status text not null default 'under review'", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_inventory_rooms",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "room_name text not null", "sort_order integer not null default 0", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_inventory_items",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "room_id uuid not null references moving_inventory_rooms(id) on delete cascade", "item_name text not null", "quantity integer not null default 1", "status text not null default 'present'", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_school_entries",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "family_member_id uuid references moving_family_members(id) on delete cascade", "school_name text not null", "address text not null default ''", "contact_name text not null default ''", "contact_details text not null default ''", "fee_per_year numeric not null default 0", "application_status text not null default 'not started'", "year_group text not null default ''", "distance_from_home text not null default ''", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_healthcare_entries",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "family_member_id uuid references moving_family_members(id) on delete cascade", "doctor_name text not null", "address text not null default ''", "fee numeric not null default 0", "contact_details text not null default ''", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_budget_items",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "category text not null", "item_name text not null", "planned_cost numeric not null default 0", "actual_cost numeric not null default 0", "currency text not null default 'GBP'", "status text not null default 'planned'", "due_date date", "notes text not null default ''", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
  {
    table: "moving_misc_notes",
    columns: ["id uuid primary key default gen_random_uuid()", "user_id uuid not null references auth.users(id) on delete cascade", "title text not null", "category text not null default ''", "note_body text not null default ''", "priority text not null default 'medium'", "linked_family_member_id uuid references moving_family_members(id) on delete set null", "linked_section text not null default ''", "date_added date", "created_at timestamptz not null default now()", "updated_at timestamptz not null default now()"],
  },
] as const;
