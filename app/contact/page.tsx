import { pageMetadata } from '@/lib/metadata';
import ContactSection from '@/components/sections/Contact/ContactSection';

export const metadata = pageMetadata({
  path: '/contact',
  title: 'Contact',
  description: 'Talk to Thrive Multimedia: 3rd Floor, Novare Central, Wuse Zone 5, Abuja.',
});

export default function ContactPage() {
  return <ContactSection headingLevel="h1" />;
}
