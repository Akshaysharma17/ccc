export interface FormatStatus {
  applicable: string | null;
  cleared: string | null;
}

export interface TeamHandover {
  engineering: string | null;
  procurement: string | null;
  quality: string | null;
  civil: string | null;
  mechanical: string | null;
  electrical: string | null;
  c_and_i: string | null;
}

export interface CCCRecord {
  priority_type: string | null;
  department: string | null;
  section_number: string | null;
  section_name: string | null;
  serial_number: string | null;
  kks_code: string | null;
  kks_description: string | null;
  ccc_number_full: string | null;
  ccc_number_part: string | null;
  part_or_full: string | null;
  active_ccc_number: string | null;
  ccc_description: string | null;
  format_1: FormatStatus;
  format_2: FormatStatus;
  format_3: FormatStatus;
  format_4: FormatStatus;
  format_5: FormatStatus;
  ccc_status: string;
  hd_report: string | null;
  erection_report_1: string | null;
  erection_report_2: string | null;
  team_handover: TeamHandover;
  target_date: string | null;
  excel_row: number | null;
}

export interface KKSGroup {
  kks_code: string;
  kks_description: string;
  cccs: CCCRecord[];
  count: number;
}

export interface SectionGroup {
  section_number: string;
  section_name: string;
  kks_groups: KKSGroup[];
  count: number;
}

export interface HierarchyResponse {
  sections: SectionGroup[];
  total: number;
}

export interface DashboardStats {
  total: number;
  by_status: Record<string, number>;
  by_department: Record<string, number>;
  by_priority: Record<string, number>;
}

export interface UploadResponse {
  status: string;
  records_inserted: number;
}

export interface ReportItem {
  serial_number: string;
  ccc_description: string;
  kks_description: string;
  kks_code: string;
  ccc_number_full: string;
  ccc_status: string;
}

export interface Annotation {
  person_name: string;
  remarks: string;
}

export type AnnotationsMap = Record<string, Annotation>;

export interface ReportCategory {
  sno: number;
  title: string;
  count: number;
  items: ReportItem[];
}

export interface SectionReport {
  section_number: string;
  section_name: string;
  kks_codes: string[];
  total: number;
  summary: {
    submitted: number;
    pending: number;
    approved: number;
    in_process: number;
    returned: number;
  };
  categories: ReportCategory[];
}
