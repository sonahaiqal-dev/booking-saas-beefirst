import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '72px', margin: '0' }}>404</h1>
      <h2 style={{ fontWeight: 'normal' }}>Salah link woi</h2>
      <p>Jangan cari yang ndak ade</p>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
        Kembali ke Beranda
      </Link>
    </div>
  )
}