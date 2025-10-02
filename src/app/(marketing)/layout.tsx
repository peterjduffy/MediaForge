import MarketingNav from '@/components/navigation/MarketingNav';
import Footer from '@/components/navigation/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />
      {children}
      <Footer />
    </>
  );
}