import type { Server as HttpServer } from 'node:http';
import { WebSocketServer } from 'ws';

const subscriptions = new Map<string, Set<import('ws').WebSocket>>();

export function initWsServer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket, req) => {
    const url = new URL(req.url ?? '', 'http://localhost');
    const taskId = url.searchParams.get('taskId');
    if (!taskId) {
      socket.send(JSON.stringify({ type: 'error', message: '缺少 taskId' }));
      socket.close();
      return;
    }

    if (!subscriptions.has(taskId)) {
      subscriptions.set(taskId, new Set());
    }
    subscriptions.get(taskId)?.add(socket);

    socket.on('close', () => {
      subscriptions.get(taskId)?.delete(socket);
    });
  });
}

export function publishTaskProgress(taskId: string, payload: unknown) {
  const sockets = subscriptions.get(taskId);
  if (!sockets || sockets.size === 0) return;

  const message = JSON.stringify({ type: 'progress', data: payload });
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) {
      socket.send(message);
    }
  }
}
