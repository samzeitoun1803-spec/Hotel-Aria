import { MotionConfig } from 'framer-motion'
import { DemoBanner } from './components/overlays/DemoBanner'
import { DestinationDialog } from './components/overlays/DestinationDialog'
import { LegalDialog } from './components/overlays/LegalDialog'
import { MobileCTA } from './components/overlays/MobileCTA'
import { Agency } from './components/sections/Agency'
import { DestinationGallery } from './components/sections/DestinationGallery'
import { Footer } from './components/sections/Footer'
import { Hero } from './components/sections/Hero'
import { JourneySteps } from './components/sections/JourneySteps'
import { Manifesto } from './components/sections/Manifesto'
import { Navbar } from './components/sections/Navbar'
import { Services } from './components/sections/Services'
import { Testimonials } from './components/sections/Testimonials'
import { TravelFinder } from './components/sections/TravelFinder'
import { TravelForm } from './components/sections/TravelForm'
import { WhyJasmin } from './components/sections/WhyJasmin'
import { Cursor } from './components/ui/Cursor'
import { isDemo } from './lib/demo'
import { ScrollProvider } from './lib/scroll'
import { TripProvider } from './lib/trip/TripContext'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProvider>
        <TripProvider>
          {isDemo && <DemoBanner />}
          <a
            href="#contenu"
            className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-ink px-5 py-3 font-semibold text-ivory transition-transform focus:translate-y-0"
          >
            Aller au contenu
          </a>
          <Navbar />
          <main id="contenu">
            <Hero />
            <Manifesto />
            <DestinationGallery />
            <TravelFinder />
            <Services />
            <JourneySteps />
            <WhyJasmin />
            <Agency />
            <Testimonials />
            <TravelForm />
          </main>
          <Footer />
          <MobileCTA />
          <DestinationDialog />
          <LegalDialog />
          <Cursor />
        </TripProvider>
      </ScrollProvider>
    </MotionConfig>
  )
}
