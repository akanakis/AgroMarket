import pytest

PRODUCTS_URL = "/api/v1/products"


VALID_PRODUCT = {
    "name": "Fresh Tomatoes",
    "description": "Ripe vine tomatoes grown organically in Crete.",
    "price": 3.5,
    "unit": "kg",
    "category": "Vegetables",
    "location": "Crete",
    "image_url": "https://images.unsplash.com/photo-1582285552433",
    "organic": True,
    "harvest_date": "2026-01-10",
    "max_quantity": 200,
}


# ==================== LIST / GET (public) ====================

def test_list_products_public(client, test_product):
    response = client.get(PRODUCTS_URL)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_product_public(client, test_product):
    response = client.get(f"{PRODUCTS_URL}/{test_product.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_product.id


def test_get_product_not_found(client):
    response = client.get(f"{PRODUCTS_URL}/99999")
    assert response.status_code == 404


def test_list_products_filter_category(client, test_product):
    response = client.get(f"{PRODUCTS_URL}?category=Fruits")
    assert response.status_code == 200
    data = response.json()
    for product in data:
        assert product["category"] == "Fruits"


# ==================== CREATE ====================

def test_create_product_as_producer(client, producer_headers):
    response = client.post(PRODUCTS_URL, json=VALID_PRODUCT, headers=producer_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Fresh Tomatoes"
    assert data["price"] == 3.5


def test_create_product_seller_set_from_jwt(client, producer_headers, test_producer):
    response = client.post(PRODUCTS_URL, json=VALID_PRODUCT, headers=producer_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["seller_id"] == test_producer.id
    assert data["seller_name"] == test_producer.name


def test_create_product_as_buyer_forbidden(client, buyer_headers):
    response = client.post(PRODUCTS_URL, json=VALID_PRODUCT, headers=buyer_headers)
    assert response.status_code == 403


def test_create_product_unauthenticated(client):
    response = client.post(PRODUCTS_URL, json=VALID_PRODUCT)
    assert response.status_code == 401


def test_create_product_negative_price(client, producer_headers):
    payload = {**VALID_PRODUCT, "price": -1.0}
    response = client.post(PRODUCTS_URL, json=payload, headers=producer_headers)
    assert response.status_code == 422


def test_create_product_zero_quantity(client, producer_headers):
    payload = {**VALID_PRODUCT, "max_quantity": 0}
    response = client.post(PRODUCTS_URL, json=payload, headers=producer_headers)
    assert response.status_code == 422


def test_create_product_invalid_category(client, producer_headers):
    payload = {**VALID_PRODUCT, "category": "InvalidCat"}
    response = client.post(PRODUCTS_URL, json=payload, headers=producer_headers)
    assert response.status_code == 422


# ==================== UPDATE ====================

def test_update_own_product(client, producer_headers, test_product):
    response = client.put(
        f"{PRODUCTS_URL}/{test_product.id}",
        json={"price": 7.5},
        headers=producer_headers,
    )
    assert response.status_code == 200
    assert response.json()["price"] == 7.5


def test_update_other_producers_product(client, producer2_headers, test_product):
    response = client.put(
        f"{PRODUCTS_URL}/{test_product.id}",
        json={"price": 7.5},
        headers=producer2_headers,
    )
    assert response.status_code == 403


def test_update_product_as_buyer(client, buyer_headers, test_product):
    response = client.put(
        f"{PRODUCTS_URL}/{test_product.id}",
        json={"price": 7.5},
        headers=buyer_headers,
    )
    assert response.status_code == 403


# ==================== DELETE ====================

def test_delete_own_product(client, producer_headers, test_product):
    response = client.delete(f"{PRODUCTS_URL}/{test_product.id}", headers=producer_headers)
    assert response.status_code == 204


def test_delete_other_producers_product(client, producer2_headers, test_product):
    response = client.delete(f"{PRODUCTS_URL}/{test_product.id}", headers=producer2_headers)
    assert response.status_code == 403


def test_delete_product_as_buyer(client, buyer_headers, test_product):
    response = client.delete(f"{PRODUCTS_URL}/{test_product.id}", headers=buyer_headers)
    assert response.status_code == 403


def test_delete_product_unauthenticated(client, test_product):
    response = client.delete(f"{PRODUCTS_URL}/{test_product.id}")
    assert response.status_code == 401
