import { supabase } from '../config/supabase.js';

class AuthService {
  // Register with email, password, name, and phone
  static async register(email, password, name, phone) {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Create profile with email included
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email, // Store email in profile table too
        name,
        phone
      }])
      .select();

    if (profileError) {
      // Rollback user creation if profile fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return {
      ...authData,
      profile: profileData[0]
    };
  }

  // Login with email and password
  static async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Get profile data
    const profile = await this.getUserProfile(data.user.id);
    
    return {
      ...data,
      profile
    };
  }

  // Get user profile
  static async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Password reset request
  static async requestPasswordReset(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`,
    });

    if (error) throw error;
    return data;
  }

  // Complete password reset
  static async completePasswordReset(newPassword, accessToken) {
    // Verify token first
    const { error: verifyError } = await supabase.auth.getUser(accessToken);
    if (verifyError) throw verifyError;

    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    }, {
      accessToken
    });

    if (error) throw error;
    return data;
  }

  // Get current user (combines auth and profile data)
  static getCurrentUser = async (token) => {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw new Error('User not found');
    return data.user;
  };
  // Add to AuthService class

// Refresh session
static async refreshSession(refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });
  
    if (error) throw error;
    return data;
  }
  
  // Update profile
  static async updateProfile(userId, { name, phone }) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ name, phone })
      .eq('id', userId)
      .select()
      .single();
  
    if (error) throw error;
    return data;
  }
  
  // Update password
  static async updatePassword(userId, newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
  
    if (error) throw error;
    return data;
  }
  
  // Logout
  static async logout(token) {
    const { error } = await supabase.auth.signOut(token);
    if (error) throw error;
  }
}

export default AuthService;