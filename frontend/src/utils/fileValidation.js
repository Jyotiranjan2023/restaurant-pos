const MAX_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }

  // Type check (MIME)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Only ${ALLOWED_EXTENSIONS.join(', ')} files allowed`,
    }
  }

  // Size check
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2)
    return {
      valid: false,
      error: `File too large (${sizeMB}MB). Maximum 5MB allowed.`,
    }
  }

  return { valid: true, error: null }
}

export function getImageUrl(relativePath) {
  if (!relativePath) return null
  return `http://localhost:8080${relativePath}`
}