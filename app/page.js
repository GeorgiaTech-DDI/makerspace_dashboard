'use client';


import Script from 'next/script'

import { Link } from 'next/link';
import { Navbar } from 'flowbite-react';
// import ExampleChart from '../components/examplechart'
import ExampleHeatMap from "@/components/exampleheatmap";
import ExampleChart from "@/components/exampleapichart";
import { Dropdown } from 'flowbite-react';
import { IoCalendarNumber } from "react-icons/io5";
import { FaBeer } from 'react-icons/fa';
import  { CustomFlowbiteTheme } from 'flowbite-react';
import { Datepicker } from "flowbite-react";
import ToolStatus from '@/components/toolStatus';
import TempStatus from '@/components/tempStatus';
import ToolUsage from '@/components/toolusages';


const customTheme = {
  button: {
    color: {
      primary: 'bg-red-500 hover:bg-red-600',
    },
  },
};

export default function Home() {
  return (
   <main>
    <Script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/datepicker.min.js" />
     <Navbar className="bg-gt-gold" fluid rounded>
      <Navbar.Brand href="https://flowbite-react.com">
        <img src="/favicon.ico" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-white">Invention Studio Dashboard</span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/" active className="text-white">
          <span className="text-white">Home</span>
        </Navbar.Link>
        <Navbar.Link href="#">
          About
        </Navbar.Link>
        <Navbar.Link href="#">
          Contact        
        </Navbar.Link>
        <Navbar.Link href="/login">
          Login
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>

    <div className="m-2">
    <div className="flex flex-row justify-between items-center m-2">
  <div className="text-2xl text-white font-sans font-semibold	">
    Flowers Invention Studio
  </div>


    
    <div className='flex flex-row'>
    <Datepicker title="Start Date" />
    <span class="mx-4 center text-gray-500">to</span>
    <Datepicker title="End Date" />
<div className='m-2'></div>

    
      </div>
      </div>

{/* <div className="m-2 grid grid-cols-4 gap-4 content-end">
<ExampleChart type="line"/>
<ExampleChart type='bar'/>


</div> */}
<div className=" m-2 grid grid-cols-2 gap-4 content-end">
<ToolStatus/>
<TempStatus type="line"/>

</div>
<div className=" m-2 grid grid-cols-2 gap-4 content-end">
<ToolUsage/>

</div>

</div>
    
    </main>
  );
}
