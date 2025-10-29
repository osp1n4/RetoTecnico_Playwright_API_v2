import { test } from '@playwright/test';
import { execSync } from 'child_process';


test('run cucumber suite API test', async () => {
  try {
  // Ejecutar mediante shell para que 'npx'
  
  (execSync as any)('npx cucumber-js -p default', { stdio: 'inherit', shell: true });
  } catch (err: any) {
    // Volver a lanzar la prueba para marcarla como fallida y conservar el código de salida
    throw new Error(`Error en la ejecución de Cucumber: ${err?.message ?? String(err)}`);
  }
});
