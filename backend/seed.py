from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from datetime import datetime, timedelta
from faker import Faker
import random
import json

# Initialize Faker with Greek locale
fake = Faker('el_GR')

# Create tables
models.Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    
    try:
        print("🗑️  Cleaning up existing data...")
        # Delete in order of dependencies (child first)
        db.query(models.Review).delete()
        db.query(models.OrderItem).delete()
        db.query(models.Order).delete()
        db.query(models.Product).delete()
        db.query(models.User).delete()
        db.commit()
        
        print("🌱 Seeding new data...")
        
        # 1. Create Users
        # Producers (10)
        producers = []
        for _ in range(10):
            producer = models.User(
                name=fake.company(),
                role="PRODUCER",
                location=fake.city(),
                farm_name=f"{fake.last_name()} Farm",
                certifications=json.dumps(random.sample(["Organic", "BIO", "PDO", "PGI", "GlobalGAP"], k=random.randint(1, 3))),
                created_at=fake.date_time_between(start_date="-1y", end_date="now")
            )
            producers.append(producer)
            
        # Buyers (10)
        buyers = []
        for _ in range(10):
            buyer = models.User(
                name=fake.name(),
                role="BUYER",
                location=fake.city(),
                preferences=json.dumps(random.sample(["Vegetables", "Fruits", "Dairy", "Honey", "Oil", "Nuts"], k=random.randint(1, 4))),
                created_at=fake.date_time_between(start_date="-1y", end_date="now")
            )
            buyers.append(buyer)
            
        db.add_all(producers + buyers)
        db.commit() 
        
        # Refresh to get IDs
        for u in producers + buyers:
            db.refresh(u)
            
        print(f"   - Created {len(producers)} Producers and {len(buyers)} Buyers")
        
        # 2. Create Products
        categories = {
            "Oil & Olives": ["Extra Virgin Olive Oil", "Kalamata Olives", "Green Olives", "Organic Olive Oil"],
            "Honey & Jams": ["Thyme Honey", "Pine Honey", "Fig Jam", "Strawberry Jam"],
            "Dairy & Eggs": ["Feta Cheese", "Graviera", "Sheep Yogurt", "Free Range Eggs", "Goat Cheese"],
            "Vegetables": ["Tomatoes", "Cucumbers", "Peppers", "Eggplants", "Potatoes"],
            "Fruits": ["Oranges", "Apples", "Watermelon", "Grapes", "Figs"],
            "Nuts": ["Walnuts", "Almonds", "Pistachios"],
            "Herbs": ["Oregano", "Mountain Tea", "Basil"]
        }
        
        product_images = [
            "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1626957341926-98752fc2ba90?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1571212515416-f785d774e644?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1560155016-bd4879ae8f21?auto=format&fit=crop&q=80&w=800", # Grapes
            "https://images.unsplash.com/photo-1582285552433-28564db597c5?auto=format&fit=crop&q=80&w=800"  # Oranges
        ]
        
        products = []
        for producer in producers:
            # Each producer has 3-8 products
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
                    rating=0, # Will update with reviews
                    review_count=0
                )
                products.append(product)
        
        db.add_all(products)
        db.commit()
        
        for p in products:
            db.refresh(p)
            
        print(f"   - Created {len(products)} Products")
        
        # 3. Create Orders and Reviews
        orders = []
        reviews = []
        
        for buyer in buyers:
            # Each buyer makes 1-5 orders
            num_orders = random.randint(1, 5)
            for _ in range(num_orders):
                order_date = fake.date_time_between(start_date="-3m", end_date="now")
                
                # Order items
                order_items = []
                order_total = 0
                
                # Pick 1-4 random products
                selected_products = random.sample(products, k=random.randint(1, 4))
                
                for prod in selected_products:
                    qty = random.randint(1, 5)
                    price = prod.price
                    item_total = price * qty
                    order_total += item_total
                    
                    # 50% chance to review
                    if random.random() > 0.5:
                        rating = random.randint(3, 5)
                        review = models.Review(
                            product_id=prod.id,
                            author=buyer.name,
                            rating=rating,
                            comment=fake.sentence(),
                            created_at=order_date + timedelta(days=random.randint(1, 7))
                        )
                        reviews.append(review)
                        
                        # Update product rating (simple approx)
                        prod.review_count += 1
                        prod.rating = (prod.rating * (prod.review_count - 1) + rating) / prod.review_count
                        db.add(prod)

                # Create Order
                order = models.Order(
                    customer_id=buyer.id,
                    customer_name=buyer.name,
                    total=round(order_total, 2),
                    status=random.choice(["Pending", "Completed", "Shipped", "Cancelled"]),
                    rating=None, # Order rating separate from product review
                    created_at=order_date
                )
                db.add(order)
                db.commit() # Get order ID
                db.refresh(order)
                
                for prod in selected_products:
                     # Re-calculate qty for item record
                    qty = random.randint(1, 5)
                    op = models.OrderItem(
                        order_id=order.id, 
                        product_id=prod.id, 
                        quantity=qty, 
                        price=prod.price
                    )
                    db.add(op)
                    
        db.add_all(reviews)
        db.commit()
        
        print(f"   - Created {len(reviews)} Reviews")
        print("✅ Database seeded successfully with DYNAMIC data!")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()