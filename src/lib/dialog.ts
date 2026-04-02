import Swal, { type SweetAlertIcon } from 'sweetalert2'

type ConfirmDialogOptions = {
  title: string
  text: string
  confirmButtonText?: string
  cancelButtonText?: string
  icon?: SweetAlertIcon
}

type AlertDialogOptions = {
  title: string
  text: string
  icon?: SweetAlertIcon
  confirmButtonText?: string
}

const sharedStyles = {
  background: '#18181b',
  color: '#f4f4f5',
  confirmButtonColor: '#2563eb',
  cancelButtonColor: '#3f3f46',
} as const

export const confirmDialog = async ({
  title,
  text,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  icon = 'warning',
}: ConfirmDialogOptions) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    ...sharedStyles,
  })

  return result.isConfirmed
}

export const showAlertDialog = async ({
  title,
  text,
  icon = 'info',
  confirmButtonText = 'Ok',
}: AlertDialogOptions) => {
  await Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    ...sharedStyles,
  })
}
