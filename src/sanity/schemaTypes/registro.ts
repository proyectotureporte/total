import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'registro',
  title: 'Registro de Usuario',
  type: 'document',
  fields: [
    defineField({
      name: 'nombreApellido',
      title: 'Nombre y Apellido',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'aliadoId',
      title: 'ID del Aliado',
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
      name: 'contrasena',
      title: 'Contraseña',
      type: 'string',
      validation: Rule => Rule.required()
    }),
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
          { title: 'Validado', value: 'aprobado' },
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
  name: 'comision',
  title: 'Comisión Generada',
  type: 'number',
  initialValue: 0,
  validation: Rule => Rule.min(0),
  description: 'Comisión en euros generada por este cliente'
}),
defineField({
  name: 'fase',
  title: 'Fase del Proceso',
  type: 'string',
  options: {
    list: [
      { title: '🔄 En Proceso', value: 'proceso' },
      { title: '✅ Exitoso', value: 'exitoso' },
      { title: '❌ Fallido', value: 'fallido' }
    ],
    layout: 'radio'
  },
  initialValue: 'proceso',
  validation: Rule => Rule.required(),
  description: 'Estado actual del proceso del cliente'
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