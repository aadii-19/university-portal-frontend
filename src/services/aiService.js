import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'deepseek/deepseek-chat';

/**
 * Evaluate an assignment using an AI model via OpenRouter.
 *
 * @param {Object} params
 * @param {string} params.assignmentTitle - Title of the assignment
 * @param {string} params.courseName - Course name
 * @param {string} params.fileContent - Text content extracted from the file (or file name if binary)
 * @returns {Promise<Object>} Evaluation result with scores and suggestions
 */
export async function evaluateAssignment({ assignmentTitle, courseName, fileContent }) {
    const systemPrompt = `You are an AI academic evaluator for a university. You evaluate student assignments and provide structured feedback.

You MUST respond with valid JSON only, no extra text. Use exactly this format:
{
  "grammarScore": <number 0-100>,
  "relevanceScore": <number 0-100>,
  "originalityScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence evaluation summary>",
  "suggestions": [
    "<suggestion 1>",
    "<suggestion 2>",
    "<suggestion 3>",
    "<suggestion 4>"
  ]
}

Scoring criteria:
- grammarScore: Evaluate writing quality, grammar, spelling, sentence structure
- relevanceScore: How well the content addresses the assignment topic and requirements
- originalityScore: Creativity, unique insights, and depth of analysis
- overallScore: Weighted average of all three scores

Be constructive in suggestions. Provide specific, actionable feedback.`;

    const userPrompt = `Please evaluate the following student assignment:

**Course:** ${courseName}
**Assignment:** ${assignmentTitle}

**Submitted Content:**
${fileContent || '[File uploaded - binary content. Evaluate based on the assignment title and course context. Provide general feedback for this type of assignment.]'}

Respond with JSON only.`;

    try {
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 800,
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'University Portal - AI Evaluator',
                },
            }
        );

        const content = response.data.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty AI response');

        // Parse the JSON from the response (handle markdown code blocks)
        let jsonStr = content.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }

        const result = JSON.parse(jsonStr);

        // Validate and clamp scores
        return {
            grammarScore: clamp(result.grammarScore, 0, 100),
            relevanceScore: clamp(result.relevanceScore, 0, 100),
            originalityScore: clamp(result.originalityScore, 0, 100),
            overallScore: clamp(result.overallScore, 0, 100),
            summary: result.summary || 'Evaluation completed.',
            suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        };
    } catch (error) {
        console.error('AI Evaluation error:', error);
        throw error;
    }
}

/**
 * Read text content from a file (for text/pdf-like files).
 * For binary files (images), returns the file name.
 */
export async function readFileContent(file) {
    if (!file) return '';

    // For text-based files, read the content
    const textTypes = [
        'text/', 'application/json', 'application/xml',
        'application/javascript', 'application/pdf',
    ];

    const isText = textTypes.some(t => file.type.startsWith(t)) ||
        file.name.endsWith('.txt') || file.name.endsWith('.md') ||
        file.name.endsWith('.docx') || file.name.endsWith('.doc');

    if (isText || file.type === '') {
        try {
            const text = await file.text();
            // Truncate to ~3000 chars to stay within token limits
            return text.substring(0, 3000);
        } catch {
            return `[File: ${file.name}, Size: ${(file.size / 1024).toFixed(1)}KB, Type: ${file.type || 'unknown'}]`;
        }
    }

    // For images/binary, just describe
    return `[Uploaded file: ${file.name}, Size: ${(file.size / 1024).toFixed(1)}KB, Type: ${file.type}]`;
}

function clamp(value, min, max) {
    const num = Number(value);
    if (isNaN(num)) return 75;
    return Math.max(min, Math.min(max, num));
}

/**
 * Check if OpenRouter is configured with an API key
 */
export function isAIConfigured() {
    return !!API_KEY && API_KEY !== 'your-api-key-here';
}
