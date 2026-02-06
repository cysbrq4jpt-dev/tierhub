import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MatchupCell, makeMatchupKey } from '@/types/matchup.types';

interface MatchupEditorState {
  // State
  categoryId: string | null;
  title: string;
  description: string;
  patchVersion: string;
  isPublic: boolean;
  characters: string[]; // masterItemId のリスト
  cells: Record<string, MatchupCell>;
  focusedCharacterId: string | null; // フォーカス・ビュー用
  isDirty: boolean;
  isSaving: boolean;

  // Actions
  initializeEditor: (categoryId: string, patchVersion: string) => void;
  resetEditor: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPatchVersion: (version: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  addCharacter: (characterId: string) => void;
  removeCharacter: (characterId: string) => void;
  reorderCharacters: (characters: string[]) => void;
  setCellValue: (charA: string, charB: string, value: number) => void;
  setCellMemo: (charA: string, charB: string, memo: string) => void;
  setFocusedCharacter: (characterId: string | null) => void;
  setSaving: (isSaving: boolean) => void;
}

export const useMatchupEditorStore = create<MatchupEditorState>()(
  immer((set) => ({
    // Initial State
    categoryId: null,
    title: '',
    description: '',
    patchVersion: '',
    isPublic: true,
    characters: [],
    cells: {},
    focusedCharacterId: null,
    isDirty: false,
    isSaving: false,

    // Actions
    initializeEditor: (categoryId, patchVersion) =>
      set((state) => {
        state.categoryId = categoryId;
        state.patchVersion = patchVersion;
        state.title = '';
        state.description = '';
        state.isPublic = true;
        state.characters = [];
        state.cells = {};
        state.focusedCharacterId = null;
        state.isDirty = false;
      }),

    resetEditor: () =>
      set((state) => {
        state.categoryId = null;
        state.title = '';
        state.description = '';
        state.patchVersion = '';
        state.isPublic = true;
        state.characters = [];
        state.cells = {};
        state.focusedCharacterId = null;
        state.isDirty = false;
        state.isSaving = false;
      }),

    setTitle: (title) =>
      set((state) => {
        state.title = title;
        state.isDirty = true;
      }),

    setDescription: (description) =>
      set((state) => {
        state.description = description;
        state.isDirty = true;
      }),

    setPatchVersion: (version) =>
      set((state) => {
        state.patchVersion = version;
        state.isDirty = true;
      }),

    setIsPublic: (isPublic) =>
      set((state) => {
        state.isPublic = isPublic;
        state.isDirty = true;
      }),

    addCharacter: (characterId) =>
      set((state) => {
        if (!state.characters.includes(characterId)) {
          state.characters.push(characterId);
          state.isDirty = true;
        }
      }),

    removeCharacter: (characterId) =>
      set((state) => {
        state.characters = state.characters.filter((id) => id !== characterId);
        // 関連するセルも削除
        const keysToDelete = Object.keys(state.cells).filter((key) =>
          key.includes(characterId)
        );
        keysToDelete.forEach((key) => {
          delete state.cells[key];
        });
        if (state.focusedCharacterId === characterId) {
          state.focusedCharacterId = null;
        }
        state.isDirty = true;
      }),

    reorderCharacters: (characters) =>
      set((state) => {
        state.characters = characters;
        state.isDirty = true;
      }),

    setCellValue: (charA, charB, value) =>
      set((state) => {
        if (charA === charB) return;
        const key = makeMatchupKey(charA, charB);
        // A < B の正規化で格納。charA > charB なら反転
        const normalizedValue = charA < charB ? value : 10 - value;
        if (!state.cells[key]) {
          state.cells[key] = {
            characterA: charA < charB ? charA : charB,
            characterB: charA < charB ? charB : charA,
            value: normalizedValue,
            memo: '',
          };
        } else {
          state.cells[key].value = normalizedValue;
        }
        state.isDirty = true;
      }),

    setCellMemo: (charA, charB, memo) =>
      set((state) => {
        if (charA === charB) return;
        const key = makeMatchupKey(charA, charB);
        if (!state.cells[key]) {
          state.cells[key] = {
            characterA: charA < charB ? charA : charB,
            characterB: charA < charB ? charB : charA,
            value: 5,
            memo,
          };
        } else {
          state.cells[key].memo = memo;
        }
        state.isDirty = true;
      }),

    setFocusedCharacter: (characterId) =>
      set((state) => {
        state.focusedCharacterId = characterId;
      }),

    setSaving: (isSaving) =>
      set((state) => {
        state.isSaving = isSaving;
      }),
  }))
);
