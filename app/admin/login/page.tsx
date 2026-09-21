// 'use client';
// import {FormEvent,useEffect,useState} from 'react';
// import Link from 'next/link';
// import {useRouter,useSearchParams} from 'next/navigation';import {createClient} from '@/lib/supabase/client';

// export default function Login(){const router=useRouter();const searchParams=useSearchParams();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);useEffect(()=>{const check=async()=>{const supabase=createClient();const {data}=await supabase.auth.getUser();if(data.user)router.replace('/admin')};check()},[router]);async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');setLoading(true);const supabase=createClient();const {error:signInError}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(signInError){setLoading(false);setError(signInError.message);return}const {data,error:userError}=await supabase.auth.getUser();if(userError||!data.user){setLoading(false);setError(userError?.message||'Login succeeded, but the session could not be established.');return}const redirect=searchParams.get('redirect');router.replace(redirect?.startsWith('/admin')&&!redirect.startsWith('/admin/login')?redirect:'/admin');router.refresh()}return <main className="center"><form className="login-card admin-form" onSubmit={submit}><Link href="/" className="brand brand-mark"><span className="brand-dot"/> DIGITAL STORE</Link><div><div className="eyebrow" style={{marginTop:28}}><span className="eyebrow-dot"/> Private workspace</div><h1 className="login-title">Welcome back.</h1><p className="login-copy">Sign in to manage products, orders and your digital downloads.</p></div><label className="label">Email<input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label><label className="label">Password<input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{error&&<div className="error">{error}</div>}<button className="btn warm" type="submit" disabled={loading}>{loading?'Signing in…':'Sign in →'}</button></form></main>}


'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setLoading(true);

    const supabase = createClient();

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const {
      data,
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !data.user) {
      setLoading(false);

      setError(
        userError?.message ||
          'Login succeeded, but the session could not be established.'
      );

      return;
    }

    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="center">
      <form
        className="login-card admin-form"
        onSubmit={submit}
      >
        <Link
          href="/"
          className="brand brand-mark"
        >
          <span className="brand-dot" />
          DIGITAL STORE
        </Link>

        <div>
          <div
            className="eyebrow"
            style={{ marginTop: 28 }}
          >
            <span className="eyebrow-dot" />
            Private workspace
          </div>

          <h1 className="login-title">
            Welcome back.
          </h1>

          <p className="login-copy">
            Sign in to manage products, orders and your
            digital downloads.
          </p>
        </div>

        <label className="label">
          Email

          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="label">
          Password

          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <button
          className="btn warm"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </main>
  );
}