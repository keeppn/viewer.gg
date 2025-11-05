// Run this in the browser console to completely clear all auth data
// This will help reset any stuck state

console.log('=== Clearing all authentication data ===');

// Clear all localStorage
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key) {
    keysToRemove.push(key);
    console.log('Found key:', key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('Removed:', key);
});

// Clear sessionStorage
sessionStorage.clear();
console.log('Cleared sessionStorage');

// Clear cookies related to Supabase
document.cookie.split(";").forEach((c) => {
  const cookie = c.trim();
  const eqPos = cookie.indexOf("=");
  const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
  if (name.includes('sb-') || name.includes('supabase')) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    console.log('Cleared cookie:', name);
  }
});

console.log('=== All auth data cleared ===');
console.log('Now reload the page: location.reload()');
