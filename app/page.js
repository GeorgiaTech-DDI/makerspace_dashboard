'use client';


import Link from 'next/link';
import { Navbar } from 'flowbite-react';
import ExampleChart from '../components/examplechart'
import ExampleHeatMap from "@/components/exampleheatmap";
import ExampleAPIChart from "@/components/exampleapichart";
import { Dropdown } from 'flowbite-react';
import { IoCalendarNumber } from "react-icons/io5";
import { FaBeer } from 'react-icons/fa';
import  { CustomFlowbiteTheme } from 'flowbite-react';


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

    <div className="m-2">
    <div className="flex flex-row justify-between items-center m-2">
  <div className="text-2xl text-white font-sans font-semibold	">
    Flowers Invention Studio
  </div>


    
    <div className='flex flex-row'>

  <Dropdown color="light" label="Update Dashboard" className='rounded-none'>
      <Dropdown.Item>Settings</Dropdown.Item>
      <Dropdown.Item>Sign out</Dropdown.Item>
      </Dropdown>
<div className='m-2'></div>
      <Dropdown label="Tools" color='light' className='rounded-none'>
      <Dropdown.Item>Wood Room</Dropdown.Item>
      <Dropdown.Item>Metal Room</Dropdown.Item>
      
      </Dropdown>
      </div>
      </div>

<div className="m-2 grid grid-cols-4 gap-4 content-end">
<ExampleChart type="line"/>
<ExampleChart type='bar'/>
<ExampleChart type='area'/>
<ExampleChart type='area'/>

</div>
<div className=" m-2 grid grid-cols-2 gap-4 content-end">
<ExampleHeatMap type='heatmap'/>
<ExampleHeatMap type='heatmap'/>

</div>

</div>
    
    </main>
  );
}
