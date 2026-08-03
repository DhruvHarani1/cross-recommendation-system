from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from database import get_db
from models import User
from schemas.auth import UserSignup, UserResponse
from services.auth_service import hash_password
from dependencies.auth import get_current_user
from schemas.auth import UserLogin, LoginResponse
from services.auth_service import (
    verify_password,
    create_access_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/check-username/{username}")
def check_username(username: str, db: Session = Depends(get_db)):
    """Returns {available: true} if the username is not taken."""
    exists = db.query(User).filter(User.username == username).first()
    return {"available": exists is None}


@router.get("/check-email/{email}")
def check_email(email: str, db: Session = Depends(get_db)):
    """Returns {available: true} if the email is not already registered."""
    exists = db.query(User).filter(User.email == email).first()
    return {"available": exists is None}


@router.post("/signup", response_model=UserResponse)
def signup(user: UserSignup, db: Session = Depends(get_db)):

    # Check username
    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists."
        )

    # Check email
    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # Create new user
    new_user = User(
        user_id=str(uuid.uuid4()),
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        display_name=user.username,
        provider="local",
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=LoginResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not verify_password(
        user.password,
        db_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    token = create_access_token(
        {
            "sub": db_user.user_id,
            "username": db_user.username
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": db_user
    }


@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):

    return current_user