import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle, Save, Key, Loader2, Sparkles } from 'lucide-react';

export function Profile() {
  const { user, updateProfile, updatePassword } = useAuth();

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setProfileLoading(true);

    try {
      await updateProfile({ name, email });
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    // Frontend validations
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      await updatePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password. Please check your credentials.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (userName: string | null) => {
    if (!userName) return 'U';
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-green-600 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-green-400/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-3xl font-extrabold shadow-inner shrink-0">
            {getInitials(user?.name || '')}
          </div>
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-2">
              Account Profile
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
            </h1>
            <p className="text-green-100 text-sm md:text-base font-medium">
              Manage your personal information, email preferences, and account security.
            </p>
            <p className="text-[11px] text-green-200/80 pt-1">
              Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-card py-2 text-sm font-semibold transition-all">
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-card py-2 text-sm font-semibold transition-all">
            <Shield className="h-4 w-4 mr-2" />
            Security & Password
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="mt-6">
          <Card className="border-border/40 shadow-xl backdrop-blur-sm bg-card/95 overflow-hidden">
            <CardHeader className="border-b border-border/45 bg-muted/20">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your account's display name and primary email address.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="p-6 space-y-6">
                {profileSuccess && (
                  <Alert className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{profileSuccess}</AlertDescription>
                  </Alert>
                )}

                {profileError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name" className="text-sm font-semibold">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="profile-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 bg-background/50 hover:bg-background/80 focus:bg-background transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email" className="text-sm font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="profile-email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 bg-background/50 hover:bg-background/80 focus:bg-background transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-muted/10 border-t border-border/40 flex justify-end">
                <Button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center gap-2 px-6 py-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="mt-6">
          <Card className="border-border/40 shadow-xl backdrop-blur-sm bg-card/95 overflow-hidden">
            <CardHeader className="border-b border-border/45 bg-muted/20">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                Change Password
              </CardTitle>
              <CardDescription>
                Ensure your account is protected by using a strong, unique password.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="p-6 space-y-6">
                {passwordSuccess && (
                  <Alert className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{passwordSuccess}</AlertDescription>
                  </Alert>
                )}

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-semibold">Current Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-9 bg-background/50 hover:bg-background/80 focus:bg-background transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-semibold">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-9 bg-background/50 hover:bg-background/80 focus:bg-background transition-all"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Must be at least 8 characters, contain one uppercase, one lowercase letter, and one number.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-semibold">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9 bg-background/50 hover:bg-background/80 focus:bg-background transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-muted/10 border-t border-border/40 flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-2 px-6 py-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
