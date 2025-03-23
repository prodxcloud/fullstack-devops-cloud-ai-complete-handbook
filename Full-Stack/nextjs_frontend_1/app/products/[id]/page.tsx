import ProductDetails from './ProductDetails';

export default function ProductPage() {
  return <ProductDetails />;
}

// This is needed for static site generation with dynamic routes
export async function generateStaticParams() {
  return [];
} 