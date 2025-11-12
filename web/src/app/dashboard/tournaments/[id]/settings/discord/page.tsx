'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Bot, Link, Unlink, RefreshCw, Shield, Users, AlertCircle } from 'lucide-react'

// Discord OAuth constants
const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!
const DISCORD_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/discord/callback`
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize`

interface ServerInfo {
  id: string
  name: string
  icon: string | null
  member_count: number
  roles: Array<{
    id: string
    name: string
    color: number
    position: number
    permissions: string
  }>
}
export default function DiscordSettingsPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [discordConfig, setDiscordConfig] = useState<any>(null)
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Load Discord configuration on mount
  useEffect(() => {
    loadDiscordConfig()
    loadAssignmentHistory()
  }, [tournamentId])

  const loadDiscordConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get organization ID from tournament
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('organizer_id')
        .eq('id', tournamentId)
        .single()
      if (!tournament) {
        console.error('Tournament not found')
        setLoading(false)
        return
      }

      // Load Discord config for this organization
      const { data: config } = await supabase
        .from('discord_configs')
        .select('*')
        .eq('organization_id', tournament.organizer_id)
        .single()

      if (config) {
        setDiscordConfig(config)
        setSelectedRoleId(config.role_id || '')
        // Load server info if connected
        if (config.guild_id) {
          await loadServerInfo(config.guild_id)
        }
      }
    } catch (error) {
      console.error('Error loading Discord config:', error)
      toast({
        title: 'Error',
        description: 'Failed to load Discord settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }  }

  const loadServerInfo = async (guildId: string) => {
    try {
      const response = await fetch(`/api/discord/server/${guildId}`)
      if (response.ok) {
        const data = await response.json()
        setServerInfo(data)
      }
    } catch (error) {
      console.error('Error loading server info:', error)
    }
  }

  const loadAssignmentHistory = async () => {
    setHistoryLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get organization ID
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('organizer_id')
        .eq('id', tournamentId)
        .single()

      if (!tournament) return

      // Load recent Discord messages/assignments      const { data: messages } = await supabase
        .from('discord_messages')
        .select('*')
        .eq('organization_id', tournament.organizer_id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (messages) {
        setAssignmentHistory(messages)
      }
    } catch (error) {
      console.error('Error loading assignment history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleConnectDiscord = () => {
    setConnecting(true)
    
    // Generate state parameter for security
    const state = btoa(JSON.stringify({
      tournamentId,
      timestamp: Date.now()
    }))
    
    // Discord OAuth URL with bot scope and permissions
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'bot applications.commands',      permissions: '268435456', // Manage Roles permission
      guild_id: serverInfo?.id || '', // Pre-select guild if already connected
      state: state
    })

    // Redirect to Discord OAuth
    window.location.href = `${DISCORD_OAUTH_URL}?${params.toString()}`
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/discord/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId })
      })

      if (response.ok) {
        setDiscordConfig(null)
        setServerInfo(null)
        setSelectedRoleId('')
        toast({
          title: 'Disconnected',
          description: 'Discord bot has been disconnected from your server'
        })
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast({        title: 'Error',
        description: 'Failed to disconnect Discord bot',
        variant: 'destructive'
      })
    }
  }

  const handleRoleChange = async (roleId: string) => {
    setSelectedRoleId(roleId)
    
    try {
      const response = await fetch('/api/discord/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          roleId
        })
      })

      if (response.ok) {
        toast({
          title: 'Role Updated',
          description: 'Auto-assignment role has been updated'
        })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update role selection',
        variant: 'destructive'      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Discord Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Discord bot integration for automatic role assignment
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Bot Connection
          </CardTitle>
          <CardDescription>
            Connect your Discord bot to automatically assign roles to approved streamers          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!discordConfig ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Connected</AlertTitle>
                <AlertDescription>
                  Connect your Discord bot to enable automatic role assignment for approved streamers
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleConnectDiscord} 
                disabled={connecting}
                className="w-full sm:w-auto"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Connect Discord Bot
                  </>
                )}
              </Button>
            </div>
          ) : (            <div className="space-y-4">
              {/* Server Info */}
              {serverInfo && (
                <div className="bg-secondary/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {serverInfo.icon && (
                        <img 
                          src={`https://cdn.discordapp.com/icons/${serverInfo.id}/${serverInfo.icon}.png`}
                          alt={serverInfo.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{serverInfo.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          <Users className="w-3 h-3 inline mr-1" />
                          {serverInfo.member_count} members
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      <Bot className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </div>
              )}
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-Assignment Role</label>
                <select 
                  value={selectedRoleId}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="">Select a role...</option>
                  {serverInfo?.roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  This role will be automatically assigned to approved streamers
                </p>
              </div>

              {/* Disconnect Button */}
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="w-full sm:w-auto"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect Bot
              </Button>            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Assignment History
          </CardTitle>
          <CardDescription>
            Recent role assignments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : assignmentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">User</th>
                    <th className="text-left py-2 px-3">Action</th>
                    <th className="text-left py-2 px-3">Status</th>                  </tr>
                </thead>
                <tbody>
                  {assignmentHistory.map((message) => (
                    <tr key={message.id} className="border-b">
                      <td className="py-2 px-3 text-sm">
                        {new Date(message.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        {message.discord_user_id}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        {message.action}
                      </td>
                      <td className="py-2 px-3">
                        <Badge 
                          variant={message.success ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {message.success ? 'Success' : 'Failed'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No assignment history yet
            </p>          )}
        </CardContent>
      </Card>
    </div>
  )
}