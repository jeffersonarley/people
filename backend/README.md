# Backend - Control de Líneas Corporativas

API REST con Node.js, Express, Mongoose y MongoDB.

## Configuración

```bash
cp .env.example .env
npm install
npm run import:excel -- ../"REPORTES DE LINEAS NOV 2026 ANALISTAS.xlsx" --replace
npm run dev
```

Variables: `PORT`, `MONGODB_URI` y `CORS_ORIGIN`.

## Modelos

- `Empleado`: documento, tipoDocumento, nombresApellidos, canal, puntoVenta, ciudad, cargo, estadoLaboral, fechaIngreso y fechaRetiro.
- `LineaCorporativa`: movil, operador, estadoLinea, canalAsignado, empleadoAsignado, custCode, ciclo y comentario.
- `HistorialMovimiento`: linea, empleadoAnterior, empleadoNuevo, tipoMovimiento, observacion y fechaMovimiento.

## Endpoints

- `GET /health`
- `GET /api/dashboard/resumen?canal=RETAIL`
- `GET /api/lineas` con filtros `canal`, `operador`, `estadoLinea`, `q`, `page` y `limit`
- `POST /api/lineas`, `GET /api/lineas/:id`, `PUT /api/lineas/:id`, `DELETE /api/lineas/:id`
- `POST /api/lineas/:id/asignar`
- `POST /api/lineas/:id/liberar`
- `POST /api/lineas/:id/marcar-cancelar`
- `GET /api/lineas/:id/historial`
- `GET /api/empleados` con filtros `estadoLaboral`, `canal`, `q`, `page` y `limit`
- `POST /api/empleados`, `GET /api/empleados/:id`, `PUT /api/empleados/:id`, `DELETE /api/empleados/:id`

Las respuestas exitosas usan `{ "success": true, "data": ... }` y los errores `{ "success": false, "error": { "message": "..." } }`.

## Importación del Excel real

```bash
npm run import:excel -- ../"REPORTES DE LINEAS NOV 2026 ANALISTAS.xlsx" --replace
```

El importador procesa las hojas `ACTIVO`, `LINEAS CORPORATIVAS`, `CLARO CANCELAR`, `TIGO CANCELAR` y `GERENCIA`. Con `--replace` elimina los datos anteriores y carga 783 empleados, 753 líneas y 757 movimientos de historial. Sin `--replace` actualiza por documento y móvil.

`npm run seed` sigue disponible únicamente para datos de demostración: crea 20 empleados y 22 líneas de prueba.

## Verificación

```bash
npm run lint
npm run check
```
