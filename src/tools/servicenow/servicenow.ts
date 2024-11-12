import {
    BaseToolOptions,
    BaseToolRunOptions,
    JSONToolOutput,
    Tool,
  } from "@/tools/base.js"; // Adjust path based on your setup
  import { z } from "zod";
  import fetch from "node-fetch";
  import { getEnv } from "@/internals/env.js";
  
  type ToolOptions = {
    instanceUrl: string;
    username: string;
    password: string;
  } & BaseToolOptions;
  
  type ToolRunOptions = BaseToolRunOptions;
  
  export interface IncidentRecordResponse {
    sys_id: string;
    number: string;
    short_description: string;
    description: string;
    priority: string;
    state: string;
    // Add additional fields as needed from ServiceNow's incident table
  }
  
  export class ServiceNowIncidentTool extends Tool<
    JSONToolOutput<IncidentRecordResponse>,
    ToolOptions,
    ToolRunOptions
  > {
    name = "ServiceNowIncident";
    description = "Retrieve a specific incident record from ServiceNow using sys_id.";
  
    // Define input schema
    inputSchema() {
        const schema = z.object({
            sys_id: z.string().min(1, "sys_id is required").describe("The sys_id of the incident to retrieve"),
          });
          const sampleInput = { sys_id: "test-sys-id" };
          const validationResult = schema.safeParse(sampleInput);
          // console.log("Schema validation result (debug):", validationResult);
        return schema
      return z.object({
        sys_id: z.string().min(1, "sys_id is required").describe("The sys_id of the incident to retrieve"),
      });
    }

    static {
        this.register();
      }
  
    // Implement the required _run method
    protected async _run(
      input: { sys_id: string },
      options: ToolRunOptions
    ): Promise<JSONToolOutput<IncidentRecordResponse>> {
      const { instanceUrl, username, password } = this.options;

       // Debugging sys_id
  
      // const url = `${instanceUrl}/api/now/table/incident/${input.sys_id}`;
      const url = new URL(`/api/now/table/incident/${input.sys_id}`, instanceUrl);

      // Add query parameters
      url.searchParams.append("sysparm_fields", "sys_id,number,short_description,priority,state");
      url.searchParams.append("sysparm_limit", "1");

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
      };
  
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch incident: ${response.statusText}`);
        }
  
        // const jsonResponse: IncidentRecordResponse = await response.json();
        const jsonResponse = await response.json() as { result: IncidentRecordResponse };
        const rawData: IncidentRecordResponse = jsonResponse.result;


        // Explicitly define the fields we want to send back
        const data: IncidentRecordResponse = {
            sys_id: rawData?.sys_id,
            number: rawData.number,
            short_description: rawData.short_description,
            description: rawData.description,
            priority: rawData.priority,
            state: rawData.state,
        };
        // console.log("Trimmed API Response from ServiceNow: ", data);
  
        // Return an instance of JSONToolOutput
        return new JSONToolOutput<IncidentRecordResponse>(data);
      } catch (error) {
        throw new Error(`Error fetching incident: ${error.message}`);
      }
    }
  }