import { Link } from 'react-router-dom';
import { User, MenuSquare, Utensils } from 'lucide-react';

const Navbar = () => (
  <nav className="nav-clean">
    <div className="ni">
      <a href="#" className="nl">
        <img src="/Logo-VINI.png" alt="Hot Dog do Vini" className="nav-logo-img" />
      </a>
      
      <div className="nav-right-links">
        <Link to="/login.vinis" className="nav-item-clean">
           <User size={18} /> CLIENTE
        </Link>
        <a href="#cardapio" className="nav-item-clean">
           <MenuSquare size={18} /> Cardápio
        </a>
        <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" className="nav-item-clean">
           <Utensils size={18} /> iFood
        </a>
        <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" className="nav-item-clean font-semibold">
           Anota Aí
        </a>
      </div>
    </div>
  </nav>
);

export default Navbar;
