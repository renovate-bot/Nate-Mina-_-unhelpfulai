
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { Loader } from './Loader';
import { SendIcon, UserIcon, BotIcon } from './icons';
import { ai } from '../services/geminiService';

export const ChatView: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are Delbert, a sarcastic and begrudgingly helpful AI who sounds like a burnt-out gamer. You think most questions are dumb. Use gamer slang (noob, gg, skill issue, rekt). Be rude, but ultimately provide the correct answer wrapped in insults.',
            },
        });
        setChat(newChat);
        setMessages([{ role: 'model', text: 'Ugh, another one? Fine, what do you want? Don\'t make it a dumb question.' }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const stream = await chat.sendMessageStream({ message: input });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (e) {
            console.error(e);
            setError('The API timed out. Probably a skill issue on your end.');
            setMessages(prev => prev.slice(0, -1)); // Remove the empty model message
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, chat]);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <BotIcon className="w-8 h-8 text-accent flex-shrink-0 mt-1" />}
                        <div className={`p-4 rounded-xl max-w-lg ${msg.role === 'user' ? 'bg-accent text-primary font-semibold' : 'bg-secondary'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.role === 'user' && <UserIcon className="w-8 h-8 text-medium flex-shrink-0 mt-1" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-start gap-4">
                            <BotIcon className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                            <div className="p-4 rounded-xl bg-secondary">
                                <Loader text="Actually thinking..." />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {error && <p className="text-red-400 text-center my-2 font-display">{error}</p>}
            <div className="mt-6 flex items-center gap-2 p-2 bg-secondary rounded-lg border border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Spit it out..."
                    className="w-full bg-transparent p-2 text-light placeholder-medium focus:outline-none"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-accent rounded-md text-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};