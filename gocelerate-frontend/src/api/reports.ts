import api from './axios';
import type { Report } from '../types';

export const getReport = (projectId: number) =>
  api.get<Report>(`/api/projects/${projectId}/report`);
