import { Phone, MapPin, Clock } from "lucide-react";

export default function Info() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4">
        <Phone className="text-orange-500" />
        <div>
          <p className="font-bold">Telefone e WhatsApp</p>
          <p className="text-sm">+55 51 99999-9999</p>
        </div>
      </div>
      <div className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4">
        <MapPin className="text-orange-500" />
        <div>
          <p className="font-bold">Endereço</p>
          <p className="text-sm">Rua das Flores, 123 - Taquara/RS</p>
        </div>
      </div>
      <div className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4">
        <Clock className="text-orange-500" />
        <div>
          <p className="font-bold">Horário de Funcionamento</p>
          <p className="text-sm">Seg a Sex, das 18h às 23h</p>
        </div>
      </div>
    </div>
  );
}
