import type { FC } from 'react'
import { Navbar } from '../components/Navbar'
import {
  HeroSection,
  PortalsSection,
  FeaturesSection,
  Footer
} from '../components/LandingSections'

export const LandingPage: FC = () => {
  return (
    <div className="app-container" id="top">
      <Navbar />
      <main className="main-content">
        <HeroSection />
        <PortalsSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}

