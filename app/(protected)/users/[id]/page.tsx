"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Edit, Mail, Phone, Calendar, CreditCard, User as UserIcon, Loader2, X } from "lucide-react"
import { usersService } from "@/lib/api/users"
import type { User } from "@/lib/types/users"

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.id as string

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("User ID is missing")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await usersService.getUserById(userId)

        if (response.success && response.data) {
          setUser(response.data)
        } else {
          setError(response.error || 'Failed to fetch user details')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-4" />
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">{error || 'User not found'}</p>
            <button
              onClick={() => router.push('/users')}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    )
  }

  const fullName = `${user.firstName} ${user.lastName}`
  const membership = user.membershipStatus === 'none' 
    ? 'No Membership' 
    : `${user.membershipStatus.toUpperCase()} MEMBER`

  const joinedDate = new Date(user.joinDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const membershipStartDate = user.membership?.startDate
    ? new Date(user.membership.startDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'N/A'

  const membershipEndDate = user.membership?.endDate
    ? new Date(user.membership.endDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'N/A'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/users')}
          className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Users</span>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center text-4xl text-accent-foreground font-bold flex-shrink-0">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-12 h-12" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.membership?.status === 'active' 
                  ? 'bg-accent/10 text-accent' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {user.membership?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              <span className="text-lg font-semibold text-accent">{membership}</span>
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone || 'N/A'}</p>
                </div>
              </div>

              {user.birthday && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Birthday</p>
                    <p className="font-medium">
                      {new Date(user.birthday).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{joinedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Membership Information</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Membership Status</p>
                <p className="font-medium text-lg">{membership}</p>
              </div>

              {user.membership && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Membership Tier</p>
                    <p className="font-medium">{user.membership.tier || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium">{membershipStartDate}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">{membershipEndDate}</p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Punch Card</p>
                <p className="font-medium">{user.punchCard.punches} punches</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">User ID</p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Status</p>
              <p className="font-medium">
                {user.membership?.status === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {/* <div className="mt-8 pt-8 border-t border-border flex gap-3">
          <button
            onClick={() => router.push(`/users?edit=${user.id}`)}
            className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit User
          </button>
        </div> */}
      </div>
    </div>
  )
}

