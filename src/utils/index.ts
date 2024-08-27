export function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (typeof value !== "string") {
    throw new Error(`Environment variable ${name} is missing or not a string.`);
  }
  return value;
}
