import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { fetchStats, fetchHierarchy } from '../../services/dashboardService';
import { DashboardStats, SectionGroup, CCCRecord } from '../../types';
import SummaryCards from '../dashboard/SummaryCards';
import FilterBar, { Filters } from '../dashboard/FilterBar';
import SectionAccordion from '../dashboard/SectionAccordion';

const INITIAL_FILTERS: Filters = { search: '', department: '', status: '', priority: '' };

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, hierarchyData] = await Promise.all([fetchStats(), fetchHierarchy()]);
        setStats(statsData);
        setSections(hierarchyData.sections);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Extract unique filter options from all records
  const { departments, statuses, priorities } = useMemo(() => {
    const depts = new Set<string>();
    const stats = new Set<string>();
    const prios = new Set<string>();
    for (const sec of sections) {
      for (const kks of sec.kks_groups) {
        for (const ccc of kks.cccs) {
          if (ccc.department) depts.add(ccc.department);
          if (ccc.ccc_status) stats.add(ccc.ccc_status);
          if (ccc.priority_type) prios.add(ccc.priority_type);
        }
      }
    }
    return {
      departments: Array.from(depts).sort(),
      statuses: Array.from(stats).sort(),
      priorities: Array.from(prios).sort(),
    };
  }, [sections]);

  // Client-side filtering
  const filteredSections = useMemo(() => {
    const search = filters.search.toLowerCase();

    const matchesCCC = (ccc: CCCRecord): boolean => {
      if (filters.department && ccc.department !== filters.department) return false;
      if (filters.status && ccc.ccc_status !== filters.status) return false;
      if (filters.priority && ccc.priority_type !== filters.priority) return false;
      if (search) {
        const haystack = [
          ccc.ccc_number_full, ccc.ccc_description, ccc.kks_code,
          ccc.kks_description, ccc.active_ccc_number, ccc.section_number,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    };

    const result: SectionGroup[] = [];
    for (const sec of sections) {
      const filteredKKS = [];
      for (const kks of sec.kks_groups) {
        const filteredCCCs = kks.cccs.filter(matchesCCC);
        if (filteredCCCs.length > 0) {
          filteredKKS.push({ ...kks, cccs: filteredCCCs, count: filteredCCCs.length });
        }
      }
      if (filteredKKS.length > 0) {
        const count = filteredKKS.reduce((sum, k) => sum + k.count, 0);
        result.push({ ...sec, kks_groups: filteredKKS, count });
      }
    }
    return result;
  }, [sections, filters]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats || stats.total === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No data available
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Upload an Excel file to get started.
        </Typography>
        <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => navigate('/upload')}>
          Go to Upload
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      <SummaryCards stats={stats} />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        departments={departments}
        statuses={statuses}
        priorities={priorities}
      />

      {filteredSections.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>No records match your filters.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredSections.map((sec) => (
            <SectionAccordion key={sec.section_number} section={sec} />
          ))}
        </Box>
      )}
    </Box>
  );
}
