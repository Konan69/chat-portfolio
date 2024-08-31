import { AstraDbAdmin, DataAPIClient } from "@datastax/astra-db-ts";
import { OpenAIEmbeddings } from "@langchain/openai";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";

const endpoint = process.env.ASTRA_DB_URL || "";
const token = process.env.ASTRA_DB_TOKEN || "";
const collection = process.env.ASTRA_DB_COLLECTION || "";

const client = new DataAPIClient(token);

const vo = new VoyageEmbeddings({
  apiKey: process.env.VOYAGE_API_KEY,
  modelName: "voyage-large-2",
});

if (!endpoint || !token || !collection) {
  throw new Error(
    "ASTRA_DB_URL, ASTRA_DB_TOKEN, ASTRA_DB_COLLECTION env vars are required",
  );
}

export async function getVectorStore() {
  try {
    return AstraDBVectorStore.fromExistingIndex(
      vo,

      // new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }),
      {
        token,
        endpoint,
        collection,
        collectionOptions: {
          vector: {
            dimension: 1536,
            metric: "cosine",
          },
        },
      },
    );
  } catch (error) {
    console.log(error);
  }
}

export async function getEmbeddingsCollection() {
  return client.db(endpoint).collection(collection);
}
