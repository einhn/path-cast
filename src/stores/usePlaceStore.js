import { create } from 'zustand';

export const usePlaceStore = create((set) => ({
  fromKeyword: '',
  toKeyword: '',
  fromCandidates: [],
  toCandidates: [],
  fromSelected: null,
  toSelected: null,
  setFromKeyword: (keyword) => set({ fromKeyword: keyword }),
  setToKeyword: (keyword) => set({ toKeyword: keyword }),
  setFromCandidates: (list) => set({ fromCandidates: list }),
  setToCandidates: (list) => set({ toCandidates: list }),
  setFromSelected: (place) => set({ fromSelected: place }),
  setToSelected: (place) => set({ toSelected: place }),
}));