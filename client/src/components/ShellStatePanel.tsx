import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Terminal, Folder, FileText, Cpu, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { ShellState } from "@/lib/shellState";
import { cn } from "@/lib/utils";

interface ShellStatePanelProps {
  state: ShellState;
  onEnvVarChange?: (vars: Record<string, string>) => void;
}

const SYSTEM_VARS = ["USER", "HOME", "PATH", "PWD", "SHELL"];

export default function ShellStatePanel({ state, onEnvVarChange }: ShellStatePanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["env", "cwd", "exit", "fds", "processes"])
  );
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (section: string) => expandedSections.has(section);

  const handleEditStart = (key: string, value: string) => {
    setEditingVar(key);
    setEditValue(value);
  };

  const handleEditSave = (key: string) => {
    if (onEnvVarChange && editValue.trim()) {
      const newVars = { ...state.environmentVars, [key]: editValue };
      onEnvVarChange(newVars);
    }
    setEditingVar(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingVar(null);
    setEditValue("");
  };

  const handleDelete = (key: string) => {
    if (onEnvVarChange && !SYSTEM_VARS.includes(key)) {
      const newVars = { ...state.environmentVars };
      delete newVars[key];
      onEnvVarChange(newVars);
    }
  };

  const handleAddNew = () => {
    if (onEnvVarChange && newVarKey.trim() && newVarValue.trim()) {
      const newVars = { ...state.environmentVars, [newVarKey.trim()]: newVarValue.trim() };
      onEnvVarChange(newVars);
      setNewVarKey("");
      setNewVarValue("");
      setIsAddingNew(false);
    }
  };

  const handleAddCancel = () => {
    setNewVarKey("");
    setNewVarValue("");
    setIsAddingNew(false);
  };

  return (
    <Card className="p-6 bg-card border-border h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-primary">Shell State</h2>
      </div>

      <div className="space-y-3 text-sm">
        {/* Environment Variables */}
        <div className="border border-border rounded overflow-hidden">
          <button
            onClick={() => toggleSection("env")}
            className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isExpanded("env") ? (
                <ChevronDown className="h-4 w-4 text-accent" />
              ) : (
                <ChevronRight className="h-4 w-4 text-accent" />
              )}
              <FileText className="h-4 w-4 text-accent" />
              <span className="font-bold text-foreground">Environment Variables</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Object.keys(state.environmentVars).length} vars
            </span>
          </button>
          {isExpanded("env") && (
            <div className="p-3 space-y-2 bg-card">
              {Object.entries(state.environmentVars).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-xs group">
                  {editingVar === key ? (
                    // Edit mode
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-mono text-primary font-bold min-w-[80px]">
                        {key}
                      </span>
                      <span className="text-muted-foreground">=</span>
                      <Input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 h-7 text-xs font-mono"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(key);
                          if (e.key === "Escape") handleEditCancel();
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditSave(key)}
                      >
                        <Check className="h-3 w-3 text-primary" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={handleEditCancel}
                      >
                        <X className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <span className="font-mono text-primary font-bold min-w-[80px]">
                        {key}
                      </span>
                      <span className="text-muted-foreground">=</span>
                      <span className="font-mono text-foreground break-all flex-1">
                        {value}
                      </span>
                      {onEnvVarChange && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditStart(key, value)}
                          >
                            <Edit2 className="h-3 w-3 text-accent" />
                          </Button>
                          {!SYSTEM_VARS.includes(key) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDelete(key)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* Add New Variable */}
              {onEnvVarChange && (
                <div className="pt-2 border-t border-border">
                  {isAddingNew ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="KEY"
                          value={newVarKey}
                          onChange={(e) => setNewVarKey(e.target.value)}
                          className="h-7 text-xs font-mono flex-1"
                          autoFocus
                        />
                        <span className="text-muted-foreground">=</span>
                        <Input
                          type="text"
                          placeholder="value"
                          value={newVarValue}
                          onChange={(e) => setNewVarValue(e.target.value)}
                          className="h-7 text-xs font-mono flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddNew();
                            if (e.key === "Escape") handleAddCancel();
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs flex-1"
                          onClick={handleAddNew}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs flex-1"
                          onClick={handleAddCancel}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-7 text-xs"
                      onClick={() => setIsAddingNew(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Variable
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Working Directory */}
        <div className="border border-border rounded overflow-hidden">
          <button
            onClick={() => toggleSection("cwd")}
            className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isExpanded("cwd") ? (
                <ChevronDown className="h-4 w-4 text-accent" />
              ) : (
                <ChevronRight className="h-4 w-4 text-accent" />
              )}
              <Folder className="h-4 w-4 text-accent" />
              <span className="font-bold text-foreground">Current Directory</span>
            </div>
          </button>
          {isExpanded("cwd") && (
            <div className="p-3 bg-card">
              <code className="text-xs text-foreground font-mono">
                {state.currentWorkingDirectory}
              </code>
            </div>
          )}
        </div>

        {/* Exit Status */}
        <div className="border border-border rounded overflow-hidden">
          <button
            onClick={() => toggleSection("exit")}
            className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isExpanded("exit") ? (
                <ChevronDown className="h-4 w-4 text-accent" />
              ) : (
                <ChevronRight className="h-4 w-4 text-accent" />
              )}
              <Terminal className="h-4 w-4 text-accent" />
              <span className="font-bold text-foreground">Exit Status ($?)</span>
            </div>
          </button>
          {isExpanded("exit") && (
            <div className="p-3 bg-card">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-2xl font-bold font-mono",
                    state.exitStatus === 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  {state.exitStatus}
                </span>
                <span className="text-xs text-muted-foreground">
                  {state.exitStatus === 0 ? "(Success)" : "(Error)"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* File Descriptors */}
        <div className="border border-border rounded overflow-hidden">
          <button
            onClick={() => toggleSection("fds")}
            className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isExpanded("fds") ? (
                <ChevronDown className="h-4 w-4 text-accent" />
              ) : (
                <ChevronRight className="h-4 w-4 text-accent" />
              )}
              <FileText className="h-4 w-4 text-accent" />
              <span className="font-bold text-foreground">File Descriptors</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {state.fileDescriptors.filter((fd) => fd.status === "open").length} open
            </span>
          </button>
          {isExpanded("fds") && (
            <div className="p-3 space-y-2 bg-card">
              {state.fileDescriptors.map((fd, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded",
                    fd.status === "open" ? "bg-primary/10" : "bg-muted opacity-50"
                  )}
                >
                  <span className="font-mono font-bold text-primary min-w-[30px]">
                    FD {fd.fd}
                  </span>
                  <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-[10px] font-bold">
                    {fd.type.toUpperCase()}
                  </span>
                  {fd.target && (
                    <span className="text-muted-foreground font-mono text-[10px]">
                      → {fd.target}
                    </span>
                  )}
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-bold",
                      fd.status === "open" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {fd.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processes */}
        <div className="border border-border rounded overflow-hidden">
          <button
            onClick={() => toggleSection("processes")}
            className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isExpanded("processes") ? (
                <ChevronDown className="h-4 w-4 text-accent" />
              ) : (
                <ChevronRight className="h-4 w-4 text-accent" />
              )}
              <Cpu className="h-4 w-4 text-accent" />
              <span className="font-bold text-foreground">Processes</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {state.processes.length} total
            </span>
          </button>
          {isExpanded("processes") && (
            <div className="p-3 space-y-2 bg-card">
              {state.processes.map((proc, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded",
                    proc.type === "parent" ? "bg-primary/10" : "bg-accent/10"
                  )}
                >
                  <span className="font-mono font-bold text-primary min-w-[60px]">
                    PID {proc.pid}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      proc.type === "parent"
                        ? "bg-primary/20 text-primary"
                        : "bg-accent/20 text-accent"
                    )}
                  >
                    {proc.type.toUpperCase()}
                  </span>
                  {proc.command && (
                    <span className="text-foreground font-mono text-[10px]">
                      {proc.command}
                    </span>
                  )}
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-bold",
                      proc.status === "running"
                        ? "text-primary"
                        : proc.status === "waiting"
                        ? "text-accent"
                        : "text-muted-foreground"
                    )}
                  >
                    {proc.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heredoc Files */}
        {state.heredocFiles.length > 0 && (
          <div className="border border-border rounded overflow-hidden">
            <div className="p-3 bg-muted">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                <span className="font-bold text-foreground text-xs">Heredoc Temp Files</span>
              </div>
            </div>
            <div className="p-3 space-y-1 bg-card">
              {state.heredocFiles.map((file, idx) => (
                <div key={idx} className="text-xs font-mono text-foreground">
                  {file}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
