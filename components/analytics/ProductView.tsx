"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

interface ProductViewProps {
  productId: string;
  productName: string;
  price: number;
}

export default function ProductView({
  productId,
  productName,
  price,
}: ProductViewProps) {
  useEffect(() => {
    if (!window.fbq) return;

    window.fbq("track", "ViewContent", {
      content_ids: [productId],
      content_name: productName,
      content_type: "product",
      value: price,
      currency: "INR",
    });
  }, [productId, productName, price]);

  return null;
}