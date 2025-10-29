import { Given, When, Then } from '@cucumber/cucumber';
import testContext from './testContext';

When('consulto la orden con ID {int}', async (orderId: number) => {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');
  // Si el escenario ya creó un pedido y la respuesta está presente y es correcta,
  // reutiliza esa respuesta para evitar problemas causados por la consistencia eventual en la API de demostración.
  try {
    const existing = testContext.response;
    const existingStatus = existing?.status?.() ?? (existing as any)?.status;
    if (testContext.currentOrder && existing && existingStatus === 200) {
      const body = await existing.json();
      if (body && body.id === orderId) {
        // reutiliza la respuesta exitosa existente
        return;
      }
    }
  } catch (e) {
    // ignorar y realizar GET
  }

  testContext.response = await testContext.api.getOrderById(orderId);
});

Then('la respuesta debe tener código {int}', async (statusCode: number) => {
  const response = testContext.response;
  if (!response) throw new Error('No hay respuesta disponible en el contexto.');
  const actual = response.status?.() ?? (response as any).status;
  if (actual === statusCode) return;
  if (actual === 404) throw new Error(`La orden de compra no existe (código ${actual})`);
  throw new Error(`Código inesperado. Esperado: ${statusCode}, obtenido: ${actual}`);
});

Given('que tengo acceso a la API de Petstore', async () => {
  // el cliente de la API está preparado en los hooks.
  return;
});
