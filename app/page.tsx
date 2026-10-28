import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';
import Hero from '@/components/sections/Hero/Hero';
import MotionShowcase from '@/components/sections/MotionShowcase/MotionShowcase';
import Process from '@/components/sections/Process/Process';
import SelectedWork from '@/components/sections/SelectedWork/SelectedWork';
import ServiceList from '@/components/sections/ServiceList/ServiceList';
import Markets from '@/components/sections/Markets/Markets';
import AboutSection from '@/components/sections/About/AboutSection';
import ContactSection from '@/components/sections/Contact/ContactSection';

export const metadata = pageMetadata({ path: '/', description: site.description });

export default function Home() {
  return (
    <>
      <Hero />
      <MotionShowcase />
      <Process />
      <SelectedWork />
      <ServiceList />
      <Markets />
      <AboutSection />
      <ContactSection />
    </>
  );
}
