import type { ReactNode } from "react";

import { FormBottomSheet } from "@/components/ui/FormBottomSheet";

type AppDialogFormProps = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitTestID?: string;
  cancelLabel: string;
  children: ReactNode;
  loading?: boolean;
};

/** @deprecated name kept for call sites — renders {@link FormBottomSheet}. */
export function AppDialogForm(props: AppDialogFormProps) {
  return <FormBottomSheet {...props} />;
}
