import { NextRequest, NextResponse } from 'next/server';
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
// import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import {PineconeStore} from "@langchain/pinecone"
//import { PineconeVectorStore } from 'langchain';
import OpenAI from 'openai';

//loading environment variables

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

//-------------------------------------------------------------------

const pinecone = new PineconeClient()

const index = pinecone.Index('docs-medical');
/*
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});*/
//--------------------------------------------------------------------
// Embedding Model Initilization
let embeddingModel;
async function initializeEmbeddingModel() {
  const { HuggingFaceTransformersEmbeddings } = await import("@langchain/community/embeddings/hf_transformers");
  embeddingModel = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });
}
await initializeEmbeddingModel();
// const embeddingModel = new HuggingFaceTransformersEmbeddings(
//  {
//   model: "Xenova/all-MiniLM-L6-v2",
//  }
// );

// Retrieve docs and embeddings from Pinecone
// const vectorStore = new PineconeVectorStore(index, {
//   embedder: embeddingModel,
// });
const vectorStore= await PineconeStore.fromExistingIndex(embeddingModel,{pineconeIndex:index,
maxConcurrency:5});
//------------------------------------------------------------------------

export async function POST(req) {
  try {
    const body = await req.json();
    const query = body.query || '';
    //--------------------------------------
    //Retriving Docs based on query
    const results = await vectorStore.similaritySearch(query, { k: 5 });

    //Set up OpenRouter Client
    const openai = new OpenAI({
      apiKey: OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    //----------------------------------------------------
    //Generating Prompt with retrieved context
    const context = results.map((doc) => doc.metadata.text).join('\n\n');
    const prompt = `You are an assistant for answering medical questions...\n\n${context}\n\nQuestion: ${query}`;

    //----------------------------------------------------
    //Getting resposne from OpenRouter
    const resposne = await openai.createChatCompletion({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
    });

    //------------------------------------------------------
    //sending response back to client
    return NextResponse.json({ answer: resposne.choices[0].message.content });
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
