import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ExampleChart(props) {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // fetching the first 10 pokemon from poke API and showing their base experience
    const fetchPokemonData = async () => {
      let pokemonData = [];
      let pokemonNames = [];
      for (let i = 1; i <= 10; i++) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const data = await response.json();
        pokemonData.push(data.base_experience);
        pokemonNames.push(data.name);
      }
      setSeries([{ name: 'Base Experience', data: pokemonData }]);
      setCategories(pokemonNames);
    };

    fetchPokemonData();
  }, []);

  const options = {
    chart: {
      id: 'basic-bar',
    },
    xaxis: {
      categories: categories,
    },
  };

  return (
    <div className="bg-white w-96 h-96 rounded-lg drop-shadow-lg m-3">
      <ApexChart type={props.type} options={options} series={series} height={'100%'} width={'100%'} />
    </div>
  );
}