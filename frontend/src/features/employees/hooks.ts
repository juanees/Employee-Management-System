import { useQuery } from '@tanstack/react-query';
import { listEmployees } from './api';

const employeesQueryKey = ['employees'];

export function useEmployees() {
  return useQuery({
    queryKey: employeesQueryKey,
    queryFn: listEmployees
  });
}
