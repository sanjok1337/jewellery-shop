import Link from 'next/link';

export default function TestProductsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Тестування товарів</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Товар з стоком</h2>
          <Link 
            href="/products/2" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
          >
            Переглянути товар #2
          </Link>
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Product Without Stock</h2>
          <Link 
            href="/products/1" 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 inline-block"
          >
            View Product #1 (Out of Stock)
          </Link>
        </div>
      </div>
      
      <div className="mt-8">
        <Link 
          href="/" 
          className="text-blue-500 hover:underline"
        >
          ← Назад на головну
        </Link>
      </div>
    </div>
  );
}