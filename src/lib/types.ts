export type DocumentStatus =
  | "not started"
  | "in progress"
  | "received"
  | "approved"
  | "expired";

export type TaskStatus = "not started" | "in progress" | "blocked" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";
export type InventoryStatus = "present" | "required" | "will purchase in country";
export type ShippingLeg = "first-leg" | "boat-leg" | "final-leg";

export interface ShippingLegQuote {
  leg: ShippingLeg;
  amount: number;
  route: string;
  notes: string;
}

export interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  date_of_birth: string;
  notes: string;
}

export interface RelocationDocument {
  id: string;
  family_member_id: string;
  document_type: "birth certificate" | "CRB document" | "passport" | "visa";
  status: DocumentStatus;
  issue_date: string;
  expiry_date: string;
  reference_number: string;
  original_available: boolean;
  copy_available: boolean;
  notes: string;
}

export interface TimelineTask {
  id: string;
  title: string;
  category: string;
  due_date: string;
  status: TaskStatus;
  priority: Priority;
  assigned_family_member_id: string | null;
  notes: string;
}

export interface ShippingQuote {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  currency: string;
  collection_date: string;
  estimated_delivery_date: string;
  shipment_type: string;
  leg_quotes: ShippingLegQuote[];
  included_services: string[];
  insurance_included: boolean;
  notes: string;
}

export interface HousingOption {
  id: string;
  property_title: string;
  rent: number;
  currency: string;
  location: string;
  postcode: string;
  number_of_rooms: number;
  advert_link: string;
  landlord_or_agent_name: string;
  contact_details: string;
  deposit_amount: number;
  furnished_status: string;
  distance_to_school: string;
  distance_to_hospital: string;
  viewed: boolean;
  shortlisted: boolean;
  decision_status: string;
  notes: string;
}

export interface InventoryRoom {
  id: string;
  room_name: string;
  sort_order: number;
}

export interface InventoryItem {
  id: string;
  room_id: string;
  item_name: string;
  quantity: number;
  status: InventoryStatus;
  notes: string;
}

export interface SchoolEntry {
  id: string;
  family_member_id: string;
  school_name: string;
  address: string;
  contact_name: string;
  contact_details: string;
  fee_per_year: number;
  application_status: string;
  year_group: string;
  distance_from_home: string;
  notes: string;
}

export interface HealthcareEntry {
  id: string;
  family_member_id: string;
  doctor_name: string;
  address: string;
  fee: number;
  contact_details: string;
  notes: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  planned_cost: number;
  actual_cost: number;
  currency: string;
  status: string;
  due_date: string;
  notes: string;
}

export interface MiscNote {
  id: string;
  title: string;
  category: string;
  note_body: string;
  priority: Priority;
  linked_family_member_id: string | null;
  linked_section: string;
  date_added: string;
}

export interface Relocation {
  id: string;
  move_date: string;
  destination: string;
  notes: string;
}
