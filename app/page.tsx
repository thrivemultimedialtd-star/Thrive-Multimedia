import Hero from '@/components/sections/Hero/Hero';
import Intro from '@/components/sections/Intro/Intro';
import Process from '@/components/sections/Process/Process';
import SelectedWork from '@/components/sections/SelectedWork/SelectedWork';
import ServiceList from '@/components/sections/ServiceList/ServiceList';
import Markets from '@/components/sections/Markets/Markets';
import AboutSection from '@/components/sections/About/AboutSection';
import ContactSection from '@/components/sections/Contact/ContactSection';
import SheetStack from '@/components/motion/SheetStack/SheetStack';

export default function Home() {
  return (
    <SheetStack>
      <Hero />
      <Intro />
      <Process />
      <SelectedWork />
      <ServiceList />
      <Markets />
      <AboutSection />
      <ContactSection />
    </SheetStack>
  );
}
