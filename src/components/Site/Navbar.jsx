import { Link } from 'react-router-dom';
import { ShoppingCart, MessageSquare, Clock, User } from 'lucide-react';

const Navbar = () => (
  <header className="vini-site-wrapper">
    <div className="vini-top-ticker">
      🔥 Aberto agora! • Seg-Dom 18h-23h • Entrega ~35 min — Taquara/RS
    </div>
    <nav className="vini-nav">
      <div className="vini-nav-logo">
        <Link to="/">
          <img src="/Logo-VINI.png" alt="Vini's" />
        </Link>
      </div>
      
      <div className="vini-nav-links">
        <a href="#cardapio">Cardápio</a>
        <a href="#como-pedir">Como Pedir</a>
      </div>
      
      <div className="nbtns" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Link to="/login.vinis" className="btn-login">
           <User size={16} /> Entrar
        </Link>
        <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" className="btn-ifood">
           <ShoppingCart size={16} /> iFood
        </a>
        <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" className="btn-anota-ai">
           <MessageSquare size={16} /> Anota Aí
        </a>
      </div>
    </nav>
  </header>
);

export default Navbar;
