import { request, APIRequestContext } from '@playwright/test';

let apiContext: APIRequestContext;

/**
 * Inicializa el contexto de API con la baseURL del servicio Petstore.
 */
export async function getApiContext(): Promise<APIRequestContext> {
  if (!apiContext) {
    apiContext = await request.newContext({
      baseURL: 'https://petstore.swagger.io/v2',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }
  return apiContext;
}
