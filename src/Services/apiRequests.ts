import { apiService } from "./apiService";

export const apiRequests = {
  healthCheck: () => apiService.get<{ status: string }>("/health")
};
