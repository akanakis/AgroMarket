import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app
from core.security import hash_password
import models

# Use SQLite in-memory DB for tests
TEST_DATABASE_URL = "sqlite:///./test_temp.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def clean_db():
    """Clean all tables before each test."""
    db = TestingSessionLocal()
    db.query(models.Review).delete()
    db.query(models.OrderItem).delete()
    db.query(models.Order).delete()
    db.query(models.Product).delete()
    db.query(models.User).delete()
    db.commit()
    db.close()
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


# ==================== USER FIXTURES ====================

@pytest.fixture
def test_buyer(db):
    user = models.User(
        name="Test Buyer",
        email="buyer@test.com",
        password_hash=hash_password("Test1234!"),
        role="BUYER",
        location="Athens",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_producer(db):
    user = models.User(
        name="Test Producer",
        email="producer@test.com",
        password_hash=hash_password("Test1234!"),
        role="PRODUCER",
        location="Kalamata",
        farm_name="Test Farm",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_producer_2(db):
    user = models.User(
        name="Other Producer",
        email="other_producer@test.com",
        password_hash=hash_password("Test1234!"),
        role="PRODUCER",
        location="Thessaloniki",
        farm_name="Other Farm",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ==================== AUTH HEADER FIXTURES ====================

def get_token(client, email, password):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed: {response.json()}"
    return response.json()["access_token"]


@pytest.fixture
def buyer_headers(client, test_buyer):
    token = get_token(client, "buyer@test.com", "Test1234!")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def producer_headers(client, test_producer):
    token = get_token(client, "producer@test.com", "Test1234!")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def producer2_headers(client, test_producer_2):
    token = get_token(client, "other_producer@test.com", "Test1234!")
    return {"Authorization": f"Bearer {token}"}


# ==================== PRODUCT FIXTURE ====================

@pytest.fixture
def test_product(db, test_producer):
    product = models.Product(
        name="Test Oranges",
        description="Fresh oranges from the grove, perfect for juice.",
        price=5.0,
        unit="kg",
        category="Fruits",
        location="Kalamata",
        seller_id=test_producer.id,
        seller_name=test_producer.name,
        image_url="https://images.unsplash.com/photo-1582285552433-28564db597c5",
        organic=True,
        harvest_date="2026-01-15",
        max_quantity=100,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# ==================== ORDER FIXTURE ====================

@pytest.fixture
def test_order(db, test_buyer, test_product):
    order = models.Order(
        customer_id=test_buyer.id,
        customer_name=test_buyer.name,
        total=10.0,
        status="Completed",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    item = models.OrderItem(
        order_id=order.id,
        product_id=test_product.id,
        quantity=2,
        price=5.0,
    )
    db.add(item)
    db.commit()
    db.refresh(order)
    return order
