import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 1. PERBAIKAN: Samakan persis dengan yang ada di file login
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "kunci_cadangan");

// 2. PERBAIKAN: Fungsi Next.js Middleware HARUS bernama 'middleware', bukan 'proxy'
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('admin_session')?.value;
  let isTokenValid = false;

  // Cek dulu apakah tiketnya (token) valid jika ada
  // (Hapus pengecekan && SECRET_KEY karena SECRET_KEY sekarang dijamin selalu ada)
  if (token) {
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

// Tambahkan '/login' ke dalam daftar rute yang diawasi
export const config = {
  matcher: ['/admin/:path*', '/login'],
};