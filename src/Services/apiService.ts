import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { httpClient } from "./httpClient";

export const apiService = {
  get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<TResponse>> {
    return httpClient.get<TResponse>(url, config);
  },
  post<TRequest, TResponse>(
    url: string,
    payload: TRequest,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    return httpClient.post<TResponse>(url, payload, config);
  }
};
