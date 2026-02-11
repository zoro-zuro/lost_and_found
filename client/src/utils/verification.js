// Verification utility functions
export const isUserVerified = (user) => {
  return user && user.emailVerified === true;
};

export const requireVerification = (user, callback) => {
  if (!isUserVerified(user)) {
    callback();
    return false;
  }
  return true;
};

export const getVerificationMessage = () => {
  return 'Please verify your email address to access this feature. Check your email for the verification link.';
};
