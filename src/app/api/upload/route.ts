import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    
    if (!userId) {
      return NextResponse.json({ error: 'No userId provided' }, { status: 400 })
    }

    // Obtener archivos del FormData
    const cedulaFiles = formData.getAll('cedulaFiles') as File[]
    const comprobantesFiles = formData.getAll('comprobantesFiles') as File[]
    const audioBlob = formData.get('audioBlob') as File | null

    console.log('📁 Subiendo archivos para usuario:', userId)
    console.log('📄 Cédula files:', cedulaFiles.length)
    console.log('📋 Comprobantes files:', comprobantesFiles.length)
    console.log('🎵 Audio:', audioBlob ? 'Sí' : 'No')

    // Subir archivos de cédula
    const cedulaAssets = await Promise.all(
      cedulaFiles.map(async (file) => {
        console.log('📄 Subiendo cédula:', file.name, file.type)
        if (file.type.startsWith('image/')) {
          return await client.assets.upload('image', file, {
            filename: file.name
          })
        } else {
          return await client.assets.upload('file', file, {
            filename: file.name
          })
        }
      })
    )

    // Subir archivos de comprobantes
    const comprobantesAssets = await Promise.all(
      comprobantesFiles.map(async (file) => {
        console.log('📋 Subiendo comprobante:', file.name, file.type)
        if (file.type.startsWith('image/')) {
          return await client.assets.upload('image', file, {
            filename: file.name
          })
        } else {
          return await client.assets.upload('file', file, {
            filename: file.name
          })
        }
      })
    )

    // Subir audio
    let audioAsset = null
    if (audioBlob) {
      console.log('🎵 Subiendo audio:', audioBlob.name, audioBlob.type)
      audioAsset = await client.assets.upload('file', audioBlob, {
        filename: audioBlob.name
      })
    }

    // Preparar referencias para Sanity
    const cedulaReferences = cedulaAssets.map(asset => {
      if (asset._type === 'sanity.imageAsset') {
        return {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      } else {
        return {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      }
    })

    const comprobantesReferences = comprobantesAssets.map(asset => {
      if (asset._type === 'sanity.imageAsset') {
        return {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      } else {
        return {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      }
    })

    const audioReference = audioAsset ? {
      _type: 'file',
      asset: {
        _type: 'reference',
        _ref: audioAsset._id
      }
    } : undefined

    // Actualizar documento del usuario
    const updateData: any = {
      estadoDocumentacion: 'revision'
    }

    if (cedulaReferences.length > 0) {
      updateData.cedulaArchivo = cedulaReferences
    }

    if (comprobantesReferences.length > 0) {
      updateData.comprobantesDeuda = comprobantesReferences
    }

    if (audioReference) {
      updateData.audioValidacion = audioReference
    }

    console.log('💾 Actualizando usuario con:', updateData)

    await client
      .patch(userId)
      .set(updateData)
      .commit()

    console.log('✅ Usuario actualizado exitosamente')

    return NextResponse.json({ 
      success: true,
      message: 'Archivos subidos exitosamente',
      uploadedFiles: {
        cedula: cedulaFiles.length,
        comprobantes: comprobantesFiles.length,
        audio: audioBlob ? 1 : 0
      }
    })

  } catch (error) {
    console.error('❌ Error en upload:', error)
    return NextResponse.json(
      { error: 'Error al subir archivos: ' + (error as Error).message },
      { status: 500 }
    )
  }
}