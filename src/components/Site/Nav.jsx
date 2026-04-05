import Image from 'next/image';

export default function Nav() {
  return (
    <nav>
      <div className="ni">
        <a href="#" className="nl">
          <Image className="nav-logo-img" src="/Logo.png" alt="Hot Dog do Vini" width={42} height={42} />
          <span className="lt">Hot Dog <span>do Vini</span></span>
        </a>
        <div className="nlinks">
          <a href="#cardapio">Cardápio</a>
          <a href="#como-pedir">Como Pedir</a>
        </div>
        <div className="nbtns">
          <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" className="nb nb-r"> Pelo iFood</a>
          <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" className="nb nb-g"> Pelo Anota Aí</a>
        </div>
      </div>
    </nav>
  );
}
