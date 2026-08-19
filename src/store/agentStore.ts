import { create } from 'zustand';
import type { AgentStatus } from '../types';

interface AgentFilters {
  search: string;
  status: AgentStatus | 'all';
  environment: 'all' | 'staging' | 'production';
}

interface AgentUIState {
  // ── filters & view state ───────────────────────────────────────
  filters: AgentFilters;
  selectedAgentId: string | null;
  deployModalOpen: boolean;

  // ── actions ────────────────────────────────────────────────────
  setSearch: (v: string) => void;
  setStatusFilter: (s: AgentFilters['status']) => void;
  setEnvironmentFilter: (e: AgentFilters['environment']) => void;
  selectAgent: (id: string | null) => void;
  openDeployModal: () => void;
  closeDeployModal: () => void;
  resetFilters: () => void;
}

const defaultFilters: AgentFilters = {
  search: '',
  status: 'all',
  environment: 'all',
};

export const useAgentStore = create<AgentUIState>((set) => ({
  filters: defaultFilters,
  selectedAgentId: null,
  deployModalOpen: false,

  setSearch: (v) =>
    set((state) => ({ filters: { ...state.filters, search: v } })),

  setStatusFilter: (s) =>
    set((state) => ({ filters: { ...state.filters, status: s } })),

  setEnvironmentFilter: (e) =>
    set((state) => ({ filters: { ...state.filters, environment: e } })),

  selectAgent: (id) => set({ selectedAgentId: id }),

  openDeployModal: () => set({ deployModalOpen: true }),
  closeDeployModal: () => set({ deployModalOpen: false }),

  resetFilters: () => set({ filters: defaultFilters }),
}));
