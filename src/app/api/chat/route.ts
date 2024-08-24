import { ChatAnthropic } from "@langchain/anthropic";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { LangChainAdapter, Message } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages;

    const chatModel = new ChatAnthropic({
      model: "claude-3-sonnet-20240229",
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            // You can add logging here if needed
          },
        },
      ],
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    const currentMessageContent = messages[messages.length - 1].content;
    console.log("Current message:", currentMessageContent);

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a dramatic bot. Answer all messages as dramatically as possible. Do not say 'here is a dramatic response', just respond in character.",
      ),
      HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);

    const chain = prompt.pipe(chatModel);

    const response = await chain.stream({
      text: currentMessageContent,
    });

    return LangChainAdapter.toDataStreamResponse(response);
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
