/**
 * Strings centralizados.
 *
 * Por ahora solo es un objeto en espanol. Cuando llegue i18n real (ej. i18next),
 * mover estos valores a archivos JSON por idioma sin tocar componentes.
 *
 * Convencion: `feature.context.key`.
 */
export const messages = {
  common: {
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    restore: "Restaurar",
    loading: "Cargando...",
    error: "Error",
    retry: "Reintentar",
    close: "Cerrar",
    confirm: "Confirmar",
    seeAll: "Ver todos",
  },
  errors: {
    unexpected: "Ocurrio un error inesperado",
    network: "No se pudo conectar con el servidor",
  },
  auth: {
    login: {
      title: "Bienvenido",
      subtitle: "Ingresa tus datos para continuar",
      submit: "Iniciar sesion",
      forgotLink: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes cuenta?",
      goRegister: "Registrate",
      genericError: "Error al iniciar sesion.",
    },
    register: {
      title: "Crear cuenta",
      subtitle: "Completa el formulario para registrarte",
      submit: "Crear cuenta",
      haveAccount: "¿Ya tienes cuenta?",
      goLogin: "Inicia sesion",
      genericError: "Error al crear la cuenta.",
    },
    verifyEmail: {
      title: "Verifica tu correo",
      subtitle: "Ingresa el codigo de 6 digitos que enviamos a",
      submit: "Verificar cuenta",
      resend: "Reenviar codigo",
      resending: "Reenviando...",
      noCode: "¿No recibiste el codigo?",
      verified: "¡Cuenta verificada!",
      goLogin: "Inicia sesion",
      genericError: "Error al verificar el codigo.",
      resendError: "Error al reenviar el codigo.",
    },
    forgot: {
      title: "¿Olvidaste tu contraseña?",
      subtitle:
        "Ingresa tu correo y te enviaremos un codigo para restablecer tu contraseña",
      submit: "Enviar codigo",
      remembered: "¿Recordaste tu contraseña?",
      goLogin: "Inicia sesion",
      genericError: "Error al enviar el codigo de recuperacion.",
    },
    reset: {
      verifyTitle: "Verifica el codigo",
      verifySubtitle: "Ingresa el codigo de 6 digitos que enviamos a",
      verifySubmit: "Verificar codigo",
      newTitle: "Nueva contraseña",
      newSubtitle: "Crea una contraseña segura",
      newSubmit: "Cambiar contraseña",
      successTitle: "¡Contraseña actualizada!",
      successCta: "Iniciar sesion",
      codeExpired: "El codigo expiro. Solicita uno nuevo.",
      genericError: "Error al cambiar la contraseña.",
    },
  },
} as const;
