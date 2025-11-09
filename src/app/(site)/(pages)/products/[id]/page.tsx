import ProductDetail from "@/components/ProductDetail";
import { Metadata } from "next";

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  
  try {
    const response = await fetch(`http://localhost:5000/api/products/${id}`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const product = await response.json();
      return {
        title: `${product.name} | Jewellery Shop`,
        description: product.description || `Купити ${product.name} в нашому ювелірному магазині`,
      };
    }
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
  }
  
  return {
    title: "Товар | Jewellery Shop",
    description: "Сторінка товару",
  };
}

const ProductPage = ({ params }: Props) => {
  return (
    <main>
      <ProductDetail productId={params.id} />
    </main>
  );
};

export default ProductPage;