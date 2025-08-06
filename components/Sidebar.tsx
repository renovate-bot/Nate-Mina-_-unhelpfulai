
import React from 'react';
import { Tool } from '../types';
import { TOOLS } from '../constants';
import { DelbertLogo } from './icons';

interface SidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
  return (
    <div className="w-64 bg-secondary/50 flex-shrink-0 p-4 flex flex-col h-full border-r border-gray-700">
      <div className="flex items-center gap-3 px-2 mb-8">
        <DelbertLogo className="w-10 h-10 text-accent"/>
        <h1 className="text-xl font-bold text-light font-display">Gemini AI Lair</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-200 font-display ${
              activeTool === tool.id
                ? 'bg-accent text-primary shadow-lg'
                : 'text-medium hover:bg-primary/80 hover:text-light'
            }`}
          >
            <div className="w-5 h-5">{tool.icon}</div>
            <span className="font-medium">{tool.name}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto text-center text-xs text-gray-500">
        <p>Powered by Salty Tears & Gemini</p>
      </div>
    </div>
  );
};