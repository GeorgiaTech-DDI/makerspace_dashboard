'use client';
import Chart from "react-apexcharts";


import Link from 'next/link';
import { Navbar } from 'flowbite-react';
import ExampleChart from '../components/examplechart'
import ExampleAPIChart from '../components/exampleAPIChart'

export default function Home() {



  return (
   <main>
     <Navbar className="bg-gt-gold" fluid rounded>
      <Navbar.Brand as={Link} href="https://flowbite-react.com">
        <img src="https://inventionstudio.gatech.edu/wp-content/uploads/2018/05/Logo_without_Text.png" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-white">Invention Studio Dashboard</span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="#" active className="text-white">
          <span className="text-white">Home</span>
        </Navbar.Link>
        <Navbar.Link as={Link} href="#">
          About
        </Navbar.Link>
        <Navbar.Link as={Link} href="#">
Contact        </Navbar.Link>
        
      </Navbar.Collapse>
    </Navbar>

<div className="flex flex-row">
<ExampleChart type="line"/>
<ExampleChart type='bar'/>
<ExampleChart type='area'/>
<ExampleAPIChart type='bar'/>
</div>
    
    </main>
  );
}
