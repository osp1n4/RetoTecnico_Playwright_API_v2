# Proyecto: Reto Técnico Playwright API(Petstore)

Este repositorio contiene una suite de pruebas de API escrita en TypeScript usando Cucumber para BDD y Playwright (APIRequestContext) para llamadas HTTP.

Todas las instrucciones están pensadas para ejecutarse en Windows (PowerShell).

## Requisitos previos
- Node.js (recomendado): 18 o superior (LTS).
- npm (incluido con Node.js) — se recomienda npm 9+

## Dependencias (devDependencies utilizadas)

Las dependencias importantes definidas en `package.json` son:

- @cucumber/cucumber: ^12.2.0
- @playwright/test: ^1.56.1
- @types/node: ^24.9.2
- ts-node: ^10.9.2
- typescript: ^5.9.3

Estas están ya listadas en `package.json`; instalarás todo con `npm install`.

## Instalación (rápida)

Abre PowerShell en la raíz del proyecto y ejecuta:

```powershell
npm install
```

Esto instalará las devDependencies necesarias.

## Estructura relevante

- `src/features/` - archivos `.feature` de Cucumber
- `src/steps/` - definiciones de pasos (separadas por escenario)
- `src/api/` - clientes API (wrappers para llamadas HTTP)
- `src/utils/config.ts` - configuración (por ejemplo, baseURL)
- `scripts/generate-report-pdf.js` - script auxiliar para generar PDF desde HTML (opcional)
- `tests/runCucumber.spec.ts` - test de Playwright que ejecuta la suite Cucumber sin abrir navegadores
- `test/runCucumber.ts` - runner TypeScript que invoca la CLI de Cucumber

## Ejecutar la suite

Hay varias formas de ejecutar la suite; a continuación las más comunes (desde la raíz del proyecto):

- Ejecutar la suite Cucumber (script npm):

```powershell
npx cucumber-js
```

```powershell
cucumber-js -p default
```

- Ejecutar la suite desde Playwright (wrapper que ejecuta el runner dentro de un test de Playwright; no abre navegadores):

```powershell
npm run test:playwright-cucumber
```



### Ejecutar un feature o escenario específico

Para ejecutar un solo archivo `.feature` con Cucumber:

```powershell
npx cucumber-js src/features/order.feature
```

Para ejecutar escenarios por nombre (filtro):

```powershell
npx cucumber-js -n "Nombre del escenario parcial o completo"
```

## Reportes

La suite puede generar varios tipos de reportes. A continuación las opciones soportadas en este proyecto:

- Reporte HTML generado por Cucumber (ya incluido en `src/reports/cucumber_report.html` si ya se generó):

  - Abrir localmente en Windows (PowerShell):

  ```powershell
  Start-Process .\src\reports\cucumber_report.html
  ```

- Playwright report (si se generó):

  - Abrir el reporte de Playwright generado en `playwright-report`:

  ```powershell
  npx playwright show-report
  # O abrir el HTML directamente
  Start-Process .\playwright-report\index.html
  ```


## Configuración

- Base URL: la URL base usada por las llamadas API está en `src/utils/config.ts`. Si quieres apuntar a otra instancia (por ejemplo un entorno de pruebas local o staging), edita ese archivo o exporta una variable de entorno y adapta las llamadas.

## Notas importantes y solución de problemas

- Dependencia externa: las pruebas consumen la API pública de Petstore (https://petstore.swagger.io). Esa API puede presentar eventual consistency o comportamientos no deterministas. Para mitigarlo, las definiciones de pasos incluyen reintentos y polling en casos sensibles (POST -> GET, DELETE -> GET). Si ves fallos intermitentes, reintenta la ejecución.

- Errores de TypeScript:

  ```powershell
  npx tsc --noEmit
  ```

  Esto ayudará a detectar problemas de tipos antes de ejecutar.

- Si `npm run test:runner` falla por falta de `ts-node`, asegúrate de haber ejecutado `npm install` y que `ts-node` esté disponible en `node_modules`.


---

`README.md` — contiene pasos mínimos para ejecutar la suite y generar reportes.
