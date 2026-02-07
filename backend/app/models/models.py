"""
SQLAlchemy models for ListNest price comparison database
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Boolean, Numeric, DateTime,
    ForeignKey, Text, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.database import Base


class Chain(Base):
    """Supermarket chain"""
    __tablename__ = "chains"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_he: Mapped[str] = mapped_column(String(100), nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    stores: Mapped[List["Store"]] = relationship("Store", back_populates="chain")
    prices: Mapped[List["Price"]] = relationship("Price", back_populates="chain")

    def __repr__(self):
        return f"<Chain {self.name_he}>"


class Store(Base):
    """Individual store location"""
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chain_id: Mapped[int] = mapped_column(Integer, ForeignKey("chains.id"), nullable=False)
    store_id: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    chain: Mapped["Chain"] = relationship("Chain", back_populates="stores")

    __table_args__ = (
        UniqueConstraint('chain_id', 'store_id', name='uix_chain_store'),
        Index('idx_stores_chain', 'chain_id'),
    )


class Product(Base):
    """Product catalog"""
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    barcode: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_normalized: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    subcategory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    manufacturer: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    unit_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # 'unit', 'kg', 'liter'
    unit_quantity: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 3), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    prices: Mapped[List["Price"]] = relationship("Price", back_populates="product")
    price_history: Mapped[List["PriceHistory"]] = relationship("PriceHistory", back_populates="product")

    __table_args__ = (
        Index('idx_products_name', 'name'),
        Index('idx_products_name_normalized', 'name_normalized'),
        Index('idx_products_category', 'category'),
    )

    def __repr__(self):
        return f"<Product {self.name}>"


class Price(Base):
    """Current prices for products at chains"""
    __tablename__ = "prices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    chain_id: Mapped[int] = mapped_column(Integer, ForeignKey("chains.id"), nullable=False)
    store_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("stores.id"), nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)  # Price per unit/kg
    is_on_sale: Mapped[bool] = mapped_column(Boolean, default=False)
    sale_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    promotion_description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="prices")
    chain: Mapped["Chain"] = relationship("Chain", back_populates="prices")

    __table_args__ = (
        UniqueConstraint('product_id', 'chain_id', name='uix_product_chain'),
        Index('idx_prices_product', 'product_id'),
        Index('idx_prices_chain', 'chain_id'),
        Index('idx_prices_updated', 'last_updated'),
    )

    def __repr__(self):
        return f"<Price {self.product_id}@{self.chain_id}: {self.price}>"


class PriceHistory(Base):
    """Historical price tracking"""
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    chain_id: Mapped[int] = mapped_column(Integer, ForeignKey("chains.id"), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    was_on_sale: Mapped[bool] = mapped_column(Boolean, default=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="price_history")

    __table_args__ = (
        Index('idx_history_product', 'product_id'),
        Index('idx_history_chain', 'chain_id'),
        Index('idx_history_date', 'recorded_at'),
    )

    def __repr__(self):
        return f"<PriceHistory {self.product_id}@{self.chain_id}: {self.price} on {self.recorded_at}>"
