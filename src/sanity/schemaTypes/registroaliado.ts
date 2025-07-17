import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'registroaliado',
  title: 'Registro Aliado',
  type: 'document',
  fields: [
    defineField({
      name: 'nombreApellido',
      title: 'Nombre y Apellido',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'cedula',
      title: 'Cédula',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'correo',
      title: 'Correo Electrónico',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'celular',
      title: 'Celular',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'ciudad',
      title: 'Ciudad',
      type: 'string',
      validation: Rule => Rule.required()
    }),
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
          { title: 'Otros', value: 'Otros' }
        ]
      }
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
          { title: 'Otro', value: 'Otro' }
        ]
      }
    }),
    defineField({
      name: 'experiencia',
      title: 'Años de Experiencia',
      type: 'number',
      validation: Rule => Rule.required().min(0).max(70)
    }),
    defineField({
      name: 'potencialClientes',
      title: 'Potencial de Clientes Mensuales',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'edad',
      title: 'Edad',
      type: 'number',
      validation: Rule => Rule.required().min(18).max(90)
    }),
    defineField({
      name: 'contrasena',
      title: 'Contraseña',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    // Campos administrativos y de archivos
    defineField({
      name: 'fechaRegistro',
      title: 'Fecha de Registro',
      type: 'datetime'
    }),
    defineField({
      name: 'estadoDocumentacion',
      title: 'Estado de Documentación',
      type: 'string',
      options: {
        list: [
          { title: 'Pendiente', value: 'pendiente' },
          { title: 'En Revisión', value: 'revision' },
          { title: 'Validado', value: 'validado' },
          { title: 'Denegado', value: 'denegado' }
        ]
      },
      initialValue: 'pendiente'
    }),
    defineField({
      name: 'motivoDenegacion',
      title: 'Motivo de Denegación',
      type: 'text'
    }),
    defineField({
      name: 'cedulaArchivo',
      title: 'Archivos de Cédula',
      type: 'array',
      of: [
        { type: 'image' },
        { type: 'file' }
      ]
    }),
    defineField({
      name: 'comprobantesDeuda',
      title: 'Comprobantes de Deuda',
      type: 'array',
      of: [
        { type: 'image' },
        { type: 'file' }
      ]
    }),
    defineField({
      name: 'audioValidacion',
      title: 'Audio de Validación',
      type: 'file'
    })
  ]
})