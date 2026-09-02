import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

export function Header({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-(--color-border) bg-(--color-surface)/80 px-4 py-3 backdrop-blur lg:px-8">
      <div className="ml-12 flex-1 lg:ml-0">
        {title && <h1 className="text-sm font-semibold text-(--color-text)">{title}</h1>}
      </div>
      <div className="hidden sm:block">
        <CommandPalette />
      </div>
      <ThemeToggle />
    </header>
  );
}
