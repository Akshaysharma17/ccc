import api from './api';
import { DashboardStats, HierarchyResponse, SectionReport, AnnotationsMap } from '../types';

export async function fetchStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/api/dashboard/stats');
  return data;
}

export async function fetchHierarchy(): Promise<HierarchyResponse> {
  const { data } = await api.get<HierarchyResponse>('/api/hierarchy/all');
  return data;
}

export async function fetchSectionReport(sectionNumber: string): Promise<SectionReport> {
  const { data } = await api.get<SectionReport>(`/api/report/${encodeURIComponent(sectionNumber)}`);
  return data;
}

export async function fetchAnnotations(sectionNumber: string): Promise<AnnotationsMap> {
  const { data } = await api.get<{ section_number: string; annotations: AnnotationsMap }>(
    `/api/annotations/${encodeURIComponent(sectionNumber)}`
  );
  return data.annotations;
}

export async function saveAnnotation(
  sectionNumber: string,
  serialNumber: string,
  personName: string,
  remarks: string,
): Promise<void> {
  await api.patch('/api/annotations', {
    section_number: sectionNumber,
    serial_number: serialNumber,
    person_name: personName,
    remarks: remarks,
  });
}
