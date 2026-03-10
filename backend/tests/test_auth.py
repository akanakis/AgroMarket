import pytest


REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
ME_URL = "/api/v1/auth/me"
REFRESH_URL = "/api/v1/auth/refresh"
LOGOUT_URL = "/api/v1/auth/logout"


# ==================== REGISTER ====================

def test_register_buyer(client):
    response = client.post(REGISTER_URL, json={
        "name": "New Buyer",
        "email": "newbuyer@test.com",
        "password": "Test1234!",
        "role": "BUYER",
        "location": "Athens",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newbuyer@test.com"
    assert data["role"] == "BUYER"
    assert "password_hash" not in data


def test_register_producer_requires_farm_name(client):
    response = client.post(REGISTER_URL, json={
        "name": "New Producer",
        "email": "newproducer@test.com",
        "password": "Test1234!",
        "role": "PRODUCER",
        "location": "Kalamata",
        # farm_name missing
    })
    assert response.status_code == 422


def test_register_producer_with_farm_name(client):
    response = client.post(REGISTER_URL, json={
        "name": "New Producer",
        "email": "newproducer@test.com",
        "password": "Test1234!",
        "role": "PRODUCER",
        "location": "Kalamata",
        "farm_name": "Sunshine Farm",
    })
    assert response.status_code == 201


def test_register_duplicate_email(client, test_buyer):
    response = client.post(REGISTER_URL, json={
        "name": "Duplicate",
        "email": "buyer@test.com",  # already exists
        "password": "Test1234!",
        "role": "BUYER",
        "location": "Athens",
    })
    assert response.status_code == 400


def test_register_weak_password_no_uppercase(client):
    response = client.post(REGISTER_URL, json={
        "name": "User",
        "email": "user@test.com",
        "password": "test1234!",  # no uppercase
        "role": "BUYER",
        "location": "Athens",
    })
    assert response.status_code == 422


def test_register_weak_password_no_digit(client):
    response = client.post(REGISTER_URL, json={
        "name": "User",
        "email": "user@test.com",
        "password": "Testpass!",  # no digit
        "role": "BUYER",
        "location": "Athens",
    })
    assert response.status_code == 422


def test_register_invalid_email(client):
    response = client.post(REGISTER_URL, json={
        "name": "User",
        "email": "not-an-email",
        "password": "Test1234!",
        "role": "BUYER",
        "location": "Athens",
    })
    assert response.status_code == 422


# ==================== LOGIN ====================

def test_login_success(client, test_buyer):
    response = client.post(LOGIN_URL, json={"email": "buyer@test.com", "password": "Test1234!"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_buyer):
    response = client.post(LOGIN_URL, json={"email": "buyer@test.com", "password": "WrongPass1!"})
    assert response.status_code == 401


def test_login_unknown_email(client):
    response = client.post(LOGIN_URL, json={"email": "nobody@test.com", "password": "Test1234!"})
    assert response.status_code == 401


# ==================== GOOGLE LOGIN ====================

def test_google_login_success_new_user(client):
    response = client.post("/api/v1/auth/google", json={
        "token": "dummy_newgoogle@test.com",
        "role": "BUYER"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_google_login_success_existing_user(client, test_buyer):
    response = client.post("/api/v1/auth/google", json={
        "token": f"dummy_{test_buyer.email}",
        "role": "BUYER"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_google_login_invalid_dummy_token(client):
    # Depending on implementation, might raise 400 or 401
    response = client.post("/api/v1/auth/google", json={
        "token": "invalid_token",
        "role": "BUYER"
    })
    assert response.status_code == 400


# ==================== ME ====================

def test_get_me(client, buyer_headers):
    response = client.get(ME_URL, headers=buyer_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "buyer@test.com"
    assert data["role"] == "BUYER"


def test_get_me_no_token(client):
    response = client.get(ME_URL)
    assert response.status_code == 401


def test_get_me_invalid_token(client):
    response = client.get(ME_URL, headers={"Authorization": "Bearer invalidtoken"})
    assert response.status_code == 401


# ==================== REFRESH ====================

def test_refresh_token(client, test_buyer):
    # Login sets refresh cookie
    login_response = client.post(LOGIN_URL, json={"email": "buyer@test.com", "password": "Test1234!"})
    assert login_response.status_code == 200

    csrf_token = client.cookies.get("csrf_token")

    # Refresh using the cookie
    refresh_response = client.post(REFRESH_URL, headers={"X-CSRF-Token": csrf_token})
    assert refresh_response.status_code == 200
    data = refresh_response.json()
    assert "access_token" in data


def test_refresh_no_cookie(client):
    client.cookies.set("csrf_token", "dummy")
    response = client.post(REFRESH_URL, headers={"X-CSRF-Token": "dummy"})
    assert response.status_code == 401


# ==================== LOGOUT ====================

def test_logout(client, test_buyer):
    client.post(LOGIN_URL, json={"email": "buyer@test.com", "password": "Test1234!"})
    response = client.post(LOGOUT_URL)
    assert response.status_code == 200
