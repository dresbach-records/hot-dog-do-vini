import { Fredoka } from "next/font/google";

const fredoka = Fredoka({ subsets: ["latin"], weight: "400" });

export default function How() {
  return (
    <div id="como-pedir">
      <h2 className={`${fredoka.className} text-xl font-bold text-white mb-4`}>
        Como Pedir
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-red-500 mb-2">iFood</h3>
          <p className="text-zinc-400">
            Acesse nosso cardápio no iFood, escolha seus itens e receba em casa.
            É rápido, fácil e seguro!
          </p>
          <a
            href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio"
            target="_blank"
            className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Pedir no iFood
          </a>
        </div>
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-green-500 mb-2">Anota Aí</h3>
          <p className="text-zinc-400">
            Prefere fazer seu pedido online? Use o Anota Aí para um atendimento
            rápido e personalizado.
          </p>
          <a
            href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa"
            target="_blank"
            className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Pedir no Anota Aí
          </a>
        </div>
      </div>
    </div>
  );
}
