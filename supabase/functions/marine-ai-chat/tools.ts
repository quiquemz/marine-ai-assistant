export const tools = [
  {
    type: "function",
    function: {
      name: "search_sites",
      description:
        "Search and filter offshore wind sites based on flexible criteria including location, environmental impact, capacity, feasibility, and more. Use this for broad queries like 'Spanish waters', 'low environmental impact sites', 'sites near France', or 'best wind potential'.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Natural language search query (e.g., 'Spanish waters', 'sites near France', 'low environmental impact', 'high capacity factor')",
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
                description: "Acceptable environmental impact levels",
              },
              feasibility: {
                type: "array",
                items: { type: "string", enum: ["excellent", "good", "moderate", "challenging"] },
                description: "Acceptable feasibility levels",
              },
              countries: {
                type: "array",
                items: { type: "string" },
                description: "Countries or regions to include",
              },
            },
          },
          sort_by: {
            type: "string",
            enum: ["capacity_factor", "environmental_impact", "overall_score", "water_depth"],
            description: "Criteria to sort results by",
            default: "overall_score",
          },
          limit: {
            type: "integer",
            description: "Maximum number of sites to return",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
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
            description: "Site name or ID (e.g., 'Dogger Bank', 'Norwegian Sea', 'site-1')",
          },
        },
        required: ["site_identifier"],
      },
    },
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
            description: "List of site names or IDs to compare",
          },
          focus_criteria: {
            type: "array",
            items: {
              type: "string",
              enum: ["energy", "environmental_impact", "feasibility", "cost", "ecology"],
            },
            description: "Which criteria to emphasize in the comparison",
          },
        },
        required: ["site_identifiers"],
      },
    },
  },
];
