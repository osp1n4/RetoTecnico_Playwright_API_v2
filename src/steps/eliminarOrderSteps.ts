import { When, Then } from '@cucumber/cucumber';
import testContext from './testContext';



When('elimino la orden con ID {int}', async (orderId: number) => {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');
  // Asegurarse de que la orden exista antes de intentar eliminarla. Algunas API de demostración 
  // y la precondición Given puede no haber persistido realmente el recurso.
  try {
    const check = await testContext.api.getOrderById(orderId);
    const checkStatus = check.status?.() ?? (check as any).status;
    if (checkStatus !== 200) {
      // Vuelva a crear el pedido para este escenario.
      const order = {
        id: orderId,
        petId: Math.floor(Math.random() * 10000) + 1,
        quantity: 1,
        shipDate: new Date().toISOString(),
        status: 'placed',
        complete: true,
      };
      const createRes = await testContext.api.createOrder(order);
      const createStatus = createRes.status?.() ?? (createRes as any).status;
      console.log('Create-before-delete response status:', createStatus);
      try {
        const createBody = await createRes.json();
        console.log('Create-before-delete body:', JSON.stringify(createBody, null, 2));
      } catch (_) {}

      // Consultar hasta que el recurso esté disponible o se agote el tiempo de espera.
      for (let i = 0; i < 6; i++) {
        const getRes = await testContext.api.getOrderById(orderId);
        const getStatus = getRes.status?.() ?? (getRes as any).status;
        if (getStatus === 200) break;
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  } catch (e) {
    // ignorar y realizar intento de eliminación
  }

  // Intentar DELETE, reintentando varias veces si la API devuelve un estado distinto de 200 para
  // mitigar la consistencia eventual o errores transitorios en la API de demostración.
  const deleteAttempts = 6;
  const deleteDelayMs = 300;
  let lastDelRes: any = null;
  for (let a = 0; a < deleteAttempts; a++) {
    lastDelRes = await testContext.api.deleteOrder(orderId);
    const delStatus = lastDelRes.status?.() ?? (lastDelRes as any).status;
    // Imprima cada respuesta de intento
    try {
      const delBody = await lastDelRes.json();
      console.log(`Delete attempt ${a + 1} response (status ${delStatus}):`, JSON.stringify(delBody, null, 2));
    } catch (e) {
      try {
        const text = await lastDelRes.text();
        console.log(`Delete attempt ${a + 1} response (status ${delStatus}, text):`, text);
      } catch (_) {}
    }
    if (delStatus === 200) break;
    // Tiempo de espera antes de reintentar
    await new Promise((r) => setTimeout(r, deleteDelayMs));
  }
  testContext.response = lastDelRes;
});

Then('al consultar la orden con el ID {int} debe mostrar el message {string}', async (orderId: number, expectedMessage: string) => {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');

 // Consultar la solicitud GET durante un breve periodo de tiempo para que la API se estabilice tras la eliminación.
  const attempts = 6;
  const delayMs = 300;
  for (let i = 0; i < attempts; i++) {
    const res = await testContext.api.getOrderById(orderId);
    const status = res.status?.() ?? (res as any).status;
    let body: any;
    try {
      body = await res.json();
      console.log('GET after delete body:', JSON.stringify(body, null, 2));
    } catch (e) {
      body = await res.text();
      console.log('GET after delete body (text):', body);
    }

    if (status === 404) {
      // Found not-found state
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

    //Si el estado no es 404, espere e intente de nuevo.
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(`Después del delete la orden aún está presente o no devolvió el mensaje esperado '${expectedMessage}' tras ${attempts} reintentos.`);
});

Then('al consultar la orden con el ID {int} debe tener el message {string}', async (orderId: number, expectedMessage: string) => {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');

  // Consultar la solicitud GET durante un breve periodo de tiempo para que la API se estabilice tras la eliminación.
  const attempts = 6;
  const delayMs = 300;
  for (let i = 0; i < attempts; i++) {
    const res = await testContext.api.getOrderById(orderId);
    const status = res.status?.() ?? (res as any).status;
    let body: any;
    try {
      body = await res.json();
      console.log('GET after delete body:', JSON.stringify(body, null, 2));
    } catch (e) {
      body = await res.text();
      console.log('GET after delete body (text):', body);
    }

    if (status === 404) {
      // Found not-found state
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

    // Si el estado no es 404, espere e intente de nuevo.
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(`Después del delete la orden aún está presente o no devolvió el mensaje esperado '${expectedMessage}' tras ${attempts} reintentos.`);
});
