import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'registroaliado',
  title: 'Registro Aliado',
  type: 'document',
  fields: [
    // Campo ID único de aliado
    defineField({
      name: 'aliadoId',
      title: 'ID de Aliado',
      type: 'string',
      validation: Rule => Rule.required().regex(/^AR-\d{4}$/).error('Debe tener formato AR-0000'),
      readOnly: true,
      description: 'ID único generado automáticamente (AR-XXXX)'
    }),
    
    // INFORMACIÓN PERSONAL
    defineField({
      name: 'nombreApellido',
      title: 'Nombre y Apellido',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(100),
      description: 'Nombre completo del aliado'
    }),
    defineField({
      name: 'cedula',
      title: 'Cédula',
      type: 'string',
      validation: Rule => Rule.required().regex(/^\d{7,10}$/).error('Debe tener entre 7 y 10 dígitos'),
      description: 'Número de identificación'
    }),
    defineField({
      name: 'correo',
      title: 'Correo Electrónico',
      type: 'string',
      validation: Rule => Rule.required().email(),
      description: 'Email de contacto (se normaliza a minúsculas)'
    }),
    defineField({
      name: 'celular',
      title: 'Celular',
      type: 'string',
      validation: Rule => Rule.required().regex(/^\d{10}$/).error('Debe tener exactamente 10 dígitos'),
      description: 'Número de teléfono celular'
    }),
    defineField({
      name: 'ciudad',
      title: 'Ciudad',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(50),
      description: 'Ciudad de residencia'
    }),
    
    // INFORMACIÓN PROFESIONAL
    defineField({
      name: 'sectorTrabajo',
      title: 'Sector de Trabajo',
      type: 'string',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: 'Financiero', value: 'Financiero' },
          { title: 'Seguros', value: 'Seguros' },
          { title: 'Inmobiliaria', value: 'Inmobiliaria' },
          { title: 'Consultoría', value: 'Consultoría' },
          { title: 'Tecnología', value: 'Tecnología' },
          { title: 'Salud', value: 'Salud' },
          { title: 'Educación', value: 'Educación' },
          { title: 'Otros', value: 'Otros' }
        ],
        layout: 'dropdown'
      },
      description: 'Sector principal donde trabaja el aliado'
    }),
    defineField({
      name: 'cargo',
      title: 'Cargo',
      type: 'string',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: 'Asesor', value: 'Asesor' },
          { title: 'Gerente', value: 'Gerente' },
          { title: 'Director', value: 'Director' },
          { title: 'Coordinador', value: 'Coordinador' },
          { title: 'Auxiliar', value: 'Auxiliar' },
          { title: 'Consultor', value: 'Consultor' },
          { title: 'Analista', value: 'Analista' },
          { title: 'Otro', value: 'Otro' }
        ],
        layout: 'dropdown'
      },
      description: 'Cargo actual en su trabajo'
    }),
    defineField({
      name: 'experiencia',
      title: 'Años de Experiencia',
      type: 'string',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: '0-1 años', value: '0-1' },
          { title: '2-5 años', value: '2-5' },
          { title: '6-10 años', value: '6-10' },
          { title: '11-15 años', value: '11-15' },
          { title: '16-20 años', value: '16-20' },
          { title: 'Más de 20 años', value: '20+' }
        ],
        layout: 'radio'
      },
      description: 'Experiencia laboral en el sector'
    }),
    defineField({
      name: 'potencialClientes',
      title: 'Potencial de Clientes Mensuales',
      type: 'string',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: '1-5 clientes', value: '1-5' },
          { title: '6-10 clientes', value: '6-10' },
          { title: '11-20 clientes', value: '11-20' },
          { title: '21-50 clientes', value: '21-50' },
          { title: 'Más de 50 clientes', value: '50+' }
        ],
        layout: 'radio'
      },
      description: 'Estimación de clientes potenciales por mes'
    }),
    defineField({
      name: 'edad',
      title: 'Edad',
      type: 'string',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: '18-25 años', value: '18-25' },
          { title: '26-35 años', value: '26-35' },
          { title: '36-45 años', value: '36-45' },
          { title: '46-55 años', value: '46-55' },
          { title: '56-65 años', value: '56-65' },
          { title: 'Más de 65 años', value: '65+' }
        ],
        layout: 'radio'
      },
      description: 'Rango de edad del aliado'
    }),
    
    // SEGURIDAD
    defineField({
      name: 'contrasena',
      title: 'Contraseña (Hash)',
      type: 'string',
      validation: Rule => Rule.required(),
      readOnly: true,
      description: 'Contraseña hasheada con bcrypt'
    }),
    
    // CAMPOS ADMINISTRATIVOS
    defineField({
      name: 'fechaRegistro',
      title: 'Fecha de Registro',
      type: 'datetime',
      validation: Rule => Rule.required(),
      readOnly: true,
      description: 'Fecha y hora de registro automática'
    }),
    defineField({
      name: 'estadoDocumentacion',
      title: 'Estado de Documentación',
      type: 'string',
      options: {
        list: [
          { title: '🟡 Pendiente', value: 'pendiente' },
          { title: '🔵 En Revisión', value: 'revision' },
          { title: '🟢 Aprobado', value: 'aprobado' },
          { title: '🔴 Denegado', value: 'denegado' }
        ],
        layout: 'radio'
      },
      initialValue: 'pendiente',
      validation: Rule => Rule.required(),
      description: 'Estado actual de la documentación del aliado'
    }),
    defineField({
      name: 'motivoDenegacion',
      title: 'Motivo de Denegación',
      type: 'text',
      rows: 3,
      hidden: ({ document }) => document?.estadoDocumentacion !== 'denegado',
      description: 'Razón específica si la documentación fue denegada'
    }),
    
    // CAMPOS DE ARCHIVOS (para futuro uso)
    defineField({
      name: 'cedulaArchivo',
      title: 'Archivos de Cédula',
      type: 'array',
      of: [
        { 
          type: 'image',
          options: {
            hotspot: true
          }
        },
        { 
          type: 'file',
          options: {
            accept: '.pdf,.jpg,.jpeg,.png'
          }
        }
      ],
      description: 'Carga ambas caras de la cédula (formato: PDF, JPG, PNG)'
    }),
    defineField({
      name: 'comprobantesDeuda',
      title: 'Comprobantes de Deuda',
      type: 'array',
      of: [
        { 
          type: 'image',
          options: {
            hotspot: true
          }
        },
        { 
          type: 'file',
          options: {
            accept: '.pdf,.jpg,.jpeg,.png'
          }
        }
      ],
      description: 'Certificados de deuda y comprobantes financieros'
    }),
    defineField({
      name: 'audioValidacion',
      title: 'Audio de Validación',
      type: 'file',
      options: {
        accept: '.mp3,.wav,.m4a,.ogg'
      },
      description: 'Audio de validación del aliado'
    }),

    // CAMPOS ADICIONALES
    defineField({
      name: 'notas',
      title: 'Notas Administrativas',
      type: 'text',
      rows: 4,
      description: 'Notas internas sobre el aliado'
    }),
    defineField({
      name: 'fechaAprobacion',
      title: 'Fecha de Aprobación',
      type: 'datetime',
      readOnly: true,
      hidden: ({ document }) => document?.estadoDocumentacion !== 'aprobado',
      description: 'Fecha de aprobación de la documentación'
    }),
    defineField({
      name: 'ultimaActualizacion',
      title: 'Última Actualización',
      type: 'datetime',
      readOnly: true,
      description: 'Última vez que se modificó el registro'
    }),
    
    // CAMPOS DE CONTROL DE ACCESO
    defineField({
      name: 'activo',
      title: 'Usuario Activo',
      type: 'boolean',
      initialValue: true,
      description: 'Si el usuario puede acceder al sistema'
    }),
    defineField({
      name: 'intentosFallidos',
      title: 'Intentos de Login Fallidos',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Contador de intentos de login fallidos'
    }),
    defineField({
      name: 'ultimoAcceso',
      title: 'Último Acceso',
      type: 'datetime',
      readOnly: true,
      description: 'Última vez que el usuario inició sesión'
    })
  ],
  
  // Configuración de vista previa - CORREGIDA
  preview: {
    select: {
      title: 'nombreApellido',
      subtitle: 'aliadoId',
      estado: 'estadoDocumentacion',
      media: 'cedulaArchivo.0'
    },
    prepare({ title, subtitle, estado }) {
      const estadoEmoji = {
        pendiente: '🟡',
        revision: '🔵', 
        aprobado: '🟢',
        denegado: '🔴'
      }
      
      return {
        title: title || 'Sin nombre',
        subtitle: `${subtitle || 'Sin ID'} - ${estadoEmoji[estado as keyof typeof estadoEmoji] || '⚪'} ${estado || 'Sin estado'}`,
      }
    }
  },

  // Ordenamiento por defecto
  orderings: [
    {
      title: 'Fecha de registro (más reciente)',
      name: 'fechaRegistroDesc',
      by: [{ field: 'fechaRegistro', direction: 'desc' }]
    },
    {
      title: 'ID de Aliado',
      name: 'aliadoIdAsc', 
      by: [{ field: 'aliadoId', direction: 'asc' }]
    },
    {
      title: 'Estado',
      name: 'estadoAsc',
      by: [{ field: 'estadoDocumentacion', direction: 'asc' }]
    },
    {
      title: 'Nombre',
      name: 'nombreAsc',
      by: [{ field: 'nombreApellido', direction: 'asc' }]
    }
  ]
})