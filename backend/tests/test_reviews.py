import pytest

REVIEWS_URL = "/api/v1/reviews"


def review_payload(product_id: int):
    return {
        "product_id": product_id,
        "rating": 4,
        "comment": "Great product, very fresh and tasty!",
    }


# ==================== CREATE ====================

def test_create_review_as_buyer(client, buyer_headers, test_product):
    response = client.post(REVIEWS_URL, json=review_payload(test_product.id), headers=buyer_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["rating"] == 4
    assert data["product_id"] == test_product.id
    assert data["author"] == "Test Buyer"


def test_author_set_from_jwt_not_body(client, buyer_headers, test_product):
    """Ensure the author is set from the JWT, not from the request body."""
    payload = {**review_payload(test_product.id)}
    response = client.post(REVIEWS_URL, json=payload, headers=buyer_headers)
    assert response.status_code == 201
    # Author should be the authenticated user's name
    assert response.json()["author"] == "Test Buyer"


def test_create_review_as_producer_forbidden(client, producer_headers, test_product):
    response = client.post(REVIEWS_URL, json=review_payload(test_product.id), headers=producer_headers)
    assert response.status_code == 403


def test_create_review_unauthenticated(client, test_product):
    response = client.post(REVIEWS_URL, json=review_payload(test_product.id))
    assert response.status_code == 401


def test_create_review_product_not_found(client, buyer_headers):
    response = client.post(REVIEWS_URL, json=review_payload(99999), headers=buyer_headers)
    assert response.status_code == 404


def test_create_review_invalid_rating_too_high(client, buyer_headers, test_product):
    payload = {**review_payload(test_product.id), "rating": 6}
    response = client.post(REVIEWS_URL, json=payload, headers=buyer_headers)
    assert response.status_code == 422


def test_create_review_invalid_rating_zero(client, buyer_headers, test_product):
    payload = {**review_payload(test_product.id), "rating": 0}
    response = client.post(REVIEWS_URL, json=payload, headers=buyer_headers)
    assert response.status_code == 422


def test_create_review_comment_too_short(client, buyer_headers, test_product):
    payload = {**review_payload(test_product.id), "comment": "ok"}  # < 5 chars
    response = client.post(REVIEWS_URL, json=payload, headers=buyer_headers)
    assert response.status_code == 422


# ==================== GET REVIEWS (public) ====================

def test_get_reviews_for_product(client, test_product, buyer_headers):
    # Create a review first
    client.post(REVIEWS_URL, json=review_payload(test_product.id), headers=buyer_headers)

    response = client.get(f"{REVIEWS_URL}/product/{test_product.id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["rating"] == 4


def test_get_reviews_empty_product(client, test_product):
    response = client.get(f"{REVIEWS_URL}/product/{test_product.id}")
    assert response.status_code == 200
    assert response.json() == []


# ==================== PRODUCT RATING UPDATED AFTER REVIEW ====================

def test_product_rating_updated_after_review(client, buyer_headers, test_product):
    client.post(REVIEWS_URL, json={**review_payload(test_product.id), "rating": 5}, headers=buyer_headers)

    product_response = client.get(f"/api/v1/products/{test_product.id}")
    assert product_response.status_code == 200
    data = product_response.json()
    assert data["review_count"] >= 1
    assert data["rating"] > 0
