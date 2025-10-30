import { create } from 'zustand';
import { User, Organization } from '../types';
import { getCurrentUser, getCurrentSession, signOut as supabaseSignOut } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  session: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  
  setOrganization: (organization) => set({ organization }),

  initialize: async () => {
    try {
      set({ loading: true });
      
      const session = await getCurrentSession();
      
      if (session) {
        console.log('Session found:', session.user.id);
        
        // Get user profile from database (try without RLS first for debugging)
        console.log('Attempting to fetch user:', session.user.id);
        console.log('Session details:', {
          provider: session.user.app_metadata?.provider,
          email: session.user.email,
          user_metadata: session.user.user_metadata
        });
        
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Full error details:', JSON.stringify(error, null, 2));
          
          // Try to create user regardless of error code
          console.log('Attempting to create new user record...');
          
          // Determine user type from OAuth provider if possible
          const provider = session.user.app_metadata?.provider;
          let user_type = 'organizer'; // Default to organizer for fallback
          let streaming_platform = null;
          
          // Map OAuth providers to user types
          if (provider === 'twitch' || provider === 'youtube') {
            user_type = 'streamer';
            streaming_platform = provider === 'twitch' ? 'Twitch' : 'YouTube';
          }
          
          const newUserData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
            avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || null,
            role: user_type === 'organizer' ? 'admin' : 'viewer',
            user_type: user_type,
            oauth_provider: provider,
            streaming_platform: streaming_platform,
            organization_id: null
          };
          
          console.log('Creating user with data:', newUserData);
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert(newUserData)
            .select()
            .single();

          if (createError) {
            console.error('Error creating user:', createError);
            console.error('Create error code:', createError.code);
            console.error('Create error message:', createError.message);
            console.error('Full create error:', JSON.stringify(createError, null, 2));
            
            // Set session anyway so user isn't completely logged out
            set({ 
              user: null,
              organization: null,
              session,
              loading: false,
              initialized: true
            });
            return;
          }
          
          if (newUser) {
            console.log('User created successfully:', newUser);
            set({ 
              user: newUser,
              organization: null,
              session,
              loading: false,
              initialized: true
            });
            return;
          }
        }

        if (userData) {
          console.log('User data loaded:', userData);
          
          // Fetch organization separately if user has one
          let organizationData = null;
          if (userData.organization_id) {
            const { data: org } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', userData.organization_id)
              .single();
            organizationData = org;
          }
          
          set({ 
            user: userData,
            organization: organizationData,
            session,
            loading: false,
            initialized: true
          });
          return;
        }
      } else {
        console.log('No session found');
      }

      set({ 
        user: null, 
        organization: null, 
        session: null,
        loading: false,
        initialized: true
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        user: null, 
        organization: null,
        session: null, 
        loading: false,
        initialized: true
      });
    }
  },

  signOut: async () => {
    await supabaseSignOut();
    set({ user: null, organization: null, session: null });
  }
}));

// Listen to auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session) {
    await store.initialize();
  } else if (event === 'SIGNED_OUT') {
    store.setUser(null);
    store.setOrganization(null);
  }
});
