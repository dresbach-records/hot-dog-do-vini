const Footer = () => (
  <footer id="contato">
    <div className="fti">
      <div>
        <div className="fbrand">
          <img src="/Logo-VINI.png" alt="Hot Dog do Vini" className="fbrand-logo" />
        </div>
        <div className="fdesc">O melhor hot dog artesanal de Taquara/RS. Feito na hora e entregue quentinho na sua casa.</div>
        <div className="flinks">
          <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" className="flink flink-r">🍽️ Pedir no iFood</a>
          <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" className="flink flink-g">💬 Pedir pelo Anota Aí</a>
        </div>
      </div>
      <div>
        <div className="fct">Navegação</div>
        <ul className="flist">
          <li><a href="#cardapio">Cardápio</a></li>
          <li><a href="#como-pedir">Como Pedir</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
      </div>
      <div>
        <div className="fct">Informações</div>
        <ul className="flist">
          <li>📍 Taquara / RS</li>
          <li>📅 Seg a Qui → 18h30 às 23h</li>
          <li>📅 Sexta → 14h às 23h</li>
          <li>📅 Sáb e Dom → 08h às 23h</li>
          <li>🛵 Entrega ~35 min</li>
        </ul>
      </div>
       <div>
        <div className="fct">Contato</div>
        <ul className="flist">
          <li><a href="mailto:comercial@hotdogdovini.com.br">Comercial</a></li>
          <li><a href="mailto:sac@hotdogdovini.com.br">SAC</a></li>
          <li><a href="mailto:juridico@hotdogdovini.com.br">Jurídico</a></li>
        </ul>
      </div>
    </div>
    <div className="fbot">
      <span>© 2026 Hot Dog do Vini — Taquara/RS</span>
      <span>HOT DOG DO VINI.LTDA CNPJ 63.073.948/0001-97</span>
      <span>Desenvolvido por Dresbach Media Ltda</span>
    </div>
  </footer>
);

export default Footer;
