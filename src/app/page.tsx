import { redirect } from 'next/navigation';

export default function Home() {
  // redirect to admin login if they visit root
  redirect('/admin');
}