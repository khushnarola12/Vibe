import { createAgent ,gemini} from "@inngest/agent-kit";
import { inngest } from "./client";
import {Sandbox} from "@e2b/code-interpreter"
import { getSandbox } from "./utils";


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,step}) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-testa-nextjs-9");
      return sandbox.sandboxId
       
    });
   // Create a Gemini model provider with your API key
     const codeAgent = createAgent({
      name: "summarizer",
      system: "You are an expert next.js developer. You write readable, maintainable code. You write simple next.js & react.js snippets ",
      model: gemini({
        model: "gemini-1.5-flash",       // replace with preferred Gemini model
        apiKey: process.env.GEMINI_API_KEY, // AgentKit will pick this up automatically if set
        // You can also set defaultParameters here, e.g.:
        // defaultParameters: { temperature: 0.7 }
      }),
    });

    const { output } = await codeAgent.run(
  `Write the following snippet : ${event.data.value}`,
);
console.log(output);

    const sandboxUrl = await step.run("get-sandbox-url", async () => { 
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `https://${host}`
    })
    return { output ,sandboxUrl};
  },
);