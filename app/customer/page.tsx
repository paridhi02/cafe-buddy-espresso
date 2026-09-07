import { Suspense } from 'react';
import CustomerClient from './CustomerClient';
export default function CustomerPage(){return <Suspense fallback={<main><div className="container"><div className="card">Loading menu…</div></div></main>}><CustomerClient/></Suspense>}