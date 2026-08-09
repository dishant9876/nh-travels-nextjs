import type { Step } from "@/lib/types";

const steps: { id: Exclude<Step, "done">; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "details", label: "Bus details" },
  { id: "seats", label: "Seats" },
  { id: "passenger", label: "Passenger" },
  { id: "payment", label: "Payment" },
];

export function ProgressSteps({ step }: { step: Step }) {
  if (step === "done") return null;
  const currentIndex = steps.findIndex((item) => item.id === step);
  return (
    <div className="progress">
      {steps.map((item, index) => (
        <div className={`progress-item ${index <= currentIndex ? "active" : ""}`} key={item.id}>
          <span>{index + 1}</span>{item.label}
        </div>
      ))}
    </div>
  );
}
