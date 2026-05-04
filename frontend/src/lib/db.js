import { supabase } from "./supabase";

/**
 * Upsert an alumnus by email and return their id.
 * Anonymous email-only captures supply just { email }.
 */
export async function upsertAlumnus(profile) {
  const payload = { ...profile };
  // Strip undefined keys
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  // Try to find existing by email
  if (payload.email) {
    const { data: existing } = await supabase
      .from("alumni_profiles")
      .select("id")
      .eq("email", payload.email)
      .maybeSingle();

    if (existing?.id) {
      // Update non-empty fields
      const updateFields = { ...payload };
      delete updateFields.email;
      if (Object.keys(updateFields).length > 0) {
        await supabase.from("alumni_profiles").update(updateFields).eq("id", existing.id);
      }
      return existing.id;
    }
  }

  const { data, error } = await supabase
    .from("alumni_profiles")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function logEngagement(alumniId, source, stage) {
  const { error } = await supabase
    .from("engagement_entries")
    .insert({ alumni_id: alumniId, source, stage });
  if (error) throw error;
}

export async function recordConsent(alumniId, { programOnly = true, shareCentral = false } = {}) {
  const { error } = await supabase.from("consent").insert({
    alumni_id: alumniId,
    program_only_consent: programOnly,
    share_with_central_office: shareCentral,
  });
  if (error) throw error;
}

export async function submitPriorities(alumniId, payload) {
  const { error } = await supabase
    .from("priorities")
    .insert({ alumni_id: alumniId, ...payload });
  if (error) throw error;
}

export async function submitExpertise(alumniId, payload) {
  const { error } = await supabase
    .from("expertise")
    .insert({ alumni_id: alumniId, ...payload });
  if (error) throw error;
}

// Admin reads
export async function fetchTable(table, { limit = 500 } = {}) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
