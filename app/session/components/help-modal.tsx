"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("session.help.title")}</DialogTitle>
          <DialogDescription>{t("session.help.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">¿Por qué Fibonacci?</h3>
            <p className="text-sm text-muted-foreground">{t("session.help.description")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Significado de los valores</h3>
            <div className="grid gap-2">
              <div className="p-2 border rounded-md">
                <span className="font-bold">1</span>: {t("session.help.values.1")}
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">2</span>: {t("session.help.values.2")}
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">3</span>: {t("session.help.values.3")}
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">5</span>: {t("session.help.values.5")}
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">8</span>: {t("session.help.values.8")}
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">13</span>: {t("session.help.values.13")}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Consejos para estimar</h3>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              {(t("session.help.tips") as unknown as string[]).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t("session.help.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
