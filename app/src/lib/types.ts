// Types mirror the exact field names/types emitted by
// scripts/export_marts_to_json.py from the four dbt marts. Keep in sync
// with app/public/data/*.json.

export interface ClaimRow {
  claim_id: string;
  member_id: string;
  plan_type: string;
  county: string;
  provider_id: string;
  specialty: string;
  network_status: string;
  service_date: string;
  claim_amount: number;
  status: string;
}

export interface MemberCaseRow {
  case_id: string;
  member_id: string;
  plan_type: string;
  case_type: string;
  priority: string;
  status: string;
  created_date: string;
}

export interface CampaignPerformanceRow {
  campaign_id: string;
  campaign_name: string;
  audience_size: number;
  response_rate_pct: number;
  sent_date: string;
}

export interface DocumentInventoryRow {
  doc_id: string;
  doc_type: string;
  subject_id: string;
  file_size_kb: number;
  upload_date: string;
  classification: string;
}
