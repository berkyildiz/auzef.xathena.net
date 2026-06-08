import '../index.css';

export const metadata = {
  metadataBase: new URL('https://auzef.xathena.net'),
  title: {
    template: '%s | AUZEF Soru Çözüm',
    default: 'AUZEF Çıkmış Sorular ve Çözümleri | Sınavlara Hazırlık',
  },
  description: 'AUZEF öğrencileri için özel olarak hazırlanmış, geçmiş dönem çıkmış sorular ve detaylı çözümleri. Sınavlara en iyi şekilde hazırlanın.',
  keywords: 'AUZEF, çıkmış sorular, istanbul üniversitesi, auzef deneme, auzef sınav soruları, benzetim, proje yönetimi',
  authors: [{ name: 'Berk Yıldız' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'AUZEF Çıkmış Sorular ve Çözümleri | Sınavlara Hazırlık',
    description: 'AUZEF çıkmış sınav soruları, denemeleri ve detaylı çözümleri. Hemen test çözmeye başlayın.',
    url: 'https://auzef.xathena.net',
    siteName: 'AUZEF Soru Çözüm',
    images: [{ url: '/og-banner.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-banner.png'],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AUZEF Soru Çözüm",
    "alternateName": ["AUZEF Çıkmış Sorular", "AUZEF Deneme Sınavları"],
    "url": "https://auzef.xathena.net"
  };

  return (
    <html lang="tr">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <footer style={{
          marginTop: '4rem',
          padding: '2rem',
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Developed with ❤️ by <strong>Berk Yıldız</strong>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a href="https://berkyildiz.com.tr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              berkyildiz.com.tr
            </a>
            <span>|</span>
            <a href="https://xathena.net" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              xathena.net
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
