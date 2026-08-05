export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'IMPLEMENTER' | 'FUNDER';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  targetBudget: number;
  totalSpent: number;
  milestonesCount: number;
  milestonesCompleted: number;
  createdAt: string;
  updatedAt: string;
  amountPledged?: number | null;
  imageUrl?: string | null;
}

export interface Milestone {
  id: number;
  projectId: number;
  projectTitle?: string;
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  totalExpenses: number;
  evidenceImageUrl?: string | null;
  expenses?: Expense[];
}

export interface Expense {
  id: number;
  milestoneId: number;
  milestoneTitle?: string;
  projectId?: number;
  projectTitle?: string;
  description: string;
  amount: number;
  category: 'TRAVEL' | 'EQUIPMENT' | 'PERSONNEL' | 'OTHER';
  date: string;
}

export interface Report {
  project: Project;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  milestoneCompletion: number;
  expensesByCategory: { category: string; amount: number }[];
  milestoneStatus: { status: string; count: number }[];
}

export interface PublicProjectView {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  imageUrl?: string | null;
  targetBudget: number;
  totalPledged: number;
  totalSpent: number;
  milestonesCount: number;
  milestonesCompleted: number;
  createdAt: string;
  milestones: {
    id: number;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    evidenceImageUrl?: string | null;
  }[];
  funders: {
    name: string;
    amountPledged: number;
    pledgedAt: string;
  }[];
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  milestonesCompleted: number;
  recentProjects: Project[];
  budgetVsExpenses: { name: string; budget: number; expenses: number }[];
  milestoneStatusBreakdown: { name: string; value: number }[];
}

export interface FunderDashboardStats {
  totalPledged: number;
  projectsFunded: number;
  milestonesCompleted: number;
  avgCompletionRate: number;
  portfolio: {
    id: number;
    title: string;
    category: string;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
    imageUrl?: string | null;
    myPledge: number;
    targetBudget: number;
    totalSpent: number;
    milestonesCount: number;
    milestonesCompleted: number;
    createdAt: string;
  }[];
  milestoneStatusBreakdown: { name: string; value: number }[];
}
