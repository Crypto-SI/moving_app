import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("moving_move_members")
    .select("move_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership) {
    redirect("/dashboard");
  }

  redirect("/join");
}
