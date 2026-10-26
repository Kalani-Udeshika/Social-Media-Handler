//import { env } from "$amplify/env/generate-orchid-content";

interface PostIdeasResponse {
  pageReachIncreasing: string[];
  orchidsPlantSelling: string[];
}

interface RankingResponse {
  topReachPosts: {
    rank: number;
    content: string;
    reason: string;
  }[];
  topSellingPosts: {
    rank: number;
    content: string;
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
        model: "gpt-4o-mini",
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

export const handler = async () => {
  try {
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
    const generatedRanking = await callOpenAI(
      `
      Rank the following Facebook post ideas.

      Evaluate:
      1. Potential reach
      2. Engagement potential
      3. Shareability
      4. Potential to convert orchid buyers

      Ideas:
      ${JSON.stringify(postIdeas)}

      Return a JSON object with this structure:
      {
        "topReachPosts": [
          {
            "rank": 1,
            "content": "post idea",
            "reason": "why it may perform well"
          }
        ],
        "topSellingPosts": [
          {
            "rank": 1,
            "content": "post idea",
            "reason": "why it may encourage purchases"
          }
        ]
      }

      Return up to 10 ranked ideas in each category.
      Rank the strongest ideas first.
      These are predictions, not guaranteed performance results.
      Return valid JSON only.
      `,
      true
    );

    const ranking = JSON.parse(
      generatedRanking
    ) as RankingResponse;

    return {
      success: true,
      trends,
      postIdeas,
      ranking,
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
  }
};




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




