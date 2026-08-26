import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Briefcase, Calendar, ExternalLink, FileText, Tag } from 'lucide-react'
import Input  from '@/components/ui/Input'
import Button from '@/components/ui/Button'

/**
 * Application statuses — order matters for the select display
 */
const STATUSES = [
  { value: 'applied',   label: 'Applied',   color: 'text-blue-600'  },
  { value: 'interview', label: 'Interview',  color: 'text-amber-600' },
  { value: 'offer',     label: 'Offer',      color: 'text-green-600' },
  { value: 'rejected',  label: 'Rejected',   color: 'text-rose-600'  },
]

/** Format Date object → 'YYYY-MM-DD' for the date input's default value */
function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/**
 * ApplicationForm — reused inside the Modal for both Create and Edit.
 *
 * @param {Object}   initialValues - pre-fill for edit mode (undefined for create)
 * @param {Function} onSubmit      - async (data) => void — called with validated form data
 * @param {Function} onCancel      - close/cancel action
 * @param {boolean}  isSubmitting  - disables submit button, shows loading
 */
export default function ApplicationForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialValues?.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      company:      initialValues?.company      ?? '',
      role:         initialValues?.role         ?? '',
      status:       initialValues?.status       ?? 'applied',
      applied_date: initialValues?.applied_date ?? todayISO(),
      job_link:     initialValues?.job_link     ?? '',
      notes:        initialValues?.notes        ?? '',
    },
    mode: 'onTouched',
  })

  // Reset form when switching between create/edit
  useEffect(() => {
    reset({
      company:      initialValues?.company      ?? '',
      role:         initialValues?.role         ?? '',
      status:       initialValues?.status       ?? 'applied',
      applied_date: initialValues?.applied_date ?? todayISO(),
      job_link:     initialValues?.job_link     ?? '',
      notes:        initialValues?.notes        ?? '',
    })
  }, [initialValues, reset])

  const handleFormSubmit = handleSubmit((values) => {
    // Strip empty optional fields so we don't send nullish strings
    const payload = {
      ...values,
      job_link: values.job_link?.trim() || null,
      notes:    values.notes?.trim()    || null,
    }
    onSubmit(payload)
  })

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <div className="flex flex-col gap-4">

        {/* Company */}
        <Input
          label="Company"
          id="app-company"
          placeholder="e.g. Stripe, Linear, Vercel"
          leftDecorator={<Briefcase size={14} />}
          error={errors.company?.message}
          required
          {...register('company', {
            required: 'Company name is required',
            maxLength: { value: 120, message: 'Max 120 characters' },
          })}
        />

        {/* Role */}
        <Input
          label="Role / Job Title"
          id="app-role"
          placeholder="e.g. Senior Frontend Engineer"
          leftDecorator={<Tag size={14} />}
          error={errors.role?.message}
          required
          {...register('role', {
            required: 'Role is required',
            maxLength: { value: 120, message: 'Max 120 characters' },
          })}
        />

        {/* Status + Applied Date — side by side on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status select */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="app-status"
              className="text-sm font-medium text-neutral-700 select-none"
            >
              Status <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <select
              id="app-status"
              className={[
                'h-9 w-full px-3.5 text-sm font-medium rounded-lg',
                'bg-white border border-neutral-200',
                'text-neutral-900 cursor-pointer',
                'transition-all duration-150',
                'outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
              ].join(' ')}
              {...register('status', { required: 'Status is required' })}
            >
              {STATUSES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-rose-600">{errors.status.message}</p>
            )}
          </div>

          {/* Applied date */}
          <Input
            label="Applied Date"
            id="app-applied-date"
            type="date"
            leftDecorator={<Calendar size={14} />}
            error={errors.applied_date?.message}
            required
            {...register('applied_date', {
              required: 'Applied date is required',
            })}
          />
        </div>

        {/* Job Link (optional) */}
        <Input
          label="Job Posting URL"
          id="app-job-link"
          type="url"
          placeholder="https://..."
          leftDecorator={<ExternalLink size={14} />}
          helperText="Optional — link to the job description"
          error={errors.job_link?.message}
          {...register('job_link', {
            validate: (v) => {
              if (!v || !v.trim()) return true // optional
              try { new URL(v); return true }
              catch { return 'Enter a valid URL (include https://)' }
            },
          })}
        />

        {/* Notes (optional textarea) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="app-notes"
            className="text-sm font-medium text-neutral-700 select-none"
          >
            Notes
            <span className="ml-1.5 text-xs font-normal text-neutral-400">optional</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-neutral-400 pointer-events-none">
              <FileText size={14} />
            </span>
            <textarea
              id="app-notes"
              rows={3}
              placeholder="Interview details, recruiter contacts, salary info…"
              className={[
                'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg',
                'bg-white border border-neutral-200',
                'text-neutral-900 placeholder:text-neutral-400',
                'resize-y min-h-[80px] max-h-[240px]',
                'transition-all duration-150 outline-none',
                'focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
              ].join(' ')}
              {...register('notes')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100 mt-1">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={isSubmitting || (!isDirty && isEdit)}
          >
            {isEdit ? 'Save changes' : 'Add application'}
          </Button>
        </div>
      </div>
    </form>
  )
}
