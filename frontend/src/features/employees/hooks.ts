import { useMutation, useQuery } from '@tanstack/react-query';
import { importEmployeesFromCsv, listEmployees } from './api';

const employeesQueryKey = ['employees'];

export function useEmployees() {
  return useQuery({
    queryKey: employeesQueryKey,
    queryFn: listEmployees
  });
}

export function useEmployeeImport() {
  return useMutation({
    mutationFn: importEmployeesFromCsv
  });
}
