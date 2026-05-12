interface PasswordStrengthProps {
  password: string
}

function getStrength(pwd: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++

  if (score === 0) return { score: 0, label: '', color: '' }
  if (score === 1) return { score: 1, label: 'Weak', color: '#C0392B' }
  if (score === 2) return { score: 2, label: 'Fair', color: '#E67E22' }
  return { score: 3, label: 'Strong', color: '#2D5016' }
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (password.length === 0) return null

  const strength = getStrength(password)

  return (
    <div className="mt-1 flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[4px] flex-1 rounded-full transition-colors duration-300"
          style={{
            backgroundColor: i <= strength.score ? strength.color : '#E5E7EB',
          }}
        />
      ))}
      {strength.label ? (
        <span className="ml-1 min-w-[36px] text-[10px] font-bold" style={{ color: strength.color }}>
          {strength.label}
        </span>
      ) : null}
    </div>
  )
}
