import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const SECRET_KEY = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

// Fungsi sekarang bernama proxy
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('admin_session')?.value;
  let isTokenValid = false;

  // 1. Cek dulu apakah tiketnya (token) valid jika ada
  if (token && SECRET_KEY) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isTokenValid = true; // Tiket asli dan belum kadaluwarsa
    } catch (error) {
      isTokenValid = false; // Tiket palsu/kadaluwarsa
    }
  }

  // ATURAN 1: Cegah admin yang sudah login membuka halaman /login
  if (path === '/login' && isTokenValid) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // ATURAN 2: Cegah penyusup masuk ke halaman /admin
  if (path.startsWith('/admin') && !isTokenValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Tambahkan '/login' ke dalam daftar rute yang diawasi oleh Satpam
export const config = {
  matcher: ['/admin/:path*', '/login'],
};