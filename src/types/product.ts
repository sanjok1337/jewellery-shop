export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  stock?: number;
  stockStatus?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
