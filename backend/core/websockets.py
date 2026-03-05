import json
import logging
from typing import Dict, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> WebSocket connection
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected to WebSocket")

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected from WebSocket")

    async def send_personal_message(self, message: Dict[str, Any], user_id: int):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast(self, message: Dict[str, Any]):
        message_str = json.dumps(message)
        dead_connections = []
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Error broadcasting to user {user_id}: {e}")
                dead_connections.append(user_id)
                
        for user_id in dead_connections:
            self.disconnect(user_id)

manager = ConnectionManager()
