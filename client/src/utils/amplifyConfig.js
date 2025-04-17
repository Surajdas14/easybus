import { Amplify } from 'aws-amplify';
import awsExports from '../aws-exports';

// Initialize Amplify with your configuration
Amplify.configure(awsExports);

// Authentication utilities for Amplify
export const signIn = async (email, password) => {
  try {
    const user = await Amplify.Auth.signIn(email, password);
    return {
      success: true,
      user: user,
      token: user.signInUserSession.idToken.jwtToken
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      message: error.message || 'Failed to sign in'
    };
  }
};

export const signUp = async (name, email, password, phone) => {
  try {
    // Sign up the user in Cognito
    const { user } = await Amplify.Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name,
        phone_number: phone || ''
      }
    });
    
    return {
      success: true,
      user,
      message: 'Registration successful! Please check your email for verification.'
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      success: false,
      message: error.message || 'Failed to register'
    };
  }
};

export const confirmSignUp = async (email, code) => {
  try {
    await Amplify.Auth.confirmSignUp(email, code);
    return {
      success: true,
      message: 'Email verified successfully! You can now sign in.'
    };
  } catch (error) {
    console.error('Error confirming sign up:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify email'
    };
  }
};

export const signOut = async () => {
  try {
    await Amplify.Auth.signOut();
    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      message: error.message || 'Failed to sign out'
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await Amplify.Auth.currentAuthenticatedUser();
    const userAttributes = await Amplify.Auth.userAttributes(user);
    
    // Extract custom attributes
    const attributes = {};
    userAttributes.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });
    
    return {
      success: true,
      user: {
        id: attributes['custom:userId'] || user.username,
        name: attributes.name,
        email: attributes.email,
        role: attributes['custom:role'] || 'user',
        agency: attributes['custom:agency'] // For agents
      },
      token: user.signInUserSession.idToken.jwtToken
    };
  } catch (error) {
    console.error('No current user:', error);
    return {
      success: false,
      message: 'No authenticated user'
    };
  }
};

export const forgotPassword = async (email) => {
  try {
    await Amplify.Auth.forgotPassword(email);
    return {
      success: true,
      message: 'Password reset code sent to your email'
    };
  } catch (error) {
    console.error('Error in forgot password:', error);
    return {
      success: false,
      message: error.message || 'Failed to send password reset code'
    };
  }
};

export const forgotPasswordSubmit = async (email, code, newPassword) => {
  try {
    await Amplify.Auth.forgotPasswordSubmit(email, code, newPassword);
    return {
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.'
    };
  } catch (error) {
    console.error('Error in forgot password submit:', error);
    return {
      success: false,
      message: error.message || 'Failed to reset password'
    };
  }
};

export default {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  forgotPassword,
  forgotPasswordSubmit
};
