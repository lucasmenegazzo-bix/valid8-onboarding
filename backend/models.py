from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    username: str
    password: str


class MfaRequest(BaseModel):
    code: str


class PersonalInfoRequest(BaseModel):
    email: str
    phone: str
    aliases: list[str] = []
    street: str = ""
    city: str = ""
    state: str = ""
    zip: str = ""
    addr_start: str = ""
    addr_end: str = ""


class EducationRequest(BaseModel):
    level: str
    institution: str = ""
    field_of_study: str = ""
    graduation_year: str = ""


class EmploymentRequest(BaseModel):
    employer: str
    title: str
    start_date: str
    end_date: Optional[str] = ""
    current: bool = False
