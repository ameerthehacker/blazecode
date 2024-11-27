/**
 * Adapted from https://github.com/yjs/y-webrtc/blob/master/bin/server.js
 */
import { serve } from 'https://deno.land/std@0.177.0/http/mod.ts';

const port = Number(Deno.env.get('PORT') ?? '4444');
const topics = new Map<string, Set<WebSocket>>();

await serve(
  (req) => {
    const upgrade = req.headers.get('upgrade') || '';
    if (upgrade.toLowerCase() != 'websocket') {
      return new Response("request isn't trying to upgrade to websocket.");
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    handleConnection(socket);

    return response;
  },
  {
    port,
    onListen: ({ port }) => {
      console.log('Signaling server running on localhost:', port);
    },
  }
);

function handleConnection(socket: WebSocket) {
  const subscribedTopics = new Set<string>();

  socket.onmessage = ({ data }) => {
    const message = typeof data === 'string' ? JSON.parse(data) : data;

    if (!message || !message.type || socket.readyState === WebSocket.CLOSED) {
      return;
    }

    if (message.type === 'subscribe') {
      for (const topicName of (message.topics as string[]) ?? []) {
        if (typeof topicName !== 'string') {
          return;
        }

        const topic = topics.get(topicName) ?? new Set();
        if (!topics.has(topicName)) {
          topics.set(topicName, topic);
        }

        // add conn to topic
        topic.add(socket);

        // add topic to conn
        subscribedTopics.add(topicName);
      }
      return;
    }

    if (message.type === 'unsubscribe') {
      for (const topicName of (message.topics as string[]) ?? []) {
        topics.get(topicName)?.delete(socket);
      }
      return;
    }

    if (message.type === 'publish') {
      if (!message.topic) {
        return;
      }

      const receivers = topics.get(message.topic) ?? [];

      for (const receiver of receivers) {
        send(receiver, message);
      }
      return;
    }

    if (message.type === 'ping') {
      send(socket, { type: 'pong' });
      return;
    }
  };

  socket.onclose = () => {
    for (const topicName of subscribedTopics) {
      const subs = topics.get(topicName) ?? new Set();
      subs.delete(socket);
      if (subs.size === 0) {
        topics.delete(topicName);
      }
    }
    subscribedTopics.clear();
  };

  socket.onerror = (e) => {
    console.log('socket errored:', e);
  };
}

function send(socket: WebSocket, message: unknown) {
  if (
    socket.readyState !== WebSocket.CONNECTING &&
    socket.readyState !== WebSocket.OPEN
  ) {
    return socket.close();
  }

  try {
    socket.send(JSON.stringify(message));
  } catch {
    socket.close();
  }
}
