'use client';
import { useEffect, useState } from 'react';

export default function AdminCases() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ title:'', slug:'', bodyPart:'臉頰', skinCondition:'毛孔', store:'高雄', summary:'', treatmentFocus:'', aftercare:'', treatmentDate:'2025-01-01' });
  const load = async () => setItems(await (await fetch('/api/cases')).json());
  useEffect(()=>{load();},[]);
  const create = async () => { await fetch('/api/cases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); load(); };
  return <main className='container section'><h1>案例管理</h1><div className='card grid' style={{gap:8,marginBottom:16}}>{Object.keys(form).map(k=> <input key={k} placeholder={k} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />)}<button className='btn btn-primary' onClick={create}>新增案例</button></div><table><thead><tr><th>標題</th><th>部位</th><th>膚況</th><th>門市</th><th>狀態</th></tr></thead><tbody>{items.map(c => <tr key={c.id}><td>{c.title}</td><td>{c.bodyPart}</td><td>{c.skinCondition}</td><td>{c.store}</td><td>{c.status}</td></tr>)}</tbody></table></main>;
}
