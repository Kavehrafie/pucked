"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileText, Code, Users } from 'lucide-react';

interface DocsNavProps {
  currentCategory?: 'dev' | 'user' | 'all';
}

/**
 * Navigation for documentation sections
 */
export function DocsNav({ currentCategory }: DocsNavProps) {
  const pathname = usePathname();
  const navItems = [
    {
      href: '/admin/docs',
      label: 'All Docs',
      icon: FileText,
      category: 'all' as const,
    },
    {
      href: '/admin/docs/dev',
      label: 'Developer Docs',
      icon: Code,
      category: 'dev' as const,
    },
    {
      href: '/admin/docs/user',
      label: 'User Docs',
      icon: Users,
      category: 'user' as const,
    },
  ];

  // Try to infer current category from pathname if not provided
  let activeCategory = currentCategory;
  if (!activeCategory) {
    if (pathname.startsWith('/admin/docs/dev')) activeCategory = 'dev';
    else if (pathname.startsWith('/admin/docs/user')) activeCategory = 'user';
    else activeCategory = 'all';
  }

  return (
    <nav className="flex gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeCategory === item.category;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground border border-primary'
                : 'hover:bg-muted border border-transparent'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
