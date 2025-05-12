// src/hooks/useQueryRefresh.js
import { useQueryClient } from '@tanstack/react-query';

export const useQueryRefresh = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = (queryKey) => {
    return queryClient.invalidateQueries({ queryKey });
  };

  return { invalidateQueries };
};