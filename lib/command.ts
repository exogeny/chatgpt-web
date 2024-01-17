import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

type Command = (parameter: string) => void;

interface Commands {
  fill?: Command;
  submit?: Command;
  mask?: Command;
  code?: Command;
  settings?: Command;
}

export function useCommand(commands: Commands = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let shouldUpdate = false;
    searchParams.forEach((param, name) => {
      const commandName = name as keyof Commands;
      if (typeof commands[commandName] === "function") {
        commands[commandName]!(param);
        searchParams.delete(name);
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, commands]);
}

interface ChatCommands {
  create?: Command;
  createWithMask?: Command;
  next?: Command;
  prev?: Command;
  clear?: Command;
  remove?: Command;
}

export const ChatCommandPrefix = ":";

export function useChatCommand(commands: ChatCommands = {}) {
  function extract(userInput: string) {
    return (
      userInput.startsWith(ChatCommandPrefix) ? userInput.slice(1) : userInput
    ) as keyof ChatCommands;
  }

  function search(userInput: string) {
    const input = extract(userInput);
    const desc = {
      create: "Start a new chat",
      createWithMask: "Start a new chat with mask",
      next: "Next Chat",
      prev: "Previous Chat",
      clear: "Clear Context",
      remove: "Remove Chat",
    };
    return Object.keys(commands)
      .filter((c) => c.startsWith(input))
      .map((c) => ({
        title: desc[c as keyof ChatCommands],
        content: ChatCommandPrefix + c,
      }));
  }

  function match(userInput: string) {
    const command = extract(userInput);
    const matched = typeof commands[command] === "function";

    return {
      matched,
      invoke: () => matched && commands[command]!(userInput),
    };
  }

  return { match, search };
}
