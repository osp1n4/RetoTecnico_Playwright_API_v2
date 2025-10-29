import { APIRequestContext, APIResponse } from '@playwright/test';

export class BaseAPI {
  protected request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async get(endpoint: string): Promise<APIResponse> {
    return await this.request.get(endpoint);
  }

  async post(endpoint: string, data: any): Promise<APIResponse> {
    return await this.request.post(endpoint, { data });
  }

  async delete(endpoint: string): Promise<APIResponse> {
    return await this.request.delete(endpoint);
  }

  async put(endpoint: string, data: any): Promise<APIResponse> {
    return await this.request.put(endpoint, { data });
  }
}

