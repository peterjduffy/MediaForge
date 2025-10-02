import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24'
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <Image
      src="/MediaForge.png"
      alt="MediaForge"
      width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
      height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
      className={`${sizeClasses[size]} ${className}`}
      priority
    />
  )
}