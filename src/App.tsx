import { useState } from "react";
import "./App.css";

type Screen =
  | "login"
  | "dashboard"
  | "medication"
  | "checkin"
  | "appointments"
  | "review"
  | "confirmation";

type Medication = {
  name: string;
  dose: string;
  time: string;
  taken: boolean;
};

type CheckIn = {
  pain: number;
  mobility: string;
  notes: string;
};

type Appointment = {
  type: string;
  date: string;
  time: string;
  location: string;
};

function App() {
  const [screen, setScreen] = useState<Screen>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [medName, setMedName] = useState("");
  const [dose, setDose] = useState("");
  const [medTime, setMedTime] = useState("");
  const [taken, setTaken] = useState(true);

  const [pain, setPain] = useState(0);
  const [mobility, setMobility] = useState("");
  const [notes, setNotes] = useState("");

  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [location, setLocation] = useState("");

  const [message, setMessage] = useState("");

  const medicationDone = medications.length > 0;
  const checkInDone = checkIn !== null;
  const appointmentDone = appointments.length > 0;

  const completedTasks = [
    medicationDone,
    checkInDone,
    appointmentDone,
  ].filter(Boolean).length;

  const progress = Math.round((completedTasks / 3) * 100);

  function goTo(nextScreen: Screen) {
    setMessage("");
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function loadSavedData(patientName: string) {
    try {
      const medResponse = await fetch(
        `http://127.0.0.1:8000/medications/${encodeURIComponent(patientName)}`
      );
      const medResult = await medResponse.json();

      if (medResponse.ok && medResult.status === "success") {
        setMedications(
          medResult.data.map((med: any) => ({
            name: med.medication_name,
            dose: med.dose,
            time: med.medication_time,
            taken: med.taken,
          }))
        );
      }

      const checkResponse = await fetch(
        `http://127.0.0.1:8000/checkins/${encodeURIComponent(patientName)}`
      );
      const checkResult = await checkResponse.json();

      if (
        checkResponse.ok &&
        checkResult.status === "success" &&
        checkResult.data.length > 0
      ) {
        const latestCheckIn = checkResult.data[0];

        setCheckIn({
          pain: latestCheckIn.pain_level,
          mobility: latestCheckIn.mobility,
          notes: latestCheckIn.notes || "",
        });
      }

      const appointmentResponse = await fetch(
        `http://127.0.0.1:8000/appointments/${encodeURIComponent(patientName)}`
      );
      const appointmentResult = await appointmentResponse.json();

      if (appointmentResponse.ok && appointmentResult.status === "success") {
        setAppointments(
          appointmentResult.data.map((appointment: any) => ({
            type: appointment.appointment_type,
            date: appointment.appointment_date,
            time: appointment.appointment_time,
            location: appointment.location,
          }))
        );
      }
    } catch (error) {
      console.error("Could not load saved recovery data:", error);
    }
  }
  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!consent) {
      setMessage("Please provide consent before continuing.");
      return;
    }

    setMessage("");
    await loadSavedData(name.trim());
    goTo("dashboard");
  }

  async function saveMedication(event: React.FormEvent) {
    event.preventDefault();

    if (!medName.trim() || !dose.trim() || !medTime) {
      setMessage("Please complete all medication fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_name: name,
          medication_name: medName.trim(),
          dose: dose.trim(),
          medication_time: medTime,
          taken: taken,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to save medication");
      }

      setMedications((current) => [
        ...current,
        {
          name: medName.trim(),
          dose: dose.trim(),
          time: medTime,
          taken,
        },
      ]);

      setMedName("");
      setDose("");
      setMedTime("");
      setTaken(true);

      setMessage("Medication entry saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Could not save medication. Please try again.");
    }
  }

  async function saveCheckIn(event: React.FormEvent) {
    event.preventDefault();

    if (!mobility) {
      setMessage("Please select your mobility level.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_name: name,
          pain_level: pain,
          mobility: mobility,
          notes: notes.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to save check-in");
      }

      setCheckIn({
        pain,
        mobility,
        notes: notes.trim(),
      });

      setMessage("Recovery check-in saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save check-in. Please try again.");
    }
  }
  async function saveAppointment(event: React.FormEvent) {
    event.preventDefault();

    if (
      !appointmentType.trim() ||
      !appointmentDate ||
      !appointmentTime ||
      !location.trim()
    ) {
      setMessage("Please complete all appointment fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_name: name,
          appointment_type: appointmentType.trim(),
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          location: location.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to save appointment");
      }

      setAppointments((current) => [
        ...current,
        {
          type: appointmentType.trim(),
          date: appointmentDate,
          time: appointmentTime,
          location: location.trim(),
        },
      ]);

      setAppointmentType("");
      setAppointmentDate("");
      setAppointmentTime("");
      setLocation("");

      setMessage("Appointment saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save appointment. Please try again.");
    }
  }

  function renderProgress() {
    const steps = [
      { key: "login", label: "Sign in" },
      { key: "dashboard", label: "Today" },
      { key: "medication", label: "Medication" },
      { key: "checkin", label: "Check-in" },
      { key: "appointments", label: "Appointments" },
      { key: "review", label: "Review" },
      { key: "confirmation", label: "Done" },
    ];

    const order = [
      "login",
      "dashboard",
      "medication",
      "checkin",
      "appointments",
      "review",
      "confirmation",
    ];

    const currentIndex = order.indexOf(screen);

    return (
      <div className="steps">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`step ${index === currentIndex ? "active" : ""
              } ${index < currentIndex ? "complete" : ""}`}
          >
            <span className="step-circle">
              {index < currentIndex ? "✓" : index + 1}
            </span>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>
    );
  }

  function LoginScreen() {
    return (
      <div className="card">
        <div className="card-title">
          <div className="icon-box">👋</div>

          <div>
            <p className="eyebrow">WELCOME</p>
            <h2>Welcome to DischargePal</h2>
            <p>
              A simple place to organise your recovery after leaving hospital.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="name">
            Your name <span className="required">*</span>
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
          />

          <p className="helper">
            Used to personalise your recovery dashboard.
          </p>

          <label htmlFor="email">
            Email address <span className="required">*</span>
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />

          <p className="helper">
            Used to identify your DischargePal account.
          </p>

          <div className="consent">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />

            <label htmlFor="consent">
              I understand that DischargePal helps me record and organise
              recovery information. It does not provide medical advice or
              diagnosis.
            </label>
          </div>

          {message && <div className="error-message">{message}</div>}

          <button className="primary full" type="submit">
            Continue
            <span>→</span>
          </button>
        </form>
      </div>
    );
  }

  function DashboardScreen() {
    return (
      <>
        <section className="welcome">
          <p className="eyebrow">YOUR RECOVERY, AT A GLANCE</p>

          <h2>Welcome, {name || "Patient"}</h2>

          <p>Here is your recovery plan for today.</p>
        </section>

        <div className="card">
          <div className="card-title">
            <div className="icon-box">☀️</div>

            <div>
              <h2>Today's plan</h2>
              <p>{completedTasks} of 3 recovery tasks recorded</p>
            </div>
          </div>

          <div className="progress-header">
            <strong>Recovery progress</strong>
            <strong>{progress}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-value"
              style={{ width: `${progress}%` }}
            />
          </div>

          <Task
            complete={medicationDone}
            title="Medication"
            text={
              medicationDone
                ? `${medications.length} medication ${medications.length === 1 ? "entry" : "entries"
                } recorded`
                : "Record whether you have taken your medication."
            }
            button={medicationDone ? "View / add" : "Record medication"}
            onClick={() => goTo("medication")}
          />

          <Task
            complete={checkInDone}
            title="Recovery check-in"
            text={
              checkInDone
                ? "Today's recovery check-in is recorded."
                : "Record how you are feeling today."
            }
            button={checkInDone ? "View / update" : "Start check-in"}
            onClick={() => goTo("checkin")}
          />

          <Task
            complete={appointmentDone}
            title="Appointments"
            text={
              appointmentDone
                ? `${appointments.length} appointment ${appointments.length === 1 ? "entry" : "entries"
                } recorded`
                : "Keep your upcoming follow-up appointments together."
            }
            button={appointmentDone ? "View / add" : "Add appointment"}
            onClick={() => goTo("appointments")}
          />

          {completedTasks === 3 && (
            <button
              className="primary review-button"
              onClick={() => goTo("review")}
            >
              Review today's information <span>→</span>
            </button>
          )}
        </div>
      </>
    );
  }

  function MedicationScreen() {
    return (
      <div className="card">
        <div className="card-title">
          <div className="icon-box">💊</div>

          <div>
            <p className="eyebrow">RECOVERY TASK</p>
            <h2>Medication</h2>
            <p>
              Record medication actions from your discharge instructions.
            </p>
          </div>
        </div>

        {medications.length > 0 && (
          <div className="saved-section">
            <h3>Recorded medication</h3>

            {medications.map((medication, index) => (
              <div className="saved-row" key={index}>
                <div>
                  <strong>{medication.name}</strong>
                  <p>
                    {medication.dose} • {medication.time}
                  </p>
                </div>

                <span
                  className={`badge ${medication.taken ? "green" : "grey"
                    }`}
                >
                  {medication.taken ? "Taken" : "Not taken"}
                </span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={saveMedication}>
          <label htmlFor="med-name">
            Medication name <span className="required">*</span>
          </label>

          <input
            id="med-name"
            value={medName}
            onChange={(event) => setMedName(event.target.value)}
            placeholder="e.g. Paracetamol"
          />

          <p className="helper">
            Enter the medication exactly as shown on your discharge
            instructions.
          </p>

          <label htmlFor="dose">
            Dose <span className="required">*</span>
          </label>

          <input
            id="dose"
            value={dose}
            onChange={(event) => setDose(event.target.value)}
            placeholder="e.g. 1 tablet"
          />

          <label htmlFor="med-time">
            Time <span className="required">*</span>
          </label>

          <input
            id="med-time"
            type="time"
            value={medTime}
            onChange={(event) => setMedTime(event.target.value)}
          />

          <fieldset>
            <legend>Did you take this dose?</legend>

            <div className="choice-row">
              <label className={`choice ${taken ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="taken"
                  checked={taken}
                  onChange={() => setTaken(true)}
                />
                ✓ Taken
              </label>

              <label className={`choice ${!taken ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="taken"
                  checked={!taken}
                  onChange={() => setTaken(false)}
                />
                Not taken
              </label>
            </div>
          </fieldset>

          {message && <div className="message">{message}</div>}

          <div className="button-row">
            <button
              type="button"
              className="secondary"
              onClick={() => goTo("dashboard")}
            >
              ← Back
            </button>

            <button className="primary" type="submit">
              Save medication
            </button>
          </div>
        </form>
      </div>
    );
  }

  function CheckInScreen() {
    return (
      <div className="card">
        <div className="card-title">
          <div className="icon-box">♡</div>

          <div>
            <p className="eyebrow">RECOVERY TASK</p>
            <h2>Recovery check-in</h2>
            <p>
              Record how you are feeling today. This is a self-report only.
            </p>
          </div>
        </div>

        <form onSubmit={saveCheckIn}>
          <label htmlFor="pain">
            Pain level: <strong>{pain}/10</strong>
          </label>

          <input
            className="range"
            id="pain"
            type="range"
            min="0"
            max="10"
            value={pain}
            onChange={(event) => setPain(Number(event.target.value))}
          />

          <div className="range-labels">
            <span>0 — No pain</span>
            <span>10 — Severe</span>
          </div>

          <p className="helper">
            DischargePal records the level you select. It does not interpret
            or diagnose your pain.
          </p>

          <label htmlFor="mobility">
            Mobility <span className="required">*</span>
          </label>

          <select
            id="mobility"
            value={mobility}
            onChange={(event) => setMobility(event.target.value)}
          >
            <option value="">Select your mobility</option>
            <option value="Moving normally">Moving normally</option>
            <option value="Some difficulty">Some difficulty</option>
            <option value="Significant difficulty">
              Significant difficulty
            </option>
          </select>

          <label htmlFor="notes">Optional notes</label>

          <textarea
            id="notes"
            rows={5}
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything you would like to remember about today..."
          />

          <p className="helper">{notes.length}/500 characters</p>

          {message && <div className="message">{message}</div>}

          <div className="button-row">
            <button
              type="button"
              className="secondary"
              onClick={() => goTo("dashboard")}
            >
              ← Back
            </button>

            <button className="primary" type="submit">
              Save check-in
            </button>
          </div>
        </form>
      </div>
    );
  }

  function AppointmentsScreen() {
    return (
      <div className="card">
        <div className="card-title">
          <div className="icon-box">📅</div>

          <div>
            <p className="eyebrow">RECOVERY TASK</p>
            <h2>Appointments</h2>
            <p>Keep your upcoming follow-up appointments in one place.</p>
          </div>
        </div>

        {appointments.length > 0 && (
          <div className="saved-section">
            <h3>Upcoming appointments</h3>

            {appointments.map((appointment, index) => (
              <div className="appointment" key={index}>
                <div className="date-box">
                  <strong>{appointment.date}</strong>
                  <span>{appointment.time}</span>
                </div>

                <div>
                  <strong>{appointment.type}</strong>
                  <p>{appointment.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={saveAppointment}>
          <label htmlFor="appointment-type">
            Appointment type <span className="required">*</span>
          </label>

          <input
            id="appointment-type"
            value={appointmentType}
            onChange={(event) => setAppointmentType(event.target.value)}
            placeholder="e.g. GP follow-up"
          />

          <div className="columns">
            <div>
              <label htmlFor="appointment-date">
                Date <span className="required">*</span>
              </label>

              <input
                id="appointment-date"
                type="date"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="appointment-time">
                Time <span className="required">*</span>
              </label>

              <input
                id="appointment-time"
                type="time"
                value={appointmentTime}
                onChange={(event) => setAppointmentTime(event.target.value)}
              />
            </div>
          </div>

          <label htmlFor="location">
            Location <span className="required">*</span>
          </label>

          <input
            id="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. GP clinic"
          />

          {message && <div className="message">{message}</div>}

          <div className="button-row">
            <button
              type="button"
              className="secondary"
              onClick={() => goTo("dashboard")}
            >
              ← Back
            </button>

            <button className="primary" type="submit">
              Save appointment
            </button>
          </div>
        </form>
      </div>
    );
  }

  function ReviewScreen() {
    return (
      <>
        <section className="welcome">
          <p className="eyebrow">ALMOST FINISHED</p>
          <h2>Review your information</h2>
          <p>Check your entries before confirming today's recovery record.</p>
        </section>

        <ReviewCard title="Medication" edit={() => goTo("medication")}>
          {medications.map((medication, index) => (
            <div className="review-line" key={index}>
              <strong>{medication.name}</strong>
              <span>
                {medication.dose} • {medication.time} •{" "}
                {medication.taken ? "Taken" : "Not taken"}
              </span>
            </div>
          ))}
        </ReviewCard>

        <ReviewCard title="Recovery check-in" edit={() => goTo("checkin")}>
          {checkIn ? (
            <>
              <p>
                <strong>Pain:</strong> {checkIn.pain}/10
              </p>

              <p>
                <strong>Mobility:</strong> {checkIn.mobility}
              </p>

              {checkIn.notes && (
                <p>
                  <strong>Notes:</strong> {checkIn.notes}
                </p>
              )}
            </>
          ) : (
            <p>No check-in recorded.</p>
          )}
        </ReviewCard>

        <ReviewCard
          title="Appointments"
          edit={() => goTo("appointments")}
        >
          {appointments.map((appointment, index) => (
            <div className="review-line" key={index}>
              <strong>{appointment.type}</strong>
              <span>
                {appointment.date} at {appointment.time} •{" "}
                {appointment.location}
              </span>
            </div>
          ))}
        </ReviewCard>

        <div className="button-row">
          <button
            className="secondary"
            onClick={() => goTo("dashboard")}
          >
            ← Back
          </button>

          <button
            className="primary"
            onClick={() => goTo("confirmation")}
          >
            Confirm today's record →
          </button>
        </div>
      </>
    );
  }

  function ConfirmationScreen() {
    return (
      <div className="card confirmation">
        <div className="big-check">✓</div>

        <p className="eyebrow">RECOVERY LOG COMPLETE</p>

        <h2>Today's information is recorded</h2>

        <p>
          Thank you, {name}. Your recovery information has been recorded in
          DischargePal.
        </p>

        <div className="reminder">
          <strong>Remember</strong>

          <p>
            DischargePal helps organise information you provide. It does not
            replace advice from your healthcare team.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => goTo("dashboard")}
        >
          Return to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div className="logo">+</div>

        <div>
          <h1>DischargePal</h1>
          <p>Your recovery plan after leaving hospital</p>
        </div>
      </header>

      <main>
        {renderProgress()}

        <div className="safety">
          <strong>Important:</strong> DischargePal records information you
          provide and helps organise recovery tasks. It does not provide
          medical advice or diagnosis. For urgent medical concerns, contact
          your healthcare provider or emergency services.
        </div>

        {screen === "login" && <LoginScreen />}
        {screen === "dashboard" && <DashboardScreen />}
        {screen === "medication" && <MedicationScreen />}
        {screen === "checkin" && <CheckInScreen />}
        {screen === "appointments" && <AppointmentsScreen />}
        {screen === "review" && <ReviewScreen />}
        {screen === "confirmation" && <ConfirmationScreen />}
      </main>

      <footer>DischargePal • Recovery support, not medical advice</footer>
    </div>
  );
}

function Task({
  complete,
  title,
  text,
  button,
  onClick,
}: {
  complete: boolean;
  title: string;
  text: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="task">
      <div className="task-info">
        <div className={`status ${complete ? "done" : ""}`}>
          {complete ? "✓" : "○"}
        </div>

        <div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </div>

      <button className="small-button" onClick={onClick}>
        {button} →
      </button>
    </div>
  );
}

function ReviewCard({
  title,
  edit,
  children,
}: {
  title: string;
  edit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card review-card">
      <div>
        <h3>{title}</h3>
        {children}
      </div>

      <button className="secondary small" onClick={edit}>
        Edit
      </button>
    </div>
  );
}

export default App