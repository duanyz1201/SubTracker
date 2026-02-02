"""Category schemas."""
from pydantic import BaseModel
from uuid import UUID


class CategoryBase(BaseModel):
    name: str
    color: str = "#4382FF"
    icon: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    icon: str | None = None
    sort_order: int | None = None


class CategoryResponse(CategoryBase):
    id: UUID
    sort_order: int
    service_count: int = 0

    class Config:
        from_attributes = True
