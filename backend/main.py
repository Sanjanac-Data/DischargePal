import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or key is missing from the .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(
    title="DischargePal API",
    description="Python backend API for the DischargePal recovery application",
    version="1.0.0",
)

# Allows the React development app to communicate with Python.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": "DischargePal",
        "message": "DischargePal Python backend is running",
        "status": "healthy",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DischargePal API",
    }
@app.get("/test-database")
def test_database():
    try:
        response = supabase.table("medications").select("*").execute()

        return {
            "status": "success",
            "message": "Supabase connected successfully",
            "medications": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    from pydantic import BaseModel

class Medication(BaseModel):
    patient_name: str
    medication_name: str
    dose: str
    medication_time: str
    taken:bool


@app.post("/medications")
def add_medication(medication: Medication):
    try:
        response = (
            supabase.table("medications")
            .insert({
                "patient_name": medication.patient_name,
                "medication_name": medication.medication_name,
                "dose": medication.dose,
                "medication_time": medication.medication_time,
                "taken": medication.taken
            })
            .execute()
        )

        return {
            "status": "success",
            "message": "Medication added successfully",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

class CheckIn(BaseModel):
    patient_name: str
    pain_level: int
    mobility: str
    notes: str


@app.post("/checkins")
def add_checkin(checkin: CheckIn):
    try:
        response = (
            supabase.table("checkins")
            .insert({
                "patient_name": checkin.patient_name,
                "pain_level": checkin.pain_level,
                "mobility": checkin.mobility,
                "notes": checkin.notes
            })
            .execute()
        )

        return {
            "status": "success",
            "message": "Check-in saved successfully",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

class Appointment(BaseModel):
    patient_name: str
    appointment_type: str
    appointment_date: str
    appointment_time: str
    location: str


@app.post("/appointments")
def add_appointment(appointment: Appointment):
    try:
        response = (
            supabase.table("appointments")
            .insert({
                "patient_name": appointment.patient_name,
                "appointment_type": appointment.appointment_type,
                "appointment_date": appointment.appointment_date,
                "appointment_time": appointment.appointment_time,
                "location": appointment.location
            })
            .execute()
        )

        return {
            "status": "success",
            "message": "Appointment added successfully",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
@app.get("/medications/{patient_name}")
def get_medications(patient_name: str):
    try:
        response = (
            supabase.table("medications")
            .select("*")
            .eq("patient_name", patient_name)
            .execute()
        )

        return {
            "status": "success",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/checkins/{patient_name}")
def get_checkins(patient_name: str):
    try:
        response = (
            supabase.table("checkins")
            .select("*")
            .eq("patient_name", patient_name)
            .execute()
        )

        return {
            "status": "success",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/appointments/{patient_name}")
def get_appointments(patient_name: str):
    try:
        response = (
            supabase.table("appointments")
            .select("*")
            .eq("patient_name", patient_name)
            .execute()
        )

        return {
            "status": "success",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        } 