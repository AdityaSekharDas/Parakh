import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PARAKH — UPI fraud shield',
  description:
    'PARAKH (साक्ष्य): rules + Isolation Forest + call-analyzer fusion that scores every UPI payment before settlement. SIH-2026 demo build.',
  other: {
    // Official Dark Reader opt-out: without it the extension rewrites the
    // server HTML (data-darkreader-* attributes) and React's hydration
    // diff throws mismatch errors on every screen. The newsprint palette
    // is intentional and must not be re-processed.
    'darkreader-lock': 'darkreader-lock',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the theme script below sets the class on
    // <html> before React hydrates; without this React would flag the
    // mismatch and strip the class, flashing the wrong stock.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {/* Apply the saved/system theme before first paint — no stock flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('parakh-theme');var d=false;if(t==='espresso'||t==='dark')d=true;else if(t!=='paper'&&t!=='light')d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
