from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from models import LoginRequest, MfaRequest, PersonalInfoRequest, EducationRequest, EmploymentRequest
from mock_data import MOCK_USER, MOCK_ID_SCAN, MOCK_PROGRESS
import os
import httpx
import asyncio
import base64

app = FastAPI(title="Valid8 Onboarding API")

PERSONA_API_KEY = os.getenv("PERSONA_API_KEY", "")
PERSONA_TEMPLATE_ID = os.getenv("PERSONA_TEMPLATE_ID", "")
PERSONA_API_BASE = "https://withpersona.com/api/v1"

ONFIDO_API_TOKEN = os.getenv("ONFIDO_API_TOKEN", "")
ONFIDO_API_BASE = "https://api.onfido.com/v3.6"  # US region; use api.eu.onfido.com for EU

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


@app.post("/api/kyc/persona/verify-direct")
async def persona_verify_direct(
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(None),
    selfie_image: UploadFile = File(...),
    reference_id: str = Form(""),
    id_class: str = Form("pp"),
):
    """
    Full Persona verification via API only — no SDK involved.
    1. Create an inquiry
    2. Upload government-id verification (front + optional back)
    3. Upload selfie verification
    4. Submit the inquiry for review
    5. Poll until completed or timeout

    id_class values: 'pp' (passport), 'dl' (driver license), 'id' (national id)
    """
    if not PERSONA_API_KEY:
        # Mock response when no API key configured
        return {
            "status": "completed",
            "fields": MOCK_ID_SCAN,
            "inquiry_id": "inq_mock_direct",
            "note": "No API key configured; returning mock data",
        }

    headers = {
        "Authorization": f"Bearer {PERSONA_API_KEY}",
        "Persona-Version": "2023-01-05",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        # ── 1. Create inquiry ──
        create_resp = await client.post(
            f"{PERSONA_API_BASE}/inquiries",
            headers={**headers, "Content-Type": "application/json"},
            json={
                "data": {
                    "attributes": {
                        "inquiry-template-id": PERSONA_TEMPLATE_ID,
                        "reference-id": reference_id,
                    }
                }
            },
        )
        create_data = create_resp.json()
        inquiry = create_data.get("data", {})
        inquiry_id = inquiry.get("id")
        if not inquiry_id:
            return {"status": "error", "message": "Failed to create inquiry", "details": create_data}

        # Find the government_id and selfie verification IDs
        verifications = inquiry.get("relationships", {}).get("verifications", {}).get("data", [])
        gov_id_verif = None
        selfie_verif = None
        for v in verifications:
            if v.get("type") == "verification/government-id":
                gov_id_verif = v.get("id")
            elif v.get("type") == "verification/selfie":
                selfie_verif = v.get("id")

        # If verification IDs aren't in relationships, list them
        if not gov_id_verif or not selfie_verif:
            verif_resp = await client.get(
                f"{PERSONA_API_BASE}/inquiries/{inquiry_id}/verifications",
                headers=headers,
            )
            verif_list = verif_resp.json().get("data", [])
            for v in verif_list:
                v_type = v.get("type", "")
                if "government-id" in v_type and not gov_id_verif:
                    gov_id_verif = v.get("id")
                elif "selfie" in v_type and not selfie_verif:
                    selfie_verif = v.get("id")

        # ── 2. Upload front of ID ──
        front_bytes = await front_image.read()
        front_b64 = base64.b64encode(front_bytes).decode()

        upload_payload = {
            "data": {
                "attributes": {
                    "front-photo": f"data:{front_image.content_type or 'image/jpeg'};base64,{front_b64}",
                    "id-class": id_class,
                }
            }
        }

        # Add back photo if provided
        if back_image:
            back_bytes = await back_image.read()
            back_b64 = base64.b64encode(back_bytes).decode()
            upload_payload["data"]["attributes"]["back-photo"] = (
                f"data:{back_image.content_type or 'image/jpeg'};base64,{back_b64}"
            )

        if gov_id_verif:
            await client.patch(
                f"{PERSONA_API_BASE}/verifications/government-ids/{gov_id_verif}/submit",
                headers={**headers, "Content-Type": "application/json"},
                json=upload_payload,
            )

        # ── 3. Upload selfie ──
        selfie_bytes = await selfie_image.read()
        selfie_b64 = base64.b64encode(selfie_bytes).decode()

        if selfie_verif:
            await client.patch(
                f"{PERSONA_API_BASE}/verifications/selfies/{selfie_verif}/submit",
                headers={**headers, "Content-Type": "application/json"},
                json={
                    "data": {
                        "attributes": {
                            "center-photo": f"data:{selfie_image.content_type or 'image/jpeg'};base64,{selfie_b64}",
                        }
                    }
                },
            )

        # ── 4. Submit inquiry for review ──
        await client.post(
            f"{PERSONA_API_BASE}/inquiries/{inquiry_id}/submit",
            headers=headers,
        )

        # ── 5. Poll for completion (up to 30 seconds) ──
        final_status = "pending"
        fields = {}
        for _ in range(15):
            await asyncio.sleep(2)
            poll_resp = await client.get(
                f"{PERSONA_API_BASE}/inquiries/{inquiry_id}",
                headers=headers,
            )
            poll_data = poll_resp.json().get("data", {})
            final_status = poll_data.get("attributes", {}).get("status", "pending")
            if final_status in ("completed", "approved", "declined", "failed", "needs_review"):
                attrs = poll_data.get("attributes", {})
                fields = attrs.get("fields", {})
                break

        # Extract readable fields
        def field_val(f):
            if isinstance(f, dict):
                return f.get("value", "")
            return str(f) if f else ""

        extracted = {
            "fullName": f"{field_val(fields.get('name-first', ''))} {field_val(fields.get('name-last', ''))}".strip(),
            "birthdate": field_val(fields.get("birthdate", "")),
            "gender": field_val(fields.get("sex", "")),
            "idType": field_val(fields.get("identification-class", "")) or "Government ID",
            "idNumber": field_val(fields.get("identification-number", "")),
            "expirationDate": field_val(fields.get("expiration-date", "")),
        }

        return {
            "status": final_status,
            "inquiry_id": inquiry_id,
            "fields": extracted,
        }


# ── Onfido KYC endpoints ─────────────────────────────────────────

@app.post("/api/kyc/onfido/sdk-token")
async def onfido_sdk_token(request: Request):
    """Create an Onfido applicant and generate an SDK token for the web SDK."""
    body = await request.json() if await request.body() else {}
    first_name = body.get("first_name", "Jane")
    last_name = body.get("last_name", "Doe")

    if not ONFIDO_API_TOKEN:
        # No API token configured – return a mock token so the frontend still renders
        return {
            "sdk_token": "mock_onfido_sdk_token_sandbox",
            "applicant_id": "mock_applicant_id",
            "note": "No ONFIDO_API_TOKEN configured; using mock token",
        }

    headers = {
        "Authorization": f"Token token={ONFIDO_API_TOKEN}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        # 1. Create applicant
        applicant_resp = await client.post(
            f"{ONFIDO_API_BASE}/applicants",
            headers=headers,
            json={"first_name": first_name, "last_name": last_name},
        )
        applicant_data = applicant_resp.json()
        applicant_id = applicant_data.get("id")

        if not applicant_id:
            return {"error": "Failed to create applicant", "details": applicant_data}

        # 2. Generate SDK token
        sdk_resp = await client.post(
            f"{ONFIDO_API_BASE}/sdk_token",
            headers=headers,
            json={
                "applicant_id": applicant_id,
                "referrer": "*://*/*",  # allow any referrer in sandbox
            },
        )
        sdk_data = sdk_resp.json()
        sdk_token = sdk_data.get("token")

        return {"sdk_token": sdk_token, "applicant_id": applicant_id}


@app.post("/api/kyc/onfido/create-check")
async def onfido_create_check(request: Request):
    """Create an Onfido check (document + facial_similarity_photo) after SDK capture."""
    body = await request.json()
    applicant_id = body.get("applicant_id", "")

    if not ONFIDO_API_TOKEN or not applicant_id:
        return {"check_id": "mock_check_id", "status": "in_progress"}

    headers = {
        "Authorization": f"Token token={ONFIDO_API_TOKEN}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ONFIDO_API_BASE}/checks",
            headers=headers,
            json={
                "applicant_id": applicant_id,
                "report_names": ["document", "facial_similarity_photo"],
            },
        )
        data = resp.json()
        return {
            "check_id": data.get("id"),
            "status": data.get("status"),
            "result": data.get("result"),
        }


@app.post("/api/kyc/onfido/webhook")
async def onfido_webhook(request: Request):
    """Receive Onfido webhook events."""
    payload = await request.json()
    action = payload.get("payload", {}).get("action", "")
    resource_type = payload.get("payload", {}).get("resource_type", "")
    object_id = payload.get("payload", {}).get("object", {}).get("id", "")
    print(f"[Onfido webhook] action={action} resource={resource_type} id={object_id}")
    # TODO: persist verification result
    return {"received": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
