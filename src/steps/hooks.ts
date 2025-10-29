import { Before, After } from '@cucumber/cucumber';
import { request } from '@playwright/test';
import testContext from './testContext';
import { OrderAPI } from '../api/orderAPI';

Before(async function () {
  // Crea un nuevo Playwright APIRequestContext para cada escenario para evitar el estado compartido.
  testContext.requestContext = await request.newContext({ baseURL: 'https://petstore.swagger.io' });
  testContext.api = new OrderAPI(testContext.requestContext);
  testContext.response = undefined;
  testContext.currentOrder = undefined;
});

After(async function () {
  try {
    if (testContext.requestContext && typeof testContext.requestContext.dispose === 'function') {
      await testContext.requestContext.dispose();
    }
  } finally {
    testContext.requestContext = undefined;
    testContext.api = undefined;
    testContext.response = undefined;
    testContext.currentOrder = undefined;
  }
});
