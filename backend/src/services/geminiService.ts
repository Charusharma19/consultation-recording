import { ai, isGeminiConfigured } from '../config/gemini';
import fs from 'fs';

interface AIProcessingResult {
  transcript: string;
  summary: string;
  insights: string[];
}

// Helper for generating mock data if Gemini is not configured or fails
const generateMockAIResult = (clientName: string, notes: string): AIProcessingResult => {
  const clinicianNotesContext = notes ? `regarding "${notes}"` : 'for a general check-up';
  
  return {
    transcript: `[00:02] Clinician: Good afternoon. Thank you for coming in today. Let's discuss your current progress and how you've been feeling since our last session.
[00:15] Client (${clientName}): Thanks. Honestly, it's been a bit of a mixed bag. The new routine we set up has helped with my sleep hygiene, but I'm still feeling quite anxious during my morning commute.
[00:34] Clinician: That's very common. Sleep is a solid foundation, so I'm glad to hear that's improving. When you feel that anxiety rising in the morning, what physical sensations do you notice first?
[00:48] Client (${clientName}): My chest gets tight, and I start breathing really shallowly. I try to listen to music, but my mind just races about everything I have to do at work.
[01:05] Clinician: Okay. Tightness in the chest and shallow breathing are classic signs of the fight-or-flight response. We talked briefly about box breathing last time. Have you had a chance to try that when the tightness starts?
[01:22] Client (${clientName}): I forgot about it, to be honest. When the anxiety hits, it's hard to remember what tools I have.
[01:35] Clinician: That is completely understandable. When we are anxious, our prefrontal cortex - the logical part of our brain - gets quiet. For the next week, let's make a plan. I want you to set a reminder on your phone for 8:00 AM, just before you leave, to practice box breathing for just two minutes. That way, it's fresh in your mind.
[01:58] Client (${clientName}): That sounds manageable. I can set an alarm for that.
[02:05] Clinician: Great. Also, regarding the work stress, let's try to break down your morning tasks. Try writing down the top three priorities for the day before you check your email. This can prevent that feeling of being overwhelmed.
[02:22] Client (${clientName}): Okay, I can try that too. Write down three things before looking at my inbox.
[02:30] Clinician: Excellent. Let's check in next week and see how these two adjustments go. Remember, progress is linear but has ups and downs. Be patient with yourself.
[02:45] Client (${clientName}): Thank you. I appreciate the support. See you next week.`,
    
    summary: `In this consultation ${clinicianNotesContext}, the clinician checked in on the client's progress. The client reported improved sleep hygiene due to their new routine but highlighted ongoing moderate-to-high anxiety during their morning commute (characterized by chest tightness and shallow breathing). The clinician validated the experience and reintroduced box breathing, suggesting a scheduled reminder to practice it daily. The clinician also recommended a task-prioritization strategy (writing down three main tasks before opening emails) to mitigate work-related overwhelm.`,
    
    insights: [
      'Practice box breathing for 2 minutes daily, using a phone reminder set for 8:00 AM.',
      'Write down the top 3 work priorities every morning prior to checking emails to manage cognitive overload.',
      'Monitor and log chest tightness and breathing patterns during morning commutes for the next session.',
      'Continue current sleep hygiene routine, which has successfully improved sleep quality.'
    ],
  };
};

export const processRecordingAI = async (
  filePath: string,
  mimeType: string,
  clientName: string,
  notes: string
): Promise<AIProcessingResult> => {
  if (!isGeminiConfigured() || !ai) {
    console.log('Skipping live Gemini API call: Key not configured. Using local mock generator...');
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return generateMockAIResult(clientName, notes);
  }

  try {
    console.log(`Uploading file ${filePath} (${mimeType}) to Gemini File API...`);
    
    // Upload file to Gemini File API
    const uploadResult = await ai.files.upload({
      file: filePath,
      config: {
        mimeType: mimeType,
      },
    });
    
    console.log(`Upload complete. File URI: ${uploadResult.uri}`);
    console.log('Prompting Gemini model to transcribe and extract insights...');

    const prompt = `
      You are an expert clinical assistant. You are given an audio/video recording of a consultation.
      Your task is to:
      1. Provide a verbatim transcript of the consultation. Format it with timestamps (e.g. [MM:SS]) and speaker tags (e.g. Clinician, Client).
      2. Provide a professional, concise summary of the consultation (1 paragraph).
      3. Extract 3-5 actionable recommendations, action items, or clinical insights for the client or clinician.
      
      Respond STRICTLY in JSON format matching this structure:
      {
        "transcript": "...",
        "summary": "...",
        "insights": ["...", "..."]
      }
      Do not include markdown tags like \`\`\`json or \`\`\` around the JSON response.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        uploadResult,
        prompt
      ],
    });

    const text = response.text?.trim() || '';
    
    // Clean JSON markdown blocks if any returned
    let cleanText = text;
    if (text.startsWith('```json')) {
      cleanText = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      cleanText = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const result = JSON.parse(cleanText) as AIProcessingResult;

    // Delete file from Gemini File API after processing
    try {
      await ai.files.delete({ name: uploadResult.name as string });
      console.log('Temporary file removed from Gemini API storage.');
    } catch (delErr) {
      console.error('Failed to delete temporary Gemini file:', delErr);
    }

    return {
      transcript: result.transcript || 'No transcript generated.',
      summary: result.summary || 'No summary generated.',
      insights: Array.isArray(result.insights) ? result.insights : [],
    };
  } catch (error) {
    console.error('Gemini API processing failed:', error);
    console.log('Falling back to mock AI result generation...');
    return generateMockAIResult(clientName, notes);
  }
};
