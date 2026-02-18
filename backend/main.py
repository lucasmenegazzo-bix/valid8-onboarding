from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from models import LoginRequest, MfaRequest, PersonalInfoRequest, EducationRequest, EmploymentRequest
from mock_data import MOCK_USER, MOCK_ID_SCAN, MOCK_PROGRESS
import os
import httpx

app = FastAPI(title="Valid8 Onboarding API")

PERSONA_API_KEY = os.getenv("PERSONA_API_KEY", "")
PERSONA_TEMPLATE_ID = os.getenv("PERSONA_TEMPLATE_ID", "")
PERSONA_API_BASE = "https://withpersona.com/api/v1"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/login")
async def login(req: LoginRequest):
    return {"session_token": "sess_abc123", "mfa_required": True}


@app.post("/api/auth/mfa")
async def verify_mfa(req: MfaRequest):
    return {
        "access_token": "tok_xyz789",
        "user": MOCK_USER,
    }


@app.get("/api/user/profile")
async def get_profile():
    return {
        **MOCK_USER,
        "profile_status": "incomplete",
        "onboarding_progress": MOCK_PROGRESS,
    }


@app.post("/api/onboarding/id-scan")
async def id_scan():
    return MOCK_ID_SCAN


@app.post("/api/onboarding/liveness")
async def liveness_check():
    return {"passed": True}


@app.post("/api/onboarding/personal-info")
async def save_personal_info(req: PersonalInfoRequest):
    return {"saved": True, "message": "Personal information saved"}


@app.post("/api/onboarding/education")
async def save_education(req: EducationRequest):
    return {"saved": True, "message": "Education saved"}


@app.post("/api/onboarding/employment")
async def save_employment(req: EmploymentRequest):
    return {"saved": True, "message": "Employment saved"}


@app.get("/api/onboarding/progress")
async def get_progress():
    return MOCK_PROGRESS


# ── Persona KYC endpoints ────────────────────────────────────────

@app.post("/api/kyc/persona/create-inquiry")
async def persona_create_inquiry(request: Request):
    """Create a Persona inquiry server-side and return the inquiry ID + session token."""
    body = await request.json()
    reference_id = body.get("reference_id", "")

    if not PERSONA_API_KEY:
        # Fallback: let the frontend handle it with client-side template
        return {"inquiry_id": None, "session_token": None, "note": "No API key configured; use client-side template flow"}

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PERSONA_API_BASE}/inquiries",
            headers={
                "Authorization": f"Bearer {PERSONA_API_KEY}",
                "Persona-Version": "2023-01-05",
                "Content-Type": "application/json",
            },
            json={
                "data": {
                    "attributes": {
                        "inquiry-template-id": PERSONA_TEMPLATE_ID,
                        "reference-id": reference_id,
                    }
                }
            },
        )
        data = resp.json()
        inquiry = data.get("data", {})
        inquiry_id = inquiry.get("id")
        session_token = inquiry.get("attributes", {}).get("session-token")
        return {"inquiry_id": inquiry_id, "session_token": session_token}


@app.get("/api/kyc/persona/inquiry/{inquiry_id}")
async def persona_get_inquiry(inquiry_id: str):
    """Retrieve an existing Persona inquiry to read its status and extracted fields."""
    if not PERSONA_API_KEY:
        return {"status": "mock", "fields": MOCK_ID_SCAN}

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{PERSONA_API_BASE}/inquiries/{inquiry_id}",
            headers={
                "Authorization": f"Bearer {PERSONA_API_KEY}",
                "Persona-Version": "2023-01-05",
            },
        )
        return resp.json()


@app.post("/api/kyc/persona/webhook")
async def persona_webhook(request: Request):
    """Receive Persona webhook events (inquiry.completed, etc.)."""
    payload = await request.json()
    event_type = payload.get("data", {}).get("attributes", {}).get("name", "")
    inquiry_id = (
        payload.get("data", {}).get("relationships", {}).get("inquiry", {}).get("data", {}).get("id")
    )
    print(f"[Persona webhook] event={event_type} inquiry={inquiry_id}")
    # TODO: persist verification result
    return {"received": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
