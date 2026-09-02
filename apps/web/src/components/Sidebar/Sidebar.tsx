"use client"

import { useState } from 'react'
import {
  SidebarBase,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,

  Avatar,
  AvatarFallback,
  // AvatarImage,

  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,

  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components"

import {
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Settings,
} from 'lucide-react'

import { LAYOUT_OPTIONS } from "consts"
import Link from "next/link"
import { useSelectedLayoutSegment } from 'next/navigation'

export function Sidebar() {
  const { isMobile } = useSidebar()
  const segment = useSelectedLayoutSegment()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const handleMenuOpenChange = (menuId: string, open: boolean) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: open,
    }))
  }

  return (
    <SidebarBase collapsible="icon">
      <SidebarHeader>
        <div className="flex">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
            {/* <activeTeam.logo className="size-4" /> */}
          </div>
          {/* <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">OMS</span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div> */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {LAYOUT_OPTIONS.map((item, index) => (
          <SidebarGroup key={index}>
            {item.label && (
              <SidebarGroupLabel>
                {item.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {item.menus.map((menu) => {
                  const isParentActive = menu.id === segment || menu.items?.some((m) => m.id === segment);
                  // const isOpen = openMenus[menu.id] ?? isParentActive
                  const isOpen = openMenus[menu.id] === true

                  return (
                    <Collapsible
                      key={menu.id}
                      render={<SidebarMenuItem />}
                      className="group/collapsible"
                      open={isOpen}
                      onOpenChange={(open) => handleMenuOpenChange(menu.id, open)}
                    >
                      {menu.items?.length ? (
                        <>
                          <CollapsibleTrigger
                            render={
                              <SidebarMenuButton
                                tooltip={menu.title}
                                isActive={isParentActive}
                              />
                            }
                          >
                            {menu.icon && (
                              <menu.icon
                                strokeWidth={isParentActive ? 2.5 : 2}
                              />
                            )}

                            <span>{menu.title}</span>

                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            {menu.items.map((item) => {
                              const isActive = item.id === segment

                              return (
                                <SidebarMenuSub
                                  key={item.id}
                                  className={`relative ${isActive
                                    ? "border-l border-primary"
                                    : ""
                                    }`}
                                >
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                      render={
                                        <Link href={item.url} />
                                      }
                                      isActive={isActive}
                                      className={
                                        isActive
                                          ? "font-medium"
                                          : ""
                                      }
                                    >
                                      <item.icon
                                        strokeWidth={
                                          isActive ? 2.5 : 2
                                        }
                                      />

                                      <span>{item.title}</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                </SidebarMenuSub>
                              )
                            })}
                          </CollapsibleContent>
                        </>
                      ) : (
                        <SidebarMenuButton
                          render={
                            <Link href={menu.url || "/"} />
                          }
                          tooltip={menu.title}
                          isActive={isParentActive}
                        >
                          {menu.icon && (
                            <menu.icon
                              strokeWidth={
                                isParentActive ? 2.5 : 2
                              }
                            />
                          )}

                          <span>{menu.title}</span>
                        </SidebarMenuButton>
                      )}
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))
        }
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[open=true]:bg-sidebar-accent data-[open=true]:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    CN
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    test
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={isMobile ? 4 : 16}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>

                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          test
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuItem
                    render={<Link href="/setting" />}
                  >
                    <Settings />
                    Setting
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarBase>
  )
}