"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from "@/hooks/use-toast"

interface ServerStatus {
    taskStatus: 'RUNNING' | 'STOPPED' | 'PROVISIONING' | 'ERROR';
    serverIp: string;
    error?: string;
}

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://ag3x118ir8.execute-api.us-east-1.amazonaws.com/alpha'

export default function AdminPanel() {
    const [isServerOn, setIsServerOn] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
    const [pollingTimeout, setPollingTimeout] = useState<NodeJS.Timeout | null>(null)
    const { toast } = useToast()

    const cancelPolling = useCallback(() => {
        if (pollingTimeout) {
            clearTimeout(pollingTimeout)
            setPollingTimeout(null)
        }
    }, [pollingTimeout])

    const checkServerStatus = useCallback(async (statusPath: string) => {
        try {
            const fullUrl = `${API_ENDPOINT}${statusPath.startsWith('/') ? statusPath : `/${statusPath}`}`
            const response = await fetch(fullUrl)
            const responseText = await response.text()

            if (!response.ok) {
                setServerStatus(prev => ({
                    ...prev,
                    taskStatus: 'ERROR',
                    error: responseText,
                } as ServerStatus))

                toast({
                    title: "Error checking server status",
                    description: responseText,
                    variant: "destructive",
                })
                return
            }

            const data: Partial<ServerStatus> = JSON.parse(responseText)
            setServerStatus(prev => ({
                ...prev,
                ...data,
            } as ServerStatus))

            setIsServerOn(data.taskStatus !== 'STOPPED')

            if (data.taskStatus !== 'RUNNING' && data.taskStatus !== 'STOPPED') {
                const retryAfter = response.headers.get('Retry-After')
                if (retryAfter) {
                    const timeoutId = setTimeout(
                        () => {
                            void checkServerStatus(statusPath)
                        },
                        parseInt(retryAfter, 10) * 1000
                    )
                    setPollingTimeout(timeoutId)
                }
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            setServerStatus(prev => ({
                ...prev,
                taskStatus: 'ERROR',
                error: errorMessage,
            } as ServerStatus))

            toast({
                title: "Error checking server status",
                description: errorMessage,
                variant: "destructive",
            })
        }
    }, [toast])

    useEffect(() => {
        void checkServerStatus('/status')
        return () => cancelPolling()
    }, [checkServerStatus, cancelPolling])

    const toggleServer = async () => {
        setIsLoading(true)
        try {
            const endpoint = isServerOn ? '/stop' : '/start'
            const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
                method: 'POST',
            })
            const responseText = await response.text()

            if (!response.ok) {
                toast({
                    title: `Failed to ${isServerOn ? 'stop' : 'start'} server`,
                    description: responseText,
                    variant: "destructive",
                })
                return
            }

            const data: ServerStatus = JSON.parse(responseText)
            setServerStatus(data)
            setIsServerOn(data.taskStatus !== 'STOPPED')

            if (isServerOn) {
                cancelPolling()
            } else {
                const locationHeader = response.headers.get('Location')
                const retryAfter = response.headers.get('Retry-After')

                if (locationHeader && retryAfter) {
                    const timeoutId = setTimeout(
                        () => {
                            void checkServerStatus(locationHeader)
                        },
                        parseInt(retryAfter, 10) * 1000
                    )
                    setPollingTimeout(timeoutId)
                }
            }

            toast({
                title: `Server ${isServerOn ? 'stopping' : 'starting'}`,
                description: `The server is now ${isServerOn ? 'stopping' : 'starting'}. This may take a few minutes.`,
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            toast({
                title: `Failed to ${isServerOn ? 'stop' : 'start'} server`,
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RUNNING':
                return 'text-green-400'
            case 'ERROR':
                return 'text-red-500'
            default:
                return 'text-gray-400'
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto border border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-medium text-white">
                    Server Controls
                </CardTitle>
                <CardDescription className="text-neutral-400">
                    Manage your Minecraft server
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950">
                    <div className="flex items-center justify-between mb-6">
                        <Label htmlFor="server-toggle" className="text-lg text-neutral-200">
                            Server Status
                        </Label>
                        <Switch
                            id="server-toggle"
                            className="data-[state=checked]:bg-neutral-600"
                            checked={isServerOn}
                            onCheckedChange={toggleServer}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-center p-3 rounded-md bg-neutral-900 border border-neutral-800 h-12">
                        <span className={`text-lg font-medium ${getStatusColor(serverStatus?.taskStatus || 'STOPPED')}`}>
                            {serverStatus?.taskStatus || '\u00A0'}
                        </span>
                    </div>
                </div>
                <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950">
                    <div className="flex items-center justify-between mb-6">
                        <Label className="text-lg text-neutral-200">
                            Server Address
                        </Label>
                    </div>
                    <div className="flex items-center justify-center p-3 rounded-md bg-neutral-900 border border-neutral-800 h-12">
                        <code className="font-mono text-lg text-neutral-200">
                            {serverStatus?.serverIp || '\u00A0'}
                        </code>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}