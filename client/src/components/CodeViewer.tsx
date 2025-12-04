import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, FileCode, ChevronDown, ChevronRight } from "lucide-react";
import { getSourceCodeForStep } from "@/lib/sourceCodeMap";
import { sourceCodeData } from "@/lib/sourceCodeData";
import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/themes/prism-tomorrow.css";

interface CodeViewerProps {
  currentStep: number;
}

export default function CodeViewer({ currentStep }: CodeViewerProps) {
  const [sourceCode, setSourceCode] = useState<Record<string, string>>({});
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const stepInfo = getSourceCodeForStep(currentStep);

  useEffect(() => {
    if (!stepInfo) return;

    // Load source code from embedded data
    setLoading(true);
    const newSourceCode: Record<string, string> = {};

    for (const file of stepInfo.files) {
      if (sourceCodeData[file.path]) {
        newSourceCode[file.path] = sourceCodeData[file.path];
      } else {
        newSourceCode[file.path] = `// Source code not available for ${file.displayName}\n// This file will be added in a future update.`;
      }
    }

    setSourceCode(newSourceCode);
    setLoading(false);

    // Auto-expand the first file
    if (stepInfo.files.length > 0) {
      setExpandedFiles(new Set([stepInfo.files[0].path]));
    }
  }, [currentStep, stepInfo]);

  const toggleFile = (path: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFiles(newExpanded);
  };

  if (!stepInfo) {
    return (
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Source Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No source code available for this step
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-600" />
          Source Code: {stepInfo.stepName}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Step {currentStep} - View the actual C implementation
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading source code...</p>
          </div>
        ) : (
          stepInfo.files.map((file) => (
            <div key={file.path} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* File Header */}
              <button
                onClick={() => toggleFile(file.path)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {expandedFiles.has(file.path) ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span className="font-mono text-sm font-semibold text-black">
                    {file.displayName}
                  </span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  {file.functions.length} function{file.functions.length !== 1 ? 's' : ''}
                </Badge>
              </button>

              {/* File Description */}
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
                <p className="text-xs text-blue-800">{file.description}</p>
              </div>

              {/* Functions List */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {file.functions.map((func) => (
                    <Badge key={func} variant="secondary" className="text-xs font-mono">
                      {func}()
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Source Code */}
              {expandedFiles.has(file.path) && (
                <div className="border-t border-gray-200">
                  <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-96 overflow-y-auto">
                    <code 
                      className="language-c"
                      dangerouslySetInnerHTML={{
                        __html: sourceCode[file.path] 
                          ? Prism.highlight(sourceCode[file.path], Prism.languages.c, 'c')
                          : '// Loading...'
                      }}
                    />
                  </pre>
                </div>
              )}
            </div>
          ))
        )}

        {/* Expand/Collapse All */}
        {stepInfo.files.length > 1 && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedFiles(new Set(stepInfo.files.map(f => f.path)))}
              className="flex-1"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedFiles(new Set())}
              className="flex-1"
            >
              Collapse All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
