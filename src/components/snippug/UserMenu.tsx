import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { createCheckoutUrl } from "@/lib/polar";
import { cn } from "@/lib/utils";
import { useSound } from "@/components/snippug/sound";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function getInitials(name: string | undefined, email: string): string {
  if (name) {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function getDisplayName(user: { email: string; user_metadata: { full_name?: string; name?: string } }): string {
  return user.user_metadata.full_name || user.user_metadata.name || user.email.split("@")[0];
}

function getAvatarUrl(user: { user_metadata: { avatar_url?: string; picture?: string } }): string | undefined {
  return user.user_metadata.avatar_url || user.user_metadata.picture;
}

export function UserMenu({ onGlass }: { onGlass: boolean }) {
  const { user, loading, isPro, signOut } = useAuth();
  const { play } = useSound();

  if (loading) {
    return (
      <div
        className={cn(
          "h-9 w-9 animate-pulse rounded-full",
          onGlass ? "bg-white/20" : "bg-muted",
        )}
      />
    );
  }

  // Signed out → link to dedicated login page
  if (!user) {
    return (
      <Link
        to="/login"
        onClick={() => play("pop")}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-all",
          onGlass
            ? "border-white/40 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
            : "border-border bg-card text-foreground shadow-key hover:bg-secondary",
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  // Signed in → avatar dropdown
  const displayName = getDisplayName(user);
  const avatarUrl = getAvatarUrl(user);
  const initials = getInitials(
    user.user_metadata.full_name || user.user_metadata.name,
    user.email,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={() => play("click")}
          className={cn(
            "flex items-center gap-2 rounded-full p-0.5 transition-all outline-none",
            onGlass
              ? "hover:bg-white/15"
              : "hover:bg-secondary",
          )}
        >
          <Avatar
            className={cn(
              "h-8 w-8 border-2",
              isPro
                ? "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                : onGlass
                  ? "border-white/50"
                  : "border-border",
            )}
          >
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback
              className={cn(
                "text-xs font-bold",
                onGlass
                  ? "bg-white/20 text-white"
                  : "bg-tan text-cocoa",
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          {isPro && (
            <Badge
              className={cn(
                "hidden px-1.5 py-0 text-[10px] font-bold sm:inline-flex",
                "border-amber-400/60 bg-amber-50 text-amber-700",
              )}
            >
              PRO
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="tactile min-w-[200px] rounded-xl border-[1.5px] border-border p-1.5 shadow-pop"
      >
        {/* User info header */}
        <div className="px-2.5 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{displayName}</span>
            {isPro && (
              <Badge className="border-amber-400/60 bg-amber-50 px-1.5 py-0 text-[10px] font-bold text-amber-700">
                PRO
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/app"
            onClick={() => play("click")}
            className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-sm font-medium"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="m9 8 6 4-6 4Z" />
            </svg>
            My Studio / Clips
          </Link>
        </DropdownMenuItem>

        {!isPro && (
          <DropdownMenuItem
            onClick={() => {
              play("pop");
              const url = createCheckoutUrl(user.email);
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium text-amber-700"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M12 2 L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
            </svg>
            Upgrade to Pro · $4
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            play("click");
            void signOut();
          }}
          className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
