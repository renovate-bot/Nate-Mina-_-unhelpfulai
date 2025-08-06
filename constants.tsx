import React from 'react';
import { Tool } from './types';
import { ChatIcon, ImageIcon, SummarizeIcon, PlagiarismIcon, DefineIcon, SolveIcon, SentimentIcon, PersonaChatIcon } from './components/icons';

export const TOOLS = [
  { id: Tool.Chat, name: 'Chat', icon: <ChatIcon /> },
  { id: Tool.Image, name: 'Image Generation', icon: <ImageIcon /> },
  { id: Tool.PersonaChat, name: 'Persona Chat', icon: <PersonaChatIcon /> },
  { id: Tool.Summarize, name: 'Summarizer', icon: <SummarizeIcon /> },
  { id: Tool.Plagiarism, name: 'Plagiarism Checker', icon: <PlagiarismIcon /> },
  { id: Tool.Define, name: 'Definer', icon: <DefineIcon /> },
  { id: Tool.Solve, name: 'Problem Solver', icon: <SolveIcon /> },
  { id: Tool.Sentiment, name: 'Sentiment Analysis', icon: <SentimentIcon /> },
];
