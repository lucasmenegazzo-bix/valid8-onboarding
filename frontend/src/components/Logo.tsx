export function Logo({ variant = 'dark', size = 'md' }: { variant?: 'dark' | 'light'; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-4xl' };
  const color = variant === 'dark' ? 'text-white' : 'text-navy-800';
  return (
    <span className={`font-bold tracking-tight ${sizes[size]} ${color}`}>
      val<span className="text-teal-500">id</span>8
    </span>
  );
}
