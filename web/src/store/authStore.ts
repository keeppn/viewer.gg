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
        
        // Get user profile from database
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          
          // If user doesn't exist in database, create a basic user record
          if (error.code === 'PGRST116') { // Row not found
            console.log('Creating new user record...');
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || null,
                role: 'viewer',
                organization_id: null
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating user:', createError);
            } else if (newUser) {
              console.log('User created successfully');
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
        }

        if (userData) {
          console.log('User data loaded:', userData);
          set({ 
            user: userData,
            organization: userData.organization,
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
