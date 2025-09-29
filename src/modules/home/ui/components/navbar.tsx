"use client"

import Link from "next/link"
import Image from "next/image"
import { SignedIn,SignedOut,SignInButton,SignUpButton} from "@clerk/nextjs"

import {Button} from "@/components/ui/button"
import { UserControl } from "@/components/user-control"
import { useScroll } from "@/hooks/use-scroll"
import { cn } from "@/lib/utils"
import {Moon,Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Navbar = () =>{
    const isScrolled = useScroll()
    const {setTheme} = useTheme()
    return (
        <nav className={cn("px-4 py-3 sm:px-6 lg:px-8 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",isScrolled && "bg-background border-border")
        }>
            <div className="max-w-7xl justify-between mx-auto items-center w-full flex">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="vibe" width={24} height={24}/>
                    <span className="font-semibold text-lg">Vibe</span>
                </Link>
                <div className="flex gap-1 sm:gap-2 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <SignedOut>
                        <div className="flex gap-1 sm:gap-2">
                            <SignUpButton>
                                <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                                    <span className="hidden sm:inline">Sign up</span>
                                    <span className="sm:hidden">Sign up</span>
                                </Button>
                            </SignUpButton>
                            <SignInButton>
                                <Button size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                                    <span className="hidden sm:inline">Sign in</span>
                                    <span className="sm:hidden">Sign in</span>
                                </Button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                    <SignedIn>
                        <UserControl showName/>
                    </SignedIn>
                </div>
            </div>

        </nav>
    )
}