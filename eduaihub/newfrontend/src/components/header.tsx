'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, LogOut, Sparkles, UserCog } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppState } from '@/lib/app-state';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const LOGOUT_ENDPOINT = API_BASE_URL.endsWith('/api')
  ? `${API_BASE_URL}/auth/logout`
  : `${API_BASE_URL}/api/auth/logout`;

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
    <Compass className="h-7 w-7 text-accent" />
    <span className="font-headline text-2xl font-bold tracking-tight">
      Course Compass
    </span>
  </Link>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} className={cn("text-sm font-medium transition-colors hover:text-accent", isActive ? "text-accent" : "text-muted-foreground")}>
      {children}
    </Link>
  )
}

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAppState();

  const handleLogout = async () => {
    try {
      await fetch(LOGOUT_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      logout();
      router.push('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        <div className="flex items-center gap-6 text-sm md:ml-6">
          <NavLink href="/">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span>Search Courses</span>
            </div>
          </NavLink>
          <NavLink href="/course-match">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Course Match</span>
            </div>
          </NavLink>
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/dashboard">
                  <UserCog className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/login">
                <UserCog className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
