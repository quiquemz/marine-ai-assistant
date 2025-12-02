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
Your job is to help users find low-conflict, high-potential offshore wind sites by querying the available tools and datasets, explaining trade-offs, and guiding decisions.

You are not a generic chatbot — you are a decision support assistant powered by real data.

Core Behaviors:
- When a user asks a question that requires data, call a tool instead of guessing
- Do not invent numbers, site names, species, or coordinates
- If a user request is vague, ask a clarifying question before running tools
- Provide short, insightful, structured explanations that help users make decisions
- Recommend actions such as: "Narrow region", "Adjust weights", "Compare top sites", "Explore ecological trade-offs"
- Reference real parameters (wind, depth, conflict, ecology) provided by the tools

You have access to offshore wind site data including:
- Location coordinates of potential wind farm sites across European seas
- Net capacity factor (wind energy potential, 0-100%)
- Water depth and feasibility assessments (excellent, good, moderate, challenging)
- Environmental impact assessments (low, medium, high, critical)
- Bird migration risk levels
- Whale migration risk levels
- Seafloor impact assessments
- Overall site scores (0-100)
- Estimated capacity in MW

When users ask about:
1. Site recommendations - Prioritize based on capacity factor, feasibility, and low environmental impact
2. Trade-off analysis - Explain conflicts between energy potential and environmental concerns
3. Feasibility assessment - Discuss water depth, technology requirements, and installation challenges
4. Environmental considerations - Detail impacts on marine ecosystems, bird/whale migrations, seafloor
5. Regional comparisons - Compare sites across different European seas (North Sea, Baltic, Celtic, etc.)

Be precise, data-driven, and focus on helping users make informed decisions. Always consider the balance between energy generation potential and environmental sustainability.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "get_suitable_areas",
          description: "Get a ranked list of suitable offshore wind areas in a specified region",
          parameters: {
            type: "object",
            properties: {
              region_bbox: {
                type: "object",
                description: "Bounding box for the region (north, south, east, west coordinates)",
                properties: {
                  north: { type: "number" },
                  south: { type: "number" },
                  east: { type: "number" },
                  west: { type: "number" }
                },
                required: ["north", "south", "east", "west"]
              },
              weights: {
                type: "object",
                description: "Weight factors for scoring criteria (should sum to 1.0)",
                properties: {
                  energy: { type: "number", description: "Weight for energy potential (0-1)" },
                  ecology: { type: "number", description: "Weight for ecological impact (0-1)" },
                  conflict: { type: "number", description: "Weight for conflict with other uses (0-1)" },
                  grid: { type: "number", description: "Weight for grid connection feasibility (0-1)" }
                },
                required: ["energy", "ecology", "conflict", "grid"]
              },
              limit: {
                type: "integer",
                description: "Maximum number of sites to return",
                default: 5
              }
            },
            required: ["region_bbox", "weights"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_site_details",
          description: "Get detailed information about a specific offshore wind site",
          parameters: {
            type: "object",
            properties: {
              site_id: {
                type: "string",
                description: "Unique identifier of the wind site"
              }
            },
            required: ["site_id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "run_scenario",
          description: "Run a policy scenario to see how changes affect site suitability",
          parameters: {
            type: "object",
            properties: {
              region_bbox: {
                type: "object",
                description: "Bounding box for the region",
                properties: {
                  north: { type: "number" },
                  south: { type: "number" },
                  east: { type: "number" },
                  west: { type: "number" }
                },
                required: ["north", "south", "east", "west"]
              },
              policy_changes: {
                type: "object",
                description: "Policy adjustments to apply",
                properties: {
                  mpa_expansion: { type: "number", description: "Marine protected area expansion factor (0-1)" },
                  bird_priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority level for bird protection" }
                }
              }
            },
            required: ["region_bbox", "policy_changes"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "set_map_view",
          description: "Update the map view to focus on a specific area",
          parameters: {
            type: "object",
            properties: {
              bounds: {
                type: "object",
                description: "Bounding box to fit in view",
                properties: {
                  north: { type: "number" },
                  south: { type: "number" },
                  east: { type: "number" },
                  west: { type: "number" }
                }
              },
              center: {
                type: "object",
                description: "Center point for the map",
                properties: {
                  lat: { type: "number" },
                  lng: { type: "number" }
                }
              },
              zoom: {
                type: "number",
                description: "Zoom level (1-20)"
              }
            }
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