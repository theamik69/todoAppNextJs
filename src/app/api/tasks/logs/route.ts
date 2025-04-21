import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma'
import { verifyJwt } from '../../../../../lib/jwt'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const payload = token && verifyJwt(token || '');

  if (!payload || payload.role !== 'LEAD') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const logs = await prisma.taskLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        changedBy: {
          select: { name: true, email: true },
        },
        task: {
          select: { title: true }, 
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching task logs:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
