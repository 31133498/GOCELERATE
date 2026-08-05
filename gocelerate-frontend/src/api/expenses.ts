import api from './axios';
import type { Expense } from '../types';

export const getExpenses = (params?: { category?: string; from?: string; to?: string }) =>
  api.get<Expense[]>('/api/expenses', { params });

export const logExpense = (
  milestoneId: number,
  data: { description: string; amount: number; category: string; date: string }
) => api.post<Expense>(`/api/milestones/${milestoneId}/expenses`, data);
