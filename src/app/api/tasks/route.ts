import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyJwt } from '../../../../lib/jwt';

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: {
      assignedUsers: true, 
      createdBy: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const user = verifyJwt(token || '');

  if (!user || user.role !== 'LEAD') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { title, description, assignedUserIds } = await req.json();

  const cleanedAssignedUserIds = Array.isArray(assignedUserIds)
    ? assignedUserIds.filter((id) => typeof id === 'string' && id.trim() !== '')
    : [];

  const task = await prisma.task.create({
    data: {
      title,
      description,
      createdById: user.id,
      assignedUsers: {
        connect: cleanedAssignedUserIds.map((id) => ({ id })),
      },
    },
    include: {
      assignedUsers: true,
      createdBy: true,
    },
  });

  await prisma.taskLog.create({
    data: {
      taskId: task.id,
      action: 'CREATE',
      newValue: JSON.stringify({ title, description, assignedUserIds }),
      changedById: user.id,
    },
  });

  return NextResponse.json(task);
}


