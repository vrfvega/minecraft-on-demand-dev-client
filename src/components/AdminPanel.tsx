"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface ServerStatus {
    taskStatus: string;
    desiredStatus: string;
    createdAt: string;
    cpuMemory: {
        cpu: string;
        memory: string;
    };
    launchType: string;
}

const API_ENDPOINT = 'https://5mqgw70bk9.execute-api.us-east-1.amazonaws.com/alpha'

export default function AdminPanel() {
    const [isServerOn, setIsServerOn] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
    const [pollingTimeoutId, setPollingTimeoutId] = useState<NodeJS.Timeout | null>(null)

    const cancelPolling = () => {
        if (pollingTimeoutId) {
            clearTimeout(pollingTimeoutId)
            setPollingTimeoutId(null)
        }
    }

    const checkServerStatus = async (statusPath: string) => {
        try {
            const fullUrl = `${API_ENDPOINT}${statusPath.startsWith('/') ? statusPath : `/${statusPath}`}`
            const response = await fetch(fullUrl)

            if (response.ok) {
                const data: ServerStatus = await response.json()
                setServerStatus(data)

                if (data.taskStatus !== 'RUNNING' && data.taskStatus !== 'STOPPED') {
                    const retryAfter = response.headers.get('Retry-After')
                    if (retryAfter) {
                        const timeoutId = setTimeout(
                            () => checkServerStatus(statusPath),
                            parseInt(retryAfter) * 1000
                        )
                        setPollingTimeoutId(timeoutId)
                    }
                }
            } else {
                console.error('Error checking status:', await response.text())
                setIsServerOn(false)
                cancelPolling()
            }
        } catch (error) {
            console.error('Error checking server status:', error)
            setIsServerOn(false)
            cancelPolling()
        }
    }

    const toggleServer = async () => {
        if (isServerOn) {
            setIsServerOn(false)
            setServerStatus(null)
            cancelPolling()
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`${API_ENDPOINT}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const data: ServerStatus = await response.json()
                setServerStatus(data)
                setIsServerOn(true)

                const locationHeader = response.headers.get('Location')
                const retryAfter = response.headers.get('Retry-After')

                if (locationHeader && retryAfter) {
                    const timeoutId = setTimeout(
                        () => checkServerStatus(locationHeader),
                        parseInt(retryAfter) * 1000
                    )
                    setPollingTimeoutId(timeoutId)
                } else {
                    console.error('Missing Location or Retry-After header')
                    setIsServerOn(false)
                }
            } else {
                console.error('Failed to start server:', await response.text())
                setIsServerOn(false)
            }
        } catch (error) {
            console.error('Error starting server:', error)
            setIsServerOn(false)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RUNNING':
                return 'text-green-400'
            case 'PROVISIONING':
                return 'text-yellow-400'
            default:
                return 'text-red-400'
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto border-border bg-card">
            <CardHeader>
                <CardTitle>Server Controls</CardTitle>
                <CardDescription>Manage your Minecraft server</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Label htmlFor="server-toggle" className="text-lg">
                        Server Status:{' '}
                        <span className={getStatusColor(serverStatus?.taskStatus || 'STOPPED')}>
                            {isLoading ? 'Starting...' : (serverStatus?.taskStatus || 'STOPPED')}
                        </span>
                    </Label>
                    <Switch
                        id="server-toggle"
                        checked={isServerOn}
                        onCheckedChange={toggleServer}
                        disabled={isLoading}
                    />
                </div>
                {isLoading && (
                    <div className="mt-4 flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting server...
                    </div>
                )}
                {serverStatus && (
                    <div className="mt-4 space-y-2 rounded-lg bg-muted p-4 text-sm">
                        <p className="flex justify-between">
                            <span className="text-muted-foreground">Task Status:</span>
                            <span className={getStatusColor(serverStatus.taskStatus)}>{serverStatus.taskStatus}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-muted-foreground">Desired Status:</span>
                            <span>{serverStatus.desiredStatus}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-muted-foreground">Created At:</span>
                            <span>{new Date(serverStatus.createdAt).toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-muted-foreground">Resources:</span>
                            <span>CPU: {serverStatus.cpuMemory.cpu} | RAM: {serverStatus.cpuMemory.memory}MB</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-muted-foreground">Launch Type:</span>
                            <span>{serverStatus.launchType}</span>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}