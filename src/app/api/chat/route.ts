import { ChatOpenAI } from "@langchain/openai";
import { OpenAIProvider } from "@ai-sdk/openai";
import { ChatCompletionMessageParam } from "ai/prompts";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter, LangChainStream } from "ai";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const messages = body.messages;

    const { handlers } = LangChainStream();

    const currentMessagecontent = messages[messages.lenth - 1].content;
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "you are a dramatic bot, answer all messages as dramatic as possible.",
      ],
      ["user", "{input}"],
    ]);

    const systemMessage: ChatCompletionMessageParam = {
      role: "system",
      content: "You are a helpful assistant.",
    };

    const chatModel = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      streaming: true,
      maxTokens: 1000,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            console.log({ token });
          },
        },
      ],
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const response = await chatModel.stream([systemMessage, ...messages]);

    return LangChainAdapter.toDataStreamResponse(response);
  } catch (e) {}
}
