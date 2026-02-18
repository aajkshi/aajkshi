'use client';
import { useEffect, useState } from 'react';

export default function AdminServices() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name:'', slug:'', category:'', targetAudience:'', process:'', durationMinutes:60, price:1000, precautions:'', faq:'', content:'' });
  const load = async () => setItems(await (await fetch('/api/services')).json());
  useEffect(()=>{load();},[]);
  const create = async () => { await fetch('/api/services',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); load(); };
  return <main className='container section'><h1>服務頁管理（簡易 Markdown 欄位）</h1><div className='card grid' style={{gap:8,marginBottom:16}}>{Object.keys(form).map(k=> <textarea key={k} placeholder={k} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:k==='durationMinutes'||k==='price'?Number(e.target.value):e.target.value})} />)}<button className='btn btn-primary' onClick={create}>新增服務</button></div><table><thead><tr><th>名稱</th><th>分類</th><th>價格</th><th>狀態</th></tr></thead><tbody>{items.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.category}</td><td>{c.price}</td><td>{c.status}</td></tr>)}</tbody></table></main>;
}
