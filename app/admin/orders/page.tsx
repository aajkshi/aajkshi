'use client';
import { useEffect, useMemo, useState } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  const load = async () => setOrders(await (await fetch('/api/orders')).json());
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => orders.filter((o) => (status === 'all' || o.status === status) && (`${o.orderNo}${o.customer.name}${o.customer.phone}`).includes(q)),
    [orders, q, status]
  );

  const updateStatus = async (id:number, nextStatus:string) => {
    await fetch(`/api/orders/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: nextStatus }) });
    load();
  };

  return (
    <main className="container section">
      <h1>訂單管理</h1>
      <div className="card" style={{ marginBottom: 12, display: 'grid', gap: 8, gridTemplateColumns: '2fr 1fr auto' }}>
        <input placeholder="搜尋訂單編號/姓名/電話" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">全部狀態</option>
          <option value="pending_payment">待付款</option>
          <option value="paid">已付款</option>
          <option value="shipped">出貨</option>
          <option value="completed">完成</option>
          <option value="cancelled">取消</option>
        </select>
        <a className="btn" href="/api/orders/export">匯出 CSV</a>
      </div>
      <table>
        <thead><tr><th>訂單編號</th><th>客戶</th><th>總額</th><th>狀態</th><th>更新</th></tr></thead>
        <tbody>
          {filtered.map((o) => (
            <tr key={o.id}>
              <td>{o.orderNo}</td><td>{o.customer.name}</td><td>{o.total}</td><td>{o.status}</td>
              <td>
                <select onChange={(e) => updateStatus(o.id, e.target.value)} defaultValue={o.status}>
                  <option value='pending_payment'>待付款</option><option value='paid'>已付款</option><option value='shipped'>出貨</option><option value='completed'>完成</option><option value='cancelled'>取消</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
