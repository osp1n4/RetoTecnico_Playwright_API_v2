import { When, Then } from '@cucumber/cucumber';
import testContext from './testContext';

const DEFAULT_ATTEMPTS = 6;
const DEFAULT_DELAY_MS = 300;

function getStatus(res: any): number | undefined {
  return typeof res?.status === 'function' ? res.status() : (res as any).status;
}

async function parseBody(res: any): Promise<any> {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return undefined;
    }
  }
}

async function retry<T>(fn: () => Promise<T>, attempts = DEFAULT_ATTEMPTS, delayMs = DEFAULT_DELAY_MS): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

async function ensureOrderExists(orderId: number) {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');
  try {
    const check = await testContext.api.getOrderById(orderId);
    const checkStatus = getStatus(check);
    if (checkStatus !== 200) {
      const order = {
        id: orderId,
        petId: Math.floor(Math.random() * 10000) + 1,
        quantity: 1,
        shipDate: new Date().toISOString(),
        status: 'placed',
        complete: true,
      };
      const createRes = await testContext.api.createOrder(order);
      console.log('Create-before-delete response status:', getStatus(createRes));
      try {
        console.log('Create-before-delete body:', JSON.stringify(await parseBody(createRes), null, 2));
      } catch {}
      // esperar hasta que GET devuelva 200
      await retry(async () => {
        const getRes = await testContext.api.getOrderById(orderId);
        const s = getStatus(getRes) ?? 0;
        if (s !== 200) throw new Error('Order not available yet');
        return getRes;
      }, DEFAULT_ATTEMPTS, DEFAULT_DELAY_MS);
    }
  } catch {
    // ignorar y continuar con intento de eliminación
  }
}

async function deleteOrderWithRetries(orderId: number) {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');
  let lastRes: any = null;
  try {
    const res = await retry(async () => {
      lastRes = await testContext.api.deleteOrder(orderId);
      const status = getStatus(lastRes);
      try {
        console.log(`Delete attempt response (status ${status}):`, JSON.stringify(await parseBody(lastRes), null, 2));
      } catch {}
      if (status !== 200) throw new Error(`Delete returned status ${status}`);
      return lastRes;
    }, DEFAULT_ATTEMPTS, DEFAULT_DELAY_MS);
    testContext.response = res;
    return res;
  } catch (e) {
    // Si retry falla, conservar la última respuesta y retornarla (comportamiento previo)
    testContext.response = lastRes;
    return lastRes;
  }
}

async function assertOrderDeletedMessage(orderId: number, expectedMessage: string) {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');
  await retry(async () => {
    const res = await testContext.api.getOrderById(orderId);
    const status = getStatus(res);
    const body = await parseBody(res);
    console.log('GET after delete body:', typeof body === 'object' ? JSON.stringify(body, null, 2) : body);
    if (status === 404) {
      if (typeof body === 'object' && body !== null) {
        if (!('message' in body) || body.message !== expectedMessage) {
          throw new Error(`Mensaje inesperado. Esperado: ${expectedMessage}, obtenido: ${JSON.stringify(body)}`);
        }
        return;
      }
      if (typeof body === 'string') {
        if (!body.includes(expectedMessage)) {
          throw new Error(`Mensaje en texto inesperado. Esperado incluir: ${expectedMessage}, obtenido: ${body}`);
        }
        return;
      }
      return;
    }
    throw new Error('Orden todavía presente o status distinto de 404');
  }, DEFAULT_ATTEMPTS, DEFAULT_DELAY_MS);
}

When('elimino la orden con ID {int}', async (orderId: number) => {
  await ensureOrderExists(orderId);
  await deleteOrderWithRetries(orderId);
});

const thenHandler = async (orderId: number, expectedMessage: string) => {
  await assertOrderDeletedMessage(orderId, expectedMessage);
};

Then('al consultar la orden con el ID {int} debe mostrar el message {string}', thenHandler);
Then('al consultar la orden con el ID {int} debe tener el message {string}', thenHandler);
