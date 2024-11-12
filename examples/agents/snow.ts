import "dotenv/config";
import { BaseMessage } from "bee-agent-framework/llms/primitives/message";
import { WatsonXChatLLM } from "bee-agent-framework/adapters/watsonx/chat";
import { ServiceNowIncidentTool } from "@/tools/servicenow/servicenow.js";
import { BeeAgent } from "bee-agent-framework/agents/bee/agent";
import { createConsoleReader } from "../helpers/io.js";
import { FrameworkError } from "bee-agent-framework/errors";
import { TokenMemory } from "bee-agent-framework/memory/tokenMemory";
import { Logger } from "bee-agent-framework/logger/logger";

// import * as dotenv from "dotenv";
// dotenv.config();

// console.log("WatsonX API Key: ", process.env.WATSONX_API_KEY ? "Loaded" : "Missing");
// console.log("WatsonX Project: ", process.env.WATSONX_PROJECT_ID)
// console.log("Loaded WatsonX Project ID from .env:", process.env.WATSONX_PROJECT_ID);

const llm = WatsonXChatLLM.fromPreset("meta-llama/llama-3-1-70b-instruct", {
    apiKey: process.env.WATSONX_API_KEY,
    projectId: process.env.WATSONX_PROJECT_ID,
    parameters: {
      decoding_method: "greedy",
      max_new_tokens: 50,
    },
  });
  
  console.info("Meta", await llm.meta());
  

// Create an instance of ServiceNowIncidentTool with required credentials
const serviceNowTool = new ServiceNowIncidentTool({
  instanceUrl: process.env.SNOW_INSTANCE_URL!,
  username: process.env.SNOW_USERNAME!,
  password: process.env.SNOW_PASSWORD!,
});

// Initialize the agent, adding ServiceNowIncidentTool to its list of tools
const agent = new BeeAgent({
  llm,
  memory: new TokenMemory({ llm }),
  tools: [serviceNowTool],
});

// Define the prompt to retrieve an incident based on `sys_id`
const prompt = "Retrieve incident with sys_id 0349a542937d5e10c02a75d97bba10c2";

// Run the agent with the prompt and observe the response
const response = await agent
  .run({ prompt },
    {
        execution: {
            maxRetriesPerStep: 2,
            totalMaxRetries: 2,
            maxIterations: 2,
          },
          signal: AbortSignal.timeout(2 * 60 * 1000),
    }
  )
  .observe((emitter) => {
    emitter.on("update", async ({ data, update, meta }) => {
      console.log(`Agent (${update.key}) 🤖 : `, update.value);
    });
  });

// console.log(`Agent 🤖 : `, response.messages[0]);
console.log(`Agent 🤖 : `, response.result.text);