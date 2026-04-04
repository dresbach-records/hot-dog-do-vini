import React, { useState } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  Search,
  ExternalLink
} from 'lucide-react';

const Ajuda = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { 
      q: 'Como funciona o Convênio Corporativo?', 
      a: 'O convênio corporativo permite que funcionários de empresas parceiras comprem no Vini\'s utilizando um limite de crédito mensal. O desconto pode ser feito em folha ou via faturamento direto com a empresa.' 
    },
    { 
      q: 'Quais as formas de pagamento aceitas?', 
      a: 'Aceitamos Pix, Cartões de Crédito e Débito, Vale Alimentação (VR, Ticket, Sodexo) e Convênio Corporativo.' 
    },
    { 
      q: 'Qual o prazo de entrega?', 
      a: 'Nosso prazo médio de entrega é de 30 a 60 minutos, dependendo da sua localização e do volume de pedidos no momento.' 
    },
    { 
      q: 'Como resgato meus pontos de fidelidade?', 
      a: 'Acesse a página "Fidelidade" no seu menu. Quando atingir a pontuação necessária, o botão de resgate ficará disponível para gerar um cupom ou item grátis.' 
    },
    { 
      q: 'Esqueci minha senha, o que fazer?', 
      a: 'Na tela de login, clique em "Esqueci minha senha" para receber um link de redefinição no seu e-mail cadastrado.' 
    }
  ];

  const handleWhatsApp = () => {
    window.open('https://wa.me/55519********', '_blank'); // Substituir pelo número real
  };

  return (
    <div className="vini-ajuda-container">
      <header className="vini-ajuda-header">
        <button onClick={() => window.history.back()} className="vini-back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="vini-ajuda-title">Central de Ajuda</h1>
      </header>

      <main className="vini-ajuda-content">
        <div className="vini-ajuda-hero">
           <h2>Como podemos ajudar?</h2>
           <div className="vini-search-help">
              <Search size={20} color="#999" />
              <input type="text" placeholder="Busque por um assunto..." />
           </div>
        </div>

        <section className="vini-ajuda-section">
           <h3 className="vini-section-title">Dúvidas Frequentes (FAQ)</h3>
           <div className="vini-faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className="vini-faq-item">
                   <button 
                     className="vini-faq-question" 
                     onClick={() => setOpenFaq(openFaq === i ? null : i)}
                   >
                      <span>{faq.q}</span>
                      {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </button>
                   {openFaq === i && (
                     <div className="vini-faq-answer">
                        {faq.a}
                     </div>
                   )}
                </div>
              ))}
           </div>
        </section>

        <section className="vini-ajuda-section">
           <h3 className="vini-section-title">Canais de Atendimento</h3>
           <div className="vini-channels-grid">
              <div className="vini-channel-card" onClick={handleWhatsApp}>
                 <MessageCircle size={32} color="#22C55E" />
                 <div className="vini-channel-info">
                    <h4>WhatsApp</h4>
                    <span>Falar com atendente</span>
                 </div>
                 <ExternalLink size={16} color="#ccc" />
              </div>
              <div className="vini-channel-card">
                 <Mail size={32} color="#3B82F6" />
                 <div className="vini-channel-info">
                    <h4>E-mail</h4>
                    <span>suporte@vinis.com.br</span>
                 </div>
              </div>
              <div className="vini-channel-card">
                 <Phone size={32} color="#EA1D2C" />
                 <div className="vini-channel-info">
                    <h4>Telefone</h4>
                    <span>(51) 9********</span>
                 </div>
              </div>
           </div>
        </section>

        <div className="vini-footer-links">
           <a href="/termos">Termos de Uso</a>
           <a href="/privacidade">Política de Privacidade</a>
        </div>
      </main>

      <style jsx>{`
        .vini-ajuda-container { min-height: 100vh; background: #f8f8fb; }
        .vini-ajuda-header { background: #fff; padding: 20px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #f0f0f0; }
        .vini-ajuda-title { margin: 0; font-size: 20px; font-weight: 800; }
        
        .vini-ajuda-hero { background: var(--p-red, #EA1D2C); color: #fff; padding: 40px 25px; border-radius: 0 0 32px 32px; text-align: center; }
        .vini-ajuda-hero h2 { margin-bottom: 25px; font-size: 24px; font-weight: 900; }
        .vini-search-help { background: #fff; max-width: 500px; margin: 0 auto; display: flex; align-items: center; padding: 12px 20px; border-radius: 16px; gap: 15px; }
        .vini-search-help input { border: none; width: 100%; font-size: 15px; font-weight: 600; color: #333; }
        .vini-search-help input:focus { outline: none; }
        
        .vini-ajuda-content { max-width: 600px; margin: 0 auto; padding: 30px 20px; }
        .vini-ajuda-section { margin-bottom: 40px; }
        .vini-section-title { font-size: 16px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        
        .vini-faq-list { display: flex; flex-direction: column; gap: 10px; }
        .vini-faq-item { background: #fff; border-radius: 16px; border: 1px solid #f0f0f0; overflow: hidden; }
        .vini-faq-question { width: 100%; text-align: left; background: none; border: none; padding: 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; color: #333; font-size: 15px; }
        .vini-faq-answer { padding: 0 20px 20px; color: #666; font-size: 14px; line-height: 1.6; border-top: 1px solid #f9f9f9; padding-top: 15px; }
        
        .vini-channels-grid { display: flex; flex-direction: column; gap: 15px; }
        .vini-channel-card { background: #fff; padding: 20px; border-radius: 20px; border: 1px solid #f0f0f0; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.2s; }
        .vini-channel-card:hover { transform: translateY(-3px); border-color: #ddd; }
        .vini-channel-info { flex: 1; }
        .vini-channel-info h4 { margin: 0; font-size: 16px; font-weight: 800; }
        .vini-channel-info span { font-size: 13px; color: #999; }
        
        .vini-footer-links { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 50px; }
        .vini-footer-links a { font-size: 13px; color: #999; font-weight: 600; text-decoration: none; }
        .vini-footer-links a:hover { color: var(--p-red, #EA1D2C); }
      `}</style>
    </div>
  );
};

export default Ajuda;
