"use client";

import { ArrowLeft, ArrowRight, UserRound } from "lucide-react";
import type { Passenger, SelectedSeat } from "@/lib/types";
import { isPassengerValid } from "@/lib/journey";

type PassengerFormProps = {
  passenger: Passenger;
  setPassenger: React.Dispatch<React.SetStateAction<Passenger>>;
  selectedSeats: SelectedSeat[];
  from: string;
  to: string;
  dateLabel: string;
  total: number;
  onBack: () => void;
  onContinue: () => void;
};

type PassengerErrors = {
  name?: string;
  phone?: string;
  email?: string;
  sex?: string;
  age?: string;
  alternatePhone?: string;
};

const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
const AGE_REGEX = /^(?:1[0-9]|[2-9][0-9])$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PassengerForm({
  passenger,
  setPassenger,
  selectedSeats,
  from,
  to,
  dateLabel,
  total,
  onBack,
  onContinue,
}: PassengerFormProps) {
  const update = (key: keyof Passenger, value: string) => {
    setPassenger((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const validate = (): PassengerErrors => {
    const errors: PassengerErrors = {};

    // Full name
    if (!passenger.name.trim()) {
      errors.name = "Full name is required";
    } else if (passenger.name.trim().length < 2) {
      errors.name = "Enter a valid full name";
    }

    // Primary mobile
    if (!passenger.phone) {
      errors.phone = "Mobile number is required";
    } else if (!MOBILE_REGEX.test(passenger.phone)) {
      errors.phone = "Enter a valid 10-digit mobile number";
    }

    // Email
    if (!passenger.email.trim()) {
      errors.email = "Email address is required";
    } else if (!EMAIL_REGEX.test(passenger.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    // Sex
    if (!passenger.sex) {
      errors.sex = "Please select sex";
    }

    // Age
    if (!passenger.age) {
      errors.age = "Age is required";
    } else if (!AGE_REGEX.test(passenger.age)) {
      errors.age = "Age must be between 10 and 99";
    }

    // Alternate mobile
    if (passenger.alternatePhone) {
      if (!MOBILE_REGEX.test(passenger.alternatePhone)) {
        errors.alternatePhone =
          "Enter a valid 10-digit mobile number";
      } else if (
        passenger.alternatePhone === passenger.phone
      ) {
        errors.alternatePhone =
          "Alternate number must be different from primary number";
      }
    }

    return errors;
  };

  const errors = validate();

  const hasErrors = Object.keys(errors).length > 0;

  const canContinue =
    !hasErrors &&
    isPassengerValid(passenger) &&
    selectedSeats.length > 0;

  const handlePhoneChange = (
    value: string,
    field: "phone" | "alternatePhone"
  ) => {
    const numericValue = value
      .replace(/\D/g, "")
      .slice(0, 10);

    update(field, numericValue);
  };

  const handleAgeChange = (value: string) => {
    const numericValue = value
      .replace(/\D/g, "")
      .slice(0, 2);

    update("age", numericValue);
  };

  return (
    <section className="page passenger-page">
      {/* Header */}
      <div className="page-heading">
        <button
          type="button"
          className="back"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          <span>Back to seat selection</span>
        </button>

        <div>
          <h1>Passenger details</h1>
          <p>
            Enter the details we need to create your ticket.
          </p>
        </div>
      </div>

      {/* Main checkout layout */}
      <div className="checkout-grid">
        {/* LEFT SIDE */}
        <main className="checkout-main">
          {/* Primary passenger card */}
          <div className="checkout-card">
            <div className="card-head">
              <div>
                <h2>Primary passenger</h2>
                <p>
                  Passenger information used for your ticket
                </p>
              </div>

              <span className="required-label">
                * Required
              </span>
            </div>

            <div className="form-grid">
              {/* Full name */}
              <div className="form-field">
                <label htmlFor="passenger-name">
                  Full name <span className="required">*</span>
                </label>

                <input
                  id="passenger-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter full name"
                  value={passenger.name}
                  onChange={(event) =>
                    update(
                      "name",
                      event.target.value
                    )
                  }
                  className={
                    errors.name ? "input-error" : ""
                  }
                />

                {errors.name && (
                  <p className="field-error">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div className="form-field">
                <label htmlFor="passenger-phone">
                  Mobile number{" "}
                  <span className="required">*</span>
                </label>

                <input
                  id="passenger-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={passenger.phone}
                  onChange={(event) =>
                    handlePhoneChange(
                      event.target.value,
                      "phone"
                    )
                  }
                  className={
                    errors.phone ? "input-error" : ""
                  }
                />

                <span className="input-hint">
                  Enter a 10-digit Indian mobile number
                </span>

                {errors.phone && (
                  <p className="field-error">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="form-field">
                <label htmlFor="passenger-email">
                  Email address{" "}
                  <span className="required">*</span>
                </label>

                <input
                  id="passenger-email"
                  type="email"
                  autoComplete="email"
                  placeholder="ticket@example.com"
                  value={passenger.email}
                  onChange={(event) =>
                    update(
                      "email",
                      event.target.value
                    )
                  }
                  className={
                    errors.email ? "input-error" : ""
                  }
                />

                {errors.email && (
                  <p className="field-error">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="form-field">
                <label htmlFor="passenger-age">
                  Age <span className="required">*</span>
                </label>

                <input
                  id="passenger-age"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="Age"
                  value={passenger.age}
                  onChange={(event) =>
                    handleAgeChange(
                      event.target.value
                    )
                  }
                  className={
                    errors.age ? "input-error" : ""
                  }
                />

                <span className="input-hint">
                  Must be between 10 and 99
                </span>

                {errors.age && (
                  <p className="field-error">
                    {errors.age}
                  </p>
                )}
              </div>

              {/* SEX */}
              <div className="form-field form-field-full">
                <label>
                  Sex <span className="required">*</span>
                </label>

                <div className="sex-options">
                  {["Male", "Female", "Other"].map(
                    (option) => {
                      const selected =
                        passenger.sex === option;

                      return (
                        <label
                          key={option}
                          className={`sex-option ${
                            selected
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="passenger-sex"
                            value={option}
                            checked={selected}
                            onChange={() =>
                              update(
                                "sex",
                                option
                              )
                            }
                          />

                          <span className="sex-radio">
                            <span />
                          </span>

                          <span>{option}</span>
                        </label>
                      );
                    }
                  )}
                </div>

                {errors.sex && (
                  <p className="field-error">
                    {errors.sex}
                  </p>
                )}
              </div>

              {/* Alternate mobile */}
              <div className="form-field">
                <label htmlFor="alternate-phone">
                  Alternate mobile
                  <span className="optional-label">
                    Optional
                  </span>
                </label>

                <input
                  id="alternate-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="Optional alternate number"
                  value={
                    passenger.alternatePhone || ""
                  }
                  onChange={(event) =>
                    handlePhoneChange(
                      event.target.value,
                      "alternatePhone"
                    )
                  }
                  className={
                    errors.alternatePhone
                      ? "input-error"
                      : ""
                  }
                />

                {errors.alternatePhone && (
                  <p className="field-error">
                    {errors.alternatePhone}
                  </p>
                )}
              </div>

              {/* Special instructions */}
              <div className="form-field form-field-full">
                <label htmlFor="passenger-notes">
                  Special instructions
                  <span className="optional-label">
                    Optional
                  </span>
                </label>

                <textarea
                  id="passenger-notes"
                  rows={4}
                  maxLength={500}
                  placeholder="Optional notes for NH Travels"
                  value={passenger.notes || ""}
                  onChange={(event) =>
                    update(
                      "notes",
                      event.target.value
                    )
                  }
                />

                <span className="input-hint">
                  Maximum 500 characters
                </span>
              </div>
            </div>
          </div>

          {/* Information card */}
          <div className="checkout-card passenger-help">
            <div className="help-icon">
              <UserRound size={19} />
            </div>

            <div>
              <h3>Passenger information</h3>
              <p>
                Please enter accurate passenger details.
                Your name, mobile number and email will
                be used for ticketing and booking
                communication.
              </p>
            </div>
          </div>
        </main>

        {/* RIGHT SIDE */}
        <aside className="summary-card sticky">
          <div className="summary-head">
            <h2>Booking summary</h2>
          </div>

          {/* Route */}
          <div className="summary-route">
            <span>Route</span>

            <strong>
              {from} → {to}
            </strong>
          </div>

          {/* Date */}
          <div className="summary-line">
            <span>Date</span>
            <strong>{dateLabel}</strong>
          </div>

          {/* Seats */}
          <div className="summary-line summary-seats">
            <span>Seats</span>

            <div className="selected-seat-list">
              {selectedSeats.length > 0 ? (
                selectedSeats.map((seat) => (
                  <span
                    className="selected-seat-chip"
                    key={seat.id}
                  >
                    {seat.label}
                  </span>
                ))
              ) : (
                <span>No seats selected</span>
              )}
            </div>
          </div>

          {/* Fare */}
          <div className="summary-line">
            <span>Fare</span>
            <strong>
              ₹{total.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="summary-divider" />

          {/* Total */}
          <div className="summary-total">
            <span>Total</span>

            <strong>
              ₹{total.toLocaleString("en-IN")}
            </strong>
          </div>

          {/* Continue */}
          <button
            type="button"
            className="primary full"
            disabled={!canContinue}
            onClick={onContinue}
          >
            Continue to payment
            <ArrowRight size={17} />
          </button>

          {!selectedSeats.length && (
            <p className="summary-error">
              Please select at least one seat.
            </p>
          )}

          {selectedSeats.length > 0 && hasErrors && (
            <p className="summary-error">
              Please complete the required passenger
              details.
            </p>
          )}

          <p className="tiny">
            Your details are used for ticketing and
            booking communication.
          </p>
        </aside>
      </div>
    </section>
  );
}