'use client';

import * as React from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';

// Import Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Assuming Select is in ui components

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/registry/new-york-v4/ui/sidebar';

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  // Function to handle team selection
  const handleTeamChange = (teamName: string) => {
    const selectedTeam = teams.find((team) => team.name === teamName);
    if (selectedTeam) {
      setActiveTeam(selectedTeam);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Replace DropdownMenu with Select */}
        <Select onValueChange={handleTeamChange} value={activeTeam.name}>
          <SelectTrigger className="w-[180px]"> {/* Apply width class */}
            {/* Content inside the trigger - similar to the current button content */}
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <activeTeam.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              <span className="truncate text-xs">{activeTeam.plan}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SelectTrigger>
          <SelectContent>
            {/* Map teams to SelectItems */}
            {teams.map((team) => (
              <SelectItem key={team.name} value={team.name}>
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  {team.name}
                </div>
              </SelectItem>
            ))}
            {/* Add "Add team" item */}
             <SelectItem value="add-team">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                   <Plus className="size-4" />
                   Add team
                </div>
             </SelectItem>
          </SelectContent>
        </Select>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
