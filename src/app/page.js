'use client'
import React from "react";
import Image from "next/image";



export default function Home() {


  const [exampleData, setData] = React.useState("")

  async function getAPIData(){
    const response = await fetch("https://pokeapi.co/api/v2/pokemon-species/pikachu");
    const responseJSON = await response.json();
    setData(JSON.stringify(responseJSON).substring(0,100))
  }


  function buttonPressed(){
    console.log("This was pressed")
  }

 
  return (
    <main class="flex min-h-screen flex-col items-center justify-between p-24">
      <div class="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      <button onClick={getAPIData} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Click Me
      </button>

      <div>
       {exampleData}
      </div>


      </div>
    </main>
  );
}
