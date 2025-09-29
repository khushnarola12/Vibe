"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useQuery } from "@tanstack/react-query"

import {useTRPC} from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"

export const ProjectsList = () =>{
    const trpc = useTRPC()
    const {user} = useUser()
    const {data : projects} = useQuery(trpc.projects.getMany.queryOptions())

    if(!user) return null;

    return(
        <div className="w-full bg-white dark:bg-sidebar rounded-xl p-4 sm:p-6 lg:p-8 border flex flex-col gap-y-4 sm:gap-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold">
               {user?.firstName}&apos;s Vibes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {
                    projects?.length===0 && (
                        <div className="col-span-full text-center">
                            <p className="text-sm text-muted-foreground">
                                No Project Found
                            </p>
                        </div>
                    )
                }
                {
                    projects?.map((project)=>(
                        <Button key={project.id} variant="outline" className="font-normal h-auto justify-start w-full text-start p-3 sm:p-4" asChild>
                            <Link href={`/projects/${project.id}`}>
                                <div className="flex items-center gap-x-3 sm:gap-x-4 w-full">
                                    <Image src="/logo.svg" alt="Vibe" width={28} height={28} className="object-contain flex-shrink-0 sm:w-8 sm:h-8"/>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <h3 className="truncate font-medium text-sm sm:text-base">
                                            {project.name}
                                        </h3>
                                        <p className="text-muted-foreground text-xs sm:text-sm">
                                            {formatDistanceToNow(project.updateAt,{
                                                addSuffix:true
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </Button>
                    ))
                }
            </div>
        </div>
    )
}