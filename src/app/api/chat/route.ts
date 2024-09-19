import { getVectorStore } from "@/lib/astradb";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  ChatPromptTemplate,
  PromptTemplate,
  MessagesPlaceholder,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { UpstashRedisCache } from "@langchain/community/caches/upstash_redis";
import { LangChainAdapter, Message as VercelMessage } from "ai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { RedisRateLimiter } from "@/lib/utils";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

//Todo: reduce latency

let cachedRetriever: VectorStoreRetriever | undefined;

async function getCachedRetriever() {
  if (!cachedRetriever) {
    const vectorStore = await getVectorStore();
    if (!vectorStore) {
      throw new Error("Vectorstore not found");
    }
    cachedRetriever = vectorStore.asRetriever();
  }
  return cachedRetriever;
}

// TODO: fix cache
const cache = new UpstashRedisCache({
  config: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
});

const rateLimiter = RedisRateLimiter.getInstance();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = req.ip ?? "127.0.0.1";
    const messages: VercelMessage[] = body.messages;

    const { success } = await rateLimiter.limit(ip);

    if (!success) {
      return new Response("Rate Limited, try again in 20 minutes", {
        status: 429,
      });
    }

    const chat_history = messages
      .slice(0, -1)
      .map((m: VercelMessage) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      );

    // Retriever setup
    const retriever = await getCachedRetriever();

    const currentMessageContent = messages[messages.length - 1].content;

    const chatModel = new ChatAnthropic({
      model: "claude-3-haiku-20240307",
      streaming: true,
      cache,
      verbose: true,
      clientOptions: {
        defaultHeaders: {},
      },
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    const rephrasePrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
      [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the current question. " +
          "Don't leave out any relevant keywords. Only return the query and no other text.",
      ],
    ]);

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: chatModel,
      retriever,
      rephrasePrompt,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a chatbot for a personal portfolio website. You speak for the website's owner, DO NOT EXPLICITLY say `As the website's owner`. " +
          "Answer the user's questions based on the below context. " +
          "Whenever it makes sense, provide links to the pages that contain more information about the topic from the given context. " +
          "Format your responses in markdown format. \n\n" +
          "Context:\n{context}",
      ),
      new MessagesPlaceholder("chat_history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const combineDocsChain = await createStuffDocumentsChain({
      llm: chatModel,
      prompt,
      documentPrompt: PromptTemplate.fromTemplate(
        "Page URL: {url}\n\nPage_content:\n{page_content}",
      ),
      documentSeparator: "\n------\n",
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain,
      retriever: historyAwareRetrieverChain,
    });

    const stream = await retrievalChain.stream({
      input: currentMessageContent,
      chat_history,
    });

    const textStream = stream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          if (chunk.answer) {
            controller.enqueue(chunk.answer);
          }
        },
      }),
    );

    return LangChainAdapter.toDataStreamResponse(textStream);
  } catch (e: any) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred", details: e.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
