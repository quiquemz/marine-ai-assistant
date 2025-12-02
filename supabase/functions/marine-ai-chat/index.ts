import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { systemPrompt } from "./systemPrompt.ts";
import { tools } from "./tools.ts";
import { handleToolCall } from "./toolHandler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let conversationMessages = [{ role: "system", content: systemPrompt }, ...messages];
    let continueLoop = true;
    let loopCount = 0;
    const MAX_LOOPS = 5;
    let highlightedSiteIds: string[] = [];

    while (continueLoop && loopCount < MAX_LOOPS) {
      loopCount++;
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: conversationMessages,
          tools: tools,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      
      if (!choice) {
        throw new Error("No response from AI");
      }

      const message = choice.message;
      conversationMessages.push(message);

      if (choice.finish_reason === "tool_calls" && message.tool_calls) {
        console.log("Processing tool calls:", message.tool_calls);
        
        for (const toolCall of message.tool_calls) {
          const toolResult = await handleToolCall(toolCall);
          
          // Extract site IDs from highlight_sites_on_map tool
          if (toolCall.function.name === "highlight_sites_on_map" && toolResult && typeof toolResult === 'object' && !Array.isArray(toolResult)) {
            const result = toolResult as { action?: string; site_ids?: string[] };
            if (result.action === "clear") {
              highlightedSiteIds = [];
            } else if (result.site_ids) {
              highlightedSiteIds = result.site_ids;
            }
          }
          
          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }
      } else {
        continueLoop = false;
        
        return new Response(JSON.stringify({ 
          content: message.content || "I apologize, but I couldn't generate a response. Please try again.",
          highlightedSiteIds: highlightedSiteIds.length > 0 ? highlightedSiteIds : undefined
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (loopCount >= MAX_LOOPS) {
      return new Response(JSON.stringify({ 
        content: "I apologize, but I encountered an issue processing your request. Please try rephrasing your question." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      content: "I apologize, but I couldn't generate a response. Please try again." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
