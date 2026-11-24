# Sistema Web de Control y Gestión de Líneas Corporativas

MVP / piloto para People & Trade S.A.S. Permite filtrar por canal, identificar qué empleado tiene cada línea, detectar líneas asignadas a personal retirado y gestionar asignaciones, reasignaciones, liberaciones y cancelaciones con historial.

## Stack

- Frontend: Vue 3, Composition API, Vite, Pinia, Vue Router, Quasar y Axios.
- Backend: Node.js, Express, Mongoose y MongoDB.
- Datos reales: 783 empleados y 753 líneas importadas desde `REPORTES DE LINEAS NOV 2026 ANALISTAS.xlsx`, incluyendo 32 empleados RETIRADO, 7 líneas críticas asignadas a personal retirado y 165 líneas POR_CANCELAR.

## Estructura

```text
people/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   │   ├── Empleado.js
│   │   ├── LineaCorporativa.js
│   │   └── HistorialMovimiento.js
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   ├── seed.js
│   ├── import-excel.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   │   ├── DashboardPage.vue
    │   │   ├── LineasPage.vue
    │   │   └── EmpleadosPage.vue
    │   ├── router/
    │   ├── services/
    │   ├── stores/
    │   ├── App.vue
    │   └── main.js
    ├── vite.config.js
    └── .env.example
```

## Requisitos

- Node.js 20 o superior.
- MongoDB 6 o superior en ejecución.

## 1. Levantar MongoDB

Con el servicio local:

```bash
sudo systemctl start mongod
```

O con Docker:

```bash
docker run -d --name people-mongo -p 27017:27017 mongo:7
```

## 2. Levantar Backend

En una terminal:

```bash
cd /home/arley/Escritorio/people/backend
cp .env.example .env
npm install
npm run import:excel -- ../"REPORTES DE LINEAS NOV 2026 ANALISTAS.xlsx" --replace
npm run dev
```

La API queda disponible en `http://localhost:3000`. Healthcheck: `http://localhost:3000/health`.

Variables de `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/control_lineas
CORS_ORIGIN=http://localhost:5173
```

La importación de Excel reemplaza los datos existentes cuando se usa `--replace`. Si se actualiza el archivo, se puede volver a ejecutar el mismo comando para recargar todo:

```bash
npm run import:excel -- ../"REPORTES DE LINEAS NOV 2026 ANALISTAS.xlsx" --replace
```

El seed de demostración sigue disponible con `npm run seed`, pero no debe ejecutarse después de cargar los datos reales porque agrega 20 empleados y 22 líneas de prueba.

## 3. Levantar Frontend

En otra terminal:

```bash
cd /home/arley/Escritorio/people/frontend
cp .env.example .env
npm install
npm run dev
```

Abrir `http://localhost:5173`.

Variables de `frontend/.env`:

```env
VITE_API_URL=/api
VITE_PROXY_TARGET=http://localhost:3000
```

## Endpoints principales

```text
GET    /api/dashboard/resumen?canal=RETAIL
GET    /api/lineas?canal=&operador=&estadoLinea=&q=
POST   /api/lineas
GET    /api/lineas/:id
PUT    /api/lineas/:id
DELETE /api/lineas/:id
POST   /api/lineas/:id/asignar
POST   /api/lineas/:id/liberar
POST   /api/lineas/:id/marcar-cancelar
GET    /api/lineas/:id/historial
GET    /api/empleados?estadoLaboral=&canal=&q=
POST   /api/empleados
GET    /api/empleados/:id
PUT    /api/empleados/:id
DELETE /api/empleados/:id
```

Ejemplo de asignación:

```bash
curl -X POST http://localhost:3000/api/lineas/ID_LINEA/asignar \
  -H "Content-Type: application/json" \
  -d '{"empleadoId":"ID_EMPLEADO","observacion":"Asignación piloto"}'
```

## Verificación

```bash
cd backend
npm run lint
npm run check

cd ../frontend
npm run lint
npm run build
```

El piloto incluye en el Dashboard la alerta crítica de líneas asignadas a empleados RETIRADO y la advertencia al cambiar un empleado a RETIRADO cuando aún tiene líneas vinculadas.
