import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";

export const projectsRouter = createTRPCRouter({
     getOne : baseProcedure
      .input(z.object({
        id: z.string().min(1,{message:"Project ID is required"} )
      }))
      .query(async({input})=>{
        const existingProjects = await prisma.project.findUnique({
            where:{
                id: input.id
            }
            
        })
        if (!existingProjects) {
            throw new TRPCError({code:"NOT_FOUND", message:"Project not found"})
        }
        return existingProjects
      }),
    getMany : baseProcedure
    
      .query(async()=>{
        const projects = await prisma.project.findMany({
            orderBy:{
                createdAt:"desc"
            },
        })
        return projects
      }),
    create:baseProcedure
    .input(
        z.object({
            value :z.string().min(1,{message:"Message cannot be empty"}).max(10000,{message:"Message is too long"})
        }),
    )
    .mutation(async({input})=>{

        const createdProject = await prisma.project.create({
            data:{
                name: generateSlug(2,{
                    format : 'kebab'
                }),
                messages:{
                    create:{
                        content:input.value,
                        role:"USER",
                        type:"RESULT"
                    }
                }
            }
        })
         await inngest.send({
                  name: "code-agent/run",
                  data: { 
                    value: input.value,
                    projectId: createdProject.id
                },
                }) 

        return createdProject
    })
});