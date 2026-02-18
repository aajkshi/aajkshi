'use client';
import { useEffect, useState } from 'react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ name:'', slug:'', description:'', price:0, stock:0, categoryId:1 });
  const load = async () => setProducts(await (await fetch('/api/products')).json());
  useEffect(() => { load(); }, []);
  const create = async () => { await fetch('/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); setForm({ name:'', slug:'', description:'', price:0, stock:0, categoryId:1 }); load(); };
  return <main className="container section"><h1>商品管理</h1><div className="card grid" style={{gap:8,marginBottom:16}}>{Object.keys(form).map(k => <input key={k} placeholder={k} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:k==='price'||k==='stock'||k==='categoryId'?Number(e.target.value):e.target.value})} />)}<button className='btn btn-primary' onClick={create}>新增商品</button></div><table><thead><tr><th>ID</th><th>名稱</th><th>價格</th><th>庫存</th><th>狀態</th></tr></thead><tbody>{products.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.name}</td><td>{p.price}</td><td>{p.stock}</td><td>{p.status}</td></tr>)}</tbody></table></main>;
}
