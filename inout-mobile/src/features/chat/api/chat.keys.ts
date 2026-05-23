export const chatKeys = {
  all: ["chat"] as const,
  conversation: () => [...chatKeys.all, "conversation"] as const,
};
