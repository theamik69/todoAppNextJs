import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifyJwt } from '../../../../../lib/jwt';

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const payload = token && verifyJwt(token || '');
  
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { name: true, email: true, role: true },
    });
  
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  
    return NextResponse.json(user);
  }
  