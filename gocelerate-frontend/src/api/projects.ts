import api from './axios';
import type { Project, DashboardStats, FunderDashboardStats, PublicProjectView } from '../types';

export const getProjects = (status?: string) =>
  api.get<Project[]>('/api/projects', { params: status ? { status } : {} });

export const getProject = (id: number) =>
  api.get<Project>(`/api/projects/${id}`);

export const createProject = (data: {
  title: string;
  description: string;
  category: string;
  targetBudget: number;
  imageUrl?: string | null;
}) => api.post<Project>('/api/projects', data);

export const updateProjectStatus = (id: number, status: string) =>
  api.patch<Project>(`/api/projects/${id}/status`, { status });

export const fundProject = (id: number, amountPledged: number) =>
  api.post<Project>(`/api/projects/${id}/fund`, { amountPledged });

export const getDashboardStats = () =>
  api.get<DashboardStats>('/api/dashboard/stats');

export const getFunderDashboardStats = () =>
  api.get<FunderDashboardStats>('/api/dashboard/funder-stats');

export const getPublicProject = (id: number) =>
  api.get<PublicProjectView>(`/api/public/projects/${id}`);
