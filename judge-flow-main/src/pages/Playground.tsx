import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Save, Share, Download, FileText, Upload } from 'lucide-react';
import CodeEditor from '@/components/common/CodeEditor';
import { Language } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Playground() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [savedSnippets, setSavedSnippets] = useState<Array<{
    id: string;
    name: string;
    language: Language;
    code: string;
    createdAt: Date;
  }>>([
    {
      id: '1',
      name: 'Quick Sort Implementation',
      language: 'javascript',
      code: 'function quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  // Implementation here\n}',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2', 
      name: 'Binary Search Tree',
      language: 'python',
      code: 'class TreeNode:\n    def __init__(self, val=0):\n        self.val = val\n        # Implementation here',
      createdAt: new Date('2024-01-14')
    }
  ]);

  const handleRun = (code: string, language: Language) => {
    toast({
      title: "Code executed",
      description: `Your ${language} code ran successfully in the playground!`,
    });
  };

  const handleSave = (code: string, language: Language) => {
    const newSnippet = {
      id: Date.now().toString(),
      name: `Snippet ${savedSnippets.length + 1}`,
      language,
      code,
      createdAt: new Date()
    };
    setSavedSnippets(prev => [newSnippet, ...prev]);
    toast({
      title: "Code saved",
      description: "Your code snippet has been saved to your collection.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share link copied",
      description: "The playground link has been copied to your clipboard.",
    });
  };

  const handleDownload = () => {
    // Get the current code from the editor
    const code = (document.querySelector('textarea') as HTMLTextAreaElement)?.value || '';
    const language = selectedLanguage;
    
    // Create a blob with the code
    const blob = new Blob([code], { type: 'text/plain' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playground-${new Date().toISOString().slice(0, 10)}.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: "Code downloaded",
      description: "Your code has been downloaded as a file.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        // Load the content into the editor
        const textarea = document.querySelector('textarea');
        if (textarea) {
          (textarea as HTMLTextAreaElement).value = content;
          // Trigger a change event to update the state
          const changeEvent = new Event('input', { bubbles: true });
          textarea.dispatchEvent(changeEvent);
        }
        
        // Try to guess the language from the file extension
        const fileName = file.name;
        const extension = fileName.split('.').pop()?.toLowerCase();
        const languageMap: Record<string, Language> = {
          'js': 'javascript',
          'py': 'python',
          'java': 'java',
          'cpp': 'cpp',
          'c': 'c',
          'go': 'go',
          'rs': 'rust'
        };
        const language = extension ? languageMap[extension] || 'javascript' : 'javascript';
        setSelectedLanguage(language);
        
        toast({
          title: "Snippet imported",
          description: `Successfully imported ${fileName}`,
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be imported again
    event.target.value = '';
  };

  const getFileExtension = (language: Language) => {
    const extensions: Record<Language, string> = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rust: 'rs'
    };
    return extensions[language] || 'txt';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Code Playground
            </h1>
            <p className="text-muted-foreground">
              Experiment, test, and prototype your code in a distraction-free environment.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('import-snippet')?.click()}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <input
              id="import-snippet"
              type="file"
              accept=".js,.py,.java,.cpp,.c,.go,.rs,.txt"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Code Editor
                </CardTitle>
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => {
                    // Get the current code from the editor
                    const code = (document.querySelector('textarea') as HTMLTextAreaElement)?.value || '';
                    handleSave(code, selectedLanguage);
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save Snippet
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-full pb-6">
              <CodeEditor
                language={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                onRun={handleRun}
                className="h-full"
                initialCode={`// Welcome to JudgeFlow Playground!
// Start coding here...

function helloWorld() {
  console.log("Hello, World!");
  return "Ready to code!";
}

helloWorld();`}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Saved Snippets */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Saved Snippets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recent" className="space-y-3 mt-4">
                  {savedSnippets.map(snippet => (
                    <div 
                      key={snippet.id}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-smooth"
                      onClick={() => {
                        // Load the snippet into the editor
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          (textarea as HTMLTextAreaElement).value = snippet.code;
                          // Trigger a change event to update the state
                          const event = new Event('input', { bubbles: true });
                          textarea.dispatchEvent(event);
                        }
                        // Set the language
                        setSelectedLanguage(snippet.language);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium truncate">
                          {snippet.name}
                        </h4>
                        <span className="text-xs text-muted-foreground capitalize">
                          {snippet.language}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {snippet.createdAt.toLocaleDateString()}
                      </p>
                      <code className="text-xs bg-muted/50 p-2 rounded block truncate">
                        {snippet.code.split('\n')[0]}
                      </code>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="favorites" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No favorites yet</p>
                    <p className="text-xs">Star snippets to see them here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Clear the editor and load the template
                  const textarea = document.querySelector('textarea');
                  if (textarea) {
                    // Import the getLanguageTemplate function from CodeEditor
                    const template = `// Welcome to JudgeFlow Playground!
// Start coding here...

function helloWorld() {
  console.log("Hello, World!");
  return "Ready to code!";
}

helloWorld();`;
                    (textarea as HTMLTextAreaElement).value = template;
                    // Trigger a change event to update the state
                    const event = new Event('input', { bubbles: true });
                    textarea.dispatchEvent(event);
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                New Snippet
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share className="h-4 w-4 mr-2" />
                Share Session
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-blue-900">
                <h3 className="font-semibold text-sm mb-2">💡 Pro Tip</h3>
                <p className="text-xs text-blue-700">
                  Use Ctrl+Space for autocomplete and Ctrl+/ to toggle comments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}