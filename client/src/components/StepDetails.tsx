import { ParsedCommand } from "@/lib/commandParser";
import { Card } from "@/components/ui/card";
import { flowStepsV021 } from "@/lib/flowStepsV021";

interface StepDetailsProps {
  currentStep: number;
  userCommand: ParsedCommand | null;
}

interface StepInfo {
  title: string;
  description: string;
  module: string;
  file: string;
  code: string;
  example?: string;
}

const stepInfo: Record<number, StepInfo> = {
  0: {
    title: "START: main()",
    description: "Entry point: Initialize shell, setup signals, terminal, and history",
    module: "src/",
    file: "main.c",
    code: `int main(int argc, char **argv, char **envp)
{
    (void)argc;
    (void)argv;
    write(1, "\\033[2J\\033[H", 7);
    print_logo();
    init_shell(&g_shell, envp);
    setup_signals();
    init_terminal();
    history_init(&g_shell);
    shell_loop(&g_shell);
    history_save(&g_shell);
    rl_clear_history();
    free_env(g_shell.env);
    free(g_shell.history_path);
    return (g_shell.exit_status);
}`,
    example: "$ ./minishell",
  },
  1: {
    title: "init_shell()",
    description: "Initialize shell structure with environment variables",
    module: "src/core/",
    file: "shell_utils.c",
    code: `void init_shell(t_shell *shell, char **envp)
{
    shell->env = copy_env(envp);
    shell->exit_status = 0;
    shell->should_exit = 0;
    shell->history_path = NULL;
}`,
    example: "Copies environment variables to shell structure",
  },
  2: {
    title: "setup_signals()",
    description: "Configure signal handlers for SIGINT and SIGQUIT",
    module: "src/signals/",
    file: "signals.c",
    code: `void setup_signals(void)
{
    signal(SIGINT, handle_sigint);
    signal(SIGQUIT, SIG_IGN);
}`,
    example: "Ctrl+C handled, Ctrl+\\ ignored",
  },
  3: {
    title: "init_terminal()",
    description: "Disable ECHOCTL to prevent ^C display (bash-like behavior)",
    module: "src/core/",
    file: "shell_utils.c",
    code: `void init_terminal(void)
{
    struct termios term;
    
    tcgetattr(STDIN_FILENO, &term);
    term.c_lflag &= ~ECHOCTL;
    tcsetattr(STDIN_FILENO, TCSANOW, &term);
}`,
    example: "Pressing Ctrl+C won't show ^C",
  },
  4: {
    title: "shell_loop()",
    description: "Main REPL loop: Read, Evaluate, Print, Loop",
    module: "src/core/",
    file: "shell_loop.c",
    code: `void shell_loop(t_shell *shell)
{
    char *line;
    int status;
    
    while (!shell->should_exit)
    {
        line = read_logical_line();
        status = handle_empty_line(line, shell);
        if (status == 0)
            break;
        if (status == 1)
            continue;
        if (*line && !is_all_space(line))
        {
            history_add_line(line);
            process_line(line, shell);
        }
        free(line);
    }
    history_save(shell);
}`,
    example: "Continuously reads and processes commands",
  },
  5: {
    title: "read_logical_line()",
    description: "Read user input using readline library",
    module: "src/core/",
    file: "read_logical_line.c",
    code: `char *read_logical_line(void)
{
    char *line;
    
    line = readline("minishell> ");
    return (line);
}`,
    example: "minishell> cat file.txt | grep text",
  },
  6: {
    title: "Empty line check",
    description: "Check if line is empty or all whitespace",
    module: "src/core/",
    file: "shell_loop.c",
    code: `static int handle_empty_line(char *line, t_shell *shell)
{
    if (!line)
    {
        if (shell->exit_status == 130)
            return (1);
        ft_putendl_fd("exit", 1);
        return (0);
    }
    return (2);
}`,
    example: "Empty line → reprompt, EOF → exit",
  },
  7: {
    title: "history_add_line()",
    description: "Add non-empty line to command history",
    module: "src/history/",
    file: "history.c",
    code: `void history_add_line(char *line)
{
    if (line && *line)
        add_history(line);
}`,
    example: "Stores command for up/down arrow navigation",
  },
  8: {
    title: "process_line()",
    description: "Process the input line: tokenize, parse, expand, execute",
    module: "src/core/",
    file: "shell_utils.c",
    code: `void process_line(char *line, t_shell *shell)
{
    t_pipeline *pipeline;
    
    if (!line || !*line)
        return;
    if (!process_tokens(line, &pipeline))
        return;
    expander(pipeline, shell->env);
    executor(pipeline, shell);
    free_pipeline(pipeline);
}`,
    example: "Orchestrates tokenization → parsing → expansion → execution",
  },
  9: {
    title: "check_unclosed_quotes()",
    description: "Validate quote pairing before tokenization",
    module: "src/lexer/",
    file: "lexer_quotes.c",
    code: `static int check_unclosed_quotes(char *line)
{
    if (has_unclosed_quotes(line))
    {
        ft_putendl_fd("minishell: syntax error: unclosed quotes", 2);
        return (0);
    }
    return (1);
}`,
    example: 'echo "hello → syntax error',
  },
  10: {
    title: "lexer()",
    description: "Tokenize input into tokens (words, operators, redirections)",
    module: "src/lexer/",
    file: "lexer.c",
    code: `t_token *lexer(char *line)
{
    t_token *tokens;
    
    tokens = tokenize(line);
    return (tokens);
}`,
    example: "cat file.txt → [cat] [file.txt]",
  },
  11: {
    title: "validate_syntax()",
    description: "Check for syntax errors (unclosed quotes, invalid operators)",
    module: "src/parser/",
    file: "parser_syntax.c",
    code: `int validate_syntax(t_token *tokens, t_shell *shell)
{
    if (check_syntax_errors(tokens))
    {
        shell->exit_status = 258;
        return (0);
    }
    return (1);
}`,
    example: "; → syntax error near unexpected token",
  },
  12: {
    title: "parser()",
    description: "Build pipeline structure from tokens",
    module: "src/parser/",
    file: "parser.c",
    code: `t_pipeline *parser(t_token *tokens)
{
    t_pipeline *pipeline;
    
    pipeline = build_pipeline(tokens);
    return (pipeline);
}`,
    example: "Creates command pipeline with pipes and redirections",
  },
  13: {
    title: "expander()",
    description: "Expand variables ($VAR, $?), remove quotes, handle wildcards",
    module: "src/expander/",
    file: "expander.c",
    code: `void expander(t_pipeline *pipeline, char **env)
{
    expand_variables(pipeline, env);
    expand_wildcards(pipeline);
    remove_quotes(pipeline);
}`,
    example: "$HOME → /home/mansoor",
  },
  14: {
    title: "executor()",
    description: "Execute the pipeline: setup pipes, fork processes, run commands",
    module: "src/executor/",
    file: "executor.c",
    code: `void executor(t_pipeline *pipeline, t_shell *shell)
{
    setup_pipeline(pipeline);
    execute_pipeline(pipeline, shell);
    cleanup_pipeline(pipeline);
}`,
    example: "Runs commands with proper I/O redirection",
  },
  15: {
    title: "Is built-in?",
    description: "Check if command is a shell built-in (cd, echo, export, etc.)",
    module: "src/executor/",
    file: "executor_commands.c",
    code: `int is_builtin(char *cmd)
{
    if (!ft_strcmp(cmd, "cd"))
        return (1);
    if (!ft_strcmp(cmd, "echo"))
        return (1);
    if (!ft_strcmp(cmd, "export"))
        return (1);
    if (!ft_strcmp(cmd, "unset"))
        return (1);
    if (!ft_strcmp(cmd, "env"))
        return (1);
    if (!ft_strcmp(cmd, "exit"))
        return (1);
    return (0);
}`,
    example: "cd, echo, export, unset, env, exit, pwd",
  },
  16: {
    title: "execute_builtin()",
    description: "Execute built-in command in parent process",
    module: "src/builtins/",
    file: "builtins.c",
    code: `int execute_builtin(t_cmd *cmd, t_shell *shell)
{
    if (!ft_strcmp(cmd->argv[0], "cd"))
        return (builtin_cd(cmd, shell));
    if (!ft_strcmp(cmd->argv[0], "echo"))
        return (builtin_echo(cmd));
    if (!ft_strcmp(cmd->argv[0], "export"))
        return (builtin_export(cmd, shell));
    if (!ft_strcmp(cmd->argv[0], "unset"))
        return (builtin_unset(cmd, shell));
    if (!ft_strcmp(cmd->argv[0], "env"))
        return (builtin_env(shell));
    if (!ft_strcmp(cmd->argv[0], "exit"))
        return (builtin_exit(cmd, shell));
    return (0);
}`,
    example: "Built-ins run in parent to modify shell state",
  },
  17: {
    title: "execute_external()",
    description: "Fork child process and execute external command via execve()",
    module: "src/executor/",
    file: "executor_external.c",
    code: `void execute_external(t_cmd *cmd, t_shell *shell)
{
    pid_t pid;
    char *path;
    
    pid = fork();
    if (pid == 0)
    {
        path = find_command_path(cmd->argv[0], shell->env);
        execve(path, cmd->argv, shell->env);
        exit(127);
    }
}`,
    example: "ls, cat, grep → fork + execve",
  },
  18: {
    title: "wait_pipeline()",
    description: "Wait for all child processes to complete",
    module: "src/executor/",
    file: "executor_pipeline.c",
    code: `void wait_pipeline(t_pipeline *pipeline, t_shell *shell)
{
    int status;
    pid_t pid;
    
    while ((pid = wait(&status)) > 0)
    {
        if (WIFEXITED(status))
            shell->exit_status = WEXITSTATUS(status);
    }
}`,
    example: "Collects exit status from child processes",
  },
  19: {
    title: "free_pipeline()",
    description: "Free all allocated memory for pipeline structure",
    module: "src/parser/",
    file: "parser_free.c",
    code: `void free_pipeline(t_pipeline *pipeline)
{
    free_commands(pipeline->commands);
    free_redirections(pipeline->redirections);
    free(pipeline);
}`,
    example: "Prevents memory leaks",
  },
  20: {
    title: "LOOP BACK",
    description: "Return to shell_loop() for next command",
    module: "src/core/",
    file: "shell_loop.c",
    code: `// Loop continues in shell_loop()
while (!shell->should_exit)
{
    // Read next command...
}`,
    example: "Ready for next command",
  },
};

export default function StepDetails({ currentStep, userCommand }: StepDetailsProps) {
  const info = stepInfo[currentStep] || stepInfo[0];
  const step = flowStepsV021[currentStep];

  const getProcessingDetails = () => {
    if (!userCommand) return null;

    const input = getStepInput();
    const processing = getStepProcessing();
    const output = getStepOutput();

    return (
      <Card className="p-4 mt-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-100">
          Processing Your Command
        </h3>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Input:
            </div>
            <div className="bg-white dark:bg-gray-900 p-2 rounded border border-blue-200 dark:border-blue-700 font-mono text-sm">
              {input}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Processing:
            </div>
            <div className="bg-white dark:bg-gray-900 p-2 rounded border border-blue-200 dark:border-blue-700 text-sm">
              <ul className="list-disc list-inside space-y-1">
                {processing.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Output:
            </div>
            <div className="bg-white dark:bg-gray-900 p-2 rounded border border-blue-200 dark:border-blue-700 font-mono text-sm">
              {output}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const getStepInput = (): string => {
    const cmd = userCommand!;
    
    if (currentStep <= 5) return cmd.raw;
    if (currentStep <= 10) return cmd.raw;
    if (currentStep <= 12) return `Tokens: [${cmd.commands.map(c => c.name).join(", ")}]`;
    if (currentStep <= 13) return `Pipeline: ${cmd.commands.length} command(s)`;
    return `Expanded: ${cmd.commands.map(c => c.name).join(" | ")}`;
  };

  const getStepProcessing = (): string[] => {
    const cmd = userCommand!;
    const processing: string[] = [];

    switch (currentStep) {
      case 0:
        processing.push("Shell initialization");
        processing.push("Environment setup");
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        processing.push("Signal handlers configured");
        processing.push("Terminal settings applied");
        processing.push("History loaded");
        break;
      case 5:
        processing.push("Waiting for user input");
        processing.push("Readline prompt displayed");
        break;
      case 6:
        processing.push(`Line length: ${cmd.raw.length} characters`);
        processing.push(cmd.raw.trim() ? "Non-empty line detected" : "Empty line detected");
        break;
      case 7:
        processing.push("Adding to command history");
        processing.push("History file will be updated on exit");
        break;
      case 8:
        processing.push("Starting line processing");
        processing.push("Will tokenize → parse → expand → execute");
        break;
      case 9:
        processing.push("Checking for unclosed quotes");
        processing.push(cmd.raw.includes('"') || cmd.raw.includes("'") ? "Quotes found and validated" : "No quotes found");
        break;
      case 10:
        processing.push(`Tokenizing into ${cmd.commands.length} command(s)`);
        if (cmd.hasPipes) processing.push("Pipe operator detected");
        if (cmd.hasRedirection) processing.push("Redirection(s) detected");
        break;
      case 11:
        processing.push("Validating syntax");
        processing.push("Checking for invalid operators");
        processing.push("Syntax validation passed");
        break;
      case 12:
        processing.push("Building pipeline structure");
        processing.push(`Created ${cmd.commands.length} command node(s)`);
        if (cmd.hasPipes) processing.push("Pipe connections established");
        break;
      case 13:
        processing.push("Expanding environment variables");
        processing.push("Processing wildcards");
        processing.push("Removing quotes");
        break;
      case 14:
        processing.push("Setting up execution environment");
        if (cmd.hasPipes) processing.push(`Creating ${cmd.commands.length - 1} pipe(s)`);
        processing.push("Preparing file descriptors");
        break;
      case 15:
        processing.push(`Checking if '${cmd.commands[0].name}' is a built-in`);
        processing.push(cmd.commands[0]?.isBuiltIn ? "Built-in command detected" : "External command detected");
        break;
      case 16:
        if (cmd.commands[0]?.isBuiltIn) {
          processing.push(`Executing built-in: ${cmd.commands[0].name}`);
          processing.push("Running in parent process");
          processing.push("Can modify shell state");
        }
        break;
      case 17:
        if (!cmd.commands[0]?.isBuiltIn) {
          processing.push("Forking child process");
          processing.push("Searching PATH for executable");
          processing.push("Calling execve()");
        }
        break;
      case 18:
        processing.push("Waiting for child processes");
        processing.push("Collecting exit statuses");
        break;
      case 19:
        processing.push("Freeing pipeline memory");
        processing.push("Closing file descriptors");
        processing.push("Cleaning up resources");
        break;
      case 20:
        processing.push("Command execution complete");
        processing.push("Ready for next command");
        break;
    }

    return processing;
  };

  const getStepOutput = (): string => {
    const cmd = userCommand!;
    
    if (currentStep <= 5) return "Waiting for input...";
    if (currentStep === 6) return cmd.raw.trim() ? "Line accepted" : "Line rejected (empty)";
    if (currentStep === 7) return "Added to history";
    if (currentStep === 8) return "Processing started";
    if (currentStep === 9) return "Quotes validated";
    if (currentStep === 10) return `Tokens: [${cmd.commands.map(c => c.name).join(", ")}]`;
    if (currentStep === 11) return "Syntax OK";
    if (currentStep === 12) return `Pipeline with ${cmd.commands.length} command(s)`;
    if (currentStep === 13) return "Variables expanded, quotes removed";
    if (currentStep === 14) return "Execution environment ready";
    if (currentStep === 15) return cmd.commands[0]?.isBuiltIn ? "Built-in" : "External";
    if (currentStep === 16) return cmd.commands[0]?.isBuiltIn ? `${cmd.commands[0].name} executed` : "N/A";
    if (currentStep === 17) return !cmd.commands[0]?.isBuiltIn ? "Child process created" : "N/A";
    if (currentStep === 18) return "Exit status collected";
    if (currentStep === 19) return "Memory freed";
    if (currentStep === 20) return "minishell> ";
    
    return "Processing...";
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Step {currentStep + 1}: {info.title}</h2>
            <div className="text-sm text-muted-foreground mb-2">
              <span className="font-mono bg-muted px-2 py-1 rounded">{step?.module}{step?.file}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{info.description}</p>

        <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{info.code}</pre>
        </div>

        {info.example && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Example:
            </div>
            <div className="font-mono text-sm text-blue-800 dark:text-blue-200">
              {info.example}
            </div>
          </div>
        )}
      </Card>

      {userCommand && getProcessingDetails()}
    </div>
  );
}
