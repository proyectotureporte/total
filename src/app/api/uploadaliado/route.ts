import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string

    if (!userId) {
      return NextResponse.json({ error: 'No userId provided' }, { status: 400 })
    }

    console.log('Processing upload for user:', userId)

    // Obtener archivos del FormData
    const cedulaFiles = formData.getAll('cedulaFiles') as File[]
    const comprobantesFiles = formData.getAll('comprobantesFiles') as File[]
    const audioBlob = formData.get('audioBlob') as File | null

    console.log('Files received:', {
      cedula: cedulaFiles.length,
      comprobantes: comprobantesFiles.length,
      audio: audioBlob ? 1 : 0
    })

    // Verificar que al menos hay archivos de cédula
    if (cedulaFiles.length === 0) {
      return NextResponse.json({ error: 'Archivos de cédula requeridos' }, { status: 400 })
    }

    // Subir archivos de cédula
    const cedulaAssets = []
    for (const file of cedulaFiles) {
      try {
        let asset
        if (file.type.startsWith('image/')) {
          asset = await client.assets.upload('image', file, {
            filename: file.name,
            title: file.name
          })
        } else {
          asset = await client.assets.upload('file', file, {
            filename: file.name,
            title: file.name
          })
        }
        cedulaAssets.push(asset)
        console.log('Uploaded cedula file:', file.name, asset._id)
      } catch (error) {
        console.error('Error uploading cedula file:', file.name, error)
        throw new Error(`Error subiendo archivo de cédula: ${file.name}`)
      }
    }

    // Subir archivos de comprobantes
    const comprobantesAssets = []
    for (const file of comprobantesFiles) {
      try {
        let asset
        if (file.type.startsWith('image/')) {
          asset = await client.assets.upload('image', file, {
            filename: file.name,
            title: file.name
          })
        } else {
          asset = await client.assets.upload('file', file, {
            filename: file.name,
            title: file.name
          })
        }
        comprobantesAssets.push(asset)
        console.log('Uploaded comprobante file:', file.name, asset._id)
      } catch (error) {
        console.error('Error uploading comprobante file:', file.name, error)
        throw new Error(`Error subiendo comprobante: ${file.name}`)
      }
    }

    // Subir audio
    let audioAsset = null
    if (audioBlob) {
      try {
        audioAsset = await client.assets.upload('file', audioBlob, {
          filename: audioBlob.name || 'audio_validation',
          title: 'Audio de Validación'
        })
        console.log('Uploaded audio file:', audioAsset._id)
      } catch (error) {
        console.error('Error uploading audio file:', error)
        throw new Error('Error subiendo archivo de audio')
      }
    }

    // Preparar referencias para Sanity con _key únicos
    const cedulaReferences = cedulaAssets.map((asset, index) => {
      const uniqueKey = `cedula_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      if (asset._type === 'sanity.imageAsset') {
        return {
          _type: 'image',
          _key: uniqueKey,
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      } else {
        return {
          _type: 'file',
          _key: uniqueKey,
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      }
    })

    const comprobantesReferences = comprobantesAssets.map((asset, index) => {
      const uniqueKey = `comprobante_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      if (asset._type === 'sanity.imageAsset') {
        return {
          _type: 'image',
          _key: uniqueKey,
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      } else {
        return {
          _type: 'file',
          _key: uniqueKey,
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
    const updateData: Record<string, unknown> = {
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

    console.log('Updating user document with:', updateData)

    await client
      .patch(userId)
      .set(updateData)
      .commit()

    console.log('Document updated successfully')

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
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error al subir archivos: ' + (error as Error).message },
      { status: 500 }
    )
  }
}