import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGetSubmissionsQueryKey, getGetDepositsQueryKey, getGetAdminSubmissionsQueryKey } from "@workspace/api-client-react";

// Custom hooks for file uploads because the OpenAPI spec didn't declare
// the image fields correctly for code generation.

export function useSubmitTaskProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, files }: { taskId: number, files: File[] }) => {
      const formData = new FormData();
      formData.append('taskId', taskId.toString());
      files.forEach(file => formData.append('images', file));

      const res = await window.fetch('/api/submissions', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to submit proof');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetSubmissionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminSubmissionsQueryKey() });
    }
  });
}

export function useSubmitDeposit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      link, platform, taskType, durationDays, proof 
    }: { 
      link: string, platform: string, taskType: string, durationDays: number, proof: File 
    }) => {
      const formData = new FormData();
      formData.append('link', link);
      formData.append('platform', platform);
      formData.append('taskType', taskType);
      formData.append('durationDays', durationDays.toString());
      formData.append('paymentProof', proof);

      const res = await window.fetch('/api/deposits', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to submit deposit');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetDepositsQueryKey() });
    }
  });
}
