export function getRegistrations() {
    const registrations = JSON.parse(
      localStorage.webauthnExampleRegistrations || "[]",
    );
    return registrations;
  }
  export function setRegistrations(
    registrations:any,
  ): void {
    localStorage.webauthnExampleRegistrations = JSON.stringify(
      registrations,
      null,
      "  ",
    );
  }
  export function saveRegistration(
    registration: any,
  ): void {
    const registrations = getRegistrations();
    registrations.push(registration.toJSON());
    setRegistrations(registrations);
  }
  