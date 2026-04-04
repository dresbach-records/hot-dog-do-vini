import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const Navbar = () => (
  <nav>
    <div className="ni">
      <a href="#" className="nl">
        <img src="/Logo-VINI.png" alt="Hot Dog do Vini" className="nav-logo-img" />
      </a>
      <div className="nlinks">
        <a href="#cardapio">Cardápio</a>
        <a href="#como-pedir">Como Pedir</a>
      </div>
      <div className="nbtns">
        <Link to="/login.vinis" className="nb nb-g" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
           <User size={14} /> CLIENTE
        </Link>
        <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" className="nb nb-r">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg> iFood
        </a>
        <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" className="nb nb-g">
          Anota Aí
        </a>
      </div>
    </div>
  </nav>
);

export default Navbar;
