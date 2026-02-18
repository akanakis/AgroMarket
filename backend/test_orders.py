
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db
from models import Base
import datetime

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestOrderFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def test_order_flow(self):
        # 1. Create a Seller
        seller_response = self.client.post("/api/users/", json={
            "name": "Test Seller",
            "email": "seller@test.com",
            "password": "password",
            "role": "PRODUCER",
            "farm_name": "Test Farm"
        })
        self.assertEqual(seller_response.status_code, 200)
        seller_id = seller_response.json()["id"]

        # 2. Create a Buyer
        buyer_response = self.client.post("/api/users/", json={
            "name": "Test Buyer",
            "email": "buyer@test.com",
            "password": "password",
            "role": "BUYER"
        })
        self.assertEqual(buyer_response.status_code, 200)
        buyer_id = buyer_response.json()["id"]

        # 3. Create a Product
        product_response = self.client.post("/api/products/", json={
            "name": "Test Product",
            "description": "A test product",
            "price": 10.0,
            "unit": "kg",
            "category": "Veterables",
            "location": "Test Loc",
            "seller_name": "Test Seller",
            "image_url": "http://test.com/img.jpg",
            "organic": True,
            "harvest_date": str(datetime.date.today()),
            "max_quantity": 100,
            "seller_id": seller_id
        })
        self.assertEqual(product_response.status_code, 200)
        product_id = product_response.json()["id"]

        # 4. Create an Order
        order_response = self.client.post("/api/orders/", json={
            "customer_name": "Test Buyer",
            "total": 20.0,
            "status": "Pending",
            "customer_id": buyer_id,
            "items": [
                {"product_id": product_id, "quantity": 2, "price": 10.0}
            ]
        })
        self.assertEqual(order_response.status_code, 200)
        order_data = order_response.json()
        order_id = order_data["id"]
        self.assertEqual(order_data["status"], "Pending")

        # 5. Fetch Seller Orders
        seller_orders_response = self.client.get(f"/api/orders/seller/{seller_id}")
        self.assertEqual(seller_orders_response.status_code, 200)
        seller_orders = seller_orders_response.json()
        self.assertTrue(len(seller_orders) > 0)
        self.assertEqual(seller_orders[0]["id"], order_id)

        # 6. Update Order Status
        update_response = self.client.put(f"/api/orders/{order_id}/status?status=Processing")
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["status"], "Processing")

        # 7. Verify Status Update
        get_order_response = self.client.get(f"/api/orders/seller/{seller_id}")
        self.assertEqual(get_order_response.json()[0]["status"], "Processing")

if __name__ == '__main__':
    unittest.main()
