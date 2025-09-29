"use client"

import { ProjectForm } from "@/modules/home/ui/components/project-form"
import { ProjectsList } from "@/modules/home/ui/components/projects-list"
import Image from "next/image"

const Page = () => {
  return (
   <div className="flex flex-col max-w-7xl mx-auto w-full">
    <section className="space-y-4 sm:space-y-6 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32">
      <div className="flex flex-col items-center">
        <Image 
          src="/logo.svg"
          alt="Vibe"
          width={50}
          height={50}
          className="hidden md:block"/>
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4">
        Build something with Vibe
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center px-4 max-w-2xl mx-auto">
        Create app and website by chatting with AI
      </p>
      <div className="max-w-3xl mx-auto w-full px-4">
        <ProjectForm/>
      </div>
    </section>
    <div className="px-4">
      <ProjectsList/>
    </div>
   </div>
  )
}

export default Page