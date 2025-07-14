'use client'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

export default defineConfig({
  basePath: '/sanity',
  projectId: 'p02io4ti',
  dataset: 'production',
  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: '2025-06-18'}),
  ],
})