import axios from 'axios';
import { supabase } from '../../config/supabase.js';

export const aiService = {
  
  async handle(message, contact, conversation) {
     console.log(`🧠 [AI Engine] Processando: ${message.body} (Segmento: ${contact.segmento})`);
     
     const context = {
        user_id: contact.id,
        conversation_id: conversation.id,
        segment: contact.segmento || 'alimenticio',
        phone: contact.phone,
        history: [] // TODO: Buscar do banco se necessário
     };

     try {
        // Mock prompt engineering based on image design
        let prompt = `Você é o ViniBot PRO. Segmento: ${context.segment.toUpperCase()}. `;
        if (context.segment === 'alimenticio') {
           prompt += "Ajude o cliente com o cardápio de Hot Dogs. Se ele quiser pedir, sugira o Hot Dog Especial (R$ 15,00).";
        } else {
           prompt += "Ajude o cliente com questões jurídicas. Se ele precisar de um documento, sugira gerar um contrato.";
        }

        // Simulação de resposta (Enquanto API Key não é configurada)
        let responseText = "Olá! Como posso ajudar você hoje?";
        if (message.body.toLowerCase().includes('hot dog')) {
           responseText = "Excelente escolha! Nosso Hot Dog Especial está saindo muito hoje por apenas R$ 15,00. Deseja que eu gere o pedido para você?";
        }

        // Log de interação no banco
        await supabase.from('ai_logs').insert({
           conversation_id: conversation.id,
           input: message.body,
           output: responseText,
           model: 'gpt-4o',
           tokens: 150,
           context
        });

        return responseText;
     } catch (err) {
        console.error('[AI Error]', err.message);
        return "Desculpe, tive um problema técnico. Um atendente humano já vai te ajudar.";
     }
  },

  async calculateCost(tokens, model) {
     const rates = { 'gpt-4o': 0.000005, 'gpt-3.5-turbo': 0.0000015 };
     return tokens * (rates[model] || 0);
  }
};
