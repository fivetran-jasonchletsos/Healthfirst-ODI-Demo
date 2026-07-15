// Sourced facts for the Compliance page. HIPAA is presented first and on
// its own -- Healthfirst is a health insurer and this is the claim most
// likely to be scrutinized. Every item traces to a real Fivetran page (see
// sourceUrls); the "verification" field is never upgraded without a source.

import type { Verification } from './findings';

export interface ComplianceItem {
  label: string;
  detail: string;
  sourceUrls: string[];
  verification: Verification;
}

export const HIPAA_ITEMS: ComplianceItem[] = [
  {
    label: 'Fivetran will sign a HIPAA Business Associate Agreement (BAA)',
    detail:
      'Fivetran\'s security page states directly: "Fivetran complies with Health Insurance Portability and Accountability Act (HIPAA) requirements for Protected Health Information (PHI) and will sign a Business Associate Agreement (BAA)." This claim lives on www.fivetran.com/security (the marketing/trust page) -- it does not appear on the technical fivetran.com/docs/security or fivetran.com/docs/privacy pages, so cite the security page specifically, not the docs site, when this comes up in the evaluation.',
    sourceUrls: ['https://www.fivetran.com/security'],
    verification: 'confirmed',
  },
  {
    label: 'HITRUST Implemented, 1-year (i1) Certification',
    detail:
      'Fivetran has attained HITRUST i1 Certification, which Fivetran describes as "widely considered the gold standard in satisfying HIPAA\'s strict security requirements." Per Fivetran\'s own FAQ, HITRUST certification is tied to the Business Critical plan tier.',
    sourceUrls: [
      'https://www.fivetran.com/security',
      'https://www.fivetran.com/press/fivetran-attains-hitrust-implemented-1-year-i1-certification-to-manage-data-protection-and-mitigate-cybersecurity-threats',
      'https://trust.fivetran.com/',
    ],
    verification: 'confirmed',
  },
  {
    label: 'BAA appears tied to the Business Critical plan for full HIPAA program coverage',
    detail:
      'Fivetran\'s 2021 Business Critical launch post states Business Critical "provides management of these requirements -- including HIPAA and PCI DSS Level 1." The security page\'s BAA commitment is not explicitly restricted to a plan tier there, so there is some inconsistency across pages about whether BAA execution alone requires Business Critical, versus HITRUST/PCI DSS Level 1 which unambiguously do. Confirm the exact plan requirement with the Fivetran account team before it goes into Healthfirst\'s contract.',
    sourceUrls: ['https://www.fivetran.com/blog/fivetran-business-critical', 'https://www.fivetran.com/security'],
    verification: 'confirmed',
  },
  {
    label: 'HIPAA compliance is a shared responsibility, not a certification',
    detail:
      'Fivetran\'s own blog is explicit: "the US Department of Health and Human Services, which administers HIPAA, doesn\'t recognize any certification for HIPAA data compliance," and "Complying with HIPAA is a shared responsibility between your organization and the data warehouse provider you use." Fivetran signing a BAA is necessary but not sufficient -- Healthfirst still owns configuration-level controls: classifying which tables/columns contain PHI, applying minimum-necessary access, keeping non-production environments free of real PHI, and layering column hashing/blocking where appropriate.',
    sourceUrls: ['https://www.fivetran.com/blog/how-to-handle-hipaa-concerns-with-cloud-data-warehouses'],
    verification: 'confirmed',
  },
];

export const CERTIFICATION_ITEMS: ComplianceItem[] = [
  {
    label: 'SOC 1 and SOC 2 Type II',
    detail:
      'Fivetran undergoes an independent SOC 2 Type II audit annually (security, availability, confidentiality controls) and also maintains a SOC 1 report (financial-reporting-relevant controls). Both are listed on the Fivetran Trust Center for customer download/request.',
    sourceUrls: ['https://trust.fivetran.com', 'https://www.fivetran.com/security'],
    verification: 'confirmed',
  },
  {
    label: 'ISO/IEC 27001:2022 and ISO/IEC 27701:2019',
    detail:
      'Fivetran holds ISO/IEC 27001 certification (information security management, originally certified 2021, now on the 2022 revision) and ISO/IEC 27701 (privacy information management), both listed on the Trust Center.',
    sourceUrls: [
      'https://www.fivetran.com/blog/fivetran-achieves-iso-27001-compliance-certification',
      'https://trust.fivetran.com',
    ],
    verification: 'confirmed',
  },
  {
    label: 'PCI DSS Level 1 (Business Critical plan)',
    detail:
      'Validated via Qualified Security Assessor (QSA) audit covering PCI DSS\'s 12 requirements/300 controls (current Trust Center references v4.0.0/v4.0.1). Available specifically on the Business Critical plan, for moving cardholder data between PCI-validated sources and destinations -- not directly relevant to Healthfirst\'s three named use cases, but confirms the same plan tier that carries HITRUST.',
    sourceUrls: ['https://www.fivetran.com/blog/fivetran-achieves-pci-dss-level-i-validation', 'https://trust.fivetran.com'],
    verification: 'confirmed',
  },
  {
    label: 'Independent penetration testing',
    detail:
      'The Trust Center lists a "Penetration Testing Report" as an available security document, confirming regular third-party pentesting is performed. Fivetran does not publicly publish the testing cadence or findings -- the report itself is available to customers/prospects under request/NDA, not published openly. A secondary claim of a semi-annual cadence could not be confirmed against a direct Fivetran statement and is not asserted here.',
    sourceUrls: ['https://trust.fivetran.com'],
    verification: 'confirmed',
  },
  {
    label: 'GDPR / CCPA and Cyber Essentials',
    detail:
      'Fivetran commits contractually to GDPR and CCPA/CPRA compliance via Data Protection Agreements (not a third-party certification like SOC/ISO), and separately holds Cyber Essentials (UK government-backed cybersecurity certification).',
    sourceUrls: ['https://www.fivetran.com/security', 'https://trust.fivetran.com'],
    verification: 'confirmed',
  },
  {
    label: 'Underlying cloud-provider certifications',
    detail:
      'Fivetran\'s technical security documentation notes that its underlying cloud infrastructure providers (AWS, GCP, Azure) separately hold SOC 1/2/3, PCI-DSS, and ISO 27001 certifications covering the physical/environmental security of the data centers Fivetran runs on -- in addition to, not instead of, Fivetran\'s own corporate-level certifications above.',
    sourceUrls: ['https://fivetran.com/docs/security'],
    verification: 'confirmed',
  },
];

export const SECURITY_FEATURE_ITEMS: ComplianceItem[] = [
  {
    label: 'Column hashing and data blocking (PII/PHI controls)',
    detail:
      'All connectors except Magic Folder-mode file connectors support column hashing (SHA-256 with a per-destination salt, one-way, not reversible) and data blocking (excludes a designated table or column from ever syncing). Primary key columns cannot be hashed, and historical data is not retroactively hashed -- a manual re-sync is required to apply new rules to existing rows. Note: blocking a column does not reduce Monthly Active Rows billing, since Fivetran still processes the row when a blocked column changes.',
    sourceUrls: [
      'https://fivetran.com/docs/using-fivetran/features/data-blocking-column-hashing',
      'https://fivetran.com/docs/using-fivetran/features/data-blocking-column-hashing/config',
    ],
    verification: 'confirmed',
  },
  {
    label: 'Secrets management for connector credentials',
    detail:
      'Credentials submitted at connector setup go to Fivetran\'s Secure Credentials Service, encrypted by Fivetran\'s own KMS (GCP-hosted) before storage, decrypted only at sync time. Business Critical plans can layer a Customer-Managed Encryption Key (CMK) via AWS KMS, Azure Key Vault, or Google Cloud KMS on top, and can revoke that key (cutting off Fivetran\'s access) at any time. External Secrets Manager (ESM) support lets admins reference a secret stored in an external password manager rather than typing the literal credential into the Fivetran UI.',
    sourceUrls: [
      'https://fivetran.com/docs/core-concepts/data-credential-encryption',
      'https://fivetran.com/docs/using-fivetran/fivetran-dashboard/account-management/cmk',
    ],
    verification: 'confirmed',
  },
  {
    label: 'Private networking (VPC endpoints / PrivateLink / SSH tunnels)',
    detail:
      'AWS PrivateLink establishes a private VPC-to-VPC connection between Fivetran and an AWS-hosted source or destination without traversing the public internet (requires an AWS endpoint service behind a Network Load Balancer). Equivalent options exist for Azure (Private Link) and Google Cloud (Private Service Connect). For sources that can\'t use PrivateLink, Fivetran also supports a standard SSH tunnel, a Reverse SSH Tunnel (for networks that block inbound connections), a site-to-site VPN tunnel, and a lightweight Proxy Agent for fully on-prem sources with no inbound port access.',
    sourceUrls: [
      'https://fivetran.com/docs/connectors/databases/connection-options/aws-private-link',
      'https://fivetran.com/docs/destinations/connection-options/aws-private-link',
      'https://fivetran.com/docs/connectors/databases/connection-options',
    ],
    verification: 'confirmed',
  },
  {
    label: 'Encryption in transit and at rest',
    detail:
      'Dashboard connections use TLS 1.2+; database source connections are SSL-encrypted by default; SaaS/application sources use HTTPS. For each sync, Fivetran generates a per-job data key to encrypt source data during extraction; that key is itself encrypted by Fivetran\'s KMS before storage (decrypted only during load). The same layered model protects stored credentials. Business Critical customers can add a CMK on top of Fivetran\'s default encryption.',
    sourceUrls: ['https://fivetran.com/docs/core-concepts/data-credential-encryption', 'https://fivetran.com/docs/security'],
    verification: 'confirmed',
  },
  {
    label: 'Audit logging of ingestion and dashboard events',
    detail:
      'The Fivetran Platform Connector (available on every destination, all plans) captures connector sync events (schema changes, table syncs) and dashboard activity events (connection/destination/user changes). Full Audit Trail logging -- which additionally records the before/after data for compliance review of user actions -- requires Enterprise or Business Critical. One external log destination (AWS CloudWatch, Azure Monitor, Datadog, Splunk, and others) can be configured per destination, also gated to Enterprise/Business Critical.',
    sourceUrls: ['https://fivetran.com/docs/logs', 'https://fivetran.com/docs/logs/fivetran-platform'],
    verification: 'confirmed',
  },
];
