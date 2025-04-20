import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyJwt } from '../../../../../../lib/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const payload = token && verifyJwt(token || '');

  if (!payload) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const param = await params;

  const logs = await prisma.taskLog.findMany({
    where: { taskId: param.id },
    include: { changedBy: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(logs);
}
