"use client";

import { useActionState } from "react";
import { submitInvitation } from "@/app/actions";

const initialState = {
  error: "",
};

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(submitInvitation, initialState);

  return (
    <>
      <h1>Enter Invitation Code</h1>
      <form action={formAction}>
        <div>
          <label htmlFor="code">Invitation Code</label>
          <input
            type="text"
            id="code"
            name="code"
            placeholder="XXXX-XXXX-XXXX"
            maxLength={14}
            disabled={isPending}
            required
          />
        </div>
        {state.error && <p style={{ color: "red" }}>{state.error}</p>}
        <button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </>
  );
}
