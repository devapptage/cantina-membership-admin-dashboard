"use client"

import { useState } from "react"
import { Save, Bell, Lock, Users, Shield, LogOut } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    enableNotifications: true,
    autoApproveMembership: false,
    enableTwoFactor: false,
    maxSessions: 3,
    dataRetention: 90,
  })

  const [successMessage, setSuccessMessage] = useState("")

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    setSuccessMessage("Settings updated successfully")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleNumberChange = (key: string, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    console.log("[v0] Settings saved:", settings)
    setSuccessMessage("All settings saved successfully")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage system and security settings</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg text-accent">{successMessage}</div>
      )}

      <div className="space-y-6">
        <div className="bg-card border border-border/30 rounded-xl p-8 space-y-6">
          <div className="border-b border-border/30 pb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">General Settings</h2>
            <p className="text-muted-foreground text-sm">Configure core system preferences</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 hover:bg-accent/5 rounded-lg transition-all">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Temporarily disable public access</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("maintenanceMode")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-accent/5 rounded-lg transition-all">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Enable Notifications</p>
                  <p className="text-xs text-muted-foreground">Send notifications to members</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("enableNotifications")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.enableNotifications ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.enableNotifications ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* <div className="flex items-center justify-between p-4 hover:bg-accent/5 rounded-lg transition-all">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Auto-Approve Memberships</p>
                  <p className="text-xs text-muted-foreground">Automatically approve new member requests</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("autoApproveMembership")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.autoApproveMembership ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.autoApproveMembership ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div> */}
          </div>
        </div>

        {/* <div className="bg-card border border-border/30 rounded-xl p-8 space-y-6">
          <div className="border-b border-border/30 pb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Security Settings</h2>
            <p className="text-muted-foreground text-sm">Manage security and access controls</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 hover:bg-accent/5 rounded-lg transition-all">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("enableTwoFactor")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.enableTwoFactor ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.enableTwoFactor ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 border border-border/30 rounded-lg hover:bg-accent/5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <label className="font-medium text-foreground">Max Sessions Per User</label>
                <span className="text-sm text-accent font-semibold">{settings.maxSessions}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.maxSessions}
                onChange={(e) => handleNumberChange("maxSessions", Number.parseInt(e.target.value))}
                className="w-full accent-accent"
              />
              <p className="text-xs text-muted-foreground mt-2">Limit concurrent sessions to prevent account sharing</p>
            </div>

            <div className="p-4 border border-border/30 rounded-lg hover:bg-accent/5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <label className="font-medium text-foreground">Data Retention (days)</label>
                <span className="text-sm text-accent font-semibold">{settings.dataRetention}</span>
              </div>
              <input
                type="range"
                min="30"
                max="365"
                value={settings.dataRetention}
                onChange={(e) => handleNumberChange("dataRetention", Number.parseInt(e.target.value))}
                className="w-full accent-accent"
              />
              <p className="text-xs text-muted-foreground mt-2">Automatically delete activity logs after this period</p>
            </div>
          </div>
        </div> */}

        {/* <div className="bg-card border border-border/30 rounded-xl p-8 space-y-6">
          <div className="border-b border-border/30 pb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">System Information</h2>
            <p className="text-muted-foreground text-sm">Current system status and metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Active Users", value: "1,234" },
              { label: "Total Members", value: "856" },
              { label: "System Uptime", value: "99.8%" },
              { label: "Last Backup", value: "Today 3:45 PM" },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold text-accent mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div> */}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all flex items-center gap-2 font-medium shadow-lg shadow-accent/30"
          >
            <Save className="w-4 h-4" />
            Save All Settings
          </button>
          {/* <button className="px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-all flex items-center gap-2 font-medium">
            <LogOut className="w-4 h-4" />
            Reset to Defaults
          </button> */}
        </div>
      </div>
    </div>
  )
}
