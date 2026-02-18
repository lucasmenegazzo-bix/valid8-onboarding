interface Props {
  children: React.ReactNode;
}

export function ChatBubble({ children }: Props) {
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-2xl rounded-bl-sm px-5 py-3.5 text-sm text-gray-700 leading-relaxed max-w-lg">
      {children}
    </div>
  );
}
