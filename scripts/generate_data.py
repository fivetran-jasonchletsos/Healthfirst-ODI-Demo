"""Generates synthetic Healthfirst-style seed data for the dbt project.

Mirrors the three Mutual Evaluation Plan source systems:
  - Oracle Database  -> members, providers, claims (core policy/claims admin)
  - Salesforce       -> member service cases, outreach campaigns (CRM)
  - S3 / SharePoint  -> a document manifest (EOBs, prior-auth forms, credentialing packets)

All data is synthetic and seeded (random.seed(42)) for reproducibility. No real
member, provider, or claim data is used anywhere in this repo.
"""

import csv
import random
from pathlib import Path

random.seed(42)

SEEDS_DIR = Path(__file__).resolve().parent.parent / "transform" / "seeds"
SEEDS_DIR.mkdir(parents=True, exist_ok=True)

PLAN_TYPES = ["Medicaid", "Medicare Advantage", "Qualified Health Plan", "Long-Term Care"]
NY_COUNTIES = [
    "Bronx", "Kings", "New York", "Queens", "Richmond", "Nassau", "Suffolk", "Westchester", "Orange", "Rockland",
]
SPECIALTIES = [
    "Primary Care", "Cardiology", "Behavioral Health", "OB/GYN", "Pediatrics", "Endocrinology", "Orthopedics",
    "Oncology", "Nephrology", "Pulmonology",
]
CLAIM_STATUSES = ["Paid", "Denied", "Pending", "Under Review"]
CASE_TYPES = [
    "Appeal / Grievance", "Enrollment Support", "Benefits Question", "Prior Authorization Follow-up",
    "Provider Network Inquiry", "Care Coordination",
]
CASE_PRIORITIES = ["Low", "Medium", "High", "Urgent"]
CAMPAIGN_NAMES = [
    "Annual Wellness Visit Reminder", "Flu Vaccination Outreach", "Diabetes Screening Campaign",
    "Medicare Advantage Star Ratings Survey", "Postpartum Care Follow-up", "Chronic Care Management Enrollment",
]
DOC_TYPES = ["EOB", "Prior Authorization Form", "Provider Credentialing Packet", "Grievance Correspondence", "Member ID Card Request"]

N_MEMBERS = 4000
N_PROVIDERS = 350
N_CLAIMS = 9000
N_CASES = 2200
N_CAMPAIGNS = 24
N_DOCUMENTS = 3000


def write_csv(name, header, rows):
    path = SEEDS_DIR / name
    with path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)
    print(f"wrote {len(rows)} rows -> {path}")


def gen_members():
    rows = []
    for i in range(1, N_MEMBERS + 1):
        member_id = f"HF-M-{i:06d}"
        plan = random.choices(PLAN_TYPES, weights=[35, 30, 25, 10])[0]
        county = random.choice(NY_COUNTIES)
        enroll_year = random.choice([2022, 2023, 2024, 2025, 2026])
        enroll_month = random.randint(1, 12)
        status = random.choices(["Active", "Active", "Active", "Disenrolled"], weights=[70, 15, 10, 5])[0]
        rows.append([member_id, plan, county, f"{enroll_year}-{enroll_month:02d}-01", status])
    write_csv("members.csv", ["member_id", "plan_type", "county", "enrollment_date", "status"], rows)
    return [r[0] for r in rows]


def gen_providers():
    rows = []
    for i in range(1, N_PROVIDERS + 1):
        provider_id = f"HF-P-{i:05d}"
        specialty = random.choice(SPECIALTIES)
        network_status = random.choices(["In-Network", "In-Network", "Out-of-Network"], weights=[80, 10, 10])[0]
        hospital_affiliated = random.random() < 0.4
        rows.append([provider_id, specialty, network_status, "Y" if hospital_affiliated else "N"])
    write_csv("providers.csv", ["provider_id", "specialty", "network_status", "hospital_affiliated"], rows)
    return [r[0] for r in rows]


def gen_claims(member_ids, provider_ids):
    rows = []
    for i in range(1, N_CLAIMS + 1):
        claim_id = f"HF-C-{i:07d}"
        member_id = random.choice(member_ids)
        provider_id = random.choice(provider_ids)
        year = random.choice([2025, 2026])
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        amount = round(random.uniform(45, 8500), 2)
        status = random.choices(CLAIM_STATUSES, weights=[72, 8, 12, 8])[0]
        rows.append([claim_id, member_id, provider_id, f"{year}-{month:02d}-{day:02d}", amount, status])
    write_csv(
        "claims.csv",
        ["claim_id", "member_id", "provider_id", "service_date", "claim_amount", "status"],
        rows,
    )


def gen_salesforce_cases(member_ids):
    rows = []
    for i in range(1, N_CASES + 1):
        case_id = f"HF-CASE-{i:06d}"
        member_id = random.choice(member_ids)
        case_type = random.choice(CASE_TYPES)
        priority = random.choices(CASE_PRIORITIES, weights=[35, 35, 22, 8])[0]
        status = random.choices(["Closed", "Closed", "Open", "Escalated"], weights=[55, 20, 18, 7])[0]
        year = random.choice([2025, 2026])
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        rows.append([case_id, member_id, case_type, priority, status, f"{year}-{month:02d}-{day:02d}"])
    write_csv(
        "salesforce_cases.csv",
        ["case_id", "member_id", "case_type", "priority", "status", "created_date"],
        rows,
    )


def gen_salesforce_campaigns():
    rows = []
    for i in range(1, N_CAMPAIGNS + 1):
        campaign_id = f"HF-CAMP-{i:04d}"
        name = random.choice(CAMPAIGN_NAMES)
        audience = random.randint(1500, 60000)
        response_rate = round(random.uniform(4.5, 38.0), 1)
        year = random.choice([2025, 2026])
        month = random.randint(1, 12)
        rows.append([campaign_id, name, audience, response_rate, f"{year}-{month:02d}-01"])
    write_csv(
        "salesforce_campaigns.csv",
        ["campaign_id", "campaign_name", "audience_size", "response_rate_pct", "sent_date"],
        rows,
    )


def gen_documents(member_ids, provider_ids):
    rows = []
    for i in range(1, N_DOCUMENTS + 1):
        doc_id = f"HF-DOC-{i:06d}"
        doc_type = random.choice(DOC_TYPES)
        subject_id = random.choice(provider_ids) if doc_type == "Provider Credentialing Packet" else random.choice(member_ids)
        size_kb = random.randint(80, 4200)
        year = random.choice([2025, 2026])
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        classification = "PHI" if doc_type in ("EOB", "Prior Authorization Form", "Grievance Correspondence") else "Internal"
        rows.append([doc_id, doc_type, subject_id, size_kb, f"{year}-{month:02d}-{day:02d}", classification])
    write_csv(
        "documents_manifest.csv",
        ["doc_id", "doc_type", "subject_id", "file_size_kb", "upload_date", "classification"],
        rows,
    )


if __name__ == "__main__":
    member_ids = gen_members()
    provider_ids = gen_providers()
    gen_claims(member_ids, provider_ids)
    gen_salesforce_cases(member_ids)
    gen_salesforce_campaigns()
    gen_documents(member_ids, provider_ids)
    print("done")
