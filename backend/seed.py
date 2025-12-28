from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Create tables
models.Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(models.User).count()
        if existing_users > 0:
            print("Database already seeded!")
            return
        
        # Create Users
        users = [
            models.User(
                name="Papadopoulos Estate",
                role="PRODUCER",
                location="Kalamata, Messinia",
                farm_name="Papadopoulos Estate",
                certifications='["Organic Certified", "PDO"]'
            ),
            models.User(
                name="Meteora Dairy",
                role="PRODUCER",
                location="Elassona, Thessaly",
                farm_name="Meteora Dairy",
                certifications='["Bio Hellas"]'
            ),
            models.User(
                name="Guest Buyer",
                role="BUYER",
                location="Athens, Attica",
                preferences='["Vegetables", "Fruits", "Dairy"]'
            )
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        # Create Products
        products = [
            models.Product(
                name="Kalamata PDO Olive Oil",
                description="Cold-pressed extra virgin olive oil from our family groves in Messinia. Rich, peppery flavor with low acidity.",
                price=12.50,
                unit="liter",
                category="Oil & Olives",
                location="Kalamata, Messinia",
                seller_id=1,
                seller_name="Papadopoulos Estate",
                image_url="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
                organic=True,
                harvest_date="2023-11-15",
                expiration_date="2025-11-15",
                max_quantity=500,
                rating=4.8,
                review_count=124
            ),
            models.Product(
                name="Barrel-Aged Feta Cheese",
                description="Traditional feta cheese aged in oak barrels for 6 months. Made from 100% sheep milk from free-grazing herds.",
                price=9.80,
                unit="kg",
                category="Dairy & Eggs",
                location="Elassona, Thessaly",
                seller_id=2,
                seller_name="Meteora Dairy",
                image_url="https://images.unsplash.com/photo-1626957341926-98752fc2ba90?auto=format&fit=crop&q=80&w=800",
                organic=False,
                harvest_date="2024-03-10",
                expiration_date="2024-09-10",
                max_quantity=120,
                rating=4.9,
                review_count=89
            ),
            models.Product(
                name="Cretan Thyme Honey",
                description="Pure, raw thyme honey collected from the mountains of Sfakia. Golden color with intense aroma.",
                price=18.00,
                unit="jar",
                category="Honey & Jams",
                location="Sfakia, Crete",
                seller_id=1,
                seller_name="Papadopoulos Estate",
                image_url="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800",
                organic=True,
                harvest_date="2023-08-20",
                expiration_date="2026-08-20",
                max_quantity=200,
                rating=5.0,
                review_count=42
            )
        ]
        
        for product in products:
            db.add(product)
        db.commit()
        
        print("✅ Database seeded successfully!")
        print(f"   - Created {len(users)} users")
        print(f"   - Created {len(products)} products")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()