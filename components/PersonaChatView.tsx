import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Persona } from '../types';
import { Loader } from './Loader';
import { UserIcon, MicrophoneIcon, SendIcon, SpeakerWaveIcon, SpeakerOffIcon } from './icons';
import * as geminiService from '../services/geminiService';

const personaConfig = {
    [Persona.GigaChadGPT]: { name: 'GigaChadGPT', avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=GigaChadGPT&backgroundColor=a3e635', color: 'bg-lime-400', voiceName: ['Google US English', 'Paul'] },
    [Persona.SaltySteve]: { name: 'SaltySteve', avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=SaltySteve&backgroundColor=06b6d4', color: 'bg-cyan-500', voiceName: ['Google UK English Male', 'Daniel'] },
    [Persona.RageQuitRandy]: { name: 'RageQuitRandy', avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=RageQuitRandy&backgroundColor=ef4444', color: 'bg-red-500', voiceName: ['Microsoft Mark - English (United States)', 'Alex'] },
    [Persona.ToxicTina]: { name: 'ToxicTina', avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=ToxicTina&backgroundColor=d946ef', color: 'bg-fuchsia-500', voiceName: ['Google UK English Female', 'Karen'] },
};

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

export const PersonaChatView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activePersona, setActivePersona] = useState<Persona>(Persona.GigaChadGPT);
    const [isRecording, setIsRecording] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{ role: 'model', text: `I'm GigaChadGPT. Don't waste my time. What do you want?`, persona: Persona.GigaChadGPT }]);
        
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();

        if (!recognition) {
            console.warn("Speech recognition not supported by this browser.");
            return;
        }
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsRecording(false);
        };
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError('Mic not working? Skill issue.');
            setIsRecording(false);
        };
        recognition.onend = () => {
            setIsRecording(false);
        };

    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const speak = useCallback((text: string, persona: Persona) => {
        if (!autoSpeak || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const preferredVoices = personaConfig[persona].voiceName;
        const voice = voices.find(v => preferredVoices.includes(v.name) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
        
        if (voice) {
            utterance.voice = voice;
            utterance.pitch = (persona === Persona.SaltySteve) ? 0.8 : 1.1;
            utterance.rate = (persona === Persona.RageQuitRandy) ? 1.3 : 1;
        }
        window.speechSynthesis.speak(utterance);
    }, [autoSpeak, voices]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const result = await geminiService.getPersonaResponse(input, activePersona);
            const modelMessage: ChatMessage = { role: 'model', text: result.response, persona: activePersona };
            setMessages(prev => [...prev, modelMessage]);
            speak(result.response, activePersona);

            if (result.transfer_to && result.transfer_to !== activePersona) {
                const nextPersona = result.transfer_to;
                let transferText = '';
                switch (nextPersona) {
                    case Persona.SaltySteve: transferText = `GigaChadGPT got bored and pawned you off on SaltySteve...`; break;
                    case Persona.RageQuitRandy: transferText = `SaltySteve is lagging out and sent you to RageQuitRandy...`; break;
                    case Persona.ToxicTina: transferText = `RageQuitRandy ALT-F4'd. You're stuck with ToxicTina now...`; break;
                }
                const systemMessage: ChatMessage = { role: 'system', text: transferText };
                
                setTimeout(() => {
                    setMessages(prev => [...prev, systemMessage]);
                    setActivePersona(nextPersona);
                }, 1000);
            }

        } catch (e) {
            console.error(e);
            setError('The API is probably down. Or maybe you just suck. Try again.');
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, activePersona, speak]);

    const toggleRecording = () => {
        if (!recognition) {
            setError('Your browser is ancient. No voice input for you.');
            return;
        }
        if (isRecording) {
            recognition.stop();
        } else {
            setInput('');
            recognition.start();
        }
        setIsRecording(!isRecording);
    };

    const PersonaAvatar: React.FC<{persona: Persona, className?: string}> = ({ persona, className }) => {
        const config = personaConfig[persona];
        return <img src={config.avatar} alt={`${config.name} avatar`} className={`w-10 h-10 rounded-full flex-shrink-0 mt-1 border-2 ${personaConfig[persona].color.replace('bg-', 'border-')} ${className || ''}`} />;
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4 p-2 border-b-2 border-gray-700">
                <div className="flex items-center gap-3">
                    <PersonaAvatar persona={activePersona}/>
                    <div>
                        <h2 className="text-xl font-bold font-display">{personaConfig[activePersona].name}</h2>
                        <p className="text-sm text-medium">Currently owning you</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-medium font-display">VOICE CHAT</span>
                    <button onClick={() => {
                        setAutoSpeak(!autoSpeak);
                        if(autoSpeak) window.speechSynthesis.cancel();
                    }} className={`p-2 rounded-full transition-colors ${autoSpeak ? 'bg-accent text-primary' : 'bg-secondary text-medium'}`} aria-label={autoSpeak ? 'Disable auto-speaking' : 'Enable auto-speaking'}>
                        {autoSpeak ? <SpeakerWaveIcon className="w-5 h-5"/> : <SpeakerOffIcon className="w-5 h-5"/>}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                {messages.map((msg, index) => {
                    if (msg.role === 'system') {
                        return <div key={index} className="text-center text-sm text-medium italic py-2 font-display tracking-widest">--- {msg.text} ---</div>
                    }
                    const isUser = msg.role === 'user';
                    const persona = msg.persona || activePersona;
                    return (
                        <div key={index} className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
                            {!isUser && <PersonaAvatar persona={persona} />}
                            <div className={`p-4 rounded-xl max-w-lg ${isUser ? 'bg-accent text-primary font-semibold' : `bg-secondary`}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            {isUser && <UserIcon className="w-10 h-10 text-medium flex-shrink-0 mt-1" />}
                        </div>
                    )
                })}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="flex items-start gap-4">
                            <PersonaAvatar persona={activePersona} />
                            <div className="p-4 rounded-xl bg-secondary">
                                <Loader text={`${personaConfig[activePersona].name} is lagging...`} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {error && <p className="text-red-500 text-center my-2 font-display">{error}</p>}
            <div className="mt-6 flex items-center gap-2 p-2 bg-secondary rounded-lg border border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isRecording ? 'Listening, I guess...' : `Spam ${personaConfig[activePersona].name}...`}
                    className="w-full bg-transparent p-2 text-light placeholder-medium focus:outline-none"
                    disabled={isLoading || isRecording}
                />
                 <button
                    onClick={toggleRecording}
                    disabled={!recognition}
                    className={`p-3 rounded-md text-primary transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-accent/70 hover:bg-accent'}`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-accent rounded-md text-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                     aria-label="Send message"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};