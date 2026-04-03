interface Category {
  id: string;
  name: string;
  description: string;
}

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-white mb-4">
        Categorias
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-zinc-800/50 p-4 rounded-lg text-center"
          >
            <h3 className="font-bold">{category.name}</h3>
            <p className="text-sm text-zinc-400">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
