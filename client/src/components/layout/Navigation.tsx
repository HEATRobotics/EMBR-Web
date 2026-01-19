'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import white_logo from '@/assets/white_logo.svg';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Missions', path: '/missions' },
    { name: 'Bots', path: '/bots' },
    { name: 'Hotspots', path: '/hotspots' },
    { name: 'Reports', path: '/reports' },
    { name: 'Team', path: '/team' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="bg-brand-black text-brand-white shadow-lg fixed top-0 left-0 w-full z-50 border-b border-gray-800">
      <div className="max-w-full px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            <span className="text-xl font-bold">EMBR</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  pathname === item.path
                    ? 'bg-brand-orange text-brand-white shadow'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-brand-orange'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <Link href="https://heatrobotics.github.io/" className="flex items-center gap-2" target="_blank" rel="noopener noreferrer">
            <Image src={white_logo} alt="EMBR Logo" width={100} height={100} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
