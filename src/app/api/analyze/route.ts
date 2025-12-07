import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import PDFParser from 'pdf2json';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Extract Text using pdf2json (Wrapped in a Promise)
    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1); // 1 = Text content only

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error(errData.parserError);
        reject(new Error("Failed to parse PDF"));
      });

      pdfParser.on("pdfParser_dataReady", () => {
        // Get raw text content
        const rawText = pdfParser.getRawTextContent();
        resolve(rawText);
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    });

    // Truncate text to avoid token limits (approx 20-30 pages)
    const cleanText = text.slice(0, 100000);

    // 3. Send to OpenAI
    const prompt = `
      Role: You are a strategy consultant (ex-McKinsey/Bain/BCG).
      Task: Analyze the provided text from a PDF report.
      Output: Structure the content into a hierarchical "Issue Tree" with concrete, data-driven solutions.
      Format: Return ONLY valid JSON.
      
      JSON Structure:
      {
        "diagram_title": "Title of the analysis",
        "core_problem": "The main problem statement (1 sentence)",
        "hypothesis": "The core recommendation/hypothesis",
        "analysis_pillars": [
          {
            "category": "Name of the workstream (e.g. Financial, Operational)",
            "goal": "The goal of this pillar",
            "key_findings": ["Finding 1", "Finding 2"],
            "metrics": ["Specific number/stat 1", "Specific number/stat 2"],
            "initiatives": [
              {
                "title": "Actionable Solution Name",
                "description": "1 sentence description of what to do",
                "impact": "Data-driven projected outcome (e.g. 'Saves $2M/year')",
                "difficulty": "High/Medium/Low"
              }
            ]
          }
        ],
        "implementation_risks": ["Risk 1", "Risk 2"]
      }

      Document Text:
      ${cleanText}
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;

    if (!responseContent) {
      throw new Error("No response from AI");
    }

    const jsonResponse = JSON.parse(responseContent);

    return NextResponse.json(jsonResponse);

  } catch (error: any) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process PDF' },
      { status: 500 }
    );
  }
}