import { createAgent ,createNetwork,createState,createTool,gemini,type Message,type Tool} from "@inngest/agent-kit";
import { inngest } from "./client";
import {Sandbox} from "@e2b/code-interpreter"
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { PROMPT , FRAGMENT_TITLE_PROMPT, RESPONSE_PROMPT} from "@/prompt";
import { prisma } from "@/lib/db";
import path from "path";
import { text } from "stream/consumers";
import { parseAgentOutput } from "@/lib/utils";

interface AgentState{
  summary: string;
  files :{[path:string]:string};
}



export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event,step}) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-testa-nextjs-9");
      return sandbox.sandboxId
       
    });

    const previousMessages = await step.run("get-previous-messages",async()=>{
      const formattedMessages: Message[] =[]
      const messages  = await prisma.message.findMany({
        where:{
          projectId:event.data.projectId
        },
        orderBy:{
          createdAt:"desc"
        }
      })

      for(const message of messages){
        formattedMessages.push({
          type:"text",
          role:message.role=== "ASSISTANT" ? "assistant" : "user",
          content:  message.content
        })
      }

      return formattedMessages
    })

    const state = createState<AgentState>(
      {
        summary : "",
        files:{}
      },
      {
        messages:previousMessages
      }
    )
   // Create a Gemini model provider with your API key
     const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description : 'An Expert coding agent',
      system: PROMPT,
      model: gemini({
        model: "gemini-2.0-flash",     // replace with preferred Gemini model
        apiKey: process.env.GEMINI_API_KEY, // AgentKit will pick this up automatically if set
      }),

      tools : [
          createTool({
            name : "Terminal",
            description : "Use this to run terminal commands",
            parameters : z.object({ 
              command : z.string(),
            }),
            handler : async ({command},{step}) => {
              return await step?.run ("terminal",async ()=>{
                const buffers = { stdout: "",stderr:""}
                try {
                  const sandbox = await getSandbox(sandboxId)
                  const result = await sandbox.commands.run(command, {
                    onStdout:(data:string)=>{
                      buffers.stdout += data
                    },
                    onStderr:(data:string)=>{
                      buffers.stderr += data
                    }
                  })
                  return result.stdout;
              
                } catch (e) {
                    console.error(
                      `Command failed: ${e}\nstdout: ${buffers.stdout}\nStderr: ${buffers.stderr}`
                    )
                    return  `Command failed: ${e}\nstdout: ${buffers.stdout}\nStderr: ${buffers.stderr}`
                } 
              })
            },
          }),
            createTool({
              name : "createOrUpdateFiles",
              description : "Use this to create or update a file",
              parameters : z.object({ 
                files : z.array(
                  z.object({
                    path : z.string(),
                  content : z.string(), 
                  }),
                ),
            }),
            handler: async ({files},
                {step,network} : Tool.Options<AgentState>) =>{
                const newFiles = await step?.run("createOrUpdateFiles", async () => {
                  try {
                    const updatedFiles = network.state.data.files || {};
                    const sandbox = await getSandbox(sandboxId);
                    for(const file of files){
                      await sandbox.files.write(file.path,file.content)
                      updatedFiles[file.path] = file.content                 
                        }
                    return updatedFiles;  
                  } catch (error) {
                    console.error(error);
                    return "Error" + error;
                  }
                });
                if(typeof newFiles === "object"){
                  network.state.data.files = newFiles
                }
              },
            }),
            createTool({
              name : "readFile",
              description : "Use this to read a file from sandbox  ",
              parameters : z.object({
                  files : z.array(z.string()),
              }),
              handler: async ({files},{step}) => {
                return await step?.run("readFiles", async () => {
                  try {
                    const sandbox = await getSandbox(sandboxId)
                    const contents = []
                    for (const file of files){
                      const content = await sandbox.files.read(file)
                      contents.push({path: file,content})
                    }
                    return JSON.stringify(contents)
                  } catch (error) {
                      return "Error" + error;
                  }
                })
              }
            })
        ],

        lifecycle:{
          onResponse: async ({result,network})=>{
            const lastAssistantMessageText = lastAssistantTextMessageContent(result)

            if (lastAssistantMessageText && network) {
              if(lastAssistantMessageText.includes("<task_summary>")){
                network.state.data.summary = lastAssistantMessageText
              }
            }
            return result
          },
        }
    });

    const network = createNetwork({
      name:"coding-agent-network",
      agents:[codeAgent],
      maxIter:15,
      defaultState:state,
      router:async({network})=>{
        const summary = network.state.data.summary
        
        if(summary){
          return;
        }
        return codeAgent;
      }
    })
  
    const result = await network.run(event.data.value,{state});

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description : 'An Expert coding agent',
      system: FRAGMENT_TITLE_PROMPT,
      model: gemini({
        model: "gemini-2.0-flash",     // replace with preferred Gemini model
        apiKey: process.env.GEMINI_API_KEY, // AgentKit will pick this up automatically if set
      }),
    })

    const responseGenerator = createAgent({
      name: "response-generator",
      description : 'An Expert coding agent',
      system: RESPONSE_PROMPT,
      model: gemini({
        model: "gemini-2.0-flash",     // replace with preferred Gemini model
        apiKey: process.env.GEMINI_API_KEY, // AgentKit will pick this up automatically if set
      }),
    })

    const {output : fragmentTitleOutput} = await fragmentTitleGenerator.run(result.state.data.summary)
    const {output : responseOutput} = await responseGenerator.run(result.state.data.summary)

    const generateFragmentTitle = () =>{
      const output = fragmentTitleOutput[0]
      if(output.type !=="text"){
        return "Here ou go...."
      }
      if(Array.isArray(output.content)){
        return output.content.map((txt)=>txt).join("")
      }
      else{
        return output.content
      }
    }
   

    const generateResponse = () =>{
      const output = responseOutput[0]
      if(output.type !=="text"){
        return "Here ou go...."
      }
      if(Array.isArray(output.content)){
        return output.content.map((txt)=>txt).join("")
      }
      else{
        return output.content
      }
    }
    const isError = 
      !result.state.data.summary || 
      Object.keys(result.state.data.files || {}).length === 0 


    const sandboxUrl = await step.run("get-sandbox-url", async () => { 
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `https://${host}`
    })

    await step.run("save-result",async ()=>{
      if(isError){
        return await prisma.message.create({
          data:{
            projectId : event.data.projectId,
            content : "Something went wrong, please try again later.",
            role : "ASSISTANT",
            type : "ERROR",
          }
        })
      }
      return await prisma.message.create({
        data :{
          projectId : event.data.projectId,
          content: parseAgentOutput(responseOutput),
          role : "ASSISTANT",
          type: "RESULT",
          fragement:{
            create:{
              sandboxUrl : sandboxUrl,
              title : parseAgentOutput(fragmentTitleOutput),
              files : result.state.data.files
            }
          }
        }
      })
    })
    return { 
    url : sandboxUrl,
    title :"Fragment",
    files : result.state.data.files,
    summary : result.state.data.summary
  };
  },
);