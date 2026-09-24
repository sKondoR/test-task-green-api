import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function createIcon(paths: ReactNode, { filled = false } = {}) {
  return function Icon({ size = 24, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        {paths}
      </svg>
    )
  }
}

export const SettingsIcon = createIcon(
  <path d="M13.9 2.5h-3.8l-.6 2.7a7.6 7.6 0 0 0-1.9 1.1L5 5.5 3.1 8.8l2 1.8a7.7 7.7 0 0 0 0 2.8l-2 1.8L5 18.5l2.6-.8c.6.5 1.2.8 1.9 1.1l.6 2.7h3.8l.6-2.7a7.6 7.6 0 0 0 1.9-1.1l2.6.8 1.9-3.3-2-1.8a7.7 7.7 0 0 0 0-2.8l2-1.8L19 5.5l-2.6.8a7.6 7.6 0 0 0-1.9-1.1l-.6-2.7ZM12 15.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Z" />,
  { filled: true },
)

export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" strokeWidth={2.2} />)

export const ArrowLeftIcon = createIcon(<path d="M19 12H5m6-6-6 6 6 6" strokeWidth={2} />)

export const ChevronDownIcon = createIcon(<path d="m6 9.5 6 6 6-6" strokeWidth={2} />)

export const SendIcon = createIcon(
  <path d="M4.4 4.2a.8.8 0 0 1 1-.1l14.7 7.2a.8.8 0 0 1 0 1.4L5.4 19.9a.8.8 0 0 1-1.1-.9L5.8 13l7.2-1-7.2-1-1.5-6a.8.8 0 0 1 .1-.8Z" />,
  { filled: true },
)

export const CheckIcon = createIcon(<path d="m4.5 12.5 4.5 4.5 10.5-10.5" strokeWidth={2} />)

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.5V12l3 2" />
  </>,
)

export const AlertIcon = createIcon(
  <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm0 5a1 1 0 0 1 1 1v4.2a1 1 0 1 1-2 0V8.5a1 1 0 0 1 1-1Zm0 8.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />,
  { filled: true },
)

export const EyeIcon = createIcon(
  <>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
)

export const EyeOffIcon = createIcon(
  <>
    <path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.4 3.2M6.6 6.6C4 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.7 0 3.2-.5 4.4-1.2" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </>,
)

export const LogoutIcon = createIcon(
  <path d="M14.5 4.5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3M10 16.5 5.5 12 10 7.5M5.5 12h10" />,
)

export const LeaveIcon = createIcon(
  <path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10M14.5 7.5 19 12l-4.5 4.5M19 12H9" />,
)

export const RetryIcon = createIcon(
  <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" strokeWidth={2} />,
)
