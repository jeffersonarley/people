import Empleado from '../models/Empleado.js';
import LineaCorporativa from '../models/LineaCorporativa.js';
import HistorialMovimiento from '../models/HistorialMovimiento.js';

const empleadosSeed = [
  {
    documento: '1001001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'Laura Marcela Cárdenas',
    canal: 'RETAIL',
    puntoVenta: 'Retail Centro Mayor',
    ciudad: 'Bogotá',
    cargo: 'Asesora Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2023-02-13'
  },
  {
    documento: '1001001002',
    tipoDocumento: 'CC',
    nombresApellidos: 'Andrés Felipe Ramírez',
    canal: 'RETAIL',
    puntoVenta: 'Retail Unicentro',
    ciudad: 'Bogotá',
    cargo: 'Ejecutivo Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2022-07-04'
  },
  {
    documento: '1001001003',
    tipoDocumento: 'CC',
    nombresApellidos: 'Paula Andrea Rincón',
    canal: 'RETAIL',
    puntoVenta: 'Retail Calle 80',
    ciudad: 'Bogotá',
    cargo: 'Asesora Comercial',
    estadoLaboral: 'RETIRADO',
    fechaIngreso: '2019-05-20',
    fechaRetiro: '2026-09-30'
  },
  {
    documento: '1002001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'Natalia Gómez Herrera',
    canal: 'CLARO-CAV',
    puntoVenta: 'CAV Chapinero',
    ciudad: 'Bogotá',
    cargo: 'Asesora de Servicio',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2021-11-08'
  },
  {
    documento: '1002001002',
    tipoDocumento: 'CE',
    nombresApellidos: 'Jorge Iván Salazar',
    canal: 'CLARO-CAV',
    puntoVenta: 'CAV Norte',
    ciudad: 'Medellín',
    cargo: 'Ejecutivo Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2020-03-16'
  },
  {
    documento: '1002001003',
    tipoDocumento: 'CC',
    nombresApellidos: 'Camilo Esteban Ortiz',
    canal: 'CLARO-CAV',
    puntoVenta: 'CAV Sur',
    ciudad: 'Cali',
    cargo: 'Asesor Comercial',
    estadoLaboral: 'RETIRADO',
    fechaIngreso: '2018-09-03',
    fechaRetiro: '2026-10-15'
  },
  {
    documento: '1003001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'Diana Carolina Méndez',
    canal: 'CLARO-DEALERS',
    puntoVenta: 'Dealer Plaza Central',
    ciudad: 'Bogotá',
    cargo: 'Coordinadora de Dealer',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2022-01-24'
  },
  {
    documento: '1003001002',
    tipoDocumento: 'CC',
    nombresApellidos: 'Óscar Javier Peña',
    canal: 'CLARO-DEALERS',
    puntoVenta: 'Dealer Calima',
    ciudad: 'Cali',
    cargo: 'Asesor Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2024-04-11'
  },
  {
    documento: '1004001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'María Fernanda Lozano',
    canal: 'ADM OPER',
    puntoVenta: 'Sede Administrativa',
    ciudad: 'Bogotá',
    cargo: 'Analista Operativo',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2019-08-19'
  },
  {
    documento: '1004001002',
    tipoDocumento: 'CC',
    nombresApellidos: 'Sergio Alejandro Castro',
    canal: 'ADM OPER',
    puntoVenta: 'Sede Administrativa',
    ciudad: 'Bogotá',
    cargo: 'Coordinador de Operaciones',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2017-06-05'
  },
  {
    documento: '1005001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'Liliana Patricia Suárez',
    canal: 'MAYORISTAS',
    puntoVenta: 'Canal Mayoristas',
    ciudad: 'Barranquilla',
    cargo: 'Gerente de Cuenta',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2020-12-01'
  },
  {
    documento: '1005001002',
    tipoDocumento: 'CE',
    nombresApellidos: 'Ricardo Alfonso Vega',
    canal: 'MAYORISTAS',
    puntoVenta: 'Canal Mayoristas',
    ciudad: 'Cartagena',
    cargo: 'Ejecutivo de Cuenta',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2023-05-22'
  },
  {
    documento: '1006001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'Valentina Ríos Montoya',
    canal: 'MOVISTAR',
    puntoVenta: 'Punto Movistar Centro',
    ciudad: 'Medellín',
    cargo: 'Asesora Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2022-10-17'
  },
  {
    documento: '1006001002',
    tipoDocumento: 'PPT',
    nombresApellidos: 'Yeison David Patiño',
    canal: 'MOVISTAR',
    puntoVenta: 'Punto Movistar Laureles',
    ciudad: 'Medellín',
    cargo: 'Asesor Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2024-01-15'
  },
  {
    documento: '1007001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'Sandra Milena Quintero',
    canal: 'TIGO',
    puntoVenta: 'Tienda Tigo Norte',
    ciudad: 'Bucaramanga',
    cargo: 'Supervisora Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2021-02-08'
  },
  {
    documento: '1007001002',
    tipoDocumento: 'CC',
    nombresApellidos: 'Felipe Andrés Guerrero',
    canal: 'TIGO',
    puntoVenta: 'Tienda Tigo Cabecera',
    ciudad: 'Bucaramanga',
    cargo: 'Asesor Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2023-09-12'
  },
  {
    documento: '1008001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'Ana Isabel Díaz',
    canal: 'SENA',
    puntoVenta: 'Centro de Formación SENA',
    ciudad: 'Bogotá',
    cargo: 'Coordinadora de Ventas',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2020-06-22'
  },
  {
    documento: '1008001002',
    tipoDocumento: 'CC',
    nombresApellidos: 'Diego Alejandro Cruz',
    canal: 'SENA',
    puntoVenta: 'Centro de Formación SENA',
    ciudad: 'Bogotá',
    cargo: 'Asesor Learner',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2023-11-20'
  },
  {
    documento: '1009001001',
    tipoDocumento: 'CC',
    nombresApellidos: 'Claudia Patricia Moreno',
    canal: 'GERENCIA',
    puntoVenta: 'Sede Principal',
    ciudad: 'Bogotá',
    cargo: 'Gerente de Recursos Humanos',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2015-03-02'
  },
  {
    documento: '1009001002',
    tipoDocumento: 'CC',
    nombresApellidos: 'Juan Pablo Herrera',
    canal: 'GERENCIA',
    puntoVenta: 'Sede Principal',
    ciudad: 'Bogotá',
    cargo: 'Director Comercial',
    estadoLaboral: 'ACTIVO',
    fechaIngreso: '2016-08-15'
  }
];

const lineasSeed = [
  {
    movil: '3001001001',
    operador: 'CLARO',
    canalAsignado: 'RETAIL',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1001001001',
    custCode: 'RTL-001',
    ciclo: '2026-11',
    comentario: 'Línea de asesora de punto Retail Centro Mayor'
  },
  {
    movil: '3001001002',
    operador: 'TIGO',
    canalAsignado: 'RETAIL',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1001001002',
    custCode: 'RTL-002',
    ciclo: '2026-11',
    comentario: 'Línea de ejecutivo comercial Retail Unicentro'
  },
  {
    movil: '3001001003',
    operador: 'CLARO',
    canalAsignado: 'RETAIL',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1001001003',
    custCode: 'RTL-003',
    ciclo: '2026-10',
    comentario: 'Caso crítico: empleada retirada con línea aún asignada'
  },
  {
    movil: '3001001004',
    operador: 'TIGO',
    canalAsignado: 'RETAIL',
    estadoLinea: 'DISPONIBLE',
    custCode: 'RTL-004',
    ciclo: '2026-11',
    comentario: 'Línea disponible para asignación'
  },
  {
    movil: '3002001001',
    operador: 'CLARO',
    canalAsignado: 'CLARO-CAV',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1002001001',
    custCode: 'CAV-001',
    ciclo: '2026-11',
    comentario: 'Línea de asesora CAV Chapinero'
  },
  {
    movil: '3002001002',
    operador: 'TIGO',
    canalAsignado: 'CLARO-CAV',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1002001002',
    custCode: 'CAV-002',
    ciclo: '2026-11',
    comentario: 'Línea de ejecutivo CAV Norte'
  },
  {
    movil: '3002001003',
    operador: 'CLARO',
    canalAsignado: 'CLARO-CAV',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1002001003',
    custCode: 'CAV-003',
    ciclo: '2026-10',
    comentario: 'Caso crítico: empleado retirado con línea aún asignada'
  },
  {
    movil: '3002001004',
    operador: 'TIGO',
    canalAsignado: 'CLARO-CAV',
    estadoLinea: 'POR_CANCELAR',
    custCode: 'CAV-004',
    ciclo: '2026-10',
    comentario: 'Cancelación solicitada al operador'
  },
  {
    movil: '3003001001',
    operador: 'CLARO',
    canalAsignado: 'CLARO-DEALERS',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1003001001',
    custCode: 'DLR-001',
    ciclo: '2026-11',
    comentario: 'Línea de coordinadora de dealer'
  },
  {
    movil: '3003001002',
    operador: 'TIGO',
    canalAsignado: 'CLARO-DEALERS',
    estadoLinea: 'DISPONIBLE',
    custCode: 'DLR-002',
    ciclo: '2026-11',
    comentario: 'Línea disponible para nuevo asesor'
  },
  {
    movil: '3004001001',
    operador: 'CLARO',
    canalAsignado: 'ADM OPER',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1004001001',
    custCode: 'ADM-001',
    ciclo: '2026-11',
    comentario: 'Línea administrativa de analista operativo'
  },
  {
    movil: '3004001002',
    operador: 'TIGO',
    canalAsignado: 'ADM OPER',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1004001002',
    custCode: 'ADM-002',
    ciclo: '2026-11',
    comentario: 'Línea administrativa de coordinación'
  },
  {
    movil: '3005001001',
    operador: 'CLARO',
    canalAsignado: 'MAYORISTAS',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1005001001',
    custCode: 'MAY-001',
    ciclo: '2026-11',
    comentario: 'Línea de gerente de cuenta mayoristas'
  },
  {
    movil: '3005001002',
    operador: 'TIGO',
    canalAsignado: 'MAYORISTAS',
    estadoLinea: 'POR_CANCELAR',
    documentoEmpleado: '1005001002',
    custCode: 'MAY-002',
    ciclo: '2026-10',
    comentario: 'Línea en proceso de cancelación con empleado asignado'
  },
  {
    movil: '3006001001',
    operador: 'TIGO',
    canalAsignado: 'MOVISTAR',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1006001001',
    custCode: 'MOV-001',
    ciclo: '2026-11',
    comentario: 'Línea de asesora del canal Movistar'
  },
  {
    movil: '3006001002',
    operador: 'CLARO',
    canalAsignado: 'MOVISTAR',
    estadoLinea: 'DISPONIBLE',
    custCode: 'MOV-002',
    ciclo: '2026-11',
    comentario: 'Línea disponible del canal Movistar'
  },
  {
    movil: '3007001001',
    operador: 'TIGO',
    canalAsignado: 'TIGO',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1007001001',
    custCode: 'TGO-001',
    ciclo: '2026-11',
    comentario: 'Línea de supervisora comercial Tigo'
  },
  {
    movil: '3007001002',
    operador: 'CLARO',
    canalAsignado: 'TIGO',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1007001002',
    custCode: 'TGO-002',
    ciclo: '2026-11',
    comentario: 'Línea de asesor comercial Tigo'
  },
  {
    movil: '3008001001',
    operador: 'CLARO',
    canalAsignado: 'SENA',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1008001001',
    custCode: 'SEN-001',
    ciclo: '2026-11',
    comentario: 'Línea de coordinación SENA'
  },
  {
    movil: '3008001002',
    operador: 'TIGO',
    canalAsignado: 'SENA',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1008001002',
    custCode: 'SEN-002',
    ciclo: '2026-11',
    comentario: 'Línea de asesor Learner SENA'
  },
  {
    movil: '3009001001',
    operador: 'CLARO',
    canalAsignado: 'GERENCIA',
    estadoLinea: 'ACTIVA',
    documentoEmpleado: '1009001001',
    custCode: 'GER-001',
    ciclo: '2026-11',
    comentario: 'Línea de gerencia de Recursos Humanos'
  },
  {
    movil: '3009001002',
    operador: 'TIGO',
    canalAsignado: 'GERENCIA',
    estadoLinea: 'CANCELADA',
    custCode: 'GER-002',
    ciclo: '2026-09',
    comentario: 'Línea cancelada en ciclo anterior'
  }
];

export async function importarSeed() {
  const empleadosPorDocumento = new Map();
  let empleadosCreados = 0;
  let empleadosExistentes = 0;

  for (const datos of empleadosSeed) {
    const existente = await Empleado.findOne({ documento: datos.documento }).select('_id');
    const empleado = await Empleado.findOneAndUpdate(
      { documento: datos.documento },
      { $setOnInsert: datos },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    empleadosPorDocumento.set(empleado.documento, empleado);
    if (existente) empleadosExistentes += 1;
    else empleadosCreados += 1;
  }

  let lineasCreadas = 0;
  let lineasExistentes = 0;
  let movimientosCreados = 0;

  for (const datos of lineasSeed) {
    const { documentoEmpleado, ...camposLinea } = datos;
    const empleado = documentoEmpleado ? empleadosPorDocumento.get(documentoEmpleado) : null;
    const existente = await LineaCorporativa.findOne({ movil: datos.movil });

    if (existente) {
      await LineaCorporativa.updateOne(
        { _id: existente._id },
        {
          $set: {
            operador: camposLinea.operador,
            canalAsignado: camposLinea.canalAsignado,
            custCode: camposLinea.custCode,
            ciclo: camposLinea.ciclo,
            comentario: camposLinea.comentario
          }
        }
      );
      lineasExistentes += 1;
      continue;
    }

    const linea = await LineaCorporativa.create({
      ...camposLinea,
      empleadoAsignado: empleado?._id || null
    });
    lineasCreadas += 1;

    if (empleado) {
      await HistorialMovimiento.create({
        linea: linea._id,
        empleadoAnterior: null,
        empleadoNuevo: empleado._id,
        tipoMovimiento: 'ASIGNACION',
        observacion: 'Carga inicial de datos del piloto',
        fechaMovimiento: new Date('2026-01-15T08:00:00.000Z')
      });
      movimientosCreados += 1;
    }
  }

  const [empleados, lineas, historial] = await Promise.all([
    Empleado.countDocuments({ documento: { $in: empleadosSeed.map(({ documento }) => documento) } }),
    LineaCorporativa.countDocuments({ movil: { $in: lineasSeed.map(({ movil }) => movil) } }),
    HistorialMovimiento.countDocuments()
  ]);

  return {
    empleados,
    lineas,
    historial,
    empleadosCreados,
    empleadosExistentes,
    lineasCreadas,
    lineasExistentes,
    movimientosCreados
  };
}
