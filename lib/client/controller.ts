export const ChatControllerPool = {
  controllers: {} as Record<string, AbortController>,

  addController(
    sessionId: string,
    messageId: string,
    controller: AbortController
  ) {
    const key = this.key(sessionId, messageId);
    this.controllers[key] = controller;
    return key;
  },

  stop(sessionId: string, messageId: string) {
    const key = this.key(sessionId, messageId);
    const controller = this.controllers[key];
    if (controller) {
      controller.abort();
      delete this.controllers[key];
    }
  },

  stopAll() {
    for (const key in this.controllers) {
      this.controllers[key].abort();
      delete this.controllers[key];
    }
  },

  hasPending() {
    return Object.keys(this.controllers).length > 0;
  },

  remove(sessionId: string, messageId: string) {
    const key = this.key(sessionId, messageId);
    delete this.controllers[key];
  },

  key(sessionId: string, messageId: string) {
    return `${sessionId}:${messageId}`;
  },
}