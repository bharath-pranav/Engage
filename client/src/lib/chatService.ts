// Response can be either wrapped (from Lambda) or direct (from API Gateway)
interface EngageAgentWrappedResponse {
  statusCode: number;
  headers: {
    "Content-Type": string;
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Methods": string;
    "Access-Control-Allow-Headers": string;
  };
  body: string | EngageAgentDirectResponse;
}

interface EngageAgentDirectResponse {
  status: string;
  requestId?: string;
  sessionId: string;
  response: string;
  metadata: {
    tokenUsage: {
      prompt: number;
      completion: number;
      total: number;
    };
    actionGroupsInvoked: string[];
    surveyDataUrl: string;
    originalQuestion: string;
    enhancedQuestion: string;
  };
}

type EngageAgentResponse = EngageAgentWrappedResponse | EngageAgentDirectResponse;

export class ChatService {
  private static readonly API_BASE_URL = 'https://wu7l7mf52es4d7rm6l6qdxhghm0berjj.lambda-url.us-west-2.on.aws';
  private static readonly ASK_ENDPOINT = '/ask';

  // Generate a unique session ID
  static generateSessionId(): string {
    return crypto.randomUUID();
  }

  static async askQuestion(question: string, sessionId?: string): Promise<{
    answer: string;
    sessionId: string;
    shouldCreateNewChat: boolean;
  }> {
    try {
      const currentSessionId = sessionId || this.generateSessionId();

      const response = await fetch(`${this.API_BASE_URL}${this.ASK_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          question: question.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EngageAgentResponse = await response.json();

      // Parse the response - handle both wrapped and direct formats
      let parsedData: EngageAgentDirectResponse;

      if ('statusCode' in data) {
        // Wrapped response from Lambda
        const bodyContent = typeof data.body === 'string' 
          ? JSON.parse(data.body) 
          : data.body;
        parsedData = bodyContent;
      } else {
        // Direct response from API Gateway
        parsedData = data as EngageAgentDirectResponse;
      }

      // Check if the response is successful
      if (parsedData.status !== 'success') {
        throw new Error('Failed to get response from engage agent');
      }

      return {
        answer: parsedData.response,
        sessionId: parsedData.sessionId,
        shouldCreateNewChat: false
      };
    } catch (error) {
      console.error('Error calling engage agent API:', error);

      // Return a user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error("I'm having trouble connecting to the server. Please check your internet connection and try again.");
        } else if (error.message.includes('HTTP error')) {
          throw new Error("The engage agent service is temporarily unavailable. Please try again in a moment.");
        }
        throw new Error(`Sorry, I encountered an error: ${error.message}`);
      }

      throw new Error("I'm experiencing some technical difficulties. Please try asking your question again.");
    }
  }

} 