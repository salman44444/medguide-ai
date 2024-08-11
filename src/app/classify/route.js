import { NextResponse } from 'next/server';
import PipelineSingleton from './pipeline';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import OpenAI from 'openai';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req) {
  try {
    const pinecone = new PineconeClient
    ({
      apiKey:'587df068-f9f4-4dd1-844b-9442b86f54aa'
    });
    const index = pinecone.Index('docs-medical');

    const body = await req.json();

    const query = body.query || '';
    console.log(query);
    const extractor = await PipelineSingleton.getInstance();

    console.log('\n\n\n\n extractor made succesfull');
    const query_embedded = await extractor(query,{ pooling: 'mean', normalize: true });

    const vectorStore = await PineconeStore.fromExistingIndex(extractor, {
      pineconeIndex: index,
    });
    console.log('\n\n\n\n\n Vector Store defined successfully\n\nn\n\n\n');
  
    const query_embedded_array = query_embedded.tolist()[0];
     console.log(query_embedded_array)
    console.log('size is ',query_embedded_array.length)
    const results = await vectorStore.similaritySearchVectorWithScore(
      query_embedded_array,
      5
    );

    console.log('\n\n\n\n\n Similarity Search done');

    const openai = new OpenAI({
      apiKey:"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",
      baseURL: 'https://openrouter.ai/api/v1',
    });
    console.log("Open ai model defined ")
    console.log(results)
    const context = results
    .map(([doc]) => doc.pageContent || 'No content available')
    .join('\n\n');
  
    console.log("contenxt created\n\n\n",context)
    const prompt = `  "You are an assistant for answering medical questions regarding diseases ,symptoms and their treatment and causes."
    "Use the following pieces of retrieved context to answer "
    "the question. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise. and make the answer in such a way that it feels like talking to a doctor and provide answers from the knowledge of context "
    "\n\n"\n\n${context}\n\nQuestion: ${query}`;
    console.log("\n\n\n\nprompt generated")
    console.log(prompt)
    const response = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
    });

    //await extractor(query, { pooling: 'mean', normalize: true });
   const end = response.choices[0].message.content;
    console.log(query_embedded.tolist());
    console.log("size of query :",query_embedded.tolist()[0].length)
    console.log(end);
    return NextResponse.json(end);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message,
     }, { status: 500 });
  }
}
