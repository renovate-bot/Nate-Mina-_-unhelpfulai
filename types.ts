export enum Tool {
  Chat = 'Chat',
  Image = 'Image Generation',
  Summarize = 'Summarizer',
  Plagiarism = 'Plagiarism Checker',
  Define = 'Definer',
  Solve = 'Problem Solver',
  Sentiment = 'Sentiment Analysis',
  PersonaChat = 'Persona Chat',
}

export enum Persona {
  GigaChadGPT = 'GigaChadGPT',
  SaltySteve = 'SaltySteve',
  RageQuitRandy = 'RageQuitRandy',
  ToxicTina = 'ToxicTina',
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  persona?: Persona;
}

export interface SentimentResponse {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  score: number;
  explanation: string;
}

export interface PersonaResponse {
    response: string;
    transfer_to: Persona | null;
}