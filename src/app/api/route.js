import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { PineconeClient } from '@pinecone-database/pinecone';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const pinecone = new PineconeClient({
  apiKey: PINECONE_API_KEY,
  environment: PINECONE_ENVIRONMENT,
});

// Retrieve docs and embeddings from Pinecone
async function retrieveDocuments(query) {
  const index = pinecone.Index('medguide-ai');
  const { data: { embedding } } = await openai.embeddings.create({
    input: query,
    model: 'text-embedding-ada-002',
  });

  const results = await index.query({
    vector: embedding,
    topK: 2,
  });

  return results.matches.map(match => match.metadata);
}

// Handle incoming requests
export async function POST(req) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const userInput = messages[messages.length - 1]?.content || '';

    const relevantDocs = await retrieveDocuments(userInput);
    const context = relevantDocs.map(doc => doc.content).join('\n');

    const prompt = `You are an AI chatbot assistant for hospitals. 
Use 'knowledge' instead of context in your responses. 
Never make up answers, if unsure, say: 'I am not sure, let me connect you with a health practitioner'.
Only answer questions related to the context, if the question is out of scope, say: 'I am not sure, 
let me connect you with a healthcare practitioner'.
Answer based on the context provided:\n\nContext:\n${context}\n\nUser: ${userInput}\nAI:`;

    // Get response from OpenAI
    const responseStream = openai.completions.create({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 150,
      temperature: 0.7,
      stream: true,
    });

    let aiResponse = '';

    // Stream response from OpenAI
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          aiResponse += chunk.choices[0].text;
          controller.enqueue(new TextEncoder().encode(chunk.choices[0].text));
        }
        controller.close();
      },
    });

    return new NextResponse(readableStream);
  } catch (error) {
    console.error('Error handling request:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
