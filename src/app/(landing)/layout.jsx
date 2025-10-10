
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CTASection from "@/components/landing/CTASection";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen ">
      <Header />
      {children}
      <CTASection />

      <Footer />
    </div>
  );
};

export default Layout;
