import { Given, Then } from '@cucumber/cucumber';
import testContext from './testContext';

Given('que he creado una orden con ID {int}', async (orderId: number) => {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');

  const order = {
    id: orderId,
    petId: Math.floor(Math.random() * 10000) + 1,
    quantity: Math.floor(Math.random() * 5) + 1,
    shipDate: new Date().toISOString(),
    status: 'placed',
    complete: true,
  };

  testContext.currentOrder = order;
  testContext.response = await testContext.api.createOrder(order);

  const status = testContext.response.status?.() ?? (testContext.response as any).status;
  if (![200, 201].includes(status)) {
    throw new Error(`No fue posible crear la orden ${orderId}. Código: ${status}`);
  }

  // Realizar una solicitud GET hasta que se pueda recuperar el pedido.
  for (let i = 0; i < 6; i++) {
    const getRes = await testContext.api.getOrderById(orderId);
    const getStatus = getRes.status?.() ?? (getRes as any).status;
    if (getStatus === 200) {
      testContext.response = getRes;
      return;
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  throw new Error(`La orden ${orderId} fue creada pero no está disponible vía GET tras varios reintentos.`);
});

Then('la respuesta debe contener el ID {int} y status y quantity', async (orderId: number) => {
  const response = testContext.response;
  if (!response) throw new Error('No hay respuesta disponible en el contexto.');
  const actualStatus = response.status?.() ?? (response as any).status;
  if (actualStatus !== 200) {
    if (actualStatus === 404) throw new Error(`La orden de compra no existe (código ${actualStatus})`);
    throw new Error(`Código inesperado en GET. Esperado: 200, obtenido: ${actualStatus}`);
  }
  const body = await response.json();
  if (body.id !== orderId) throw new Error(`El ID en la respuesta no coincide. Esperado: ${orderId}, obtenido: ${body.id}`);
  if (!('status' in body)) throw new Error('La respuesta no contiene el campo "status"');
  if (!('quantity' in body)) throw new Error('La respuesta no contiene el campo "quantity"');
  if (testContext.currentOrder) {
    // La API de demostración puede transformar algunos campos. Valida la presencia y la corrección básica.
    
    if (!('status' in body) || typeof body.status !== 'string')
      throw new Error(`La respuesta debe contener 'status' como string. Obtenido: ${JSON.stringify(body.status)}`);
    if (typeof body.quantity !== 'number')
      throw new Error(`La quantity debe ser un número. Obtenido: ${typeof body.quantity}`);
  }
});
