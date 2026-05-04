import Link from "next/link";

type CategoryStripProps = {
  categories: Array<{
    name: string;
    imagePath: string;
  }>;
};

export function CategoryStrip({ categories }: CategoryStripProps) {
  return (
    <section className="container -mt-14 relative z-10 mb-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <div key={category.name} className="rounded-md bg-white p-4 shadow-[0_1px_3px_rgba(15,17,17,0.14)]">
            <h3 className="mb-3 font-display text-lg font-bold">{category.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-md bg-[#f7fafa]">
                  <img src={category.imagePath} alt={category.name} className="aspect-square h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <Link href="/listings" className="mt-3 inline-block text-sm text-[#007185] hover:text-[#c7511f] hover:underline">
              Browse {category.name.toLowerCase()} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
