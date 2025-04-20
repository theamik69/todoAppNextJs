import { prisma } from '../../../../../lib/prisma';
import { verifyJwt } from '../../../../../lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const user = verifyJwt(token || '');
  if (!user || user.role !== 'LEAD') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const teams = await prisma.user.findMany({
    where: { role: 'TEAM' },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(teams);
}
