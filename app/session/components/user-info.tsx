"use client"

import { Eye, Users } from "lucide-react"
import type { Participant } from "../../actions"
import { useI18n } from "@/lib/i18n"

interface UserInfoProps {
  currentUser: Participant
}

export function UserInfo({ currentUser }: UserInfoProps) {
  const { t } = useI18n()

  return (
    <div>
      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
        {t("session.userInfo.connectedAs")} <span className="font-medium">{currentUser.name}</span>
        {currentUser.isObserver && (
          <span className="ml-1 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center">
            <Eye className="h-3 w-3 mr-1" /> {t("home.roles.observer")}
          </span>
        )}
        {currentUser.isOwner && (
          <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center">
            <Users className="h-3 w-3 mr-1" /> {t("home.roles.productOwner")}
          </span>
        )}
      </p>
    </div>
  )
}
