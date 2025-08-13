import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Play, Send, Copy, RotateCcw } from 'lucide-react';
import { languages } from '@/data/mockData';
import { Language } from '@/types';

interface CodeEditorProps {
  initialCode?: string;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  onRun?: (code: string, language: Language) => void;
  onSubmit?: (code: string, language: Language) => void;
  showSubmit?: boolean;
  readOnly?: boolean;
  className?: string;
}

export default function CodeEditor({
  initialCode = '',
  language = 'javascript',
  onLanguageChange,
  onRun,
  onSubmit,
  showSubmit = false,
  readOnly = false,
  className
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (value: Language) => {
    setSelectedLanguage(value);
    onLanguageChange?.(value);
  };

  const handleRun = async () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setOutput(`// Running ${selectedLanguage} code...\n// Output:\nHello, World!\n// Execution completed in 0.123s`);
      setIsRunning(false);
      onRun?.(code, selectedLanguage);
    }, 1500);
  };

  const handleSubmit = () => {
    onSubmit?.(code, selectedLanguage);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
  };

  const getLanguageTemplate = (lang: Language) => {
    const templates = {
      javascript: '// JavaScript\nfunction solution() {\n    // Your code here\n    return result;\n}',
      python: '# Python\ndef solution():\n    # Your code here\n    return result',
      java: '// Java\npublic class Solution {\n    public int solution() {\n        // Your code here\n        return result;\n    }\n}',
      cpp: '// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
      c: '// C\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}',
      go: '// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n}',
      rust: '// Rust\nfn main() {\n    // Your code here\n}'
    };
    return templates[lang] || templates.javascript;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-4">
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRun}
            disabled={isRunning || readOnly}
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          
          {showSubmit && (
            <Button variant="hero" onClick={handleSubmit} disabled={readOnly}>
              <Send className="h-4 w-4" />
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <Card>
        <CardContent className="p-0">
          <Textarea
            value={code || getLanguageTemplate(selectedLanguage)}
            onChange={(e) => setCode(e.target.value)}
            placeholder={getLanguageTemplate(selectedLanguage)}
            className="min-h-[400px] font-mono text-sm border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Output */}
      {output && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-medium">Output</h3>
          </CardHeader>
          <CardContent>
            <pre className="text-sm font-mono whitespace-pre-wrap text-muted-foreground bg-muted/50 p-3 rounded">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}