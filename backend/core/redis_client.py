import logging
import redis as redis_lib
from core.config import settings

logger = logging.getLogger(__name__)

_redis_client = None


def get_redis() -> redis_lib.Redis | None:
    """Return a Redis client, or None if Redis is unavailable (graceful degradation)."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        client = redis_lib.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        _redis_client = client
        return _redis_client
    except Exception as exc:
        logger.warning("Redis unavailable (%s). Login lockout protection disabled.", exc)
        return None


# ==================== LOGIN LOCKOUT ====================

_MAX_ATTEMPTS = 5
_LOCKOUT_SECONDS = 15 * 60  # 15 minutes
_WINDOW_SECONDS = 10 * 60   # sliding 10-minute attempt window


def record_failed_login(email: str) -> int:
    """Increment failed-login counter for an email. Returns current attempt count."""
    r = get_redis()
    if r is None:
        return 0
    key = f"login_attempts:{email.lower()}"
    try:
        count = r.incr(key)
        if count == 1:
            r.expire(key, _WINDOW_SECONDS)
        return count
    except Exception:
        return 0


def is_account_locked(email: str) -> bool:
    """Return True if this email has exceeded the failed-login threshold."""
    r = get_redis()
    if r is None:
        return False
    key = f"login_attempts:{email.lower()}"
    try:
        raw = r.get(key)
        return raw is not None and int(raw) >= _MAX_ATTEMPTS
    except Exception:
        return False


def clear_failed_logins(email: str) -> None:
    """Clear failed-login counter after a successful login."""
    r = get_redis()
    if r is None:
        return
    try:
        r.delete(f"login_attempts:{email.lower()}")
    except Exception:
        pass
