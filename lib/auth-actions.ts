"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

function safeRedirectTarget(formData: FormData, fallback: string) {
  const value = String(formData.get("redirectTo") ?? "");
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function signIn(formData: FormData) {
  const { email, password } = readCredentials(formData);
  const redirectTo = safeRedirectTarget(formData, "/admin");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  revalidatePath("/admin");
  redirect(redirectTo);
}

export async function signUp(formData: FormData) {
  const { email, password } = readCredentials(formData);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect("/admin");
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Account created. Check your email to confirm it, then sign in."
    )}`
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
