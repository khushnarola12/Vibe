"use client"

import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import {Input} from "@/components/ui/input"
import { toast } from "sonner"
import { useState } from "react"

const Page = () => {

  const [value,setValue] = useState("")

  const trpc = useTRPC()
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess:()=>{
      toast.success("Background Job Revoked")
    }
  }))

  return (
   <div>
      <Input value={value} onChange={(e)=>setValue(e.target.value)}/>
      <Button disabled={invoke.isPending} onClick={()=> invoke.mutate({value:value})}>
        Revoke Background Jobs
      </Button>
   </div>
  )
}

export default Page
