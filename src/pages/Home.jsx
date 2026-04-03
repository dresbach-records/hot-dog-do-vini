import React, { useState, useEffect } from 'react';
import Topbar from '../components/Site/Topbar';
import Navbar from '../components/Site/Navbar';
import Hero from '../components/Site/Hero';
import Platforms from '../components/Site/PlatformStrip';
import InfoBand from '../components/Site/InfoBand';
import Menu from '../components/Site/Menu';
import HowToOrder from '../components/Site/HowToOrder';
import Footer from '../components/Site/Footer';
import Floats from '../components/Site/Floats';

const Home = () => {
  const [activeTab, setActiveTab] = useState('todos');

  useEffect(() => {
    // Configuração do Áudio (Conforme original)
    const audio = new Audio('/audio/hotdog-do-vini.mp3');
    audio.volume = 0.4;

    const playAudio = () => {
      audio.play().catch(error => {
        console.log('Interação necessária para áudio:', error);
      });
      // Remove o listener após a primeira interação para não tocar repetidamente
      document.removeEventListener('click', playAudio);
    };

    document.addEventListener('click', playAudio);

    return () => {
      document.removeEventListener('click', playAudio);
      audio.pause();
    };
  }, []);

  return (
    <div className="vini-site-wrapper">
      <Topbar />
      <Navbar />
      <Hero />
      <Platforms />
      <InfoBand />
      <Menu activeTab={activeTab} setActiveTab={setActiveTab} />
      <HowToOrder />
      <Footer />
      <Floats />
    </div>
  );
};

export default Home;
