"use client"

import Sidebar from "./src/ui/navigation/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@radix-ui/react-tooltip"

export default function Home() {
  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col">
          {/* Hero Section */}
          <header className="relative h-[60vh] bg-cover bg-center bg-[url('https://inventionstudio.gatech.edu/files/2024/08/IS-SM24-24.jpg')] text-white">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10 flex h-full flex-col justify-center px-8">
              <h1 className="text-4xl font-extrabold md:text-6xl">Georgia Tech Invention Studio</h1>
              <p className="mt-4 text-lg md:text-xl max-w-2xl">
                A student-run makerspace where creativity, innovation, and hands-on learning come to life. Design, prototype, and build your next big idea!
              </p>
              <Button className="mt-6 w-max bg-primary hover:bg-primary-dark">Get Started</Button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-8 bg-gray-50">
            {/* Section: About the Invention Studio */}
            <section className="grid md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-semibold text-gray-800">Welcome to the Invention Studio</h2>
                <p className="mt-4 text-lg text-gray-600">
                  The Invention Studio is Georgia Tech’s premier makerspace, providing access to a wide range of tools including 3D printers, laser cutters, CNC machines, and much more. Students have free access to these tools to design, prototype, and create their inventions.
                </p>
              </div>
              <div className="bg-gray-300 h-64 rounded-md">
              <img
  src="https://lh3.googleusercontent.com/p/AF1QipPtRNRd6901olELv6rrqgd3RlAXjHoljs8Ki_fu=s680-w680-h510"
  alt="Invention Studio"
  className="h-64 w-full object-cover rounded-md"
/>
              </div>
            </section>

            {/* Section: Mission Statement */}
            <section className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-64 rounded-md">
              <img
  src="https://lh3.googleusercontent.com/p/AF1QipOP-sWZXHvlByFalkkMdwqXoQ-UN8fYhknQnWtS=s680-w680-h510"
  alt="Invention Studio"
  className="h-64 w-full object-cover rounded-md"
/>
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-semibold text-gray-800">Our Mission</h2>
                <p className="mt-4 text-lg text-gray-600">
                  Our mission is to inspire and empower students through hands-on learning, encouraging creativity and collaboration to turn ideas into reality. The Invention Studio serves as a hub for innovation at Georgia Tech.
                </p>
              </div>
            </section>

            {/* Section: How to Get Started */}
            <section className="flex flex-col items-center bg-white shadow-md p-8 rounded-lg">
              <h2 className="text-3xl font-semibold text-gray-800">How to Get Started</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl text-center">
                Getting started at the Invention Studio is simple. Visit our space, attend a safety training session, and get certified to use our tools. From there, you can start bringing your projects to life!
              </p>
              <ul className="mt-6 space-y-2 text-lg text-gray-700 list-inside list-disc">
                <li>Visit the studio in the MRDC building</li>
                <li>Attend a safety training session</li>
                <li>Get certified on the tools you want to use</li>
                <li>Start building your project!</li>
              </ul>
              <Button className="mt-6 w-max bg-primary hover:bg-primary-dark">Learn More</Button>
            </section>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
