import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Briefcase,
  Calendar,
  Camera,
  Mail,
  Pencil,
  Shield,
  User,
} from 'lucide-react'
import { useAuth } from '@/context'
import { useApplications } from '@/hooks/useApplications'
import { InitialsAvatar } from '@/components/layout/Navbar'
import Navbar from '@/components/layout/Navbar'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

/** Read a File → base64 data-URL string */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ isOpen, onClose, user, avatar, onSave }) {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: { email: user?.email ?? '' },
    mode: 'onTouched',
  })
  const [previewAvatar, setPreviewAvatar] = useState(avatar)
  const [newAvatarFile, setNewAvatarFile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({ email: user?.email ?? '' })
      setPreviewAvatar(avatar)
      setNewAvatarFile(null)
    }
  }, [isOpen, user, avatar, reset])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB.')
      return
    }
    const b64 = await fileToBase64(file)
    setPreviewAvatar(b64)
    setNewAvatarFile(b64)
  }

  const handleRemoveAvatar = () => {
    setPreviewAvatar(null)
    setNewAvatarFile('')
  }

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true)
    try {
      await onSave({
        email:  values.email || null,
        avatar: newAvatarFile !== null ? newAvatarFile : undefined,
      })
      onClose()
    } catch (err) {
      toast.error(err?.message ?? 'Failed to save profile.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      description="Update your email address or profile picture."
      size="sm"
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-5">
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <InitialsAvatar
                username={user?.username}
                avatarSrc={previewAvatar}
                size="xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={[
                  'absolute inset-0 rounded-full flex items-center justify-center',
                  'bg-black/40 opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-150 cursor-pointer',
                ].join(' ')}
                aria-label="Change profile picture"
              >
                <Camera size={20} className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload profile picture"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Change photo
              </button>
              {previewAvatar && (
                <>
                  <span className="text-neutral-300">·</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-neutral-400 text-center max-w-[200px]">
              JPG, PNG or GIF · max 2 MB
              {/* TODO: Move avatar to backend storage (Django media / Cloudinary) */}
            </p>
          </div>

          {/* Username (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <User size={13} className="text-neutral-400" />
              Username
              <span className="text-xs text-neutral-400 font-normal ml-auto">(read-only)</span>
            </label>
            <div className="h-9 px-3.5 flex items-center rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-500 select-none">
              {user?.username ?? '—'}
            </div>
          </div>

          {/* Email */}
          <Input
            label="Email address"
            id="profile-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leftDecorator={<Mail size={14} />}
            error={errors.email?.message}
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              loading={isSaving}
              disabled={isSaving || (!isDirty && newAvatarFile === null)}
            >
              Save changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, icon: Icon, color }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${color}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/60">
        <Icon size={15} className="text-current opacity-80" />
      </div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-xs font-medium mt-0.5 opacity-70">{label}</p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, avatar, updateUser } = useAuth()
  const { applications, isLoading }  = useApplications()
  const navigate = useNavigate()
  const location = useLocation()

  // Open edit modal automatically if ?edit=true is in URL
  const [editOpen, setEditOpen] = useState(location.search.includes('edit=true'))

  const handleSave = async ({ email, avatar: newAvatar }) => {
    updateUser({
      email: email ?? undefined,
      ...(newAvatar !== undefined ? { avatar: newAvatar || null } : {}),
    })
    toast.success('Profile updated!')
  }

  const totalApps     = applications.length
  const offerCount    = applications.filter((a) => a.status === 'offer').length
  const interviewCount = applications.filter((a) => a.status === 'interview').length
  const responseRate  = totalApps
    ? Math.round((applications.filter((a) => ['interview','offer','rejected'].includes(a.status)).length / totalApps) * 100)
    : 0

  const recentApps = [...applications]
    .sort((a, b) => new Date(b.applied_date) - new Date(a.applied_date))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Profile header card ── */}
        <Card className="mb-6 overflow-hidden" padding="none">
          {/* Gradient banner */}
          <div className="h-24 bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-500" />

          <div className="px-6 pb-6">
            {/* Avatar — overlaps the banner */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="ring-4 ring-white rounded-full">
                <InitialsAvatar
                  username={user?.username}
                  avatarSrc={avatar}
                  size="xl"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Pencil size={13} />}
                onClick={() => setEditOpen(true)}
                className="mb-1"
              >
                Edit profile
              </Button>
            </div>

            {/* User info */}
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-neutral-900">
                {user?.username ?? '—'}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <Mail size={13} className="text-neutral-400" />
                {user?.email ?? (
                  <button
                    onClick={() => setEditOpen(true)}
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Add email address
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Activity stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatTile
            label="Applications"
            value={isLoading ? '—' : totalApps}
            icon={Briefcase}
            color="bg-blue-50 border-blue-100 text-blue-700"
          />
          <StatTile
            label="Interviews"
            value={isLoading ? '—' : interviewCount}
            icon={Calendar}
            color="bg-amber-50 border-amber-100 text-amber-700"
          />
          <StatTile
            label="Offers"
            value={isLoading ? '—' : offerCount}
            icon={Shield}
            color="bg-green-50 border-green-100 text-green-700"
          />
          <StatTile
            label="Response rate"
            value={isLoading ? '—' : `${responseRate}%`}
            icon={Mail}
            color="bg-primary-50 border-primary-100 text-primary-700"
          />
        </div>

        {/* ── Recent activity ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase size={14} className="text-primary-600" />
              Recent Applications
            </CardTitle>
            <button
              onClick={() => navigate('/applications')}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View all →
            </button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between py-2">
                    <div>
                      <div className="h-3 w-28 bg-neutral-200 rounded mb-1.5" />
                      <div className="h-2.5 w-20 bg-neutral-100 rounded" />
                    </div>
                    <div className="h-5 w-16 bg-neutral-200 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : recentApps.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase size={24} className="text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">No applications yet.</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/applications')}
                >
                  Add your first
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recentApps.map((app) => (
                  <li key={app.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{app.company}</p>
                      <p className="text-xs text-neutral-500 truncate">{app.role}</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs text-neutral-400 hidden sm:block">{formatDate(app.applied_date)}</span>
                      <StatusBadge status={app.status} size="sm" dot />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false)
          // Remove ?edit=true from URL without navigation
          if (location.search.includes('edit=true')) {
            navigate('/profile', { replace: true })
          }
        }}
        user={user}
        avatar={avatar}
        onSave={handleSave}
      />
    </div>
  )
}
