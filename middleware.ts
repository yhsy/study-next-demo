import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

// export function middleware(request: NextRequest) {
//   // 对 API 请求进行处理
//   if (request.nextUrl.pathname.startsWith('/api/customers/')) {
//     // 这里不做任何修改，只是拦截请求以确保类型定义正确传递
//     return NextResponse.next();
//   }
  
//   return NextResponse.next();
// }

// // 只对 /api/customers/ 路径应用中间件
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$).*)','/api/customers/:path*'],
}; 