import React, { useState, useEffect, useRef } from 'react';

interface TerminalProps {
  onCommand: (command: string) => string;
  prompt: string;
}

interface HistoryItem {
  command: string;
  output: string;
  timestamp: Date;
}

export const Terminal: React.FC<TerminalProps> = ({ onCommand, prompt }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show welcome message
    const welcomeOutput = `
╔════════════════════════════════════════════════════════════════════╗
║                        RELAXED CONSTRAINTS                         ║
╚════════════════════════════════════════════════════════════════════╝

In economics, we often alter/ignore certain constraints temporarily to 
help us reach understanding before reintroducing complexity.
Using this same principle, I hope to provide my readers with engaging content 
that provides clarity without sacrificing substance. 

Navigate using Unix-style commands.

Available categories:
  market_research     - Stocks I find interesting
  economic_indicators - Macro commentary and analysis
  bookshelf           - What I'm reading

Type 'help' for all commands, 'ls' to browse, 'tree' for full structure.
Use 'cd <category>' to enter a category and switch to web interface.

`;
    setHistory([{
      command: '',
      output: welcomeOutput,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [history]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCommand.trim()) return;

    const output = onCommand(currentCommand);
    
    if (output === 'CLEAR') {
      setHistory([]);
    } else {
      const newHistoryItem: HistoryItem = {
        command: currentCommand,
        output,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, newHistoryItem]);
    }

    // Update command history
    setCommandHistory(prev => [currentCommand, ...prev.slice(0, 49)]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      ref={terminalRef}
      className="h-screen p-6 overflow-y-auto cursor-text"
      onClick={handleClick}
    >
      <div className="max-w-4xl mx-auto">
        {/* Terminal History */}
        {history.map((item, index) => (
          <div key={index} className="mb-4">
            {item.command && (
              <div className="flex items-center mb-1">
                <span className="text-green-300">{prompt} </span>
                <span className="ml-2 text-green-100">{item.command}</span>
              </div>
            )}
            {item.output && (
              <pre className="text-green-400 whitespace-pre-wrap leading-relaxed mb-2">
                {item.output}
              </pre>
            )}
          </div>
        ))}

        {/* Current Command Input */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-300">{prompt} </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-100 ml-2 outline-none caret-green-400"
            autoComplete="off"
            spellCheck="false"
          />
          <span className="text-green-400 animate-pulse ml-1">█</span>
        </form>
      </div>
    </div>
  );
};