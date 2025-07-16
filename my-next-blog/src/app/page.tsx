// src/app/page.tsx


import { BlocksRenderer } from '@strapi/blocks-react-renderer';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

import Image from 'next/image';
import Link from 'next/link';


type CTA = {
  label: string;
  url: string;
};

type Member = {
  id: number;
  name: string;
  role: string;
  photo?: {
    url: string;
    caption?: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
  social: CTA[];
};

export default async function HomePage() {

  const populateLevelOne = '/api/homepages?populate=*';
  const populateTeam = '/api/homepages?populate[team][populate]=*';
  //The proper syntax for deep population of multiple nested fields in Strapi (v4) is indeed:
  const populateAll = '/api/homepages?populate[backgroundVideo][populate]=*&populate[ctas][populate]=*&populate[team][populate]=*';


  //populate=deep fetches all media and nested components.
  const res = await fetch(`${API_URL}${populateAll}`, {
    cache: 'no-store',
  });
  
  const json = await res.json();

  const homepage = json?.data?.[0];
  if (!homepage) {
    return <div>No homepage content found. Please check Strapi.</div>;
  }

  const {
    title,
    subtitle,
    backgroundVideo,
    ctas = [],
    team = [],
  } = homepage; 

  const videoUrl = `${API_URL}${backgroundVideo?.url}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 shadow-md bg-white fixed top-0 left-0 right-0 z-50">
        <Link href="/">
          <img src="/images/logotipo-codigo.png" alt="Codigo Logo" width={150} />
        </Link>
        <nav>
          <ul className="flex gap-6 text-sm uppercase">
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/portfolio">Portfolio</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center text-white text-center" 
        style={{ backgroundImage: "url('/images/bg-Typing_On_Keyboard.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <video 
            autoPlay
            muted
            loop
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            preload="none"
           >
            <source 
              src={videoUrl} 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
        <div className="z-10 px-4">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="mt-4">{subtitle}</p>
          <Link href="/portfolio" 
            className="inline-block mt-6 px-6 py-3 bg-white text-black font-semibold uppercase rounded"
          >Portfolio</Link>
        </div>
      </section>

      {/* About / CTA Section */}
      <section id="about" className="bg-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">A Little Bit About Codigo</h2>
        <p className="max-w-xl mx-auto mb-6">We are a group of freelance developers coming together to do amazing things.</p>
        <div className="flex justify-center gap-4">
        {(ctas as CTA[]).map((cta) => (
          <Link 
            key={cta.label}
            href={cta.url}
            className="btn btn-outline"
          >{cta.label}</Link>
        ))}
        </div>
      </section>

      {/* Meet the Team */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Meet the Team</h2>
          <p className="italic">We are excited to let you know us</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {(team as Member[]).map((member) => (
          !member.name ? null :
            <div key={member.id} 
              className="relative group overflow-hidden"
            >
              {member.photo && (
                <Image
                  src={`${API_URL}${member.photo.url}`}
                  alt={member.name}
                  width={member.photo.width}
                  height={member.photo.height}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}

              <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition p-4 text-white flex flex-col justify-end">
                <h3 className="text-lg font-semibold">{member.name} <small className="block text-sm font-light">{member.role}</small></h3>
                {member.social && (
                  <ul className="flex gap-3 mt-2 text-sm">
                  {(member.social as CTA[]).map((cta) => (
                    <Link 
                      key={cta.label}
                      href={cta.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >{cta.label}</Link>
                  ))}
                  </ul>
                )}
              </div>
            </div>
        ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white text-sm py-6 px-6 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>© 2025 Codigo. Based on a design by <a href="http://themeforest.net/user/wphunters" target="_blank" rel="noopener noreferrer">WPHunters</a>. Powered by <a href="https://keystonejs.com">KeystoneJS</a>.</div>
          <ul className="flex gap-4 mt-4 md:mt-0">
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/portfolio">Portfolio</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

const team2 = [
  {
    name: 'Moncho Pena',
    role: 'CTO',
    image: 'https://res.cloudinary.com/keystone-demo/image/upload/v1415912591/khwniksmfys6r4esscla.jpg',
    links: [
      { href: 'https://www.facebook.com/monchopena', label: 'Facebook' },
      { href: 'https://twitter.com/monchopena', label: 'Twitter' },
      { href: 'https://es.linkedin.com/in/ramonpena', label: 'LinkedIn' },
      { href: 'https://plus.google.com/+MonchoPena', label: 'Google' },
      { href: 'https://github.com/monchopena', label: 'GitHub' }
    ]
  },
  {
    name: 'Pablo Rica',
    role: 'Senior Full Stack Web Developer',
    image: 'https://res.cloudinary.com/codigox/image/upload/v1510907108/jbkm6wcklcdxfv6myrfe.jpg',
    links: [
      { href: 'https://www.facebook.com/pablo.rica.5', label: 'Facebook' },
      { href: 'https://twitter.com/Pablo_Rica', label: 'Twitter' },
      { href: 'http://uk.linkedin.com/pub/pablo-rica/38/2b5/605/en', label: 'LinkedIn' },
      { href: 'https://github.com/pablorica/', label: 'GitHub' }
    ]
  },
  {
    name: 'Roi Facal',
    role: 'PHP Senior Developer',
    image: 'https://res.cloudinary.com/codigox/image/upload/v1454518518/p8n7h3fvmenbxxyekavg.jpg',
    links: [
      { href: 'https://www.linkedin.com/in/roi-facal-9a37022b', label: 'LinkedIn' }
    ]
  },
  {
    name: 'Javier Pardal',
    role: 'PHP Senior Developer',
    image: 'https://res.cloudinary.com/codigox/image/upload/v1588924586/qlujg4mxrbpcdq4b15fr.jpg',
    links: [
      { href: 'https://www.linkedin.com/in/javier-pardal-05503a28/', label: 'LinkedIn' }
    ]
  }
];
