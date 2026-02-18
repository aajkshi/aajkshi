'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@je-beauty.local');
  const [password, setPassword] = useState('Admin@1234');
  const router = useRouter();

  const submit = async () => {
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (res.ok) router.push('/admin');
    else alert('登入失敗');
  };

  return <main className="container section"><div className="card" style={{maxWidth:420,margin:'0 auto'}}><h1>後台登入</h1><input value={email} onChange={e=>setEmail(e.target.value)} /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /><button className="btn btn-primary" onClick={submit}>登入</button></div></main>;
}
