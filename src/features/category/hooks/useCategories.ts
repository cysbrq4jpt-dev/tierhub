import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getCategories,
  getCategory,
  getCategoryItems,
  searchMasterItems,
} from '../services/categoryService';

// カテゴリ一覧
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });
};

// カテゴリ詳細
export const useCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => getCategory(categoryId),
    enabled: !!categoryId,
  });
};

// カテゴリ内のアイテム一覧
export const useCategoryItems = (categoryId: string) => {
  return useInfiniteQuery({
    queryKey: ['categoryItems', categoryId],
    queryFn: ({ pageParam }) => getCategoryItems(categoryId, 50, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!categoryId,
    initialPageParam: undefined,
  });
};

// MasterItem検索
export const useSearchMasterItems = (query: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['searchMasterItems', query, categoryId],
    queryFn: () => searchMasterItems(query, categoryId),
    enabled: query.trim().length > 0,
  });
};
