// js/auth.js
async function iniciarSesion(email, password) {
  const { data, error } = await window.db.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function cerrarSesion() {
  await window.db.auth.signOut();
  window.location.href = 'login.html';
}

async function verificarSesion() {
  const { data: { session } } = await window.db.auth.getSession();
  return session;
}
