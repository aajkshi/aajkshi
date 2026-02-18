'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartClient() {
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => setItems(JSON.parse(localStorage.getItem('cart') || '[]')), []);
  const total = useMemo(() => items.reduce((acc, it) => acc + it.price * it.qty, 0), [items]);

  const updateQty = (id: number, qty: number) => {
    const next = items.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it));
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  return (
    <div className="card">
      {items.length === 0 ? <p>購物車目前為空。</p> : (
        <>
          {items.map((it) => (
            <div key={it.id} style={{display:'grid',gridTemplateColumns:'1fr 80px 80px',gap:12,alignItems:'center',marginBottom:12}}>
              <div>{it.name}</div>
              <input type="number" value={it.qty} onChange={(e)=>updateQty(it.id, Number(e.target.value))} />
              <div>NT$ {it.price*it.qty}</div>
            </div>
          ))}
          <h3>總計：NT$ {total}</h3>
          <button className="btn btn-secondary" onClick={() => router.push('/checkout')}>前往結帳</button>
        </>
      )}
    </div>
  );
}
