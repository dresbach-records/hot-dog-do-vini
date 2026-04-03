import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-red-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Hot Dog do Vini"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold font-fredoka-one">
            Hot Dog do Vini
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#cardapio" className="hover:underline">
            Cardápio
          </Link>
          <Link href="#como-pedir" className="hover:underline">
            Como Pedir
          </Link>
          <Link href="#contato" className="hover:underline">
            Contato
          </Link>
        </nav>
      </div>
    </header>
  );
}