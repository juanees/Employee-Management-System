import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  deleteEmployee,
  importEmployeesFromCsv,
  listEmployees,
  updateEmployee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest
} from './api';

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

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeeRequest) => createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    }
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: UpdateEmployeeRequest }) =>
      updateEmployee(variables.id, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    }
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    }
  });
}
