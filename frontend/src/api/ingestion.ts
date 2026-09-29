import { apiClient } from './client';

export interface FileUploadStatus {
  filename: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'DUPLICATE_SKIPPED';
  source: string;
  rows_processed: number;
  rows_rejected: number;
  records_created: number;
  records_updated: number;
  sha256?: string;
  file_size: number;
  error?: string;
  error_code?: string;
  error_message?: string;
  stage?: string;
  job_id?: string;
}

export interface MultiFileUploadResult {
  batch_job_id: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  total_files: number;
  successful_files: number;
  failed_files: number;
  skipped_duplicate_files: number;
  total_records_created: number;
  total_records_updated: number;
  files: FileUploadStatus[];
}

export const ingestionApi = {
  uploadMultipleFiles: async (files: File[]): Promise<MultiFileUploadResult> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const res = await apiClient.postFormData<MultiFileUploadResult>('/ingestion/upload', formData);
    return res.data;
  },

  runIngestion: async (cseId: string = 'CSE-014') => {
    const res = await apiClient.post('/ingestion/run', { cse_id: cseId });
    return res.data;
  },

  getJob: async (jobId: string) => {
    const res = await apiClient.get(`/ingestion/jobs/${jobId}`);
    return res.data;
  },

  getHistory: async () => {
    const res = await apiClient.get('/ingestion/history');
    return res.data;
  },
};
