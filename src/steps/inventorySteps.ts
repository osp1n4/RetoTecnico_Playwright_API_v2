import { When, Then } from '@cucumber/cucumber';
import testContext from './testContext';

When('consulto el inventario de ventas', async () => {
  if (!testContext.api) throw new Error('API client no inicializado en el contexto.');
  testContext.response = await testContext.api.getInventory();
});

Then('el inventario debe contener las claves sold y available en el body', async () => {
  const response = testContext.response;
  if (!response) throw new Error('No hay respuesta disponible en el contexto.');
  const status = response.status?.() ?? (response as any).status;
  if (status !== 200) throw new Error(`Código inesperado en GET inventario. Esperado: 200, obtenido: ${status}`);
  const body = await response.json();
  // Imprime el cuerpo para depuración/visibilidad 
  console.log('Cuerpo de respuesta de inventario:', JSON.stringify(body, null, 2));
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new Error('El inventario debe ser un objeto map (no nulo y no array)');
  }
  // Assert the specific attributes exist (more stable keys)
  if (!Object.prototype.hasOwnProperty.call(body, 'sold')) {
    throw new Error("El inventario no contiene la clave 'sold'");
  }
  if (!Object.prototype.hasOwnProperty.call(body, 'available')) {
    throw new Error("El inventario no contiene la clave 'available'");
  }
});
