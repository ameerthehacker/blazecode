/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// First, create a DurableObject class to handle the room state
export class SignalingRoom {
  private subscribers: Map<string, { ws: WebSocket; topics: Set<string> }>;
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.subscribers = new Map();
  }

  async fetch(request: Request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket connection', { status: 400 });
    }

    const { 0: client, 1: server } = new WebSocketPair();
    const subscriberId = crypto.randomUUID();

    server.accept();

    // Store the WebSocket connection with its subscribed topics
    this.subscribers.set(subscriberId, {
      ws: server,
      topics: new Set(),
    });

    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);

        switch (message.type) {
          case 'subscribe': {
            const topics = message.topics || [];
            topics.forEach((topic: string) => {
              this.subscribers.get(subscriberId)?.topics.add(topic);
            });
            break;
          }

          case 'unsubscribe': {
            const unsubTopics = message.topics || [];
            unsubTopics.forEach((topic: string) => {
              this.subscribers.get(subscriberId)?.topics.delete(topic);
            });
            break;
          }

          case 'publish':
            if (message.topic) {
              const outgoingMessage = JSON.stringify({
                type: 'publish',
                topic: message.topic,
                data: message.data,
                clients: this.getTopicSubscriberCount(message.topic),
              });

              this.broadcastToTopic(message.topic, outgoingMessage, server);
            }
            break;

          case 'ping':
            server.send(JSON.stringify({ type: 'pong' }));
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    server.addEventListener('close', () => {
      this.subscribers.delete(subscriberId);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private getTopicSubscriberCount(topic: string): number {
    let count = 0;
    for (const subscriber of this.subscribers.values()) {
      if (subscriber.topics.has(topic)) count++;
    }
    return count;
  }

  private broadcastToTopic(topic: string, message: string, sender: WebSocket) {
    for (const subscriber of this.subscribers.values()) {
      if (
        subscriber.ws !== sender &&
        subscriber.topics.has(topic) &&
        subscriber.ws.readyState === 1
      ) {
        // READY_STATE_OPEN
        subscriber.ws.send(message);
      }
    }
  }
}

// Then, update the main worker code
interface Env {
  SIGNALING_ROOM: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const roomName = url.pathname.slice(1) || 'default';

    // Get the room ID from the request URL
    const roomId = env.SIGNALING_ROOM.idFromName(roomName);
    const room = env.SIGNALING_ROOM.get(roomId);

    // Forward the request to the DurableObject
    return room.fetch(request);
  },
} satisfies ExportedHandler<Env>;
