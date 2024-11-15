import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Triangle,
  SquareTerminal,
  Bot,
  Code2,
  Book,
  Settings2,
  LifeBuoy,
  SquareUser,
  BarChart,
  Home,
  ChartAreaIcon,
} from "lucide-react";
import { redirect } from "next/dist/server/api-utils";
import Link from "next/link";
import { User, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const gtSession = document.cookie
      .split("; ")
      .find((row) => row.startsWith("gt_session="));

    if (gtSession) {
      setUser(decodeURIComponent(gtSession.split("=")[1]));
    }
  }, []);

  return (
    <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
      <div className="border-b p-2">
        <Link href="/">
          <Button variant="outline" size="icon" aria-label="Home">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
      </div>
      <nav className="grid gap-1 p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                aria-label="Settings"
              >
                <ChartAreaIcon className="size-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Dashboard
          </TooltipContent>
        </Tooltip>

        {/* PI Dashboard Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/pi">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                aria-label="PI Dashboard"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            PI Dashboard
          </TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto grid gap-1 p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mt-auto rounded-lg"
              aria-label="Help"
            >
              <LifeBuoy className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Help
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/account">
              <Button
                variant="ghost"
                size="icon"
                className="mt-auto rounded-lg"
                aria-label="Account"
              >
                {user ? (
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {user.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <LogIn className="size-5" />
                )}
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            {user ? "Account" : "Sign In"}
          </TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
};

export default Sidebar;
