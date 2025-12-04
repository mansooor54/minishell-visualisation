export interface ParsedCommand {
  raw: string;
  isValid: boolean;
  error?: string;
  commands: CommandSegment[];
  hasRedirection: boolean;
  hasPipes: boolean;
  hasHeredoc: boolean;
}

export interface CommandSegment {
  name: string;
  args: string[];
  isBuiltIn: boolean;
  redirections: Redirection[];
}

export interface Redirection {
  type: '<' | '>' | '>>' | '<<';
  target: string;
}

const BUILTIN_COMMANDS = ['cd', 'echo', 'pwd', 'export', 'unset', 'env', 'exit'];

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return {
      raw: input,
      isValid: false,
      error: 'Empty command',
      commands: [],
      hasRedirection: false,
      hasPipes: false,
      hasHeredoc: false,
    };
  }

  // Check for unclosed quotes
  const quoteError = checkUnclosedQuotes(trimmed);
  if (quoteError) {
    return {
      raw: input,
      isValid: false,
      error: quoteError,
      commands: [],
      hasRedirection: false,
      hasPipes: false,
      hasHeredoc: false,
    };
  }

  // Split by pipes
  const pipeSegments = splitByPipes(trimmed);
  const commands: CommandSegment[] = [];
  let hasRedirection = false;
  let hasHeredoc = false;

  for (const segment of pipeSegments) {
    const cmd = parseCommandSegment(segment);
    commands.push(cmd);
    
    if (cmd.redirections.length > 0) {
      hasRedirection = true;
      if (cmd.redirections.some(r => r.type === '<<')) {
        hasHeredoc = true;
      }
    }
  }

  return {
    raw: input,
    isValid: true,
    commands,
    hasRedirection,
    hasPipes: pipeSegments.length > 1,
    hasHeredoc,
  };
}

function checkUnclosedQuotes(input: string): string | null {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    }
  }

  if (inSingleQuote) {
    return "Unclosed single quote (')";
  }
  if (inDoubleQuote) {
    return 'Unclosed double quote (")';
  }

  return null;
}

function splitByPipes(input: string): string[] {
  const segments: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += char;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
    } else if (char === '|' && !inSingleQuote && !inDoubleQuote) {
      segments.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    segments.push(current.trim());
  }

  return segments;
}

function parseCommandSegment(segment: string): CommandSegment {
  const redirections: Redirection[] = [];
  let cleanSegment = segment;

  // Extract redirections
  const redirMatches = segment.match(/(<<|>>|<|>)\s*(\S+)/g);
  if (redirMatches) {
    for (const match of redirMatches) {
      const parts = match.match(/(<<|>>|<|>)\s*(\S+)/);
      if (parts) {
        redirections.push({
          type: parts[1] as '<' | '>' | '>>' | '<<',
          target: parts[2],
        });
        // Remove redirection from segment
        cleanSegment = cleanSegment.replace(match, '');
      }
    }
  }

  // Parse command and arguments
  const tokens = tokenize(cleanSegment.trim());
  const name = tokens[0] || '';
  const args = tokens.slice(1);

  return {
    name,
    args,
    isBuiltIn: BUILTIN_COMMANDS.includes(name.toLowerCase()),
    redirections,
  };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += char;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
    } else if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

export function getCommandDescription(cmd: CommandSegment): string {
  if (cmd.isBuiltIn) {
    const descriptions: Record<string, string> = {
      cd: 'Change directory - modifies the current working directory',
      echo: 'Display text - prints arguments to standard output',
      pwd: 'Print working directory - shows current directory path',
      export: 'Set environment variable - adds or modifies environment variables',
      unset: 'Unset environment variable - removes environment variables',
      env: 'Display environment - shows all environment variables',
      exit: 'Exit shell - terminates the shell process',
    };
    return descriptions[cmd.name.toLowerCase()] || 'Built-in command';
  }
  return `External command - will be executed via fork() and execve()`;
}
