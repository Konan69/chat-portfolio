import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocumentInterface } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEmbeddingsCollection, getVectorStore } from "../src/lib/astradb";
import { Redis } from "@upstash/redis";
const PDFPath = "public/Resume.pdf";

async function generateEmbeddings() {
  await Redis.fromEnv().flushdb();
  const vectorstore = await getVectorStore();
  if (!vectorstore) {
    throw new Error("Vectorstore not found");
  }

  // Delete all Documents from Vectorstore
  (await getEmbeddingsCollection()).deleteMany({}).catch((e) => {
    console.log(e);
  });

  // Load and Split PDF into Chunks
  const pdfLoader = new PDFLoader(PDFPath);
  const resume = (await pdfLoader.load()).map((doc: any): DocumentInterface => {
    const url = "/Resume.pdf";
    return {
      pageContent: doc.pageContent,
      metadata: { url },
    };
  });
  const pdfsplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitResume = await pdfsplitter.splitDocuments(resume);

  // Load and Split Pages into Chunks
  const loader = new DirectoryLoader(
    "src/app",
    {
      ".tsx": (path) => new TextLoader(path),
    },
    true,
  );
  const docs = (await loader.load())
    .filter((doc) => doc.metadata.source.endsWith("page.tsx"))
    .map((doc: any): DocumentInterface => {
      const url =
        // prettier-ignore
        doc.metadata.source
        .split("/src/app")[1]
        .split("/page.")[0] || "/";

      const pageContentTrimmed = doc.pageContent
        .replace(/^import.*$/gm, "") // Remove all import statements
        .replace(/ className=(["']).*?\1| className={.*?}/g, "") // Remove all className props
        .replace(/^\s*[\r]/gm, "") // remove empty lines
        .trim();

      return {
        pageContent: pageContentTrimmed,
        metadata: { url },
      };
    });
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("html");
  const splitDocs = await splitter.splitDocuments(docs);

  // Add Documents to Vectorstore
  await vectorstore.addDocuments([...splitDocs, ...splitResume]).catch((e) => {
    console.log(e);
  });
}

generateEmbeddings();
