// ─── Mock Data compartida para todo el admin ──────────────────────────────────
// Usada por los componentes hasta conectar la BD real

export type EstadoTramite = 
  | 'pendiente_datos'
  | 'revision_documentos'
  | 'pendiente_pago'
  | 'aprobado'
  | 'rechazado'
  | 'matriculado';

export type EstadoPago = 'pending' | 'approved' | 'rejected' | 'in_process' | null;
export type EstadoMatricula = 'activo' | 'inactivo' | 'en_tramite' | 'suspendido' | 'baja';

export type Matriculado = {
  id: string;
  matricula: string;
  nombre: string;
  apellido: string;
  dni: string;
  cuit: string;
  email: string;
  telefono: string;
  domicilio: string;
  estado: EstadoMatricula;
  tramite: EstadoTramite;
  estadoPago: EstadoPago;
  montoInscripcion: number;
  universidad?: string;
  titulo?: string;
  fechaEgreso?: string;
  notas?: string;
  createdAt: string;
};

export const MOCK_MATRICULADOS: Matriculado[] = [
  {
    id: '1', matricula: '0420', nombre: 'Ana', apellido: 'López',
    dni: '35421876', cuit: '27-35421876-5', email: 'ana.lopez@gmail.com',
    telefono: '3804111111', domicilio: 'Av. Rivadavia 123, La Rioja',
    estado: 'activo', tramite: 'matriculado', estadoPago: 'approved',
    montoInscripcion: 15000, universidad: 'UNLaR', titulo: 'Lic. en Terapia Ocupacional',
    fechaEgreso: '2019-12-10', createdAt: '2020-03-15',
  },
  {
    id: '2', matricula: '0421', nombre: 'Carlos', apellido: 'Martínez',
    dni: '37891234', cuit: '20-37891234-1', email: 'carlos.m@hotmail.com',
    telefono: '3804222222', domicilio: 'San Martín 456, La Rioja',
    estado: 'activo', tramite: 'aprobado', estadoPago: 'approved',
    montoInscripcion: 15000, universidad: 'UCSF', titulo: 'Lic. en Terapia Ocupacional',
    fechaEgreso: '2020-07-22', createdAt: '2021-01-10',
  },
  {
    id: '3', matricula: '0422', nombre: 'Laura', apellido: 'González',
    dni: '39012345', cuit: '27-39012345-3', email: 'laura.g@gmail.com',
    telefono: '3804333333', domicilio: 'Rivadavia 789, La Rioja',
    estado: 'en_tramite', tramite: 'revision_documentos', estadoPago: null,
    montoInscripcion: 15000, universidad: 'UNLaR', titulo: 'Lic. en Terapia Ocupacional',
    fechaEgreso: '2022-12-01', createdAt: '2023-02-20',
  },
  {
    id: '4', matricula: '0423', nombre: 'Brandon', apellido: 'Romero',
    dni: '41523876', cuit: '20-41523876-3', email: 'brandon.romero@gmail.com',
    telefono: '3804567890', domicilio: 'Av. Rivadavia 1234, La Rioja',
    estado: 'en_tramite', tramite: 'pendiente_pago', estadoPago: 'pending',
    montoInscripcion: 15000, universidad: 'Universidad Nacional de La Rioja',
    titulo: 'Lic. en Terapia Ocupacional', fechaEgreso: '2021-12-01', createdAt: '2023-05-01',
  },
  {
    id: '5', matricula: '0424', nombre: 'Sofía', apellido: 'Fernández',
    dni: '38765432', cuit: '27-38765432-7', email: 'sofia.f@gmail.com',
    telefono: '3804444444', domicilio: 'Belgrano 234, La Rioja',
    estado: 'activo', tramite: 'matriculado', estadoPago: 'approved',
    montoInscripcion: 15000, universidad: 'UBA', titulo: 'Lic. en Terapia Ocupacional',
    fechaEgreso: '2018-06-15', createdAt: '2019-08-01',
  },
  {
    id: '6', matricula: '0425', nombre: 'Diego', apellido: 'Ramírez',
    dni: '40123456', cuit: '20-40123456-9', email: 'diego.r@yahoo.com',
    telefono: '3804555555', domicilio: 'Urquiza 567, La Rioja',
    estado: 'inactivo', tramite: 'rechazado', estadoPago: 'rejected',
    montoInscripcion: 15000, universidad: 'UCSF', titulo: 'Lic. en Terapia Ocupacional',
    fechaEgreso: '2021-03-10', notas: 'Documentación incompleta — DNI ilegible.',
    createdAt: '2022-04-12',
  },
  {
    id: '7', matricula: '0426', nombre: 'Valentina', apellido: 'Torres',
    dni: '41987654', cuit: '27-41987654-2', email: 'valen.t@gmail.com',
    telefono: '3804666666', domicilio: 'Pelagio Luna 890, La Rioja',
    estado: 'en_tramite', tramite: 'pendiente_datos', estadoPago: null,
    montoInscripcion: 15000, createdAt: '2024-01-15',
  },
  {
    id: '8', matricula: '0427', nombre: 'Marcos', apellido: 'Herrera',
    dni: '36543210', cuit: '20-36543210-4', email: 'marcos.h@outlook.com',
    telefono: '3804777777', domicilio: 'Joaquín V. González 101, La Rioja',
    estado: 'activo', tramite: 'aprobado', estadoPago: 'approved',
    montoInscripcion: 15000, universidad: 'UNLaR', titulo: 'Lic. en Terapia Ocupacional',
    fechaEgreso: '2017-11-28', createdAt: '2018-03-20',
  },
  {
    id: '9', matricula: '0428', nombre: 'Florencia', apellido: 'Acosta',
    dni: '42345678', cuit: '27-42345678-6', email: 'flor.a@gmail.com',
    telefono: '3804888888', domicilio: 'España 321, La Rioja',
    estado: 'suspendido', tramite: 'rechazado', estadoPago: 'rejected',
    montoInscripcion: 15000, universidad: 'UNLaR', titulo: 'Lic. en Terapia Ocupacional',
    fechaEgreso: '2022-07-05', notas: 'Certificado de antecedentes vencido.',
    createdAt: '2023-09-01',
  },
  {
    id: '10', matricula: '0429', nombre: 'Nicolás', apellido: 'Vargas',
    dni: '39876543', cuit: '20-39876543-8', email: 'nico.v@gmail.com',
    telefono: '3804999999', domicilio: 'Av. Castro Barros 456, La Rioja',
    estado: 'activo', tramite: 'matriculado', estadoPago: 'approved',
    montoInscripcion: 15000, universidad: 'UCSF', titulo: 'Lic. en Terapia Ocupacional',
    fechaEgreso: '2020-12-18', createdAt: '2021-05-10',
  },
];

// Badge styles
export const ESTADO_TRAMITE_STYLES: Record<EstadoTramite, { label: string; className: string }> = {
  pendiente_datos:      { label: 'Datos Pendientes',   className: 'bg-slate-100 text-slate-600 border-slate-200' },
  revision_documentos:  { label: 'En Revisión',         className: 'bg-amber-50 text-amber-700 border-amber-200' },
  pendiente_pago:       { label: 'Pend. de Pago',       className: 'bg-blue-50 text-blue-700 border-blue-200' },
  aprobado:             { label: 'Aprobado',             className: 'bg-teal-50 text-teal-700 border-teal-200' },
  rechazado:            { label: 'Rechazado',            className: 'bg-rose-50 text-rose-700 border-rose-200' },
  matriculado:          { label: 'Matriculado',          className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export const ESTADO_MATRICULA_STYLES: Record<EstadoMatricula, { label: string; className: string }> = {
  activo:     { label: 'Activo',     className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactivo:   { label: 'Inactivo',   className: 'bg-slate-100 text-slate-600 border-slate-200' },
  en_tramite: { label: 'En Trámite', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspendido: { label: 'Suspendido', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  baja:       { label: 'Baja',       className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export const ESTADO_PAGO_STYLES: Record<string, { label: string; className: string }> = {
  approved:   { label: 'Aprobado',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending:    { label: 'Pendiente',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_process: { label: 'En proceso',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected:   { label: 'Rechazado',   className: 'bg-rose-50 text-rose-700 border-rose-200' },
  null:       { label: 'Sin pago',    className: 'bg-slate-100 text-slate-500 border-slate-200' },
};
