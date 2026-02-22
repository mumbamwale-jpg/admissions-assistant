export function handleFlow(state, message) {
  const text = message.toLowerCase();

  if (!state.step) {
    state.step = "ask_name";
    return { reply: "Hello! What is your full name?", state };
  }

  if (state.step === "ask_name") {
    state.name = message;
    state.step = "ask_nationality";
    return { reply: "Great! What is your nationality?", state };
  }

  if (state.step === "ask_nationality") {
    state.nationality = message;
    state.step = "ask_qualification";
    return { reply: "What is your highest qualification?", state };
  }

  if (state.step === "ask_qualification") {
    state.qualification = message;
    state.step = "ask_course";
    return { reply: "Which course are you interested in?", state };
  }

  if (state.step === "ask_course") {
    state.course = message;
    state.step = "ask_email";
    return { reply: "Please provide your email address.", state };
  }

  if (state.step === "ask_email") {
    state.email = message;
    state.step = "done";

    return {
      reply:
        "Thank you! You are now ready to apply.\n\n" +
        "Click the link below to complete your official application:\n\n" +
        "👉 https://your-application-form-link.com",
      state
    };
  }

  return { reply: "Please click the application link above to continue.", state };
}
