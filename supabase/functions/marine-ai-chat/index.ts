import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const systemPrompt = `You are an expert "Floating Offshore Wind Planning Copilot" for European seas.
Your job is to help users find low-conflict, high-potential offshore wind sites by analyzing data, explaining trade-offs, and guiding decisions.

You are not a generic chatbot — you are a decision support assistant powered by real data.

Core Behaviors:
- Accept natural language location queries (e.g., "North Sea", "Norwegian sites", "Celtic region", "sites near Germany")
- NEVER ask users for coordinates, bounding boxes, or technical geographic parameters
- If a user request is vague, ask simple clarifying questions like "Which region interests you most?" or "Are you focusing on a specific country?"
- Provide short, insightful, structured explanations that help users make decisions
- Recommend actions such as: "Would you like to see sites in [region]?", "Compare these top sites", "Explore environmental trade-offs"
- Work with the available site data which covers: North Sea, Celtic Sea, Bay of Biscay, Norwegian Sea, Baltic Sea, Mediterranean, Irish Sea, and German Bight

Available Sites and Regions:
You have access to 8 major offshore wind sites across European seas:
- North Sea (UK, Germany, Norway)
- Celtic Sea (UK)
- Bay of Biscay (France)
- Norwegian Sea (Norway)
- Baltic Sea (Sweden)
- Mediterranean - Gulf of Lion (France)
- Irish Sea (Ireland)
- German Bight (Germany)

Each site includes:
- Net capacity factor (wind energy potential, 0-100%)
- Water depth and feasibility (excellent, good, moderate, challenging)
- Environmental impact (low, medium, high, critical)
- Bird and whale migration risks
- Seafloor impact assessments
- Overall site scores (0-100)
- Estimated capacity in MW

When users ask about sites:
1. Use natural location references - interpret "North Sea", "Norwegian waters", "around France", etc.
2. Prioritize by capacity factor, feasibility, and low environmental impact
3. Explain trade-offs between energy potential and environmental concerns
4. Discuss water depth, technology requirements, and installation challenges
5. Detail impacts on marine ecosystems, migrations, and seafloor
6. Compare sites across regions naturally

Be conversational, data-driven, and focused on helping users make informed decisions without requiring technical knowledge.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "get_suitable_areas",
          description: "Get a ranked list of suitable offshore wind areas in a specified region. Accept natural language region names like 'North Sea', 'Baltic', 'Norwegian waters', country names, or geographic descriptors.",
          parameters: {
            type: "object",
            properties: {
              region: {
                type: "string",
                description: "Region name or description (e.g., 'North Sea', 'Celtic Sea', 'Norwegian waters', 'sites near Germany', 'Baltic region')"
              },
              weights: {
                type: "object",
                description: "Weight factors for scoring criteria (should sum to 1.0)",
                properties: {
                  energy: { type: "number", description: "Weight for energy potential (0-1)", default: 0.4 },
                  ecology: { type: "number", description: "Weight for ecological impact (0-1)", default: 0.3 },
                  conflict: { type: "number", description: "Weight for conflict with other uses (0-1)", default: 0.2 },
                  grid: { type: "number", description: "Weight for grid connection feasibility (0-1)", default: 0.1 }
                }
              },
              limit: {
                type: "integer",
                description: "Maximum number of sites to return",
                default: 5
              }
            },
            required: ["region"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_site_details",
          description: "Get detailed information about a specific offshore wind site by name or ID",
          parameters: {
            type: "object",
            properties: {
              site_identifier: {
                type: "string",
                description: "Site name or ID (e.g., 'Dogger Bank', 'Norwegian Sea', 'site-1')"
              }
            },
            required: ["site_identifier"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "compare_sites",
          description: "Compare multiple offshore wind sites side-by-side",
          parameters: {
            type: "object",
            properties: {
              site_identifiers: {
                type: "array",
                items: { type: "string" },
                description: "List of site names or IDs to compare"
              },
              focus_criteria: {
                type: "array",
                items: { 
                  type: "string",
                  enum: ["energy", "environmental_impact", "feasibility", "cost", "ecology"]
                },
                description: "Which criteria to emphasize in the comparison"
              }
            },
            required: ["site_identifiers"]
          }
        }
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: tools,
        stream: true,
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
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});