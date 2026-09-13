import { create } from 'zustand';
import type { AgentStatus } from '../types';

interface AgentFilters {
  search: string;
  status: AgentStatus | 'all';
}

interface AgentUIState {
  filters: AgentFilters;
  selectedAgentId: string | null;
  createModalOpen: boolean;

  setSearch: (v: string) => void;
  setStatusFilter: (s: AgentFilters['status']) => void;
  selectAgent: (id: string | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  resetFilters: () => void;
}

const defaultFilters: AgentFilters = {
  search: '',
  status: 'all',
};

export const useAgentStore = create<AgentUIState>((set) => ({
  filters: defaultFilters,
  selectedAgentId: null,
  createModalOpen: false,

  setSearch: (v) => set((state) => ({ filters: { ...state.filters, search: v } })),
  setStatusFilter: (s) => set((state) => ({ filters: { ...state.filters, status: s } })),
  selectAgent: (id) => set({ selectedAgentId: id }),
  openCreateModal: () => set({ createModalOpen: true }),
  closeCreateModal: () => set({ createModalOpen: false }),
  resetFilters: () => set({ filters: defaultFilters }),
}));
