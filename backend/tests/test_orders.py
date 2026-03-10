import pytest

ORDERS_URL = "/api/v1/orders"


def order_payload(product_id: int):
    return {
        "items": [{"product_id": product_id, "quantity": 2, "price": 5.0}]
    }


# ==================== CREATE ====================

def test_create_order_as_buyer(client, buyer_headers, test_product):
    response = client.post(ORDERS_URL, json=order_payload(test_product.id), headers=buyer_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "Pending"
    assert len(data["items"]) == 1


def test_create_order_total_calculated_server_side(client, buyer_headers, test_product):
    """Server must calculate total from DB price, not client-submitted price."""
    response = client.post(ORDERS_URL, json=order_payload(test_product.id), headers=buyer_headers)
    assert response.status_code == 201
    data = response.json()
    # Price is 5.0, quantity is 2 → total should be 10.0
    assert data["total"] == pytest.approx(10.0)


def test_create_order_as_producer_forbidden(client, producer_headers, test_product):
    response = client.post(ORDERS_URL, json=order_payload(test_product.id), headers=producer_headers)
    assert response.status_code == 403


def test_create_order_unauthenticated(client, test_product):
    response = client.post(ORDERS_URL, json=order_payload(test_product.id))
    assert response.status_code == 400


def test_create_order_product_not_found(client, buyer_headers):
    response = client.post(ORDERS_URL, json=order_payload(99999), headers=buyer_headers)
    assert response.status_code == 404


def test_create_order_empty_items(client, buyer_headers):
    response = client.post(ORDERS_URL, json={"items": []}, headers=buyer_headers)
    assert response.status_code == 422


def test_create_order_guest_success(client, test_product):
    payload = {
        "items": [{"product_id": test_product.id, "quantity": 1, "price": 5.0}],
        "guest_email": "guest@test.com",
        "guest_phone": "1234567890",
        "guest_address": "123 Guest St"
    }
    response = client.post(ORDERS_URL, json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "Pending"
    assert data["customer_id"] is None
    assert data["guest_email"] == "guest@test.com"


def test_create_order_guest_missing_fields(client, test_product):
    payload = {
        "items": [{"product_id": test_product.id, "quantity": 1, "price": 5.0}],
        "guest_email": "guest@test.com"
        # missing phone and address
    }
    response = client.post(ORDERS_URL, json=payload)
    assert response.status_code == 400
    assert "Guest email, phone, and address are required" in response.json()["detail"]


# ==================== LIST ====================

def test_buyer_sees_own_orders(client, buyer_headers, test_order):
    response = client.get(ORDERS_URL, headers=buyer_headers)
    assert response.status_code == 200
    data = response.json()
    assert all(o["customer_id"] is not None for o in data)


def test_list_orders_unauthenticated(client):
    response = client.get(ORDERS_URL)
    assert response.status_code == 401


# ==================== GET SINGLE ====================

def test_get_own_order_as_buyer(client, buyer_headers, test_order):
    response = client.get(f"{ORDERS_URL}/{test_order.id}", headers=buyer_headers)
    assert response.status_code == 200
    assert response.json()["id"] == test_order.id


def test_producer_cannot_access_unrelated_order(client, producer2_headers, test_order):
    """A producer who didn't sell in this order cannot access it."""
    response = client.get(f"{ORDERS_URL}/{test_order.id}", headers=producer2_headers)
    assert response.status_code == 403


# ==================== STATUS UPDATE ====================

def test_producer_can_update_order_status(client, producer_headers, test_order):
    response = client.put(
        f"{ORDERS_URL}/{test_order.id}/status",
        json={"status": "Shipped"},
        headers=producer_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Shipped"


def test_buyer_cannot_update_order_status(client, buyer_headers, test_order):
    response = client.put(
        f"{ORDERS_URL}/{test_order.id}/status",
        json={"status": "Shipped"},
        headers=buyer_headers,
    )
    assert response.status_code == 403


def test_invalid_status_value(client, producer_headers, test_order):
    response = client.put(
        f"{ORDERS_URL}/{test_order.id}/status",
        json={"status": "Delivered"},  # not a valid status
        headers=producer_headers,
    )
    assert response.status_code == 422


# ==================== RATING ====================

def test_buyer_can_rate_completed_order(client, buyer_headers, test_order):
    # test_order fixture has status "Completed"
    response = client.put(
        f"{ORDERS_URL}/{test_order.id}/rating",
        json={"rating": 5},
        headers=buyer_headers,
    )
    assert response.status_code == 200
    assert response.json()["rating"] == 5


def test_producer_cannot_rate_order(client, producer_headers, test_order):
    response = client.put(
        f"{ORDERS_URL}/{test_order.id}/rating",
        json={"rating": 5},
        headers=producer_headers,
    )
    assert response.status_code == 403


def test_invalid_rating_value(client, buyer_headers, test_order):
    response = client.put(
        f"{ORDERS_URL}/{test_order.id}/rating",
        json={"rating": 6},  # > 5
        headers=buyer_headers,
    )
    assert response.status_code == 422


def test_zero_rating_invalid(client, buyer_headers, test_order):
    response = client.put(
        f"{ORDERS_URL}/{test_order.id}/rating",
        json={"rating": 0},  # < 1
        headers=buyer_headers,
    )
    assert response.status_code == 422
