import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'JE心怡美顏館｜問題肌膚專門店',
  description: '台灣獨創無痛清粉刺、問題肌膚管理、熱蠟除毛與美業教學。'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <header className="header">
          <div className="container nav">
            <Link href="/"><b>JE心怡美顏館</b></Link>
            <nav className="nav-links">
              <Link href="/services">服務</Link>
              <Link href="/cases">案例</Link>
              <Link href="/shop">商城</Link>
              <Link href="/teaching">教學</Link>
              <Link href="/cart">購物車</Link>
              <Link href="/admin">後台</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="container">
            <p>© JE心怡美顏館 / 林季儀老師</p>
          </div>
        </footer>
        <div className="mobile-fab">
          <a href="https://lin.ee" target="_blank">LINE客服</a>
          <Link href="/services">立即預約</Link>
          <Link href="/shop">立即購物</Link>
        </div>
      </body>
    </html>
  );
}
