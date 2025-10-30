import { Client, GatewayIntentBits, TextChannel, Role } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

interface DiscordBotConfig {
  guild_id: string;
  default_role_id?: string;
  announcement_channel_id?: string;
}

// Listen for application status changes via Supabase Realtime
const setupRealtimeListeners = async () => {
  // Subscribe to application changes
  const applicationsChannel = supabase
    .channel('applications-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'applications',
        filter: 'status=in.(Approved,Rejected)'
      },
      async (payload) => {
        console.log('Application status changed:', payload);
        await handleApplicationStatusChange(payload.new);
      }
    )
    .subscribe();

  console.log('Realtime listeners set up successfully');
};

const handleApplicationStatusChange = async (application: any) => {
  try {
    // Get tournament and discord config
    const { data: tournament } = await supabase
      .from('tournaments')
      .select(`
        *,
        organization:organizations(
          discord_config:discord_configs(*)
        )
      `)
      .eq('id', application.tournament_id)
      .single();

    if (!tournament || !tournament.organization?.discord_config) {
      console.log('No Discord config found for tournament');
      return;
    }

    const discordConfig = tournament.organization.discord_config;
    const guild = await client.guilds.fetch(discordConfig.guild_id);
    
    if (!guild) {
      console.error('Guild not found:', discordConfig.guild_id);
      return;
    }

    // Find user by Discord username
    const discordUsername = application.streamer.discord_username;
    const members = await guild.members.fetch();
    const member = members.find(m => 
      m.user.tag === discordUsername || 
      m.user.username === discordUsername.split('#')[0]
    );

    if (!member) {
      console.error('Member not found:', discordUsername);
      await logDiscordMessage(application.id, 'unknown', application.status, false, 'Member not found');
      return;
    }

    // Handle based on status
    if (application.status === 'Approved') {
      // Assign role if configured
      if (tournament.discord_role_id) {
        try {
          const role = await guild.roles.fetch(tournament.discord_role_id);
          if (role) {
            await member.roles.add(role);
            console.log(`Assigned role ${role.name} to ${member.user.tag}`);
          }
        } catch (error) {
          console.error('Error assigning role:', error);
        }
      }

      // Send approval message
      const message = tournament.approval_message || 
        `Congratulations ${member}! Your application for **${tournament.title}** has been approved! 🎉`;
      
      await sendMessage(discordConfig, member, message);
      await logDiscordMessage(application.id, member.id, 'approval', true);

    } else if (application.status === 'Rejected') {
      // Send rejection message
      const message = tournament.rejection_message ||
        `Hello ${member}, thank you for applying to **${tournament.title}**. Unfortunately, your application was not approved at this time.`;
      
      await sendMessage(discordConfig, member, message);
      await logDiscordMessage(application.id, member.id, 'rejection', true);
    }
  } catch (error) {
    console.error('Error handling application status change:', error);
  }
};

const sendMessage = async (config: any, member: any, message: string) => {
  try {
    // Try to DM the user first
    await member.send(message);
    console.log(`Sent DM to ${member.user.tag}`);
  } catch (error) {
    // If DM fails, send to announcement channel
    if (config.announcement_channel_id) {
      const guild = member.guild;
      const channel = await guild.channels.fetch(config.announcement_channel_id) as TextChannel;
      if (channel) {
        await channel.send(message);
        console.log(`Sent message to announcement channel`);
      }
    }
  }
};

const logDiscordMessage = async (
  applicationId: string,
  discordUserId: string,
  messageType: 'approval' | 'rejection' | 'update',
  success: boolean,
  error?: string
) => {
  await supabase.from('discord_messages').insert({
    application_id: applicationId,
    discord_user_id: discordUserId,
    message_type: messageType,
    success,
    error,
  });
};

// Bot ready event
client.on('ready', async () => {
  console.log(`Discord bot logged in as ${client.user?.tag}`);
  await setupRealtimeListeners();
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

// Login
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('DISCORD_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Discord bot...');
  await client.destroy();
  process.exit(0);
});

export default client;
