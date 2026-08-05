import api from './axios';
import type { Milestone } from '../types';

export const getMilestones = (status?: string) =>
  api.get<Milestone[]>('/api/milestones', { params: status ? { status } : {} });

export const getMilestonesByProject = (projectId: number) =>
  api.get<Milestone[]>(`/api/projects/${projectId}/milestones`);

export const createMilestone = (
  projectId: number,
  data: { title: string; description: string; dueDate: string; evidenceImageUrl?: string | null }
) => api.post<Milestone>(`/api/projects/${projectId}/milestones`, data);

export const updateMilestone = (
  id: number,
  data: Partial<{ title: string; description: string; dueDate: string; status: string; evidenceImageUrl: string }>
) => api.put<Milestone>(`/api/milestones/${id}`, data);
