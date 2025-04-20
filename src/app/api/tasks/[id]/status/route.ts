import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyJwt } from '../../../../../../lib/jwt';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const user = verifyJwt(token || '');
  if (!user || user.role !== 'TEAM') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const param = await params;

  const { status, description } = await req.json();

  const task = await prisma.task.findUnique({
    where: { id: param.id },
    include: { assignedUsers: true },
  });

  if (
    !task ||
    !task.assignedUsers.some((assigned) => assigned.id === user.id)
  ) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const updatedTask = await prisma.task.update({
    where: { id: param.id },
    data: { status, description },
  });

  await prisma.taskLog.create({
    data: {
      taskId: param.id,
      action: 'UPDATE_STATUS',
      oldValue: JSON.stringify({ status: task.status, description: task.description }),
      newValue: JSON.stringify({ status, description }),
      changedById: user.id,
    },
  });

  return NextResponse.json(updatedTask);
}
