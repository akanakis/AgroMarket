from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from core.websockets import manager
from core.config import settings
from database import get_db
import models

router = APIRouter(prefix="/ws", tags=["websocket"])

def get_user_from_token(token: str, db: Session) -> models.User | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(models.User).filter(models.User.id == int(user_id)).first()
        return user
    except JWTError:
        return None

@router.websocket("/orders")
async def websocket_orders_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    user = get_user_from_token(token, db)
    if not user:
        await websocket.close(code=1008)  # Policy Violation
        return

    await manager.connect(user.id, websocket)
    try:
        while True:
            # Keep connection alive and log any received messages
            data = await websocket.receive_text()
            print(f"WS Message from User {user.id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(user.id)
