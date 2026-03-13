import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadFile } from '@/services/blob'
import { Role, UploadType } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== Role.PATIENT) {
      return NextResponse.json(
        { error: 'Only patients can upload files' },
        { status: 403 }
      )
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!patientProfile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const conversationId = formData.get('conversationId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Determine upload type from MIME type
    let uploadType: UploadType = UploadType.DOCUMENT
    if (file.type.startsWith('image/')) {
      uploadType = UploadType.IMAGE
    } else if (file.type.startsWith('audio/')) {
      uploadType = UploadType.AUDIO
    }

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to blob storage
    const uploadResult = await uploadFile(
      buffer,
      file.name,
      patientProfile.id,
      uploadType
    )

    // Save upload record to DB
    const upload = await prisma.upload.create({
      data: {
        patientId: patientProfile.id,
        conversationId: conversationId || null,
        type: uploadType,
        blobUrl: uploadResult.url,
        mimeType: file.type,
        uploadedByRole: Role.PATIENT,
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        actorType: 'PATIENT',
        actorId: session.user.id,
        action: 'FILE_UPLOADED',
        metadataJson: {
          uploadId: upload.id,
          type: uploadType,
          filename: file.name,
          mimeType: file.type,
          isMock: uploadResult.isMock,
        },
      },
    })

    return NextResponse.json({
      success: true,
      upload: {
        id: upload.id,
        url: uploadResult.url,
        type: uploadType,
        mimeType: file.type,
        isMock: uploadResult.isMock,
      },
    })
  } catch (error) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
