import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ImageView } from './components/ImageView';
import { ChatView } from './components/ChatView';
import { TextView } from './components/TextView';
import { PersonaChatView } from './components/PersonaChatView';
import { Tool, SentimentResponse } from './types';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.Chat);

  const renderActiveTool = () => {
    switch (activeTool) {
      case Tool.Chat:
        return <ChatView />;
      case Tool.Image:
        return <ImageView />;
      case Tool.PersonaChat:
        return <PersonaChatView />;
      case Tool.Summarize:
        return (
          <TextView
            key={Tool.Summarize}
            title="Text Summarizer"
            description="Paste your text below to get a concise summary."
            inputLabel="Full Text"
            outputLabel="Summary"
            actionText="Summarize"
            apiCall={geminiService.summarizeText}
          />
        );
      case Tool.Plagiarism:
        return (
          <TextView
            key={Tool.Plagiarism}
            title="Plagiarism Checker"
            description="Compare two texts to check for similarities."
            inputLabel="Original Text"
            secondInputLabel="Text to Compare"
            outputLabel="Analysis"
            actionText="Check Plagiarism"
            apiCall={geminiService.checkPlagiarism}
            isTwoInput={true}
          />
        );
      case Tool.Define:
        return (
          <TextView
            key={Tool.Define}
            title="Term Definer"
            description="Enter a term or concept to get a detailed definition."
            inputLabel="Term"
            outputLabel="Definition"
            actionText="Define"
            apiCall={geminiService.defineTerm}
          />
        );
      case Tool.Solve:
        return (
          <TextView
            key={Tool.Solve}
            title="Problem Solver"
            description="Describe a problem and let AI find a solution."
            inputLabel="Problem Description"
            outputLabel="Solution"
            actionText="Solve"
            apiCall={geminiService.solveProblem}
          />
        );
      case Tool.Sentiment:
        return (
           <TextView<SentimentResponse>
            key={Tool.Sentiment}
            title="Sentiment Analysis"
            description="Analyze the sentiment of a piece of text."
            inputLabel="Text to Analyze"
            outputLabel="Sentiment"
            actionText="Analyze"
            apiCall={geminiService.analyzeSentiment}
            renderOutput={(data) => (
                <div className="p-4 border border-secondary rounded-lg bg-secondary/30">
                    <p className="text-lg"><strong>Sentiment:</strong> <span className={data.sentiment === 'Positive' ? 'text-green-400' : data.sentiment === 'Negative' ? 'text-red-400' : 'text-yellow-400'}>{data.sentiment}</span></p>
                    <p className="text-lg"><strong>Score:</strong> {data.score.toFixed(2)}</p>
                    <p className="mt-2 text-medium">{data.explanation}</p>
                </div>
            )}
          />
        );
      default:
        return <ChatView />;
    }
  };
  
  return (
    <div className="flex h-screen bg-primary font-sans">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {renderActiveTool()}
      </main>
    </div>
  );
};

export default App;
