// Embedded source code for key execution steps
// This avoids fetch issues with dev server routing

export const sourceCodeData: Record<string, string> = {
  "/source/main/main.c": `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: malmarzo <malmarzo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/02 09:15:37 by malmarzo          #+#    #+#             */
/*   Updated: 2025/11/13 15:04:45 by malmarzo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../../minishell.h"

t_shell	g_shell;

int	main(int argc, char **argv, char **envp)
{
	(void)argc;
	(void)argv;
	write(1, "\\033[2J\\033[H", 7);
	print_logo();
	init_shell(&g_shell, envp);
	setup_signals();
	history_init(&g_shell);
	shell_loop(&g_shell);
	history_save(&g_shell);
	rl_clear_history();
	free_env(g_shell.env);
	free(g_shell.history_path);
	return (g_shell.exit_status);
}
`,

  "/source/core/shell_utils.c": `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   shell_utils.c                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: malmarzo <malmarzo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/02 09:15:37 by malmarzo          #+#    #+#             */
/*   Updated: 2025/11/13 15:04:45 by malmarzo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../../minishell.h"

void	init_shell(t_shell *shell, char **envp)
{
	shell->env = copy_env(envp);
	shell->exit_status = 0;
	shell->should_exit = 0;
	shell->history_path = NULL;
}

char	**copy_env(char **envp)
{
	int		i;
	int		count;
	char	**new_env;

	count = 0;
	while (envp[count])
		count++;
	new_env = malloc(sizeof(char *) * (count + 1));
	if (!new_env)
		return (NULL);
	i = 0;
	while (i < count)
	{
		new_env[i] = ft_strdup(envp[i]);
		if (!new_env[i])
		{
			free_env(new_env);
			return (NULL);
		}
		i++;
	}
	new_env[i] = NULL;
	return (new_env);
}
`,

  "/source/signals/signals.c": `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signals.c                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: malmarzo <malmarzo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/02 09:15:37 by malmarzo          #+#    #+#             */
/*   Updated: 2025/11/23 05:05:12 by malmarzo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../../minishell.h"

void	handle_sigint(int sig)
{
	(void)sig;
	write(1, "\\n", 1);
	rl_on_new_line();
	rl_replace_line("", 0);
	rl_redisplay();
	g_shell.exit_status = 130;
}

void	handle_sigquit(int sig)
{
	(void)sig;
}

void	setup_signals(void)
{
	struct termios	term;

	signal(SIGINT, handle_sigint);
	signal(SIGQUIT, handle_sigquit);
	
	// v0.29 improvement: Disable ECHOCTL to prevent ^C display
	tcgetattr(STDIN_FILENO, &term);
	term.c_lflag &= ~ECHOCTL;
	tcsetattr(STDIN_FILENO, TCSANOW, &term);
}
`,

  "/source/core/shell_loop.c": `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   shell_loop.c                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: malmarzo <malmarzo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/02 09:15:37 by malmarzo          #+#    #+#             */
/*   Updated: 2025/11/13 15:04:45 by malmarzo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../../minishell.h"

void	shell_loop(t_shell *shell)
{
	char	*line;

	while (!shell->should_exit)
	{
		line = read_logical_line(shell);
		if (!line)
			break ;
		if (is_empty_line(line))
		{
			free(line);
			continue ;
		}
		history_add_line(shell, line);
		process_line(shell, line);
		free(line);
	}
}

void	process_line(t_shell *shell, char *line)
{
	t_token		*tokens;
	t_pipeline	*pipeline;

	if (check_unclosed_quotes(line))
		return ;
	tokens = lexer(line);
	if (!tokens)
		return ;
	if (validate_syntax(tokens))
	{
		free_tokens(tokens);
		return ;
	}
	pipeline = parser(tokens);
	free_tokens(tokens);
	if (!pipeline)
		return ;
	expander(shell, pipeline);
	executor(shell, pipeline);
	free_pipeline(pipeline);
}
`,

  "/source/lexer/lexer.c": `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lexer.c                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: malmarzo <malmarzo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/02 09:15:37 by malmarzo          #+#    #+#             */
/*   Updated: 2025/11/13 15:04:45 by malmarzo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../../minishell.h"

t_token	*lexer(char *line)
{
	t_token	*tokens;
	int		i;

	tokens = NULL;
	i = 0;
	while (line[i])
	{
		while (line[i] && ft_isspace(line[i]))
			i++;
		if (!line[i])
			break ;
		if (is_operator(line + i))
			i += handle_operator(&tokens, line + i);
		else
			i += handle_word(&tokens, line + i);
	}
	return (tokens);
}

int	handle_word(t_token **tokens, char *str)
{
	int		len;
	char	*word;
	t_token	*new_token;

	len = 0;
	while (str[len] && !ft_isspace(str[len]) && !is_operator(str + len))
	{
		if (str[len] == '\\'' || str[len] == '\\"')
			len += skip_quotes(str + len);
		else
			len++;
	}
	word = ft_substr(str, 0, len);
	new_token = create_token(TOKEN_WORD, word);
	add_token(tokens, new_token);
	return (len);
}
`,

  "/source/parser/parser.c": `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   parser.c                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: malmarzo <malmarzo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/02 09:15:37 by malmarzo          #+#    #+#             */
/*   Updated: 2025/11/13 15:04:45 by malmarzo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../../minishell.h"

t_pipeline	*parser(t_token *tokens)
{
	t_pipeline	*pipeline;
	t_command	*cmd;

	pipeline = create_pipeline();
	if (!pipeline)
		return (NULL);
	while (tokens)
	{
		cmd = parse_command(&tokens);
		if (!cmd)
		{
			free_pipeline(pipeline);
			return (NULL);
		}
		add_command_to_pipeline(pipeline, cmd);
		if (tokens && tokens->type == TOKEN_PIPE)
			tokens = tokens->next;
	}
	return (pipeline);
}

t_command	*parse_command(t_token **tokens)
{
	t_command	*cmd;
	t_token		*current;

	cmd = create_command();
	if (!cmd)
		return (NULL);
	current = *tokens;
	while (current && current->type != TOKEN_PIPE)
	{
		if (is_redirection(current->type))
			parse_redirection(cmd, &current);
		else
			add_argument(cmd, current->value);
		current = current->next;
	}
	*tokens = current;
	return (cmd);
}
`,

  "/source/executor/executor.c": `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   executor.c                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: malmarzo <malmarzo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/02 09:15:37 by malmarzo          #+#    #+#             */
/*   Updated: 2025/11/13 15:04:45 by malmarzo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../../minishell.h"

void	executor(t_shell *shell, t_pipeline *pipeline)
{
	int	i;
	int	**pipes;

	if (!pipeline || !pipeline->commands)
		return ;
	pipes = setup_pipes(pipeline->cmd_count);
	i = 0;
	while (i < pipeline->cmd_count)
	{
		if (is_builtin(pipeline->commands[i]->argv[0]))
			execute_builtin(shell, pipeline->commands[i]);
		else
			execute_external(shell, pipeline->commands[i], pipes, i);
		i++;
	}
	close_pipes(pipes, pipeline->cmd_count);
	wait_pipeline(shell, pipeline);
	free_pipes(pipes, pipeline->cmd_count);
}

void	execute_external(t_shell *shell, t_command *cmd, int **pipes, int idx)
{
	pid_t	pid;

	pid = fork();
	if (pid == 0)
	{
		setup_child_fds(pipes, idx);
		setup_redirections(cmd);
		execve(find_executable_path(cmd->argv[0], shell->env), 
			cmd->argv, shell->env);
		exit(127);
	}
	cmd->pid = pid;
}
`,

  "/source/builtins/builtin_exit.c": `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   builtin_exit.c                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: malmarzo <malmarzo@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/02 09:15:37 by malmarzo          #+#    #+#             */
/*   Updated: 2025/11/23 05:05:12 by malmarzo         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../../minishell.h"

int	builtin_exit(t_shell *shell, char **argv)
{
	int	exit_code;

	ft_putendl_fd("exit", STDOUT_FILENO);
	if (!argv[1])
	{
		shell->should_exit = 1;
		return (shell->exit_status);
	}
	if (argv[2])
	{
		ft_putendl_fd("minishell: exit: too many arguments", STDERR_FILENO);
		return (1);
	}
	// v0.29 improvement: Check for numeric overflow
	if (!is_valid_exit_arg(argv[1]))
	{
		ft_putstr_fd("minishell: exit: ", STDERR_FILENO);
		ft_putstr_fd(argv[1], STDERR_FILENO);
		ft_putendl_fd(": numeric argument required", STDERR_FILENO);
		shell->should_exit = 1;
		return (2);
	}
	exit_code = ft_atoi(argv[1]) % 256;
	shell->should_exit = 1;
	return (exit_code);
}

int	is_valid_exit_arg(char *arg)
{
	int			i;
	long long	num;

	i = 0;
	if (arg[i] == '+' || arg[i] == '-')
		i++;
	if (!arg[i])
		return (0);
	while (arg[i])
	{
		if (!ft_isdigit(arg[i]))
			return (0);
		i++;
	}
	// Check for overflow
	num = ft_atoll(arg);
	if (num != (long long)ft_atoi(arg))
		return (0);
	return (1);
}
`
};
