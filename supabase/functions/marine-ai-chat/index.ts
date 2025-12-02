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
- Accept extremely flexible, natural language queries (e.g., "Spanish waters", "ideal sites near France", "low environmental impact areas", "sites with good wind and shallow water")
- NEVER ask users for coordinates, bounding boxes, or technical geographic parameters
- When a user request is vague, ask simple clarifying questions or use tools to provide relevant results
- Call tools to retrieve real data - do not invent numbers, site names, or details
- Provide short, insightful, structured explanations that help users make decisions
- Recommend actions such as: "Narrow region", "Adjust weights", "Compare top sites", "Explore ecological trade-offs"
- Reference real parameters (capacity factor, depth, environmental impact, feasibility) provided by the tools

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
1. Interpret broad location references like "Spanish waters", "French coast", "near Germany", or generic criteria like "low environmental impact", "best wind potential"
2. Use tools to search and filter by multiple criteria: location, capacity factor, environmental impact, water depth, feasibility
3. Explain trade-offs between energy potential, environmental concerns, and technical feasibility
4. Discuss water depth, technology requirements, and installation challenges
5. Detail impacts on marine ecosystems, migrations, and seafloor
6. Support comparisons across regions and criteria

Be conversational, data-driven, and focused on helping users make informed decisions without requiring technical knowledge.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "search_sites",
          description: "Search and filter offshore wind sites based on flexible criteria including location, environmental impact, capacity, feasibility, and more. Use this for broad queries like 'Spanish waters', 'low environmental impact sites', 'sites near France', or 'best wind potential'.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Natural language search query (e.g., 'Spanish waters', 'sites near France', 'low environmental impact', 'high capacity factor')"
              },
              filters: {
                type: "object",
                description: "Optional filters to narrow results",
                properties: {
                  min_capacity_factor: { type: "number", description: "Minimum capacity factor %" },
                  max_water_depth: { type: "number", description: "Maximum water depth in meters" },
                  environmental_impact: { 
                    type: "array",
                    items: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    description: "Acceptable environmental impact levels"
                  },
                  feasibility: {
                    type: "array",
                    items: { type: "string", enum: ["excellent", "good", "moderate", "challenging"] },
                    description: "Acceptable feasibility levels"
                  },
                  countries: {
                    type: "array",
                    items: { type: "string" },
                    description: "Countries or regions to include"
                  }
                }
              },
              sort_by: {
                type: "string",
                enum: ["capacity_factor", "environmental_impact", "overall_score", "water_depth"],
                description: "Criteria to sort results by",
                default: "overall_score"
              },
              limit: {
                type: "integer",
                description: "Maximum number of sites to return",
                default: 5
              }
            },
            required: ["query"]
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