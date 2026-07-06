export async function handleLogout(): Promise<void> {
  const fd = new FormData();
  fd.set("_mode", "logout");
  const res = await fetch("/api/masuk", { method: "POST", body: fd });
  const data = await res.json();
  if (data.redirect) window.location.href = data.redirect;
}
