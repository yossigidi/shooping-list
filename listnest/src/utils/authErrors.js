// Firebase auth error messages
export function getErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'Email already in use',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak (min 6 characters)',
    'auth/user-disabled': 'User has been disabled',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/too-many-requests': 'Too many attempts, try again later',
    'auth/invalid-credential': 'Invalid credentials',
    'auth/missing-password': 'Please enter a password'
  };
  return messages[errorCode] || 'An error occurred, please try again';
}
