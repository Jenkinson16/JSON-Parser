
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Settings,
  History,
  Code2,
  Star,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { SettingsDialog } from '@/components/settings-dialog';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/history', label: 'History', icon: History },
    { href: '/favorites', label: 'Favorites', icon: Star },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Code2 className="h-6 w-6" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
                <h1 className="text-xl font-bold">PromptParser</h1>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={pathname === item.href}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
           <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" onClick={() => setIsSettingsOpen(true)}>
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger />
           <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-semibold text-muted-foreground hidden md:block">
              PromptParser - Natural Language to Structured JSON Converter for LLMs
            </h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1">
            {children}
        </main>
      </SidebarInset>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </SidebarProvider>
  );
}
