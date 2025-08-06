
import React, { useState, useCallback } from 'react';
import { Loader } from './Loader';
import { MagicWandIcon } from './icons';

interface TextViewProps<T> {
  title: string;
  description: string;
  inputLabel: string;
  secondInputLabel?: string;
  outputLabel: string;
  actionText: string;
  apiCall: (text1: string, text2?: string) => Promise<T>;
  isTwoInput?: boolean;
  renderOutput?: (data: T) => React.ReactNode;
}

export const TextView = <T extends unknown,>(props: TextViewProps<T>) => {
  const {
    title,
    description,
    inputLabel,
    secondInputLabel,
    outputLabel,
    actionText,
    apiCall,
    isTwoInput = false,
    renderOutput,
  } = props;

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [output, setOutput] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = useCallback(async () => {
    if (!input1.trim() || (isTwoInput && !input2.trim()) || isLoading) return;

    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      const result = await apiCall(input1, isTwoInput ? input2 : undefined);
      setOutput(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred. Probably your fault. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, [input1, input2, isTwoInput, isLoading, apiCall]);
  
  const defaultRenderOutput = (data: T) => (
    <div className="p-4 border border-secondary rounded-lg bg-secondary/30 whitespace-pre-wrap text-light">
      {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-light font-display">{title}</h2>
      <p className="text-medium mb-6">{description}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-medium mb-1 font-display tracking-wider">{inputLabel}</label>
          <textarea
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            rows={isTwoInput ? 5 : 8}
            className="w-full p-3 bg-secondary rounded-lg text-light placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent border border-gray-700"
            placeholder={`Dump your ${inputLabel.toLowerCase()} here...`}
            disabled={isLoading}
          />
        </div>

        {isTwoInput && (
          <div>
            <label className="block text-sm font-medium text-medium mb-1 font-display tracking-wider">{secondInputLabel}</label>
            <textarea
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              rows={5}
              className="w-full p-3 bg-secondary rounded-lg text-light placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent border border-gray-700"
              placeholder={`And the other ${secondInputLabel?.toLowerCase()}...`}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      <div className="my-6 text-center">
        <button
          onClick={handleAction}
          disabled={isLoading || !input1.trim() || (isTwoInput && !input2.trim())}
          className="px-6 py-3 bg-accent rounded-lg text-primary font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed transition-all flex items-center gap-2 mx-auto font-display"
        >
          <MagicWandIcon className="w-5 h-5" />
          {actionText}
        </button>
      </div>

      {isLoading && <Loader />}
      {error && <p className="text-red-500 text-center my-4 font-display">{error}</p>}

      {output && (
        <div>
          <h3 className="text-xl font-semibold mb-2 text-light font-display">{outputLabel}</h3>
          {renderOutput ? renderOutput(output) : defaultRenderOutput(output)}
        </div>
      )}
    </div>
  );
};