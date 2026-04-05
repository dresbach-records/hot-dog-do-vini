import React, { useState, useEffect } from 'react';
import Navbar from '../components/Site/Navbar';
import Hero from '../components/Site/Hero';
import PublicNotice from '../components/Site/PublicNotice';
import Platforms from '../components/Site/PlatformStrip';
import InfoBand from '../components/Site/InfoBand';
import Menu from '../components/Site/Menu';
import HowToOrder from '../components/Site/HowToOrder';
import Footer from '../components/Site/Footer';
import Floats from '../components/Site/Floats';
import '../styles/site/layout.css';
import '../styles/site/hero.css';
import '../styles/site/home.css';
import '../styles/site/footer.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('promocoes');



  return (
    <div className="vini-site-wrapper site-container">
      <Navbar />
      <Hero />
      <PublicNotice />
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
