import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Play, Send, Copy, RotateCcw } from 'lucide-react';
import { languages } from '@/data/mockData';
import { Language } from '@/types';
import { runCode, submitSolution } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  problemId?: number;
  initialCode?: string;
  initialInput?: string;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  onRun?: (code: string, language: Language) => void;
  onSubmit?: (code: string, language: Language) => void;
  showSubmit?: boolean;
  readOnly?: boolean;
  className?: string;
}

export default function CodeEditor({
  problemId,
  initialCode = '',
  initialInput = '',
  language = 'javascript',
  onLanguageChange,
  onRun,
  onSubmit,
  showSubmit = false,
  readOnly = false,
  className
}: CodeEditorProps) {
  const { toast } = useToast();
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageChange = (value: Language) => {
    setSelectedLanguage(value);
    onLanguageChange?.(value);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    try {
      const response = await runCode({
        code: code,
        language: selectedLanguage,
        input: input
      });
      
      setOutput(response.output);
      onRun?.(code, selectedLanguage);
    } catch (error) {
      setOutput('Error: Failed to execute code. Please try again.');
      console.error('Code execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problemId) {
      toast({
        title: "Error",
        description: "No problem ID provided",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitSolution({
        problem_id: problemId,
        code: code,
        language: selectedLanguage
      });
      
      // Show detailed submission result
      let description = `Status: ${response.status}`;
      if (response.runtime !== undefined && response.runtime !== null) {
        description += `
Runtime: ${response.runtime.toFixed(3)}s`;
      }
      if (response.memory !== undefined && response.memory !== null) {
        description += `
Memory: ${response.memory.toFixed(2)}MB`;
      }
      
      // Add test case details if available
      if (response.test_results && response.test_results.length > 0) {
        const firstFailedTest = response.test_results.find((test: any) => !test.passed);
        if (firstFailedTest) {
          description += `

Failed on test case:`;
          description += `
Input: ${firstFailedTest.input.substring(0, 50)}${firstFailedTest.input.length > 50 ? '...' : ''}`;
          description += `
Expected: ${firstFailedTest.expected_output.substring(0, 50)}${firstFailedTest.expected_output.length > 50 ? '...' : ''}`;
          if (firstFailedTest.actual_output) {
            description += `
Actual: ${firstFailedTest.actual_output.substring(0, 50)}${firstFailedTest.actual_output.length > 50 ? '...' : ''}`;
          }
          if (firstFailedTest.error) {
            description += `
Error: ${firstFailedTest.error}`;
          }
        } else {
          description += `

All test cases passed!`;
        }
      }
      
      toast({
        title: "Solution Evaluation Complete",
        description: description,
      });
      
      onSubmit?.(code, selectedLanguage);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleReset = () => {
    setCode(initialCode);
    setInput('');
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
            <Button 
              variant="hero" 
              onClick={handleSubmit} 
              disabled={readOnly || isSubmitting || !problemId}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit'}
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
            className="min-h-[300px] font-mono text-sm border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Input Panel */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-medium">Input</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input for your program (optional)"
            className="min-h-[100px] font-mono text-sm"
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
            <pre className="text-sm font-mono whitespace-pre-wrap text-muted-foreground bg-muted/50 p-3 rounded max-h-60 overflow-y-auto">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}