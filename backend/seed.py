from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from core.security import hash_password
from datetime import datetime, timedelta
from faker import Faker
import random
import json

# Initialize Faker with Greek locale
fake = Faker("el_GR")

# Create tables (for dev convenience — Alembic is used in production)
models.Base.metadata.create_all(bind=engine)


def seed_database():
    db = SessionLocal()

    try:
        print("Cleaning up existing data...")
        db.query(models.Review).delete()
        db.query(models.OrderItem).delete()
        db.query(models.Order).delete()
        db.query(models.Product).delete()
        db.query(models.User).delete()
        db.commit()

        print("Seeding new data...")

        # ==================== USERS ====================
        producers = []
        for i in range(10):
            producer = models.User(
                name=fake.company(),
                email=f"producer{i + 1}@agromarket.dev",
                password_hash=hash_password("Test1234!"),
                role="PRODUCER",
                location=fake.city(),
                farm_name=f"{fake.last_name()} Farm",
                certifications=json.dumps(
                    random.sample(["Organic", "BIO", "PDO", "PGI", "GlobalGAP"], k=random.randint(1, 3))
                ),
                created_at=fake.date_time_between(start_date="-1y", end_date="now"),
            )
            producers.append(producer)

        buyers = []
        for i in range(10):
            buyer = models.User(
                name=fake.name(),
                email=f"buyer{i + 1}@agromarket.dev",
                password_hash=hash_password("Test1234!"),
                role="BUYER",
                location=fake.city(),
                preferences=json.dumps(
                    random.sample(["Vegetables", "Fruits", "Dairy", "Honey", "Oil", "Nuts"], k=random.randint(1, 4))
                ),
                created_at=fake.date_time_between(start_date="-1y", end_date="now"),
            )
            buyers.append(buyer)

        db.add_all(producers + buyers)
        db.commit()

        for u in producers + buyers:
            db.refresh(u)

        print(f"   - Created {len(producers)} Producers and {len(buyers)} Buyers")

        # ==================== PRODUCTS ====================
        categories = {
            "Vegetables": ["Tomatoes", "Cucumbers", "Peppers", "Eggplants", "Potatoes"],
            "Fruits": ["Oranges", "Apples", "Watermelon", "Grapes", "Figs"],
            "Dairy": ["Feta Cheese", "Graviera", "Sheep Yogurt", "Goat Cheese"],
            "Grains": ["Wheat", "Barley", "Corn", "Oats"],
            "Herbs": ["Oregano", "Mountain Tea", "Basil", "Thyme"],
            "Honey": ["Thyme Honey", "Pine Honey", "Flower Honey"],
            "Meat": ["Lamb", "Goat", "Free Range Chicken"],
            "Other": ["Extra Virgin Olive Oil", "Kalamata Olives", "Walnuts", "Almonds"],
        }

        product_images = [
            "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1626957341926-98752fc2ba90?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1571212515416-f785d774e644?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1560155016-bd4879ae8f21?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1582285552433-28564db597c5?auto=format&fit=crop&q=80&w=800",
        ]

        products = []
        for producer in producers:
            num_products = random.randint(3, 8)
            for _ in range(num_products):
                cat = random.choice(list(categories.keys()))
                prod_name = random.choice(categories[cat])
                product = models.Product(
                    name=prod_name,
                    description=fake.paragraph(nb_sentences=3),
                    price=round(random.uniform(2.0, 50.0), 2),
                    unit=random.choice(["kg", "liter", "piece", "jar", "pack"]),
                    category=cat,
                    location=producer.location,
                    seller_id=producer.id,
                    seller_name=producer.name,
                    image_url=random.choice(product_images),
                    organic=random.choice([True, False]),
                    harvest_date=fake.date_between(start_date="-6m", end_date="today").isoformat(),
                    max_quantity=random.randint(10, 500),
                    rating=0,
                    review_count=0,
                )
                products.append(product)

        db.add_all(products)
        db.commit()

        for p in products:
            db.refresh(p)

        print(f"   - Created {len(products)} Products")

        # ==================== ORDERS & REVIEWS ====================
        reviews = []

        for buyer in buyers:
            num_orders = random.randint(1, 5)
            for _ in range(num_orders):
                order_date = fake.date_time_between(start_date="-3m", end_date="now")
                selected_products = random.sample(products, k=random.randint(1, 4))

                order_total = sum(p.price * random.randint(1, 5) for p in selected_products)

                order = models.Order(
                    customer_id=buyer.id,
                    customer_name=buyer.name,
                    total=round(order_total, 2),
                    status=random.choice(["Pending", "Completed", "Shipped", "Cancelled"]),
                    created_at=order_date,
                )
                db.add(order)
                db.commit()
                db.refresh(order)

                for prod in selected_products:
                    qty = random.randint(1, 5)
                    db.add(models.OrderItem(
                        order_id=order.id,
                        product_id=prod.id,
                        quantity=qty,
                        price=prod.price,
                    ))

                    if random.random() > 0.5:
                        rating = random.randint(3, 5)
                        reviews.append(models.Review(
                            product_id=prod.id,
                            author_id=buyer.id,
                            author=buyer.name,
                            rating=rating,
                            comment=fake.sentence(),
                            created_at=order_date + timedelta(days=random.randint(1, 7)),
                        ))
                        prod.review_count += 1
                        prod.rating = (
                            (prod.rating * (prod.review_count - 1)) + rating
                        ) / prod.review_count
                        db.add(prod)

        db.add_all(reviews)
        db.commit()

        # ==================== TEST USERS ====================
        print("Creating named test accounts...")

        test_producer = models.User(
            name="Test Producer",
            email="producer@test.com",
            password_hash=hash_password("Test1234!"),
            role="PRODUCER",
            location="Test Farm, Kalamata",
            farm_name="Test Farm",
            certifications=json.dumps(["Organic"]),
        )
        db.add(test_producer)
        db.commit()
        db.refresh(test_producer)

        test_buyer = models.User(
            name="Test Buyer",
            email="buyer@test.com",
            password_hash=hash_password("Test1234!"),
            role="BUYER",
            location="Athens",
            preferences=json.dumps(["Fruits"]),
        )
        db.add(test_buyer)
        db.commit()
        db.refresh(test_buyer)

        test_product = models.Product(
            name="Test Oranges",
            description="Fresh test oranges from the sunny groves of Test Farm. Perfect for juicing and snacking.",
            price=5.0,
            unit="kg",
            category="Fruits",
            location="Test Farm, Kalamata",
            seller_id=test_producer.id,
            seller_name=test_producer.name,
            image_url="https://images.unsplash.com/photo-1582285552433-28564db597c5?auto=format&fit=crop&q=80&w=800",
            organic=True,
            harvest_date=datetime.now().date().isoformat(),
            max_quantity=100,
            rating=5,
            review_count=1,
        )
        db.add(test_product)
        db.commit()
        db.refresh(test_product)

        test_statuses = ["Pending", "Processing", "Shipped", "Completed", "Cancelled", "Completed", "Pending"]
        for i, order_status in enumerate(test_statuses):
            order = models.Order(
                customer_id=test_buyer.id,
                customer_name=test_buyer.name,
                total=round(15.0 * (i + 1), 2),
                status=order_status,
                created_at=datetime.now() - timedelta(days=i),
            )
            db.add(order)
            db.commit()
            db.refresh(order)
            
            # Add a couple of items to the test order
            db.add(models.OrderItem(
                order_id=order.id,
                product_id=test_product.id,
                quantity=i + 1,
                price=product.price if 'product' in locals() else 5.0,
            ))
            
            if len(products) > 0:
                db.add(models.OrderItem(
                    order_id=order.id,
                    product_id=random.choice(products).id,
                    quantity=random.randint(1, 3),
                    price=10.0,
                ))

        db.commit()

        print(f"   - Created {len(reviews)} Reviews")
        print("Database seeded successfully!")
        print()
        print("Test accounts:")
        print("  Producer — email: producer@test.com  password: Test1234!")
        print("  Buyer    — email: buyer@test.com     password: Test1234!")


        # ==================== ADMIN USER ====================
        admin_user = models.User(
            name="Admin",
            email="admin@test.com",
            password_hash=hash_password("Admin1234!"),
            role="ADMIN",
            location="Admin HQ",
        )
        db.add(admin_user)
        db.commit()

        print("  Admin     — email: admin@test.com      password: Admin1234!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
