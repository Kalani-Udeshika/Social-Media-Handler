//import { env } from "$amplify/env/generate-orchid-content";

import type { Schema } from "../../data/resource";

interface ViralContent {
  id?: string;
  content: string;
  image?: string | null;
  likes?: number;
  comments?: number;
  date?: string;
  reach?: number;
}

interface UserIdea {
  id?: string;
  content: string;
}

interface PostIdeasResponse {
  pageReachIncreasing: string[];
  orchidsPlantSelling: string[];
}

// interface RankingResponse {
//   topReachPosts: {
//     rank: number;
//     content: string;
//     reason: string;
//   }[];
//   topSellingPosts: {
//     rank: number;
//     content: string;
//     reason: string;
//   }[];
// }

interface CombinedRankingResponse {
  rankedItems: {
    id: string;
    reach: number;
    engagement: number;
    sales: number;
    relevance: number;
    creativity: number;
    reason: string;
  }[];
}

interface OpenAIResponse {
  choices?: {
    message?: {
      content?: string | null;
    };
  }[];
  error?: {
    message?: string;
  };
}

const callOpenAI  = async (
   
  prompt: string,
  jsonMode = false
): Promise<string> => {

    const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not configured.");
} 
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        //Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
       //model: process.env.OPENAI_MODEL,
       // model: "gpt-4o-mini",
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Facebook marketing strategist specializing in orchids, gardening, and Sri Lankan plant buyers.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        ...(jsonMode
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    }
  );

  const data = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new Error(
      data.error?.message ??
        `OpenAI API request failed: ${response.status}`
    );
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content;
};

//export const handler = async () => {
export const handler: Schema["generateOrchidContent"]["functionHandler"] =
  async (event) => {
  try {

    //get viral post from frontend, get user ideas from frontend, and validate them

    const viralContents =
  event.arguments.viralContents as unknown as ViralContent[];

const userIdeas =
  event.arguments.userIdeas as unknown as UserIdea[];

if (!Array.isArray(viralContents)) {
  throw new Error("Invalid viral contents data.");
}

if (!Array.isArray(userIdeas)) {
  throw new Error("Invalid user ideas data.");
}

console.log("Viral contents received:", viralContents.length);
console.log("User ideas received:", userIdeas.length);
    // CALL 1: Generate trend ideas.
    const trends = await callOpenAI(`
      Identify important marketing themes related to:
      - Orchids and orchid care
      - Orchid plant selling
      - Home gardening and indoor plants
      - Sri Lankan plant buyers

      Return a concise list of ideas.
      Do not claim these are verified real-time trends.
    `);

    // CALL 2: Generate 20 post ideas.
    const generatedPosts = await callOpenAI(
      `
      Based on these marketing themes:
      ${trends}

      Generate exactly 10 ideas in each category.

      Return a JSON object with this structure:
      {
        "pageReachIncreasing": ["idea 1"],
        "orchidsPlantSelling": ["idea 1"]
      }

      Requirements:
      pageReachIncreasing:
      - 10 shareable, engagement-focused Facebook post ideas
      - Include questions, polls, and educational content

      orchidsPlantSelling:
      - 10 sales-focused Facebook post ideas
      - Encourage genuine purchase interest
      - Include orchid promotion ideas suitable for Sri Lanka

      Every array item must be a string.
      Return valid JSON only.
      `,
      true
    );

    const postIdeas = JSON.parse(
      generatedPosts
    ) as PostIdeasResponse;

    if (
      !Array.isArray(postIdeas.pageReachIncreasing) ||
      !Array.isArray(postIdeas.orchidsPlantSelling)
    ) {
      throw new Error("OpenAI returned an invalid post ideas structure.");
    }

    // CALL 3: Rank the generated ideas.

    // CALL 3: Combine all three content sources.

const combinedContents = [
  // Source 1: Viral posts from frontend
  ...viralContents.map((post, index) => ({
    id: `viral-${post.id || index + 1}`,
    source: "viral",
    content: post.content,
    image: post.image ?? null,
    historicalMetrics: {
      likes: post.likes ?? null,
      comments: post.comments ?? null,
      reach: post.reach ?? null,
      date: post.date ?? null,
    },
  })),

  // Source 2: Ideas entered by the user
  ...userIdeas.map((idea, index) => ({
    id: `user-${idea.id || index + 1}`,
    source: "user",
    content: idea.content,
    image: null,
    historicalMetrics: null,
  })),

  // Source 3: AI-generated ideas
  ...postIdeas.pageReachIncreasing.map((idea, index) => ({
    id: `ai-reach-${index + 1}`,
    source: "ai",
    category: "reach",
    content: idea,
    image: null,
    historicalMetrics: null,
  })),

  ...postIdeas.orchidsPlantSelling.map((idea, index) => ({
    id: `ai-selling-${index + 1}`,
    source: "ai",
    category: "selling",
    content: idea,
    image: null,
    historicalMetrics: null,
  })),
];

console.log("Total combined contents:", combinedContents.length);

// CALL 4: Ask OpenAI to evaluate all content together.

const generatedRanking = await callOpenAI(
  `
  You are an expert Facebook marketing strategist specializing
  in orchids, gardening, and Sri Lankan plant buyers.

  Evaluate ALL the following content items together.

  Content:
  ${JSON.stringify(combinedContents)}

  Give each item a score from 1 to 10 for:

  1. reach: Potential audience reach
  2. engagement: Potential likes, comments and shares
  3. sales: Potential to generate orchid sales
  4. relevance: Relevance to Sri Lankan orchid buyers
  5. creativity: Originality and creativity

  IMPORTANT:
  - Evaluate all three sources fairly.
  - Historical metrics are actual historical data only.
  - Do not invent likes, comments or reach.
  - Scores are estimates of future potential, not actual results.
  - Return every input item exactly once.
  - Keep each item's original ID.

  Return valid JSON only using this structure:

  {
    "rankedItems": [
      {
        "id": "viral-1",
        "reach": 9,
        "engagement": 8,
        "sales": 7,
        "relevance": 9,
        "creativity": 8,
        "reason": "Why this content may perform well"
      }
    ]
  }
  `,
  true
);

const ranking = JSON.parse(
  generatedRanking
) as CombinedRankingResponse;


// Validate the ranking response from OpenAI

if (
  !Array.isArray(ranking.rankedItems) ||
  ranking.rankedItems.length !== combinedContents.length
) {
  throw new Error("OpenAI did not return all ranking items.");
}

const expectedIds = new Set(
  combinedContents.map((item) => item.id)
);

const receivedIds = new Set<string>();

for (const item of ranking.rankedItems) {
  if (
    !item.id ||
    !expectedIds.has(item.id) ||
    receivedIds.has(item.id)
  ) {
    throw new Error("Invalid or duplicate ranking item ID.");
  }

  const scores = [
    item.reach,
    item.engagement,
    item.sales,
    item.relevance,
    item.creativity,
  ];

  if (
    scores.some(
      (score) =>
        typeof score !== "number" ||
        !Number.isFinite(score) ||
        score < 1 ||
        score > 10
    )
  ) {
    throw new Error("Invalid ranking score. Scores must be between 1 and 10.");
  }

  if (
    typeof item.reason !== "string" ||
    !item.reason.trim()
  ) {
    throw new Error("Ranking reason is missing.");
  }

  receivedIds.add(item.id);
}

if (receivedIds.size !== expectedIds.size) {
  throw new Error("Some ranking items are missing.");
}


// Calculate the weighted score in our Lambda.
const combinedRanking = ranking.rankedItems
  .map((item) => {
    const totalScore =
      item.reach * 0.25 +
      item.engagement * 0.25 +
      item.sales * 0.20 +
      item.relevance * 0.15 +
      item.creativity * 0.15;

    const originalContent = combinedContents.find(
      (content) => content.id === item.id
    );

    if (!originalContent) {
      throw new Error(`Unknown ranking item: ${item.id}`);
    }

    return {
      ...originalContent,
      rank: 0,
      totalScore: Number(totalScore.toFixed(2)),
      scores: {
        reach: item.reach,
        engagement: item.engagement,
        sales: item.sales,
        relevance: item.relevance,
        creativity: item.creativity,
      },
      reason: item.reason,
    };
  })
  .sort((a, b) => b.totalScore - a.totalScore)
  .map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

return {
  success: true,
  trends,
  postIdeas,
  combinedRanking,
};
  } catch (error) {
    console.error("Orchid content generation failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred.",
    };
  };
};


    // const generatedRanking = await callOpenAI(
    //   `
    //   Rank the following Facebook post ideas.

    //   Evaluate:
    //   1. Potential reach
    //   2. Engagement potential
    //   3. Shareability
    //   4. Potential to convert orchid buyers

    //   Ideas:
    //   ${JSON.stringify(postIdeas)}

    //   Return a JSON object with this structure:
    //   {
    //     "topReachPosts": [
    //       {
    //         "rank": 1,
    //         "content": "post idea",
    //         "reason": "why it may perform well"
    //       }
    //     ],
    //     "topSellingPosts": [
    //       {
    //         "rank": 1,
    //         "content": "post idea",
    //         "reason": "why it may encourage purchases"
    //       }
    //     ]
    //   }

    //   Return up to 10 ranked ideas in each category.
    //   Rank the strongest ideas first.
    //   These are predictions, not guaranteed performance results.
    //   Return valid JSON only.
    //   `,
    //   true
    // );

  //   const ranking = JSON.parse(
  //     generatedRanking
  //   ) as RankingResponse;

  //   return {
  //     success: true,
  //     trends,
  //     postIdeas,
  //     ranking,
  //   };
  // } catch (error) {
  //   console.error("Orchid content generation failed:", error);

  //   return {
  //     success: false,
  //     error:
  //       error instanceof Error
  //         ? error.message
  //         : "An unknown error occurred.",
  //   };
  // }





// import type { Handler } from 'aws-lambda';

// export const handler: Handler = async () => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Orchid Content Creator Lambda is working!',
//     }),
//   };
// };

// import type { Handler } from 'aws-lambda';

// export const handler: Handler = async (event) => {
//   console.log('Received event:', JSON.stringify(event));

//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Orchid Content Creator Lambda is working!',
//     }),
//   };
// };





// import { env } from "$amplify/env/generate-orchid-content";
// interface PostIdeasResponse {
//   pageReachIncreasing: string[];
//   orchidsPlantSelling: string[];
// }

// interface RankingResponse {
//   topReachPosts: {
//     rank: number;
//     content: string;
//     reason: string;
//   }[];
//   topSellingPosts: {
//     rank: number;
//     content: string;
//     reason: string;
//   }[];
// }

// interface OpenAIResponse {
//   choices?: {
//     message?: {
//       content?: string | null;
//     };
//   }[];
//   error?: {
//     message?: string;
//   };
// }

// const callOpenAI = async (
//     prompt: string,
//     jsonMode = false
// ): Promise<string> => {
//   const response = await fetch(
//     "https://api.openai.com/v1/chat/completions",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${env.OPENAI_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: env.OPENAI_MODEL,
//         messages: [
//           {
//             role: "system",
//             content: "You are an expert Facebook marketing strategist.",
//           },
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//         temperature: 0.7,
//         ...(jsonMode
//           ? { response_format: { type: "json_object" } }
//           : {}),
//       }),
//     }
//   );
//   const data = (await response.json()) as OpenAIResponse;
//  // return data.choices?.[0]?.message?.content ?? "";
//  if (!response.ok) {
//     throw new Error(
//       data.error?.message ??
//         `OpenAI API request failed: ${response.status}`
//     );
//   }

//   const content = data.choices?.[0]?.message?.content;

//   if (!content) {
//     throw new Error("OpenAI returned an empty response.");
//   }

//   return content;
// };
// export const handler = async () => {
//   try {
//     /**
//      * LLM CALL 1
//      * Get current trends
//      */
//     const trends = await callOpenAI(`
//       Identify current trends related to:
//       - Orchids
//       - Orchid plant selling
//       - Home gardening
//       - Indoor plants
//       - Sri Lankan plant buyers
//       Return only a concise list of trends.
//     `);
//     /**
//      * LLM CALL 2
//      * Generate post ideas
//      */
//     const generatedPosts = await callOpenAI(`
//       Based on these trends:
//       ${trends}
//       Generate JSON only:
//       {
//         "pageReachIncreasing": ["idea 1"],
//         "orchidsPlantSelling": ["idea 1"]
//       }
//       Requirements:
//       pageReachIncreasing:
//       - 10 highly shareable posts
//       - engagement focused
//       - questions
//       - polls
//       - educational content
//       orchidsPlantSelling:
//       - 10 sales-focused posts
//       - strong purchase intent
//       - orchid promotion ideas
//       Return valid JSON only.
//     `,
//       true
//     );
//     const postIdeas = 
//       JSON.parse(generatedPosts) as PostIdeasResponse ;
//     /**
//      * LLM CALL 3
//      * Rank all content
//      */

//      if (
//       !Array.isArray(postIdeas.pageReachIncreasing) ||
//       !Array.isArray(postIdeas.orchidsPlantSelling)
//     ) {
//       throw new Error("OpenAI returned an invalid post ideas structure.");
//     }

//     const ranking = await callOpenAI(`
//       Rank these Facebook post ideas based on:
//       1. Reach potential
//       2. Engagement potential
//       3. Shareability
//       4. Orchid buyer conversion
//       Posts:
//       ${JSON.stringify(postIdeas)}
//       Return JSON:
//       {
//         "topReachPosts": [
//           {
//             "rank": 1,
//             "content": "...",
//             "reason": "..."
//           }
//         ],
//         "topSellingPosts": [
//           {
//             "rank": 1,
//             "content": "...",
//             "reason": "..."
//           }
//         ]
//       }
//     `,
// true
// );
//     const rank = JSON.parse(
//       ranking
//     ) as RankingResponse;
    
//     return {
//       trends,
//       postIdeas,
//       ranking: JSON.parse(ranking),
//     };
//   } catch (error) {
//     console.error("Orchid content generation failed:",error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// };




