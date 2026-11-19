"use client";

import Image from "next/image";
import { FreeIcon, ProIcon, SuperIcon, LoginIcon } from "@/public/icons/svg";

export type PlanTier = "free" | "pro" | "super";

export interface ProfileModalProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  plan?: PlanTier;
  className?: string;
}

export default function ProfileModal({
  name,
  email,
  avatarUrl = null,
  plan = "free",
  className,
}: ProfileModalProps) {
  const rootClassName = className
    ? `profile-modal ${className}`
    : "profile-modal";

  return (
    <div className={rootClassName} role="dialog" aria-label="Profile">
      <div className="profile-modal__avatar">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={14}
            height={14}
            unoptimized
          />
        ) : (
          <LoginIcon />
        )}
      </div>

      <div className="profile-modal__details">
        <span className="profile-modal__name">{name}</span>
        <span className="profile-modal__email">{email}</span>
      </div>

      <div className="profile-modal__plan">
              <PlanBadge plan={plan}/>
      </div>
    </div>
  );
}

interface PlanBadgeProps {
  plan: PlanTier;
}

function PlanBadge({ plan }: PlanBadgeProps) {
  if (plan === "pro") return <ProIcon />;
  if (plan === "super") return <SuperIcon />;
  return <FreeIcon />;
}