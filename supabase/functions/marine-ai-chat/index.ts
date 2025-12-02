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