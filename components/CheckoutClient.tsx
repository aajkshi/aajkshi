'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutClient() {
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', note: '', couponCode: '' });

  useEffect(() => setItems(JSON.parse(localStorage.getItem('cart') || '[]')), []);

  const subtotal = useMemo(() => items.reduce((acc, it) => acc + it.price * it.qty, 0), [items]);
  const shippingFee = subtotal >= 3000 || subtotal === 0 ? 0 : 100;
  const total = subtotal + shippingFee;

  const submit = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form, items, paymentMethod: 'bank_transfer', shippingFee })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.removeItem('cart');
      router.push(`/order-success?orderNo=${data.orderNo}`);
    } else {
      alert(data.error || '結帳失敗');
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card grid" style={{ gap: 8 }}>
        <h3>收件資料</h3>
        {['name', 'phone', 'email', 'address', 'note', 'couponCode'].map((key) => (
          <input key={key} placeholder={key} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        ))}
      </div>
      <div className="card">
        <h3>付款方式：匯款/轉帳（MVP）</h3>
        <p>商品小計：NT$ {subtotal}</p>
        <p>運費（滿3000免運）：NT$ {shippingFee}</p>
        <p><b>應付總額：NT$ {total}</b></p>
        <button className="btn btn-primary" onClick={submit}>送出訂單</button>
      </div>
    </div>
  );
}
