'use client';

export default function AddToCartButton({ product }: { product: { id: number; name: string; price: number } }) {
  const add = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i: any) => i.id === product.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('已加入購物車');
  };

  return <button className="btn btn-primary" onClick={add}>加入購物車</button>;
}
