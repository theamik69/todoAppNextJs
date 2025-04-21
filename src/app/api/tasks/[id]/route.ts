import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyJwt } from '../../../../../lib/jwt'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {

  const token = req.headers.get('authorization')?.split(' ')[1]
  const user = verifyJwt(token || '')
  
  if (!user || user.role !== 'LEAD') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
  }
  
  const param = await params;
  
  const { title, description, assignedUserIds, status } = await req.json()
  
  const existing = await prisma.task.findUnique({
    where: { id: param.id },
    include: { assignedUsers: true }
  })

  if (!existing) {
    return NextResponse.json({ message: 'Task not found' }, { status: 404 })
  }

  const cleanedAssignedUserIds = Array.isArray(assignedUserIds)
  ? assignedUserIds.filter((id) => typeof id === 'string' && id.trim() !== '')
  : [];

  const updated = await prisma.task.update({
    where: { id: param.id },
    data: {
      title,
      description,
      status,
      assignedUsers: {
        set: cleanedAssignedUserIds.map((id) => ({ id })),
      },
    },
    include: { assignedUsers: true }
  }) 

  await prisma.taskLog.create({
    data: {
      taskId: updated.id,
      action: 'UPDATE',
      oldValue: JSON.stringify({
        title: existing.title,
        description: existing.description,
        assignedUserIds: existing.assignedUsers.map(u => u.id),
      }),
      newValue: JSON.stringify({
        title,
        description,
        assignedUserIds,
      }),
      changedById: user.id,
    },
  })

  return NextResponse.json(updated)
}
