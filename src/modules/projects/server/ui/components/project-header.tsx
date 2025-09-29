'use client'

import Link from "next/link";
import Image from "next/image";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronDown, SunMoon, Monitor, Sun, Moon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "@radix-ui/react-dropdown-menu";
import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

interface Props {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  const { theme, setTheme } = useTheme();

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="size-3.5" />;
      case 'dark':
        return <Moon className="size-3.5" />;
      default:
        return <Monitor className="size-3.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Image 
                  src="/logo.svg" 
                  alt="Vibe" 
                  width={18} 
                  height={18}
                  className="shrink-0 sm:w-5 sm:h-5"
                />
                <span className="truncate max-w-[120px] sm:max-w-[200px]">{project.name}</span>
              </div>
              <ChevronDown className="size-3 sm:size-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="start"
            className="min-w-[200px] sm:min-w-[220px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            sideOffset={8}
          >
            <DropdownMenuItem asChild>
              <Link 
                href="/" 
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
              >
                <ChevronLeft className="size-4 opacity-70" />
                <span>Back to Dashboard</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 h-px bg-border" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                <SunMoon className="size-4 opacity-70" />
                <span>Theme</span>
                <div className="ml-auto flex items-center">
                  {getThemeIcon(theme || 'system')}
                </div>
              </DropdownMenuSubTrigger>
              
              <DropdownMenuSubContent 
                className="min-w-[140px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
                sideOffset={8}
              >
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem 
                    value="light"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
                  >
                    <Sun className="size-4 opacity-70" />
                    Light
                  </DropdownMenuRadioItem>
                  
                  <DropdownMenuRadioItem 
                    value="dark"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
                  >
                    <Moon className="size-4 opacity-70" />
                    Dark
                  </DropdownMenuRadioItem>
                  
                  <DropdownMenuRadioItem 
                    value="system"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
                  >
                    <Monitor className="size-4 opacity-70" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
