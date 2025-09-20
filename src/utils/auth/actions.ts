"use server";
import { createClient } from "@/utils/supabase/server";
import { mirrorUser } from "@/utils/auth/mirror";

interface AuthSuccess<T> {
  data: T;
  error: null;
}
interface AuthFailure {
  data: null;
  error: string;
}
type AuthResult<T> = AuthSuccess<T> | AuthFailure;

interface SignUpData {
  user: unknown;
  session: unknown;
  fullName?: string;
}
interface SignInData {
  user: unknown;
  session: unknown;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
}
export interface SignInPayload {
  email: string;
  password: string;
}

const normalizeEmail = (e: string) => e.trim();
const normalizeName = (n: string) => n.trim();

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function validateEmailAndPassword(
  email: string,
  password: string
): string | null {
  if (!email || !password) return "Email and password are required";
  return null;
}

function validateFullName(fullName: string): string | null {
  if (!fullName || fullName.trim().length < 2)
    return "Full name must be at least 2 characters";
  return null;
}

const providerLabelMap: Record<string, string> = {
  email: "Mail",
  google: "Google",
  github: "GitHub",
};
function formatProvider(p?: string | null) {
  if (!p) return null;
  const lower = p.toLowerCase();
  return providerLabelMap[lower] || capitalize(lower);
}

function mapSignUpError(
  message: string,
  existingProvider?: string | null
): string {
  const msg = message.toLowerCase();
  if (msg.includes("user already registered")) {
    const providerLabel = formatProvider(existingProvider || undefined);
    if (providerLabel)
      return `An account with this email already exists with ${providerLabel}`;
    return "An account with this email already exists with Email or Google or Github"; // fallback
  }
  if (msg.includes("password should be at least"))
    return "Password does not meet requirements";
  return message;
}

function mapSignInError(message: string, userExists: boolean | null): string {
  const msg = message.toLowerCase();
  if (msg.includes("invalid login credentials")) {
    if (userExists === false) return "No account found for this email";
    return "Incorrect password";
  }
  return message;
}

async function fetchExistingProvider(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("lookup_providers_by_email", {
      p_email: email,
    });
    console.log("lookup_providers_by_email", { data, error });
    if (!error && data && Array.isArray(data) && data.length > 0) {
      const row = data[0] as { primary_provider: string | null };
      return row.primary_provider ?? null;
    }
  } catch {}
  return null;
}

async function performSignUp(
  payload: SignUpPayload
): Promise<AuthResult<SignUpData>> {
  const email = normalizeEmail(payload.email);
  const fullName = normalizeName(payload.fullName);
  const basicErr =
    validateEmailAndPassword(email, payload.password) ||
    validateFullName(fullName);
  if (basicErr) return { data: null, error: basicErr };

  const supabase = await createClient();

  const existingProvider = await fetchExistingProvider(supabase, email);

  if (existingProvider) {
    const providerLabel = formatProvider(existingProvider);
    if (providerLabel) {
      return {
        data: null,
        error: `An account with this email already exists with ${providerLabel}`,
      };
    }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password: payload.password,
    options: { data: { full_name: fullName } },
  });

  if (error)
    return {
      data: null,
      error: mapSignUpError(error.message, existingProvider),
    };

  try {
    await mirrorUser({
      user: {
        id: (data.user as { id: string }).id,
        email: (data.user as { email: string | null }).email,
        user_metadata: (
          data.user as { user_metadata?: Record<string, unknown> }
        )?.user_metadata,
      },
      overrideName: fullName,
    });
  } catch {}

  return {
    data: { user: data.user, session: data.session, fullName },
    error: null,
  };
}

async function performSignIn(
  payload: SignInPayload
): Promise<AuthResult<SignInData>> {
  const email = normalizeEmail(payload.email);
  const basicErr = validateEmailAndPassword(email, payload.password);
  if (basicErr) return { data: null, error: basicErr };

  const supabase = await createClient();
  let userExists: boolean | null = null;
  try {
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("userId")
      .ilike("email", email)
      .maybeSingle();
    if (!userError) userExists = !!userRow;
  } catch {}

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: payload.password,
  });
  if (error)
    return { data: null, error: mapSignInError(error.message, userExists) };
  return { data: { user: data.user, session: data.session }, error: null };
}

export async function signUp(
  payload: SignUpPayload
): Promise<AuthResult<SignUpData>> {
  return performSignUp(payload);
}

export async function signIn(
  payload: SignInPayload
): Promise<AuthResult<SignInData>> {
  return performSignIn(payload);
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
}
