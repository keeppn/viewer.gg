import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization } from '../types';
import { getCurrentSession, signOut as supabaseSignOut } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  isInitializing: boolean;
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  organization: null,
  session: null,
  loading: true,
  initialized: false,
  isInitializing: false,

  setUser: (user) => set({ user }),
  
  setOrganization: (organization) => set({ organization }),

  initialize: async () => {
    // Prevent multiple simultaneous initializations
    const state = get();
    if (state.initialized || state.isInitializing) {
      console.log('AuthStore: Already initialized or initializing, skipping...');
      return;
    }

    try {
      set({ loading: true, isInitializing: true });

      // First, try to get the session from Supabase (this checks cookies/localStorage)
      let { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      // If no session found, retry after a short delay (handles cross-origin redirect timing)
      if (!currentSession && !sessionError) {
        console.log('AuthStore: No session on first try, retrying after delay...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        const retry = await supabase.auth.getSession();
        currentSession = retry.data.session;
        sessionError = retry.error;
      }

      if (sessionError) {
        console.error('AuthStore: Error getting session:', sessionError);
        set({ user: null, organization: null, session: null, loading: false, initialized: true, isInitializing: false });
        return;
      }

      const session = currentSession || await getCurrentSession();

      if (session) {
        console.log('AuthStore: Session found, user ID:', session.user.id);

        // Try to fetch existing user profile
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('AuthStore: Error fetching user profile:', fetchError);
          set({ user: null, organization: null, session, loading: false, initialized: true, isInitializing: false });
          return;
        }

        if (userData) {
          console.log('AuthStore: User profile found:', userData);
          let organizationData = null;

          // If user has organization_id, fetch it
          if (userData.organization_id) {
            const { data: org, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', userData.organization_id)
              .single();
            
            if (orgError) {
              console.error('AuthStore: Error fetching organization:', orgError);
            } else {
              organizationData = org;
            }
          } else {
            // User exists but has no organization - create one for them
            console.log('AuthStore: User has no organization, creating one...');

            const organizationName = userData.name || session.user.email?.split('@')[0] || 'New Organization';

            const { data: newOrg, error: orgError } = await supabase
              .from('organizations')
              .insert({
                name: `${organizationName}'s Organization`,
                logo_url: userData.avatar_url || null,
              })
              .select()
              .single();

            if (orgError) {
              console.error('AuthStore: Failed to create organization:', orgError);
            } else if (newOrg) {
              // Update user with new organization_id
              const { error: updateError } = await supabase
                .from('users')
                .update({ organization_id: newOrg.id })
                .eq('id', userData.id);

              if (updateError) {
                console.error('AuthStore: Failed to link organization to user:', updateError);
              } else {
                userData.organization_id = newOrg.id;
                organizationData = newOrg;
                console.log('AuthStore: Organization created and linked:', newOrg.id);
              }
            }
          }

          set({ user: userData, organization: organizationData, session, loading: false, initialized: true, isInitializing: false });
        } else {
          // User profile not found, create it
          console.log('AuthStore: No user profile found, creating one...');

          const provider = session.user.app_metadata?.provider;
          const user_type = 'organizer'; // All users are now organizers

          // Step 1: Create organization for the new organizer
          const organizationName = session.user.user_metadata?.full_name ||
                                  session.user.user_metadata?.name ||
                                  session.user.email?.split('@')[0] ||
                                  'New Organization';

          console.log('AuthStore: Creating organization:', organizationName);

          const { data: newOrganization, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: `${organizationName}'s Organization`,
              logo_url: session.user.user_metadata?.avatar_url || 
                       session.user.user_metadata?.picture || 
                       null,
            })
            .select()
            .single();

          if (orgError) {
            console.error('AuthStore: Error creating organization:', orgError);
            // Continue without organization - will retry on next login
          }

          // Step 2: Create user profile with organization link
          const newUserData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || 
                  session.user.user_metadata?.name || 
                  session.user.email?.split('@')[0] || 
                  'New User',
            avatar_url: session.user.user_metadata?.avatar_url || 
                       session.user.user_metadata?.picture || 
                       null,
            role: 'admin',  // Required field
            user_type: user_type,  // 'organizer' by default
            oauth_provider: provider || 'discord',
            organization_id: newOrganization?.id || null,
          };

          console.log('AuthStore: Creating user with data:', newUserData);

          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert(newUserData)
            .select()
            .single();

          if (createError) {
            console.error('AuthStore: Error creating user profile:', createError);
            
            // Check if it's a duplicate key error (user was already created)
            if (createError.code === '23505') {
              console.log('AuthStore: User already exists (race condition), fetching...');
              // Try fetching again
              const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (existingUser) {
                let orgData = null;
                if (existingUser.organization_id) {
                  const { data: org } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', existingUser.organization_id)
                    .single();
                  orgData = org;
                }
                set({
                  user: existingUser,
                  organization: orgData,
                  session,
                  loading: false,
                  initialized: true,
                  isInitializing: false
                });
                return;
              }
            }
            
            set({ user: null, organization: null, session, loading: false, initialized: true, isInitializing: false });
            return;
          }

          console.log('AuthStore: User profile created successfully:', newUser);
          set({
            user: newUser,
            organization: newOrganization || null,
            session,
            loading: false,
            initialized: true,
            isInitializing: false
          });
        }
      } else {
        console.log('AuthStore: No session found.');
        set({ user: null, organization: null, session: null, loading: false, initialized: true, isInitializing: false });
      }
    } catch (error) {
      console.error('AuthStore: Unexpected error during initialization:', error);
      set({ user: null, organization: null, session: null, loading: false, initialized: true, isInitializing: false });
    }
  },

  signOut: async () => {
    await supabaseSignOut();
    set({ user: null, organization: null, session: null, initialized: false, loading: false });
  }
}),
    {
      name: 'auth-store',
      // Only persist user, organization, and initialized state
      // Don't persist session (Supabase handles this), loading, or isInitializing
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        initialized: state.initialized,
      }),
    }
  )
);

// Listen to auth state changes
let authListener: any = null;

if (typeof window !== 'undefined') {
    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('AuthStore: Auth state changed:', event);
        const store = useAuthStore.getState();
        
        if (event === 'SIGNED_IN') {
            if (session) {
                await store.initialize();
            }
        } else if (event === 'SIGNED_OUT') {
            store.setUser(null);
            store.setOrganization(null);
        }
    });
}
