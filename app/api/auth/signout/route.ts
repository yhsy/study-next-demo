// import { signOut } from '@/auth';
import { signOut } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true,data:{} });
  } catch (error) {
    return NextResponse.json({ success: false, errorMsg: 'Failed to sign out',data:{} });
  }
}