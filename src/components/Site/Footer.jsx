const Footer = () => (
  <footer id="contato" className="footer-dark">
    <div className="fti">
      <div className="footer-col-brand">
        <div className="fbrand">
          <img src="/Logo-VINI.png" alt="Hot Dog do Vini" className="fbrand-logo" />
        </div>
        <div className="fdesc">O melhor hot dog artesanal de Taquara/RS. Feito na hora e entregue quentinho na sua casa.</div>
        <div className="flinks">
          <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" rel="noreferrer" className="flink flink-ifood">🔥 Pedir no iFood</a>
          <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" rel="noreferrer" className="flink flink-anota">💬 Pedir pelo Anota Aí</a>
        </div>
      </div>
      <div className="footer-col-nav">
        <div className="fct">Navegação</div>
        <ul className="flist">
          <li><a href="#cardapio">Cardápio</a></li>
          <li><a href="#como-pedir">Como Pedir</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
      </div>
      <div className="footer-col-info">
        <div className="fct">Informações</div>
        <ul className="flist">
          <li>📍 Taquara / RS</li>
          <li>📅 Seg a Qui → 18h30 às 23h</li>
          <li>📅 Sexta → 14h às 23h</li>
          <li>📅 Sáb e Dom → 08h às 23h</li>
          <li>🛵 Entrega ~ 35 min</li>
        </ul>
      </div>
    </div>
    
    <div className="fbot">
      <div className="fbot-links">
        <a href="mailto:contato@hotdogdovini.com.br">Contato</a>
        <a href="mailto:comercial@hotdogdovini.com.br">Comercial</a>
        <a href="mailto:sac@hotdogdovini.com.br">SAC</a>
        <a href="mailto:juridico@hotdogdovini.com.br">Jurídico</a>
      </div>
      <div className="fbot-cnpj">HOT DOG DO VINI LTDA CNPJ 61.073.344/0001-97</div>
      <div className="fbot-dev">Desenvolvido por Dresbach Media Ltda</div>
    </div>
  </footer>
);

export default Footer;
