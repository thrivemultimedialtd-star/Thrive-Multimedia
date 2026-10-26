import { site } from '@/content/site';
import { about } from '@/content/story';
import { pageMetadata } from '@/lib/metadata';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import AboutSection from '@/components/sections/About/AboutSection';
import Process from '@/components/sections/Process/Process';
import Markets from '@/components/sections/Markets/Markets';
import ContactSection from '@/components/sections/Contact/ContactSection';

export const metadata = pageMetadata({ path: '/about', title: 'About', description: about.body[0] });

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        meta={site.location}
        title="About"
        lede="A full-service design agency in Abuja, working across print, web and multimedia."
      />
      <AboutSection teaser={false} />
      <Process id="about-process" />
      <Markets />
      <ContactSection />
    </>
  );
}
